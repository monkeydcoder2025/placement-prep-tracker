import express from 'express';
import { createEvents } from 'ics';
import Config from '../models/Config.js';
import Task from '../models/Task.js';
import { generateSchedule } from '../services/scheduler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const striverData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/striverA2Z.json'), 'utf-8'));
const campxData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/campxDSMP.json'), 'utf-8'));
const academicCalendar = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/academicCalendar.json'), 'utf-8'));

router.get('/feed.ics', async (req, res) => {
  try {
    let config = await Config.findOne({});
    if (!config) config = await Config.create({});
    
    const completedTasks = await Task.find({ status: 'completed' }, 'source_id');
    const completedIds = completedTasks.map(t => t.source_id);
    
    const schedule = generateSchedule(config.start_date, completedIds, config.panic_pauses || [], academicCalendar, striverData, campxData);
    
    const events = [];

    // Map Saturdays
    schedule.saturdays.forEach(s => {
      if (!s.isExamPause && !s.isPanicPause && s.subsections.length > 0) {
        const dateObj = new Date(s.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        const uncompleted = s.subsections.filter(sub => !sub.completed);
        const completed = s.subsections.filter(sub => sub.completed);
        
        let title = 'Placement Prep: Striver Tasks';
        if (uncompleted.length === 0) title = '✅ ' + title;
        else if (completed.length > 0) title = '🔄 ' + title;

        let description = '';
        s.subsections.forEach(sub => {
          description += `${sub.completed ? '✅' : '❌'} ${sub.stepTitle} > ${sub.title}\n`;
        });

        events.push({
          start: [year, month, day],
          title,
          description,
          status: uncompleted.length === 0 ? 'CONFIRMED' : 'TENTATIVE',
          busyStatus: 'FREE',
        });
      }
    });

    // Map Sundays
    schedule.sundays.forEach(s => {
      if (!s.isExamPause && !s.isPanicPause && s.week) {
        const dateObj = new Date(s.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        const sessions = s.week.sessions || [];
        const uncompleted = sessions.filter(ses => !completedIds.includes(ses.id));
        const completed = sessions.filter(ses => completedIds.includes(ses.id));

        let title = `Placement Prep: CampX Week ${s.week.week}`;
        if (uncompleted.length === 0) title = '✅ ' + title;
        else if (completed.length > 0) title = '🔄 ' + title;

        let description = `Topic: ${s.week.title}\n\n`;
        sessions.forEach(ses => {
          const isDone = completedIds.includes(ses.id);
          description += `${isDone ? '✅' : '❌'} ${ses.title}\n`;
        });

        events.push({
          start: [year, month, day],
          title,
          description,
          status: uncompleted.length === 0 ? 'CONFIRMED' : 'TENTATIVE',
          busyStatus: 'FREE',
        });
      }
    });

    createEvents(events, (error, value) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to generate calendar feed' });
      }
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="placement-prep.ics"');
      res.send(value);
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
