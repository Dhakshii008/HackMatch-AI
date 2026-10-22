import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit3, Github, Linkedin, Globe, Award, Briefcase, Plus, X, CheckCircle, User, Building, BookOpen, Phone } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const skillColors = [
  'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
  'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
  'from-green-500/20 to-teal-500/20 border-green-500/30 text-green-300',
  'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300',
  'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
];

const SkillTag = ({ skill, index, onRemove }) => {
  const color = skillColors[index % skillColors.length];
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r border text-sm font-medium ${color}`}>
      {skill}
      {onRemove && (
        <button onClick={() => onRemove(skill)} className="hover:text-red-400 transition-colors ml-0.5">
          <X size={12} />
        </button>
      )}
    </span>
  );
};

const StatRing = ({ value, label, color }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - filled} style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: '', bio: '', college: '', department: '', year: '', phone: '',
    githubUrl: '', linkedinUrl: '', portfolioUrl: '', skills: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        college: user.college || '',
        department: user.department || '',
        year: user.year || '',
        phone: user.phone || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        skills: user.skills || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data.data);
      toast.success('Profile updated successfully! ✨');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (s) => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm";

  const profileStrength = Math.min(100, Math.round(
    ((user?.name ? 10 : 0) + (user?.bio ? 10 : 0) + (user?.college ? 10 : 0) +
    (user?.department ? 10 : 0) + (user?.skills?.length > 0 ? 15 : 0) +
    (user?.githubUrl ? 10 : 0) + (user?.linkedinUrl ? 10 : 0) +
    (user?.selectedProblem ? 15 : 0) + (user?.teamId ? 10 : 0))
  ));

  const aiSkillScore = user?.aiSkillScore || Math.min(99, 70 + (user?.skills?.length || 0) * 2);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-5xl font-extrabold shadow-[0_0_40px_rgba(59,130,246,0.4)]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#050816] ${user?.isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <h1 className="text-3xl font-extrabold">{user?.name || 'Hacker'}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                user?.role === 'admin' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                user?.role === 'judge' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>{user?.role || 'Participant'}</span>
            </div>
            <p className="text-gray-400 mb-2">{user?.department && `${user.department} • `}{user?.college}</p>
            <p className="text-gray-300 text-sm mb-4 max-w-xl">{user?.bio || 'No bio added yet. Click Edit Profile to add one.'}</p>

            {/* Links */}
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              {user?.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Github size={14} /> GitHub
                </a>
              )}
              {user?.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {user?.portfolioUrl && (
                <a href={user.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                  <Globe size={14} /> Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Stats rings */}
          <div className="flex gap-6">
            <StatRing value={profileStrength} label="Profile Strength" color="#3b82f6" />
            <StatRing value={aiSkillScore} label="AI Skill Score" color="#8b5cf6" />
          </div>
        </div>

        {/* Edit button */}
        <div className="mt-6 flex justify-end">
          {editing ? (
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save size={14} />}
                Save Profile
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition-all border border-white/10">
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
        </div>
      </motion.div>

      {/* Edit Form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Edit3 size={18} className="text-blue-400" /> Edit Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', field: 'name', placeholder: 'Your name' },
              { label: 'College', field: 'college', placeholder: 'Your college' },
              { label: 'Department', field: 'department', placeholder: 'e.g., CSE' },
              { label: 'Year', field: 'year', placeholder: 'e.g., 3rd Year' },
              { label: 'Phone', field: 'phone', placeholder: '+91 XXXXX XXXXX' },
              { label: 'GitHub URL', field: 'githubUrl', placeholder: 'https://github.com/...' },
              { label: 'LinkedIn URL', field: 'linkedinUrl', placeholder: 'https://linkedin.com/...' },
              { label: 'Portfolio URL', field: 'portfolioUrl', placeholder: 'https://yoursite.com' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                <input type="text" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} className={inputCls} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">Skills</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Add skill and press Enter..." className={`${inputCls} flex-1`} />
                <button type="button" onClick={addSkill} className="px-3 py-2 rounded-xl bg-blue-600/30 border border-blue-500/30 hover:bg-blue-600/50 transition-all"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((s, i) => <SkillTag key={s} skill={s} index={i} onRemove={removeSkill} />)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase size={18} className="text-purple-400" /> Technical Skills</h2>
          {(user?.skills?.length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s, i) => <SkillTag key={s} skill={s} index={i} />)}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No skills added yet. Upload your resume or edit your profile to add skills.</p>
          )}
        </motion.div>

        {/* AI Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none" />
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative">
            <span className="text-blue-400">🤖</span> AI Profile Summary
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed relative bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
            {user?.skills?.length > 0
              ? `Based on your skill profile, ${user.name?.split(' ')[0] || 'you'} excels in ${user.skills.slice(0, 3).join(', ')}. Your expertise makes you highly suitable for AI-powered development roles and hackathon challenges requiring full-stack innovation. Profile strength is ${profileStrength}% — ${profileStrength > 80 ? 'excellent!' : 'keep building your profile!'}`
              : 'Upload your resume and add skills to get your personalized AI profile summary.'
            }
          </p>
        </motion.div>

        {/* Hackathon History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-400" /> Hackathon Journey</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">HackMatch AI 2026</h4>
                <p className="text-xs text-gray-400">Current Participant • {user?.teamId ? 'Team Formed' : 'Looking for team'}</p>
              </div>
            </div>
            {(user?.hackathonHistory || []).map((h, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{h.name}</h4>
                  <p className="text-xs text-gray-400">{h.year} • {h.result}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-green-400" /> Achievements</h2>
          <div className="space-y-2">
            {(user?.achievements?.length > 0 ? user.achievements : ['Joined HackMatch AI 2026', 'Profile Created']).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-200">{a}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
