import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const voiceScripts = {
  hi: [
    'रिकॉर्डिंग शुरू...',
    'वार्ड 7 में खाद्य संकट है, लगभग 45 परिवार प्रभावित हैं। बच्चों में कुपोषण के लक्षण दिख रहे हैं...',
    'वार्ड 7 में खाद्य संकट है, लगभग 45 परिवार प्रभावित हैं। बच्चों में कुपोषण के लक्षण दिख रहे हैं। तत्काल राशन और चिकित्सा सहायता की आवश्यकता है।'
  ],
  mr: [
    'रेकॉर्डिंग सुरू...',
    'वार्ड 12 मध्ये पाण्याची टंचाई आहे. 30 कुटुंबांना पिण्याचे स्वच्छ पाणी मिळत नाही...',
    'वार्ड 12 मध्ये पाण्याची टंचाई आहे. 30 कुटुंबांना पिण्याचे स्वच्छ पाणी मिळत नाही. तातडीने पाणी पुरवठा आवश्यक आहे.'
  ],
  kok: [
    'रेकॉर्डिंग सुरु जाता...',
    'वार्ड 3 म गरजोच्या माणसांक स्वच्छता सामग्री नाका...',
    'वार्ड 3 म गरजोच्या माणसांक स्वच्छता सामग्री नाका. 20 कुटुंब प्रभावित आसात. मदत पाठव.'
  ],
  en: [
    'Recording...',
    'Ward 5 has a medical emergency. 8 individuals showing fever symptoms...',
    'Ward 5 has a medical emergency. 8 individuals showing fever symptoms. Requesting medical volunteer urgently. ASHA Priya reporting.'
  ]
};

const extractedResults = {
  hi: { category: 'Food Shortage', location: 'Ward 7, Panjim', urgency: 'HIGH', families: 45, needs: 'Ration Kits, Nutrition Supplements', latent: '⚠ Possible malnutrition cluster detected based on age group and seasonal patterns.' },
  mr: { category: 'Water Access', location: 'Ward 12, Margao', urgency: 'HIGH', families: 30, needs: 'Clean Water Supply, Water Purifier', latent: '⚠ Historical pattern: this ward reported water shortage 3 times in 6 months.' },
  kok: { category: 'Sanitation', location: 'Ward 3', urgency: 'MEDIUM', families: 20, needs: 'Hygiene Kits, Sanitation Training', latent: '⚠ Latent disease risk detected based on sanitation deficit and monsoon season.' },
  en: { category: 'Medical Emergency', location: 'Ward 5', urgency: 'HIGH', families: 8, needs: 'First Aid Kit, Medical Volunteer', latent: '⚠ Cluster symptom pattern detected. 3 similar reports in adjacent wards.' }
};

const AIStage = ({ label, sublabel, isActive, isComplete, delay }) => (
  <div 
    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
      isComplete ? 'bg-primary-fixed' : isActive ? 'bg-primary-fixed/50' : 'bg-[#f5f3f0]'
    }`}
    style={{ opacity: isActive || isComplete ? 1 : 0.5, transform: isActive ? 'translateY(0)' : 'translateY(4px)' }}
  >
    <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-primary' : 'bg-outline'}`}></div>
    <div className="flex-1">
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-outline">{sublabel}</div>
    </div>
    <span className={`material-symbols-outlined text-base ${isComplete ? 'text-primary' : 'text-outline'}`}>
      {isComplete ? 'check_circle' : 'radio_button_unchecked'}
    </span>
  </div>
);

const EchoPortal = ({ showToast }) => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('hi');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('Tap the microphone above to begin recording your field report...');
  const [canProcess, setCanProcess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(t => {
          const newTime = t + 1;
          const scripts = voiceScripts[lang];
          if (newTime === 2) setTranscript(scripts[1]);
          if (newTime >= 5) {
            stopRecording();
            setTranscript(scripts[2]);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, lang]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setTranscript(voiceScripts[lang][0]);
    setCanProcess(false);
    setResult(null);
    setStage(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setCanProcess(true);
  };

  const clearRecording = () => {
    stopRecording();
    setTranscript('Tap the microphone above to begin recording your field report...');
    setRecordingTime(0);
    setCanProcess(false);
    setProcessing(false);
    setStage(0);
    setResult(null);
  };

  const processReport = () => {
    setProcessing(true);
    setCanProcess(false);
    setStage(1);
    
    [1, 2, 3, 4].forEach((s, i) => {
      setTimeout(() => setStage(s), (i + 1) * 700);
    });
    
    setTimeout(() => {
      setResult(extractedResults[lang]);
      setProcessing(false);
      showToast('Gemini AI extracted need signal successfully', 'auto_awesome');
    }, 3500);
  };

  const deploy = () => {
    showToast(`Volunteer Rahul Sawant deployed → ${result?.location}`, 'volunteer_activism');
    setTimeout(() => navigate('/compass'), 1200);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="p-7 flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Echo Portal</h1>
        <p className="text-outline text-sm mt-1">Voice-first field reporting for ASHA workers · WhatsApp-compatible · Zero onboarding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Voice Recording */}
        <div className="flex flex-col gap-5">
          {/* Voice Card */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-5 text-center border border-[#e4e2df] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none"></div>
            
            <div className="flex gap-2">
              {['hi', 'mr', 'kok', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    lang === l 
                      ? 'bg-primary text-white' 
                      : 'bg-transparent border border-primary-container text-primary hover:bg-[#f0edea]'
                  }`}
                >
                  {l === 'hi' ? '🇮🇳 Hindi' : l === 'mr' ? 'मराठी' : l === 'kok' ? 'Konkani' : 'English'}
                </button>
              ))}
            </div>

            <h2 className="font-serif text-2xl font-medium text-primary">Speak to Report</h2>
            <p className="text-sm text-outline max-w-sm">Tap the microphone and speak naturally in your language. Gemini AI extracts the need signal automatically.</p>

            {/* Waveform */}
            <div className={`flex items-end gap-1 h-12 px-2 ${!isRecording ? 'opacity-30' : ''}`}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full ${isRecording ? 'animate-[wave-bounce_1.2s_ease-in-out_infinite_alternate]' : ''}`}
                  style={{
                    height: isRecording ? undefined : '6px',
                    backgroundColor: i % 2 === 0 ? '#99460a' : '#2d4739',
                    animationDelay: `${[0, 0.15, 0.3, 0.1, 0.45, 0.25, 0.5, 0.05, 0.35, 0.2, 0.4, 0.55][i]}s`
                  }}
                ></div>
              ))}
            </div>

            {/* Record Button */}
            <button
              onClick={() => isRecording ? stopRecording() : startRecording()}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 ${
                isRecording 
                  ? 'bg-error animate-[record-pulse_1.5s_ease-in-out_infinite]' 
                  : 'bg-secondary shadow-lg shadow-secondary/30'
              }`}
            >
              <span className="material-symbols-outlined fill-icon text-white text-3xl">
                {isRecording ? 'stop' : 'mic'}
              </span>
            </button>

            <div className="text-xs font-bold uppercase tracking-wider text-outline">
              {isRecording ? `Recording... ${formatTime(recordingTime)}` : canProcess ? 'Recording complete — ready to process' : 'Tap to Record'}
            </div>
          </div>

          {/* Transcript Card */}
          <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-medium text-primary">Live Transcription</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#eae8e5] text-[#424844]">
                {lang === 'hi' ? 'Hindi → EN' : lang === 'mr' ? 'Marathi → EN' : lang === 'kok' ? 'Konkani → EN' : 'English'}
              </span>
            </div>
            <div className="bg-[#f5f3f0] rounded-xl p-4 min-h-20 text-sm text-[#424844] border border-[#e4e2df] italic mb-4">
              {transcript}
              {isRecording && <span className="animate-[blink_0.8s_step-end_infinite]">|</span>}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={processReport}
                disabled={!canProcess || processing}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined fill-icon text-sm">auto_awesome</span>
                Extract with Gemini AI
              </button>
              <button
                onClick={clearRecording}
                className="px-5 py-2.5 border border-primary-container text-primary rounded-lg text-sm font-semibold hover:bg-[#f0edea] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Processing + Result */}
        <div className="flex flex-col gap-4">
          {/* AI Pipeline */}
          <div className="bg-white rounded-xl p-5 border border-[#e4e2df]">
            <h3 className="font-serif text-base font-medium text-primary mb-3">AI Processing Pipeline</h3>
            <div className="flex flex-col gap-2">
              <AIStage label="Speech-to-Text" sublabel="Google Cloud STT · Multilingual" isActive={stage >= 1} isComplete={stage > 1} />
              <AIStage label="Translation Layer" sublabel="Cloud Translation API" isActive={stage >= 2} isComplete={stage > 2} />
              <AIStage label="Gemini 1.5 Flash" sublabel="Need Signal Extraction → JSON" isActive={stage >= 3} isComplete={stage > 3} />
              <AIStage label="Vertex AI Matching" sublabel="Skill × Proximity × Urgency" isActive={stage >= 4} isComplete={stage > 4} />
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div className="bg-white rounded-xl p-5 border border-[#e4e2df] animate-[fadeIn_0.4s_ease]">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined fill-icon text-primary">auto_awesome</span>
                <h3 className="font-serif text-base font-medium text-primary">Gemini Extracted Signal</h3>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-center p-2.5 bg-[#f5f3f0] rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">Category</span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    result.urgency === 'HIGH' ? 'bg-error-container text-error' : 
                    result.urgency === 'MEDIUM' ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'
                  }`}>{result.category}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#f5f3f0] rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">Location</span>
                  <span className="text-sm font-semibold">{result.location}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#f5f3f0] rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">Urgency</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    result.urgency === 'HIGH' ? 'bg-error-container text-error' : 
                    result.urgency === 'MEDIUM' ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'
                  }`}>{result.urgency}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#f5f3f0] rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">Affected</span>
                  <span className="text-sm font-semibold">{result.families} {result.families > 1 ? 'families' : 'individuals'}</span>
                </div>
                <div className="p-2.5 bg-[#f5f3f0] rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline block mb-1">Resources Needed</span>
                  <span className="text-sm font-semibold">{result.needs}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={deploy}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors"
                >
                  Deploy Volunteer
                </button>
                <button
                  onClick={() => navigate('/compass')}
                  className="px-5 py-2.5 border border-primary-container text-primary rounded-lg text-sm font-semibold hover:bg-[#f0edea] transition-colors"
                >
                  View on Map
                </button>
              </div>
            </div>
          )}

          {/* Latent Insight */}
          {result && (
            <div className="bg-secondary-fixed/30 rounded-xl p-5 border border-secondary-fixed animate-[fadeIn_0.4s_ease_0.3s_both]">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined fill-icon text-secondary">psychology</span>
                <span className="text-sm font-bold text-secondary">Latent Need Detected</span>
              </div>
              <p className="text-sm text-[#6e2f00] leading-relaxed">{result.latent}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-xl p-4 border border-[#e4e2df] text-center">
              <div className="font-serif text-2xl font-semibold text-primary">12,482</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-outline mt-1">Echo Transmissions</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#e4e2df] text-center">
              <div className="font-serif text-2xl font-semibold text-primary-container">96%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-outline mt-1">STT Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EchoPortal;
