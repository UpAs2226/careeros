import express from 'express';
import { protect } from '../middleware/auth.js';
import Application from '../models/Application.js';

const router = express.Router();

// Add Application
router.post('/', protect, async (req, res) => {
  try {
    const application = await Application.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Applications
router.get('/', protect, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status, notes, ...(status === 'Interview' && { nextStep: 'Prepare for interview' }) },
      { new: true }
    );
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Application
router.delete('/:id', protect, async (req, res) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Stats
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Application.countDocuments({ user: req.user._id });
    
    res.json({
      total,
      byStatus: stats,
      responseRate: total > 0 ? Math.round((stats.find(s => s._id !== 'Applied')?.count || 0) / total * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;