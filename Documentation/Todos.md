# Vari Smart Operations Platform — Project Todos

> **Solo build plan, from scratch.** Based on the Client Brief (Track 2: Crowd, Mobility & Resource Management).
> Pipeline: `Video/Data → YOLO detection → Density → Risk → Prediction → Recommendation → Live Dashboard`
> Motto: **SENSE → PREDICT → OPTIMIZE → ACT**

**Legend:** `[ ]` todo · `[x]` done · **[MUST]** required for MVP · **[BASIC]** basic version only · **[OPT]** only if time permits

**Percentages** show how much of the whole project each phase represents (my judgment of effort and importance). Phases 0–9 add up to **100%**; Phase 10 is an optional bonus. Adjust the weights if you like.

---

## Progress Tracker

**Overall Project Progress: 5%**
`[#-------------------] 5%`

| Phase | Name | Weight (% of project) | Phase Progress | Contribution |
|-------|------|-----------------------|----------------|--------------|
| 0 | Setup & Planning | 5% | 100% | 5% |
| 1 | Backend Foundation (Node + Express + MongoDB) | 10% | 0% | 0% |
| 2 | Frontend Foundation (React + Tailwind) | 10% | 0% | 0% |
| 3 | AI Service: YOLO Person Detection (Deep Learning core) | 15% | 0% | 0% |
| 4 | Crowd Monitoring Logic + Live Dashboard + Map | 10% | 0% | 0% |
| 5 | Crowd Prediction (ML baseline → optional LSTM/GRU) | 10% | 0% | 0% |
| 6 | Volunteers, Resources & Sanitation | 10% | 0% | 0% |
| 7 | Alerts & AI Recommendation Engine | 5% | 0% | 0% |
| 8 | Simulation Mode & Full Integration | 10% | 0% | 0% |
| 9 | Testing, Polish, Deployment & Demo | 15% | 0% | 0% |
| 10 | Stretch Goals (optional bonus) | bonus | 0% | not counted |
| | **Total** | **100%** | | **5%** |

**How to update:** Phase Progress = ticked tasks ÷ total tasks in that phase. Contribution = weight × phase progress. Example: Phase 3 (15%) at 50% done adds 7.5% to the project. Overall Progress = sum of all contributions.

---

## Ground Rules for Working Solo

- [x] **Build a thin vertical slice first.** Get one thing working end to end (video → YOLO count → API → dashboard) before building everything else.
- [x] **Fake data first, real data later.** Use seeded/hardcoded data on the frontend until the backend is ready.
- [x] **Commit to Git at the end of every work session** with a clear message.
- [x] **Label all simulated data** as demo/simulation (required by the brief). Never present it as real Vari measurements.
- [x] **Follow the "Avoid" list** in the appendix. If a task feels like scope creep, cut it.
- [x] **If you fall behind, cut in this order:** Phase 10 → LSTM/GRU → sanitation route → polish animations. Never cut YOLO, the alert flow, or simulation mode.

---

## Phase 0 — Setup & Planning  ·  5% of project

**Goal:** Everything installed, repo ready, and three "hello world" servers running.

### Tools
- [x] Install Node.js (LTS), Python 3.10+, Git, VS Code
- [x] Set up MongoDB (local Community Server **or** a free MongoDB Atlas cluster)
- [x] Install Postman or the Thunder Client VS Code extension (for testing APIs)
- [x] Create a GitHub account/repo named `CROWD_MANAGEMENT_SYSTEM` (private is fine)

### Repository
- [x] Create the folder structure:
  ```
  CROWD_MANAGEMENT_SYSTEM/
  ├── frontend/
  ├── backend/
  ├── ai-service/
  ├── data/          (videos, simulated CSV/JSON)
  ├── docs/
  ├── README.md
  └── docker-compose.yml   (add later, optional)
  ```
- [x] Add a root `.gitignore` (node_modules, .env, venv, `__pycache__`, large videos, model weights)
- [x] Write a README skeleton with the one-line pitch from the brief

### Planning
- [x] Decide your list of **zones** (example: Gate 1, Gate 2, Gate 3, Temple Area, Main Road, Parking) with a **capacity** for each
- [x] Decide a handful of **water/food stations**, **waste zones** and ~15–20 **volunteers** (all simulated)
- [x] Find 2–3 short crowd videos (20–60 s) for YOLO testing. Save in `data/videos/` and note the source and license
- [x] Sketch the dashboard layout on paper or Figma (sidebar + stat cards + map + charts + alerts panel)

### Quick learning checkpoints (skip what you already know)
- [x] REST basics (GET/POST/PUT, status codes, JSON)
- [x] React basics (components, props, `useState`, `useEffect`)
- [x] FastAPI "hello world" with one endpoint

**Done when:** `npm run dev` works for both frontend and backend, and `uvicorn` serves a FastAPI hello-world endpoint.

---

## Phase 1 — Backend Foundation: Node.js + Express + MongoDB  ·  10% of project  **[MUST]**

**Goal:** A working REST API with a seeded database.

### Setup
- [ ] `npm init` in `backend/`; install `express`, `mongoose`, `cors`, `dotenv`, `socket.io`, `axios`; dev: `nodemon`
- [ ] Create `.env` (PORT, MONGO_URI, AI_SERVICE_URL) and a `.env.example`
- [ ] Connect to MongoDB via Mongoose and confirm the connection log
- [ ] Set up folder layout: `models/`, `routes/`, `controllers/`, `services/`, `utils/`
- [ ] Add a global error-handling middleware and consistent JSON responses

### Schemas (Mongoose models)
- [ ] `crowdZones`: name, capacity, currentCount, density, riskLevel, coordinates
- [ ] `volunteers`: name, location, skills, status
- [ ] `resources`: type (food/water), location, quantity, capacity, status
- [ ] `alerts`: type, severity, location, message, status, createdAt
- [ ] `tasks`: title, assignedVolunteer, location, priority, status
- [ ] Sanitation data (your addition, since the brief lists fields but no collection): waste level %, last cleaning time, zone status, priority, assigned team
- [ ] `users`: name, email, role, phone. **Model only, no login system** (auth is on the avoid list)
- [ ] Add an `isSimulated: true` flag (or similar) on seeded documents

### Seed data
- [ ] Write `seed.js` to populate zones, volunteers, resources and sanitation with realistic simulated values
- [ ] Add an npm script (`npm run seed`) that clears and re-seeds

### APIs (from the brief)
- [ ] Crowd: `GET /api/crowd`, `GET /api/crowd/:zoneId`, `POST /api/crowd/update`
- [ ] Volunteers: `GET /api/volunteers`, `POST /api/volunteers`, `PUT /api/volunteers/:id`
- [ ] Resources: `GET /api/resources`, `PUT /api/resources/:id`
- [ ] Alerts: `GET /api/alerts`, `POST /api/alerts`, `PUT /api/alerts/:id`
- [ ] Test every endpoint in Postman and save the collection in `docs/`

**Done when:** Every endpoint returns correct JSON from seeded data, and you can update a record with PUT/POST.

---

## Phase 2 — Frontend Foundation: React + Tailwind  ·  10% of project  **[MUST]**

**Goal:** Dashboard shell with all pages, showing real data from the backend.

### Setup
- [ ] Create the React app with Vite in `frontend/`; set up Tailwind CSS
- [ ] Install `react-router-dom`, `axios`, `recharts`, `leaflet`, `react-leaflet`, `socket.io-client`
- [ ] Create an `api/` folder with an Axios instance (base URL from env)

### Layout & reusable components
- [ ] Sidebar + top bar layout
- [ ] Reusable components: `StatCard`, `RiskBadge` (SAFE = green, MODERATE = yellow, HIGH = orange, CRITICAL = red), `AlertItem`, `DataTable`
- [ ] Add a visible **"Simulated Data"** badge/banner component

### Pages (start simple, tables/cards only)
- [ ] Dashboard (summary stat cards)
- [ ] Crowd page (zones with count, capacity, density, risk)
- [ ] Volunteers page (name, skills, status)
- [ ] Resources page (food/water stations and levels)
- [ ] Sanitation page
- [ ] Alerts page
- [ ] Recommendations page (placeholder for now)

### Data wiring
- [ ] Fetch data from the backend on each page
- [ ] Add loading, empty and error states

**Done when:** All pages load and display seeded data from the backend, and the layout works on laptop and phone widths.

---

## Phase 3 — AI Service: YOLO Person Detection  ·  15% of project  **[MUST]**

**Goal:** The Deep Learning core. Detect and count people in crowd video and expose it through FastAPI.

### Environment
- [ ] Create a Python virtual environment in `ai-service/`
- [ ] Install `fastapi`, `uvicorn`, `opencv-python`, `ultralytics` (YOLO), `numpy`, `pandas`, `scikit-learn`
- [ ] Create `requirements.txt`

### Detection on images
- [ ] Run a pretrained YOLO model on a single crowd image
- [ ] Filter detections to the **person** class only (COCO class 0)
- [ ] Draw bounding boxes and the count on the image with OpenCV
- [ ] Try different confidence thresholds and record what works best

### Detection on video
- [ ] Read a video frame by frame with OpenCV
- [ ] Process every Nth frame to keep it fast; log count per processed frame
- [ ] Save an annotated output video and a CSV of `timestamp, count` into `data/`
- [ ] Note the limitations you observe (dense crowds, small/occluded people) for your DL report

### Density and risk
- [ ] Write `calculate_density(count, capacity)` → `(count / capacity) × 100`
- [ ] Write `get_risk(density)`: `<60` SAFE · `60–85` MODERATE · `85–100` HIGH · `>100` CRITICAL
- [ ] Unit-test both with a few example values (e.g. Gate 2 at 126% → CRITICAL)

### FastAPI endpoint
- [ ] `POST /detect-crowd`: accepts an image/video frame (or a video name), returns `count`, `density`, `risk`, and optionally an annotated image
- [ ] Test in the Swagger UI (`/docs`)

### Course deliverable notes (save in `docs/`)
- [ ] Which YOLO version/model you used and why
- [ ] Sample screenshots (input vs. detection output)
- [ ] Observations: accuracy, speed, failure cases

**Done when:** You send a crowd video/frame to `/detect-crowd` and receive a sensible person count, density and risk level.

---

## Phase 4 — Crowd Monitoring Logic + Live Dashboard + Map  ·  10% of project  **[MUST]**

**Goal:** Connect the AI service to the backend and show live crowd data with a map and charts.

### Backend logic
- [ ] Add a density/risk engine in the backend (same thresholds as Phase 3) inside `POST /api/crowd/update`
- [ ] Create a service that calls the FastAPI `/detect-crowd` endpoint via Axios and saves the result to a zone
- [ ] Set up Socket.IO on the server and emit `crowd:update` whenever a zone changes

### Frontend
- [ ] Connect Socket.IO on the client so the dashboard updates without refresh
- [ ] Dashboard cards: total monitored crowd, active alerts, volunteers, food/water availability
- [ ] Recharts: crowd density per zone (bar) and count over time (line)
- [ ] **Leaflet map** (OpenStreetMap tiles): zone markers coloured by risk, gates, click a marker to see details
- [ ] Add a "video detection" panel that shows the annotated frame/video with count, density and risk

**Done when:** Triggering a detection updates the zone in the database and the dashboard/map changes live.

---

## Phase 5 — Crowd Prediction  ·  10% of project  **[MUST: baseline]  [OPT: LSTM/GRU]**

**Goal:** Predict crowd level 15–30 minutes ahead and show it.

### Data
- [ ] Generate a simulated time series in `data/` (baseline pattern + surges + noise) with a script, e.g. a count every minute for several simulated hours
- [ ] Mark it clearly as simulated

### Baseline model (scikit-learn)
- [ ] Create lag features (previous N counts) and target (count +15 min, +30 min)
- [ ] Time-based train/test split (do **not** shuffle)
- [ ] Train Linear Regression, then Random Forest; compare MAE/RMSE
- [ ] Save the best model with `joblib`

### API and UI
- [ ] `POST /predict-crowd` in FastAPI (input: recent counts → output: predicted +15/+30 min)
- [ ] Show the prediction as a dashed line on the crowd chart
- [ ] Early-warning message when predicted crowd is much higher (e.g. 8,200 now → 9,800 in 15 min)

### Optional: Deep Learning forecasting
- [ ] Build a small LSTM or GRU (PyTorch or Keras) on the same data
- [ ] Compare against the baseline in a results table (MAE/RMSE) for your report
- [ ] Only integrate into the API if it clearly helps

**Done when:** The dashboard shows a predicted crowd value and can warn before a zone reaches HIGH/CRITICAL.

---

## Phase 6 — Volunteers, Resources & Sanitation  ·  10% of project  **[MUST]**

**Goal:** Basic optimization and allocation logic.

### Volunteer allocation
- [ ] Implement a haversine distance helper (lat/lng → distance)
- [ ] Logic: Critical zone → required volunteers → filter available (and matching skills) → sort by distance → pick N nearest
- [ ] Create a task for each selected volunteer and set their status to `assigned`
- [ ] Endpoint for recommending volunteers (`POST /optimize-volunteers`, in FastAPI or in Node, whichever you find simpler)
- [ ] Volunteers page: show status, "Assign" button, and the recommendation list with distances

### Food & water
- [ ] Shortage detection: a station below 25% → status `shortage`
- [ ] Find the nearest station with surplus (by distance)
- [ ] Generate a **transfer recommendation** (from → to, quantity)
- [ ] "Approve transfer" button updates both stations' quantities
- [ ] Resources page shows level bars and shortage highlight

### Waste & sanitation **[BASIC]**
- [ ] Zone above 85% waste → auto-create a cleaning task with a priority
- [ ] Show waste level, last cleaning time, status, assigned team
- [ ] **[OPT]** Simple recommended collection route (order zones by nearest-neighbour)

**Done when:** A critical zone produces a list of nearest volunteers, a low-water station produces a transfer recommendation, and a full waste zone creates a task.

---

## Phase 7 — Alerts & AI Recommendation Engine  ·  5% of project  **[MUST]**

**Goal:** Turn all the rules into alerts plus explained recommendations.

### Alerts
- [ ] Alert rules from the brief:
  - Zone above 100% → CRITICAL alert
  - Predicted crowd exceeds threshold → early warning
  - Water below 25% → shortage alert
  - Waste above 85% → sanitation alert
- [ ] Avoid duplicate alerts (don't create a new one every second for the same issue)
- [ ] Emit `alert:new` over Socket.IO
- [ ] Alerts page: severity colours, filter, acknowledge/resolve buttons

### Recommendation engine
- [ ] `POST /recommend`: input = current state, output = list of actions with **a short explanation of why**
  - e.g. "Gate 2 at 126% → redirect incoming crowd to Gate 3 (currently 41%)"
- [ ] AI Recommendation panel on the dashboard and on the Recommendations page (Accept / Dismiss)
- [ ] Log accepted actions (task created, transfer approved, etc.)

**Done when:** A critical event produces an alert plus a clear, explained recommendation with an action button.

---

## Phase 8 — Simulation Mode & Full Integration  ·  10% of project  **[MUST]**

**Goal:** A reliable, repeatable demo, even without real CCTV.

### Simulation
- [ ] Backend simulation controller with **"Simulate Crowd Surge"** (Gate 2: 72% → 86% → 103% → 128%, stepping every few seconds)
- [ ] Each step triggers the whole chain: density → risk → alert → prediction → volunteer recommendation → alternate-route recommendation
- [ ] **"Reset Simulation"** button that restores the initial state
- [ ] A "SIMULATION / DEMO DATA" banner while simulation is active
- [ ] Simulate a water shortage and a full waste zone too (for the demo flow)

### Fallback
- [ ] If the AI service is down, use pre-computed YOLO results (saved JSON/CSV) so the demo never breaks
- [ ] Pre-process your demo video ahead of time and store the annotated output

### Integration
- [ ] Verify the full path: React ↔ Node ↔ FastAPI ↔ MongoDB
- [ ] Optional: write `docker-compose.yml` to start all services together

**Done when:** One button press runs the whole surge scenario and every panel reacts, repeatedly and reliably.

---

## Phase 9 — Testing, Polish, Deployment & Demo  ·  15% of project  **[MUST]**

### Testing (use the MVP Success Criteria checklist in the appendix)
- [ ] Test every success criterion manually and fix bugs
- [ ] Test edge cases: empty database, AI service offline, invalid input, 0 capacity

### Polish
- [ ] Responsive layout, loading spinners, error messages, empty states
- [ ] Consistent colours for risk levels; light animations on alerts
- [ ] Remove console errors and dead code

### Deployment
- [ ] Database on MongoDB Atlas
- [ ] Frontend on Vercel, backend on Render; move all secrets to environment variables
- [ ] AI service: YOLO + OpenCV can be heavy for free hosting tiers, so check memory limits early. Have a plan B (run it locally for the demo or use the pre-computed fallback)
- [ ] Update `.env.example` files and CORS settings for production URLs

### Documentation & course submission
- [ ] Finish the README: overview, architecture diagram, tech stack, setup steps, screenshots
- [ ] Deep Learning report/presentation: problem, YOLO explanation, results, limitations, prediction comparison
- [ ] Note that thresholds are prototype rules and need calibration with real data (the brief asks for this)

### Demo rehearsal (3 minutes)
- [ ] 0:00–0:30 Explain the crowd, volunteer, resource and sanitation challenges
- [ ] 0:30–1:00 Show dashboard, live map, crowd, volunteers, alerts, resources
- [ ] 1:00–1:30 Run a crowd video through YOLO: count, density, risk
- [ ] 1:30–2:00 Show prediction and the recommended crowd/volunteer response
- [ ] 2:00–2:30 Show water shortage and the redistribution recommendation
- [ ] 2:30–3:00 Final state and the SENSE → PREDICT → OPTIMIZE → ACT summary
- [ ] Rehearse at least 3 times with a timer
- [ ] **Record a backup demo video** in case something fails live

**Done when:** The deployed (or local) demo runs cleanly in under 3 minutes and the docs are submitted.

---

## Phase 10 — Stretch Goals (only after everything above works)  ·  bonus, not counted in the 100%  **[OPT]**

- [ ] Fine-tune YOLO on a crowd dataset (transfer learning) and compare with the pretrained model
- [ ] Abnormal crowd-flow / event detection
- [ ] Multi-camera view (several videos, one per zone)
- [ ] Better volunteer optimization (linear programming)
- [ ] Historical analytics page
- [ ] Vehicle-routing style sanitation route

---

## Appendix

### Risk thresholds (prototype rules)
| Density | Level |
|---------|-------|
| < 60% | SAFE |
| 60–85% | MODERATE |
| 85–100% | HIGH |
| > 100% | CRITICAL |

`density (%) = (current people / zone capacity) × 100`

### MVP Success Criteria checklist
- [ ] Dashboard loads realistic simulation data
- [ ] Live map displays zones and resources
- [ ] YOLO detects/counts people in the demo video
- [ ] Density and risk update correctly
- [ ] Short-term prediction is visible
- [ ] Critical events generate real-time alerts
- [ ] Nearby volunteers can be recommended/assigned
- [ ] Food/water shortage creates a redistribution recommendation
- [ ] Sanitation issue creates a task/alert
- [ ] AI recommendation panel explains the suggested action
- [ ] Frontend, backend, database and AI service communicate successfully
- [ ] Complete demo runs reliably in under three minutes

### Features to AVOID
Native mobile app · complex auth/role system · real IoT · real government/event-system integration · face recognition · large custom DL model from scratch · production-grade navigation · complex chatbot · large manual data-entry system

### Tech stack quick reference
| Layer | Tech |
|-------|------|
| Frontend | React + Tailwind CSS, Recharts, Leaflet + OpenStreetMap |
| Backend | Node.js + Express, Socket.IO, MongoDB + Mongoose |
| AI service | Python + FastAPI, YOLO + OpenCV, scikit-learn, optional LSTM/GRU |
| Deployment | Vercel + Render (+ MongoDB Atlas) |

### If your teammate joins later
Split by the brief's roles: **Frontend** (Phase 2, UI parts of 4/6/7), **Backend** (Phases 1, 4 logic, 6, 7 alerts, 8 simulation), **AI/ML** (Phases 3, 5, recommendation logic). Keep the API contract from Phase 1 stable so you can work in parallel.

### Daily habit
- [ ] Start: pick 2–3 tasks from the current phase only
- [ ] End: commit, tick the boxes, and write one line about what to do next
