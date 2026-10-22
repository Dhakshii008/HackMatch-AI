const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['participant', 'judge', 'admin'], default: 'participant' },
  college: String,
  department: String,
  year: String,
  phone: String,
  bio: String,
  avatar: String,
  skills: [String],
  techSkills: [String],
  softSkills: [String],
  frameworks: [String],
  tools: [String],
  languages: [String],
  githubUrl: String,
  linkedinUrl: String,
  portfolioUrl: String,
  // Technical interests beyond declared skills (free-form domains/tools).
  technicalInterests: [String],
  // Problem-statement areas the participant wants to work on.
  problemInterests: [String],
  // Resume / project background used to explain a match to the participant.
  experience: [String],
  projects: [{ name: String, description: String, tech: [String], link: String }],
  resumeFileName: String,
  resumeUploadedAt: Date,
  // Extracted resume text, kept so skills can be re-derived without re-upload.
  resumeText: String,
  isDemoAccount: { type: Boolean, default: false },
  aiSkillScore: { type: Number, default: 0 },
  profileStrength: { type: Number, default: 0 },
  selectedProblem: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemStatement' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  hackathonHistory: [{ name: String, year: String, result: String }],
  achievements: [String],
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
