const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const ProblemStatement = require('../models/ProblemStatement');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const Certificate = require('../models/Certificate');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

router.get('/stats', async (req, res) => {
  try {
    const participants = await User.countDocuments({ role: 'participant' });
    const teams = await Team.countDocuments();
    const problems = await ProblemStatement.countDocuments();
    const submissions = await Submission.countDocuments();
    const evaluations = await Evaluation.countDocuments();
    const certificates = await Certificate.countDocuments();
    
    res.status(200).json({ success: true, data: { participants, teams, problems, submissions, evaluations, certificates } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find().populate('leader');
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/submissions', async (req, res) => {
  try {
    const subs = await Submission.find().populate('team project submittedBy');
    res.status(200).json({ success: true, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/problems', async (req, res) => {
  try {
    const problem = await ProblemStatement.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/problems/:id', async (req, res) => {
  try {
    const problem = await ProblemStatement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
