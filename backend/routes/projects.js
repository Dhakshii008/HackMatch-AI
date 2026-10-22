const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');

// A project is only writable by a member of the owning team. Judges and
// admins keep read-only access, so every mutating route goes through this.
const assertOwnsProject = async (req, res) => {
  if (!req.user.teamId) {
    res.status(403).json({ success: false, message: 'Join a team before editing a project' });
    return null;
  }
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return null;
  }
  if (String(project.team) !== String(req.user.teamId)) {
    res.status(403).json({ success: false, message: 'You can only edit your own team project' });
    return null;
  }
  return project;
};

const normaliseGithubUrl = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://github.com/${value.replace(/^\/+/, '')}`;
  return withScheme;
};

router.get('/my', protect, async (req, res) => {
  try {
    if (!req.user.teamId) return res.status(200).json({ success: true, data: null });
    const project = await Project.findOne({ team: req.user.teamId });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ success: false, message: 'Join a team before creating a project' });
    }
    // One project per team: return the existing one instead of duplicating.
    const existing = await Project.findOne({ team: req.user.teamId });
    if (existing) return res.status(200).json({ success: true, data: existing, alreadyExists: true });

    const project = await Project.create({ ...req.body, team: req.user.teamId });
    await Team.findByIdAndUpdate(req.user.teamId, { projectId: project._id });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const project = await assertOwnsProject(req, res);
    if (!project) return;

    // Only these fields may be set from the client; team/submission linkage is
    // server-owned and must not be reassignable.
    const allowed = ['title', 'description', 'problem', 'techStack', 'githubUrl', 'demoUrl', 'videoUrl', 'innovation', 'impact', 'futureScope'];
    for (const key of allowed) {
      if (req.body && req.body[key] !== undefined) project[key] = req.body[key];
    }
    if (project.githubUrl !== undefined) project.githubUrl = normaliseGithubUrl(project.githubUrl);

    await project.save();
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/github', protect, async (req, res) => {
  try {
    const project = await assertOwnsProject(req, res);
    if (!project) return;

    const githubUrl = normaliseGithubUrl(req.body?.githubUrl);
    if (!githubUrl) {
      return res.status(400).json({ success: false, message: 'A GitHub repository URL is required' });
    }
    project.githubUrl = githubUrl;
    // Only the link is stored. Live stars/forks/language would need the GitHub
    // API; inventing them here would show fake data to the participant.
    // `set(..., undefined)` is required for Mongoose nested paths.
    project.set('githubData', undefined);
    await project.save();
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
