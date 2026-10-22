const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  submissionId: { type: String, unique: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['submitted', 'under_review', 'evaluated'], default: 'submitted' },
  autoEvalScore: Number,
  autoEvalDetails: mongoose.Schema.Types.Mixed,
  isLocked: { type: Boolean, default: true }
});

module.exports = mongoose.model('Submission', submissionSchema);
