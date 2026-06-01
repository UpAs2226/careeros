import express from 'express';
import pdfParse from 'pdf-parse-fixed';
import fs from 'fs';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { analyzeResume } from '../services/groqService.js';

const router = express.Router();

router.post('/analyze', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    const analysis = await analyzeResume(resumeText);

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      extractedText: resumeText,
      analysis
    });

    await User.findByIdAndUpdate(req.user._id, {
      'resumeData.atsScore': analysis.atsScore,
      'resumeData.extractedSkills': analysis.skills,
      'resumeData.missingKeywords': analysis.missingKeywords,
      'resumeData.suggestions': analysis.suggestions,
      'resumeData.lastAnalyzed': new Date(),
      skills: [...new Set([...req.user.skills, ...analysis.skills])]
    });

    res.json({
      success: true,
      analysis,
      resumeId: resume._id
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/latest', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;