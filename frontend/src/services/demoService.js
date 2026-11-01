/**
 * HackMatch AI - In-Browser Demo Engine
 * Provides persistent, realistic sample data and offline API emulation
 * for all 15 demo accounts, problem statements, teams, AI matchmaking,
 * chat, tasks, project submissions, judge evaluations, and certificates.
 */

export const DEMO_PASSWORD = 'Demo@123';

export const INITIAL_DEMO_USERS = [
  {
    _id: 'usr_arjun',
    name: 'Arjun Mehta',
    email: 'arjun@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Anna University',
    role: 'participant',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'WebSockets', 'Tailwind CSS'],
    techSkills: ['Full Stack Development', 'MERN Stack', 'REST API', 'Socket.io'],
    softSkills: ['Problem Solving', 'Leadership', 'Collaboration'],
    languages: ['JavaScript', 'HTML/CSS', 'English'],
    experience: ['Full Stack Intern (6 months)', 'Built 4 production web apps for student clubs'],
    githubUrl: 'https://github.com/arjun',
    linkedinUrl: 'https://linkedin.com/in/arjun',
    bio: 'Full-stack MERN builder passionate about real-time web applications and collaborative platforms.',
    profileStrength: 94,
    aiSkillScore: 93,
    teamId: 'team_nexus',
    isDemoAccount: true
  },
  {
    _id: 'usr_priya',
    name: 'Priya Sharma',
    email: 'priya@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Anna University',
    role: 'participant',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'FastAPI', 'PyTorch'],
    techSkills: ['Python', 'Machine Learning', 'Deep Learning', 'FastAPI'],
    softSkills: ['Communication', 'Team Collaboration'],
    languages: ['Python', 'English'],
    experience: ['Machine Learning Intern at HealthTech (6 months)', 'Winner at National Hackathon 2024'],
    githubUrl: 'https://github.com/priya',
    linkedinUrl: 'https://linkedin.com/in/priya',
    bio: 'AI/ML enthusiast focused on LLMs, computer vision, and building intelligent healthcare assistants.',
    profileStrength: 95,
    aiSkillScore: 94,
    teamId: 'team_nexus',
    isDemoAccount: true
  },
  {
    _id: 'usr_karthik',
    name: 'Karthik Nair',
    email: 'karthik@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Anna University',
    role: 'participant',
    skills: ['Flutter', 'Firebase', 'React Native', 'UI/UX', 'Android', 'Figma'],
    techSkills: ['Cross-Platform Mobile', 'Flutter', 'Firebase Auth', 'State Management'],
    softSkills: ['Creative Design', 'User Empathy', 'Rapid Prototyping'],
    languages: ['Dart', 'JavaScript', 'English'],
    experience: ['Mobile Dev Lead for College Portal App', 'Winner at Smart India Hackathon Mobile Track'],
    githubUrl: 'https://github.com/karthik',
    linkedinUrl: 'https://linkedin.com/in/karthik',
    bio: 'Mobile application developer creating buttery-smooth user experiences on Android and iOS.',
    profileStrength: 91,
    aiSkillScore: 90,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_meera',
    name: 'Meera Joshi',
    email: 'meera@hackmatch.ai',
    department: 'Information Technology',
    year: '4th Year',
    college: 'VIT Vellore',
    role: 'participant',
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Microservices', 'Cloud'],
    techSkills: ['Enterprise Java', 'Spring Boot', 'Relational Databases'],
    softSkills: ['Project Coordination', 'Agile Mindset'],
    languages: ['Java', 'SQL', 'English'],
    experience: ['Backend Software Intern at Enterprise IT (6 months)'],
    githubUrl: 'https://github.com/meera',
    linkedinUrl: 'https://linkedin.com/in/meera',
    bio: 'Enterprise backend developer building robust, reliable Spring Boot microservices and cloud architectures.',
    profileStrength: 92,
    aiSkillScore: 91,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_rahul',
    name: 'Rahul Verma',
    email: 'rahul@hackmatch.ai',
    department: 'Information Science',
    year: '3rd Year',
    college: 'Karunya Institute of Technology',
    role: 'participant',
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'Docker'],
    techSkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka'],
    softSkills: ['Communication', 'Code Review', 'System Design'],
    languages: ['Java', 'SQL', 'English'],
    experience: ['Backend Intern at Enterprise Solutions (5 months)'],
    githubUrl: 'https://github.com/rahul',
    linkedinUrl: 'https://linkedin.com/in/rahul',
    bio: 'Enterprise Java and Spring Boot developer focused on scalable, resilient microservices.',
    profileStrength: 90,
    aiSkillScore: 91,
    teamId: 'team_codecraft',
    isDemoAccount: true
  },
  {
    _id: 'usr_sneha',
    name: 'Sneha Patel',
    email: 'sneha@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    college: 'Madurai Kamaraj University',
    role: 'participant',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'DevOps'],
    techSkills: ['Cloud Computing', 'Docker', 'Kubernetes', 'AWS Lambda'],
    softSkills: ['Project Management', 'Agile Methodologies'],
    languages: ['Go', 'Python', 'YAML', 'English'],
    experience: ['Cloud Operations Intern at DevOps Hub (6 months)', 'Certified AWS Solutions Architect'],
    githubUrl: 'https://github.com/sneha',
    linkedinUrl: 'https://linkedin.com/in/sneha',
    bio: 'DevOps engineer focused on infrastructure automation, container orchestration, and CI/CD pipelines.',
    profileStrength: 93,
    aiSkillScore: 92,
    teamId: 'team_codecraft',
    isDemoAccount: true
  },
  {
    _id: 'usr_dhakshitha',
    name: 'Dhakshitha Mylsamy',
    email: 'dhakshitha@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Sri Shakthi Institute of Engineering & Technology',
    role: 'participant',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'GraphQL'],
    techSkills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
    softSkills: ['Problem Solving', 'Teamwork', 'Communication'],
    languages: ['JavaScript', 'SQL', 'English'],
    experience: ['Backend Intern at CloudTech (5 months)', 'Built scalable authentication & chat systems'],
    githubUrl: 'https://github.com/dhakshitha',
    linkedinUrl: 'https://linkedin.com/in/dhakshitha',
    bio: 'Full-stack & backend engineer building robust APIs, scalable microservices, and database architectures.',
    profileStrength: 96,
    aiSkillScore: 95,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_ananya',
    name: 'Ananya Iyer',
    email: 'ananya@hackmatch.ai',
    department: 'Information Technology',
    year: '3rd Year',
    college: 'VIT Vellore',
    role: 'participant',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'UI/UX', 'Figma'],
    techSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    softSkills: ['Leadership', 'Creative Problem Solving'],
    languages: ['JavaScript', 'TypeScript', 'English'],
    experience: ['Frontend Engineer Intern at FinTech Startup (4 months)'],
    githubUrl: 'https://github.com/ananya',
    linkedinUrl: 'https://linkedin.com/in/ananya',
    bio: 'Frontend specialist crafting slick, responsive UIs with modern React and Tailwind CSS.',
    profileStrength: 92,
    aiSkillScore: 90,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_kiran',
    name: 'Kiran Reddy',
    email: 'kiran@hackmatch.ai',
    department: 'Data Science',
    year: '4th Year',
    college: 'PSG College of Technology',
    role: 'participant',
    skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Data Visualization', 'Tableau'],
    techSkills: ['Data Analysis', 'Python', 'SQL', 'Power BI'],
    softSkills: ['Analytical Thinking', 'Presentation'],
    languages: ['Python', 'SQL', 'English'],
    experience: ['Data Analyst Intern at AnalyticsCorp (6 months)'],
    githubUrl: 'https://github.com/kiran',
    linkedinUrl: 'https://linkedin.com/in/kiran',
    bio: 'Data analyst turning complex metrics into visual stories and predictive insights.',
    profileStrength: 89,
    aiSkillScore: 88,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_kishor',
    name: 'Kishor Kumar',
    email: 'kishor@hackmatch.ai',
    department: 'Cybersecurity',
    year: '3rd Year',
    college: 'SSN College of Engineering',
    role: 'participant',
    skills: ['Cybersecurity', 'Penetration Testing', 'Linux', 'Cryptography', 'Python', 'Networking'],
    techSkills: ['Ethical Hacking', 'Network Security', 'Linux', 'Burp Suite'],
    softSkills: ['Critical Thinking', 'Adaptability'],
    languages: ['Python', 'Bash', 'English'],
    experience: ['Security Analyst Intern at SecOps (3 months)', 'Bug bounty hunter with 12 CVE findings'],
    githubUrl: 'https://github.com/kishor',
    linkedinUrl: 'https://linkedin.com/in/kishor',
    bio: 'Security researcher passionate about finding vulnerabilities and safeguarding applications.',
    profileStrength: 91,
    aiSkillScore: 89,
    teamId: 'team_blockvote',
    isDemoAccount: true
  },
  {
    _id: 'usr_harnish',
    name: 'Harnish Patel',
    email: 'harnish@hackmatch.ai',
    department: 'Electronics & Communication',
    year: '3rd Year',
    college: 'Amrita Vishwa Vidyapeetham',
    role: 'participant',
    skills: ['IoT', 'Arduino', 'ESP32', 'Embedded C', 'Raspberry Pi', 'MQTT'],
    techSkills: ['Embedded Systems', 'IoT Protocols', 'C++', 'Sensors'],
    softSkills: ['Rapid Prototyping', 'Hands-on Hardware'],
    languages: ['C', 'C++', 'Python', 'English'],
    experience: ['Smart Agriculture IoT Prototype Lead'],
    githubUrl: 'https://github.com/harnish',
    linkedinUrl: 'https://linkedin.com/in/harnish',
    bio: 'IoT and hardware builder connecting physical sensors to real-time cloud analytics.',
    profileStrength: 88,
    aiSkillScore: 87,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_divya',
    name: 'Divya Reddy',
    email: 'divya@hackmatch.ai',
    department: 'Computer Science & Design',
    year: '2nd Year',
    college: 'Sathyabama Institute',
    role: 'participant',
    skills: ['UI/UX', 'Figma', 'Prototyping', 'User Research', 'React', 'CSS'],
    techSkills: ['Figma', 'UI Design', 'Wireframing', 'Design Systems'],
    softSkills: ['Empathy', 'Visual Communication', 'Creativity'],
    languages: ['JavaScript', 'HTML/CSS', 'English'],
    experience: ['Freelance UI/UX Designer for 5 client apps'],
    githubUrl: 'https://github.com/divya',
    linkedinUrl: 'https://linkedin.com/in/divya',
    bio: 'Product designer creating clean, accessible, and human-centered user experiences.',
    profileStrength: 87,
    aiSkillScore: 86,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_vikram',
    name: 'Vikram Singh',
    email: 'vikram@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    college: 'SRM Institute of Science & Technology',
    role: 'participant',
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Rust', 'Node.js'],
    techSkills: ['Smart Contracts', 'Blockchain Development', 'Web3 Architecture'],
    softSkills: ['Strategic Thinking', 'Consensus Building'],
    languages: ['Solidity', 'Rust', 'JavaScript', 'English'],
    experience: ['Blockchain Developer Intern at Web3 Lab (5 months)', 'Winner of Ethereum India Hackathon 2024'],
    githubUrl: 'https://github.com/vikram',
    linkedinUrl: 'https://linkedin.com/in/vikram',
    bio: 'Web3 & blockchain engineer creating secure smart contracts, DeFi protocols, and decentralized systems.',
    profileStrength: 93,
    aiSkillScore: 92,
    teamId: 'team_blockvote',
    isDemoAccount: true
  },
  {
    _id: 'usr_pooja',
    name: 'Pooja Hegde',
    email: 'pooja@hackmatch.ai',
    department: 'Information Technology',
    year: '3rd Year',
    college: 'PSG College of Technology',
    role: 'participant',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
    techSkills: ['Cross-Platform Mobile Apps', 'React Native', 'Native Android/iOS'],
    softSkills: ['User Experience Focus', 'Cross-Team Communication'],
    languages: ['JavaScript', 'TypeScript', 'Swift', 'English'],
    experience: ['Mobile App Developer Intern at HealthSync (4 months)'],
    githubUrl: 'https://github.com/pooja',
    linkedinUrl: 'https://linkedin.com/in/pooja',
    bio: 'Cross-platform mobile engineer delivering fluid mobile experiences with React Native and Flutter.',
    profileStrength: 90,
    aiSkillScore: 89,
    teamId: null,
    isDemoAccount: true
  },
  {
    _id: 'usr_siddharth',
    name: 'Siddharth Roy',
    email: 'siddharth@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'SSN College of Engineering',
    role: 'participant',
    skills: ['Python', 'PyTorch', 'LangChain', 'Kafka', 'Apache Spark', 'HuggingFace'],
    techSkills: ['Natural Language Processing', 'Data Engineering', 'Vector Databases', 'Deep Learning'],
    softSkills: ['Analytical Rigor', 'Technical Mentorship'],
    languages: ['Python', 'SQL', 'English'],
    experience: ['AI Research Intern at National AI Labs (6 months)'],
    githubUrl: 'https://github.com/siddharth',
    linkedinUrl: 'https://linkedin.com/in/siddharth',
    bio: 'Data and AI engineer crafting multi-agent workflows, vector search pipelines, and intelligent retrieval systems.',
    profileStrength: 94,
    aiSkillScore: 93,
    teamId: null,
    isDemoAccount: true
  },
  // Official Evaluation & Administration Roles
  {
    _id: 'usr_judge_rajesh',
    name: 'Dr. Rajesh Kumar',
    email: 'judge@hackmatch.ai',
    role: 'judge',
    department: 'Computer Science Faculty',
    college: 'Anna University',
    skills: ['AI/ML Evaluation', 'System Architecture', 'Code Quality', 'Innovation'],
    bio: 'Senior Technical Evaluator and Professor of Artificial Intelligence.',
    canLogin: true,
    isDemoAccount: true
  },
  {
    _id: 'usr_admin',
    name: 'Hackathon Admin',
    email: 'admin@hackmatch.ai',
    role: 'admin',
    department: 'Hackathon Organizing Committee',
    college: 'HackMatch Global',
    skills: ['Platform Management', 'Participant Coordination', 'Review Operations'],
    bio: 'Official platform administrator managing tracks, problem statements, and schedules.',
    canLogin: true,
    isDemoAccount: true
  }
];

export const INITIAL_PROBLEMS = [
  { _id: 'prob_1', problemId: 'PS001', title: 'Smart Healthcare AI Assistant', domain: 'AI', difficulty: 'Hard', organization: 'Ministry of Health', description: 'Build an automated clinical diagnostics and triage assistant that integrates multimodal patient data and medical records.', requiredSkills: ['AI', 'Python', 'React', 'MongoDB'] },
  { _id: 'prob_2', problemId: 'PS002', title: 'FinTech Fraud Detection', domain: 'FinTech', difficulty: 'Expert', organization: 'Reserve Bank', description: 'Real-time transaction fraud prevention engine utilizing anomaly detection and graph-based network analysis.', requiredSkills: ['Machine Learning', 'Python', 'Data Science'] },
  { _id: 'prob_3', problemId: 'PS003', title: 'Cybersecurity Threat Intelligence', domain: 'Cybersecurity', difficulty: 'Expert', organization: 'Cyber Defense Center', description: 'Automated vulnerability reconnaissance, intrusion analysis, and reactive zero-trust defense gateway.', requiredSkills: ['Security', 'Python', 'Network'] },
  { _id: 'prob_4', problemId: 'PS004', title: 'Smart City Traffic Management', domain: 'IoT', difficulty: 'Medium', organization: 'City Council', description: 'Intelligent traffic light synchronization and congestion prediction system using distributed IoT cameras.', requiredSkills: ['IoT', 'Node.js', 'React'] },
  { _id: 'prob_5', problemId: 'PS005', title: 'EdTech Personalized Learning', domain: 'Education', difficulty: 'Medium', organization: 'EduCorp', description: 'Adaptive curriculum engine with automated knowledge-gap identification and gamified challenges.', requiredSkills: ['React', 'Node.js', 'MongoDB'] },
  { _id: 'prob_6', problemId: 'PS006', title: 'AgriTech Crop Disease Detection', domain: 'Agriculture', difficulty: 'Hard', organization: 'Agri Dept', description: 'Edge-powered computer vision model that diagnoses crop pathologies from leaf photography and prescribes treatments.', requiredSkills: ['AI', 'Python', 'React Native'] },
  { _id: 'prob_7', problemId: 'PS007', title: 'Carbon Footprint Tracker', domain: 'Sustainability', difficulty: 'Medium', organization: 'Green Earth', description: 'Automated carbon emission auditor for cloud architectures and distributed supply chains.', requiredSkills: ['Vue', 'Express', 'PostgreSQL'] },
  { _id: 'prob_8', problemId: 'PS008', title: 'Web3 Decentralized Voting', domain: 'Web3', difficulty: 'Expert', organization: 'Election Commission', description: 'Tamper-proof verifiable voting protocol utilizing zero-knowledge proofs and Ethereum smart contracts.', requiredSkills: ['Solidity', 'React', 'Web3.js'] }
];

export const INITIAL_TEAMS = [
  {
    _id: 'team_nexus',
    name: 'Nexus AI',
    problem: INITIAL_PROBLEMS[0],
    leader: 'usr_arjun',
    members: [
      { user: INITIAL_DEMO_USERS[0], role: 'Full Stack Lead' },
      { user: INITIAL_DEMO_USERS[1], role: 'AI/ML Lead' }
    ],
    aiSummary: 'Arjun Mehta leads a complementary team covering 10 distinct skills with balanced full-stack and AI expertise.',
    compatibilityScore: 94
  },
  {
    _id: 'team_codecraft',
    name: 'CodeCraft',
    problem: INITIAL_PROBLEMS[2],
    leader: 'usr_rahul',
    members: [
      { user: INITIAL_DEMO_USERS[4], role: 'Backend Lead' },
      { user: INITIAL_DEMO_USERS[5], role: 'DevOps Lead' }
    ],
    aiSummary: 'Robust backend and cloud infrastructure pairing with high execution resilience.',
    compatibilityScore: 91
  },
  {
    _id: 'team_blockvote',
    name: 'BlockVote',
    problem: INITIAL_PROBLEMS[7],
    leader: 'usr_vikram',
    members: [
      { user: INITIAL_DEMO_USERS[12], role: 'Web3 Lead' },
      { user: INITIAL_DEMO_USERS[9], role: 'Security Lead' }
    ],
    aiSummary: 'Specialized blockchain cryptography team with deep security and auditing synergy.',
    compatibilityScore: 93
  }
];

export const INITIAL_TASKS = [
  { _id: 'tsk_1', team: 'team_nexus', title: 'Set up Vite + Tailwind UI Layout', status: 'completed', priority: 'high', assignedTo: INITIAL_DEMO_USERS[0] },
  { _id: 'tsk_2', team: 'team_nexus', title: 'Train PyTorch image classification model', status: 'completed', priority: 'high', assignedTo: INITIAL_DEMO_USERS[1] },
  { _id: 'tsk_3', team: 'team_nexus', title: 'Connect Real-time Socket.io Chat', status: 'in-progress', priority: 'medium', assignedTo: INITIAL_DEMO_USERS[0] },
  { _id: 'tsk_4', team: 'team_nexus', title: 'Deploy prototype to cloud demo container', status: 'todo', priority: 'high', assignedTo: INITIAL_DEMO_USERS[1] }
];

export const INITIAL_PROJECTS = [
  {
    _id: 'proj_nexus',
    team: 'team_nexus',
    title: 'MedAI Triage & Clinical Assistant',
    description: 'Autonomous medical triage assistant combining deep-learning Grad-CAM medical imaging classifier with RAG-based diagnostic triage.',
    problem: INITIAL_PROBLEMS[0],
    techStack: ['React', 'Python', 'FastAPI', 'PyTorch', 'Tailwind CSS', 'MongoDB'],
    githubUrl: 'https://github.com/hackmatch/medai-demo',
    demoUrl: 'https://dhakshii008.github.io/HackMatch-AI/',
    videoUrl: 'https://youtube.com/watch?v=demo',
    innovation: 'Multi-agent diagnostic verification combining vision Transformers and clinical knowledge graphs.',
    isSubmitted: true,
    submittedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_SUBMISSIONS = [
  {
    _id: 'sub_nexus',
    submissionId: 'HM-2026-NEXUS',
    team: INITIAL_TEAMS[0],
    project: INITIAL_PROJECTS[0],
    submittedBy: INITIAL_DEMO_USERS[0],
    status: 'submitted',
    autoEvalScore: 88,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const INITIAL_EVALUATIONS = [
  {
    _id: 'eval_nexus',
    submission: 'sub_nexus',
    team: 'team_nexus',
    judge: INITIAL_DEMO_USERS[15],
    scores: {
      innovation: 9,
      technicalExecution: 9,
      presentation: 9,
      impact: 9
    },
    totalScore: 90,
    feedback: 'Outstanding technical depth and clear complementary collaboration. Clean UI and solid AI integration.',
    status: 'evaluated'
  }
];

export const INITIAL_CERTIFICATES = [
  {
    _id: 'cert_arjun_1',
    certificateId: 'HM-CERT-2026-ARJ101',
    user: INITIAL_DEMO_USERS[0],
    userName: 'Arjun Mehta',
    team: INITIAL_TEAMS[0],
    teamName: 'Nexus AI',
    projectTitle: 'MedAI Triage & Clinical Assistant',
    hackathonName: 'HackMatch AI 2026',
    type: 'winner',
    awardTitle: 'Grand Winner - 1st Prize',
    issueDate: new Date().toISOString(),
    verificationUrl: 'https://dhakshii008.github.io/HackMatch-AI/verify/HM-CERT-2026-ARJ101'
  },
  {
    _id: 'cert_priya_1',
    certificateId: 'HM-CERT-2026-PRI202',
    user: INITIAL_DEMO_USERS[1],
    userName: 'Priya Sharma',
    team: INITIAL_TEAMS[0],
    teamName: 'Nexus AI',
    projectTitle: 'MedAI Triage & Clinical Assistant',
    hackathonName: 'HackMatch AI 2026',
    type: 'winner',
    awardTitle: 'Grand Winner - 1st Prize',
    issueDate: new Date().toISOString(),
    verificationUrl: 'https://dhakshii008.github.io/HackMatch-AI/verify/HM-CERT-2026-PRI202'
  }
];

// In-Memory / LocalStorage database manager
class DemoStore {
  constructor() {
    this.init();
  }

  get(key, fallback) {
    try {
      const data = localStorage.getItem(`hackmatch_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(`hackmatch_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota or error:', e);
    }
  }

  init() {
    if (!this.get('users', null)) this.set('users', INITIAL_DEMO_USERS);
    if (!this.get('problems', null)) this.set('problems', INITIAL_PROBLEMS);
    if (!this.get('teams', null)) this.set('teams', INITIAL_TEAMS);
    if (!this.get('tasks', null)) this.set('tasks', INITIAL_TASKS);
    if (!this.get('projects', null)) this.set('projects', INITIAL_PROJECTS);
    if (!this.get('submissions', null)) this.set('submissions', INITIAL_SUBMISSIONS);
    if (!this.get('evaluations', null)) this.set('evaluations', INITIAL_EVALUATIONS);
    if (!this.get('certificates', null)) this.set('certificates', INITIAL_CERTIFICATES);
    if (!this.get('requests', null)) this.set('requests', { sent: [], received: [] });
    if (!this.get('messages', null)) {
      this.set('messages', [
        { _id: 'msg_1', team: 'team_nexus', sender: INITIAL_DEMO_USERS[0], text: 'Hey Priya! I finished the main navigation and theme layout.', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: 'msg_2', team: 'team_nexus', sender: INITIAL_DEMO_USERS[1], text: 'Awesome Arjun! The FastAPI model serving endpoint is deployed and returning 96% accuracy.', createdAt: new Date(Date.now() - 3600000).toISOString() }
      ]);
    }
    if (!this.get('notifications', null)) {
      this.set('notifications', [
        { _id: 'notif_1', userId: 'usr_arjun', type: 'match', title: 'High AI Compatibility Match!', message: 'Priya Sharma shares matching problem interests with 94% complementary skills.', createdAt: new Date().toISOString() },
        { _id: 'notif_2', userId: 'usr_arjun', type: 'team', title: 'Team Nexus AI Formed', message: 'You and Priya Sharma are now collaborating on PS001 Smart Healthcare AI Assistant.', createdAt: new Date().toISOString() }
      ]);
    }
  }

  // Find user by email or ID
  getUser(identifier) {
    const users = this.get('users', INITIAL_DEMO_USERS);
    return users.find(u => u._id === identifier || u.email.toLowerCase() === String(identifier).toLowerCase());
  }

  // AI Matching Algorithm emulation (exact match to backend logic)
  getMatches(currentUserId) {
    const users = this.get('users', INITIAL_DEMO_USERS);
    const currentUser = users.find(u => u._id === currentUserId) || users[0];
    const userSkills = (currentUser.skills || []).map(s => s.toLowerCase());

    const otherUsers = users.filter(u => u._id !== currentUser._id && u.role === 'participant');

    return otherUsers.map(u => {
      const theirSkills = (u.skills || []).map(s => s.toLowerCase());
      let complementScore = 0;
      theirSkills.forEach(skill => {
        if (!userSkills.includes(skill)) complementScore += 10;
      });
      const overlapCount = theirSkills.filter(s => userSkills.includes(s)).length;
      const overlapBonus = Math.min(30, overlapCount * 5);
      const score = Math.min(99, Math.max(55, complementScore + overlapBonus + 40));
      const complementarity = Math.min(100, Math.round(50 + (complementScore / Math.max(1, theirSkills.length * 10)) * 50));

      const uniqueSkills = theirSkills.filter(s => !userSkills.includes(s));
      const sharedSkills = theirSkills.filter(s => userSkills.includes(s));

      const reasons = uniqueSkills.length > 0
        ? [`Brings ${uniqueSkills.slice(0, 3).join(', ')} expertise you don't have — high complementarity!`]
        : [`Shares ${sharedSkills.slice(0, 2).join(', ')} knowledge for stronger collaboration.`];
      if (uniqueSkills.length > 2) reasons.push(`Covers ${uniqueSkills.length} domain skills outside your primary stack.`);

      // Check relationship status
      const requests = this.get('requests', { sent: [], received: [] });
      let status = 'AVAILABLE';
      if (currentUser.teamId && u.teamId && currentUser.teamId === u.teamId) {
        status = 'ALREADY_TEAMMATE';
      } else if (requests.sent.some(r => r.receiver?._id === u._id && r.status === 'pending')) {
        status = 'REQUEST_SENT';
      }

      return {
        _id: u._id,
        user: u,
        score,
        matchScore: score,
        complementarity,
        roles: uniqueSkills.length ? uniqueSkills.slice(0, 2) : ['Full Stack Developer'],
        reasons,
        uniqueSkills,
        sharedSkills,
        status
      };
    }).sort((a, b) => b.score - a.score);
  }
}

export const demoStore = new DemoStore();
