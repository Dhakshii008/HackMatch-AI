const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const User = require('../models/User');
const { extractResume } = require('../services/resumeParser');

/**
 * POST /api/resume/upload
 *
 * Updates ONLY the authenticated user's own profile.
 *
 * It deliberately does not touch teamId, and creates no new user, so uploading
 * a resume can never delete previous requests, reset team relationships or drop
 * accepted teammates.
 */
router.post('/upload', protect, uploadResume, async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file' });

    filePath = req.file.path;

    const parsed = await extractResume(filePath);

    // A scanned/image-only PDF has no text layer, so there is nothing to
    // analyse. Say so explicitly instead of saving an empty profile.
    if (parsed.text.replace(/\s+/g, '').length < 30) {
      return res.status(422).json({
        success: false,
        message:
          'No readable text found in this PDF. It looks like a scanned or image-only document — please upload a text-based PDF (select "text" rather than "image" when exporting).',
      });
    }

    // `req.user._id` comes from the verified JWT, so this can only ever edit
    // the caller's own profile.
    const update = {
      resumeFileName: req.file.originalname,
      resumeUploadedAt: new Date(),
      resumeText: parsed.text.slice(0, 20000),
    };
    if (parsed.skills.length) update.skills = parsed.skills;
    if (parsed.languages.length) update.languages = parsed.languages;
    if (parsed.experience.length) update.experience = parsed.experience;
    if (parsed.summary) update.bio = parsed.summary;
    if (parsed.education.length) update.education = parsed.education;
    update.profileStrength = Math.min(
      100,
      35 + parsed.skills.length * 4 + parsed.experience.length * 5
    );
    update.aiSkillScore = Math.min(99, 50 + parsed.skills.length * 4);

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select('-password');

    res.status(200).json({
      success: true,
      message: `Resume parsed — ${parsed.skills.length} skills detected`,
      data: {
        skills: parsed.skills.map((name) => ({ name, score: parsed.skillScores[name] })),
        languages: parsed.languages,
        frameworks: parsed.frameworks,
        experience: parsed.experience,
        education: parsed.education,
        summary: parsed.summary,
        fileName: req.file.originalname,
        // Returned so the client can show the profile was updated in place.
        teamId: user?.teamId || null,
        profileStrength: user?.profileStrength,
      },
    });
  } catch (error) {
    console.error('Resume upload failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/** GET /api/resume/my — the caller's own parsed resume profile */
router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password skills languages experience education resumeFileName resumeUploadedAt profileStrength aiSkillScore'
    );
    res.status(200).json({
      success: true,
      data: {
        skills: user?.skills || [],
        languages: user?.languages || [],
        experience: user?.experience || [],
        fileName: user?.resumeFileName || null,
        uploadedAt: user?.resumeUploadedAt || null,
        profileStrength: user?.profileStrength || 0,
        aiSkillScore: user?.aiSkillScore || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
