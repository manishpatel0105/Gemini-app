# 🛡️ SAARTHI AI — Universal Human Intent-to-System Action Engine
> *"From human confusion to verified action."*

[![Gemini 2.5 Flash](https://img.shields.io/badge/Model-Gemini%202.5%20Flash-blue.svg)](https://deepmind.google/technologies/gemini/)
[![Zero NPM Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Runtime%20NPM-emerald.svg)](https://nodejs.org)
[![Repository Size](https://img.shields.io/badge/Repo%20Size-%3C%20200%20KB%20(Limit%2010MB)-cyan.svg)](scripts/repo-size.js)
[![Test Suite](https://img.shields.io/badge/Tests-22%20Passing-brightgreen.svg)](tests/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**SAARTHI AI** is an emergency operations and critical civic triage engine designed for high-stress, life-critical scenarios. In emergencies, real humans do not communicate in neat form fields or standard English: they send panicked voice notes, fragmented Hinglish/Hindi text, and scene photos while stuck in highway bottlenecks or flooded intersections.

SAARTHI AI bridges the gap between chaotic human distress signals and structured, evidence-grounded system action directives.

Powered by **Google Gemini 2.5 Flash**, SAARTHI AI:
1. **Decodes True Underlying Intent** beneath raw panic and fragmented language.
2. **Triages Urgency** (`Immediate`, `High`, `Moderate`, `Low`, `Unclear`) with deterministic life-safety override safeguards.
3. **Grounds Claims Against Real Evidence** via Google Search Grounding metadata, strictly downgrading unverified or contradicted assertions.
4. **Drafts Standardized System Dispatch Payloads** (e.g. `EMS_DISPATCH_UNIT`, `HOSPITAL_ER_PREALERT`, `TRAFFIC_GRID_REROUTE`, `POWER_GRID_ISOLATE`) formatted for immediate human operator approval.
5. **Provides Immediate Physical Guidance** for on-scene bystanders before emergency responders arrive.

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[Human Distress Signal: Hinglish/Hindi/English/Voice/Photo] --> B[Human Input Hub (Web Speech + 4MB Multimodal Image)]
    B --> C[Node.js Standard HTTP Server (Zero Runtime NPM)]
    
    C --> D{Live Gemini Key Present?}
    D -- No / Demo Mode --> E[Deterministic Fixtures (demoData.js)]
    D -- Yes / Live Mode --> F[Gemini 2.5 Flash REST Client]
    
    F --> G[Pass 1: Google Search Grounding Retrieval]
    G --> H[Pass 2: Structured JSON Synthesis (responseSchema)]
    
    H --> I[Validation & Safeguards (services/validate.js)]
    E --> I
    
    I --> J[Deterministic Emergency Overrides (Cardiac / Fire / Flood / Wire)]
    I --> K[Grounding Citation Correlation & Verification Downgrades]
    I --> L[Draft Status Enforcement: sent=false & humanApproval=true]
    
    L --> M[Tactical EOC Interface (3 Columns)]
    M --> N[Column 1: Distress Stream & Presets]
    M --> O[Column 2: Intent Bridge & Evidence]
    M --> P[Column 3: Action Matrix & Dispatch Simulator]
```

---

## ⚡ Technical Non-Negotiables & Highlights

| Requirement | Implementation in SAARTHI AI |
| :--- | :--- |
| **Runtime Dependencies** | **Zero runtime npm dependencies**. Powered entirely by Node.js built-ins (`http`, `fs`, `path`, `crypto`, native `fetch`). |
| **Repository Size** | **178.85 KB** total working tree size (Strict limit: < 10 MB). Uses `scripts/repo-size.js` for automated audit. |
| **Model** | **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via official Google REST API (`x-goog-api-key`). |
| **Multimodal** | Audio speech recognition via browser Web Speech API (`en-IN`, `hi-IN`); scene photos up to 4 MB (PNG, JPEG, WEBP) with binary magic byte validation. |
| **API Key Privacy** | `GEMINI_API_KEY` is exclusively read on the server. Never leaked to client code, Git, or API responses. |
| **Judge Demo Mode** | Full offline exploration mode with deterministic high-fidelity fixtures in `public/demoData.js`. Persistent warning banner displayed. |
| **Safety Overrides** | Hardcoded deterministic emergency rules: Cardiac, electrocution, choking, or flood peril forces `Immediate` urgency and inserts 112 emergency advice. |
| **XSS Safety** | Model and user outputs rendered safely via `textContent` and safe DOM construction. No raw `innerHTML` execution. |

---

## 🖥️ 3-Column Emergency Operations Center (EOC) UI

The web interface is built around an **Emergency Operations Center** design language (Slate-950 canvas, deep navy command cards, status-specific neon tokens):

### Column 1 — Human Input Hub
- **Distress Stream Textarea**: Supports multi-lingual mixed input (Hindi, English, Hinglish) with live character counter (0–4000).
- **Web Speech API**: Real-time microphone capture with audio waveform pulse, language toggle (`en-IN` / `hi-IN`), and browser error handling.
- **Multimodal Drop Zone**: Drag-and-drop file upload for PNG, JPEG, WEBP up to 4 MB with thumbnail preview and replace/remove controls.
- **One-Click Verified Demo Presets**:
  1. **Medical Crisis (Hinglish)**: 68yo father, acute crushing chest pain, sweating, diabetes, Telma 40, stranded in NH48 toll traffic.
  2. **Community Safety (Disaster)**: Minto Bridge 5ft flash flood, submerged school bus with 18 children, snapped high-tension wire hanging overhead.
  3. **Health & Prescription Navigator**: 74yo on Warfarin prescribed Ciprofloxacin, experiencing facial hives, swelling, and dizziness.
- **Turn This Into a Plan**: Tactical analysis trigger.
- **New Case**: Instant workspace reset.

### Column 2 — Gemini Intent Bridge
- **Triage Badges**: Urgency tag (`IMMEDIATE`, `HIGH`, `MODERATE`, `LOW`, `UNCLEAR`) and Domain indicator (`MEDICAL`, `DISASTER`, `CIVIC`, `TRAFFIC`, `OTHER`).
- **Model Confidence Meter**: Percentage model confidence with disclaimer label (*"Estimated by Gemini 2.5 Flash"*).
- **Intent Contrast Box**: Direct juxtaposition of *"What the Person Said"* vs *"Decoded Underlying Intent"*.
- **Extracted Entities**: Primary Issue, Symptoms, Medical History & Current Meds, Detected Risks, and Location Clues.
- **Facts, Unknowns & Conflicts**: Triaged lists highlighting critical missing information.
- **Grounding Verification List**: Authentic external evidence citations with live links, source titles, retrieval timestamps, and status badges (`Verified`, `Partially verified`, `Unverified`, `Contradicted`, `Verification unavailable`).

### Column 3 — Structured Action Workspace
- **Immediate Physical Guidance**: 3 prioritized on-scene physical actions for bystanders before first responders arrive.
- **Target System Action Directives**:
  - Target system (`EMS_DISPATCH_GATEWAY`, `POWER_GRID_ISOLATE`, `TRAFFIC_GRID_REROUTE`, etc.)
  - Action code (e.g. `EMS_DISPATCH_UNIT`)
  - Priority badge (`Critical`, `High`, `Normal`)
  - Recommended timing (`< 2 mins`)
  - Operational rationale & mandatory human approval requirement.
  - Visible Draft watermark: `[DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM]`.
- **Dispatch Simulation Console**: Interactive animated terminal log simulating the dispatch handshake, queue assignment, and validation checks.
- **Syntax-Highlighted JSON Inspector**: Collapsible viewer for the standardized dispatch payload.
- **Briefing & JSON Export**: One-click clipboard copy for plain-text operations briefings and JSON telemetry.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org) **v18.0.0 or higher** (tested on Node v25.4.0).
- Google Gemini API Key (optional — full Demo Mode runs without any key).

### 1. Installation
Clone the repository and inspect the workspace:
```bash
git clone https://github.com/your-username/saarthi-ai.git
cd saarthi-ai
```
*(No `npm install` needed — zero runtime dependencies!)*

### 2. Environment Configuration (Optional for Live Mode)
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` to include your Gemini API key:
```env
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
PORT=3000
HOST=0.0.0.0
```
> **Note:** If no key is provided, SAARTHI AI will automatically run in **Demo Mode**, providing full offline access to all presets, simulation terminals, and schema inspectors.

### 3. Start the Server
```bash
npm start
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Automated Test Suite

SAARTHI AI includes a comprehensive test suite using Node.js built-in `node:test` and `node:assert`:

```bash
npm test
```

### Test Coverage Highlights:
- **`tests/syntax-and-size.test.js`**: Syntax validity of all JS files + strict repo size audit (< 10 MB).
- **`tests/validate.test.js`**: Request boundary validation, image magic bytes (PNG, JPEG, WebP), schema normalization, claim downgrading, and deterministic emergency overrides.
- **`tests/presets.test.js`**: Strict validation of all 3 demo presets against the full output schema.
- **`tests/server.test.js`**: Server lifecycle, `GET /api/health`, static serving, security headers (CSP, nosniff), path traversal rejection, oversized payload handling (413), and malformed JSON (400).
- **`tests/gemini-mock.test.js`**: Gemini REST client error classification (401 invalid key, 429 quota, 503 upstream, timeouts) and structured grounding candidate handling.
- **`tests/xss-safety.test.js`**: Malicious payload neutralization (`<script>`, `onerror`, `javascript:`) and safe DOM rendering verification.

---

## 📊 Repository Size Audit

To execute the size audit script:
```bash
npm run size
```

### Audit Output:
```
======================================================
   SAARTHI AI — Repository Size Audit
======================================================
Directory:   .../saarthi-ai
Max Limit:   10.00 MB (10 MB)

Total Working-Tree Size: 178.85 KB (183,146 bytes)
Usage: 1.75% of 10 MB limit
✅ PASSED: Repository size (178.85 KB) is well within the 10 MB limit.
======================================================
```

---

## 📡 API Reference

### 1. Health & Status
```http
GET /api/health
```
#### Response:
```json
{
  "status": "ok",
  "application": "SAARTHI AI",
  "version": "1.0.0",
  "model": "gemini-2.5-flash",
  "mode": "live",
  "hasApiKey": true,
  "timestamp": "2026-10-23T04:20:00.000Z",
  "features": {
    "multimodal": true,
    "speechRecognition": true,
    "searchGrounding": true,
    "deterministicSafeguards": true
  }
}
```

### 2. Incident Analysis & Action Plan Generation
```http
POST /api/analyze
Content-Type: application/json
```
#### Request Body:
```json
{
  "text": "Arrey suno jaldi, pitaji ko chest me bohot tez dard ho raha hai near Khed Shivapur toll...",
  "language": "hi-IN",
  "mode": "live",
  "image": {
    "mimeType": "image/jpeg",
    "data": "<base64_encoded_image>"
  }
}
```
#### Response:
Returns the validated JSON action plan adhering to the standard schema:
- `title`, `intent`, `urgency`, `confidenceScore`, `domain`, `summary`
- `facts`, `unknowns`, `conflicts`
- `extractedEntities`: `primaryIssue`, `symptoms`, `history`, `risks`, `locationContext`
- `verification`: Array of claims with grounding citations and verified statuses
- `actions`: Array of system action directives requiring human approval
- `humanGuidance`: Immediate on-scene safety steps
- `draftPayloads`: Standardized system dispatch telemetry
- `safety_note` & `follow_up_question`

---

## 🔒 Security, Privacy & Safety Governance

1. **No External Dispatches**:
   Every generated payload is strictly stamped with:
   `DRAFT PAYLOAD — NOT SENT TO ANY REAL SYSTEM`
   Simulation logs explicitly state:
   `SIMULATION ONLY — NO REAL DISPATCH OR EXTERNAL ACTION OCCURRED`
2. **Zero PHI / Sensitive Data Logging**:
   User input strings and distress logs are processed in memory and never persisted to databases or written to server disk logs.
3. **Deterministic Emergency Override**:
   AI models can occasionally underestimate acute peril. If high-risk keywords (e.g., sudden chest pain, breathing collapse, trapped minors, electrocution) are detected, server safeguards forcefully elevate urgency to `Immediate`, prepend **112 National Emergency Helpline** advice, and alert operators.
4. **No Medical Prescription or Clinical Diagnosis**:
   SAARTHI AI explicitly refrains from diagnosing diseases, altering drug dosages, or certifying clinical outcomes.
5. **No Hallucinated Verification**:
   If an external claim lacks verifiable citations from real grounding sources, it is strictly flagged as `Verification unavailable` or `Unverified`.

---

## ⚖️ Legal & Hackathon Disclaimer
*SAARTHI AI is a societal-good hackathon prototype and triage decision-support tool. It does not replace emergency medical services, police dispatch, fire and rescue agencies, or licensed healthcare practitioners. In life-threatening emergencies in India, dial **112** immediately.*

---

## 📄 License
This project is open-source under the [Apache 2.0 License](LICENSE).
