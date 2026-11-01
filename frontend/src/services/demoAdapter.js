import { demoStore, DEMO_PASSWORD } from './demoService';

/**
 * Emulates backend REST endpoints in-browser so that all features
 * (Quick Login, Registration, Matchmaking, Teams, Submissions,
 * Judge Rubrics, and Certificates) function without requiring an external DB.
 */
export async function handleDemoRequest(config) {
  const method = (config.method || 'get').toLowerCase();
  const rawUrl = (config.url || '').replace(/^https?:\/\/[^/]+/, '');
  const cleanUrl = rawUrl.replace(/^\/api/, '');
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});

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
  if (cleanUrl === '/auth/login' && method === 'post') {
    const email = (data.email || '').trim().toLowerCase();
    const pwd = (data.password || '').trim();
    const users = demoStore.get('users');
    const user = users.find(u => u.email.toLowerCase() === email);

    if (user && (pwd === DEMO_PASSWORD || pwd === 'Judge@123' || pwd === 'Admin@123' || user.password === pwd || !user.password)) {
      const token = 'demo_jwt_' + btoa(JSON.stringify({ id: user._id, email: user.email, role: user.role }));
      demoStore.set('currentUser', user);
      return { data: { success: true, token, data: user } };
    }
    // Allow any demo sign-in for testing
    if (user) {
      const token = 'demo_jwt_' + btoa(JSON.stringify({ id: user._id, email: user.email, role: user.role }));
      demoStore.set('currentUser', user);
      return { data: { success: true, token, data: user } };
    }
    const err = new Error('Invalid credentials');
    err.response = { status: 401, data: { success: false, message: 'Invalid credentials. Use Demo@123.' } };
    throw err;
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
    const requests = demoStore.get('requests', { sent: [], received: [] });
    return { data: { success: true, data: requests } };
  }

  // 9. POST /collaboration/request
  if (cleanUrl === '/collaboration/request' && method === 'post') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const receiver = demoStore.getUser(data.receiverId);
    const requests = demoStore.get('requests', { sent: [], received: [] });
    const newReq = {
      _id: 'req_' + Date.now(),
      sender: currentUser,
      receiver,
      message: data.message || 'Hey, let us team up!',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.sent.push(newReq);
    demoStore.set('requests', requests);
    return { data: { success: true, message: 'Request sent successfully', data: newReq } };
  }

  // 10. PUT /collaboration/requests/:id/accept
  if (cleanUrl.includes('/accept') && method === 'put') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const teams = demoStore.get('teams');
    const users = demoStore.get('users');
    const myTeam = teams[0];
    currentUser.teamId = myTeam._id;
    demoStore.set('currentUser', currentUser);
    return { data: { success: true, message: 'Request accepted. Team updated!', data: { team: myTeam } } };
  }

  // 11. GET /teams/my
  if (cleanUrl === '/teams/my' || cleanUrl === '/teams/my/') {
    const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
    const teams = demoStore.get('teams');
    const team = teams.find(t => t._id === currentUser.teamId) || (currentUser.role === 'participant' ? teams[0] : null);
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
    const messages = demoStore.get('messages', []);
    if (method === 'post') {
      const currentUser = demoStore.get('currentUser') || demoStore.get('users')[0];
      const newMsg = {
        _id: 'msg_' + Date.now(),
        team: data.teamId || 'team_nexus',
        sender: currentUser,
        text: data.content || data.text || 'Message',
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      demoStore.set('messages', messages);
      return { data: { success: true, data: newMsg } };
    }
    return { data: { success: true, count: messages.length, data: messages } };
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
