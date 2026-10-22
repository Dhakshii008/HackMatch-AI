import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import { Trophy, Medal, Search, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const LeaderboardPage = () => {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const teams = [
    { rank: 1, name: 'AI-Titans', proj: 'Smart Healthcare AI', col: 'NIT Trichy', score: 96, domain: 'Healthcare', isMine: true },
    { rank: 2, name: 'ByteBuilders', proj: 'FinTech Vault', col: 'IIT Madras', score: 92, domain: 'FinTech', isMine: false },
    { rank: 3, name: 'CodeCrafters', proj: 'EcoTrack System', col: 'BITS Pilani', score: 89, domain: 'Sustainability', isMine: false },
    { rank: 4, name: 'QuantumLeap', proj: 'Q-Encrypt API', col: 'VIT Vellore', score: 87, domain: 'Cybersecurity', isMine: false },
    { rank: 5, name: 'Visionaries', proj: 'Blind Assist AI', col: 'SRM Institute', score: 85, domain: 'AI', isMine: false },
    { rank: 6, name: 'DataMiners', proj: 'Market Predictor', col: 'IIT Delhi', score: 82, domain: 'FinTech', isMine: false },
  ];

  const top3 = teams.slice(0, 3);
  const others = teams.slice(3).filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.col.toLowerCase().includes(search.toLowerCase()));

  const getMedalStyles = (rank) => {
    if(rank === 1) return { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50', gradient: 'from-yellow-500/20 to-yellow-500/5' };
    if(rank === 2) return { color: 'text-gray-300', bg: 'bg-gray-300/20', border: 'border-gray-300/50', gradient: 'from-gray-400/20 to-gray-400/5' };
    return { color: 'text-amber-600', bg: 'bg-amber-600/20', border: 'border-amber-600/50', gradient: 'from-amber-700/20 to-amber-700/5' };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      <div className="text-center pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold mb-6 border border-blue-500/30">
          <Flame size={16} className="animate-pulse"/> Live Rankings
        </div>
        <h1 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Global Leaderboard
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">The best innovations of HackMatch AI 2026. Rankings are updated in real-time as evaluations complete.</p>
      </div>

      {/* Podium */}
      <div className="flex justify-center items-end gap-4 md:gap-8 h-72">
        {/* Rank 2 */}
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-28 md:w-48 relative">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-black/60 border-2 ${getMedalStyles(2).border} mb-4 z-10 shadow-lg`}>
            <Medal size={28} className={getMedalStyles(2).color} />
          </div>
          <div className={`w-full h-40 bg-gradient-to-t ${getMedalStyles(2).gradient} border-t-2 ${getMedalStyles(2).border} rounded-t-xl flex flex-col items-center pt-6 px-2 text-center`}>
            <span className="font-bold text-sm truncate w-full">{top3[1].name}</span>
            <span className="font-black text-2xl mt-2">{top3[1].score}</span>
          </div>
        </motion.div>

        {/* Rank 1 */}
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} className="flex flex-col items-center w-32 md:w-56 relative z-10">
          <div className="absolute -top-12 animate-bounce"><Crown size={40} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]"/></div>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-black/60 border-2 ${getMedalStyles(1).border} mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]`}>
            <Trophy size={40} className={getMedalStyles(1).color} />
          </div>
          <div className={`w-full h-52 bg-gradient-to-t ${getMedalStyles(1).gradient} border-t-4 ${getMedalStyles(1).border} rounded-t-xl flex flex-col items-center pt-8 px-2 text-center`}>
            <span className="font-bold text-lg truncate w-full text-yellow-100">{top3[0].name}</span>
            <span className="font-black text-4xl mt-2 text-yellow-400">{top3[0].score}</span>
          </div>
        </motion.div>

        {/* Rank 3 */}
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center w-28 md:w-48 relative">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-black/60 border-2 ${getMedalStyles(3).border} mb-4 z-10 shadow-lg`}>
            <Medal size={28} className={getMedalStyles(3).color} />
          </div>
          <div className={`w-full h-32 bg-gradient-to-t ${getMedalStyles(3).gradient} border-t-2 ${getMedalStyles(3).border} rounded-t-xl flex flex-col items-center pt-6 px-2 text-center`}>
            <span className="font-bold text-sm truncate w-full">{top3[2].name}</span>
            <span className="font-black text-2xl mt-2">{top3[2].score}</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto mt-16">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search teams or colleges..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        <GlassCard className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider font-bold">
              <tr>
                <th className="p-5 text-center w-20">Rank</th>
                <th className="p-5">Team Info</th>
                <th className="p-5 hidden md:table-cell">Project Domain</th>
                <th className="p-5 text-right w-32">Score</th>
              </tr>
            </thead>
            <tbody>
              {others.map((row, i) => (
                <motion.tr 
                  key={row.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${row.isMine ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : ''}`}
                >
                  <td className="p-5 text-center">
                    <span className="font-bold text-gray-400 text-lg">#{row.rank}</span>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-lg mb-1 flex items-center gap-2">
                      {row.name}
                      {row.isMine && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                    </div>
                    <div className="text-sm text-gray-400">{row.proj} • {row.col}</div>
                  </td>
                  <td className="p-5 hidden md:table-cell">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300">
                      {row.domain}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">{row.score}</div>
                    <div className="w-20 h-1.5 bg-black/50 rounded-full ml-auto">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full" style={{width: `${row.score}%`}}></div>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {others.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500">
                    No teams found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
};

// Crown icon stub
const Crown = ({size, className}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5z"/></svg>;

export default LeaderboardPage;
