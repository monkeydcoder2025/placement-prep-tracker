import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  source: { type: String, required: true },
  source_id: { type: String, required: true, unique: true },
  status: { type: String, default: 'completed' },
  completed_at: { type: Date, default: Date.now }
});

export default mongoose.model('Task', taskSchema);
