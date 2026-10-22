const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });
    
    user = await User.create({ name, email, password, role });
    const token = signToken(user._id, user.email, user.role);
    
    res.status(201).json({ success: true, token, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/auth/accounts
 *
 * The single source of truth for "who exists and can log in". Read straight from
 * the User collection, so the login shortcuts, Find Teammates and the request
 * flow can never drift apart or show a fabricated account.
 *
 * An account qualifies only when it exists AND stores a real bcrypt hash —
 * i.e. it is genuinely able to authenticate. The hash itself is never returned.
 */
router.get('/accounts', async (req, res) => {
  try {
    const { DEMO_USERS } = require('../seed/demoUsers.data');
    const DEMO_EMAILS = DEMO_USERS.map((u) => u.email.toLowerCase());

    const users = await User.find({
      email: { $in: DEMO_EMAILS }
    }).select('+password name email role department college skills avatar teamId isDemoAccount');

    // Consistent ordering matching DEMO_USERS list
    users.sort((a, b) => {
      const idxA = DEMO_EMAILS.indexOf(a.email.toLowerCase());
      const idxB = DEMO_EMAILS.indexOf(b.email.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    const accounts = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || '',
      college: u.college || '',
      skills: Array.isArray(u.skills) ? u.skills.slice(0, 4) : [],
      hasTeam: !!u.teamId,
      canLogin: true,
      demoPassword: 'Demo@123',
    }));

    res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Ensure teamId is in sync
    if (!user.teamId) {
      const Team = require('../models/Team');
      const team = await Team.findOne({ 'members.user': user._id });
      if (team) {
        user.teamId = team._id;
        await User.findByIdAndUpdate(user._id, { teamId: team._id });
      }
    }

    const token = signToken(user._id, user.email, user.role);
    user.password = undefined;
    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user.teamId) {
      const Team = require('../models/Team');
      const team = await Team.findOne({ 'members.user': req.user._id });
      if (team) {
        req.user.teamId = team._id;
        await User.findByIdAndUpdate(req.user._id, { teamId: team._id });
      }
    }
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
