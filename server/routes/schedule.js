import express from 'express';
import Task from '../models/Task.js';
import Config from '../models/Config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSchedule, getCurrentWeekend, getStats } from '../services/scheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Load data files
const striverData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/striverA2Z.json'), 'utf-8'));
const campxData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/campxDSMP.json'), 'utf-8'));
const academicCalendar = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/academicCalendar.json'), 'utf-8'));

async function getScheduleData() {
  let config = await Config.findOne({});
  if (!config) config = await Config.create({});
  const panicPauses = config.panic_pauses || [];
  
  const completedTasks = await Task.find({ status: 'completed' }, 'source_id');
  const completedIds = completedTasks.map(t => t.source_id);
  
  return generateSchedule(config.start_date, completedIds, panicPauses, academicCalendar, striverData, campxData);
}

router.get('/', async (req, res) => {
  try {
    const schedule = await getScheduleData();
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current', async (req, res) => {
  try {
    const schedule = await getScheduleData();
    const current = getCurrentWeekend(schedule);
    res.json(current);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const schedule = await getScheduleData();
    const completedTasks = await Task.find({ status: 'completed' }, 'source_id');
    const completedIds = completedTasks.map(t => t.source_id);
    const stats = getStats(schedule, completedIds);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return all content regardless of schedule — lets users work ahead
router.get('/content/all', async (req, res) => {
  try {
    const completedTasks = await Task.find({ status: 'completed' }, 'source_id');
    const completedIds = completedTasks.map(t => t.source_id);
    
    // Flatten striver subsections
    const striverSubsections = [];
    striverData.forEach(step => {
      step.subsections.forEach(sub => {
        striverSubsections.push({
          ...sub,
          step: step.step,
          stepTitle: step.stepTitle,
          completed: completedIds.includes(sub.id)
        });
      });
    });
    
    // Annotate campx data with completion
    const campxAnnotated = campxData.map(week => ({
      ...week,
      sessions: (week.sessions || []).map(s => ({
        ...s,
        completed: completedIds.includes(s.id)
      }))
    }));
    
    res.json({
      striver: striverSubsections,
      campx: campxAnnotated,
      completedIds
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
