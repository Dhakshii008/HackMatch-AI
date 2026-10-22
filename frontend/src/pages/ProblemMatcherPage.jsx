import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Target, Search, Filter, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ProblemMatcherPage = () => {
  const { user } = useAuthStore();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [domainFilter, setDomainFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [sortParam, setSortParam] = useState('match'); // 'match', 'difficulty', 'latest'

  const domains = ['All', 'AI', 'FinTech', 'Healthcare', 'Cybersecurity', 'IoT', 'Education', 'Agriculture', 'Web3'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard', 'Expert'];

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        // Attempt match API first
        const res = await api.get('/problems/match').catch(() => api.get('/problems'));
        
        let data = res.data.data || [];
        
        // If data lacks match score, compute basic intersection score
        if (data.length > 0 && data[0].matchScore === undefined) {
          const userSkills = user?.skills?.map(s => s.toLowerCase()) || ['python', 'react', 'node.js'];
          data = data.map(p => {
            const pSkills = p.requiredSkills?.map(s => s.toLowerCase()) || [];
            let overlap = 0;
            pSkills.forEach(ps => { if(userSkills.includes(ps)) overlap++; });
            const score = pSkills.length ? Math.min(Math.round((overlap / pSkills.length) * 100) + 40, 99) : 85;
            return { ...p, matchScore: score };
          });
        }
        setProblems(data);
      } catch (err) {
        toast.error('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [user]);

  // Derived state
  const filteredProblems = problems
    .filter(p => domainFilter === 'All' || p.domain === domainFilter)
    .filter(p => diffFilter === 'All' || p.difficulty === diffFilter)
    .sort((a, b) => {
      if (sortParam === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortParam === 'difficulty') {
        const d = { 'Easy':1, 'Medium':2, 'Hard':3, 'Expert':4 };
        return (d[b.difficulty] || 0) - (d[a.difficulty] || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-400 stroke-green-400';
    if (score >= 75) return 'text-yellow-400 stroke-yellow-400';
    return 'text-red-400 stroke-red-400';
  };

  const getDomainColor = (domain) => {
    const colors = {
      'AI': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'FinTech': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Healthcare': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Cybersecurity': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[domain] || 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <Target className="text-blue-500" size={36} /> AI Problem Discovery
          </h1>
          <p className="text-gray-400 text-lg">Problems evaluated and ranked against your AI skill graph.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4 font-bold border-b border-white/10 pb-2">
              <Filter size={18}/> Filters
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Domain</label>
              <div className="flex flex-wrap gap-2">
                {domains.map(d => (
                  <button 
                    key={d} onClick={() => setDomainFilter(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${domainFilter === d ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                  >{d}</button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(d => (
                  <button 
                    key={d} onClick={() => setDiffFilter(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${diffFilter === d ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                  >{d}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Sort By</label>
              <select 
                value={sortParam} 
                onChange={e => setSortParam(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="match">Highest AI Match</option>
                <option value="difficulty">Difficulty</option>
                <option value="latest">Latest Added</option>
              </select>
            </div>
          </GlassCard>
        </div>

        {/* Problem List */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <GlassCard key={i} className="p-6 h-48 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : filteredProblems.length === 0 ? (
            <GlassCard className="p-16 text-center text-gray-400 flex flex-col items-center">
              <Search size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No problems found</h3>
              <p>Try adjusting your filters to discover more challenges.</p>
              <button onClick={() => {setDomainFilter('All'); setDiffFilter('All');}} className="mt-6 text-blue-400 hover:underline">Clear Filters</button>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredProblems.map((p, i) => (
                  <motion.div 
                    key={p._id || p.problemId || i}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, scale: 0.95}}
                    transition={{duration: 0.3, delay: i * 0.05}}
                  >
                    <GlassCard className="p-6 flex flex-col md:flex-row gap-6 hover:border-blue-500/30 transition-colors group">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-mono bg-black/40 border border-white/10 px-2 py-1 rounded text-gray-400">{p.problemId || `PS-${100+i}`}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${getDomainColor(p.domain)}`}>{p.domain || 'General'}</span>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white border border-white/10">{p.difficulty || 'Medium'}</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{p.title || 'Untitled Problem'}</h2>
                        <div className="text-sm text-gray-500 mb-4">{p.organization || 'HackMatch Partner'}</div>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {p.description || 'Solve this challenge to prove your skills and win amazing prizes.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(p.requiredSkills || ['Python', 'React', 'API']).slice(0,4).map(s => (
                            <span key={s} className="text-xs px-2 py-1 bg-black/30 border border-white/10 rounded-md text-gray-300">{s}</span>
                          ))}
                          {p.requiredSkills?.length > 4 && <span className="text-xs px-2 py-1 text-gray-500">+{p.requiredSkills.length - 4} more</span>}
                        </div>
                      </div>

                      <div className="md:w-48 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 pl-0 md:pl-6">
                        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90 transform absolute inset-0">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                            <motion.circle 
                              cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                              className={getMatchColor(p.matchScore || 0)}
                              strokeDasharray="251.2"
                              initial={{ strokeDashoffset: 251.2 }}
                              animate={{ strokeDashoffset: 251.2 - (251.2 * (p.matchScore || 0)) / 100 }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="text-center">
                            <div className={`text-xl font-black ${getMatchColor(p.matchScore || 0).split(' ')[0]}`}>{p.matchScore || 0}%</div>
                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Match</div>
                          </div>
                        </div>
                        
                        <div className="w-full space-y-2">
                          <Link to={`/problems/${p._id || p.problemId}`}>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                              View Details
                            </button>
                          </Link>
                          <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">
                            Select Problem
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemMatcherPage;
