const mongoose = require('mongoose');
const { TYPES } = require('../utils/awards');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  // Ordered weakest -> strongest so the list reads as a progression.
  type: { type: String, enum: TYPES, default: 'participation' },
  hackathonName: { type: String, default: "HackMatch AI 2026" },
  projectTitle: String,
  // Denormalised award copy so a certificate renders correctly even if the
  // tier table later changes.
  awardTitle: { type: String, default: 'Participation Award' },
  awardHeadline: { type: String, default: 'Participant' },
  awardBlurb: String,
  awardScore: Number,
  rank: Number,
  issueDate: { type: Date, default: Date.now },
  qrCode: String,
  verificationUrl: String,
  isRevoked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Certificate', certificateSchema);
