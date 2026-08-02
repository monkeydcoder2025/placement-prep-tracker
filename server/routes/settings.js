import express from 'express';
import Config from '../models/Config.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let config = await Config.findOne({});
    if (!config) {
      config = await Config.create({});
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/start-date', async (req, res) => {
  try {
    const { startDate } = req.body;
    await Config.findOneAndUpdate({}, { start_date: startDate, updated_at: new Date() }, { upsert: true });
    res.json({ success: true, startDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.delete('/panic/:index', async (req, res) => {
  try {
    const { index } = req.params;
    let config = await Config.findOne({});
    if (config && index >= 0 && index < config.panic_pauses.length) {
      config.panic_pauses.splice(index, 1);
      config.updated_at = new Date();
      await config.save();
    }
    
    res.json({ success: true, panic_pauses: config ? config.panic_pauses : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
