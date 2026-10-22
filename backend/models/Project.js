const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  title: String,
  description: String,
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemStatement' },
  solution: String,
  innovation: String,
  techStack: [String],
  architecture: String,
  features: [String],
  impact: String,
  futureScope: String,
  githubUrl: String,
  demoUrl: String,
  videoUrl: String,
  presentationUrl: String,
  documentationUrl: String,
  githubData: {
    name: String,
    description: String,
    stars: Number,
    forks: Number,
    language: String,
    lastUpdated: Date,
    branches: [String]
  },
  isSubmitted: { type: Boolean, default: false },
  submittedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
