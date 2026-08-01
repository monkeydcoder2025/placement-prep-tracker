import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  start_date: { type: String, required: true, default: new Date().toISOString() },
  panic_pauses: { type: Array, default: [] },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('Config', configSchema);
