import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['HR', 'Technical', 'Project', 'System Design', 'Mixed'], required: true },
  role: String,
  company: String,
  experience: String,
  questions: [{
    question: String,
    category: String,
    userAnswer: String,
    aiFeedback: String,
    score: Number,
    maxScore: { type: Number, default: 10 }
  }],
  overallScore: Number,
  communicationScore: Number,
  technicalDepthScore: Number,
  confidenceScore: Number,
  strengths: [String],
  improvements: [String],
  duration: Number,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Interview', interviewSchema);