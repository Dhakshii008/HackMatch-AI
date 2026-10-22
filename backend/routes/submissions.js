const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/auth');
const { getTier } = require('../utils/awards');

router.post('/', protect, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ success: false, message: 'Join or create a team before submitting' });
    }

    const team = await Team.findById(req.user.teamId).populate('members.user');
    if (!team) return res.status(400).json({ success: false, message: 'Team not found. Form a team first.' });

    let project = await Project.findOne({ team: team._id });
    if (!project) {
      project = await Project.create({
        team: team._id,
        title: req.body.title || `${team.name} Solution`,
        description: req.body.description || 'AI-powered collaborative hackathon solution built with modern full-stack technologies.',
        problem: team.problem,
        techStack: ['React', 'Node.js', 'Python', 'Tailwind CSS', 'MongoDB'],
        githubUrl: req.body.githubUrl || 'https://github.com/hackmatch/demo-project',
        demoUrl: req.body.demoUrl || 'https://hackmatch-demo.vercel.app',
        videoUrl: req.body.videoUrl || 'https://youtube.com/watch?v=demo',
        innovation: req.body.innovation || 'Complementary AI multi-agent orchestration for hackathon matchmaking and real-time collaboration.',
      });
      team.projectId = project._id;
      await team.save();
    }

    // Idempotent: a repeated submit returns the existing submission instead of
    // creating a second one, so double-clicks can't corrupt the record.
    const existing = await Submission.findOne({ team: team._id });
    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        alreadySubmitted: true,
        message: 'This project was already submitted',
      });
    }

    // Persist whatever the participant typed on the submission form onto the project.
    const { githubUrl, demoUrl, videoUrl, presentationUrl, documentationUrl, innovation, title, description, techStack } = req.body || {};
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (videoUrl !== undefined) project.videoUrl = videoUrl;
    if (presentationUrl !== undefined) project.presentationUrl = presentationUrl;
    if (documentationUrl !== undefined) project.documentationUrl = documentationUrl;
    if (innovation !== undefined) project.innovation = innovation;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack && Array.isArray(techStack)) project.techStack = techStack;

    // Auto Eval (deterministic baseline score)
    let score = 50;
    if (project.innovation) score += 10;
    if (project.techStack && project.techStack.length) score += Math.min(10, project.techStack.length * 2);
    if (project.githubUrl) score += 10;
    if (project.impact) score += 10;
    if (project.futureScope) score += 10;

    const submission = await Submission.create({
      team: team._id,
      project: project._id,
      submissionId: 'HM-2026-' + Date.now().toString(36).toUpperCase().slice(-6),
      submittedBy: req.user._id,
      status: 'submitted',
      autoEvalScore: score
    });

    project.isSubmitted = true;
    project.submittedAt = new Date();
    await project.save();

    // Certificates + notifications for every accepted team member.
    // These MUST be awaited, otherwise the response returns before the
    // certificates exist and the Certificates page shows an empty list.
    const members = team.members.filter(m => m.user && m.user._id);

    // Everybody starts on a Participation Award; the judge evaluation later
    // upgrades it to an Alternate Prize / Special Mention in place.
    const openingTier = getTier('participation');

    for (const m of members) {
      try {
        await Notification.create({
          userId: m.user._id,
          type: 'submitted',
          title: 'Project Submitted',
          message: 'Your team project has been submitted successfully.',
          data: { submissionId: submission._id, teamId: team._id }
        });

        // Keyed on user+submission only. Including `type` here would let a
        // second certificate be created after the tier was upgraded.
        const alreadyHas = await Certificate.findOne({
          user: m.user._id,
          submission: submission._id,
        });
        if (!alreadyHas) {
          const cert = await Certificate.create({
            certificateId: 'CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(),
            user: m.user._id,
            team: team._id,
            submission: submission._id,
            type: openingTier.type,
            awardTitle: openingTier.label,
            awardHeadline: openingTier.headline,
            awardBlurb: openingTier.blurb,
            awardScore: score,
            projectTitle: project.title,
          });
          // Verification URL can only be built once the certificateId exists.
          const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
          await Certificate.updateOne(
            { _id: cert._id },
            { $set: { verificationUrl: `${baseUrl}/verify/${cert.certificateId}` } }
          );

          // Tell the participant their certificate is ready to view.
          try {
            await Notification.create({
              userId: m.user._id,
              type: 'certificate_ready',
              title: 'Your Certificate is Ready',
              message: `${openingTier.label} issued for "${project.title}". Judges can still upgrade it to an Alternate Prize or Special Mention.`,
              data: { certificateId: cert.certificateId, submissionId: submission._id }
            });
          } catch (notifyError) {
            console.error('Failed to create certificate notification:', notifyError.message);
          }
        }
      } catch (memberError) {
        console.error('Failed to issue certificate for member:', memberError.message);
      }
    }

    const io = req.app.get('io');
    if (io) {
      for (const m of members) {
        io.to('user_' + m.user._id).emit('project_submitted', {
          submissionId: submission.submissionId,
          projectTitle: project.title,
        });
      }
    }

    res.status(201).json({ success: true, data: submission, alreadySubmitted: false });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const sub = await Submission.findOne({ team: req.user.teamId }).populate('project');
    res.status(200).json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, restrictTo('admin', 'judge'), async (req, res) => {
  try {
    const subs = await Submission.find()
      .populate({
        path: 'team',
        populate: [
          { path: 'members.user', select: 'name email role college department year skills avatar' },
          { path: 'problem', select: 'title domain difficulty organization' }
        ]
      })
      .populate({
        path: 'project',
        populate: { path: 'problem', select: 'title domain difficulty organization' }
      })
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, count: subs.length, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
