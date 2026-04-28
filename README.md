🌍 Aastha AI — From Scattered Signals to Measurable Impact

An AI-powered platform for real-time humanitarian coordination and evidence-based resource allocation.

Aastha AI transforms fragmented field data — from WhatsApp messages, voice notes, and reports — into structured, actionable intelligence. It enables NGOs and coordinators to prioritize needs, deploy volunteers efficiently, and measure real-world impact.

🚀 Problem

Field data in humanitarian contexts is:

Scattered across multiple channels (WhatsApp, voice, paper)
Unstructured and hard to interpret
Processed manually → causing delays and inefficiencies

👉 Result:
Urgent communities are missed, and resource allocation is often inefficient and biased.

💡 Solution

Aastha AI introduces a closed-loop intelligent system that:

Captures real-world field data
Understands it using AI (Gemini)
Allocates resources intelligently
Measures whether interventions actually worked
🔥 Key Features
🎙️ Multimodal Ingestion
Accepts input from voice, text, and documents
Uses Speech-to-Text + OCR to standardize inputs
🧠 Gemini Need Extraction
Converts unstructured input into structured JSON:
Need type
Urgency
Affected population
Required resources
Powered by Gemini 1.5 Flash (Vertex AI)
🗺️ Real-time Need Mapping
Visualizes needs on a geospatial map
Helps identify high-priority clusters instantly
🤝 Intelligent Volunteer Matching
Matches volunteers based on:
Skill set
Proximity
Urgency
Reduces manual coordination
📊 Predictive Risk Engine
Forecasts emerging need clusters
Enables proactive intervention
⚖️ Equity & Fairness Layer
🔹 Neglect Index
Identifies underserved communities
🔹 Bias Audit
Detects allocation imbalance (urban vs rural, etc.)
📈 Outcome Feedback Loop ⭐ (Core Differentiator)
Tracks before vs after intervention
Measures actual reduction in need
🧩 Impact Attribution Engine

Answers:

“What actions actually worked?”

Enables data-driven humanitarian strategies
🏗️ Architecture Overview
Frontend: Web App (PWA), Flutter (optional)
Backend: Firebase Cloud Functions
Database: Firestore + Realtime DB
AI Layer:
Gemini 1.5 Flash (Vertex AI)
Speech-to-Text
Vision API (OCR)
Analytics: BigQuery + Looker Studio
Infra: Firebase Hosting + Cloud Run
☁️ Google Technologies Used
Gemini 1.5 Flash (Vertex AI) — Need extraction & reasoning
Vertex AI — Matching & predictive modeling
Cloud Speech-to-Text — Voice transcription
Vision API (OCR) — Document processing
Cloud Translation API — Multilingual support
Firebase (Auth, Hosting, Firestore)
BigQuery — Impact analytics
Google Maps Platform — Visualization
🌱 SDG Alignment
SDG 1: No Poverty
SDG 3: Good Health & Well-being
SDG 10: Reduced Inequalities
SDG 17: Partnerships for the Goals
🏆 Why Aastha AI is Different

Most platforms:

Assign tasks ❌
Don’t measure outcomes ❌

👉 Aastha AI:

Tracks real-world impact
Learns what works
Enables evidence-based decision making
🎬 Demo

🔗 Demo Video: (Add your link)
🌐 Live App: (Add your deployed link)

⚙️ Setup Instructions
# Clone the repo
git clone https://github.com/your-username/aastha-ai.git

# Install dependencies
npm install

# Run locally
npm run dev
🔐 Environment Variables

Create a .env file:

GOOGLE_CLOUD_PROJECT=your-project-id
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-flash
FIREBASE_API_KEY=your-key
📌 Future Scope
District-level government integration
Multi-state NGO network
Federated learning across regions
Advanced predictive analytics
👩‍💻 Team

Sana Shaikh
Prathiksha Gajula
Jiya Haldankar
Neha Jamakala

❤️ Final Note

Aastha AI is not just about coordination —
it’s about understanding impact, improving decisions, and saving time where it matters most.

From scattered signals → to measurable impact.

⭐ If you like this project

Give it a star ⭐ on GitHub!
