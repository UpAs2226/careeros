import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: String,
  type: { type: String, enum: ['Full-time', 'Internship', 'Contract', 'Part-time'], default: 'Full-time' },
  mode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'On-site' },
  salary: String,
  status: { 
    type: String, 
    enum: ['Applied', 'OA', 'Interview', 'Technical Round', 'HR Round', 'Rejected', 'Selected', 'Offer Received'],
    default: 'Applied'
  },
  appliedDate: { type: Date, default: Date.now },
  deadline: Date,
  notes: String,
  jdText: String,
  matchScore: Number,
  missingSkills: [String],
  nextStep: String,
  interviews: [{
    round: String,
    date: Date,
    type: { type: String, enum: ['Technical', 'HR', 'Managerial', 'System Design'] },
    feedback: String,
    rating: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', applicationSchema);