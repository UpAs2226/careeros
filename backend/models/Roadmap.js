import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: String,
  currentSkills: [String],
  targetSkills: [String],
  missingSkills: [String],
  timeline: [{
    week: String,
    title: String,
    topics: [String],
    resources: [{
      title: String,
      url: String,
      type: { type: String, enum: ['video', 'article', 'practice', 'project'] }
    }],
    completed: { type: Boolean, default: false }
  }],
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Roadmap', roadmapSchema);