import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Config from './models/Config.js';
import Task from './models/Task.js';
import { generateSchedule } from './services/scheduler.js';
import { sendTelegramMessage } from './services/telegramService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const striverData = JSON.parse(fs.readFileSync(path.join(__dirname, './data/striverA2Z.json'), 'utf-8'));
const campxData = JSON.parse(fs.readFileSync(path.join(__dirname, './data/campxDSMP.json'), 'utf-8'));
const academicCalendar = JSON.parse(fs.readFileSync(path.join(__dirname, './data/academicCalendar.json'), 'utf-8'));

async function testNotification() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement');
    const config = await Config.findOne({});
    if (!config || !config.telegram_bot_token || !config.telegram_chat_id) {
      console.log('Telegram credentials not set in Config db.');
      process.exit(1);
    }

    const completedTasks = await Task.find({ status: 'completed' }, 'source_id');
    const completedIds = completedTasks.map(t => t.source_id);
    
    const schedule = generateSchedule(config.start_date, completedIds, config.panic_pauses || [], academicCalendar, striverData, campxData);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];

    let message = '';
    
    // 1. Find today's tasks
    const todaySat = schedule.saturdays.find(s => s.date === todayStr);
    const todaySun = schedule.sundays.find(s => s.date === todayStr);

    if (todaySat && !todaySat.isExamPause && !todaySat.isPanicPause) {
      const uncompleted = todaySat.subsections.filter(sub => !sub.completed);
      if (uncompleted.length > 0) {
        message += `🗓 <b>Today's Striver Tasks (${todayStr})</b>:\n`;
        uncompleted.forEach(sub => {
          message += `- ${sub.stepTitle} > ${sub.title}\n`;
        });
        message += '\n';
      }
    }

    if (todaySun && !todaySun.isExamPause && !todaySun.isPanicPause && todaySun.week && !todaySun.week.completed) {
      const week = todaySun.week;
      const uncompletedSessions = (week.sessions || []).filter(s => !completedIds.includes(s.id));
      if (uncompletedSessions.length > 0) {
        message += `🗓 <b>Today's CampX Tasks (${todayStr})</b>:\n`;
        message += `Week ${week.week} - ${week.title}\n`;
        uncompletedSessions.forEach(s => {
          message += `- ${s.title}\n`;
        });
        message += '\n';
      }
    }

    // 2. Find past-due uncompleted tasks
    let pastDueMessage = '';
    let pastDueCount = 0;

    const pastSaturdays = schedule.saturdays.filter(s => new Date(s.date) < today && !s.isExamPause && !s.isPanicPause);
    pastSaturdays.forEach(s => {
      const uncompleted = s.subsections.filter(sub => !sub.completed);
      uncompleted.forEach(sub => {
        pastDueMessage += `- [Striver] ${sub.title} (Due: ${s.date})\n`;
        pastDueCount++;
      });
    });

    const pastSundays = schedule.sundays.filter(s => new Date(s.date) < today && !s.isExamPause && !s.isPanicPause && s.week);
    pastSundays.forEach(s => {
      const uncompleted = (s.week.sessions || []).filter(ses => !completedIds.includes(ses.id));
      uncompleted.forEach(ses => {
        pastDueMessage += `- [CampX] W${s.week.week}: ${ses.title} (Due: ${s.date})\n`;
        pastDueCount++;
      });
    });

    if (pastDueCount > 0) {
      message += `🚨 <b>Past Due Tasks (${pastDueCount})</b>:\n` + pastDueMessage;
    }

    let finalMessage = `🔔 <b>Placement Prep Tracker (TEST RUN)</b>\n\n`;
    
    if (message) {
      finalMessage += message;
    } else {
      finalMessage += "You have no pending tasks today! Great job! 🎉";
    }

    await sendTelegramMessage(config.telegram_bot_token, config.telegram_chat_id, finalMessage);
    console.log('Test notification sent successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error in test script:', err);
    process.exit(1);
  }
}

testNotification();
