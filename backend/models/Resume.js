import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: String,
  filePath: String,
  fileType: String,
  extractedText: String,
  analysis: {
    atsScore: Number,
    skills: [String],
    education: [{
      institution: String,
      degree: String,
      year: String
    }],
    experience: [{
      company: String,
      role: String,
      duration: String,
      description: String
    }],
    projects: [{
      name: String,
      description: String,
      techStack: [String]
    }],
    missingKeywords: [String],
    suggestions: [String],
    strengths: [String],
    weaknesses: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', resumeSchema);