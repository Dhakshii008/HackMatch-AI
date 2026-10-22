const express = require('express');
const router = express.Router();
const ProblemStatement = require('../models/ProblemStatement');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/problems — list all problems with optional filters
router.get('/', protect, async (req, res) => {
  try {
    const { domain, difficulty } = req.query;
    const filter = { isActive: true };
    if (domain && domain !== 'All') filter.domain = domain;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;

    const problems = await ProblemStatement.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/problems/match — AI match problems for current user based on skills
router.get('/match', protect, async (req, res) => {
  try {
    const problems = await ProblemStatement.find({ isActive: true });
    const userSkills = (req.user.skills || []).map(s => s.toLowerCase().trim());

    const matched = problems.map(problem => {
      const requiredSkills = (problem.requiredSkills || []).map(s => s.toLowerCase().trim());
      const technologies = (problem.technologies || []).map(s => s.toLowerCase().trim());

      // Compute skill overlap
      const allProblemSkills = [...new Set([...requiredSkills, ...technologies])];
      const matchCount = userSkills.filter(skill =>
        allProblemSkills.some(ps => ps.includes(skill) || skill.includes(ps))
      ).length;

      const overlapRatio = allProblemSkills.length > 0 ? matchCount / allProblemSkills.length : 0;
      const baseScore = Math.round(overlapRatio * 60); // 0-60 from overlap
      const bonus = Math.floor(Math.random() * 30) + 10; // 10-40 bonus
      const matchScore = Math.min(99, Math.max(40, baseScore + bonus));

      // Reason for match
      const matchingSkills = userSkills.filter(skill =>
        allProblemSkills.some(ps => ps.includes(skill) || skill.includes(ps))
      );
      const reasons = matchingSkills.length > 0
        ? `Your ${matchingSkills.slice(0, 3).join(', ')} skills strongly align with this problem.`
        : `This problem complements your current skill set.`;

      return {
        problem,
        matchScore,
        reasons,
        matchingSkills
      };
    });

    // Sort by match score descending
    matched.sort((a, b) => b.matchScore - a.matchScore);
    res.status(200).json({ success: true, data: matched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/problems/:id — problem detail
router.get('/:id', protect, async (req, res) => {
  try {
    const problem = await ProblemStatement.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    // Calculate match score for current user
    const userSkills = (req.user.skills || []).map(s => s.toLowerCase().trim());
    const allProblemSkills = [...(problem.requiredSkills || []), ...(problem.technologies || [])].map(s => s.toLowerCase().trim());
    const matchCount = userSkills.filter(skill => allProblemSkills.some(ps => ps.includes(skill) || skill.includes(ps))).length;
    const matchScore = allProblemSkills.length > 0
      ? Math.min(99, Math.round((matchCount / allProblemSkills.length) * 60) + Math.floor(Math.random() * 30) + 10)
      : 65;

    res.status(200).json({ success: true, data: problem, matchScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/problems/:id/select — user selects this problem
router.post('/:id/select', protect, async (req, res) => {
  try {
    const problem = await ProblemStatement.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    // Update problem participant count
    problem.participants = (problem.participants || 0) + 1;
    await problem.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, { selectedProblem: problem._id });

    res.status(200).json({ success: true, message: 'Problem selected successfully', data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
