const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/auth');
const { tierForScore, upgradeCertificateForSubmission } = require('../utils/awards');

// Protect all judge routes
router.use(protect, restrictTo('judge', 'admin'));

/**
 * GET /api/judge/submissions
 * Fetch ALL submissions permanently stored in MongoDB, with team, project, members,
 * problem statement, and evaluation details.
 */
router.get('/submissions', async (req, res) => {
  try {
    const { status, domain, search, sort } = req.query;

    const submissions = await Submission.find()
      .populate({
        path: 'team',
        populate: [
          { path: 'members.user', select: 'name email role college department year skills avatar' },
          { path: 'leader', select: 'name email' },
          { path: 'problem', select: 'title domain difficulty organization' }
        ]
      })
      .populate({
        path: 'project',
        populate: {
          path: 'problem',
          select: 'title domain difficulty organization'
        }
      })
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: -1 })
      .lean();

    // Fetch all evaluations for these submissions
    const submissionIds = submissions.map(s => s._id);
    const evaluations = await Evaluation.find({ submission: { $in: submissionIds } })
      .populate('judge', 'name email')
      .lean();

    const evalMap = new Map();
    evaluations.forEach(ev => {
      // Store by submission ID string
      evalMap.set(String(ev.submission), ev);
    });

    // Merge evaluations into submission records
    let list = submissions.map(sub => {
      const evaluation = evalMap.get(String(sub._id)) || null;
      const isEvaluated = sub.status === 'evaluated' || (evaluation && evaluation.status === 'completed');
      return {
        ...sub,
        status: isEvaluated ? 'evaluated' : (sub.status || 'submitted'),
        evaluation
      };
    });

    // Apply optional server-side filters if query params supplied
    if (status && status !== 'all') {
      if (status === 'evaluated') {
        list = list.filter(s => s.status === 'evaluated');
      } else if (status === 'pending' || status === 'submitted') {
        list = list.filter(s => s.status !== 'evaluated');
      }
    }

    if (domain && domain !== 'all') {
      const dLower = domain.toLowerCase();
      list = list.filter(s => {
        const probDomain = s.project?.problem?.domain || s.team?.problem?.domain || '';
        return probDomain.toLowerCase() === dLower;
      });
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => {
        const title = (s.project?.title || '').toLowerCase();
        const desc = (s.project?.description || '').toLowerCase();
        const teamName = (s.team?.name || '').toLowerCase();
        const probTitle = (s.project?.problem?.title || s.team?.problem?.title || '').toLowerCase();
        const tech = Array.isArray(s.project?.techStack) ? s.project.techStack.join(' ').toLowerCase() : '';
        const members = Array.isArray(s.team?.members) ? s.team.members.map(m => m.user?.name || '').join(' ').toLowerCase() : '';
        return title.includes(q) || desc.includes(q) || teamName.includes(q) || probTitle.includes(q) || tech.includes(q) || members.includes(q);
      });
    }

    // Summary statistics across all raw submissions
    const allEvaluated = submissions.filter(s => {
      const ev = evalMap.get(String(s._id));
      return s.status === 'evaluated' || (ev && ev.status === 'completed');
    });
    const evaluatedCount = allEvaluated.length;
    const pendingCount = submissions.length - evaluatedCount;

    let totalScoreSum = 0;
    let topScore = 0;
    allEvaluated.forEach(s => {
      const ev = evalMap.get(String(s._id));
      const score = Number(ev?.total || s.autoEvalScore || 0);
      totalScoreSum += score;
      if (score > topScore) topScore = score;
    });
    const avgScore = evaluatedCount > 0 ? Math.round(totalScoreSum / evaluatedCount) : 0;

    res.status(200).json({
      success: true,
      count: list.length,
      stats: {
        total: submissions.length,
        evaluated: evaluatedCount,
        pending: pendingCount,
        topScore,
        avgScore
      },
      data: list
    });
  } catch (error) {
    console.error('Judge submissions fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/judge/submissions/:id
 * Fetch detailed view for a single project submission.
 */
router.get('/submissions/:id', async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id)
      .populate({
        path: 'team',
        populate: [
          { path: 'members.user', select: 'name email role college department year skills bio githubUrl linkedinUrl' },
          { path: 'leader', select: 'name email' },
          { path: 'problem' }
        ]
      })
      .populate({
        path: 'project',
        populate: { path: 'problem' }
      })
      .populate('submittedBy', 'name email');

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const evaluation = await Evaluation.findOne({ submission: sub._id })
      .populate('judge', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...sub.toObject(),
        status: evaluation && evaluation.status === 'completed' ? 'evaluated' : sub.status,
        evaluation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/judge/evaluate
 * Submit or update judging evaluation for a project.
 * Permanently saves scores, comments, feedback, and final remarks into MongoDB.
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { submissionId, scores, comments, feedback, finalRemarks } = req.body;

    if (!submissionId) {
      return res.status(400).json({ success: false, message: 'submissionId is required' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({ success: false, message: 'scores object is required' });
    }

    // Standard hackathon judging criteria with realistic caps:
    // 1. Innovation: 20
    // 2. Technical Implementation: 20
    // 3. Problem Relevance: 20
    // 4. UI/UX: 15
    // 5. Impact: 15
    // 6. Presentation: 10
    // (Total = 100)
    const CRITERIA = [
      ['innovation', 20],
      ['technical', 20],
      ['relevance', 20],
      ['uiux', 15],
      ['impact', 15],
      ['presentation', 10]
    ];

    const cleanScores = {};
    let calculatedTotal = 0;

    for (const [key, max] of CRITERIA) {
      const val = Number(scores[key]);
      const cleanVal = Number.isFinite(val) ? Math.max(0, Math.min(max, val)) : 0;
      cleanScores[key] = cleanVal;
      calculatedTotal += cleanVal;
    }

    // Backwards compatibility if scalability is passed instead of presentation
    if (scores.scalability !== undefined && scores.presentation === undefined) {
      const sc = Number(scores.scalability) || 0;
      cleanScores.scalability = Math.max(0, Math.min(10, sc));
      calculatedTotal = Math.min(100, calculatedTotal + cleanScores.scalability);
    }

    // Check for existing evaluation to upsert
    let evaluation = await Evaluation.findOne({ submission: submission._id });

    if (evaluation) {
      evaluation.scores = { ...cleanScores };
      evaluation.total = calculatedTotal;
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
        scores: cleanScores,
        total: calculatedTotal,
        comments: comments || '',
        feedback: feedback || '',
        finalRemarks: finalRemarks || '',
        status: 'completed',
        evaluatedAt: new Date()
      });
    }

    // Update submission record permanently
    submission.status = 'evaluated';
    submission.autoEvalScore = calculatedTotal;
    await submission.save();

    // Resolve award tier and upgrade participant certificates
    const tier = tierForScore(calculatedTotal);

    if (submission.team) {
      const team = await Team.findById(submission.team).populate('members.user');
      if (team && Array.isArray(team.members)) {
        for (const m of team.members) {
          if (!m.user || !m.user._id) continue;

          // Notification to each member
          try {
            await Notification.create({
              userId: m.user._id,
              type: 'evaluated',
              title: `Project Evaluated: ${tier.label}!`,
              message: `The judges evaluated your submission with a score of ${calculatedTotal}/100. ${comments ? `Notes: "${comments.slice(0, 80)}..."` : ''}`,
              data: {
                tier: tier.type,
                awardTitle: tier.label,
                total: calculatedTotal,
                submissionId: submission._id
              }
            });
          } catch (notifErr) {
            console.error('Failed to notify member of evaluation:', notifErr.message);
          }

          // Upgrade certificate in place
          try {
            await upgradeCertificateForSubmission(Certificate, {
              userId: m.user._id,
              submissionId: submission._id,
              type: tier.type,
              score: calculatedTotal
            });
          } catch (certErr) {
            console.error('Failed to update certificate:', certErr.message);
          }
        }

        // Live Socket.IO notification to team members
        const io = req.app.get('io');
        if (io) {
          team.members.forEach(m => {
            if (m.user && m.user._id) {
              io.to(`user_${m.user._id}`).emit('award_announced', {
                submissionId: submission._id,
                type: tier.type,
                awardTitle: tier.label,
                score: calculatedTotal,
                comments: comments || '',
                message: `${tier.label} — Score: ${calculatedTotal}/100. Your certificate and ranking have been updated!`
              });
            }
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation saved successfully',
      data: evaluation,
      award: {
        type: tier.type,
        label: tier.label,
        score: calculatedTotal
      }
    });
  } catch (error) {
    console.error('Judge evaluate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/judge/stats
 * Quick endpoint to fetch aggregated judge statistics.
 */
router.get('/stats', async (req, res) => {
  try {
    const total = await Submission.countDocuments();
    const evaluated = await Submission.countDocuments({ status: 'evaluated' });
    const pending = total - evaluated;

    const evaluations = await Evaluation.find({ status: 'completed' }).select('total');
    let topScore = 0;
    let sum = 0;
    evaluations.forEach(ev => {
      const s = ev.total || 0;
      sum += s;
      if (s > topScore) topScore = s;
    });
    const avgScore = evaluations.length > 0 ? Math.round(sum / evaluations.length) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        evaluated,
        pending,
        topScore,
        avgScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
