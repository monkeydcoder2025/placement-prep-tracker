# Placement Prep Tracker — Bug Report & Fix Guide

Repo: `github.com/monkeydcoder2025/placement-prep-tracker`
Reviewed: full source (client + server), not just the live site.

**How to use this doc:** each item has the exact file(s), what's wrong, why it matters, and a concrete fix — including code where the fix is simple enough to paste in. Hand this whole file to Claude Code and ask it to work through the items in order.

## Summary table

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Panic Button doesn't actually pause the schedule | 🔴 Critical | Small |
| 2 | CampX completion stat never counts correctly | 🔴 Critical | Small |
| 3 | Sidebar unreachable on mobile (no toggle) | 🔴 Critical | Small |
| 4 | Exam-pause banner is wired to nothing | 🟡 Medium | Small |
| 5 | Dead "Blog"/"Discussion" buttons in header | 🟡 Medium | Tiny |
| 6 | No auth + wide-open CORS | 🟡 Medium | Medium |
| 7 | Real personal data committed in `tracker.json` | 🟡 Medium | Tiny |
| 8 | Task visibility locked to auto-schedule (can't work ahead) | 🟢 Nice-to-have | Medium |
| 9 | No links out to the actual problem/video per task | 🟢 Nice-to-have | Medium |
| 10 | `alert()`/`window.confirm()` used for feedback | 🟢 Nice-to-have | Small |
| 11 | Render free-tier cold starts, no loading polish | 🟢 Nice-to-have | Small |
| 12 | Duplicate scripts `generator.js` / `parse_campx.js` | ⚪ Cleanup | Tiny |
| 13 | Inline styles mixed with CSS classes everywhere | ⚪ Cleanup | Large (optional) |
| + | Unused deps `node-cron` / `web-push` — half-scaffolded push notifications | ⚪ Opportunity | — |

---

## 1. Panic Button doesn't actually pause the schedule 🔴

**Files:** `client/src/utils/api.js`, `server/routes/settings.js`, `server/services/scheduler.js`

**Problem:** `triggerPanic()` sends a POST with no request body:
```js
// client/src/utils/api.js
export const triggerPanic = async () => {
  const res = await fetch(`${API_BASE}/settings/panic`, { method: 'POST' });
  ...
};
```
The server reads `req.body.startDate` / `req.body.endDate` — both come back `undefined` — and saves them anyway:
```js
// server/routes/settings.js
router.post('/panic', async (req, res) => {
  const { startDate, endDate } = req.body; // undefined, undefined
  config.panic_pauses.push({ startDate, endDate });
  ...
});
```
In `scheduler.js`, the pause check does `new Date(undefined)`, which is an `Invalid Date`. Any comparison against an Invalid Date (`date >= pStart`) evaluates to `false`. So the pause is stored but **never matches any date**, and the schedule is never actually shifted — despite the UI saying "Shifts all deadlines forward by 1 week."

**Fix:** send a real 7-day range from the client, and validate on the server as a safety net.

```js
// client/src/utils/api.js
export const triggerPanic = async () => {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 7);
  const res = await fetch(`${API_BASE}/settings/panic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    })
  });
  if (!res.ok) throw new Error('Failed to trigger panic');
  return res.json();
};
```

```js
// server/routes/settings.js
router.post('/panic', async (req, res) => {
  try {
    let { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      const s = new Date();
      const e = new Date();
      e.setDate(s.getDate() + 7);
      startDate = s.toISOString().split('T')[0];
      endDate = e.toISOString().split('T')[0];
    }
    let config = await Config.findOne({});
    if (!config) config = new Config();
    config.panic_pauses.push({ startDate, endDate });
    config.updated_at = new Date();
    await config.save();
    res.json({ success: true, panic_pauses: config.panic_pauses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 2. CampX completion stat never counts correctly 🔴

**File:** `server/services/scheduler.js` (lines ~74–79 and ~96–98)

**Problem:** Session IDs in `campxDSMP.json` look like `"w1-s1"`, `"w1-s2"` (per-session), but the scheduler checks for completion using the plain week ID:
```js
w.completed = completedIds.includes(`w${w.weekNumber}`); // looks for "w1", never "w1-s1"
```
That exact string (`"w1"`) never exists as a completed task ID, so `completedCampx` — the number driving the CampX progress bar on both the Dashboard and the CampX page — stays wrong (usually stuck near 0) even when every session in a week is checked off. Individual session checkboxes work fine; it's specifically the roll-up count that's broken.

**Fix:** mark a week complete when all of its sessions are complete.

```js
// server/services/scheduler.js — inside the Sunday branch
if (active && campxIdx < campxData.length) {
  let w = campxData[campxIdx++];
  const sessionIds = (w.sessions || []).map(s => s.id);
  w.completed = sessionIds.length > 0 && sessionIds.every(id => completedIds.includes(id));
  if (w.completed) completedCampx++;
  assignedWeek = w;
}
```
```js
// server/services/scheduler.js — the trailing "remaining" loop
for (let i = campxIdx; i < campxData.length; i++) {
  const week = campxData[i];
  const sessionIds = (week.sessions || []).map(s => s.id);
  if (sessionIds.length > 0 && sessionIds.every(id => completedIds.includes(id))) {
    completedCampx++;
  }
}
```

---

## 3. Sidebar unreachable on mobile 🔴

**Files:** `client/src/components/Header.jsx`, `client/src/components/Sidebar.jsx`, `client/src/App.jsx`, `client/src/index.css`

**Problem:** Below 768px, CSS hides the sidebar off-screen:
```css
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
}
```
There is no hamburger button or toggle state anywhere in `Header.jsx` or `Sidebar.jsx` to bring it back. On a phone, only the Dashboard (the default route) is reachable — DSA, CampX, and Settings pages have no way in.

**Fix:** lift a small `isSidebarOpen` state into `App.jsx`, add a toggle button to `Header.jsx`, and an `.open` class on the sidebar.

```jsx
// client/src/App.jsx
import { useState } from 'react';
...
function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onMenuClick={() => setSidebarOpen(v => !v)} />
        ...
```

```jsx
// client/src/components/Header.jsx
import { Menu } from 'lucide-react';
const Header = ({ onMenuClick }) => (
  <header className="top-header">
    <button className="header-btn mobile-menu-btn" onClick={onMenuClick}>
      <Menu size={20} />
    </button>
    ...
```

```jsx
// client/src/components/Sidebar.jsx
const Sidebar = ({ isOpen, onClose }) => (
  <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
    ...
```

```css
/* client/src/index.css */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.2s ease; }
  .sidebar.open { transform: translateX(0); }
  .mobile-menu-btn { display: block; }
}
.mobile-menu-btn { display: none; } /* hidden on desktop */
```
(Also close the sidebar on route change / link click so it doesn't stay open after navigating.)

---

## 4. Exam-pause banner is wired to nothing 🟡

**Files:** `server/routes/schedule.js`, `server/services/scheduler.js`, `server/data/academicCalendar.json`

**Problem:** `academicCalendar.json` exists with exam date ranges, and `WeekendView`/`ExamBanner` already render an "Exams — Pause Active" banner — but `schedule.js` always passes an empty array for it:
```js
return generateSchedule(config.start_date, completedIds, panicPauses, [], striverData, campxData);
//                                                              ^^ academicCalendar hardcoded empty
```
and `isDatePaused()` in the scheduler never checks it at all (only `panicPauses`). So exam pauses can never trigger, even though the data and UI for it already exist.

**Fix:** load the file and check it the same way panic pauses are checked.

```js
// server/routes/schedule.js
const academicCalendar = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/academicCalendar.json'), 'utf-8'));

async function getScheduleData() {
  ...
  return generateSchedule(config.start_date, completedIds, panicPauses, academicCalendar, striverData, campxData);
}
```

```js
// server/services/scheduler.js
const isDatePaused = (date) => {
  for (let pause of panicPauses) {
    const pStart = new Date(pause.startDate); pStart.setHours(0,0,0,0);
    const pEnd = new Date(pause.endDate); pEnd.setHours(23,59,59,999);
    if (date >= pStart && date <= pEnd) return { paused: true, type: 'panic' };
  }
  for (let exam of academicCalendar) {
    const eStart = new Date(exam.startDate); eStart.setHours(0,0,0,0);
    const eEnd = new Date(exam.endDate); eEnd.setHours(23,59,59,999);
    if (date >= eStart && date <= eEnd) return { paused: true, type: 'exam' };
  }
  return { paused: false, type: null };
};
```
(Check the actual shape of `academicCalendar.json` first — confirm the field names match `startDate`/`endDate` before pasting this in.)

---

## 5. Dead "Blog" / "Discussion" buttons 🟡

**File:** `client/src/components/Header.jsx`

**Problem:** Two buttons render with no `onClick` — they do nothing when clicked.
```jsx
<button className="header-btn">Blog</button>
<button className="header-btn">Discussion</button>
```

**Fix:** either remove them until there's a real destination, or link them out:
```jsx
<a className="header-btn" href="/blog">Blog</a>
<a className="header-btn" href="https://github.com/monkeydcoder2025/placement-prep-tracker/discussions" target="_blank" rel="noreferrer">Discussion</a>
```

---

## 6. No auth + wide-open CORS 🟡

**File:** `server/index.js`

**Problem:** `app.use(cors())` with no options allows any origin, and none of the `/api` routes require any credential. Since there's no user field on `Config`/`Task` (this is a single-user app by design), anyone who finds the URL can complete/uncomplete tasks or overwrite the start date via the raw API.

**Fix (lightweight, matches the single-user design — no need for full auth):** a shared-secret header checked via middleware.

```js
// server/index.js
const API_KEY = process.env.API_KEY;
app.use('/api', (req, res, next) => {
  if (!API_KEY) return next(); // no key configured = open (e.g. local dev)
  if (req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```
```js
// tighten CORS to just your own frontend origin
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
```
Then set `API_KEY` in Render's env vars, and have the frontend send it (e.g. bake it into a build-time env var, or better — since it's server-rendered from the same origin, just check a cookie/localStorage token instead so the key isn't shipped in the JS bundle).

---

## 7. Real personal data committed in `tracker.json` 🟡

**File:** `server/tracker.json`

**Problem:** This file isn't referenced anywhere in the code (dead file), but it contains real completed-task timestamps and a `push_subscriptions` field — i.e. actual personal usage data sitting in a public GitHub repo.

**Fix:**
```bash
git rm --cached server/tracker.json
echo "server/tracker.json" >> .gitignore
git commit -m "Remove committed personal tracker data"
```

---

## 8. Task visibility locked to the auto-schedule 🟢

**Files:** `client/src/pages/DSAPage.jsx`, `client/src/pages/CampXPage.jsx`

**Problem:** Both pages only render tasks that fall out of `schedule.saturdays` / `schedule.sundays` — i.e. only what's been auto-assigned by the pacing algorithm (2 DSA subsections/Saturday, 1 CampX week/Sunday). A user who's ahead of schedule and free on a Tuesday can't see or check off future material early.

**Fix (concept):** add a `/api/content/all` endpoint that returns the full `striverData`/`campxData` regardless of scheduling, and let the DSA/CampX pages render everything with completion checkboxes — using the schedule only as a suggested pace indicator (e.g. a "Scheduled: Aug 9" tag), not a visibility gate.

---

## 9. No links out to the actual problem/video 🟢

**File:** `client/src/components/TaskCard.jsx`, `server/data/striverA2Z.json`, `server/data/campxDSMP.json`

**Problem:** Each `TaskCard` shows a title and topic list, but never links to the actual LeetCode/GFG problem or CampX session video — the user has to go find it themselves.

**Fix:** add a `link`/`url` field to the JSON data files, then render it:
```jsx
{task.link && (
  <a href={task.link} target="_blank" rel="noreferrer" className="task-link">
    Open resource →
  </a>
)}
```

---

## 10. `alert()` / `window.confirm()` for feedback 🟢

**Files:** `client/src/pages/SettingsPage.jsx`, `client/src/components/PanicButton.jsx`

**Problem:** Native browser dialogs (`alert('Start date updated!')`, `window.confirm(...)`) are jarring and block the UI thread. A small toast/snackbar or an in-app confirm modal would feel far more native to the rest of the design.

**Fix (concept):** add a lightweight toast component (state + auto-dismiss `<div className="toast">`) and a custom confirm modal; swap the `alert()`/`confirm()` calls for those.

---

## 11. Render free-tier cold starts 🟢

**File:** `render.yaml`

**Problem:** Standard Render web service — after ~15 minutes idle, the instance spins down and the next request takes 30–60s to wake up, with no loading indication beyond the default page load.

**Fix:** add a proper loading skeleton (already partially there via `"Loading..."` text — make it a styled skeleton instead), and optionally a lightweight external uptime pinger (e.g. a free cron-job service hitting `/api/health` every 10 min) to keep the instance warm if that tradeoff is acceptable.

---

## 12. Duplicate scripts 🧹

**Files:** `server/generator.js`, `server/parse_campx.js`

**Problem:** These two files are ~95% identical (diff is just a couple of extra comments in `parse_campx.js`). Neither is referenced in any `package.json` script, so both are safe to consolidate.

**Fix:**
```bash
rm server/generator.js   # keep parse_campx.js as the canonical version
```

---

## 13. Inline styles mixed with CSS classes 🧹 (optional, larger effort)

**Files:** most components in `client/src/components` and `client/src/pages`

**Problem:** Heavy use of `style={{ ... }}` alongside `className` throughout (e.g. `SettingsPage.jsx`, `TaskCard.jsx`, `DSAPage.jsx`) makes the theme harder to maintain consistently and harder to override.

**Fix (optional, do incrementally):** move repeated inline patterns (`marginBottom: '32px'`, flex row layouts, etc.) into utility classes in `index.css` (e.g. `.mb-32`, `.flex-row-center`) and swap them in page by page.

---

## Bonus: half-scaffolded push notifications

**File:** `server/package.json`

`node-cron` and `web-push` are both installed as dependencies but never imported anywhere in the server code — and `tracker.json` has an empty `push_subscriptions: []` field. This looks like the start of a "weekend reminder" notification feature that was never finished. Worth either building it out (you already have the right packages) or removing the unused deps to keep the install lean:
```bash
cd server && npm uninstall node-cron web-push   # if not planning to build this soon
```
