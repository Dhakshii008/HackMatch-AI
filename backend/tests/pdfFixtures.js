/**
 * Dependency-free PDF writer used to build the test resumes for
 * demoDataset.test.js. Not part of the application.
 */

const escapeText = (s) =>
  s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** Build a single-page PDF that contains a real text layer. */
function buildTextPdf(lines) {
  let content = 'BT\n/F1 11 Tf\n14 TL\n56 760 Td\n';
  for (const line of lines) content += `(${escapeText(line)}) Tj\nT*\n`;
  content += 'ET\n';

  return assemble([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}endstream`,
  ]);
}

/** Build a valid PDF with no fonts and no text operators (an "image-only" scan). */
function buildScannedPdf() {
  return assemble([
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>',
    '<< /Length 5 >>\nstream\n  \nendstream',
  ]);
}

function assemble(objects) {
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefPos = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

const RESUMES = {
  'ananya-ai.pdf': [
    'ANANYA KRISHNAN',
    'ananya.krishnan@email.com | +91 98765 43210 | github.com/ananyak | linkedin.com/in/ananya-k',
    'SUMMARY',
    'Final year Computer Science student with hands-on experience in applied deep learning',
    'and computer vision. Built and deployed two production ML services. Comfortable owning',
    'a feature end to end from data pipeline to a monitored API.',
    'EDUCATION',
    'B.Tech Computer Science and Engineering, 2022 - 2026',
    'SKILLS',
    'Python, TensorFlow, PyTorch, Computer Vision, NLP, scikit-learn, Pandas, NumPy, OpenCV',
    'Docker, Git, Linux, REST API, FastAPI',
    'EXPERIENCE',
    'Machine Learning Intern, Zeta Robotics (June 2025 - December 2025)',
    'Built an object detection pipeline in PyTorch that improved mAP by 12 percent.',
  ],
  'harish-security.pdf': [
    'HARISH N',
    'harish.n@email.com | github.com/harishn',
    'SUMMARY',
    'Third year information technology student focused on offensive security and network',
    'engineering. Completed a professional cybersecurity certificate and ranked in the top',
    'ten percent of a national capture the flag competition.',
    'EDUCATION',
    'B.Tech Information Technology, 2023 - 2027',
    'SKILLS',
    'Cybersecurity, Penetration Testing, Networking, Linux, Python, SIEM, Burp Suite, Threat Analysis',
    'Cryptography, OWASP, Bash',
    'EXPERIENCE',
    'Security Analyst Intern, Cybernin (May 2025 - September 2025)',
    'Performed vulnerability assessments and wrote SIEM detection rules.',
  ],
  'rohit-backend.pdf': [
    'ROHIT DAS',
    'rohit.das@email.com | github.com/rohitd',
    'SUMMARY',
    'Backend developer who enjoys shipping reliable distributed services. Two years of',
    'professional Java and Spring Boot work with a strong interest in payment',
    'infrastructure and database performance.',
    'EDUCATION',
    'B.Tech Computer Science, 2021 - 2025',
    'SKILLS',
    'Java, Spring Boot, PostgreSQL, MySQL, Redis, MongoDB, REST API, Microservices, Docker',
    'Kubernetes, AWS, GitHub Actions, JUnit, Kafka',
    'EXPERIENCE',
    'Backend Developer, PayFlow Systems (July 2023 - Present)',
    'Migrated a monolithic checkout service to eight Spring Boot microservices.',
  ],
};

module.exports = { buildTextPdf, buildScannedPdf, RESUMES };
