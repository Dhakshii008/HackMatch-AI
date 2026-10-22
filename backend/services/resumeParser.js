/**
 * Real resume text extraction + skill detection.
 *
 * Uses pdf-parse to read the actual text out of the uploaded PDF, then matches
 * it against a fixed skill taxonomy. No random values: the same PDF always
 * produces the same result, and two different resumes produce different skills.
 */
const fs = require('fs');
const pdfParseModule = require('pdf-parse');

/**
 * Canonical skill vocabulary. `category` is only used to group the results for
 * display. Matching is case-insensitive and word-boundary aware so "Go" does
 * not match inside "Google".
 */
const SKILL_TAXONOMY = [
  // Languages
  { name: 'JavaScript', category: 'Language' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Python', category: 'Language' },
  { name: 'Java', category: 'Language' },
  { name: 'C++', category: 'Language', patterns: ['c\\+\\+'] },
  { name: 'C', category: 'Language', patterns: ['\\bc\\b'] },
  { name: 'PHP', category: 'Language' },
  { name: 'Ruby', category: 'Language' },
  { name: 'Go', category: 'Language', patterns: ['\\bgolang\\b', '\\bgo\\b'] },
  { name: 'Rust', category: 'Language' },
  { name: 'Kotlin', category: 'Language' },
  { name: 'Swift', category: 'Language' },
  { name: 'Dart', category: 'Language' },
  { name: 'R', category: 'Language', patterns: ['\\br\\b'] },
  { name: 'SQL', category: 'Language' },
  { name: 'HTML', category: 'Language', patterns: ['\\bhtml5?\\b'] },
  { name: 'CSS', category: 'Language' },
  { name: 'Solidity', category: 'Language' },
  { name: 'MATLAB', category: 'Language' },
  { name: 'Scala', category: 'Language' },

  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend', patterns: ['next\\.?js'] },
  { name: 'Vue.js', category: 'Frontend', patterns: ['vue\\.?js', '\\bvue\\b'] },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Redux', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend', patterns: ['tailwind\\s?css', 'tailwind'] },
  { name: 'Bootstrap', category: 'Frontend' },
  { name: 'jQuery', category: 'Frontend' },
  { name: 'Svelte', category: 'Frontend' },
  { name: 'Webpack', category: 'Frontend' },
  { name: 'Vite', category: 'Frontend' },
  { name: 'Figma', category: 'Frontend' },
  { name: 'UI/UX', category: 'Frontend', patterns: ['ui\\s?/?\\s?ux', 'user experience', 'user interface'] },

  // Backend
  { name: 'Node.js', category: 'Backend', patterns: ['node\\.?js'] },
  { name: 'Express', category: 'Backend', patterns: ['\\bexpress\\b'] },
  { name: 'Django', category: 'Backend' },
  { name: 'Flask', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend', patterns: ['spring\\s?boot'] },
  { name: 'FastAPI', category: 'Backend', patterns: ['fast\\s?api'] },
  { name: 'Laravel', category: 'Backend' },
  { name: 'REST API', category: 'Backend', patterns: ['rest\\s?(api|apis|ful)', 'restful'] },
  { name: 'GraphQL', category: 'Backend' },
  { name: 'Microservices', category: 'Backend', patterns: ['micro\\s?services'] },
  { name: 'WebSockets', category: 'Backend', patterns: ['web\\s?sockets?'] },

  // Databases
  { name: 'MongoDB', category: 'Database', patterns: ['mongo\\s?db', 'mongo'] },
  { name: 'PostgreSQL', category: 'Database', patterns: ['post\\s?gres', 'postgres'] },
  { name: 'MySQL', category: 'Database', patterns: ['my\\s?sql'] },
  { name: 'Redis', category: 'Database' },
  { name: 'Elasticsearch', category: 'Database', patterns: ['elastic\\s?search'] },
  { name: 'Firebase', category: 'Database' },
  { name: 'SQLite', category: 'Database', patterns: ['sqlite'] },
  { name: 'Cassandra', category: 'Database' },
  { name: 'Oracle', category: 'Database' },

  // AI / ML
  { name: 'Machine Learning', category: 'AI/ML', patterns: ['machine\\s?learning', '\\bml\\b'] },
  { name: 'Deep Learning', category: 'AI/ML', patterns: ['deep\\s?learning'] },
  { name: 'NLP', category: 'AI/ML', patterns: ['\\bnlp\\b', 'natural language processing'] },
  { name: 'Computer Vision', category: 'AI/ML', patterns: ['computer\\s?vision', '\\bcv\\b'] },
  { name: 'TensorFlow', category: 'AI/ML', patterns: ['tensor\\s?flow'] },
  { name: 'PyTorch', category: 'AI/ML', patterns: ['py\\s?torch'] },
  { name: 'scikit-learn', category: 'AI/ML', patterns: ['scikit[- ]?learn', 'sklearn'] },
  { name: 'Keras', category: 'AI/ML' },
  { name: 'OpenCV', category: 'AI/ML', patterns: ['opencv'] },
  { name: 'Pandas', category: 'AI/ML' },
  { name: 'NumPy', category: 'AI/ML', patterns: ['numpy'] },
  { name: 'Matplotlib', category: 'AI/ML', patterns: ['matplotlib'] },
  { name: 'LangChain', category: 'AI/ML', patterns: ['lang\\s?chain'] },

  // Data
  { name: 'Data Visualization', category: 'Data', patterns: ['data\\s?visuali[sz]ation', 'dataviz'] },
  { name: 'Power BI', category: 'Data', patterns: ['power\\s?bi'] },
  { name: 'Tableau', category: 'Data' },
  { name: 'Statistics', category: 'Data' },
  { name: 'ETL', category: 'Data' },
  { name: 'Spark', category: 'Data', patterns: ['apache\\s?spark', '\\bspark\\b'] },
  { name: 'Airflow', category: 'Data' },
  { name: 'Data Modeling', category: 'Data', patterns: ['data\\s?model(ing|ling)'] },
  { name: 'Apache Kafka', category: 'Data', patterns: ['kafka'] },

  // Cloud / DevOps
  { name: 'AWS', category: 'Cloud', patterns: ['\\baws\\b', 'amazon web services'] },
  { name: 'GCP', category: 'Cloud', patterns: ['\\bgcp\\b', 'google cloud'] },
  { name: 'Azure', category: 'Cloud' },
  { name: 'Docker', category: 'Cloud' },
  { name: 'Kubernetes', category: 'Cloud', patterns: ['kubernetes', '\\bk8s\\b'] },
  { name: 'Terraform', category: 'Cloud' },
  { name: 'CI/CD', category: 'Cloud', patterns: ['ci\\s?/?\\s?cd', 'continuous integration'] },
  { name: 'Jenkins', category: 'Cloud' },
  { name: 'GitHub Actions', category: 'Cloud', patterns: ['github actions'] },
  { name: 'Linux', category: 'Cloud' },
  { name: 'DevOps', category: 'Cloud', patterns: ['dev\\s?ops'] },
  { name: 'Serverless', category: 'Cloud', patterns: ['server\\s?less', '\\blambda\\b'] },

  // Security
  { name: 'Cybersecurity', category: 'Security', patterns: ['cyber\\s?security', 'information security'] },
  { name: 'Penetration Testing', category: 'Security', patterns: ['pen(etration)?\\s?test(ing)?', '\\bpentest'] },
  { name: 'Networking', category: 'Security' },
  { name: 'Cryptography', category: 'Security', patterns: ['cryptography', 'cryptanalysis'] },
  { name: 'Burp Suite', category: 'Security', patterns: ['burp\\s?suite'] },
  { name: 'SIEM', category: 'Security', patterns: ['\\bsiem\\b'] },
  { name: 'Threat Analysis', category: 'Security', patterns: ['threat\\s?(analysis|modeling)'] },
  { name: 'OWASP', category: 'Security', patterns: ['owasp'] },

  // IoT / Embedded
  { name: 'Arduino', category: 'IoT' },
  { name: 'ESP32', category: 'IoT', patterns: ['esp\\s?32'] },
  { name: 'Raspberry Pi', category: 'IoT', patterns: ['raspberry\\s?pi'] },
  { name: 'Embedded C', category: 'IoT', patterns: ['embedded\\s?c'] },
  { name: 'MQTT', category: 'IoT' },
  { name: 'Robotics', category: 'IoT' },
  { name: 'Sensors', category: 'IoT', patterns: ['sensors?', 'iot'] },
  { name: 'Embedded Systems', category: 'IoT', patterns: ['embedded\\s?systems?'] },

  // Mobile
  { name: 'Android', category: 'Mobile' },
  { name: 'iOS', category: 'Mobile', patterns: ['\\bios\\b'] },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'React Native', category: 'Mobile', patterns: ['react\\s?native'] },
  { name: 'Jetpack Compose', category: 'Mobile', patterns: ['jetpack\\s?compose'] },

  // Blockchain
  { name: 'Smart Contracts', category: 'Blockchain', patterns: ['smart\\s?contracts?'] },
  { name: 'Web3.js', category: 'Blockchain', patterns: ['web3\\.?js', 'web3'] },
  { name: 'Ethereum', category: 'Blockchain' },
  { name: 'DeFi', category: 'Blockchain', patterns: ['\\bdefi\\b'] },
  { name: 'NFT', category: 'Blockchain', patterns: ['\\bnfts?\\b'] },

  // Practices / tooling
  { name: 'Git', category: 'Tooling' },
  { name: 'GitHub', category: 'Tooling' },
  { name: 'Postman', category: 'Tooling' },
  { name: 'Selenium', category: 'Tooling' },
  { name: 'JUnit', category: 'Tooling', patterns: ['junit'] },
  { name: 'Agile', category: 'Tooling', patterns: ['\\bagile\\b'] },
  { name: 'DSA', category: 'Tooling', patterns: ['data structures', '\\bdsa\\b'] },
];

const FRAMEWORK_HINTS = ['React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'Laravel', 'Flutter', 'TensorFlow', 'PyTorch', 'Bootstrap', 'Tailwind CSS', 'GraphQL'];

const EDUCATION_PATTERNS = [
  /\b(b\.?tech|bachelor of technology)\b/i,
  /\b(b\.?e\.?|bachelor of engineering)\b/i,
  /\b(b\.?sc\.?|bachelor of science)\b/i,
  /\b(m\.?tech|master of technology)\b/i,
  /\b(mba|master of business administration)\b/i,
  /\b(bca|bachelor of computer applications)\b/i,
  /\b(mca|master of computer applications)\b/i,
  /\b(bachelor of pharmacy|b\.pharm)\b/i,
  /\b(higher secondary|hsc|12th)\b/i,
  /\b(senior secondary|sslc|10th)\b/i,
  /\b(b\.?com|bachelor of commerce)\b/i,
  /\b(bachelor of arts|b\.?a\.?)\b/i,
];

const NOISE_PREFIX = /^\s*[-•*▸●○▪◦]?\s*/;

const cleanLine = (line) =>
  line
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(NOISE_PREFIX, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Section headings commonly used in resumes, used to scope skill matching. */
const SKILLS_HEADING = /^\s*(technical\s+)?(skills?|tech(nical)?\s+stack|technologies|toolkit|competencies)\s*:?\s*$/i;
const SUMMARY_HEADING = /^\s*(summary|professional summary|objective|profile|about( me)?|career objective)\s*:?\s*$/i;
const OTHER_HEADING = /^\s*[A-Z][A-Z /&]{2,30}\s*:?\s*$/;

/** A line that looks like "Role, Company (Mon 2025 - Dec 2025)". */
const EMPLOYER_LINE = /(\b(19|20)\d{2}\b)|(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b)/i;

/**
 * Extract text from a PDF, returning '' for a non-PDF/encrypted/unreadable file
 * rather than throwing.
 *
 * pdf-parse changed its public API in v2 (default export is a module object with
 * a PDFParse class, not a callable function), so both shapes are supported here
 * instead of assuming one version.
 */
const readPdfText = async (filePath) => {
  const buffer = fs.readFileSync(filePath);

  // v2: { PDFParse } -> new PDFParse({ data }).getText()
  if (pdfParseModule && typeof pdfParseModule.PDFParse === 'function') {
    const parser = new pdfParseModule.PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      // v2 returns { text, pages: [{ text }] }
      return result?.text || (result?.pages || []).map((p) => p.text || '').join('\n') || '';
    } finally {
      await parser.destroy?.();
    }
  }

  // v1: module itself is callable and returns a promise.
  if (typeof pdfParseModule === 'function') {
    const parsed = await pdfParseModule(buffer);
    return parsed?.text || '';
  }

  throw new Error('Unsupported pdf-parse version');
};

/**
 * @param {string} filePath
 * @returns {Promise<{text:string, skills:string[], skillScores:object, frameworks:string[],
 *   languages:string[], experience:string[], education:string[], summary:string}>}
 */
const extractResume = async (filePath) => {
  const text = await readPdfText(filePath);
  const lower = ` ${text.toLowerCase().replace(/[\r\n]+/g, ' ')} `;
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);

  // ---- locate the explicit skills section (if any)
  const skillsStart = lines.findIndex((l) => SKILLS_HEADING.test(l));
  let skillsEnd = lines.length;
  if (skillsStart !== -1) {
    for (let i = skillsStart + 1; i < lines.length; i++) {
      if (OTHER_HEADING.test(lines[i])) { skillsEnd = i; break; }
    }
  }
  const inSkillsSection = (lineText, lineIndex) =>
    skillsStart !== -1 && lineIndex > skillsStart && lineIndex < skillsEnd;

  // ---- skills
  const strong = [];
  const weak = [];
  const skillScores = {};

  for (const entry of SKILL_TAXONOMY) {
    const patterns = [entry.name, ...(entry.patterns || [])];

    let inSection = false;
    let inBody = false;
    let occurrences = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const matched = patterns.some((p) => {
        try {
          return new RegExp(`(^|[^a-z0-9+#])${p}([^a-z0-9+#]|$)`, 'i').test(line);
        } catch {
          return false;
        }
      });
      if (!matched) continue;

      occurrences += (patterns.filter((p) => {
        try {
          return new RegExp(`(^|[^a-z0-9+#])${p}([^a-z0-9+#]|$)`, 'gi').test(lines[i]);
        } catch {
          return false;
        }
      }).length);

      if (inSkillsSection(lines[i], i)) { inSection = true; continue; }

      // A hit on an "Engineer, SomeRobotics (2024 - 2025)" line is a company
      // name, not a claimed skill, so it only counts as weak evidence.
      if (EMPLOYER_LINE.test(lines[i])) continue;
      inBody = true;
    }

    if (!inSection && !inBody) continue;

    (inSection || occurrences > 0 ? strong : weak).push(entry.name);

    // Deterministic "confidence": explicit skills-section listing scores
    // highest, then repeats elsewhere. Never random.
    const base = inSection ? 74 : 58;
    skillScores[entry.name] = Math.min(
      98,
      base + (inSection ? 12 : 0) + Math.min(occurrences, 4) * 3
    );
  }

  // Prefer skills the resume actually listed; only fall back to weak matches
  // if that leaves too few to be useful.
  let skills = [...strong];
  if (skills.length < 3) skills = [...strong, ...weak].filter((s) => !skills.includes(s));
  skills = skills.slice(0, 20);

  // ---- spoken languages (only if the resume actually mentions them)
  const languageMap = {
    English: ['english'],
    Tamil: ['tamil'],
    Hindi: ['hindi'],
    Telugu: ['telugu'],
    Malayalam: ['malayalam'],
    Kannada: ['kannada'],
    French: ['french'],
    German: ['german'],
    Spanish: ['spanish'],
  };
  const spoken = Object.entries(languageMap)
    .filter(([, words]) => words.some((w) => lower.includes(w)))
    .map(([name]) => name);
  const languages = spoken.length ? spoken : ['English'];

  // ---- experience / project lines
  const experienceKeywords =
    /(\b(intern|internship|engineer|developer|analyst|research|freelance|consultant|lead|manager|scientist|designer|administrator|associate|volunteer|worked at|experience at)\b)/i;
  const experience = [];
  for (const line of lines) {
    if (line.length < 12 || line.length > 160) continue;
    if (!experienceKeywords.test(line)) continue;
    if (/(email|phone|linkedin|github\.com|@)/i.test(line)) continue;
    experience.push(line);
    if (experience.length >= 6) break;
  }

  // ---- education
  const education = [];
  for (const p of EDUCATION_PATTERNS) {
    if (p.test(text)) {
      const m = text.match(p);
      education.push((m ? m[0] : p.source).toUpperCase());
      if (education.length >= 3) break;
    }
  }

  // ---- summary
  // Prefer the text under an explicit SUMMARY / OBJECTIVE / PROFILE heading,
  // because the first prose line of a resume is usually that intro paragraph
  // rather than a stray sentence from the contact block.
  let summary = '';
  const summaryIdx = lines.findIndex((l) => SUMMARY_HEADING.test(l));
  let pool = null;
  if (summaryIdx !== -1) {
    const body = [];
    for (let i = summaryIdx + 1; i < lines.length; i++) {
      if (OTHER_HEADING.test(lines[i])) break;
      body.push(lines[i]);
    }
    if (body.join(' ').trim().length > 40) pool = body.join(' ');
  }
  if (!pool) pool = text.replace(/\s+/g, ' ');

  const candidate = pool
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .find(
      (s) =>
        s.length > 50 &&
        s.length < 400 &&
        !/@|linkedin|github\.com|https?:/i.test(s) &&
        !/^(resume|curriculum vitae|cv)\b/i.test(s) &&
        // Skip bare section headings that leaked into the sentence stream.
        !/^(summary|objective|profile|education|skills?|experience|projects?)\b/i.test(s)
    );
  if (candidate) {
    summary = candidate.length > 280 ? candidate.slice(0, 277) + '...' : candidate;
  }

  const frameworks = skills.filter((s) => FRAMEWORK_HINTS.includes(s));

  return { text, skills, skillScores, frameworks, languages, experience, education, summary };
};

module.exports = { extractResume, SKILL_TAXONOMY };
