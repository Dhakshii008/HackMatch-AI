import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import api from '../services/api';
import { Crown, Github, Users, Target, MessageSquare, CheckSquare, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/teams/my');
        // Backend responds { success, data: team | null }.
        setTeam(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load team:', err);
        setError(err.response?.data?.message || 'Failed to load your team');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const copyCode = async () => {
    if (!team?.teamCode) return;
    try {
      await navigator.clipboard.writeText(team.teamCode);
      toast.success('Team code copied');
    } catch {
      toast.error('Could not copy team code');
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Users size={64} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Your AI Team is waiting</h1>
        <div className="text-gray-400 text-lg mb-8 max-w-lg">
          {error || 'Join forces with other innovators. Use our AI matchmaking to find the perfect complementary teammates for your project.'}
        </div>
        <Link to="/teammates">
          <NeonButton className="px-8 py-3 text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]">Find Teammates</NeonButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{team.name}</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-400 font-medium">
            <Target size={16} className="text-pink-400" />
            {team.problem?.title || team.problem?.domain || 'No problem selected'}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={copyCode} className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-sm font-mono hover:bg-white/5 transition-colors group">
            <span className="text-gray-500 group-hover:text-white">Code:</span> 
            <span className="font-bold text-blue-400">{team.teamCode}</span>
          </button>
          <NeonButton variant="outline"><Settings size={18} className="mr-1"/> Manage</NeonButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Users className="text-blue-400"/> Roster</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {(team.members || []).map((m, i) => {
              const isLeader = String(m.user?._id) === String(team.leader?._id);
              return (
              <motion.div key={m.user?._id || i} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}}>
                <GlassCard className={`p-5 hover:border-blue-500/30 transition-colors relative ${isLeader ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xl relative shadow-lg">
                      {(m.user?.name || '?')[0]}
                      {isLeader && <Crown size={16} className="absolute -top-3 -right-2 text-yellow-400 drop-shadow-md" />}
                    </div>
                    {m.user?.github && (
                      <a href={`https://github.com/${m.user.github}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors">
                        <Github size={18} />
                      </a>
                    )}
                  </div>
                  <h4 className="font-bold text-lg">{m.user?.name}</h4>
                  <div className="text-sm font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded w-fit mb-4 mt-1 capitalize">
                    {isLeader ? 'Team Leader' : (m.role || 'member')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(m.user?.skills || []).map(s => <span key={s} className="px-2 py-1 text-xs bg-black/40 border border-white/5 rounded text-gray-300">{s}</span>)}
                  </div>
                </GlassCard>
              </motion.div>
              );
            })}
            
            <GlassCard className="p-5 flex flex-col items-center justify-center border-dashed border-2 border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-colors cursor-pointer group min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-bold text-sm">Find more members</span>
            </GlassCard>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-purple-600/10" />
            <h3 className="font-bold text-gray-300 mb-6 relative z-10">AI Compatibility Score</h3>
            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center z-10">
              <svg className="w-full h-full -rotate-90 transform absolute inset-0">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className="text-green-400"
                  strokeDasharray="339.3"
                  initial={{ strokeDashoffset: 339.3 }}
                  animate={{ strokeDashoffset: 339.3 - (339.3 * (team.compatibilityScore || 0)) / 100 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-4xl font-black text-white">{team.compatibilityScore || 0}%</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed relative z-10 bg-black/20 p-4 rounded-xl border border-white/5 italic">
              "{team.aiSummary || 'No AI analysis available for this team yet.'}"
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/chat" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><MessageSquare size={16}/></div>
                <span className="font-medium text-sm">Open Team Chat</span>
              </Link>
              <Link to="/tasks" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><CheckSquare size={16}/></div>
                <span className="font-medium text-sm">View Tasks</span>
              </Link>
              <Link to="/project" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><Target size={16}/></div>
                <span className="font-medium text-sm">Project Details</span>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
