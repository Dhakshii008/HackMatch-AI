const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const QRCode = require('qrcode');
const { protect, restrictTo } = require('../middleware/auth');
const { TIERS, TYPES, getTier, applyAwardToCertificate } = require('../utils/awards');

const clientBaseUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

// Generate QR for a certificate if missing
const ensureQR = async (cert) => {
  const targetUrl = `${clientBaseUrl()}/verify/${cert.certificateId}`;
  if (!cert.qrCode || cert.verificationUrl !== targetUrl) {
    cert.verificationUrl = targetUrl;
    cert.qrCode = await QRCode.toDataURL(cert.verificationUrl, {
      width: 250,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });
    await cert.save();
  }
  return cert;
};

// GET /api/certificates/my — get all certificates for current user
router.get('/my', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .populate('team', 'name teamCode')
      .sort({ awardScore: -1, issueDate: -1 });
    // Ensure all have QR codes
    const enriched = await Promise.all(certs.map(ensureQR));
    // Attach the resolved tier so the card styling/labels stay in sync with
    // the backend tier table.
    res.status(200).json({
      success: true,
      data: enriched.map((c) => ({ ...c.toObject(), award: getTier(c.type) })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/certificates/generate — generate/get certificate for user
router.post('/generate', protect, async (req, res) => {
  try {
    const cert = await Certificate.findOne({ user: req.user._id })
      .populate('team', 'name teamCode')
      .sort({ issueDate: -1 });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'No certificate found. Please submit your project first.' });
    }

    const enriched = await ensureQR(cert);
    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/certificates/award-tiers — the tier table, so the UI never hardcodes labels
router.get('/award-tiers', protect, (req, res) => {
  res.status(200).json({ success: true, data: TIERS });
});

// PUT /api/certificates/:id/award — judge/admin awards an Alternate Prize,
// Special Mention or Participation Award manually (overrides the score tier).
router.put('/:id/award', protect, restrictTo('judge', 'admin'), async (req, res) => {
  try {
    const { type, awardTitle, score, rank } = req.body || {};
    if (type && !TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${TYPES.join(', ')}` });
    }

    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });

    const tier = getTier(type || cert.type);
    const updated = await applyAwardToCertificate(Certificate, {
      certId: cert._id,
      type: tier.type,
      score,
      awardTitle,
      rank,
    });

    // Let the winner know their certificate was upgraded. A notification
    // failure must never roll back an award that is already saved.
    try {
      await Notification.create({
        userId: updated.user,
        type: 'award',
        title: `Congratulations! You have been awarded the ${updated.awardTitle}.`,
        message: updated.awardBlurb || tier.blurb,
        data: { certificateId: updated.certificateId, tier: updated.type }
      });
    } catch (notifyError) {
      console.error('Failed to create award notification:', notifyError.message);
    }

    const io = req.app.get('io');
    if (io) {
      io.to('user_' + updated.user).emit('award_announced', {
        certificateId: updated.certificateId,
        type: updated.type,
        awardTitle: updated.awardTitle,
        message: `Congratulations! You have been awarded the ${updated.awardTitle}.`
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/certificates/verify/:id — PUBLIC verification
router.get('/verify/:id', async (req, res) => {
  try {
    const rawId = (req.params.id || '').trim();
    if (!rawId) {
      return res.status(404).json({ success: false, valid: false, message: 'Certificate not found or revoked.' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(rawId);
    const cert = await Certificate.findOne(
      isObjectId
        ? { $or: [{ certificateId: rawId.toUpperCase() }, { certificateId: rawId }, { _id: rawId }] }
        : { $or: [{ certificateId: rawId.toUpperCase() }, { certificateId: rawId }] }
    )
      .populate('user', 'name email college department year')
      .populate('team', 'name teamCode');

    if (!cert || cert.isRevoked) {
      return res.status(404).json({ success: false, valid: false, message: 'Certificate not found or revoked.' });
    }

    const enriched = await ensureQR(cert);
    res.status(200).json({
      success: true,
      valid: true,
      data: enriched,
      award: getTier(enriched.type),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
