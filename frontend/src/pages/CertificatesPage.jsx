import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import { Medal, Award, Trophy, Sparkles, Star, Download } from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Kept in sync with backend/utils/awards.js — the API also returns the resolved
// tier on each certificate, which takes precedence over this table.
const TIER = {
  winner:               { label: 'Grand Prize Winner', icon: Trophy,    accent: 'text-yellow-300', border: 'border-t-yellow-400', chip: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', glow: 'bg-yellow-400/10' },
  runner_up:            { label: 'First Runner-Up',    icon: Medal,    accent: 'text-slate-200',  border: 'border-t-slate-300', chip: 'bg-slate-400/20 text-slate-200 border-slate-400/30', glow: 'bg-slate-300/10' },
  second_runner_up:     { label: 'Second Runner-Up',   icon: Medal,    accent: 'text-amber-300',  border: 'border-t-amber-500', chip: 'bg-amber-500/20 text-amber-300 border-amber-500/30', glow: 'bg-amber-500/10' },
  alternate:            { label: 'Alternate Prize',    icon: Sparkles, accent: 'text-purple-300', border: 'border-t-purple-400', chip: 'bg-purple-500/20 text-purple-300 border-purple-500/30', glow: 'bg-purple-500/10' },
  special_mention:      { label: 'Special Mention',    icon: Star,     accent: 'text-cyan-300',   border: 'border-t-cyan-400',   chip: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', glow: 'bg-cyan-400/10' },
  participation:        { label: 'Participation Award', icon: Award,   accent: 'text-blue-300',   border: 'border-t-blue-400',  chip: 'bg-blue-500/20 text-blue-300 border-blue-500/30', glow: 'bg-blue-400/10' },
};

const tierFor = (cert) => TIER[cert?.type] || TIER[cert?.award?.type] || TIER.participation;

const CertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates/my');
        // Backend responds { success, data: [...] }.
        setCerts(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error('Failed to load certificates:', err);
        toast.error(err.response?.data?.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const topCount = certs.filter((c) => ['winner', 'runner_up', 'second_runner_up', 'alternate', 'special_mention'].includes(c.type)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
          <Medal className="text-yellow-400" size={36}/> My Certificates
        </h1>
        <p className="text-gray-400 text-lg">Your official, verifiable achievements from HackMatch AI.</p>
        {certs.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
              {certs.length} certificate{certs.length === 1 ? '' : 's'} issued
            </span>
            {topCount > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border border-yellow-500/30 text-yellow-300 flex items-center gap-1.5">
                <Trophy size={13}/> {topCount} featured award{topCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : certs.length === 0 ? (
        <GlassCard className="p-16 text-center text-gray-400 flex flex-col items-center">
          <Award size={64} className="mb-4 opacity-30" />
          <h2 className="text-2xl font-bold text-white mb-2">No Certificates Yet</h2>
          <p className="max-w-md">Form a team and submit your project — your certificate is issued automatically for every member.</p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certs.map((cert, i) => {
            const t = tierFor(cert);
            const TierIcon = t.icon;
            return (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className={`p-6 relative group overflow-hidden border-t-4 ${t.border} hover:shadow-[0_0_35px_rgba(255,255,255,0.08)] transition-shadow h-full`}>
                  <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl group-hover:opacity-80 transition-opacity ${t.glow}`} />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-5">
                      <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold border uppercase tracking-wider ${t.chip}`}>
                        {cert.awardTitle || t.label}
                      </span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.chip}`}>
                        <TierIcon size={20}/>
                      </div>
                    </div>

                    <h3 className="font-black text-xl mb-1 text-white">{cert.hackathonName || 'HackMatch AI 2026'}</h3>
                    <div className={`text-lg font-bold mb-4 ${t.accent}`}>
                      {cert.awardHeadline || (cert.type ? cert.type.replace(/_/g, ' ') : 'Participant')}
                    </div>

                    {cert.awardBlurb && (
                      <p className="text-xs text-gray-400 italic mb-4 leading-relaxed">{cert.awardBlurb}</p>
                    )}

                    <div className="space-y-1.5 mb-6">
                      <p className="text-sm text-gray-400">Project: <span className="text-gray-200 font-medium">{cert.projectTitle || cert.team?.name || '—'}</span></p>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5">
                        Team: <span className="text-gray-200">{cert.team?.name || '—'}</span>
                        {cert.team?.teamCode && <span className="font-mono text-[10px] text-gray-500">{cert.team.teamCode}</span>}
                      </p>
                      <p className="text-sm text-gray-400">Issued: <span className="text-gray-200">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '—'}</span></p>
                      {cert.awardScore !== undefined && cert.awardScore !== null && (
                        <p className="text-sm text-gray-400">Judge Score: <span className={`font-bold ${t.accent}`}>{Math.round(cert.awardScore)}/100</span></p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-gray-500 truncate">{cert.certificateId}</span>
                      <a
                        href={`/certificates/${cert.certificateId}`}
                        className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0 ${t.chip} hover:brightness-125`}
                      >
                        View <Download size={13}/>
                      </a>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
