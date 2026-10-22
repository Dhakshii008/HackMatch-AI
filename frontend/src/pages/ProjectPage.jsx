import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, Folder, Lightbulb, Code2, Zap, Globe, Github, Video, FileText, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const TagInput = ({ label, tags, onAdd, onRemove, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const s = input.trim();
    if (s && !tags.includes(s)) onAdd(s);
    setInput('');
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-blue-600/30 border border-blue-500/30 hover:bg-blue-600/50 transition-all"><Plus size={14} /></button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-xs font-medium text-blue-200">
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:text-red-400 transition-colors"><X size={10} /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

const ProjectPage = () => {
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', solution: '', innovation: '',
    impact: '', futureScope: '', architecture: '',
    githubUrl: '', demoUrl: '', videoUrl: '',
    techStack: [], features: [],
  });

  useEffect(() => { if (user?.teamId) fetchProject(); else setLoading(false); }, [user]);

  const fetchProject = async () => {
    try {
      const res = await api.get('/projects/my');
      if (res.data.data) {
        const p = res.data.data;
        setProject(p);
        setForm({
          title: p.title || '',
          description: p.description || '',
          solution: p.solution || '',
          innovation: p.innovation || '',
          impact: p.impact || '',
          futureScope: p.futureScope || '',
          architecture: p.architecture || '',
          githubUrl: p.githubUrl || '',
          demoUrl: p.demoUrl || '',
          videoUrl: p.videoUrl || '',
          techStack: p.techStack || [],
          features: p.features || [],
        });
      }
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Project title is required'); return; }
    setSaving(true);
    try {
      if (project) {
        const res = await api.put(`/projects/${project._id}`, form);
        setProject(res.data.data);
      } else {
        const res = await api.post('/projects', { ...form, team: user.teamId });
        setProject(res.data.data);
      }
      toast.success('Project details saved! 🚀');
    } catch (err) {
      toast.error('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const addToArray = (field) => (val) => setForm(p => ({ ...p, [field]: [...(p[field] || []), val] }));
  const removeFromArray = (field) => (val) => setForm(p => ({ ...p, [field]: p[field].filter(x => x !== val) }));

  const textAreaCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm resize-none";
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!user?.teamId) return (
    <div className="max-w-2xl mx-auto text-center mt-20">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10">
        <Folder size={64} className="mx-auto mb-6 text-gray-500" />
        <h2 className="text-2xl font-bold mb-4">Project Details</h2>
        <p className="text-gray-400 mb-6">You need to be part of a team to manage project details.</p>
        <a href="/teammates" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">Find Teammates →</a>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Folder className="text-blue-400" /> Project Details</h1>
          <p className="text-gray-400 text-sm mt-1">Fill in your project details before submission</p>
        </div>
        <button onClick={handleSave} disabled={saving || project?.isSubmitted}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          {saving ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save size={14} />}
          {project?.isSubmitted ? 'Submitted (Locked)' : 'Save Changes'}
        </button>
      </div>

      {project?.isSubmitted && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300">
          <ChevronRight size={16} /> Project submitted. Details are now locked.
        </div>
      )}

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2"><Folder size={16} className="text-blue-400" /> Basic Information</h2>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Title *</label>
          <input type="text" value={form.title} onChange={f('title')} placeholder="e.g., Smart Healthcare AI Assistant" className={inputCls} disabled={project?.isSubmitted} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Description</label>
          <textarea rows={4} value={form.description} onChange={f('description')} placeholder="Describe your project — what it does, who it's for, and why it matters..." className={textAreaCls} disabled={project?.isSubmitted} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Solution Approach</label>
          <textarea rows={3} value={form.solution} onChange={f('solution')} placeholder="How does your solution address the problem?" className={textAreaCls} disabled={project?.isSubmitted} />
        </div>
      </motion.div>

      {/* Innovation & Impact */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2"><Lightbulb size={16} className="text-yellow-400" /> Innovation & Impact</h2>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">What's Unique / Innovative</label>
          <textarea rows={3} value={form.innovation} onChange={f('innovation')} placeholder="What makes your solution unique compared to existing solutions?" className={textAreaCls} disabled={project?.isSubmitted} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Social / Technical Impact</label>
          <textarea rows={3} value={form.impact} onChange={f('impact')} placeholder="Who benefits from this solution? What is the scale of impact?" className={textAreaCls} disabled={project?.isSubmitted} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Future Scope / Roadmap</label>
          <textarea rows={2} value={form.futureScope} onChange={f('futureScope')} placeholder="What would you build next if you had more time?" className={textAreaCls} disabled={project?.isSubmitted} />
        </div>
      </motion.div>

      {/* Tech Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2"><Code2 size={16} className="text-cyan-400" /> Technical Stack</h2>
        {!project?.isSubmitted ? (
          <>
            <TagInput label="Tech Stack" tags={form.techStack} onAdd={addToArray('techStack')} onRemove={removeFromArray('techStack')} placeholder="e.g., React, Node.js, MongoDB..." />
            <TagInput label="Key Features" tags={form.features} onAdd={addToArray('features')} onRemove={removeFromArray('features')} placeholder="e.g., Real-time chat, AI matching..." />
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Tech Stack</label>
              <div className="flex flex-wrap gap-2">{form.techStack.map((t, i) => <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">{t}</span>)}</div>
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Architecture / System Design</label>
          <textarea rows={2} value={form.architecture} onChange={f('architecture')} placeholder="Describe your system architecture or paste a diagram description..." className={textAreaCls} disabled={project?.isSubmitted} />
        </div>
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2"><Zap size={16} className="text-purple-400" /> Project Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { field: 'githubUrl', label: 'GitHub Repository', placeholder: 'https://github.com/...', Icon: Github },
            { field: 'demoUrl', label: 'Live Demo URL', placeholder: 'https://yourapp.vercel.app', Icon: Globe },
            { field: 'videoUrl', label: 'Demo Video URL', placeholder: 'https://youtu.be/...', Icon: Video },
          ].map(({ field, label, placeholder, Icon }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="url" value={form[field]} onChange={f(field)} placeholder={placeholder} className={`${inputCls} pl-10`} disabled={project?.isSubmitted} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      {!project?.isSubmitted && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            {saving ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save size={16} />}
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
