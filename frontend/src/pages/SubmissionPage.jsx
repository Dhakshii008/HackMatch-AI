import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import api from '../services/api';
import { CheckCircle2, AlertCircle, UploadCloud, Link as LinkIcon, FileText, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmissionPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [project, setProject] = useState(null);
  const [userContext, setUserContext] = useState({ hasTeam: false, hasProblem: false });
  
  const [formData, setFormData] = useState({
    githubUrl: '',
    demoUrl: '',
    videoUrl: '',
    presentationUrl: '',
    innovation: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [subRes, projRes, teamRes, authRes] = await Promise.all([
          api.get('/submissions/my').catch(() => ({ data: { data: null } })),
          api.get('/projects/my').catch(() => ({ data: { data: null } })),
          api.get('/teams/my').catch(() => ({ data: { data: null } })),
          api.get('/auth/me').catch(() => ({ data: { data: null } })),
        ]);

        const foundSubmission = subRes.data?.data || null;
        const foundProject = projRes.data?.data || projRes.data?.project || null;
        const foundTeam = teamRes.data?.data || null;
        const me = authRes.data?.data || null;

        setSubmission(foundSubmission);
        setProject(foundProject);
        setUserContext({
          hasTeam: !!foundTeam,
          hasProblem: !!foundProject?.problem || !!me?.selectedProblem || !!foundProject?.title,
        });

        // Pre-fill from anything already saved on the project.
        if (foundProject) {
          setFormData(prev => ({
            githubUrl: foundProject.githubUrl || prev.githubUrl,
            demoUrl: foundProject.demoUrl || prev.demoUrl,
            videoUrl: foundProject.videoUrl || prev.videoUrl,
            presentationUrl: foundProject.presentationUrl || prev.presentationUrl,
            innovation: foundProject.innovation || prev.innovation,
          }));
        }
      } catch (err) {
        console.error('Failed to load submission data:', err);
        toast.error('Failed to load submission data');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async () => {
    if(!window.confirm('⚠️ This action is irreversible. Your project will be locked for judging. Are you absolutely sure you want to submit?')) return;

    setSubmitting(true);
    try {
      const res = await api.post('/submissions', formData);
      const saved = res.data?.data;
      if (saved) {
        setSubmission({
          _id: saved.submissionId,
          timestamp: saved.submittedAt,
        });
        toast.success(res.data?.alreadySubmitted ? 'This project was already submitted' : 'Project successfully submitted!');
      } else {
        throw new Error('No submission returned by server');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const checks = [
    { label: 'Team Formed (2+ members)', valid: userContext.hasTeam },
    { label: 'Problem Statement Selected', valid: userContext.hasProblem },
    { label: 'Project Description Added', valid: !!project?.title },
    { label: 'GitHub Repository Linked', valid: !!formData.githubUrl.trim() },
    { label: 'Live Demo Link Provided', valid: !!formData.demoUrl.trim() },
  ];
  
  const canSubmit = checks.every(c => c.valid);

  if (loading && !submission) {
    return <div className="flex h-64 items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (submission) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center relative animate-in zoom-in duration-500">
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']} />
        
        <GlassCard className="p-12 border-green-500/50 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-500/30">
            <Lock size={12}/> LOCKED
          </div>

          <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-3">Project Submitted ✓</h2>
          <p className="text-gray-300 mb-10 text-lg">Your solution is now being evaluated by the AI engine.</p>
          
          <div className="bg-black/40 p-6 rounded-2xl inline-block w-full max-w-sm mb-10 border border-white/10 shadow-inner">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Official Submission ID</div>
            <div className="text-2xl font-mono text-blue-400 font-bold tracking-wider">{submission._id}</div>
            <div className="text-xs text-gray-500 mt-4">Submitted at {new Date(submission.timestamp).toLocaleString()}</div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NeonButton onClick={() => navigate('/certificates')} className="px-8 py-4 text-lg">View My Certificates</NeonButton>
            <NeonButton onClick={() => navigate('/evaluation')} className="px-10 py-4 text-lg">View AI Evaluation Results</NeonButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-2"><UploadCloud className="text-pink-500"/> Final Submission</h1>
        <p className="text-gray-400 text-lg">Review your checklist and submit your final project details.</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <GlassCard className="p-6 border-t-4 border-t-blue-500 sticky top-24">
            <h3 className="font-bold mb-6 text-lg">Pre-submission Checklist</h3>
            <ul className="space-y-4">
              {checks.map((c, i) => (
                <li key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${c.valid ? 'bg-green-500/5 border-green-500/20 text-gray-200' : 'bg-red-500/5 border-red-500/20 text-gray-400'}`}>
                  {c.valid ? <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={18}/> : <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18}/>}
                  <span className="text-sm font-medium">{c.label}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-sm text-blue-300">
                All checklist items must be completed before the "Final Submit" button becomes active.
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Submission Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <LinkIcon size={16} className="text-blue-400"/> GitHub Repository URL
                </label>
                <input 
                  type="url" 
                  value={formData.githubUrl}
                  onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="https://github.com/your-repo"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <LinkIcon size={16} className="text-pink-400"/> Live Demo URL
                </label>
                <input 
                  type="url" 
                  value={formData.demoUrl}
                  onChange={e => setFormData({...formData, demoUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="https://your-demo.vercel.app"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <LinkIcon size={16} className="text-red-400"/> Video Presentation URL
                </label>
                <input 
                  type="url" 
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="YouTube, Vimeo, or Loom link"
                />
                <p className="text-xs text-gray-500 mt-2">Max 3 minutes. Explain your innovation clearly.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <FileText size={16} className="text-amber-400"/> PPT / Slide Deck / Prototype URL
                </label>
                <input 
                  type="url" 
                  value={formData.presentationUrl}
                  onChange={e => setFormData({...formData, presentationUrl: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="https://slides.google.com/... or Figma prototype link"
                />
                <p className="text-xs text-gray-500 mt-2">Optional. Google Slides, PDF presentation, or Figma prototype link.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
                  <FileText size={16} className="text-green-400"/> Innovation Summary
                </label>
                <textarea 
                  rows="4"
                  value={formData.innovation}
                  onChange={e => setFormData({...formData, innovation: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" 
                  placeholder="What makes your solution unique? Describe the technical innovation..."
                />
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <button 
                onClick={handleSubmit} 
                disabled={!canSubmit || submitting || loading}
                className={`w-full py-4 rounded-xl text-lg font-black tracking-wide transition-all ${
                  canSubmit 
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)]' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'LOCK & SUBMIT PROJECT'}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
