import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bot, Zap, Users, Trophy, BrainCircuit, Code, Shield,
  Cpu, Lightbulb, ChevronRight, CheckCircle2, Star, Github,
  ArrowRight, Heart, LayoutDashboard
} from 'lucide-react';
import useAuthStore from '../store/authStore';

/* ── Animated blob background ── */
const Bg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: '#050816' }}>
    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '1s' }} />
    <div className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', animationDelay: '2s' }} />
    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
  </div>
);

/* ── Simple count-up ── */
const Counter = ({ end, suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const num = parseInt(String(end).replace(/\D/g, '')) || 0;
    if (num === 0) return;
    let start = 0;
    const step = Math.ceil(num / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setVal(num); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{val}{suffix}</span>;
};

const steps = [
  { icon: '📄', title: 'Create Profile', desc: 'Register & upload your resume for AI skill extraction' },
  { icon: '🎯', title: 'Match Problems', desc: 'AI finds the best problem statements for your skills' },
  { icon: '🤝', title: 'Find Your Team', desc: 'AI matches you with complementary teammates' },
  { icon: '💻', title: 'Build Together', desc: 'Collaborate with real-time chat, tasks & GitHub' },
  { icon: '🚀', title: 'Submit Project', desc: 'Submit with auto AI evaluation + judge review' },
  { icon: '🏆', title: 'Win & Certify', desc: 'Get verified digital certificates with QR codes' },
];

const domains = [
  { name: 'Artificial Intelligence', icon: '🤖', color: '#3b82f6' },
  { name: 'FinTech', icon: '💰', color: '#22c55e' },
  { name: 'Healthcare', icon: '🏥', color: '#ef4444' },
  { name: 'Cybersecurity', icon: '🔒', color: '#f97316' },
  { name: 'IoT & Smart Cities', icon: '🏙️', color: '#06b6d4' },
  { name: 'Education Tech', icon: '📚', color: '#8b5cf6' },
  { name: 'Agriculture', icon: '🌾', color: '#84cc16' },
  { name: 'Web3 & Blockchain', icon: '⛓️', color: '#a855f7' },
];

const features = [
  { icon: BrainCircuit, title: 'AI Resume Parser', desc: 'Upload PDF → AI extracts all skills, experience & education automatically', color: '#3b82f6' },
  { icon: Bot, title: 'Smart Matching', desc: '96% accuracy in matching participants to the right problems', color: '#8b5cf6' },
  { icon: Users, title: 'Team Formation', desc: 'AI analyzes complementarity to build dream teams', color: '#22c55e' },
  { icon: Zap, title: 'Auto Evaluation', desc: 'Instant AI scoring across 6 criteria before judge review', color: '#f97316' },
  { icon: Shield, title: 'QR Certificates', desc: 'Tamper-proof digital certificates with live verification', color: '#06b6d4' },
  { icon: Trophy, title: 'Live Leaderboard', desc: 'Real-time rankings with scores and achievement badges', color: '#f59e0b' },
];

const stats = [
  { value: 500, suffix: '+', label: 'Participants' },
  { value: 50, suffix: '+', label: 'Problem Statements' },
  { value: 120, suffix: '+', label: 'Teams Formed' },
  { value: 245, suffix: 'K+', label: 'Prize Pool ₹' },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const targetHome = user?.role === 'judge' ? '/judge' : '/dashboard';

  return (
    <div className="min-h-screen text-white" style={{ background: '#050816' }}>
      <Bg />

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, background: 'rgba(5,8,22,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'white', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>HM</div>
            <span style={{ fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HackMatch AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            {isAuthenticated ? (
              <Link to={targetHome} style={{ padding: '8px 22px', borderRadius: 50, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 14, boxShadow: '0 0 15px rgba(59,130,246,0.4)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <LayoutDashboard size={16} /> Open Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ padding: '8px 20px', borderRadius: 50, border: '1px solid rgba(59,130,246,0.5)', color: '#60a5fa', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>Login</Link>
                <Link to="/register" style={{ padding: '8px 20px', borderRadius: 50, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 14, boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>Register Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', maxWidth: 900, margin: '0 auto', padding: '160px 1.5rem 80px' }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#93c5fd', fontSize: 13, marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            HackMatch AI 2026 — Registrations OPEN
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
            Where{' '}
            <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Great Minds
            </span>
            <br />Meet & Build the Future
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 20, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            India's first AI-powered hackathon ecosystem — intelligent team matching, real-time collaboration, auto evaluation, and verifiable certificates.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            {isAuthenticated ? (
              <Link to={targetHome} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 16, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
                <LayoutDashboard size={18} /> Open Your Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 16, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
                  <Zap size={18} /> Start Your Journey
                </Link>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>
                  Sign In <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Floating stat cards */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'AI Match Score', value: '94%', color: '#3b82f6' },
              { label: 'Team Compatibility', value: '91%', color: '#8b5cf6' },
              { label: 'Problem Match', value: '96%', color: '#22d3ee' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div style={{ fontSize: 42, fontWeight: 900, background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>How It Works</h2>
          <p style={{ color: '#64748b', fontSize: 16 }}>Complete hackathon lifecycle — all in one AI platform</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>{step.icon}</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: 50, border: '1px solid rgba(59,130,246,0.3)' }}>Step {i + 1}</span>
                  {step.title}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section style={{ padding: '80px 1.5rem', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>Problem Domains</h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Choose from 8 cutting-edge challenge areas</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {domains.map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1px solid ${d.color}30`, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{d.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: d.color }}>{d.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI FEATURES ── */}
      <section style={{ padding: '80px 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 50, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)', color: '#c4b5fd', fontSize: 13, marginBottom: 16 }}>
            <Cpu size={14} /> AI Intelligence Layer
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>AI Powers Everything</h2>
          <p style={{ color: '#64748b' }}>Six AI systems working together for the perfect hackathon</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}20`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} color={f.color} />
                </div>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{f.title}</div>
                <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '60px 40px', borderRadius: 24, background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to Build the Future?</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32 }}>Join 500+ participants in HackMatch AI 2026. Form your team, solve real problems, win ₹2.45L+ in prizes.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
              <Zap size={18} /> Register Now — It's Free
            </Link>
            <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, textDecoration: 'none' }}>
              Learn More <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 1.5rem', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>HM</div>
                <span style={{ fontWeight: 800, fontSize: 18 }}>HackMatch AI</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7 }}>India's most intelligent hackathon platform, powered by cutting-edge AI.</p>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 16, color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Platform</div>
              {['Dashboard', 'Problems', 'Find Teammates', 'Leaderboard', 'Certificates'].map(l => (
                <Link key={l} to="/login" style={{ display: 'block', color: '#64748b', textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>{l}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 16, color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Links</div>
              {[['About', '/about'], ['Register', '/register'], ['Login', '/login'], ['Prizes', '/login']].map(([l, href]) => (
                <Link key={l} to={href} style={{ display: 'block', color: '#64748b', textDecoration: 'none', fontSize: 14, marginBottom: 8 }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32, textAlign: 'center' }}>
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 8 }}>© 2026 HackMatch AI. All Rights Reserved.</p>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Built with <Heart size={14} color="#ef4444" fill="#ef4444" /> passion by{' '}
              <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>DHAKSHITHA MYLSAMY</span>
            </p>
            <p style={{ color: '#475569', fontSize: 13, fontStyle: 'italic' }}>Turning ideas into impact, one innovation at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
