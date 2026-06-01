import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../services/groqService.js';

const router = express.Router();

// Start Interview Session
router.post('/start', protect, async (req, res) => {
  try {
    const { type, role, experience, company } = req.body;
    
    const user = await User.findById(req.user._id);
    const techStack = user.skills || [];
    
    const questionsData = await generateInterviewQuestions(type, role, experience, techStack);
    
    const interview = await Interview.create({
      user: req.user._id,
      type,
      role,
      company,
      experience,
      questions: questionsData.questions.map(q => ({
        question: q.question,
        category: q.category,
        maxScore: 10
      })),
      duration: questionsData.estimatedDuration
    });
    
    res.json({
      success: true,
      interviewId: interview._id,
      questions: questionsData.questions,
      duration: questionsData.estimatedDuration,
      focusAreas: questionsData.focusAreas
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit Answer
router.post('/answer/:interviewId', protect, async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    const { interviewId } = req.params;
    
    const interview = await Interview.findById(interviewId);
    if (!interview || interview.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    const question = interview.questions[questionIndex];
    const evaluation = await evaluateInterviewAnswer(
      question.question,
      answer,
      [] // You can store expected points in the question
    );
    
    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].aiFeedback = evaluation.feedback;
    interview.questions[questionIndex].score = evaluation.score;
    
    await interview.save();
    
    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete Interview
router.post('/complete/:interviewId', protect, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    const answeredQuestions = interview.questions.filter(q => q.score !== undefined);
    
    if (answeredQuestions.length === 0) {
      return res.status(400).json({ message: 'No answers submitted' });
    }
    
    const avgScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length;
    
    // Calculate category scores
    const feedbacks = answeredQuestions.map(q => q.aiFeedback).join(' ');
    
    interview.overallScore = Math.round(avgScore * 10);
    interview.communicationScore = Math.round(Math.random() * 30 + 60); // Simplified
    interview.technicalDepthScore = Math.round(avgScore * 10);
    interview.confidenceScore = Math.round(Math.random() * 20 + 70);
    interview.completed = true;
    interview.strengths = ['Good technical knowledge', 'Clear communication'];
    interview.improvements = ['Practice more DSA', 'Improve system design knowledge'];
    
    await interview.save();
    
    res.json({
      success: true,
      results: {
        overallScore: interview.overallScore,
        communicationScore: interview.communicationScore,
        technicalDepthScore: interview.technicalDepthScore,
        confidenceScore: interview.confidenceScore,
        strengths: interview.strengths,
        improvements: interview.improvements
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Interview History
router.get('/history', protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;