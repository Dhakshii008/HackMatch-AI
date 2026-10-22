const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const Team = require('../models/Team');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/auth');
const { tierForScore, upgradeCertificateForSubmission } = require('../utils/awards');

router.get('/my', protect, async (req, res) => {
  try {
    const evalData = await Evaluation.findOne({ team: req.user.teamId });
    res.status(200).json({ success: true, data: evalData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', protect, restrictTo('admin', 'judge'), async (req, res) => {
  try {
    const evals = await Evaluation.find().populate('team judge submission');
    res.status(200).json({ success: true, data: evals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:submissionId', protect, async (req, res) => {
  try {
    const evalData = await Evaluation.findOne({ submission: req.params.submissionId });
    res.status(200).json({ success: true, data: evalData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, restrictTo('judge', 'admin'), async (req, res) => {
  try {
    const { submissionId, scores, comments, feedback, finalRemarks } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ success: false, message: 'scores are required' });
    }

    const CRITERIA = [
      ['innovation', 20],
      ['technical', 20],
      ['relevance', 20],
      ['uiux', 15],
      ['impact', 15],
      ['presentation', 10],
    ];
    const clean = {};
    let total = 0;
    for (const [key, max] of CRITERIA) {
      const n = Number(scores[key]);
      clean[key] = Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
      total += clean[key];
    }

    if (scores.scalability !== undefined && scores.presentation === undefined) {
      clean.scalability = Math.max(0, Math.min(10, Number(scores.scalability) || 0));
      total = Math.min(100, total + clean.scalability);
    }

    let evaluation = await Evaluation.findOne({ submission: submission._id });
    if (evaluation) {
      evaluation.scores = { ...clean };
      evaluation.total = total;
      evaluation.comments = comments || evaluation.comments || '';
      evaluation.feedback = feedback || evaluation.feedback || '';
      evaluation.finalRemarks = finalRemarks || evaluation.finalRemarks || '';
      evaluation.judge = req.user._id;
      evaluation.status = 'completed';
      evaluation.evaluatedAt = new Date();
      await evaluation.save();
    } else {
      evaluation = await Evaluation.create({
        submission: submission._id,
        team: submission.team,
        judge: req.user._id,
        scores: clean,
        total,
        comments: comments || '',
        feedback: feedback || '',
        finalRemarks: finalRemarks || '',
        status: 'completed',
        evaluatedAt: new Date()
      });
    }

    submission.status = 'evaluated';
    await submission.save();

    // Resolve the award tier from the score. Every submitted team already has a
    // participation certificate, so this upgrades it in place instead of
    // creating a second certificate for the same submission.
    const tier = tierForScore(total);

    const team = await Team.findById(submission.team).populate('members.user');
    for (const m of team.members) {
      await Notification.create({
        userId: m.user._id,
        type: 'evaluated',
        title: 'Project Evaluated',
        message: 'Your project has been evaluated by the judges.',
        data: { tier: tier.type, awardTitle: tier.label, total, submissionId: submission._id }
      });

      await upgradeCertificateForSubmission(Certificate, {
        userId: m.user._id,
        submissionId: submission._id,
        type: tier.type,
        score: total
      });
    }

    // Tell both sides live so the certificate page highlights without a reload.
    const io = req.app.get('io');
    if (io) {
      for (const m of team.members) {
        io.to('user_' + m.user._id).emit('award_announced', {
          submissionId: submission._id,
          type: tier.type,
          awardTitle: tier.label,
          score: total,
          message: `${tier.label} — ${tier.blurb}. Your certificate has been updated.`
        });
      }
    }

    res.status(201).json({ success: true, data: evaluation, award: { type: tier.type, label: tier.label, score: total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
