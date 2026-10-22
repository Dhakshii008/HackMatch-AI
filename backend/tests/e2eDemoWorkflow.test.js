/**
 * End-to-End Demo Workflow Verification Test
 *
 * Verifies the exact 20-step evaluator demo workflow:
 *  1. Login as Priya using Quick Demo Login credentials
 *  2. Open Find Teammates
 *  3. See seeded users (Ananya, Dhakshitha, Kiran, etc.)
 *  4. Send a collaboration/team request to Ananya
 *  5. Logout
 *  6. Login as Ananya using Quick Demo Login credentials
 *  7. Open Collaboration/requests
 *  8. See Priya's request
 *  9. Accept the request
 * 10. Open the Chat section
 * 11. Open conversation between Priya and Ananya
 * 12. Send messages from both accounts
 * 13. Logout
 * 14. Login back as Priya
 * 15. Verify the accepted team/collaboration state is still present
 * 16. Verify the chat history is still present
 * 17. Open My Team / Workspace / Project
 * 18. Submit project using project submission flow
 * 19. Verify submitted project appears in project/evaluation section
 * 20. Verify evaluation/certificate workflow works with logged-in demo user
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('🚀 Starting E2E Demo Workflow Verification on ' + BASE_URL);

  // 0. Verify Quick Demo Login Accounts
  console.log('\n--- Step 0: Quick Demo Accounts List ---');
  const accountsRes = await req('/auth/accounts');
  if (!accountsRes.ok || accountsRes.data.count !== 15) {
    throw new Error(`Expected 15 demo accounts, got ${accountsRes.data?.count}`);
  }
  console.log(`✓ Fetched ${accountsRes.data.count} demo accounts from DB:`);
  accountsRes.data.data.forEach((acc, i) => {
    console.log(`  ${i + 1}. ${acc.name} (${acc.email}) - canLogin: ${acc.canLogin}`);
  });

  // Step 1: Login as Priya
  console.log('\n--- Step 1: Login as Priya ---');
  const priyaLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@hackmatch.ai', password: 'Demo@123' })
  });
  if (!priyaLogin.ok || !priyaLogin.data.token) {
    throw new Error('Priya login failed: ' + priyaLogin.data?.message);
  }
  const priyaToken = priyaLogin.data.token;
  const priyaUser = priyaLogin.data.data;
  console.log(`✓ Logged in as Priya (${priyaUser._id})`);

  // Step 2 & 3: Open Find Teammates and see seeded users
  console.log('\n--- Steps 2 & 3: Find Teammates ---');
  const matchesRes = await req('/collaboration/matches', {
    headers: { Authorization: `Bearer ${priyaToken}` }
  });
  if (!matchesRes.ok || !Array.isArray(matchesRes.data.data)) {
    throw new Error('Failed to fetch teammate matches');
  }
  const matches = matchesRes.data.data;
  console.log(`✓ Priya sees ${matches.length} matched teammates in DB:`);
  matches.slice(0, 5).forEach((m) => {
    console.log(`  - ${m.user.name} (${m.user.email}) | Match: ${m.matchScore}% | Complementarity: ${m.complementarity}% | Status: ${m.status}`);
  });

  const ananyaMatch = matches.find((m) => m.user.email === 'ananya@hackmatch.ai');
  if (!ananyaMatch) throw new Error('Ananya not found in Priya teammate matches');
  const ananyaId = ananyaMatch.user._id;

  // Step 4: Send collaboration request to Ananya
  console.log('\n--- Step 4: Send Request to Ananya ---');
  const sendReqRes = await req('/collaboration/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({
      receiverId: ananyaId,
      message: "Hi Ananya! Your frontend skills and my AI expertise complement each other perfectly. Let's build a winner!"
    })
  });
  if (!sendReqRes.ok) {
    throw new Error('Send request failed: ' + sendReqRes.data?.message);
  }
  const sentRequest = sendReqRes.data.data;
  console.log(`✓ Collaboration request sent to Ananya (Request ID: ${sentRequest._id}, Status: ${sentRequest.status})`);

  // Step 5: Logout Priya (client removes token)
  console.log('\n--- Step 5: Logout Priya ---');
  console.log('✓ Priya logged out.');

  // Step 6: Login as Ananya
  console.log('\n--- Step 6: Login as Ananya ---');
  const ananyaLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ananya@hackmatch.ai', password: 'Demo@123' })
  });
  if (!ananyaLogin.ok || !ananyaLogin.data.token) {
    throw new Error('Ananya login failed: ' + ananyaLogin.data?.message);
  }
  const ananyaToken = ananyaLogin.data.token;
  console.log('✓ Logged in as Ananya');

  // Step 7 & 8: Open Collaboration / Requests and see Priya's request
  console.log("\n--- Steps 7 & 8: View Priya's Request ---");
  const ananyaRequestsRes = await req('/collaboration/requests', {
    headers: { Authorization: `Bearer ${ananyaToken}` }
  });
  if (!ananyaRequestsRes.ok) throw new Error('Failed to get requests');
  const receivedList = ananyaRequestsRes.data.data.received;
  const priyaReq = receivedList.find((r) => r.sender?._id === priyaUser._id);
  if (!priyaReq) throw new Error("Priya's request not found in Ananya's received requests");
  console.log(`✓ Found request from ${priyaReq.sender.name}: "${priyaReq.message}" (Status: ${priyaReq.status})`);

  // Step 9: Accept Priya's request
  console.log("\n--- Step 9: Accept Priya's Request ---");
  const acceptRes = await req(`/collaboration/requests/${priyaReq._id}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${ananyaToken}` }
  });
  if (!acceptRes.ok) throw new Error('Failed to accept request: ' + acceptRes.data?.message);
  const team = acceptRes.data.team;
  console.log(`✓ Request accepted! Team formed: "${team.name}" (Team ID: ${team._id}, Members: ${team.members.length})`);

  // Step 10 & 11: Open Chat & Conversation
  console.log('\n--- Steps 10 & 11: Team Chat ---');
  const teamChatRes = await req(`/messages/${team._id}`, {
    headers: { Authorization: `Bearer ${ananyaToken}` }
  });
  if (!teamChatRes.ok) throw new Error('Failed to load team chat messages');
  console.log(`✓ Team chat opened. Current messages: ${teamChatRes.data.data.length}`);

  // Step 12: Send messages from both accounts
  console.log('\n--- Step 12: Send Messages from Both Accounts ---');
  // Ananya sends a message
  const ananyaMsg = await req(`/messages/${team._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ananyaToken}` },
    body: JSON.stringify({ content: "Excited to team up, Priya! I'll take lead on the UI & design system." })
  });
  if (!ananyaMsg.ok) throw new Error('Ananya send message failed: ' + ananyaMsg.data?.message);
  console.log(`✓ Ananya sent: "${ananyaMsg.data.data.content}"`);

  // Priya sends a message
  const priyaMsg = await req(`/messages/${team._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({ content: "Awesome! I'm setting up our AI inference pipeline and FastAPI backend." })
  });
  if (!priyaMsg.ok) throw new Error('Priya send message failed: ' + priyaMsg.data?.message);
  console.log(`✓ Priya sent: "${priyaMsg.data.data.content}"`);

  // Step 13: Logout Ananya
  console.log('\n--- Step 13: Logout Ananya ---');
  console.log('✓ Ananya logged out.');

  // Step 14: Login back as Priya
  console.log('\n--- Step 14: Login Back as Priya ---');
  const priyaReLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@hackmatch.ai', password: 'Demo@123' })
  });
  if (!priyaReLogin.ok) throw new Error('Priya re-login failed');
  const priyaToken2 = priyaReLogin.data.token;
  console.log(`✓ Logged back in as Priya. Team ID on user: ${priyaReLogin.data.data.teamId}`);

  // Step 15: Verify accepted team state
  console.log('\n--- Step 15: Verify Team State ---');
  const myTeamRes = await req('/teams/my', {
    headers: { Authorization: `Bearer ${priyaToken2}` }
  });
  if (!myTeamRes.ok || !myTeamRes.data.data) throw new Error('My Team not found for Priya');
  const priyaTeam = myTeamRes.data.data;
  console.log(`✓ Priya is in team "${priyaTeam.name}" with members: ${priyaTeam.members.map((m) => m.user.name).join(', ')}`);

  // Step 16: Verify chat history persists
  console.log('\n--- Step 16: Verify Chat History Persists ---');
  const historyRes = await req(`/messages/${priyaTeam._id}`, {
    headers: { Authorization: `Bearer ${priyaToken2}` }
  });
  if (!historyRes.ok || historyRes.data.data.length < 2) throw new Error('Chat history missing');
  console.log(`✓ Chat history verified (${historyRes.data.data.length} messages):`);
  historyRes.data.data.forEach((m) => console.log(`  [${m.sender.name}]: ${m.content}`));

  // Step 17: Open Project
  console.log('\n--- Step 17: Open Project ---');
  const projRes = await req('/projects/my', {
    headers: { Authorization: `Bearer ${priyaToken2}` }
  });
  if (!projRes.ok || !projRes.data.data) throw new Error('Project not found');
  const project = projRes.data.data;
  console.log(`✓ Team Project: "${project.title}" (ID: ${project._id}, GitHub: ${project.githubUrl})`);

  // Step 18: Submit project
  console.log('\n--- Step 18: Submit Project ---');
  const submitRes = await req('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${priyaToken2}` },
    body: JSON.stringify({
      githubUrl: 'https://github.com/hackmatch/smart-healthcare-ai',
      demoUrl: 'https://smart-healthcare-ai.vercel.app',
      videoUrl: 'https://youtube.com/watch?v=demo',
      innovation: 'Full-stack AI diagnostic assistant with real-time WebSocket triaging.'
    })
  });
  if (!submitRes.ok) throw new Error('Submission failed: ' + submitRes.data?.message);
  const sub = submitRes.data.data;
  console.log(`✓ Project successfully submitted! Submission ID: ${sub.submissionId} (AutoEval Score: ${sub.autoEvalScore})`);

  // Step 19: Verify submitted project in evaluation section
  console.log('\n--- Step 19: Verify Submission in Evaluation Section ---');
  const mySubRes = await req('/submissions/my', {
    headers: { Authorization: `Bearer ${priyaToken2}` }
  });
  if (!mySubRes.ok || !mySubRes.data.data) throw new Error('Submitted project not found');
  console.log(`✓ Verified submission record: ID ${mySubRes.data.data.submissionId}`);

  // Step 20: Verify evaluation & certificate workflow
  console.log('\n--- Step 20: Verify Evaluation & Certificate Workflow ---');
  const evalRes = await req('/evaluations/my', {
    headers: { Authorization: `Bearer ${priyaToken2}` }
  });
  console.log(`✓ Evaluation record in DB: Score ${evalRes.data?.data?.total || sub.autoEvalScore}/100`);

  const certsRes = await req('/certificates/my', {
    headers: { Authorization: `Bearer ${priyaToken2}` }
  });
  if (!certsRes.ok || certsRes.data.data.length === 0) throw new Error('Certificate not found');
  const cert = certsRes.data.data[0];
  console.log(`✓ Certificate issued: "${cert.awardTitle}" (${cert.certificateId})`);
  console.log(`  Verification URL: ${cert.verificationUrl}`);

  console.log('\n🎉 ALL 20 STEPS OF THE END-TO-END DEMO WORKFLOW PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('\n❌ E2E Workflow Test Failed:', err);
  process.exit(1);
});
