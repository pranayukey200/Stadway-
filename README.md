# StadWay 🏟️
### GenAI Stadium Companion for FIFA World Cup 2026

**StadWay** is a complete, working hackathon submission for **Challenge 4: Smart Stadiums & Tournament Operations** at the "PromptWars: Virtual" Hackathon.

Developed using React, TypeScript, Vite, Tailwind CSS, and Firebase, StadWay leverages the **Groq API** (`llama-3.3-70b-versatile` model) to power a multi-agent routing, translation, and wayfinding engine for sports fans, volunteers, and tournament organizers.

---

## 1. Why StadWay? (Our Approach & Core Differentiator)

Traditional tournament operations builds focus heavily on **organizer-facing heatmaps** and Digital Twin dashboards where AI serves merely as a labels layer over hardcoded rules. 

**StadWay flips the paradigm: we place the Fan persona as primary.** 
By building a mobile-first, highly accessible AI companion, we directly address the attendee journey: from arriving at the correct gate to navigating complex stadium levels, finding sensory rooms, finding local language support, and planning carbon-neutral departures.

### The Visible Reasoning Trail HUD 🧠
The biggest differentiator in StadWay is the **Visible Multi-Agent Reasoning Trail**. Instead of hiding AI decisions in a black-box system prompt, every recommendation StadWay generates shows the exact inputs ingested, the inference logic applied, and the confidence rating of the cooperating sub-agents:
1. **Wayfinding Agent**: Computes the optimal checkpoint path to section/seat.
2. **Crowd Agent**: Flags queue bottlenecks based on live sensor data.
3. **Accessibility Agent**: Re-routes step-free and flags simplified UI modes.
4. **Transit Agent**: Evaluates transit ETAs and plans leave-by time windows.
5. **Sustainability Agent**: Tracks carbon savings compared to taxi baselines.
6. **Language Agent**: Formulates localized copy for multilingual attendees.

All agents are coordinated by the **Orchestrator Agent**, which runs on Groq server-side to guarantee client safety, API key security, and response stability.

---

## 2. Technical Architecture & Data Model

```
┌─────────────────────────────────────────────────────────────┐
│                     Vite + React + TS App                   │
│   Fan Dashboard      Volunteer Portal      Organizer Console│
│         │                    │                     │        │
│         └────────────────────┼─────────────────────┘        │
│                              ▼                              │
│                      Zustand App Store                      │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │ Real-time Firestore Listeners
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Firestore                      │
│                                                             │
│   /venueState   /decisions   /volunteerTasks   /volunteers  │
└──────────────────────────────▲──────────────────────────────┘
                               │ Callable HTTPS Functions
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Firebase Cloud Functions                    │
│                                                             │
│    Orchestrator Agent   ───▶   Groq SDK                     │
│    (Checks local env for       (llama-3.3-70b-versatile)    │
│     GROQ_API_KEY)                                           │
└─────────────────────────────────────────────────────────────┘
```

### Firestore Collections Model:
* **`venueState/stadway_stadium`**: Stores live sensor data for all gates (occupancy, queue size), transit lines (ETA, delays), and atmosphere/weather conditions.
* **`decisions/{decisionId}`**: Logs each fan query, the final AI recommendation, the system confidence level, and the audit trail of the cooperating agents.
* **`volunteerTasks/{taskId}`**: A real-time dispatch queue tracking language assistance, first-aid, or mobility support requests.
* **`volunteers/{volunteerId}`**: Active responder profiles detailing languages spoken, current stadium zone, and availability status.

---

## 3. Privacy-by-Design & Security Differentiator 🔒

In compliance with modern stadium security ethics and fan civil liberties:
* **No Facial Recognition / Biometrics**: StadWay intentionally avoids movement tracking or camera identification of individual fans.
* **Aggregate Sensor Analysis Only**: Gates and density maps operate on anonymized counts (occupancy percentage and queue length), preserving user privacy.
* **No PII Beyond Local Profile**: Fan ticket details and names are stored locally in the browser or restricted to standard Firebase security rules.
* **Secure API Proxies**: All AI API tokens are stored securely in Cloud Functions environment variables (`GROQ_API_KEY`), never exposed to the client browser.

---

## 4. How the End-to-End System Works

1. **Sensor Simulator (Presenter Tools)**: Presenters append `?demo=true` to the URL or click **Sensor Simulator** to open the side panel. 
2. **Preset Scenarios**:
   * **Normal Flow**: Smooth gates, minor ETAs.
   * **Gate B Surge**: Gate B occupancy jumps to 92%. Crowd Agent triggers a warning, and Wayfinding Agent reroutes fans from Gate B to Gate A/C.
   * **Transit Delay**: Rain is introduced and Metro Red Line is delayed by 25 mins. Transit Agent detects the bottleneck and guides Zone B ticket holders to take Express Train A instead, while estimating CO₂ savings.
3. **Multi-Step Audit Feed**: The Organizer Console provides a real-time log of every decision StadWay makes and its agent trail, allowing operators to audit AI decisions instantly.

---

## 5. Local Setup & Demo Guide

### Prerequisites
* Node.js v20+ / NPM
* Firebase CLI installed globally (`npm install -g firebase-tools`)

### Installation & Seeding
1. Clone the repository and install root dependencies:
   ```bash
   npm install
   ```
2. Install Cloud Functions dependencies:
   ```bash
   npm --prefix functions install
   ```
3. Set your Groq API Key inside `functions/.env`:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key
   ```
   *(A valid key is pre-seeded in the workspace emulator for local runs).*

### Running Local Emulators & Client
1. Start the Firebase emulator suite (this hosts Firestore, Functions, and Hosting locally):
   ```bash
   firebase emulators:start
   ```
2. In a separate terminal, seed the database with stadium sensor states:
   ```bash
   npm run db:seed
   ```
3. Run the Vite client dev server:
   ```bash
   npm run dev
   ```
4. Open the browser at the shown local URL (usually `http://localhost:5173/?demo=true`) to demo the companion.

### Running Unit Tests
Validate the pure agent logic and semantic structures using Vitest:
```bash
npm run test
```

---

## 6. Assumptions & Implementation Notes

* **Maps Integration**: We implemented a high-performance, responsive SVG interactive stadium HUD instead of a paid Google Maps script. This ensures the application works immediately out-of-the-box for judges without requiring credit card configurations.
* **API Key Fallback**: If `GROQ_API_KEY` is not configured or fails, the Orchestrator automatically falls back to a high-fidelity local sensor processing module. This guarantees a stable, fully-responsive dashboard presentation during the live evaluation.
