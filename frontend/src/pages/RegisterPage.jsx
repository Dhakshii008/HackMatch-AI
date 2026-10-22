import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Building, BookOpen, Phone, Github, Linkedin, Plus, X, Zap } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AnimatedBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
  </div>
);

const InputField = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, required, extra }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />}
      {extra || (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${Icon ? 'pl-10' : 'pl-4'}`}
        />
      )}
    </div>
  </div>
);

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', department: '', year: '', phone: '',
    githubUrl: '', linkedinUrl: '', skills: [],
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
    }
    setSkillInput('');
  };
  const removeSkill = (s) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } };

  const validateStep1 = () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return false; }
    if (!formData.email.includes('@')) { toast.error('Valid email required'); return false; }
    if (formData.password.length < 6) { toast.error('Password must be 6+ characters'); return false; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.college) { toast.error('College name is required'); return; }
    try {
      const { confirmPassword, ...payload } = formData;
      const user = await register(payload);
      toast.success(`Welcome to HackMatch AI, ${user?.name?.split(' ')[0]}! 🚀`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all";

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <AnimatedBg />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(139,92,246,0.5)]">HM</div>
            <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">HackMatch AI</span>
          </Link>
          <h1 className="text-3xl font-extrabold mb-2">Join the Hackathon</h1>
          <p className="text-gray-400">Create your account and start your journey</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/10 text-gray-500'}`}>{s}</div>
              {s < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 -mt-6 mb-6 px-1">
          <span className={step >= 1 ? 'text-purple-400' : ''}>Account Setup</span>
          <span className={step >= 2 ? 'text-purple-400' : ''}>Profile Details</span>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); if (validateStep1()) setStep(2); } : handleSubmit}>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User size={20} className="text-purple-400" /> Account Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Your full name" required value={formData.name} onChange={set('name')} className={`${inputCls} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" placeholder="you@example.com" required value={formData.email} onChange={set('email')} className={`${inputCls} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" required value={formData.password} onChange={set('password')} className={`${inputCls} pl-10 pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="password" placeholder="Repeat password" required value={formData.confirmPassword} onChange={set('confirmPassword')} className={`${inputCls} pl-10`} />
                  </div>
                </div>

                <button type="submit" className="w-full mt-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all">
                  Continue →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Building size={20} className="text-blue-400" /> Profile Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">College / University *</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="Your college name" required value={formData.college} onChange={set('college')} className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Department</label>
                    <div className="relative">
                      <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="text" placeholder="e.g., Computer Science" value={formData.department} onChange={set('department')} className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Year of Study</label>
                    <select value={formData.year} onChange={set('year')} className={`${inputCls} appearance-none`}>
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={set('phone')} className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">GitHub URL</label>
                    <div className="relative">
                      <Github size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="url" placeholder="https://github.com/you" value={formData.githubUrl} onChange={set('githubUrl')} className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">LinkedIn URL</label>
                    <div className="relative">
                      <Linkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="url" placeholder="https://linkedin.com/in/you" value={formData.linkedinUrl} onChange={set('linkedinUrl')} className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., React, Python, AI…"
                      className={`${inputCls} flex-1`}
                    />
                    <button type="button" onClick={addSkill} className="px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/30 hover:bg-purple-600/50 transition-all flex items-center gap-1 text-purple-300">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[36px]">
                    {formData.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-sm text-purple-200">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
                      </span>
                    ))}
                    {formData.skills.length === 0 && <span className="text-xs text-gray-600 self-center">Add your technical skills above</span>}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-medium text-gray-300">
                    ← Back
                  </button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <><div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Creating Account...</>
                    ) : (
                      <><Zap size={18} /> Create My Account</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already a member?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
