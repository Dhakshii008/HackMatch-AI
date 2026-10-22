const mongoose = require('mongoose');
const evaluationSchema = new mongoose.Schema({
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scores: {
    innovation: { type: Number, min: 0, max: 20, default: 0 },
    technical: { type: Number, min: 0, max: 20, default: 0 },
    relevance: { type: Number, min: 0, max: 20, default: 0 },
    uiux: { type: Number, min: 0, max: 20, default: 0 },
    impact: { type: Number, min: 0, max: 20, default: 0 },
    presentation: { type: Number, min: 0, max: 20, default: 0 },
    scalability: { type: Number, min: 0, max: 20, default: 0 }
  },
  total: { type: Number, default: 0 },
  comments: { type: String, default: '' },
  feedback: { type: String, default: '' },
  finalRemarks: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  evaluatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
