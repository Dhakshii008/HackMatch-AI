import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Building, Code2, CheckCircle, Users, Star, Zap, ChevronRight, BookOpen } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const DOMAIN_COLORS = {
  AI: 'from-blue-500 to-cyan-500 border-blue-500/30 bg-blue-500/10 text-blue-200',
  FinTech: 'from-green-500 to-teal-500 border-green-500/30 bg-green-500/10 text-green-200',
  Healthcare: 'from-red-500 to-pink-500 border-red-500/30 bg-red-500/10 text-red-200',
  Cybersecurity: 'from-orange-500 to-red-500 border-orange-500/30 bg-orange-500/10 text-orange-200',
  IoT: 'from-cyan-500 to-blue-500 border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  Education: 'from-purple-500 to-indigo-500 border-purple-500/30 bg-purple-500/10 text-purple-200',
  Agriculture: 'from-green-600 to-lime-500 border-green-500/30 bg-green-500/10 text-green-200',
  Sustainability: 'from-teal-500 to-green-500 border-teal-500/30 bg-teal-500/10 text-teal-200',
  Web3: 'from-violet-500 to-purple-500 border-violet-500/30 bg-violet-500/10 text-violet-200',
  SmartCities: 'from-blue-500 to-indigo-500 border-blue-500/30 bg-blue-500/10 text-blue-200',
};

const DIFF_COLORS = {
  Easy: 'text-green-300 border-green-500/30 bg-green-500/10',
  Medium: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
  Hard: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
  Expert: 'text-red-300 border-red-500/30 bg-red-500/10',
};

const TABS = ['Overview', 'Requirements', 'Evaluation', 'Submission'];

const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [problem, setProblem] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    fetchProblem();
    setSelected(user?.selectedProblem === id || user?.selectedProblem?._id === id);
  }, [id, user]);

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${id}`);
      setProblem(res.data.data);
      setMatchScore(res.data.matchScore || 75);
    } catch (err) {
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    setSelecting(true);
    try {
      await api.post(`/problems/${id}/select`);
      setSelected(true);
      toast.success(`Problem selected! 🎯 Now find your team.`);
    } catch (err) {
      toast.error('Failed to select problem');
    } finally {
      setSelecting(false);
    }
  };

  const scoreColor = matchScore >= 85 ? 'text-green-400' : matchScore >= 70 ? 'text-yellow-400' : 'text-orange-400';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!problem) return (
    <div className="text-center mt-20">
      <p className="text-gray-400">Problem not found.</p>
      <Link to="/problems" className="mt-4 inline-block text-blue-400 hover:underline">← Back to Problems</Link>
    </div>
  );

  const domainStyle = DOMAIN_COLORS[problem.domain] || DOMAIN_COLORS.AI;
  const diffStyle = DIFF_COLORS[problem.difficulty] || DIFF_COLORS.Medium;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Problems
      </button>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row gap-6 relative">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">{problem.problemId}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-gradient-to-r ${domainStyle}`}>{problem.domain}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diffStyle}`}>{problem.difficulty}</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-3 leading-tight">{problem.title}</h1>
            <p className="text-gray-400 text-sm mb-4 flex items-center gap-1.5">
              <Building size={14} /> {problem.organization || 'Government Organization'}
            </p>
            <p className="text-gray-300 leading-relaxed">{problem.description}</p>
          </div>

          {/* Score + Actions */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-black/30 rounded-2xl border border-white/10 p-6 text-center mb-4">
              <div className="text-xs text-gray-400 mb-2">AI Match Score</div>
              <div className={`text-5xl font-extrabold mb-1 ${scoreColor}`}>{matchScore}%</div>
              <div className="text-xs text-gray-500">Based on your skills</div>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${matchScore >= 85 ? 'bg-green-400' : matchScore >= 70 ? 'bg-yellow-400' : 'bg-orange-400'}`} style={{ width: `${matchScore}%`, transition: 'width 1s ease' }} />
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={handleSelect} disabled={selecting || selected}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  selected ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
                  'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                }`}>
                {selecting ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> :
                  selected ? <><CheckCircle size={14} /> Problem Selected!</> : <><Target size={14} /> Select This Problem</>}
              </button>
              <Link to="/teammates" className="w-full py-2.5 rounded-xl font-bold text-sm border border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                <Users size={14} /> Find Team Members
              </Link>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between"><span>Max Team Size</span><span className="text-gray-300">{problem.maxTeamSize || 4}</span></div>
              <div className="flex justify-between"><span>Participants</span><span className="text-gray-300">{problem.participants || 0}</span></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><BookOpen size={18} className="text-blue-400" /> Problem Statement</h3>
              <p className="text-gray-300 leading-relaxed">{problem.problemStatement || problem.description}</p>
            </div>
            {problem.existingChallenges?.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3">Existing Challenges</h3>
                <ul className="space-y-2">{problem.existingChallenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm"><ChevronRight size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />{c}</li>
                ))}</ul>
              </div>
            )}
            {problem.expectedSolution && (
              <div>
                <h3 className="font-bold text-lg mb-3">Expected Solution</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{problem.expectedSolution}</p>
              </div>
            )}
            {problem.expectedImpact && (
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-400" /> Expected Impact</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{problem.expectedImpact}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Requirements' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap size={18} className="text-purple-400" /> Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(problem.requiredSkills || []).map((s, i) => {
                  const has = (user?.skills || []).some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()));
                  return (
                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${has ? 'bg-green-500/10 border-green-500/30 text-green-200' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                      {has && <CheckCircle size={12} className="text-green-400" />}
                      {s}
                    </span>
                  );
                })}
              </div>
              {user?.skills?.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">✅ Green skills = skills you already have</p>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Code2 size={18} className="text-cyan-400" /> Recommended Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {(problem.technologies || []).map((t, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Evaluation' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Star size={18} className="text-yellow-400" /> Evaluation Criteria</h3>
            {[
              { name: 'Innovation', score: 20, desc: 'Novelty and creativity of the solution' },
              { name: 'Technical Implementation', score: 20, desc: 'Code quality, architecture, and functionality' },
              { name: 'Problem Relevance', score: 20, desc: 'How well the solution addresses the problem' },
              { name: 'Impact', score: 20, desc: 'Potential social, economic, or technological impact' },
              { name: 'UI/UX Design', score: 10, desc: 'User experience and interface design' },
              { name: 'Scalability', score: 10, desc: 'Ability to scale and extend the solution' },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="text-right w-12 flex-shrink-0">
                  <span className="font-bold text-lg text-white">{c.score}</span>
                  <span className="text-xs text-gray-500 block">pts</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.desc}</div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
              <span className="font-bold">Total Score</span>
              <span className="font-extrabold text-2xl text-blue-400">100 pts</span>
            </div>
          </div>
        )}

        {activeTab === 'Submission' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-4">Submission Requirements</h3>
            {[
              'Source code on GitHub (public or private with judge access)',
              'Live demo URL or video demonstration (max 5 minutes)',
              'Project presentation (PDF, max 20 slides)',
              'Technical documentation and README',
              'Architecture diagram',
              'Team member profiles and contributions',
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                {req}
              </div>
            ))}
            <div className="mt-6 flex gap-3">
              <Link to="/submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-center text-sm hover:opacity-90 transition-all">
                Submit Project
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProblemDetailPage;
