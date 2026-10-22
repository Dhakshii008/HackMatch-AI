const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/leaderboard — sorted teams with scores
router.get('/', protect, async (req, res) => {
  try {
    // Get all completed evaluations
    const evaluations = await Evaluation.find({ status: 'completed' })
      .populate({
        path: 'team',
        populate: [
          { path: 'members.user', select: 'name college department' },
          { path: 'leader', select: 'name college' },
          { path: 'problem', select: 'title domain' }
        ]
      })
      .sort({ total: -1 });

    // Get submissions for project titles
    const submissions = await Submission.find({}).populate('project', 'title techStack');

    // Build leaderboard
    const leaderboard = await Promise.all(evaluations.map(async (eval_, index) => {
      const submission = submissions.find(s => s.team?.toString() === eval_.team?._id?.toString());
      const project = await Project.findOne({ team: eval_.team?._id });

      const members = eval_.team?.members || [];
      const colleges = [...new Set(members.map(m => m.user?.college).filter(Boolean))];

      return {
        rank: index + 1,
        teamId: eval_.team?._id,
        teamName: eval_.team?.name || 'Unknown Team',
        teamCode: eval_.team?.teamCode,
        projectTitle: project?.title || submission?.project?.title || 'Unnamed Project',
        college: colleges[0] || eval_.team?.leader?.college || 'Unknown College',
        domain: eval_.team?.problem?.domain || 'General',
        problemTitle: eval_.team?.problem?.title,
        members: members.length,
        score: eval_.total,
        scores: eval_.scores,
        techStack: project?.techStack || submission?.project?.techStack || [],
        badges: getBadges(eval_.total, eval_.scores, index)
      };
    }));

    // Also include submitted but not yet evaluated teams (at the bottom)
    const submittedTeamIds = evaluations.map(e => e.team?._id?.toString());
    const pendingSubmissions = await Submission.find({
      team: { $nin: submittedTeamIds },
      status: { $in: ['submitted', 'under_review'] }
    }).populate({
      path: 'team',
      populate: [
        { path: 'members.user', select: 'name college' },
        { path: 'problem', select: 'title domain' }
      ]
    }).populate('project', 'title');

    const pendingEntries = pendingSubmissions.map((sub, i) => {
      const members = sub.team?.members || [];
      const colleges = [...new Set(members.map(m => m.user?.college).filter(Boolean))];
      return {
        rank: leaderboard.length + i + 1,
        teamId: sub.team?._id,
        teamName: sub.team?.name || 'Unknown Team',
        projectTitle: sub.project?.title || 'Unnamed Project',
        college: colleges[0] || 'Unknown College',
        domain: sub.team?.problem?.domain || 'General',
        members: members.length,
        score: sub.autoEvalScore || 0,
        scores: {},
        badges: ['Submitted'],
        status: 'pending_evaluation'
      };
    });

    res.status(200).json({
      success: true,
      data: [...leaderboard, ...pendingEntries]
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

function getBadges(score, scores, rank) {
  const badges = [];
  if (rank === 0) badges.push('🥇 Grand Winner');
  else if (rank === 1) badges.push('🥈 First Runner-Up');
  else if (rank === 2) badges.push('🥉 Second Runner-Up');
  if (scores?.innovation >= 18) badges.push('🤖 Best AI Innovation');
  if (scores?.uiux >= 9) badges.push('🎨 Best UI/UX');
  if (scores?.impact >= 18) badges.push('💚 Best Social Impact');
  if (score >= 90) badges.push('⭐ Excellence Award');
  return badges;
}

module.exports = router;
