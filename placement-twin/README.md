# 🎓 Placement Twin — Real-Time LiveAvatar AI Placement Platform (Phase 3)

**Placement Twin** is an autonomous full-stack placement preparation platform featuring a clean, professional **White + Light-Blue** commercial design, a real-time **LiveAvatar** AI interviewer, and the local **Qwen2.5-1.5B-Instruct** large language model as the intelligent interview brain.

---

## 🏗️ Phase 3 Architecture: Qwen Brain + LiveAvatar Face

```
Student (Webcam + Answer)
       ↓
React Frontend (Vite + Tailwind, Port 5173)
       ↓
Node.js Express Backend (Port 5000)
       ↓
Python FastAPI AI Service (Qwen2.5-1.5B-Instruct, Port 8000)
       ↓ (Generates Adaptive Interview Question)
Frontend LiveAvatar Web SDK (@heygen/liveavatar-web-sdk)
       ↓
LiveAvatar WebRTC Stream Speaks Question with Real-Time Lip-Sync
       ↓
Student Submits Answer (Text or Speech Dictation)
       ↓
Qwen Evaluates Technical, Communication, Problem Solving & Projects
       ↓
LiveAvatar Speaks Next Question Adaptively
```

| Layer | Technology | Port | Role in Phase 3 |
|---|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | `5173` | Google Meet-style clean white/blue UI, student webcam, WebRTC LiveAvatar video/audio player |
| **Backend** | Node.js + Express | `5000` | Secure LiveAvatar session token minting (`X-API-KEY`), interview session state, Qwen proxy |
| **AI Service** | Python 3.12 + FastAPI + PyTorch | `8000` | Local Hugging Face `Qwen/Qwen2.5-1.5B-Instruct` causal LM serving as the evaluation brain |
| **Avatar Face**| Official `@heygen/liveavatar-web-sdk` | WebRTC | Real-time interactive avatar video and speech synthesis (`session.repeat(question)`) |

---

## 🎨 Professional White + Light-Blue Design System

The platform has been redesigned from the ground up:
* **Color Palette**: Clean white background (`#ffffff`), pale blue secondary background (`#f0f7ff` / `#f8fafc`), deep navy text (`#0f172a`), and professional royal blue accents (`#2563eb` / `#1d4ed8`).
* **Clean Card Styling**: Soft shadows (`shadow-sm`), rounded corners (`rounded-2xl`), and crisp borders (`border-slate-200` / `border-blue-100`).
* **Removed**: All dark/neon sci-fi aesthetics, HUD radar elements, gaming scanlines, and robot placeholders.
* **Layout**: Google Meet-style side-by-side video tiles for the candidate and the LiveAvatar interviewer.

---

## 🔒 Security & API Key Protection

1. **Server-Side Only**: The `LIVEAVATAR_API_KEY` is located **exclusively** in `backend/.env` (`process.env.LIVEAVATAR_API_KEY`).
2. **Never Exposed**: The frontend never receives, stores, or logs the API key. The backend requests temporary session tokens from `https://api.liveavatar.com/v1/sessions/token` and passes only the JWT `session_token` to the client SDK.
3. **Ignored in Git**: `.gitignore` explicitly prevents `.env` and `backend/.env` from being committed.

---

## 🚀 Running the Full Stack Application

### 1. Python AI Service (Port 8000)
```powershell
cd "d:\PROJECT\placement training\placement-twin\ai-service"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Node.js Express Backend (Port 5000)
```powershell
cd "d:\PROJECT\placement training\placement-twin\backend"
npm start
```

### 3. React Frontend (Port 5173)
```powershell
cd "d:\PROJECT\placement training\placement-twin\frontend"
npm run dev
```

Open **http://localhost:5173** in Google Chrome or Microsoft Edge.

---

## 🧪 Testing the Phase 3 Workflow

1. Navigate to **AI Interview** in the navigation bar.
2. Click **Start Interview**.
3. Select your target role (e.g. *Software Engineer - Full Stack*), tech stack, and preferred avatar.
4. Click **Connect LiveAvatar & Start Interview**.
5. Observe:
   - Backend calls `POST https://api.liveavatar.com/v1/sessions/token` using the server-side API key.
   - Frontend connects via `@heygen/liveavatar-web-sdk` to the LiveKit WebRTC room.
   - Candidate camera mounts on the left; LiveAvatar mounts on the right.
   - Qwen generates the first interview question.
   - The question appears in the current question card.
   - LiveAvatar's video stream speaks the question with synchronized lip-sync.
   - Type or speak your answer and press **Submit Answer**.
   - Qwen evaluates your answer on 6 placement metrics, updates your scorecard, and generates the next follow-up.
   - LiveAvatar speaks the new question!
6. Click **End Interview & Get Scorecard** to view your overall readiness index, strengths, and areas for improvement.
