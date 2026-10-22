/**
 * Idempotent demo seed for HackMatch AI
 *
 * Seeds or updates the 15 designated demo student accounts:
 *   1. Arjun       (arjun@hackmatch.ai)
 *   2. Priya       (priya@hackmatch.ai)
 *   3. Karthik     (karthik@hackmatch.ai)
 *   4. Meera       (meera@hackmatch.ai)
 *   5. Rahul       (rahul@hackmatch.ai)
 *   6. Sneha       (sneha@hackmatch.ai)
 *   7. Dhakshitha  (dhakshitha@hackmatch.ai)
 *   8. Ananya      (ananya@hackmatch.ai)
 *   9. Kiran       (kiran@hackmatch.ai)
 *  10. Kishor      (kishor@hackmatch.ai)
 *  11. Harnish     (harnish@hackmatch.ai)
 *  12. Divya       (divya@hackmatch.ai)
 *  13. Vikram      (vikram@hackmatch.ai)
 *  14. Pooja       (pooja@hackmatch.ai)
 *  15. Siddharth   (siddharth@hackmatch.ai)
 *
 * Plus official Judge: judge@hackmatch.ai (Judge@123)
 * Plus Admin: admin@hackmatch.ai (Admin@123)
 *
 * Password for all 15 student accounts: Demo@123
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const seedDemoUsers = async ({ reset = false } = {}) => {
  const User = require('../models/User');
  const Team = require('../models/Team');
  const CollaborationRequest = require('../models/CollaborationRequest');
  const Notification = require('../models/Notification');
  const ProblemStatement = require('../models/ProblemStatement');
  const Message = require('../models/Message');
  const Project = require('../models/Project');
  const Submission = require('../models/Submission');
  const Evaluation = require('../models/Evaluation');
  const Certificate = require('../models/Certificate');

  const { DEMO_USERS, DEMO_PASSWORD } = require('./demoUsers.data');

  if (mongoose.connection.readyState === 0) {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackmatch');
    console.log(`MongoDB connected for seeding: ${conn.connection.host}/${conn.connection.name}`);
  }

  const demoEmails = DEMO_USERS.map((u) => u.email.toLowerCase());

  // ------------------------------------------------------------- Problem Statements
  let problems = await ProblemStatement.find({});
  if (problems.length === 0) {
    console.log('Seeding initial problem statements...');
    const problemsData = [
      { problemId: 'PS001', title: 'Smart Healthcare AI Assistant', domain: 'AI', difficulty: 'Hard', organization: 'Ministry of Health', requiredSkills: ['AI', 'Python', 'React', 'MongoDB'] },
      { problemId: 'PS002', title: 'FinTech Fraud Detection', domain: 'FinTech', difficulty: 'Expert', organization: 'Reserve Bank', requiredSkills: ['Machine Learning', 'Python', 'Data Science'] },
      { problemId: 'PS003', title: 'Cybersecurity Threat Intelligence', domain: 'Cybersecurity', difficulty: 'Expert', organization: 'Cyber Defense Center', requiredSkills: ['Security', 'Python', 'Network'] },
      { problemId: 'PS004', title: 'Smart City Traffic Management', domain: 'IoT', difficulty: 'Medium', organization: 'City Council', requiredSkills: ['IoT', 'Node.js', 'React'] },
      { problemId: 'PS005', title: 'EdTech Personalized Learning', domain: 'Education', difficulty: 'Medium', organization: 'EduCorp', requiredSkills: ['React', 'Node.js', 'MongoDB'] },
      { problemId: 'PS006', title: 'AgriTech Crop Disease Detection', domain: 'Agriculture', difficulty: 'Hard', organization: 'Agri Dept', requiredSkills: ['AI', 'Python', 'React Native'] },
      { problemId: 'PS007', title: 'Carbon Footprint Tracker', domain: 'Sustainability', difficulty: 'Medium', organization: 'Green Earth', requiredSkills: ['Vue', 'Express', 'PostgreSQL'] },
      { problemId: 'PS008', title: 'Web3 Decentralized Voting', domain: 'Web3', difficulty: 'Expert', organization: 'Election Commission', requiredSkills: ['Solidity', 'React', 'Web3.js'] },
      { problemId: 'PS009', title: 'Mental Health Support Chatbot', domain: 'Healthcare', difficulty: 'Medium', organization: 'HealthFirst', requiredSkills: ['AI', 'NLP', 'React'] },
      { problemId: 'PS010', title: 'Supply Chain Blockchain', domain: 'FinTech', difficulty: 'Hard', organization: 'Logistics Inc', requiredSkills: ['Blockchain', 'Node.js', 'MongoDB'] },
      { problemId: 'PS011', title: 'Rural Telemedicine Platform', domain: 'Healthcare', difficulty: 'Hard', organization: 'Rural Health', requiredSkills: ['React', 'WebRTC', 'Node.js'] },
      { problemId: 'PS012', title: 'AI Code Review Assistant', domain: 'AI', difficulty: 'Medium', organization: 'DevTools', requiredSkills: ['AI', 'Python', 'GitHub API'] }
    ];
    problems = await ProblemStatement.insertMany(problemsData);
  }

  // ------------------------------------------------------------- Clean legacy @demo.com users
  const legacyDemoUsers = await User.find({ email: /@demo\.com$/i }).select('_id');
  if (legacyDemoUsers.length > 0) {
    const legacyIds = legacyDemoUsers.map((u) => u._id);
    await CollaborationRequest.deleteMany({
      $or: [{ sender: { $in: legacyIds } }, { receiver: { $in: legacyIds } }],
    });
    await Team.deleteMany({ 'members.user': { $in: legacyIds } });
    await Notification.deleteMany({ userId: { $in: legacyIds } });
    await Message.deleteMany({ sender: { $in: legacyIds } });
    await User.deleteMany({ _id: { $in: legacyIds } });
    console.log(`Cleaned up ${legacyDemoUsers.length} legacy @demo.com users from previous runs.`);
  }

  // ------------------------------------------------------------- Optional demo reset
  if (reset) {
    const existingDemo = await User.find({ email: { $in: demoEmails } }).select('_id');
    const demoIds = existingDemo.map((u) => u._id);
    await CollaborationRequest.deleteMany({
      $or: [{ sender: { $in: demoIds } }, { receiver: { $in: demoIds } }],
    });
    const demoTeams = await Team.find({ 'members.user': { $in: demoIds } }).select('_id');
    const teamIds = demoTeams.map((t) => t._id);
    await Team.deleteMany({ _id: { $in: teamIds } });
    await Project.deleteMany({ team: { $in: teamIds } });
    await Submission.deleteMany({ team: { $in: teamIds } });
    await Evaluation.deleteMany({ team: { $in: teamIds } });
    await Certificate.deleteMany({ user: { $in: demoIds } });
    await Message.deleteMany({ team: { $in: teamIds } });
    await User.updateMany({ _id: { $in: demoIds } }, { $unset: { teamId: 1 } });
    await Notification.deleteMany({ userId: { $in: demoIds } });
    console.log('Reset complete: cleared demo requests, teams, projects, and notifications.');
  }

  // ------------------------------------------------------------- Upsert 15 Demo Accounts
  let created = 0;
  let updated = 0;

  for (let i = 0; i < DEMO_USERS.length; i++) {
    const person = DEMO_USERS[i];
    const email = person.email.toLowerCase();
    const existing = await User.findOne({ email });

    const matchedProblem = problems.find(
      (p) => person.problemInterests && person.problemInterests.includes(p.domain)
    ) || problems[i % problems.length];

    if (existing) {
      existing.name = person.name;
      existing.department = person.department;
      existing.year = person.year;
      existing.college = person.college;
      existing.role = person.role || 'participant';
      existing.skills = person.skills;
      existing.techSkills = person.techSkills;
      existing.softSkills = person.softSkills;
      existing.frameworks = person.frameworks;
      existing.tools = person.tools;
      existing.languages = person.languages;
      existing.technicalInterests = person.technicalInterests;
      existing.problemInterests = person.problemInterests;
      existing.experience = person.experience;
      existing.projects = person.projects;
      existing.githubUrl = person.githubUrl;
      existing.linkedinUrl = person.linkedinUrl;
      existing.portfolioUrl = person.portfolioUrl;
      existing.bio = person.bio;
      existing.profileStrength = person.profileStrength;
      existing.aiSkillScore = person.aiSkillScore;
      existing.hackathonHistory = person.hackathonHistory;
      existing.achievements = person.achievements;
      existing.isDemoAccount = true;
      existing.password = DEMO_PASSWORD; // Triggers Mongoose pre('save') bcrypt hashing
      existing.selectedProblem = matchedProblem ? matchedProblem._id : undefined;

      // Validate teamId
      if (reset) {
        existing.teamId = null;
      } else if (existing.teamId) {
        const teamExists = await Team.findById(existing.teamId);
        if (!teamExists) {
          existing.teamId = null;
        }
      }

      await existing.save();
      updated++;
    } else {
      await User.create({
        ...person,
        password: DEMO_PASSWORD, // Triggers Mongoose pre('save') bcrypt hashing
        isDemoAccount: true,
        selectedProblem: matchedProblem ? matchedProblem._id : undefined
      });
      created++;
    }
  }

  console.log(`Users: ${created} created, ${updated} updated, ${DEMO_USERS.length} total demo accounts`);

  // Ensure Judge account exists
  const judgeEmail = 'judge@hackmatch.ai';
  let judge = await User.findOne({ email: judgeEmail });
  if (judge) {
    judge.name = 'Judge Official';
    judge.role = 'judge';
    judge.password = 'Judge@123';
    await judge.save();
    console.log('Judge account updated: judge@hackmatch.ai / Judge@123');
  } else {
    await User.create({
      name: 'Judge Official',
      email: judgeEmail,
      password: 'Judge@123',
      role: 'judge'
    });
    console.log('Judge account created: judge@hackmatch.ai / Judge@123');
  }

  // Ensure Admin account exists
  const adminEmail = 'admin@hackmatch.ai';
  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    admin.name = 'Administrator';
    admin.role = 'admin';
    admin.password = 'Admin@123';
    await admin.save();
    console.log('Admin account updated: admin@hackmatch.ai / Admin@123');
  } else {
    await User.create({
      name: 'Administrator',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('Admin account created: admin@hackmatch.ai / Admin@123');
  }

  // ------------------------------------------------------------- Dangling team check
  const allDemo = await User.find({ email: { $in: demoEmails } });
  for (const u of allDemo) {
    if (u.teamId) {
      const teamExists = await Team.findById(u.teamId);
      if (!teamExists) {
        await User.updateOne({ _id: u._id }, { $unset: { teamId: 1 } });
      }
    }
  }

  console.log('\n--- ⚡ HackMatch AI 15 Demo Accounts Seeded ---');
  for (const u of allDemo) {
    console.log(`  ${u.name.padEnd(14)} -> ${u.email.padEnd(26)} (${(u.skills || []).slice(0, 3).join(', ')})`);
  }
  console.log(`  Password for all : ${DEMO_PASSWORD}`);
  console.log('----------------------------------------------\n');

  return { success: true, count: allDemo.length };
};

// If run from command line:
if (require.main === module) {
  const reset = process.argv.includes('--reset');
  seedDemoUsers({ reset })
    .then(async () => {
      await mongoose.connection.close();
      console.log('Demo seed complete.\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Demo seed failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDemoUsers };
