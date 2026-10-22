import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Users, Target, Zap, Shield, Award, ChevronRight, Cpu, Globe, BarChart2, CheckCircle, Sparkles } from 'lucide-react';

const AnimatedBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
  </div>
);

const timelineSteps = [
  { year: 'Step 1', title: 'Register & Upload Resume', desc: 'Create your account and upload your resume. Our AI instantly extracts your skills, experience, and expertise.' },
  { year: 'Step 2', title: 'AI Problem Matching', desc: 'Our AI analyzes your skills and recommends the most compatible problem statements with match scores up to 96%.' },
  { year: 'Step 3', title: 'Intelligent Team Formation', desc: 'AI finds your perfect teammates based on complementary skills, experience, and problem selection.' },
  { year: 'Step 4', title: 'Collaborate & Build', desc: 'Use our workspace — team chat, Kanban board, GitHub integration, and real-time collaboration tools.' },
  { year: 'Step 5', title: 'Submit & Evaluate', desc: 'Submit your project and receive instant AI-powered evaluation before judge review.' },
  { year: 'Step 6', title: 'Win & Get Certified', desc: 'Receive digitally verifiable certificates with QR codes, claim prizes, and celebrate your achievement.' },
];

const aiFeatures = [
  {
    icon: Brain,
    title: 'Resume Intelligence',
    desc: 'Upload your PDF resume and our AI extracts skills, experience, projects, and education — building your complete hackathon profile automatically.',
    color: 'from-blue-500 to-cyan-500',
    metrics: [{ label: 'Extraction Accuracy', value: '94%' }, { label: 'Skills Detected', value: '50+' }],
  },
  {
    icon: Target,
    title: 'Problem Intelligence',
    desc: 'Our matching algorithm compares your skill vector against problem requirements across 10 domains to find your highest-compatibility challenges.',
    color: 'from-purple-500 to-pink-500',
    metrics: [{ label: 'Match Accuracy', value: '96%' }, { label: 'Problem Domains', value: '10+' }],
  },
  {
    icon: Users,
    title: 'Team Intelligence',
    desc: 'Beyond simple skill matching, our AI analyzes skill complementarity, learning styles, and problem domain fit to build dream teams.',
    color: 'from-green-500 to-teal-500',
    metrics: [{ label: 'Team Compatibility', value: '91%' }, { label: 'Avg Team Size', value: '3.4' }],
  },
  {
    icon: BarChart2,
    title: 'Evaluation Intelligence',
    desc: 'Automated pre-screening scores your project on innovation, technical depth, impact, UI/UX, and scalability — saving judges hours of review.',
    color: 'from-orange-500 to-red-500',
    metrics: [{ label: 'Evaluation Criteria', value: '6' }, { label: 'Max Score', value: '100' }],
  },
  {
    icon: Shield,
    title: 'Certificate Intelligence',
    desc: 'Blockchain-inspired unique certificate IDs with QR codes allow anyone to verify your achievements instantly at any time.',
    color: 'from-cyan-500 to-blue-500',
    metrics: [{ label: 'Verification Speed', value: '< 1s' }, { label: 'Forgery Rate', value: '0%' }],
  },
];

const AboutPage = () => (
  <div className="text-white">
    <AnimatedBg />

    {/* Hero */}
    <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8">
          <Sparkles size={14} /> About HackMatch AI
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          The Future of
          <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Hackathon Ecosystems
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          HackMatch AI is India's first AI-powered end-to-end hackathon platform — from intelligent team formation to automated evaluation and blockchain-verified certificates.
        </p>
      </motion.div>
    </section>

    {/* What is HackMatch AI */}
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-3xl font-bold mb-6">What is HackMatch AI?</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>HackMatch AI is a <strong className="text-white">comprehensive hackathon management platform</strong> that uses artificial intelligence to solve the biggest pain points of traditional hackathons:</p>
            <ul className="space-y-3">
              {[
                'Finding the right problem statement for your skills',
                'Building a complementary team with the right expertise',
                'Managing collaborative project development',
                'Getting fair, objective, consistent evaluations',
                'Receiving verifiable, shareable achievement certificates',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
            <div className="text-center mb-6">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">HM</div>
              <div className="text-sm text-gray-400 mt-1">HackMatch AI Platform</div>
            </div>
            {[
              { label: 'Participants', value: '500+', color: 'text-blue-400' },
              { label: 'Problem Statements', value: '50+', color: 'text-purple-400' },
              { label: 'Teams Formed', value: '120+', color: 'text-cyan-400' },
              { label: 'Prizes Worth', value: '₹2.45L+', color: 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* How It Works Timeline */}
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-400">The complete hackathon journey — all in one platform</p>
      </div>
      <div className="space-y-4">
        {timelineSteps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex gap-6 items-start p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {i + 1}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* AI Features */}
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
          <Cpu size={14} /> AI Intelligence Layer
        </div>
        <h2 className="text-3xl font-bold mb-4">AI Powers Every Step</h2>
        <p className="text-gray-400">Five distinct AI systems work together to create the perfect hackathon experience</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiFeatures.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-1 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{feature.desc}</p>
              <div className="flex gap-3">
                {feature.metrics.map(m => (
                  <div key={m.label} className="flex-1 bg-black/30 rounded-xl p-3 text-center border border-white/5">
                    <div className={`font-bold text-lg bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>{m.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-6 max-w-5xl mx-auto text-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Innovate?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join HackMatch AI 2026 and be part of India's most intelligent hackathon ecosystem.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/register" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <Zap size={18} /> Register Now
          </Link>
          <Link to="/login" className="px-8 py-3.5 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-all flex items-center gap-2">
            <Globe size={18} /> Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  </div>
);

export default AboutPage;
