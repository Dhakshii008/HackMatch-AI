const express = require('express');
const router = express.Router();
const CollaborationRequest = require('../models/CollaborationRequest');
const Notification = require('../models/Notification');
const Team = require('../models/Team');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Score how well the team's combined skills cover distinct areas, and produce a
// short human-readable summary. Stored on the team so the UI shows real data.
const buildTeamInsights = (members) => {
  const skillSets = members
    .map(m => (m.user?.skills || []).map(s => s.toLowerCase()))
    .filter(s => s.length);

  const union = new Set(skillSets.flat());
  const overlap = skillSets.reduce((sum, s) => sum + s.length, 0) - union.size;
  const coverage = union.size;
  // More unique skills + low duplication == better composed team.
  const compatibility = Math.min(
    99,
    Math.max(50, Math.round(55 + coverage * 4 - overlap * 3))
  );

  const leader = members[0]?.user?.name || 'The team';
  const summary = union.size
    ? `${leader} leads a team covering ${coverage} distinct skill${coverage > 1 ? 's' : ''}: ${Array.from(union).slice(0, 6).join(', ')}. ${overlap === 0 ? 'There is no skill duplication, so every member adds a distinct strength.' : `${overlap} overlapping skill${overlap > 1 ? 's' : ''} detected — consider rebalancing responsibilities.`}`
    : 'Add skills to member profiles to generate an AI compatibility analysis.';

  return { compatibilityScore: compatibility, aiSummary: summary };
};

/**
 * Per-pair relationship state between the authenticated user and a candidate.
 * This is deliberately derived from the database rather than stored on the
 * user, so a pair can never be permanently hidden from one side.
 *
 * AVAILABLE        no request yet
 * REQUEST_SENT     current user sent a request that is still pending
 * PENDING          current user received a request awaiting their decision
 * ACCEPTED         they are teammates
 * REJECTED         a past request between them was declined
 * ALREADY_TEAMMATE they already share a team (independent of any request)
 */
const relationshipStatus = ({ u, existingRequests, myTeamMembers, myTeamId, me }) => {
  // Every request row between these two people, newest first. A pair can have
  // more than one row (e.g. a rejected attempt and a later re-request).
  const pairs = existingRequests.filter(
    (r) =>
      (String(r.sender) === String(me) && String(r.receiver) === String(u._id)) ||
      (String(r.receiver) === String(me) && String(r.sender) === String(u._id))
  );

  // A live pending request always wins, otherwise a stale rejected row would
  // hide a request that was just re-sent.
  const pending = pairs.find((r) => r.status === 'pending');
  if (pending) {
    return String(pending.sender) === String(me) ? 'REQUEST_SENT' : 'PENDING';
  }
  if (pairs.some((r) => r.status === 'accepted')) return 'ACCEPTED';

  // Only report an existing team when the two are genuinely in the same team.
  // `!!u.teamId` alone would mark every teamed candidate as a teammate of a
  // teamless viewer, which hides the real Request button.
  const sharedTeam =
    myTeamMembers.has(String(u._id)) ||
    (!!myTeamId && !!u.teamId && String(myTeamId) === String(u.teamId));

  // Being teammates is a stronger, more useful fact than a past rejection, so
  // it is checked before REJECTED.
  if (sharedTeam) return 'ALREADY_TEAMMATE';
  if (pairs.some((r) => r.status === 'rejected')) return 'REJECTED';
  return 'AVAILABLE';
};

// GET /api/collaboration/matches — AI matched teammates
router.get('/matches', protect, async (req, res) => {
  try {
    // Find Teammates is driven by one source of truth: the User collection.
    // Every participant account that can actually log in is listed (minus the
    // signed-in account). The relationship with each person is reported per
    // pair instead of hiding candidates.
    const userFilter = {
      _id: { $ne: req.user._id },
      role: 'participant',
    };
    if (req.user.isDemoAccount) {
      userFilter.isDemoAccount = true;
    }

    const users = await User.find(userFilter).select('-password').sort({ createdAt: 1 });

    // Load this user's relationships once instead of per card.
    const existingRequests = await CollaborationRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    });

    const myTeamMembers = new Set();
    if (req.user.teamId) {
      const myTeam = await Team.findById(req.user.teamId).select('members');
      (myTeam?.members || []).forEach(m => myTeamMembers.add(String(m.user)));
    }

    const userSkills = (req.user.skills || []).map(s => s.toLowerCase());

    const matches = users.map(u => {
      const theirSkills = (u.skills || []).map(s => s.toLowerCase());
      let complementScore = 0;
      theirSkills.forEach(skill => {
        if (!userSkills.includes(skill)) complementScore += 10;
      });
      const overlapCount = theirSkills.filter(s => userSkills.includes(s)).length;
      const overlapBonus = Math.min(30, overlapCount * 5);
      const score = Math.min(99, Math.max(55, complementScore + overlapBonus + 40));
      const complementarity = Math.min(100, Math.round(50 + (complementScore / Math.max(1, theirSkills.length * 10)) * 50));

      const sameProblem = !!(u.selectedProblem && req.user.selectedProblem &&
        u.selectedProblem.toString() === req.user.selectedProblem.toString());

      const uniqueSkills = theirSkills.filter(s => !userSkills.includes(s));
      const sharedSkills = theirSkills.filter(s => userSkills.includes(s));
      // The UI renders these with .map(), so they must always be arrays.
      const reasons = uniqueSkills.length > 0
        ? [`Brings ${uniqueSkills.slice(0, 3).join(', ')} expertise you don't have — perfect complementarity!`]
        : [`Shares ${sharedSkills.slice(0, 2).join(', ')} knowledge for stronger collaboration.`];
      if (sameProblem) reasons.push('Already working on the same problem statement.');
      if (uniqueSkills.length) reasons.push(`You are missing ${uniqueSkills.length} skill${uniqueSkills.length > 1 ? 's' : ''} that this participant covers.`);
      if ((u.problemInterests || []).some(p => (req.user.problemInterests || []).includes(p))) {
        reasons.push('Shares an interest in the same problem domain.');
      }

      return {
        _id: u._id,
        user: u,
        score,
        matchScore: score,          // UI reads matchScore
        complementarity,            // UI reads complementarity
        roles: uniqueSkills.length ? uniqueSkills.slice(0, 2) : ['Full Stack Developer'],
        reasons,
        sameProblem,
        uniqueSkills,
        sharedSkills,
        status: relationshipStatus({ u, existingRequests, myTeamMembers, myTeamId: req.user.teamId, me: req.user._id })
      };
    }).sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/collaboration/requests — sent + received requests
router.get('/requests', protect, async (req, res) => {
  try {
    const sent = await CollaborationRequest.find({ sender: req.user._id })
      .populate('receiver', 'name email college department skills avatar')
      .populate('problem', 'title domain difficulty')
      .sort({ createdAt: -1 });
    const received = await CollaborationRequest.find({ receiver: req.user._id })
      .populate('sender', 'name email college department skills avatar')
      .populate('problem', 'title domain difficulty')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { sent, received } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/collaboration/requests/incoming — incoming requests only
router.get('/requests/incoming', protect, async (req, res) => {
  try {
    const received = await CollaborationRequest.find({ receiver: req.user._id })
      .populate('sender', 'name email college department skills avatar')
      .populate('problem', 'title domain difficulty')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: received });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/collaboration/requests/sent — sent requests only
router.get('/requests/sent', protect, async (req, res) => {
  try {
    const sent = await CollaborationRequest.find({ sender: req.user._id })
      .populate('receiver', 'name email college department skills avatar')
      .populate('problem', 'title domain difficulty')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/collaboration/request — send a request
router.post('/request', protect, async (req, res) => {
  try {
    const { receiverId, problemId, message } = req.body;

    if (!receiverId) return res.status(400).json({ success: false, message: 'Receiver ID required' });

    if (String(receiverId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot send a collaboration request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'That participant could not be found' });

    // Block duplicates in BOTH directions, not just sender→receiver, so a pair
    // can never end up with two competing pending requests.
    const pending = await CollaborationRequest.findOne({
      status: 'pending',
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ]
    });
    if (pending) {
      return res.status(400).json({
        success: false,
        message: pending.sender.toString() === String(req.user._id)
          ? 'Request already sent to this person'
          : 'This person has already sent you a request'
      });
    }

    // Already teammates? Reuse their team rather than creating a second one.
    if (req.user.teamId && String(receiver.teamId) === String(req.user.teamId)) {
      return res.status(400).json({ success: false, message: 'You are already teammates' });
    }

    // A previously rejected or accepted pair keeps ONE row per direction. A new
    // request re-opens that same row instead of stacking duplicates, so the
    // relationship history stays a single source of truth.
    const prior = await CollaborationRequest.findOne({
      sender: req.user._id,
      receiver: receiverId
    });

    let request;
    if (prior) {
      prior.status = 'pending';
      prior.message = message || prior.message;
      if (problemId || req.user.selectedProblem) prior.problem = problemId || req.user.selectedProblem;
      prior.respondedAt = null;
      await prior.save();
      request = prior;
    } else {
      request = await CollaborationRequest.create({
        sender: req.user._id,
        receiver: receiverId,
        problem: problemId || req.user.selectedProblem,
        message: message || 'Hi! I would love to collaborate with you on this hackathon.'
      });
    }

    await Notification.create({
      userId: receiverId,
      type: 'collaboration_request',
      title: 'New Collaboration Request',
      message: req.user.name + ' wants to collaborate with you!',
      data: { requestId: request._id }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('user_' + receiverId).emit('new_notification', {
        title: 'New Collaboration Request',
        message: req.user.name + ' wants to team up with you!',
        type: 'collaboration_request'
      });
    }

    res.status(201).json({ success: true, message: 'Collaboration request sent successfully!', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/collaboration/requests/:id/accept
router.put('/requests/:id/accept', protect, async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id).populate('sender receiver');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already ' + request.status });
    }

    // Guard the team merge BEFORE mutating anything. Without this, when both
    // users already belong to different teams the merge below would silently
    // rip the receiver out of their existing team and leave that team with a
    // dangling teamId on its remaining members.
    const senderTeam = request.sender.teamId ? String(request.sender.teamId) : null;
    const receiverTeam = request.receiver.teamId ? String(request.receiver.teamId) : null;
    if (senderTeam && receiverTeam && senderTeam !== receiverTeam) {
      return res.status(409).json({
        success: false,
        message:
          request.receiver.name.split(' ')[0] +
          ' is already in a team. Both of you need to leave your current teams before forming a new one.',
      });
    }

    request.status = 'accepted';
    await request.save();

    let team;
    // Create or merge team
    if (!senderTeam && !receiverTeam) {
      // Both teamless → create new team
      const teamName = 'Team ' + request.sender.name.split(' ')[0] + ' & ' + request.receiver.name.split(' ')[0];
      const code = 'HM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      team = await Team.create({
        name: teamName,
        teamCode: code,
        leader: request.sender._id,
        members: [{ user: request.sender._id, role: 'leader' }, { user: request.receiver._id, role: 'member' }],
        problem: request.problem || request.sender.selectedProblem
      });
      await User.findByIdAndUpdate(request.sender._id, { teamId: team._id });
      await User.findByIdAndUpdate(request.receiver._id, { teamId: team._id });
    } else if (senderTeam && receiverTeam) {
      // Both already on the SAME team (the differing-team case was rejected
      // above). Accepting again must be idempotent, not duplicate a member.
      team = await Team.findById(senderTeam);
    } else if (senderTeam) {
      // Sender has team → add receiver, but never twice.
      team = await Team.findById(senderTeam);
      const already = team && team.members.some(m => String(m.user) === String(request.receiver._id));
      if (!already) {
        team.members.push({ user: request.receiver._id, role: 'member' });
        await team.save();
      }
      await User.findByIdAndUpdate(request.receiver._id, { teamId: team._id });
    } else {
      // Receiver has team → add sender, but never twice.
      team = await Team.findById(receiverTeam);
      const already = team && team.members.some(m => String(m.user) === String(request.sender._id));
      if (!already) {
        team.members.push({ user: request.sender._id, role: 'member' });
        await team.save();
      }
      await User.findByIdAndUpdate(request.sender._id, { teamId: team._id });
    }

    if (!team) {
      return res.status(409).json({
        success: false,
        message: 'The existing team could not be found. Leave your team and try again.'
      });
    }

    // Ensure a starter project exists for the team so project & submission workflows are ready
    const Project = require('../models/Project');
    let project = await Project.findOne({ team: team._id });
    if (!project) {
      project = await Project.create({
        team: team._id,
        title: `${team.name} Solution`,
        description: 'AI-powered collaborative hackathon solution built with modern full-stack technologies.',
        problem: team.problem,
        techStack: ['React', 'Node.js', 'Python', 'Tailwind CSS', 'MongoDB'],
        githubUrl: 'https://github.com/hackmatch/demo-project',
        demoUrl: 'https://hackmatch-demo.vercel.app',
        videoUrl: 'https://youtube.com/watch?v=demo',
        innovation: 'Complementary AI multi-agent orchestration for hackathon matchmaking and real-time collaboration.',
        impact: 'Accelerates high-impact cross-functional team formation across universities.',
        futureScope: 'Global hackathon expansion, automated AI evaluation, and verified credentialing.'
      });
      team.projectId = project._id;
      await team.save();
    }

    // Notify sender
    await Notification.create({
      userId: request.sender._id,
      type: 'request_accepted',
      title: 'Collaboration Request Accepted!',
      message: request.receiver.name + ' accepted your request. Team created: ' + team.name,
      data: { teamId: team._id }
    });

    // Re-read the full roster (including any pre-existing members) so the
    // compatibility score and AI summary are computed from real data.
    const roster = await Team.findById(team._id).populate('members.user', 'name skills');
    if (roster) {
      const { compatibilityScore, aiSummary } = buildTeamInsights(roster.members || []);
      roster.compatibilityScore = compatibilityScore;
      roster.aiSummary = aiSummary;
      await roster.save();
      team = roster;
    }

    // Ensure an initial welcoming team message exists
    const Message = require('../models/Message');
    const existingMsg = await Message.findOne({ team: team._id });
    if (!existingMsg) {
      await Message.create({
        team: team._id,
        sender: request.sender._id,
        content: `Hey ${request.receiver.name.split(' ')[0]}! Collaboration request accepted. Let's build our hackathon project together! 🚀`,
        type: 'text'
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to('user_' + request.sender._id).emit('collaboration_accepted', {
        teamId: team._id,
        teamName: team.name,
        message: request.receiver.name + ' accepted your collaboration request!'
      });
      io.to('user_' + request.receiver._id).emit('collaboration_accepted', {
        teamId: team._id,
        teamName: team.name,
        message: 'You are now part of ' + team.name
      });
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email skills college department avatar')
      .populate('problem', 'title domain difficulty');
    res.status(200).json({ success: true, data: request, team: populatedTeam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/collaboration/requests/:id/reject
router.put('/requests/:id/reject', protect, async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already ' + request.status });
    }

    request.status = 'rejected';
    await request.save();

    await Notification.create({
      userId: request.sender,
      type: 'request_rejected',
      title: 'Collaboration Request Declined',
      message: req.user.name + ' has declined your collaboration request.'
    });

    res.status(200).json({ success: true, message: 'Collaboration request declined', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/collaboration/requests/:id — cancel a pending sent request
router.delete('/requests/:id', protect, async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot cancel request with status ' + request.status });
    }

    await CollaborationRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
