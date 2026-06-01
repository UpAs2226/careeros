import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  profile: {
    college: String,
    degree: String,
    graduationYear: Number,
    phone: String,
    linkedin: String,
    github: String,
  },
  skills: [{ type: String }],
  dsaProgress: {
    totalSolved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    topics: [{ type: String }]
  },
  projects: [{
    title: String,
    description: String,
    techStack: [String],
    link: String,
    github: String
  }],
  resumeData: {
    atsScore: { type: Number, default: 0 },
    extractedSkills: [String],
    missingKeywords: [String],
    suggestions: [String],
    lastAnalyzed: Date
  },
  readinessScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);