const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');

// A malformed id must not surface as a 500.
const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/messages/:teamId — get last 100 messages for a team
router.get('/:teamId', protect, async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!validId(teamId)) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify user is a member of this team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role === 'participant') {
      return res.status(403).json({ success: false, message: 'Not a team member' });
    }

    const messages = await Message.find({ team: teamId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/:teamId — send a message
router.post('/:teamId', protect, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!validId(teamId)) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content required' });
    }

    // Verify team membership — chat is restricted to accepted teammates.
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role === 'participant') {
      return res.status(403).json({ success: false, message: 'Only accepted teammates can chat in this team' });
    }

    const message = await Message.create({
      team: teamId,
      sender: req.user._id,
      content: content.trim(),
      type
    });

    const populated = await message.populate('sender', 'name email avatar');

    // Emit via Socket.IO to team room
    const io = req.app.get('io');
    if (io) io.to(`team_${teamId}`).emit('new_message', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
