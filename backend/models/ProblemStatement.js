const mongoose = require('mongoose');

const problemStatementSchema = new mongoose.Schema({
  problemId: { type: String, unique: true },
  title: String,
  domain: { type: String, enum: ['AI', 'FinTech', 'Healthcare', 'Cybersecurity', 'IoT', 'SmartCities', 'Education', 'Agriculture', 'Sustainability', 'Web3'] },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'] },
  description: String,
  problemStatement: String,
  existingChallenges: [String],
  expectedSolution: String,
  requiredSkills: [String],
  technologies: [String],
  organization: String,
  expectedImpact: String,
  submissionRequirements: [String],
  evaluationCriteria: [{ criterion: String, weightage: Number }],
  maxTeamSize: { type: Number, default: 4 },
  participants: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProblemStatement', problemStatementSchema);
