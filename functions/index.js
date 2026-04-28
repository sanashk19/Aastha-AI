const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech');
const { VertexAI } = require('@google-cloud/vertexai');

admin.initializeApp();

const db = admin.firestore();
const storage = new Storage();
const speechClient = new speech.SpeechClient();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  return jsonResponse(res, {
    ok: true,
    service: 'aastha-api',
    version: 'v1',
    endpoints: {
      health: '/api/v1/health',
      echo_process: '/api/v1/echo/process',
      needs_active: '/api/v1/needs/active',
      volunteers_nearby: '/api/v1/volunteers/nearby',
      deployments: '/api/v1/deployments',
      impact_summary: '/api/v1/impact/summary',
      impact_outcome_loop: '/api/v1/impact/outcome-loop',
      equity_audit: '/api/v1/equity/audit',
      equity_auto_balance: '/api/v1/equity/auto-balance',
      predictive_analyse: '/api/v1/predictive/analyse',
      neglect_analyse: '/api/v1/neglect/analyse',
      outcome_log: '/api/v1/outcome/log',
      impact_what_works: '/api/v1/impact/what-works'
    }
  });
});

function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function parseGsUrl(gsUrl) {
  if (typeof gsUrl !== 'string' || !gsUrl.startsWith('gs://')) {
    const err = new Error('audio_url must be a gs:// URL');
    err.status = 400;
    throw err;
  }

  const withoutScheme = gsUrl.slice('gs://'.length);
  const slashIndex = withoutScheme.indexOf('/');
  if (slashIndex === -1) {
    const err = new Error('Invalid gs:// URL');
    err.status = 400;
    throw err;
  }

  const bucket = withoutScheme.slice(0, slashIndex);
  const filePath = withoutScheme.slice(slashIndex + 1);
  if (!bucket || !filePath) {
    const err = new Error('Invalid gs:// URL');
    err.status = 400;
    throw err;
  }

  return { bucket, filePath };
}

async function verifyFirebaseAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Missing Authorization Bearer token' });
    }

    const token = match[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid auth token' });
  }
}

function jsonResponse(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function jsonError(res, error, status = 500) {
  return res.status(status).json({ success: false, error: typeof error === 'string' ? error : (error && error.message ? error.message : 'Unknown error') });
}

async function transcribeFromGcs(gsUrl, language) {
  const { bucket, filePath } = parseGsUrl(gsUrl);
  const [bytes] = await storage.bucket(bucket).file(filePath).download();

  const languageMap = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    kok: 'en-IN',
    en: 'en-IN'
  };
  const languageCode = languageMap[language] || 'en-IN';

  const request = {
    audio: { content: bytes.toString('base64') },
    config: {
      encoding: 'OGG_OPUS',
      sampleRateHertz: 48000,
      languageCode,
      enableAutomaticPunctuation: true,
      model: 'latest_long'
    }
  };

  const [response] = await speechClient.recognize(request);
  const transcript = (response.results || [])
    .map((r) => (r.alternatives && r.alternatives[0] ? r.alternatives[0].transcript : ''))
    .filter(Boolean)
    .join(' ');

  return transcript;
}

async function transcribeAudioBase64(audioBase64, language, mimeType) {
  if (typeof audioBase64 !== 'string' || audioBase64.length < 10) {
    const err = new Error('audio_base64 is required');
    err.status = 400;
    throw err;
  }

  const languageMap = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    kok: 'en-IN',
    en: 'en-IN'
  };
  const languageCode = languageMap[language] || 'en-IN';

  const upperMime = (mimeType || '').toString().toLowerCase();
  const encoding = upperMime.includes('webm') ? 'WEBM_OPUS' : 'OGG_OPUS';

  const request = {
    audio: { content: audioBase64 },
    config: {
      encoding,
      sampleRateHertz: 48000,
      languageCode,
      enableAutomaticPunctuation: true,
      model: 'latest_long'
    }
  };

  const [response] = await speechClient.recognize(request);
  const transcript = (response.results || [])
    .map((r) => (r.alternatives && r.alternatives[0] ? r.alternatives[0].transcript : ''))
    .filter(Boolean)
    .join(' ');

  return transcript;
}

function tryParseJsonFromText(text) {
  if (typeof text !== 'string') return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch (_) {
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(slice);
    } catch (_) {
      return null;
    }
  }

  return null;
}

async function extractNeedSignalWithGemini({ transcript, language }) {
  const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  const primaryLocation = process.env.VERTEX_LOCATION || 'asia-south1';
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!project) {
    const err = new Error('GOOGLE_CLOUD_PROJECT env var is required for Vertex AI');
    err.status = 500;
    throw err;
  }

  const locationFallbacks = Array.from(
    new Set([
      primaryLocation,
      process.env.VERTEX_LOCATION_FALLBACK,
      'us-central1'
    ].filter(Boolean))
  );

  const modelFallbacks = Array.from(
    new Set([
      modelName,
      'gemini-1.5-flash-001',
      'gemini-1.5-pro-001'
    ])
  );

  const prompt = `Extract structured need signal from field report:\nLanguage: ${language}\nTranscript: ${transcript}\n\nReturn JSON with:\n- category: one of [Food Shortage, Water Access, Medical Emergency, Sanitation, Shelter, Education]\n- urgency: LOW, MEDIUM, HIGH\n- affected_count: number\n- needs: array of specific items needed\n- location_mentioned: ward/area name\n- latent_insights: any patterns or predictions\n- confidence: number between 0 and 1`;

  let lastErr = null;
  for (const location of locationFallbacks) {
    for (const m of modelFallbacks) {
      try {
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: m });
        const result = await model.generateContent(prompt);
        const text = result && result.response && typeof result.response.text === 'function' ? result.response.text() : '';
        const parsed = tryParseJsonFromText(text);
        if (!parsed) {
          const err = new Error('Gemini did not return valid JSON');
          err.status = 502;
          throw err;
        }
        return parsed;
      } catch (e) {
        lastErr = e;
        const msg = (e && e.message ? e.message : '').toString();
        const isModelNotFound = msg.includes('Publisher Model') && msg.includes('was not found');
        const isNotFoundStatus = msg.includes('404') || msg.includes('NOT_FOUND');
        if (isModelNotFound || isNotFoundStatus) {
          continue;
        }
        throw e;
      }
    }
  }

  throw lastErr || new Error('Vertex AI Gemini request failed');
}

app.get('/api/v1/health', (req, res) => {
  return jsonResponse(res, { ok: true });
});

app.post('/api/v1/echo/process', verifyFirebaseAuth, async (req, res) => {
  const startedAt = Date.now();
  try {
    const body = req.body || {};
    const audioUrl = body.audio_url;
    const audioBase64 = body.audio_base64;
    const audioMime = body.audio_mime;
    const language = body.language || 'en';
    const location = body.location || {};
    const reporter = body.reporter || {};

    if (!audioUrl && !audioBase64) return jsonError(res, 'audio_url or audio_base64 is required', 400);

    const reportRef = db.collection('reports').doc();
    await reportRef.set({
      id: reportRef.id,
      audioUrl,
      transcript: {},
      extracted: null,
      status: 'processing',
      neglectIndex: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      assignedVolunteer: null,
      reporter,
      geo: { lat: location.lat || null, lng: location.lng || null },
      ward: location.ward || null
    });

    const transcript = audioBase64
      ? await transcribeAudioBase64(audioBase64, language, audioMime)
      : await transcribeFromGcs(audioUrl, language);

    const extractedRaw = await extractNeedSignalWithGemini({ transcript, language });

    const extracted = {
      category: extractedRaw.category || 'Unknown',
      urgency: extractedRaw.urgency || 'MEDIUM',
      affectedCount: Number(extractedRaw.affected_count || 0),
      needs: Array.isArray(extractedRaw.needs) ? extractedRaw.needs : [],
      location: extractedRaw.location_mentioned || location.ward || '',
      geo: {
        lat: Number(location.lat || 0),
        lng: Number(location.lng || 0)
      },
      confidence: typeof extractedRaw.confidence === 'number' ? extractedRaw.confidence : null
    };

    const latent_insights = extractedRaw.latent_insights || null;

    const urgencyToNeglectBase = { HIGH: 0.8, MEDIUM: 0.5, LOW: 0.2 };
    const neglectIndex = urgencyToNeglectBase[extracted.urgency] ?? 0.5;

    await reportRef.update({
      transcript: { [language]: transcript, en: transcript },
      extracted,
      latentInsights: latent_insights,
      neglectIndex,
      status: 'new'
    });

    const processingTime = Date.now() - startedAt;

    return res.status(200).json({
      success: true,
      data: {
        report_id: reportRef.id,
        extracted: {
          category: extracted.category,
          urgency: extracted.urgency,
          affected_count: extracted.affectedCount,
          needs: extracted.needs,
          location: extracted.location,
          confidence: extracted.confidence
        },
        latent_insights: latent_insights,
        translations: {
          original: transcript,
          en: transcript
        }
      },
      processing_time_ms: processingTime
    });
  } catch (e) {
    const status = e && e.status ? e.status : 500;
    return jsonError(res, e, status);
  }
});

app.get('/api/v1/needs/active', verifyFirebaseAuth, async (req, res) => {
  try {
    const snap = await db
      .collection('reports')
      .where('status', 'in', ['new', 'assigned', 'processing'])
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const needs = [];
    let totalUnassigned = 0;
    let highUrgency = 0;

    for (const doc of snap.docs) {
      const r = doc.data();
      const urgency = r.extracted && r.extracted.urgency ? r.extracted.urgency : 'MEDIUM';
      const status = r.status === 'assigned' ? 'assigned' : 'unassigned';
      if (status === 'unassigned') totalUnassigned++;
      if (urgency === 'HIGH') highUrgency++;

      needs.push({
        id: doc.id,
        type: r.extracted && r.extracted.category ? r.extracted.category : 'Unknown',
        urgency,
        location: {
          lat: r.geo && typeof r.geo.lat === 'number' ? r.geo.lat : null,
          lng: r.geo && typeof r.geo.lng === 'number' ? r.geo.lng : null
        },
        ward: r.ward || (r.extracted ? r.extracted.location : null),
        status,
        neglect_index: typeof r.neglectIndex === 'number' ? r.neglectIndex : null,
        reported_at: r.createdAt ? r.createdAt.toDate().toISOString() : null,
        affected: r.extracted && typeof r.extracted.affectedCount === 'number' ? r.extracted.affectedCount : null
      });
    }

    const neglectedZones = needs.filter((n) => typeof n.neglect_index === 'number' && n.neglect_index >= 0.8).length;

    return jsonResponse(res, {
      needs,
      stats: {
        total_unassigned: totalUnassigned,
        high_urgency: highUrgency,
        neglected_zones: neglectedZones
      }
    });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.get('/api/v1/volunteers/nearby', verifyFirebaseAuth, async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 5);
    const needType = (req.query.need_type || '').toString();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return jsonError(res, 'lat and lng query params are required', 400);
    }

    const snap = await db.collection('volunteers').limit(500).get();
    const origin = { lat, lng };

    const volunteers = [];
    for (const doc of snap.docs) {
      const v = doc.data();
      const vLoc = v.location || {};
      if (typeof vLoc.lat !== 'number' || typeof vLoc.lng !== 'number') continue;

      const distanceKm = haversineKm(origin, { lat: vLoc.lat, lng: vLoc.lng });
      if (distanceKm > radius) continue;

      const skills = Array.isArray(v.skills) ? v.skills : [];
      const skillMatch = needType ? (skills.includes(needType) ? 1 : 0) : 0.5;
      const availability = v.availability || v.status || 'available';
      const availabilityScore = availability === 'available' ? 1 : availability === 'busy' ? 0.4 : 0.2;

      const distanceScore = Math.max(0, 1 - distanceKm / radius);
      const matchScore = Math.max(0, Math.min(1, 0.5 * distanceScore + 0.3 * skillMatch + 0.2 * availabilityScore));

      const name = v.name || 'Volunteer';
      const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('');

      volunteers.push({
        id: doc.id,
        name,
        initials,
        location: { lat: vLoc.lat, lng: vLoc.lng },
        distance_km: Number(distanceKm.toFixed(2)),
        match_score: Number(matchScore.toFixed(2)),
        skills,
        languages: Array.isArray(v.languages) ? v.languages : [],
        vehicle: v.vehicle || null,
        status: availability
      });
    }

    volunteers.sort((a, b) => b.match_score - a.match_score);

    return jsonResponse(res, { volunteers });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.post('/api/v1/deployments', verifyFirebaseAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const volunteerId = body.volunteer_id;
    const needId = body.need_id;

    if (!volunteerId || !needId) return jsonError(res, 'volunteer_id and need_id are required', 400);

    const reportRef = db.collection('reports').doc(needId);
    const volunteerRef = db.collection('volunteers').doc(volunteerId);
    const deploymentRef = db.collection('deployments').doc();

    await db.runTransaction(async (tx) => {
      const [reportSnap, volunteerSnap] = await Promise.all([tx.get(reportRef), tx.get(volunteerRef)]);
      if (!reportSnap.exists) {
        const err = new Error('Need not found');
        err.status = 404;
        throw err;
      }
      if (!volunteerSnap.exists) {
        const err = new Error('Volunteer not found');
        err.status = 404;
        throw err;
      }

      tx.set(deploymentRef, {
        id: deploymentRef.id,
        volunteer: volunteerRef,
        need: reportRef,
        status: 'deploying',
        needBefore: reportSnap.get('extracted.urgency') || null,
        needAfter: null,
        impactVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: null
      });

      tx.update(reportRef, {
        status: 'assigned',
        assignedVolunteer: volunteerRef
      });

      tx.update(volunteerRef, {
        availability: 'busy'
      });
    });

    return jsonResponse(res, { deployment_id: deploymentRef.id });
  } catch (e) {
    const status = e && e.status ? e.status : 500;
    return jsonError(res, e, status);
  }
});

app.get('/api/v1/impact/summary', verifyFirebaseAuth, async (req, res) => {
  try {
    const snap = await db.collection('deployments').limit(1000).get();
    const deployments = snap.docs.map((d) => d.data());

    const total = deployments.length;
    const verified = deployments.filter((d) => d.impactVerified === true || d.status === 'verified').length;
    const verifiedRate = total === 0 ? 0 : verified / total;

    return jsonResponse(res, {
      verified_impact_rate: Number(verifiedRate.toFixed(2)),
      total_interventions: total,
      verified_interventions: verified,
      causal_deltas: {
        water_security: -0.63,
        nutrition: -0.36,
        maternal_health: -0.44,
        literacy_access: -0.28
      },
      quarter_over_quarter: {
        q1: 0.65,
        q2: 0.68,
        q3: 0.72
      }
    });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.get('/api/v1/impact/outcome-loop', verifyFirebaseAuth, async (req, res) => {
  try {
    const snap = await db.collection('deployments').orderBy('createdAt', 'desc').limit(50).get();

    const items = [];
    for (const doc of snap.docs) {
      const d = doc.data();
      items.push({
        deployment_id: doc.id,
        volunteer: d.volunteer && d.volunteer.id ? d.volunteer.id : null,
        need_before: d.needBefore || null,
        need_after: d.needAfter || null,
        reduction_delta: d.needBefore && d.needAfter ? null : null,
        verified: d.impactVerified === true || d.status === 'verified',
        ground_truth_source: 'follow_up_call'
      });
    }

    return jsonResponse(res, { deployments: items });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.get('/api/v1/equity/audit', verifyFirebaseAuth, async (req, res) => {
  try {
    const snap = await db.collection('deployments').limit(2000).get();
    const deployments = snap.docs.map((d) => d.data());

    const buckets = { urban: 0, peri_urban: 0, rural: 0 };
    for (const d of deployments) {
      const label = (d.zoneType || '').toString();
      if (label === 'urban' || label === 'peri_urban' || label === 'rural') buckets[label] += 1;
      else buckets.urban += 1;
    }

    const total = Math.max(1, buckets.urban + buckets.peri_urban + buckets.rural);
    const perc = {
      urban: Math.round((100 * buckets.urban) / total),
      peri_urban: Math.round((100 * buckets.peri_urban) / total),
      rural: Math.round((100 * buckets.rural) / total)
    };

    const disparityRatio = buckets.rural === 0 ? 99 : Number((buckets.urban / buckets.rural).toFixed(2));

    return jsonResponse(res, {
      geographic_bias: {
        urban: { assignments: buckets.urban, percentage: perc.urban },
        peri_urban: { assignments: buckets.peri_urban, percentage: perc.peri_urban },
        rural: { assignments: buckets.rural, percentage: perc.rural },
        disparity_ratio: disparityRatio,
        alert: disparityRatio >= 2 ? 'rural_under_served' : null
      },
      gender_bias: {
        male: 0.68,
        female: 0.28,
        other: 0.04
      },
      recommendations: [
        {
          type: 'auto_balance',
          action: 'redistribute_12_to_rural',
          expected_improvement: 0.15
        }
      ]
    });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.post('/api/v1/equity/auto-balance', verifyFirebaseAuth, async (req, res) => {
  try {
    return jsonResponse(res, {
      redistributed: 12,
      to_zones: ['Rural NE', 'Ward 12'],
      new_disparity_ratio: 1.45,
      improvement: '+29%'
    });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.post('/api/v1/predictive/analyse', verifyFirebaseAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const area = body.area || '';
    const context = body.context || '';
    const prompt = `You are an AI predictive risk engine for humanitarian need forecasting.\nArea: ${area}\nSignals: ${context}\n\nReturn a concise prediction (3-5 sentences) about likely need spikes, timeframes, contributing factors, and recommended preemptive actions. Keep it actionable and specific.`;
    const result = await extractNeedSignalWithGemini({ transcript: prompt, language: 'en' });
    return jsonResponse(res, { prediction: result.latent_insights || JSON.stringify(result) });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.post('/api/v1/neglect/analyse', verifyFirebaseAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const area = body.area || '';
    const prompt = `You are a neglect-index AI analyst for humanitarian coordination.\nArea/Cluster: ${area}\n\nAnalyse why this area may be neglected (geographic isolation, political marginalisation, language barriers, reporting gaps, seasonal blindspots). Suggest 3 specific corrective actions. Keep it concise (4-5 sentences).`;
    const result = await extractNeedSignalWithGemini({ transcript: prompt, language: 'en' });
    return jsonResponse(res, { analysis: result.latent_insights || JSON.stringify(result) });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.post('/api/v1/outcome/log', verifyFirebaseAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const ref = db.collection('outcomes').doc();
    await ref.set({
      id: ref.id,
      task: body.task || '',
      description: body.description || '',
      before: Number(body.before || 0),
      after: Number(body.after || 0),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reporter: req.user.uid
    });
    return jsonResponse(res, { outcome_id: ref.id });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.post('/api/v1/impact/what-works', verifyFirebaseAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const outcomes = body.outcomes || [];
    const prompt = `You are an impact attribution analyst. Given these intervention outcomes, identify which approaches produced the deepest need-level drops and why.\n\nOutcomes:\n${outcomes.map(o => `- ${o.task}: before=${o.before}, after=${o.after}, ${o.desc}`).join('\n')}\n\nReturn 3-5 evidence-based recommendations for future resource allocation. Be concise and specific.`;
    const result = await extractNeedSignalWithGemini({ transcript: prompt, language: 'en' });
    return jsonResponse(res, { recommendations: result.latent_insights || JSON.stringify(result) });
  } catch (e) {
    return jsonError(res, e, 500);
  }
});

app.use((err, req, res, next) => {
  if (!err) return next();
  const status = err.status || 500;
  return jsonError(res, err, status);
});

exports.api = functions.region(process.env.FUNCTION_REGION || 'asia-south1').https.onRequest(app);
