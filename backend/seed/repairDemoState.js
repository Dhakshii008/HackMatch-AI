/**
 * Repairs demo data that a previous verification run left behind: a team that
 * no longer exists but is still referenced by a demo account, plus any stray
 * demo requests that are not part of the six seeded scenarios.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
const User = require('../models/User');
const Team = require('../models/Team');
const CollaborationRequest = require('../models/CollaborationRequest');

const SCENARIO_PAIRS = [
  ['priya@demo.com', 'karthik@demo.com'],
  ['dhakshitha@demo.com', 'arjun@demo.com'],
  ['meera@demo.com', 'rahul@demo.com'],
  ['sneha@demo.com', 'harish@demo.com'],
  ['karthik@demo.com', 'meera@demo.com'],
  ['arjun@demo.com', 'priya@demo.com'],
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Clear teamId on any demo account whose team document is gone.
  const demo = await User.find({ isDemoAccount: true, teamId: { $ne: null } });
  let cleared = 0;
  for (const u of demo) {
    const t = await Team.findById(u.teamId);
    if (!t) {
      await User.updateOne({ _id: u._id }, { $unset: { teamId: 1 } });
      console.log(`cleared dangling teamId on ${u.email}`);
      cleared++;
    }
  }

  // 2. Drop any request between demo accounts that is not one of the six.
  const strays = await CollaborationRequest.find({});
  let removed = 0;
  for (const r of strays) {
    const s = await User.findById(r.sender).select('email isDemoAccount');
    const rc = await User.findById(r.receiver).select('email isDemoAccount');
    if (!s?.isDemoAccount || !rc?.isDemoAccount) continue;
    const key = [s.email, rc.email];
    if (!SCENARIO_PAIRS.some(([a, b]) => a === key[0] && b === key[1])) {
      await CollaborationRequest.deleteOne({ _id: r._id });
      console.log(`removed stray request ${s.email} -> ${rc.email} (${r.status})`);
      removed++;
    }
  }

  console.log(`\ndangling teamIds cleared: ${cleared}`);
  console.log(`stray demo requests removed: ${removed}`);

  const teamed = await User.find({ isDemoAccount: true, teamId: { $ne: null } }).select('email');
  const reqs = await CollaborationRequest.find({});
  console.log(`\ndemo accounts in a team: ${teamed.length} (${teamed.map((u) => u.email).join(', ')})`);
  console.log(`total requests: ${reqs.length}`);
  await mongoose.disconnect();
})();