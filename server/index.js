import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import tasksRouter from './routes/tasks.js';
import scheduleRouter from './routes/schedule.js';
import settingsRouter from './routes/settings.js';
import calendarRouter from './routes/calendar.js';
import { startCronJobs } from './services/cron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

// Optional API key auth — only enforced when API_KEY is set in env
const API_KEY = process.env.API_KEY;
app.use('/api', (req, res, next) => {
  if (!API_KEY) return next(); // no key configured = open (e.g. local dev)
  // Allow health checks and calendar feed without auth
  if (req.path === '/health' || req.path.startsWith('/calendar/')) return next();
  if (req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use('/api/tasks', tasksRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/calendar', calendarRouter);

app.get('/api/health', (_req, res) => {
  res
    .status(200)
    .json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Anything that doesn't match the API routes, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});
