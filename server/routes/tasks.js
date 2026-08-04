import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/completed', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'completed' }, 'source_id');
    res.json(tasks.map(t => t.source_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/completed/history', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'completed' }, 'source_id completed_at');
    res.json(tasks.map(t => ({ source_id: t.source_id, completed_at: t.completed_at })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:sourceId/complete', async (req, res) => {
  try {
    const { sourceId } = req.params;
    const { source } = req.body; // 'striver' or 'campx'
    
    await Task.findOneAndUpdate(
      { source_id: sourceId },
      { source: source || 'unknown', status: 'completed', completed_at: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:sourceId/uncomplete', async (req, res) => {
  try {
    const { sourceId } = req.params;
    await Task.findOneAndDelete({ source_id: sourceId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
