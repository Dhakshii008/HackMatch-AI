/**
 * Verifies the requirement that Find Teammates only ever shows accounts that
 * can genuinely log in, and that the full
 *
 *   Login A -> Find Teammates -> Send request to B -> Logout -> Login B
 *   -> Team Requests -> Accept -> Both are Teammates
 *
 * flow works using real saved credentials, with the request bound to the
 * correct sender and receiver.
 *
 * Run:  npm run seed:demo   (or seedData)  then  npm run test:accounts
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
const User = require('../models/User');
const Team = require('../models/Team');
const CollaborationRequest = require('../models/CollaborationRequest');

const API = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
const check = (label, cond, extra = '') => {
  if (cond) { passed++; console.log(`  PASS  ${label}`); }
  else { failed++; console.log(`  FAIL  ${label}${extra ? ` -> ${extra}` : ''}`); }
};

const api = async (method, url, token, body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : {};
  return { status: res.status, data };
};

const login = async (email, password) =>
  api('POST', '/auth/login', null, { email, password });

(async () => {
  // Resolve each account's real password by verifying against its own hash, so
  // this test can never be fooled by a stale credential list.
  const resolvePassword = async (user) => {
    const first = user.name.split(' ')[0];
    const candidates = new Set(['Demo@123', 'Judge@123', 'Admin@123']);
    for (let len = first.length; len >= 3; len--) candidates.add(`${first.slice(0, len)}@123`);
    for (const c of candidates) {
      if (await bcrypt.compare(c, user.password)) return c;
    }
    return null;
  };

  await mongoose.connect(process.env.MONGODB_URI);
  const allUsers = await User.find({}).select('+password');
  const participants = allUsers.filter((u) => u.role === 'participant');

  console.log(`\nDatabase has ${allUsers.length} accounts (${participants.length} participants)\n`);

  // ---------------------------------------------------------------- Step 1
  console.log('=== 1. Every account can actually log in with saved credentials ===');
  const creds = new Map();
  for (const u of allUsers) {
    const pw = await resolvePassword(u);
    if (!pw) { check(`${u.email} has a working password`, false, 'no password matched its hash'); continue; }
    const r = await login(u.email, pw);
    if (r.status === 200 && r.data.token) creds.set(u.email, { token: r.data.token, password: pw, user: u });
    else check(`${u.email} can log in`, false, `HTTP ${r.status}`);
  }
  check(`all ${allUsers.length} accounts authenticate`, creds.size === allUsers.length, `${creds.size}/${allUsers.length}`);
  const loginableEmails = new Set(creds.keys());
  console.log();

  // ---------------------------------------------------------------- Step 2
  console.log('=== 2. /auth/accounts exposes only real, loginable accounts ===');
  const accRes = await api('GET', '/auth/accounts');
  check('GET /auth/accounts returns 200', accRes.status === 200);
  const listed = accRes.data.data || [];
  check('listed count matches 15 demo accounts', listed.length === 15, `${listed.length} vs 15`);
  check('every listed account exists in the DB', listed.every((a) => loginableEmails.has(a.email)));
  check('every listed email is unique', new Set(listed.map((a) => a.email)).size === listed.length);
  check('every listed account has a proven demoPassword', listed.every((a) => typeof a.demoPassword === 'string' && a.demoPassword.length > 0));
  const hashLeak = listed.some((a) => 'password' in a);
  check('no password hash is exposed', !hashLeak);
  console.log();

  // ---------------------------------------------------------------- Step 3
  console.log('=== 3. Find Teammates shows only real accounts (for every participant) ===');
  // A snapshot of what each account is shown, so cross-leakage can be checked.
  const shownTo = new Map();
  for (const u of participants) {
    const c = creds.get(u.email);
    if (!c) continue;
    const list = (await api('GET', '/collaboration/matches', c.token)).data?.data || [];
    shownTo.set(u.email, list);
    const emails = list.map((m) => m.user.email);
    check(`${u.email}: nobody shown who cannot log in`, emails.every((e) => loginableEmails.has(e)),
      emails.filter((e) => !loginableEmails.has(e)).join(', '));
    check(`${u.email}: self is excluded`, !emails.includes(u.email));
    const expected = participants.filter((p) => String(p._id) !== String(u._id)).map((p) => p.email);
    check(`${u.email}: shows every other real participant (${expected.length})`,
      expected.every((e) => emails.includes(e)), `missing: ${expected.filter((e) => !emails.includes(e)).join(', ')}`);
    check(`${u.email}: no unknown accounts present`, emails.every((e) => expected.includes(e)),
      `extra: ${emails.filter((e) => !expected.includes(e)).join(', ')}`);
  }
  console.log();

  // ------------------------------------------------- Steps 4-12: full flow
  console.log('=== 4. Full A -> B -> Accept -> Teammates flow (real credentials) ===');
  // Use two teamless accounts so a brand new team is genuinely created.
  const candidates = participants
    .filter((u) => !u.teamId)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const A = candidates[0];
  const B = candidates[1];
  console.log(`  Account A = ${A.email}`);
  console.log(`  Account B = ${B.email}\n`);

  // Clean slate for this pair only.
  await CollaborationRequest.deleteMany({
    $or: [
      { sender: A._id, receiver: B._id },
      { sender: B._id, receiver: A._id },
    ],
  });

  // Step 1: login as A
  const aLogin = await login(A.email, creds.get(A.email).password);
  check('step 1: Account A logs in with saved credentials', aLogin.status === 200 && !!aLogin.data.token);
  const tokenA = aLogin.data.token;

  // Step 2/3: B appears in A's Find Teammates
  const aMatches = (await api('GET', '/collaboration/matches', tokenA)).data?.data || [];
  const bCard = aMatches.find((m) => String(m.user._id) === String(B._id));
  check('step 3: Account B appears in A\'s Find Teammates', !!bCard);
  check('step 3: B starts as AVAILABLE for A', bCard?.status === 'AVAILABLE', bCard?.status);

  // Step 4/5: A sends the request
  const sendRes = await api('POST', '/collaboration/request', tokenA, {
    receiverId: String(B._id),
    message: 'Let us build this together.',
  });
  check('step 4/5: A sends a teammate request to B', sendRes.status === 201, `HTTP ${sendRes.status}`);
  check('request is saved against the correct sender', String(sendRes.data?.data?.sender) === String(A._id));
  check('request is saved against the correct receiver', String(sendRes.data?.data?.receiver) === String(B._id));

  // Step 6: A logs out (token discarded); confirm state survived server-side.
  await api('POST', '/auth/logout', tokenA);
  const persisted = await CollaborationRequest.findOne({ sender: A._id, receiver: B._id });
  check('step 6: request persists after A logs out', !!persisted && persisted.status === 'pending');

  // Step 7: B logs in
  const bLogin = await login(B.email, creds.get(B.email).password);
  check('step 7: Account B logs in with saved credentials', bLogin.status === 200 && !!bLogin.data.token);
  const tokenB = bLogin.data.token;

  // Step 8/9: B sees the request in Team Requests
  const bReqs = (await api('GET', '/collaboration/requests', tokenB)).data?.data || {};
  const incoming = (bReqs.received || []).find((r) => String(r.sender?._id || r.sender) === String(A._id));
  check('step 9: B sees the request sent by A', !!incoming);
  check('step 9: it arrives as pending', incoming?.status === 'pending', incoming?.status);

  // Bound to the right receiver: no other participant should have received it.
  const leaked = [];
  for (const u of participants) {
    if (String(u._id) === String(B._id)) continue;
    const c = creds.get(u.email);
    if (!c) continue;
    const rq = (await api('GET', '/collaboration/requests', c.token)).data?.data || {};
    const hit = (rq.received || []).find((r) => String(r.sender?._id || r.sender) === String(A._id));
    if (hit) leaked.push(u.email);
  }
  check('step 9: no other account (e.g. Account C) received this request', leaked.length === 0, leaked.join(', '));

  // Step 10/11: B accepts
  const accResFlow = await api('PUT', `/collaboration/requests/${incoming._id}/accept`, tokenB);
  check('step 10: B clicks Accept', accResFlow.status === 200, `HTTP ${accResFlow.status} ${JSON.stringify(accResFlow.data).slice(0, 80)}`);

  const dbReq = await CollaborationRequest.findById(incoming._id);
  check('step 11: the request is now Accepted', dbReq?.status === 'accepted', dbReq?.status);

  // Step 12: both are teammates
  const team = await Team.findById(dbReq && (accResFlow.data?.data?.team?._id || accResFlow.data?.data?.team?._id));
  const teamId = accResFlow.data?.data?.team?._id;
  const savedTeam = teamId ? await Team.findById(teamId) : await Team.findOne({ 'members.user': { $in: [A._id, B._id] } });
  check('step 12: a team exists containing both', !!(savedTeam && savedTeam.members.some(m => String(m.user) === String(A._id)) && savedTeam.members.some(m => String(m.user) === String(B._id))));
  const teamMemberCount = savedTeam ? savedTeam.members.length : 0;
  check('step 12: no duplicate members in the team', new Set(savedTeam.members.map(m => String(m.user))).size === teamMemberCount, `${teamMemberCount} entries`);
  const freshA = await User.findById(A._id);
  const freshB = await User.findById(B._id);
  check('step 12: both accounts now carry the same teamId', !!freshA.teamId && String(freshA.teamId) === String(freshB.teamId));

  // Both sides now report teammates in Find Teammates.
  const aAfter = (await api('GET', '/collaboration/matches', creds.get(A.email).token)).data?.data || [];
  const bAfter = (await api('GET', '/collaboration/matches', tokenB)).data?.data || [];
  const aSeesB = aAfter.find((m) => String(m.user._id) === String(B._id));
  const bSeesA = bAfter.find((m) => String(m.user._id) === String(A._id));
  check('step 12: A sees B as ACCEPTED/teammate', ['ACCEPTED', 'ALREADY_TEAMMATE'].includes(aSeesB?.status), aSeesB?.status);
  check('step 12: B sees A as ACCEPTED/teammate', ['ACCEPTED', 'ALREADY_TEAMMATE'].includes(bSeesA?.status), bSeesA?.status);
  check('both are listed on each other\'s Teammates', !!aSeesB && !!bSeesA);

  // ------------------------------------------------------- cleanup
  // Leave the seeded scenarios exactly as they were: remove the request, the
  // team this test created, and BOTH accounts' teamId (clearing only the
  // receiver would strand the sender with a dangling team reference).
  await CollaborationRequest.deleteMany({ sender: A._id, receiver: B._id });
  await User.updateMany({ _id: { $in: [A._id, B._id] } }, { $unset: { teamId: 1 } });
  if (savedTeam) await Team.deleteOne({ _id: savedTeam._id });

  const strayA = await User.findById(A._id).select('teamId');
  const strayB = await User.findById(B._id).select('teamId');
  check('cleanup: neither account is left with a dangling teamId', !strayA?.teamId && !strayB?.teamId,
    `A=${strayA?.teamId} B=${strayB?.teamId}`);

  await mongoose.disconnect();

  console.log(`\n======================================================`);
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(`======================================================`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((err) => {
  console.error('\nTest crashed:', err);
  process.exit(1);
});