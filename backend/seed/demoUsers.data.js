/**
 * 15 Predefined Demo Accounts for HackMatch AI
 *
 * Each participant has a distinct profile, complementary skills,
 * realistic hackathon background, and valid credentials.
 * Password for all 15 demo accounts: Demo@123
 */

const DEMO_PASSWORD = 'Demo@123';

const COLLEGES = [
  'Anna University',
  'VIT Vellore',
  'SRM Institute of Science & Technology',
  'PSG College of Technology',
  'SSN College of Engineering',
  'Amrita Vishwa Vidyapeetham',
  'Sathyabama Institute',
  'Karunya Institute of Technology',
  'Madurai Kamaraj University',
  'Sri Shakthi Institute of Engineering & Technology'
];

const DEMO_USERS_CONFIG = [
  {
    name: 'Arjun',
    email: 'arjun@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Anna University',
    role: 'participant',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'WebSockets', 'Tailwind CSS'],
    techSkills: ['Full Stack Development', 'MERN Stack', 'REST API', 'Socket.io'],
    softSkills: ['Problem Solving', 'Leadership', 'Collaboration'],
    frameworks: ['React', 'Express', 'Tailwind CSS'],
    tools: ['Git', 'GitHub', 'Postman', 'VS Code'],
    languages: ['JavaScript', 'HTML/CSS', 'English'],
    technicalInterests: ['Real-time Collaboration', 'Progressive Web Apps', 'WebRTC', 'Full Stack Architecture'],
    problemInterests: ['Social Impact', 'Healthcare', 'Education'],
    experience: ['Full Stack Intern (6 months)', 'Built 4 production web apps for student clubs'],
    projects: [
      { name: 'CollabSpace', description: 'Real-time collaborative workspace with live cursors and chat.', tech: ['React', 'Node.js', 'Socket.io'], link: 'https://github.com/arjun/collabspace' }
    ],
    githubUrl: 'https://github.com/arjun',
    linkedinUrl: 'https://linkedin.com/in/arjun',
    portfolioUrl: 'https://github.com/arjun/collabspace',
    bio: 'Full-stack MERN builder passionate about real-time web applications and collaborative platforms.',
    profileStrength: 94,
    aiSkillScore: 93
  },
  {
    name: 'Priya',
    email: 'priya@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Anna University',
    role: 'participant',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'FastAPI', 'PyTorch'],
    techSkills: ['Python', 'Machine Learning', 'Deep Learning', 'FastAPI'],
    softSkills: ['Communication', 'Team Collaboration'],
    frameworks: ['TensorFlow', 'PyTorch', 'FastAPI'],
    tools: ['Git', 'GitHub', 'Docker', 'Postman'],
    languages: ['Python', 'English'],
    technicalInterests: ['Large Language Models', 'Retrieval Augmented Generation', 'Model Deployment', 'Explainable AI'],
    problemInterests: ['AI', 'Healthcare', 'Education'],
    experience: ['Machine Learning Intern at HealthTech (6 months)', 'Winner at National Hackathon 2024'],
    projects: [
      { name: 'MedAI', description: 'AI-assisted medical image diagnosis classifier with Grad-CAM.', tech: ['Python', 'TensorFlow', 'FastAPI'], link: 'https://github.com/priya/medai' },
      { name: 'HealthBot', description: 'RAG conversational health triaging assistant.', tech: ['Python', 'LangChain', 'FastAPI'], link: 'https://github.com/priya/healthbot' }
    ],
    githubUrl: 'https://github.com/priya',
    linkedinUrl: 'https://linkedin.com/in/priya',
    portfolioUrl: 'https://github.com/priya/medai',
    bio: 'AI/ML enthusiast focused on LLMs, computer vision, and building intelligent healthcare assistants.',
    profileStrength: 95,
    aiSkillScore: 94
  },
  {
    name: 'Karthik',
    email: 'karthik@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Anna University',
    role: 'participant',
    skills: ['Flutter', 'Firebase', 'React Native', 'UI/UX', 'Android', 'Figma'],
    techSkills: ['Cross-Platform Mobile', 'Flutter', 'Firebase Auth & Firestore', 'State Management'],
    softSkills: ['Creative Design', 'User Empathy', 'Rapid Prototyping'],
    frameworks: ['Flutter', 'React Native', 'Tailwind CSS'],
    tools: ['Figma', 'Android Studio', 'VS Code', 'Git'],
    languages: ['Dart', 'JavaScript', 'English'],
    technicalInterests: ['Mobile First Design', 'Offline Sync', 'Interactive Animations', 'Clean Architecture'],
    problemInterests: ['AI', 'Mobile', 'Education'],
    experience: ['Mobile Dev Lead for College Portal App', 'Winner at Smart India Hackathon Mobile Track'],
    projects: [
      { name: 'EduMobile', description: 'Offline-first gamified learning mobile app for rural students.', tech: ['Flutter', 'Firebase', 'SQLite'], link: 'https://github.com/karthik/edumobile' }
    ],
    githubUrl: 'https://github.com/karthik',
    linkedinUrl: 'https://linkedin.com/in/karthik',
    portfolioUrl: 'https://github.com/karthik/edumobile',
    bio: 'Mobile application developer creating buttery-smooth user experiences on Android and iOS.',
    profileStrength: 91,
    aiSkillScore: 90
  },
  {
    name: 'Meera',
    email: 'meera@hackmatch.ai',
    department: 'Information Technology',
    year: '4th Year',
    college: 'VIT Vellore',
    role: 'participant',
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Microservices', 'Cloud'],
    techSkills: ['Enterprise Java', 'Spring Boot', 'Relational Databases', 'RESTful Services'],
    softSkills: ['Project Coordination', 'Agile Mindset', 'Analytical Problem Solving'],
    frameworks: ['Spring Boot', 'Hibernate', 'Maven'],
    tools: ['IntelliJ IDEA', 'MySQL Workbench', 'Docker', 'Postman'],
    languages: ['Java', 'SQL', 'English'],
    technicalInterests: ['Enterprise Software', 'Database Optimization', 'Cloud Microservices'],
    problemInterests: ['IoT', 'Smart Cities', 'Sustainability'],
    experience: ['Backend Software Intern at Enterprise IT (6 months)', 'Published paper on traffic scheduling algorithms'],
    projects: [
      { name: 'CityTransit', description: 'IoT transit tracker and automated dispatch API.', tech: ['Java', 'Spring Boot', 'MySQL'], link: 'https://github.com/meera/citytransit' }
    ],
    githubUrl: 'https://github.com/meera',
    linkedinUrl: 'https://linkedin.com/in/meera',
    portfolioUrl: 'https://github.com/meera/citytransit',
    bio: 'Enterprise backend developer building robust, reliable Spring Boot microservices and cloud architectures.',
    profileStrength: 92,
    aiSkillScore: 91
  },
  {
    name: 'Rahul',
    email: 'rahul@hackmatch.ai',
    department: 'Information Science',
    year: '3rd Year',
    college: 'Karunya Institute of Technology',
    role: 'participant',
    skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'Docker'],
    techSkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka'],
    softSkills: ['Communication', 'Code Review', 'System Design'],
    frameworks: ['Spring Boot', 'Hibernate', 'Spring Cloud'],
    tools: ['Docker', 'Kafka Tool', 'PostgreSQL', 'Git'],
    languages: ['Java', 'SQL', 'English'],
    technicalInterests: ['High Throughput Systems', 'Enterprise Architecture', 'Event-Driven Systems'],
    problemInterests: ['FinTech', 'E-Commerce', 'Logistics'],
    experience: ['Backend Intern at Enterprise Solutions (5 months)', 'Built resilient payment processing microservices'],
    projects: [
      { name: 'PayStream', description: 'High-throughput payment gateway mock with Kafka messaging.', tech: ['Java', 'Spring Boot', 'Kafka'], link: 'https://github.com/rahul/paystream' }
    ],
    githubUrl: 'https://github.com/rahul',
    linkedinUrl: 'https://linkedin.com/in/rahul',
    portfolioUrl: 'https://github.com/rahul/paystream',
    bio: 'Enterprise Java and Spring Boot developer focused on scalable, resilient microservices.',
    profileStrength: 90,
    aiSkillScore: 91
  },
  {
    name: 'Sneha',
    email: 'sneha@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    college: 'Madurai Kamaraj University',
    role: 'participant',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'DevOps'],
    techSkills: ['Cloud Computing', 'Docker', 'Kubernetes', 'AWS Lambda'],
    softSkills: ['Project Management', 'Agile Methodologies'],
    frameworks: ['Terraform', 'GitHub Actions', 'Docker Compose'],
    tools: ['Kubernetes', 'AWS', 'Grafana', 'Prometheus', 'Git'],
    languages: ['Go', 'Python', 'YAML', 'English'],
    technicalInterests: ['Site Reliability Engineering', 'GitOps', 'Cloud Native Security', 'Cost Optimization'],
    problemInterests: ['Sustainability', 'Education', 'AI'],
    experience: ['Cloud Operations Intern at DevOps Hub (6 months)', 'Certified AWS Solutions Architect Associate'],
    projects: [
      { name: 'KubeDeploy', description: 'Automated canary deployment operator with Prometheus alerts.', tech: ['Kubernetes', 'Docker', 'Go'], link: 'https://github.com/sneha/kubedeploy' }
    ],
    githubUrl: 'https://github.com/sneha',
    linkedinUrl: 'https://linkedin.com/in/sneha',
    portfolioUrl: 'https://github.com/sneha/kubedeploy',
    bio: 'DevOps engineer focused on infrastructure automation, container orchestration, and CI/CD pipelines.',
    profileStrength: 93,
    aiSkillScore: 92
  },
  {
    name: 'Dhakshitha',
    email: 'dhakshitha@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'Sri Shakthi Institute of Engineering & Technology',
    role: 'participant',
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'GraphQL'],
    techSkills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
    softSkills: ['Problem Solving', 'Teamwork', 'Communication'],
    frameworks: ['Express', 'Node.js', 'Mongoose'],
    tools: ['Docker', 'Postman', 'MongoDB Compass', 'Git'],
    languages: ['JavaScript', 'SQL', 'English'],
    technicalInterests: ['Distributed Systems', 'Cloud Architecture', 'Real-time WebSockets', 'API Gateway'],
    problemInterests: ['AI', 'Cybersecurity', 'FinTech'],
    experience: ['Backend Intern at CloudTech (5 months)', 'Built scalable authentication & chat systems'],
    projects: [
      { name: 'AuthShield', description: 'OAuth 2.0 & JWT security gateway with rate limiting.', tech: ['Node.js', 'MongoDB', 'Docker'], link: 'https://github.com/dhakshitha/authshield' },
      { name: 'StreamCore', description: 'High-throughput event streaming WebSocket service.', tech: ['Express', 'Redis', 'Socket.io'], link: 'https://github.com/dhakshitha/streamcore' }
    ],
    githubUrl: 'https://github.com/dhakshitha',
    linkedinUrl: 'https://linkedin.com/in/dhakshitha',
    portfolioUrl: 'https://github.com/dhakshitha/authshield',
    bio: 'Backend engineer building robust APIs, scalable microservices, and database architectures.',
    profileStrength: 94,
    aiSkillScore: 92
  },
  {
    name: 'Ananya',
    email: 'ananya@hackmatch.ai',
    department: 'Information Technology',
    year: '3rd Year',
    college: 'VIT Vellore',
    role: 'participant',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'UI/UX', 'Figma'],
    techSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    softSkills: ['Leadership', 'Creative Problem Solving'],
    frameworks: ['React', 'Next.js', 'Tailwind CSS'],
    tools: ['Figma', 'Git', 'GitHub', 'VS Code'],
    languages: ['JavaScript', 'TypeScript', 'English'],
    technicalInterests: ['Design Systems', 'Microfrontends', 'Responsive Web Apps', 'Web Performance'],
    problemInterests: ['Healthcare', 'FinTech', 'AI'],
    experience: ['Frontend Engineer Intern at FinTech Startup (4 months)', 'Lead UI/UX Designer for Tech Fest'],
    projects: [
      { name: 'PulseUI', description: 'Accessible design system and component library for health apps.', tech: ['React', 'TypeScript', 'Tailwind CSS'], link: 'https://github.com/ananya/pulseui' },
      { name: 'DashFlow', description: 'Real-time financial analytics dashboard.', tech: ['Next.js', 'TypeScript', 'Chart.js'], link: 'https://github.com/ananya/dashflow' }
    ],
    githubUrl: 'https://github.com/ananya',
    linkedinUrl: 'https://linkedin.com/in/ananya',
    portfolioUrl: 'https://github.com/ananya/pulseui',
    bio: 'Frontend specialist crafting slick, responsive UIs with modern React and Tailwind CSS.',
    profileStrength: 92,
    aiSkillScore: 90
  },
  {
    name: 'Kiran',
    email: 'kiran@hackmatch.ai',
    department: 'Data Science',
    year: '4th Year',
    college: 'PSG College of Technology',
    role: 'participant',
    skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Data Visualization', 'Tableau'],
    techSkills: ['Data Analysis', 'Python', 'SQL', 'Power BI'],
    softSkills: ['Analytical Thinking', 'Presentation'],
    frameworks: ['Pandas', 'NumPy', 'Scikit-learn'],
    tools: ['Tableau', 'Power BI', 'Jupyter', 'Git'],
    languages: ['Python', 'SQL', 'English'],
    technicalInterests: ['Big Data', 'ETL Pipelines', 'Statistical Analysis', 'Predictive Modeling'],
    problemInterests: ['FinTech', 'Agriculture', 'Sustainability'],
    experience: ['Data Analyst Intern at AnalyticsCorp (6 months)', 'Published paper on crop yield prediction'],
    projects: [
      { name: 'FinPulse', description: 'Market trend predictive analytics dashboard.', tech: ['Python', 'SQL', 'Tableau'], link: 'https://github.com/kiran/finpulse' }
    ],
    githubUrl: 'https://github.com/kiran',
    linkedinUrl: 'https://linkedin.com/in/kiran',
    portfolioUrl: 'https://github.com/kiran/finpulse',
    bio: 'Data analyst turning complex metrics into visual stories and predictive insights.',
    profileStrength: 89,
    aiSkillScore: 88
  },
  {
    name: 'Kishor',
    email: 'kishor@hackmatch.ai',
    department: 'Cybersecurity',
    year: '3rd Year',
    college: 'SSN College of Engineering',
    role: 'participant',
    skills: ['Cybersecurity', 'Penetration Testing', 'Linux', 'Cryptography', 'Python', 'Networking'],
    techSkills: ['Ethical Hacking', 'Network Security', 'Linux', 'Burp Suite'],
    softSkills: ['Critical Thinking', 'Adaptability'],
    frameworks: ['Scapy', 'Cryptography', 'Flask'],
    tools: ['Burp Suite', 'Wireshark', 'Metasploit', 'Nmap'],
    languages: ['Python', 'Bash', 'English'],
    technicalInterests: ['Zero Trust Architecture', 'Threat Hunting', 'SIEM', 'Cloud Security'],
    problemInterests: ['Cybersecurity', 'Web3', 'FinTech'],
    experience: ['Security Analyst Intern at SecOps (3 months)', 'Bug bounty hunter with 12 CVE findings'],
    projects: [
      { name: 'SecAudit', description: 'Automated vulnerability scanner for web microservices.', tech: ['Python', 'Linux', 'Docker'], link: 'https://github.com/kishor/secaudit' }
    ],
    githubUrl: 'https://github.com/kishor',
    linkedinUrl: 'https://linkedin.com/in/kishor',
    portfolioUrl: 'https://github.com/kishor/secaudit',
    bio: 'Security researcher passionate about finding vulnerabilities and safeguarding applications.',
    profileStrength: 91,
    aiSkillScore: 89
  },
  {
    name: 'Harnish',
    email: 'harnish@hackmatch.ai',
    department: 'Electronics & Communication',
    year: '3rd Year',
    college: 'Amrita Vishwa Vidyapeetham',
    role: 'participant',
    skills: ['IoT', 'Arduino', 'ESP32', 'Embedded C', 'Raspberry Pi', 'MQTT'],
    techSkills: ['Embedded Systems', 'IoT Protocols', 'C++', 'Sensors'],
    softSkills: ['Rapid Prototyping', 'Hands-on Hardware'],
    frameworks: ['FreeRTOS', 'Arduino IDE', 'ESP-IDF'],
    tools: ['MQTT Explorer', 'KiCad', 'Oscilloscope', 'Git'],
    languages: ['C', 'C++', 'Python', 'English'],
    technicalInterests: ['Smart Cities', 'Sensor Networks', 'Edge Computing', 'Robotics'],
    problemInterests: ['IoT', 'Agriculture', 'Sustainability'],
    experience: ['Smart Agriculture IoT Prototype Lead', 'Hardware Hackathon 1st Runner-Up'],
    projects: [
      { name: 'AgriSense', description: 'Soil moisture and temperature edge sensor network.', tech: ['ESP32', 'MQTT', 'Node.js'], link: 'https://github.com/harnish/agrisense' }
    ],
    githubUrl: 'https://github.com/harnish',
    linkedinUrl: 'https://linkedin.com/in/harnish',
    portfolioUrl: 'https://github.com/harnish/agrisense',
    bio: 'IoT and hardware builder connecting physical sensors to real-time cloud analytics.',
    profileStrength: 88,
    aiSkillScore: 87
  },
  {
    name: 'Divya',
    email: 'divya@hackmatch.ai',
    department: 'Computer Science & Design',
    year: '2nd Year',
    college: 'Sathyabama Institute',
    role: 'participant',
    skills: ['UI/UX', 'Figma', 'Prototyping', 'User Research', 'React', 'CSS'],
    techSkills: ['Figma', 'UI Design', 'Wireframing', 'Design Systems'],
    softSkills: ['Empathy', 'Visual Communication', 'Creativity'],
    frameworks: ['Tailwind CSS', 'Framer Motion', 'React'],
    tools: ['Figma', 'Adobe XD', 'Illustrator', 'Notion'],
    languages: ['JavaScript', 'HTML/CSS', 'English'],
    technicalInterests: ['Design Thinking', 'Accessibility (a11y)', 'Interaction Design', 'Micro-animations'],
    problemInterests: ['Education', 'Healthcare', 'Social Impact'],
    experience: ['Freelance UI/UX Designer for 5 client apps', 'College Design Club Lead'],
    projects: [
      { name: 'EduFlow', description: 'Accessible learning platform design system and wireframes.', tech: ['Figma', 'React'], link: 'https://github.com/divya/eduflow' }
    ],
    githubUrl: 'https://github.com/divya',
    linkedinUrl: 'https://linkedin.com/in/divya',
    portfolioUrl: 'https://github.com/divya/eduflow',
    bio: 'Product designer creating clean, accessible, and human-centered user experiences.',
    profileStrength: 87,
    aiSkillScore: 86
  },
  {
    name: 'Vikram',
    email: 'vikram@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    college: 'SRM Institute of Science & Technology',
    role: 'participant',
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Rust', 'Node.js'],
    techSkills: ['Smart Contracts', 'Blockchain Development', 'Web3 Architecture', 'Solidity Security'],
    softSkills: ['Strategic Thinking', 'Consensus Building', 'Technical Writing'],
    frameworks: ['Hardhat', 'Truffle', 'Ethers.js'],
    tools: ['MetaMask', 'Remix IDE', 'Ganache', 'Git'],
    languages: ['Solidity', 'Rust', 'JavaScript', 'English'],
    technicalInterests: ['Decentralized Autonomous Organizations', 'DeFi Protocols', 'Zero-Knowledge Proofs', 'Smart Contract Auditing'],
    problemInterests: ['Web3', 'FinTech', 'Cybersecurity'],
    experience: ['Blockchain Developer Intern at Web3 Lab (5 months)', 'Winner of Ethereum India Hackathon 2024'],
    projects: [
      { name: 'VoteChain', description: 'Decentralized anonymous voting system backed by zk-SNARK verification.', tech: ['Solidity', 'Web3.js', 'React'], link: 'https://github.com/vikram/votechain' }
    ],
    githubUrl: 'https://github.com/vikram',
    linkedinUrl: 'https://linkedin.com/in/vikram',
    portfolioUrl: 'https://github.com/vikram/votechain',
    bio: 'Web3 & blockchain engineer creating secure smart contracts, DeFi protocols, and decentralized governance systems.',
    profileStrength: 93,
    aiSkillScore: 92
  },
  {
    name: 'Pooja',
    email: 'pooja@hackmatch.ai',
    department: 'Information Technology',
    year: '3rd Year',
    college: 'PSG College of Technology',
    role: 'participant',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
    techSkills: ['Cross-Platform Mobile Apps', 'React Native', 'Native Android/iOS', 'GraphQL APIs'],
    softSkills: ['User Experience Focus', 'Cross-Team Communication', 'Attention to Detail'],
    frameworks: ['React Native', 'Expo', 'Apollo Client'],
    tools: ['Xcode', 'Android Studio', 'Flipper', 'Postman'],
    languages: ['JavaScript', 'TypeScript', 'Swift', 'Kotlin', 'English'],
    technicalInterests: ['High Performance Mobile', 'Animated Transitions', 'Push Notification Pipelines', 'Offline-First DBs'],
    problemInterests: ['Healthcare', 'Mobile', 'Social Impact'],
    experience: ['Mobile App Developer Intern at HealthSync (4 months)', 'Published 2 cross-platform apps with 10k+ downloads'],
    projects: [
      { name: 'CarePulse', description: 'Patient monitoring mobile application connecting with Bluetooth health sensors.', tech: ['React Native', 'GraphQL', 'Firebase'], link: 'https://github.com/pooja/carepulse' }
    ],
    githubUrl: 'https://github.com/pooja',
    linkedinUrl: 'https://linkedin.com/in/pooja',
    portfolioUrl: 'https://github.com/pooja/carepulse',
    bio: 'Cross-platform mobile engineer delivering fluid mobile experiences with React Native, Flutter, and native code.',
    profileStrength: 90,
    aiSkillScore: 89
  },
  {
    name: 'Siddharth',
    email: 'siddharth@hackmatch.ai',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    college: 'SSN College of Engineering',
    role: 'participant',
    skills: ['Python', 'PyTorch', 'LangChain', 'Kafka', 'Apache Spark', 'HuggingFace'],
    techSkills: ['Natural Language Processing', 'Data Engineering', 'Vector Databases', 'Deep Learning'],
    softSkills: ['Analytical Rigor', 'Technical Mentorship', 'Curiosity'],
    frameworks: ['PyTorch', 'LangChain', 'FastAPI', 'HuggingFace Transformers'],
    tools: ['ChromaDB', 'Pinecone', 'Kafka', 'Docker', 'Jupyter'],
    languages: ['Python', 'SQL', 'English'],
    technicalInterests: ['Agentic AI Workflows', 'Vector Embeddings', 'Distributed Stream Processing', 'Autonomous Agents'],
    problemInterests: ['AI', 'Data Engineering', 'Sustainability'],
    experience: ['AI Research Intern at National AI Labs (6 months)', 'Co-authored paper on semantic vector retrieval'],
    projects: [
      { name: 'AgentMesh', description: 'Autonomous multi-agent task execution framework with dynamic tool retrieval.', tech: ['Python', 'LangChain', 'FastAPI', 'ChromaDB'], link: 'https://github.com/siddharth/agentmesh' }
    ],
    githubUrl: 'https://github.com/siddharth',
    linkedinUrl: 'https://linkedin.com/in/siddharth',
    portfolioUrl: 'https://github.com/siddharth/agentmesh',
    bio: 'Data and AI engineer crafting multi-agent workflows, vector search pipelines, and intelligent retrieval systems.',
    profileStrength: 94,
    aiSkillScore: 93
  }
];

const DEMO_USERS = DEMO_USERS_CONFIG.map((u) => ({
  ...u,
  password: DEMO_PASSWORD,
  isDemoAccount: true,
  hackathonHistory: [
    { name: 'Smart India Hackathon 2024', year: '2024', result: 'Finalist' }
  ],
  achievements: u.experience.map((e) => e.split('(')[0].trim())
}));

module.exports = {
  DEMO_USERS,
  DEMO_PASSWORD,
  DEMO_USERS_CONFIG
};
