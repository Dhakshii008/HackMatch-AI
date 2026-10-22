const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');

router.get('/my', protect, async (req, res) => {
  try {
    let teamId = req.user.teamId;
    if (!teamId) {
      const User = require('../models/User');
      const team = await Team.findOne({ 'members.user': req.user._id });
      if (team) {
        teamId = team._id;
        await User.findByIdAndUpdate(req.user._id, { teamId: team._id });
      }
    }
    if (!teamId) return res.status(200).json({ success: true, data: null });
    const team = await Team.findById(teamId).populate('members.user leader problem');
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('members.user leader');
    if (!team) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Not found' });
    if (team.leader.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    
    if (req.body.name) team.name = req.body.name;
    await team.save();
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/invite', protect, async (req, res) => {
  res.status(200).json({ success: true, message: 'Invited' });
});

module.exports = router;
