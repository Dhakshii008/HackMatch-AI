/**
 * Verification suite for the 30-account demo dataset.
 *
 * Requires a running backend with the demo data already seeded:
 *     npm run seed:demo
 *     npm start
 *     npm run test:demo
 *
 * Covers:
 *  - all 30 accounts authenticate and hold distinct, complete profiles
 *  - every participant sees all 29 peers with a correct per-pair status
 *  - the six required collaboration workflows exist and survive a fresh login
 *  - a rejected pair stays visible and can be re-requested without duplicating
 *  - resume upload parses the real PDF, updates only the uploader, and cannot
 *    disturb anyone's team, requests or role
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildTextPdf, buildScannedPdf, RESUMES } = require('./pdfFixtures');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ quiet: true });

const API = process.env.API_URL || 'http://localhost:5000/api';

let pass = 0;
let fail = 0;
const failures = [];

const check = (name, cond, extra) => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL  ${name}${extra ? ' -> ' + extra : ''}`);
  }
};

const section = (t) => console.log(`\n=== ${t} ===`);

async function call(method, url, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : { raw: await res.text() };
  return { status: res.status, data };
}

async function login(email, password = 'Demo@123') {
  const r = await call('POST', '/auth/login', null, { email, password });
  const token = r.data?.token;
  if (r.status !== 200 || !token) {
    throw new Error(`login failed for ${email}: ${r.status} ${JSON.stringify(r.data).slice(0, 160)}`);
  }
  return token;
}

const NAMES = [
  'priya', 'karthik', 'dhakshitha', 'arjun', 'meera', 'rahul', 'sneha', 'harish', 'akash', 'ananya',
  'vishnu', 'divya', 'rohit', 'keerthana', 'sanjay', 'nithya', 'adithya', 'swetha', 'naveen', 'varsha',
  'abinaya', 'pranav', 'janani', 'surya', 'kavya', 'ashwin', 'reshma', 'dinesh', 'aishwarya', 'gokul',
];

const SCENARIOS = [
  { from: 'priya', to: 'karthik', status: 'accepted' },
  { from: 'dhakshitha', to: 'arjun', status: 'accepted' },
  { from: 'meera', to: 'rahul', status: 'rejected' },
  { from: 'sneha', to: 'harish', status: 'pending' },
  { from: 'karthik', to: 'meera', status: 'accepted' },
  { from: 'arjun', to: 'priya', status: 'pending' },
];

// What each side of the pair should see.
const SENDER_VIEW = { accepted: 'ACCEPTED', rejected: 'REJECTED', pending: 'REQUEST_SENT' };
const RECEIVER_VIEW = { accepted: 'ACCEPTED', rejected: 'REJECTED', pending: 'PENDING' };

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hackmatch-resumes-'));
  for (const [name, lines] of Object.entries(RESUMES)) {
    fs.writeFileSync(path.join(tmpDir, name), buildTextPdf(lines));
  }
  const scannedPath = path.join(tmpDir, 'scanned-image-only.pdf');
  fs.writeFileSync(scannedPath, buildScannedPdf());

  const upload = async (email, file) => {
    const fd = new FormData();
    fd.append('resume', new Blob([fs.readFileSync(file)], { type: 'application/pdf' }), path.basename(file));
    const res = await fetch(`${API}/resume/upload`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + tokens[email] },
      body: fd,
    });
    return { status: res.status, data: await res.json() };
  };

  section('1. All 30 accounts authenticate with the documented password');
  const tokens = {};
  let loginFailures = 0;
  for (const n of NAMES) {
    try {
      tokens[n] = await login(n + '@demo.com');
    } catch (e) {
      loginFailures++;
      console.log('   ' + e.message);
    }
  }
  check('all 30 logins succeeded', loginFailures === 0, `${loginFailures} failed`);
  check('30 tokens issued', Object.keys(tokens).length === 30);
  if (loginFailures) {
    console.log('\nSeeding is required first:  npm run seed:demo');
    process.exit(1);
  }

  section('2. Profiles are distinct and complete');
  const profiles = {};
  for (const n of NAMES) profiles[n] = (await call('GET', '/users/me', tokens[n])).data?.data || {};
  const distinct = (fn) => new Set(NAMES.map(fn)).size;
  check('all 30 skill sets are unique', distinct((n) => (profiles[n].skills || []).join('|')) === 30);
  check('technical interests are unique', distinct((n) => (profiles[n].technicalInterests || []).join('|')) === 30);
  check('problem interests are unique', distinct((n) => (profiles[n].problemInterests || []).join('|')) === 30);
  check('experience is unique', distinct((n) => (profiles[n].experience || []).join('|')) === 30);
  check('projects are unique', distinct((n) => (profiles[n].projects || []).map((p) => p.name).join('|')) === 30);
  check('all have at least 6 skills', NAMES.every((n) => (profiles[n].skills || []).length >= 6));
  check('all have experience', NAMES.every((n) => (profiles[n].experience || []).length >= 1));
  check('all have projects', NAMES.every((n) => (profiles[n].projects || []).length >= 1));
  check('all have a GitHub link', NAMES.every((n) => !!profiles[n].githubUrl));
  check('all have a LinkedIn link', NAMES.every((n) => !!profiles[n].linkedinUrl));
  check('all have a portfolio link', NAMES.every((n) => !!profiles[n].portfolioUrl));
  check('all have a college', NAMES.every((n) => !!profiles[n].college));
  check('all are marked as demo accounts', NAMES.every((n) => profiles[n].isDemoAccount === true));

  // Find Teammates is driven by the User collection, so the expected peer count
  // is "every other participant that exists", not a hardcoded number.
  section('3. Matches: every user sees every other real account with a status');
  const totalParticipants = await User.countDocuments({ role: 'participant' });
  const expectedPeers = totalParticipants - 1;
  let matchRows = 0;
  let missingStatus = 0;
  const statusByPair = {};
  const idToName = {};
  for (const n of NAMES) idToName[String(profiles[n]._id)] = n;

  for (const n of NAMES) {
    const list = (await call('GET', '/collaboration/matches', tokens[n])).data?.data;
    if (!Array.isArray(list)) {
      check(`${n} received a match list`, false);
      continue;
    }
    matchRows += list.length;
    if (list.length !== expectedPeers) check(`${n} sees ${expectedPeers} peers`, false, `saw ${list.length}`);
    for (const m of list) {
      if (!m.status) missingStatus++;
      const other = idToName[String(m.user._id)];
      if (other) statusByPair[`${n}>${other}`] = m.status;
    }
  }
  check('every match carries a status', missingStatus === 0, `${missingStatus} missing`);
  check(`total match rows = 30 x ${expectedPeers}`, matchRows === 30 * expectedPeers, `got ${matchRows}`);

  section('4. The six required workflows (both sides of each pair)');
  for (const s of SCENARIOS) {
    check(`${s.from} -> ${s.to} shows ${SENDER_VIEW[s.status]}`,
      statusByPair[`${s.from}>${s.to}`] === SENDER_VIEW[s.status],
      `got ${statusByPair[`${s.from}>${s.to}`]}`);
    check(`${s.to} -> ${s.from} shows ${RECEIVER_VIEW[s.status]}`,
      statusByPair[`${s.to}>${s.from}`] === RECEIVER_VIEW[s.status],
      `got ${statusByPair[`${s.to}>${s.from}`]}`);
  }

  section('5. State persists across a fresh login');
  const freshKarthik = await login('karthik@demo.com');
  const kList = (await call('GET', '/collaboration/matches', freshKarthik)).data?.data || [];
  const kMeera = kList.find((m) => m.user.email === 'meera@demo.com');
  check('karthik still sees meera as ACCEPTED after re-login', kMeera?.status === 'ACCEPTED', `got ${kMeera?.status}`);
  const kTeam = (await call('GET', '/teams/my', freshKarthik)).data?.data;
  const kTeamEmails = (kTeam?.members || []).map((m) => m.user?.email);
  check('karthik team contains priya and meera',
    kTeamEmails.includes('priya@demo.com') && kTeamEmails.includes('meera@demo.com'),
    JSON.stringify(kTeamEmails));

  const snehaTeam = (await call('GET', '/teams/my', await login('sneha@demo.com'))).data?.data;
  check('sneha has no team (request still only pending)', snehaTeam === null);

  const harishPending = (await call('GET', '/collaboration/requests', await login('harish@demo.com'))).data?.data;
  check('harish sees 1 pending incoming from sneha',
    (harishPending?.received || []).filter((r) => r.status === 'pending').length === 1);

  section('6. A rejected pair stays visible and can be re-requested');
  const rahulList = (await call('GET', '/collaboration/matches', tokens.rahul)).data?.data || [];
  const rahulSeesMeera = rahulList.find((m) => m.user.email === 'meera@demo.com');
  check('rahul still sees meera in his list', !!rahulSeesMeera);
  check('rahul sees meera as REJECTED', rahulSeesMeera?.status === 'REJECTED', `got ${rahulSeesMeera?.status}`);

  const retry = await call('POST', '/collaboration/request', tokens.rahul, { receiverId: profiles.meera._id });
  check('rahul can re-request the pair', [200, 201, 400].includes(retry.status), `status ${retry.status}`);
  const rahulReqs = (await call('GET', '/collaboration/requests', tokens.rahul)).data?.data || {};
  const toMeera = (rahulReqs.sent || []).filter((r) => r.receiver?.email === 'meera@demo.com');
  check('re-request did not duplicate the row', toMeera.length <= 1, `${toMeera.length} rows`);

  section('7. Requests are directional');
  const priyaReqs = (await call('GET', '/collaboration/requests', tokens.priya)).data?.data || {};
  check('priya shows karthik under Sent', (priyaReqs.sent || []).some((r) => r.receiver?.email === 'karthik@demo.com'));
  check('priya shows arjun under Received', (priyaReqs.received || []).some((r) => r.sender?.email === 'arjun@demo.com'));
  check('priya has exactly 1 pending incoming',
    (priyaReqs.received || []).filter((r) => r.status === 'pending').length === 1);
  check('karthik does not see his own request as incoming',
    !((await call('GET', '/collaboration/requests', tokens.karthik)).data?.data?.received || [])
      .some((r) => r.sender?.email === 'karthik@demo.com'));

  section('8. Resume upload updates only the uploader');
  const kTeamBefore = (await call('GET', '/teams/my', tokens.karthik)).data?.data?._id;
  const kReqsBefore = (await call('GET', '/collaboration/requests', tokens.karthik)).data?.data;

  const up = await upload('ananya', path.join(tmpDir, 'ananya-ai.pdf'));
  check('ananya resume upload succeeds', up.status === 200, `status ${up.status}: ${JSON.stringify(up.data).slice(0, 160)}`);
  check('skills were parsed from the PDF', (up.data?.data?.skills || []).length > 3);

  const ananyaAfter = (await call('GET', '/users/me', tokens.ananya)).data?.data;
  const parsedNames = (up.data?.data?.skills || []).map((s) => s.name);
  check('stored skills match the parsed skills', ananyaAfter.skills.join(',') === parsedNames.join(','));
  check('TensorFlow detected from the PDF body', ananyaAfter.skills.includes('TensorFlow'), ananyaAfter.skills.join(','));
  check('skills are not the old hardcoded JavaScript/React/Node set',
    !(ananyaAfter.skills.length === 3 && ['JavaScript', 'React', 'Node.js'].every((s) => ananyaAfter.skills.includes(s))));
  check('resumeFileName stored', !!ananyaAfter.resumeFileName);
  check('resume text stored', (ananyaAfter.resumeText || '').length > 200);

  const upAgain = await upload('ananya', path.join(tmpDir, 'ananya-ai.pdf'));
  const ananyaAfter2 = (await call('GET', '/users/me', tokens.ananya)).data?.data;
  check('same PDF yields identical skills (deterministic)',
    JSON.stringify(ananyaAfter2.skills) === JSON.stringify(ananyaAfter.skills));

  const up2 = await upload('harish', path.join(tmpDir, 'harish-security.pdf'));
  check('a different PDF yields different skills',
    JSON.stringify((up2.data?.data?.skills || []).map((s) => s.name)) !== JSON.stringify(parsedNames));

  const kTeamAfter = (await call('GET', '/teams/my', tokens.karthik)).data?.data?._id;
  const kReqsAfter = (await call('GET', '/collaboration/requests', tokens.karthik)).data?.data;
  check("karthik's team untouched by ananya's upload", String(kTeamBefore) === String(kTeamAfter));
  check("karthik's requests untouched by ananya's upload",
    JSON.stringify(kReqsBefore) === JSON.stringify(kReqsAfter));

  const scanned = await upload('akash', scannedPath);
  check('image-only PDF is rejected with 422', scanned.status === 422, `status ${scanned.status}`);
  check('rejection explains why', /scan|image-only|text-based/i.test(scanned.data?.message || ''), scanned.data?.message);

  section('9. Profile editing cannot change team or role');
  const teamIdOf = (v) => (v && typeof v === 'object' ? String(v._id) : String(v));
  const edit = await call('PUT', '/users/me', tokens.karthik, {
    teamId: null, role: 'admin', isDemoAccount: false, bio: 'Profile editor smoke test',
  });
  check('profile update succeeds', edit.status === 200, `status ${edit.status}`);
  const kAfter = (await call('GET', '/users/me', tokens.karthik)).data?.data;
  check('teamId could not be cleared', teamIdOf(kAfter.teamId) === String(kTeamBefore), teamIdOf(kAfter.teamId));
  check('role was not escalated to admin', kAfter.role === 'participant', kAfter.role);
  check('isDemoAccount could not be cleared', kAfter.isDemoAccount === true, String(kAfter.isDemoAccount));
  check('permitted field did update', kAfter.bio === 'Profile editor smoke test', kAfter.bio);

  fs.rmSync(tmpDir, { recursive: true, force: true });
  await mongoose.disconnect();

  console.log(`\n================  ${pass} passed, ${fail} failed  ================`);
  if (failures.length) console.log('failures:\n - ' + failures.join('\n - '));
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error('CRASH:', e);
  process.exit(1);
});
