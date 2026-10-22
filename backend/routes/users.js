const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/search?q=query
router.get('/search', protect, async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.status(200).json({ success: true, data: [] });
    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { skills: regex }, { college: regex }],
      role: 'participant'
    }).select('-password').limit(20);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/all — all participants (for teammate matching display)
router.get('/all', protect, async (req, res) => {
  try {
    const users = await User.find({ role: 'participant', _id: { $ne: req.user._id } })
      .select('-password')
      .limit(50);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/me/stats
router.get('/me/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedProblem teamId');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/me — the authenticated user's own full profile.
// MUST be declared before '/:id', otherwise 'me' is treated as an ObjectId
// and the request fails with "Cast to ObjectId failed for value 'me'".
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('selectedProblem', 'title domain')
      .populate('teamId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id — public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('selectedProblem', 'title domain');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/me — update own profile
router.put('/me', protect, async (req, res) => {
  try {
    // Allowlist only. teamId, role, password and isDemoAccount are never
    // writable here, so editing a profile cannot alter team membership.
    const allowedFields = ['name', 'bio', 'college', 'department', 'year', 'phone', 'githubUrl', 'linkedinUrl', 'portfolioUrl', 'skills', 'techSkills', 'softSkills', 'frameworks', 'tools', 'languages', 'technicalInterests', 'problemInterests', 'experience', 'projects'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Calculate profile strength
    const user = await User.findById(req.user._id);
    const merged = { ...user.toObject(), ...updates };
    const strength = Math.min(100, Math.round(
      (merged.name ? 10 : 0) + (merged.bio ? 10 : 0) + (merged.college ? 10 : 0) +
      (merged.department ? 10 : 0) + (merged.skills?.length > 0 ? 15 : 0) +
      (merged.githubUrl ? 10 : 0) + (merged.linkedinUrl ? 10 : 0) +
      (merged.selectedProblem ? 15 : 0) + (merged.teamId ? 10 : 0)
    ));
    updates.profileStrength = strength;
    updates.aiSkillScore = Math.min(99, 70 + (merged.skills?.length || 0) * 2);

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
