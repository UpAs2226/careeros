import express from 'express';
import { protect } from '../middleware/auth.js';
import { matchJobDescription } from '../services/groqService.js';
import User from '../models/User.js';

const router = express.Router();

// Match JD with Resume
router.post('/match', protect, async (req, res) => {
  try {
    const { jdText } = req.body;
    
    const user = await User.findById(req.user._id);
    const resumeSkills = user.resumeData?.extractedSkills || user.skills || [];
    
    const matchResult = await matchJobDescription(resumeSkills, jdText);
    
    res.json({
      success: true,
      ...matchResult,
      resumeSkills
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Skill Roadmap
router.post('/roadmap', protect, async (req, res) => {
  try {
    const { targetRole } = req.body;
    
    const user = await User.findById(req.user._id);
    const currentSkills = [...(user.skills || []), ...(user.resumeData?.extractedSkills || [])];
    
    const { generateRoadmap } = await import('../services/groqService.js');
    const roadmap = await generateRoadmap([...new Set(currentSkills)], targetRole);
    
    // Save roadmap
    const Roadmap = (await import('../models/Roadmap.js')).default;
    await Roadmap.findOneAndUpdate(
      { user: req.user._id, targetRole },
      {
        user: req.user._id,
        targetRole,
        currentSkills: [...new Set(currentSkills)],
        ...roadmap
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Roadmaps
router.get('/roadmaps', protect, async (req, res) => {
  try {
    const Roadmap = (await import('../models/Roadmap.js')).default;
    const roadmaps = await Roadmap.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;