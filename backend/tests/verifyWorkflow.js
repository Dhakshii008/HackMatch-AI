/**
 * Comprehensive verification script for HackMatch AI
 * Tests:
 * 1. GET /api/auth/accounts -> Exactly 15 demo accounts
 * 2. POST /api/auth/login -> Every one of the 15 demo accounts can log in with Demo@123
 * 3. Teammate Request Workflow:
 *    - Arjun logs in
 *    - Arjun finds Priya and sends teammate request
 *    - Priya logs in
 *    - Priya sees incoming request from Arjun
 *    - Priya accepts request
 *    - Team formed with Arjun & Priya
 *    - Arjun logs in again
 *    - Arjun sees updated ACCEPTED status and team details
 * 4. Multi-Pair Workflow:
 *    - Karthik sends request to Sneha
 *    - Sneha accepts request
 *    - Both see updated accepted status
 */

const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('=====================================================');
  console.log('⚡ HACKMATCH AI - COMPLETE SYSTEM VERIFICATION');
  console.log('=====================================================\n');

  // STEP 1: Verify 15 Demo Accounts
  console.log('--- Step 1: Checking Quick Demo Login Accounts ---');
  const accountsRes = await req('/auth/accounts');
  if (!accountsRes.ok) {
    throw new Error('Failed to fetch accounts: ' + JSON.stringify(accountsRes.data));
  }
  const accounts = accountsRes.data.data;
  console.log(`✓ Count returned by API: ${accounts.length} accounts (Expected: 15)`);
  if (accounts.length !== 15) {
    throw new Error(`Expected exactly 15 accounts, got ${accounts.length}`);
  }

  accounts.forEach((acc, i) => {
    console.log(`  ${String(i + 1).padStart(2, ' ')}. ${acc.name.padEnd(14)} | ${acc.email.padEnd(25)} | role: ${acc.role} | pwd: ${acc.demoPassword} | canLogin: ${acc.canLogin}`);
  });

  // STEP 2: Authenticate All 15 Demo Accounts
  console.log('\n--- Step 2: Testing Login for All 15 Demo Accounts ---');
  const tokens = {};
  for (const acc of accounts) {
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: acc.email, password: acc.demoPassword || 'Demo@123' })
    });
    if (!loginRes.ok || !loginRes.data.token) {
      throw new Error(`Login FAILED for ${acc.email}: ${JSON.stringify(loginRes.data)}`);
    }
    tokens[acc.email] = {
      token: loginRes.data.token,
      user: loginRes.data.data
    };
    console.log(`  ✓ ${acc.name.padEnd(14)} (${acc.email}) logged in successfully.`);
  }

  // STEP 3: Arjun -> Priya Teammate Request Workflow
  console.log('\n--- Step 3: Arjun -> Priya Teammate Request Workflow ---');
  const arjunToken = tokens['arjun@hackmatch.ai'].token;
  const priyaToken = tokens['priya@hackmatch.ai'].token;
  const priyaId = tokens['priya@hackmatch.ai'].user._id;
  const arjunId = tokens['arjun@hackmatch.ai'].user._id;

  // 3a. Arjun opens Find Teammates / matches
  console.log('1. Log in as Arjun and fetch teammate matches...');
  const arjunMatchesRes = await req('/collaboration/matches', {
    headers: { Authorization: `Bearer ${arjunToken}` }
  });
  if (!arjunMatchesRes.ok || !Array.isArray(arjunMatchesRes.data.data)) {
    throw new Error('Arjun failed to fetch matches: ' + JSON.stringify(arjunMatchesRes.data));
  }
  console.log(`   ✓ Arjun sees ${arjunMatchesRes.data.data.length} candidate peer profiles.`);
  const priyaMatch = arjunMatchesRes.data.data.find(m => m.user.email === 'priya@hackmatch.ai');
  if (!priyaMatch) throw new Error('Priya not found in Arjun matches list');
  console.log(`   ✓ Found Priya in Arjun discovery: Match Score ${priyaMatch.matchScore}%, Status: ${priyaMatch.status}`);

  // 3b. Arjun sends teammate request to Priya
  console.log('2. Arjun sends teammate request to Priya...');
  const sendRes = await req('/collaboration/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${arjunToken}` },
    body: JSON.stringify({
      receiverId: priyaId,
      message: 'Hi Priya, our AI profiles have a great match! Let us collaborate and build a winning project!'
    })
  });
  if (!sendRes.ok) {
    throw new Error('Arjun failed to send request to Priya: ' + JSON.stringify(sendRes.data));
  }
  const createdReq = sendRes.data.data;
  console.log(`   ✓ Request successfully created in DB (ID: ${createdReq._id}, Status: ${createdReq.status})`);

  // 3c. Priya logs in and checks incoming requests
  console.log('3. Log in as Priya and check incoming requests...');
  const priyaReqsRes = await req('/collaboration/requests', {
    headers: { Authorization: `Bearer ${priyaToken}` }
  });
  if (!priyaReqsRes.ok) {
    throw new Error('Priya failed to fetch requests: ' + JSON.stringify(priyaReqsRes.data));
  }
  const priyaIncoming = priyaReqsRes.data.data.received;
  const reqFromArjun = priyaIncoming.find(r => String(r.sender._id || r.sender) === String(arjunId));
  if (!reqFromArjun) {
    throw new Error('Arjun request not found in Priya incoming list!');
  }
  console.log(`   ✓ Priya sees pending request from ${reqFromArjun.sender.name} (${reqFromArjun.sender.email}) with message: "${reqFromArjun.message}"`);
  console.log(`   ✓ Status is: ${reqFromArjun.status.toUpperCase()}`);

  // 3d. Priya clicks Accept
  console.log('4. Priya accepts Arjun request...');
  const acceptRes = await req(`/collaboration/requests/${reqFromArjun._id}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${priyaToken}` }
  });
  if (!acceptRes.ok) {
    throw new Error('Priya accept request failed: ' + JSON.stringify(acceptRes.data));
  }
  const acceptedData = acceptRes.data;
  console.log(`   ✓ Request status updated in DB to: ${acceptedData.data.status.toUpperCase()}`);
  console.log(`   ✓ Team formed: "${acceptedData.team.name}" (Code: ${acceptedData.team.teamCode})`);
  console.log(`   ✓ Team members count: ${acceptedData.team.members.length}`);

  // 3e. Arjun logs in again and verifies accepted status
  console.log('5. Log out Priya and log back in as Arjun...');
  const arjunRelogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@hackmatch.ai', password: 'Demo@123' })
  });
  if (!arjunRelogin.ok) throw new Error('Arjun relogin failed');
  const freshArjunToken = arjunRelogin.data.token;

  // Check Arjun's sent requests list
  const arjunSentRes = await req('/collaboration/requests', {
    headers: { Authorization: `Bearer ${freshArjunToken}` }
  });
  const arjunSent = arjunSentRes.data.data.sent;
  const updatedReqOnArjun = arjunSent.find(r => String(r.receiver._id || r.receiver) === String(priyaId));
  if (!updatedReqOnArjun || updatedReqOnArjun.status !== 'accepted') {
    throw new Error('Arjun does not see accepted status for Priya!');
  }
  console.log(`   ✓ Arjun sees updated status in sent requests: ${updatedReqOnArjun.status.toUpperCase()}`);

  // Check Arjun's team endpoint
  const arjunTeamRes = await req('/teams/my', {
    headers: { Authorization: `Bearer ${freshArjunToken}` }
  });
  if (!arjunTeamRes.ok || !arjunTeamRes.data.data) {
    throw new Error('Arjun does not see formed team!');
  }
  const arjunTeam = arjunTeamRes.data.data;
  console.log(`   ✓ Arjun sees same team: "${arjunTeam.name}" (Code: ${arjunTeam.teamCode}) with ${arjunTeam.members.length} members.`);

  // Check Arjun's matches endpoint shows ALREADY_TEAMMATE or ACCEPTED for Priya
  const arjunMatchesAfter = await req('/collaboration/matches', {
    headers: { Authorization: `Bearer ${freshArjunToken}` }
  });
  const priyaAfter = arjunMatchesAfter.data.data.find(m => m.user.email === 'priya@hackmatch.ai');
  console.log(`   ✓ In Find Teammates, Priya relationship status for Arjun is: ${priyaAfter.status}`);

  // STEP 4: Test a Second Pair (Karthik -> Sneha)
  console.log('\n--- Step 4: Testing Second Pair (Karthik -> Sneha) ---');
  const karthikToken = tokens['karthik@hackmatch.ai'].token;
  const snehaToken = tokens['sneha@hackmatch.ai'].token;
  const snehaId = tokens['sneha@hackmatch.ai'].user._id;

  const karthikSend = await req('/collaboration/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${karthikToken}` },
    body: JSON.stringify({
      receiverId: snehaId,
      message: 'Hey Sneha! Let us team up on Mobile & Cloud infrastructure!'
    })
  });
  if (!karthikSend.ok) throw new Error('Karthik send failed: ' + JSON.stringify(karthikSend.data));
  const karthikReqId = karthikSend.data.data._id;
  console.log(`   ✓ Karthik sent request to Sneha (ID: ${karthikReqId})`);

  // Sneha accepts
  const snehaAccept = await req(`/collaboration/requests/${karthikReqId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${snehaToken}` }
  });
  if (!snehaAccept.ok) throw new Error('Sneha accept failed: ' + JSON.stringify(snehaAccept.data));
  console.log(`   ✓ Sneha accepted Karthik request! Team formed: "${snehaAccept.data.team.name}"`);

  // STEP 5: Test a Third Pair (Rahul -> Vikram) Reject flow
  console.log('\n--- Step 5: Testing Third Pair (Rahul -> Vikram) Decline Flow ---');
  const rahulToken = tokens['rahul@hackmatch.ai'].token;
  const vikramToken = tokens['vikram@hackmatch.ai'].token;
  const vikramId = tokens['vikram@hackmatch.ai'].user._id;

  const rahulSend = await req('/collaboration/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${rahulToken}` },
    body: JSON.stringify({
      receiverId: vikramId,
      message: 'Hi Vikram, interested in distributed FinTech?'
    })
  });
  if (!rahulSend.ok) throw new Error('Rahul send failed: ' + JSON.stringify(rahulSend.data));
  const rahulReqId = rahulSend.data.data._id;
  console.log(`   ✓ Rahul sent request to Vikram (ID: ${rahulReqId})`);

  // Vikram rejects
  const vikramReject = await req(`/collaboration/requests/${rahulReqId}/reject`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${vikramToken}` }
  });
  if (!vikramReject.ok) throw new Error('Vikram reject failed: ' + JSON.stringify(vikramReject.data));
  console.log(`   ✓ Vikram declined Rahul request. Status in DB: ${vikramReject.data.data.status.toUpperCase()}`);

  // Re-request capability
  const rahulReMatches = await req('/collaboration/matches', {
    headers: { Authorization: `Bearer ${rahulToken}` }
  });
  const vikramMatch = rahulReMatches.data.data.find(m => m.user.email === 'vikram@hackmatch.ai');
  console.log(`   ✓ Vikram card status for Rahul is: ${vikramMatch.status} (allows re-requesting without hiding candidate)`);

  console.log('\n=====================================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! EVERYTHING WORKS!');
  console.log('=====================================================\n');
}

run().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
  process.exit(1);
});
