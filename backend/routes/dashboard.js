import express from 'express';
import { protect } from '../middleware/auth.js';
import { calculateReadiness } from '../services/groqService.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';

const router = express.Router();

// Get Dashboard Data
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Application stats
    const applications = await Application.find({ user: req.user._id });
    const appStats = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'Applied').length,
      interview: applications.filter(a => ['Interview', 'Technical Round', 'HR Round'].includes(a.status)).length,
      offer: applications.filter(a => a.status === 'Offer Received').length,
      rejected: applications.filter(a => a.status === 'Rejected').length
    };
    
    // Interview stats
    const interviews = await Interview.find({ user: req.user._id, completed: true });
    const avgInterviewScore = interviews.length > 0 
      ? Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length)
      : 0;
    
    // Calculate readiness
    const userData = {
      skills: user.skills || [],
      resumeScore: user.resumeData?.atsScore || 0,
      dsaProgress: user.dsaProgress || { totalSolved: 0 },
      projects: user.projects || [],
      interviewScores: interviews.map(i => i.overallScore)
    };
    
    let readiness = null;
    try {
      readiness = await calculateReadiness(userData);
    } catch (e) {
      readiness = {
        overallScore: Math.round((userData.resumeScore + (userData.dsaProgress.totalSolved * 2)) / 2),
        verdict: 'Assessment pending',
        breakdown: {
          resume: userData.resumeScore,
          skills: 60,
          dsa: Math.min(userData.dsaProgress.totalSolved * 2, 100),
          projects: 70,
          communication: avgInterviewScore || 50
        }
      };
    }
    
    // Update user's readiness score
    if (readiness) {
      await User.findByIdAndUpdate(req.user._id, {
        readinessScore: readiness.overallScore
      });
    }
    
    res.json({
      applications: appStats,
      interviews: {
        total: interviews.length,
        averageScore: avgInterviewScore,
        recent: interviews.slice(0, 5)
      },
      readiness,
      resume: user.resumeData,
      skills: user.skills || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;