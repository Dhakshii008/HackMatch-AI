const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamCode: { type: String, unique: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'Member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemStatement' },
  compatibilityScore: Number,
  aiSummary: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  isComplete: { type: Boolean, default: false },
  maxSize: { type: Number, default: 4 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
