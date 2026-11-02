import { demoStore, DEMO_PASSWORD } from './demoService';

/**
 * Emulates backend REST endpoints in-browser so that all features
 * (Quick Login, Registration, Matchmaking, Teams, Submissions,
 * Judge Rubrics, and Certificates) function without requiring an external DB.
 */
export async function handleDemoRequest(config) {
  const method = (config.method || 'get').toLowerCase();
  
  // Normalize URL path to strip domain, base paths (/HackMatch-AI), and /api prefix
  const rawUrl = (config.url || '')
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/?HackMatch-AI/i, '')
    .replace(/^\/?api/i, '');
  
  const cleanUrl = '/' + rawUrl.replace(/^\/+/, '');

  let data = config.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  } else if (!data) {
    data = {};
  }

  // Simulate network latency (50-150ms) for realistic UX
  await new Promise(r => setTimeout(r, 60));

  // 1. GET /auth/accounts
  if (cleanUrl === '/auth/accounts' || cleanUrl === '/auth/accounts/') {
    const users = demoStore.get('users');
    const accounts = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || '',
      college: u.college || '',
      skills: Array.isArray(u.skills) ? u.skills.slice(0, 4) : [],
      hasTeam: !!u.teamId,
      canLogin: true,
      demoPassword: u.role === 'judge' ? 'Judge@123' : (u.role === 'admin' ? 'Admin@123' : DEMO_PASSWORD)
    }));
    return { data: { success: true, count: accounts.length, data: accounts } };
  }

  // 2. POST /auth/login
  if (cleanUrl.startsWith('/auth/login') && method === 'post') {
    const email = (data.email || '').trim().toLowerCase();
    const pwd = (data.password || '').trim();
    const users = demoStore.get('users');
    let user = users.find(u => u.email.toLowerCase() === email);

    // If not found, check partial or default to first demo user
    if (!user && email.includes('judge')) {
      user = users.find(u => u.role === 'judge');
    } else if (!user && email.includes('admin')) {
      user = users.find(u => u.role === 'admin');
    } else if (!user) {
      user = users[0];
    }

    const safeToken = 'demo_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    demoStore.set('currentUser', user);
    return { data: { success: true, token: safeToken, data: user } };
  }

  // 3. POST /auth/register
  if (cleanUrl === '/auth/register' && method === 'post') {
    const users = demoStore.get('users');
    const newUser = {
      _id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role || 'participant',
      department: data.department || 'Computer Science',
      college: data.college || 'Engineering College',
      skills: data.skills || ['JavaScript', 'React', 'Node.js'],
      bio: data.bio || 'Hackathon innovator passionate about technology.',
      profileStrength: 85,
      aiSkillScore: 84,
      teamId: null,
      password: data.password
    };
    users.push(newUser);
    demoStore.set('users', users);
    demoStore.set('currentUser', newUser);
    const token = 'demo_jwt_' + btoa(JSON.stringify({ id: newUser._id, email: newUser.email, role: newUser.role }));
    return { data: { success: true, token, data: newUser } };
  }

  // 4. GET /auth/me
  if (cleanUrl === '/auth/me') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    return { data: { success: true, data: currentUser } };
  }

  // 5. GET /problems
  if (cleanUrl === '/problems' || cleanUrl === '/problems/') {
    const problems = demoStore.get('problems');
    return { data: { success: true, count: problems.length, data: problems } };
  }

  // 6. GET /problems/:id
  if (cleanUrl.startsWith('/problems/')) {
    const id = cleanUrl.replace('/problems/', '').trim();
    const problems = demoStore.get('problems');
    const problem = problems.find(p => p._id === id || p.problemId === id) || problems[0];
    return { data: { success: true, data: problem } };
  }

  // 7. GET /collaboration/matches
  if (cleanUrl.startsWith('/collaboration/matches')) {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const matches = demoStore.getMatches(currentUser._id);
    return { data: { success: true, count: matches.length, data: matches } };
  }

  // 8. GET /collaboration/requests
  if (cleanUrl.startsWith('/collaboration/requests')) {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const rawReqs = demoStore.get('requests', []);
    const reqList = Array.isArray(rawReqs) ? rawReqs : [...(rawReqs.sent || []), ...(rawReqs.received || [])];
    
    const sent = reqList.filter(r => String(r.sender?._id || r.sender) === String(currentUser._id));
    const received = reqList.filter(r => String(r.receiver?._id || r.receiver) === String(currentUser._id));

    if (cleanUrl.includes('/incoming')) {
      return { data: { success: true, data: received } };
    }
    if (cleanUrl.includes('/sent')) {
      return { data: { success: true, data: sent } };
    }
    return { data: { success: true, data: { sent, received } } };
  }

  // 9. POST /collaboration/request
  if (cleanUrl === '/collaboration/request' && method === 'post') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const receiver = demoStore.getUser(data.receiverId);
    if (!receiver) {
      return { data: { success: false, message: 'Recipient not found' } };
    }
    const rawReqs = demoStore.get('requests', []);
    const reqList = Array.isArray(rawReqs) ? rawReqs : [...(rawReqs.sent || []), ...(rawReqs.received || [])];
    
    const newReq = {
      _id: 'req_' + Date.now(),
      sender: currentUser,
      receiver,
      problem: data.problemId ? (demoStore.get('problems', []).find(p => p._id === data.problemId) || null) : null,
      message: data.message || `Hi ${receiver.name.split(' ')[0]}, let's collaborate on this hackathon!`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    reqList.unshift(newReq);
    demoStore.set('requests', reqList);

    const notifs = demoStore.get('notifications', []);
    notifs.unshift({
      _id: 'notif_' + Date.now(),
      userId: receiver._id,
      type: 'collaboration_request',
      title: 'New Collaboration Request',
      message: `${currentUser.name} wants to collaborate with you!`,
      createdAt: new Date().toISOString()
    });
    demoStore.set('notifications', notifs);

    return { data: { success: true, message: 'Collaboration request sent successfully!', data: newReq } };
  }

  // 10. PUT /collaboration/requests/:id/accept
  if (cleanUrl.includes('/accept') && method === 'put') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const match = cleanUrl.match(/\/requests\/([^/]+)\/accept/);
    const reqId = match ? match[1] : null;

    const rawReqs = demoStore.get('requests', []);
    const reqList = Array.isArray(rawReqs) ? rawReqs : [...(rawReqs.sent || []), ...(rawReqs.received || [])];
    const targetReq = (reqId ? reqList.find(r => r._id === reqId) : null) || 
      reqList.find(r => String(r.receiver?._id || r.receiver) === String(currentUser._id) && r.status === 'pending');

    let sender = targetReq?.sender ? demoStore.getUser(targetReq.sender._id || targetReq.sender) : null;
    if (!sender || String(sender._id) === String(currentUser._id)) {
      sender = targetReq?.receiver ? demoStore.getUser(targetReq.receiver._id || targetReq.receiver) : demoStore.get('users')[1];
    }

    if (targetReq) {
      targetReq.status = 'accepted';
      demoStore.set('requests', reqList);
    }

    const teams = demoStore.get('teams', []);
    let team = teams.find(t => 
      (currentUser.teamId && t._id === currentUser.teamId) ||
      (sender?.teamId && t._id === sender.teamId) ||
      t.members?.some(m => String(m.user?._id || m.user) === String(currentUser._id))
    );

    const problem = targetReq?.problem || demoStore.get('problems')[0];

    if (!team) {
      const teamId = 'team_' + Date.now();
      team = {
        _id: teamId,
        name: `Team ${currentUser.name.split(' ')[0]} & ${sender?.name?.split(' ')[0] || 'Innovator'}`,
        teamCode: 'HM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        problem,
        leader: sender?._id || currentUser._id,
        members: [
          { user: sender, role: 'leader' },
          { user: currentUser, role: 'member' }
        ],
        compatibilityScore: 95,
        aiSummary: `${currentUser.name} and ${sender?.name} form a complementary team combining their skills.`
      };
      teams.unshift(team);
    } else {
      const hasMe = team.members.some(m => String(m.user?._id || m.user) === String(currentUser._id));
      if (!hasMe) team.members.push({ user: currentUser, role: 'member' });
      if (sender) {
        const hasSender = team.members.some(m => String(m.user?._id || m.user) === String(sender._id));
        if (!hasSender) team.members.push({ user: sender, role: 'member' });
      }
    }

    currentUser.teamId = team._id;
    if (sender) sender.teamId = team._id;

    const allUsers = demoStore.get('users', []);
    const updatedUsers = allUsers.map(u => {
      if (u._id === currentUser._id) return { ...u, teamId: team._id };
      if (sender && u._id === sender._id) return { ...u, teamId: team._id };
      return u;
    });

    demoStore.set('users', updatedUsers);
    demoStore.set('currentUser', { ...currentUser, teamId: team._id });
    demoStore.set('teams', teams);

    // Seed welcome message in team conversation if empty
    const messages = demoStore.get('messages', []);
    const hasMsgs = messages.some(m => m.team === team._id);
    if (!hasMsgs) {
      messages.push({
        _id: 'msg_welcome_' + Date.now(),
        team: team._id,
        sender: sender || currentUser,
        content: `Hey ${currentUser.name.split(' ')[0]}! Collaboration request accepted. Let's build our hackathon project together! 🚀`,
        text: `Hey ${currentUser.name.split(' ')[0]}! Collaboration request accepted. Let's build our hackathon project together! 🚀`,
        createdAt: new Date().toISOString()
      });
      demoStore.set('messages', messages);
    }

    return { 
      data: { 
        success: true, 
        message: 'Collaboration request accepted! Team chat unlocked.', 
        data: targetReq || { _id: reqId, status: 'accepted' }, 
        team 
      } 
    };
  }

  // 10b. PUT /collaboration/requests/:id/reject
  if (cleanUrl.includes('/reject') && method === 'put') {
    const match = cleanUrl.match(/\/requests\/([^/]+)\/reject/);
    const reqId = match ? match[1] : null;
    const rawReqs = demoStore.get('requests', []);
    const reqList = Array.isArray(rawReqs) ? rawReqs : [...(rawReqs.sent || []), ...(rawReqs.received || [])];
    const targetReq = reqId ? reqList.find(r => r._id === reqId) : null;
    if (targetReq) {
      targetReq.status = 'rejected';
      demoStore.set('requests', reqList);
    }
    return { data: { success: true, message: 'Request declined', data: targetReq } };
  }

  // 11. GET /teams/my
  if (cleanUrl === '/teams/my' || cleanUrl === '/teams/my/') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const teams = demoStore.get('teams', []);
    let team = teams.find(t => 
      (currentUser.teamId && t._id === currentUser.teamId) ||
      t.members?.some(m => String(m.user?._id || m.user) === String(currentUser._id))
    );
    if (!team && currentUser.role === 'participant') {
      team = teams[0] || null;
    }
    return { data: { success: true, data: team, team } };
  }

  // 11b. GET /teams/:id
  if (cleanUrl.startsWith('/teams/')) {
    const teamId = cleanUrl.replace(/^\/teams\/?/, '').trim();
    const teams = demoStore.get('teams', []);
    const team = teams.find(t => t._id === teamId) || teams[0] || null;
    return { data: { success: true, data: team, team } };
  }

  // 12. GET /tasks
  if (cleanUrl.startsWith('/tasks')) {
    const tasks = demoStore.get('tasks');
    if (method === 'post') {
      const newTask = {
        _id: 'tsk_' + Date.now(),
        title: data.title || 'New Task',
        priority: data.priority || 'medium',
        status: data.status || 'todo',
        team: data.team || 'team_nexus',
        assignedTo: demoStore.get('currentUser')
      };
      tasks.push(newTask);
      demoStore.set('tasks', tasks);
      return { data: { success: true, data: newTask } };
    }
    return { data: { success: true, count: tasks.length, data: tasks } };
  }

  // 13. PUT/DELETE /tasks/:id
  if (cleanUrl.startsWith('/tasks/')) {
    const id = cleanUrl.replace('/tasks/', '').trim();
    let tasks = demoStore.get('tasks');
    if (method === 'delete') {
      tasks = tasks.filter(t => t._id !== id);
      demoStore.set('tasks', tasks);
      return { data: { success: true, message: 'Task deleted' } };
    }
    if (method === 'put') {
      tasks = tasks.map(t => t._id === id ? { ...t, ...data } : t);
      demoStore.set('tasks', tasks);
      return { data: { success: true, data: tasks.find(t => t._id === id) } };
    }
  }

  // 14. GET/POST /messages
  if (cleanUrl.startsWith('/messages')) {
    const rawId = cleanUrl.replace(/^\/messages\/?/, '').trim();
    const targetTeamId = rawId || (data && data.teamId) || 'team_nexus';
    const messages = demoStore.get('messages', []);

    if (method === 'post') {
      const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
      const newMsg = {
        _id: 'msg_' + Date.now(),
        team: targetTeamId,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar
        },
        content: data.content || data.text || '',
        text: data.content || data.text || '',
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      demoStore.set('messages', messages);
      return { data: { success: true, data: newMsg } };
    }

    const teamMessages = rawId 
      ? messages.filter(m => m.team === rawId)
      : messages;
    return { data: { success: true, count: teamMessages.length, data: teamMessages } };
  }

  // 15. GET/PUT /notifications
  if (cleanUrl.startsWith('/notifications')) {
    const notifs = demoStore.get('notifications', []);
    if (method === 'put') {
      return { data: { success: true, message: 'Marked read' } };
    }
    return { data: { success: true, count: notifs.length, data: notifs } };
  }

  // 16. GET/POST /projects
  if (cleanUrl.startsWith('/projects')) {
    const projects = demoStore.get('projects');
    if (cleanUrl === '/projects/my') {
      return { data: { success: true, data: projects[0] } };
    }
    if (method === 'post' || method === 'put') {
      const updated = { ...projects[0], ...data };
      demoStore.set('projects', [updated]);
      return { data: { success: true, data: updated } };
    }
    return { data: { success: true, data: projects } };
  }

  // 17. GET/POST /submissions
  if (cleanUrl.startsWith('/submissions')) {
    const submissions = demoStore.get('submissions');
    if (cleanUrl === '/submissions/my') {
      return { data: { success: true, data: submissions[0] } };
    }
    if (method === 'post') {
      const newSub = {
        _id: 'sub_' + Date.now(),
        submissionId: 'HM-2026-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        team: demoStore.get('teams')[0],
        project: demoStore.get('projects')[0],
        submittedBy: demoStore.get('currentUser'),
        status: 'submitted',
        autoEvalScore: 85,
        createdAt: new Date().toISOString()
      };
      submissions.push(newSub);
      demoStore.set('submissions', submissions);
      return { data: { success: true, data: newSub } };
    }
    return { data: { success: true, data: submissions } };
  }

  // 18. GET /evaluations/my
  if (cleanUrl.startsWith('/evaluations')) {
    const evals = demoStore.get('evaluations');
    return { data: { success: true, data: evals[0] } };
  }

  // 19. GET /judge/submissions & POST /judge/evaluate/:id
  if (cleanUrl.startsWith('/judge')) {
    if (cleanUrl.includes('/evaluate') && method === 'post') {
      return { data: { success: true, message: 'Evaluation successfully recorded!' } };
    }
    const submissions = demoStore.get('submissions');
    return { data: { success: true, count: submissions.length, data: submissions } };
  }

  // 20. GET /leaderboard
  if (cleanUrl.startsWith('/leaderboard')) {
    const teams = demoStore.get('teams');
    const leaderboard = [
      { rank: 1, teamName: 'Nexus AI', score: 94, problem: 'Smart Healthcare AI Assistant', techStack: ['React', 'FastAPI', 'PyTorch'], members: 2 },
      { rank: 2, teamName: 'BlockVote', score: 91, problem: 'Web3 Decentralized Voting', techStack: ['Solidity', 'React', 'Web3.js'], members: 2 },
      { rank: 3, teamName: 'CodeCraft', score: 88, problem: 'Cybersecurity Threat Intelligence', techStack: ['Java', 'Spring Boot', 'Docker'], members: 2 }
    ];
    return { data: { success: true, data: leaderboard } };
  }

  // 21. GET /certificates
  if (cleanUrl.startsWith('/certificates')) {
    const certs = demoStore.get('certificates');
    if (cleanUrl.includes('/verify/')) {
      const certId = cleanUrl.split('/verify/')[1];
      const cert = certs.find(c => c.certificateId === certId || c._id === certId) || certs[0];
      return { data: { success: true, valid: true, data: cert } };
    }
    return { data: { success: true, count: certs.length, data: certs } };
  }

  // 22. POST /resume/upload
  if (cleanUrl.startsWith('/resume/upload')) {
    const extractedSkills = ['React', 'Node.js', 'Python', 'Tailwind CSS', 'FastAPI', 'Docker', 'Machine Learning'];
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    currentUser.skills = Array.from(new Set([...(currentUser.skills || []), ...extractedSkills]));
    currentUser.profileStrength = 96;
    currentUser.aiSkillScore = 95;
    demoStore.set('currentUser', currentUser);
    return {
      data: {
        success: true,
        message: 'Resume analyzed: 7 skills extracted and synced to profile!',
        data: {
          skills: extractedSkills.map(s => ({ name: s, score: 90 })),
          profileStrength: 96,
          aiSkillScore: 95
        }
      }
    };
  }

  // 23. GET /admin/stats
  if (cleanUrl.startsWith('/admin')) {
    return {
      data: {
        success: true,
        data: {
          participants: 15,
          teams: 3,
          problems: 8,
          submissions: 1,
          evaluations: 1,
          certificates: 2
        }
      }
    };
  }

  // Default fallback
  return { data: { success: true, data: [] } };
}

