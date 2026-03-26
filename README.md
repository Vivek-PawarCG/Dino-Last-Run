# Dino: Last Run – AI-Powered Survival Runner

**Dino: Last Run** is an advanced reimagining of the classic offline runner, transformed into a narrative-driven survival experience powered by **Google’s Gemini AI**. 

---

## 🎯 Chosen Vertical: AI-Powered Gaming & Narrative Experiences
We chose the **Gaming** vertical because we believe LLMs can do more than just generate text—they can function as real-time, procedural engine controllers that create infinitely unique, adaptive gameplay loops.

## 🧠 Approach and Logic

### The "AI Dungeon Master" Concept
Instead of a static game loop, we implemented a **Real-Time Level Design** architecture. We use **Gemini 2.5 Flash-Lite** as an invisible "Dungeon Master." 
- **Telemetry Loop:** Every few seconds, the game sends a "heartbeat" of player stats (Score, Speed, Biome, Performance) to the Gemini backend.
- **Physics Hooks:** Gemini returns biased JSON waves that manipulate the game's physical properties. For example, it can flag obstacles to **SINK** into the ground or trigger a global **EARTHQUAKE** camera shake to sabotage the player's timing.

### Edge Optimization
60fps is non-negotiable for an endless runner. We offloaded all heavy processing to the backend while keeping the frontend purely procedural.
- **Procedural Canvas:** Obstacles are drawn mathematically at 60fps, avoiding heavy sprite sheets or slow image generation.
- **SpeechSynthesis:** All dinosaur voice personality lines are rendered natively by the browser to save bandwidth and API cost.

## 🛠️ How the Solution Works

### 1. Technology Stack
- **Frontend:** React 18 + Vite (Tailwind CSS for UI).
- **Engine:** HTML5 Canvas 2D API for high-performance rendering.
- **Backend:** Node.js + Express (serving the app as a monolith).
- **Deployment:** Containerized with Docker and hosted on **Google Cloud Run**.
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`) using Gemini-2.5-flash-lite.

### 2. The Loop
- **Cloud Run API:** The serverless container manages secure API requests to Gemini.
- **AABB Collision:** A custom collision detector handles high-speed hitboxes with "near-miss" logic to trigger AI-voiced taunts.
- **Voice Control:** Integrated Web Speech API allows players to command "Jump" or "Duck" verbally.

## 📋 Assumptions Made
1. **Connectivity:** We assume the player is online for the AI features, but we built a robust **Procedural Fallback** that allows the game to play infinitely offline using local algorithms if Gemini is unreachable.
2. **Secure Context:** Browser Voice/Speech features require a secure context (HTTPS or Localhost) to function correctly.
3. **Environment:** We assume the deployment environment provides a `GEMINI_API_KEY` via environment variables.
4. **Game Scaling:** The game is hardcoded to a logical 800x300 internal resolution, then dynamically scaled to fit any device viewport (Responsive CSS).

---
*Developed for the Google Gemini AI Hackathon 2026.*
