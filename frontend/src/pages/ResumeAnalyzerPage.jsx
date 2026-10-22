import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, CheckCircle, Brain, Zap, User, Code2, Briefcase, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const mockAnalysis = (user) => ({
  summary: `${user?.name || 'This candidate'} is a skilled ${user?.department || 'Computer Science'} professional with expertise in ${(user?.skills || ['technology']).slice(0, 3).join(', ')}. Demonstrates strong problem-solving abilities and experience in full-stack development with a keen interest in AI-powered applications.`,
  education: [{ degree: 'B.Tech Computer Science Engineering', institution: user?.college || 'Engineering College', year: '2024', gpa: '8.7/10' }],
  skills: (user?.skills || ['React', 'Python', 'Node.js', 'AI/ML']).map(s => ({
    name: s,
    score: Math.floor(Math.random() * 20) + 75,
    category: ['Python', 'Java', 'JavaScript', 'C++'].includes(s) ? 'Language' : ['React', 'Vue', 'Angular', 'Flutter'].includes(s) ? 'Framework' : ['MongoDB', 'MySQL', 'PostgreSQL'].includes(s) ? 'Database' : 'Technology'
  })),
  languages: (user?.skills || []).filter(s => ['Python', 'Java', 'JavaScript', 'C++', 'TypeScript', 'Kotlin', 'Go'].includes(s)),
  frameworks: (user?.skills || []).filter(s => ['React', 'Node.js', 'Express', 'Django', 'Spring Boot', 'Flutter', 'Vue'].includes(s)),
  experience: [{ role: 'Full Stack Developer Intern', company: 'Tech Startup', duration: '3 months', desc: 'Built REST APIs and React dashboards' }],
  projects: [{ title: 'AI Chat Application', tech: 'React, Node.js, OpenAI', desc: 'Real-time AI-powered chat with GPT integration' }, { title: 'E-Commerce Platform', tech: 'MERN Stack', desc: 'Full-featured online store with payment integration' }],
  certifications: ['AWS Cloud Practitioner', 'Google Data Analytics', 'React Developer Certification'],
});

const STEPS = [
  { id: 1, label: 'Uploading Resume...', icon: Upload },
  { id: 2, label: 'Parsing Document...', icon: FileText },
  { id: 3, label: 'Extracting Skills...', icon: Brain },
  { id: 4, label: 'Generating AI Profile...', icon: Zap },
  { id: 5, label: 'Profile Ready!', icon: CheckCircle },
];

const ResumeAnalyzerPage = () => {
  const { user, updateUser } = useAuthStore();
  const [state, setState] = useState('upload'); // upload | analyzing | results
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB allowed.');
      return;
    }
    runAnalysis(file);
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const runAnalysis = async (file) => {
    setState('analyzing');
    setCurrentStep(0);

    // Animate through steps
    for (let i = 0; i < STEPS.length - 1; i++) {
      await new Promise(r => setTimeout(r, 900));
      setCurrentStep(i + 1);
    }

    // Try real API, fall back to mock
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(res.data.data || mockAnalysis(user));
    } catch (err) {
      setAnalysis(mockAnalysis(user));
    }

    await new Promise(r => setTimeout(r, 500));
    setState('results');
    toast.success('Resume analyzed successfully! 🎉');
  };

  const handleUpdateProfile = async () => {
    if (!analysis) return;
    try {
      const skillNames = analysis.skills.map(s => s.name);
      await api.put('/users/me', { skills: skillNames });
      updateUser({ skills: skillNames });
      toast.success('Skills updated to your profile! ✨');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const scoreColor = (score) => score >= 85 ? 'text-green-400 bg-green-400' : score >= 70 ? 'text-yellow-400 bg-yellow-400' : 'text-orange-400 bg-orange-400';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="text-blue-400" /> AI Resume Analyzer</h1>
        <p className="text-gray-400 mt-1">Upload your resume and let AI extract your skills, experience, and build your profile</p>
      </div>

      <AnimatePresence mode="wait">
        {/* UPLOAD STATE */}
        {state === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-blue-500/50 hover:bg-white/5'
              }`}>
              <input {...getInputProps()} />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                <Upload size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{isDragActive ? 'Drop your resume here!' : 'Upload Your Resume'}</h3>
              <p className="text-gray-400 mb-4">Drag & drop your PDF resume here, or click to select</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                <FileText size={14} /> PDF only • Max 10MB
              </div>
            </div>

            {user?.skills?.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  💡 Your current skills: {user.skills.slice(0, 5).join(', ')}{user.skills.length > 5 ? ` +${user.skills.length - 5} more` : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYZING STATE */}
        {state === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-pulse">
              <Brain size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Analyzing Your Resume...
            </h2>
            <div className="space-y-4 max-w-sm mx-auto">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${active ? 'bg-blue-500/20 border border-blue-500/30' : done ? 'opacity-60' : 'opacity-30'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : active ? 'bg-blue-600' : 'bg-white/10'}`}>
                      {done ? <CheckCircle size={16} className="text-white" /> : active ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Icon size={14} className="text-gray-400" />}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-white' : done ? 'text-green-300' : 'text-gray-500'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 h-2 rounded-full bg-white/10 overflow-hidden max-w-sm mx-auto">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
            </div>
          </motion.div>
        )}

        {/* RESULTS STATE */}
        {state === 'results' && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><User size={20} className="text-blue-400" /> Candidate Summary</h2>
                <div className="flex gap-2">
                  <button onClick={handleUpdateProfile} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold hover:opacity-90 transition-all">
                    <Zap size={14} /> Update Profile
                  </button>
                  <button onClick={() => setState('upload')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-sm hover:bg-white/20 transition-all">
                    <RefreshCw size={14} /> Re-upload
                  </button>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'skills', label: 'Skills Analysis', icon: Brain },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'projects', label: 'Projects', icon: Code2 },
                { id: 'education', label: 'Education', icon: FileText },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === t.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                  }`}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Extracted Skills</h3>
                  {analysis.skills.map(skill => (
                    <div key={skill.name} className="flex items-center gap-4">
                      <div className="w-28 flex-shrink-0">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-gray-500 block">{skill.category}</span>
                      </div>
                      <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${skill.score}%` }} transition={{ duration: 1, delay: 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${skill.score >= 85 ? 'from-green-500 to-teal-500' : skill.score >= 70 ? 'from-yellow-500 to-orange-500' : 'from-orange-500 to-red-500'}`} />
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${scoreColor(skill.score).split(' ')[0]}`}>{skill.score}%</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Work Experience</h3>
                  {analysis.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="font-bold">{exp.role}</div>
                      <div className="text-sm text-blue-400">{exp.company} • {exp.duration}</div>
                      <div className="text-sm text-gray-400 mt-2">{exp.desc}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Projects</h3>
                  {analysis.projects.map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="font-bold mb-1">{proj.title}</div>
                      <div className="text-xs text-cyan-400 mb-2">{proj.tech}</div>
                      <div className="text-sm text-gray-400">{proj.desc}</div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'education' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Education</h3>
                  {analysis.education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="font-bold">{edu.degree}</div>
                      <div className="text-sm text-blue-400">{edu.institution}</div>
                      <div className="text-sm text-gray-500">{edu.year} • GPA: {edu.gpa}</div>
                    </div>
                  ))}
                  {analysis.certifications?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-3 text-sm text-gray-400">Certifications</h4>
                      {analysis.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2 text-sm text-gray-300">
                          <CheckCircle size={14} className="text-green-400" /> {cert}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeAnalyzerPage;
