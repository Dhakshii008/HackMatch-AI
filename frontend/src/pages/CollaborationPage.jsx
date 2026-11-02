import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Check, X, Clock, MapPin, Target, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CollaborationPage = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [team, setTeam] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/collaboration/requests');
        setRequests({
          sent: res.data?.data?.sent || [],
          received: res.data?.data?.received || [],
        });
      } catch (err) {
        console.error('Failed to load collaboration requests:', err);
        toast.error(err.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await api.put(`/collaboration/requests/${id}/accept`);
      let createdTeam = res.data?.team || res.data?.data?.team || null;
      if (!createdTeam) {
        try {
          const myTeamRes = await api.get('/teams/my');
          createdTeam = myTeamRes.data?.data || myTeamRes.data?.team || null;
        } catch {}
      }

      setTeam(createdTeam);
      if (createdTeam?._id) {
        useAuthStore.getState().updateUser({ teamId: createdTeam._id });
      }

      // Only pending requests keep Accept/Reject; accepted/rejected drop to history.
      setRequests(prev => ({
        ...prev,
        received: prev.received.map(r => r._id === id ? { ...r, status: 'accepted' } : r),
      }));

      toast.success(`Request accepted! Opening Team Chat... 🚀`);

      // Immediately redirect User B to the Chat page
      setTimeout(() => {
        navigate('/chat', { state: { teamId: createdTeam?._id, team: createdTeam, autoOpened: true } });
      }, 350);
    } catch (err) {
      console.error('Failed to accept request:', err);
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await api.put(`/collaboration/requests/${id}/reject`);
      setRequests(prev => ({
        ...prev,
        received: prev.received.map(r => r._id === id ? { ...r, status: 'rejected' } : r),
      }));
      toast.success('Request declined.');
    } catch (err) {
      console.error('Failed to reject request:', err);
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setBusyId(null);
    }
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const problemLabel = (p) => (typeof p === 'string' ? p : p?.title || 'General hackathon track');

  const pendingReceived = requests.received.filter(r => r.status === 'pending');
  const historyReceived = requests.received.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-bold mb-2">Collaboration Requests</h1>
        <p className="text-gray-400 text-lg">Manage your invitations and team formations.</p>
      </div>
      
      <div className="flex gap-6 border-b border-white/10 pb-px">
        <button 
          onClick={() => setActiveTab('received')}
          className={`font-bold pb-4 border-b-2 px-2 transition-colors ${activeTab === 'received' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          Received ({pendingReceived.length})
        </button>
        <button 
          onClick={() => setActiveTab('sent')}
          className={`font-bold pb-4 border-b-2 px-2 transition-colors ${activeTab === 'sent' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
        >
          Sent ({requests.sent.length})
        </button>
      </div>

      <div className="pt-4">
        {team && (
          <GlassCard className="p-5 mb-6 border-green-500/40 bg-green-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-green-400">Team created: {team.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                Team code <span className="text-white font-mono">{team.teamCode}</span> • {team.members?.length || 2} member(s)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/chat')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 flex items-center gap-1.5">
                <MessageSquare size={16}/> Open Chat
              </button>
              <button onClick={() => navigate('/team')} className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors shrink-0">
                Open Team
              </button>
            </div>
          </GlassCard>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <GlassCard key={i} className="h-32 animate-pulse bg-white/5" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'received' ? (
              <motion.div key="received" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="space-y-4">
                {requests.received.length === 0 ? (
                  <GlassCard className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <UserPlus size={48} className="mb-4 opacity-50"/>
                    <p>No pending received requests.</p>
                  </GlassCard>
                ) : (
                  <AnimatePresence>
                    {requests.received.map(r => (
                      <motion.div key={r._id} layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95, height:0, marginTop:0, marginBottom:0}}>
                        <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-blue-500 hover:bg-white/5 transition-colors">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                              {r.sender?.name?.[0]}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{r.sender?.name}</h3>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1 mb-3">
                                <span className="flex items-center gap-1"><MapPin size={12}/> {r.sender?.college || '—'}</span>
                                <span className="flex items-center gap-1"><Target size={12}/> {problemLabel(r.problem)}</span>
                                <span className="flex items-center gap-1"><Clock size={12}/> {timeAgo(r.createdAt)}</span>
                              </div>
                              {r.message && (
                                <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-sm text-gray-300 italic">
                                  "{r.message}"
                                </div>
                              )}
                            </div>
                          </div>
                          {r.status === 'pending' ? (
                            <div className="flex md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
                              <button disabled={busyId === r._id} onClick={() => handleAccept(r._id)} className="flex-1 py-2 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Check size={18}/> {busyId === r._id ? 'Working…' : 'Accept'}
                              </button>
                              <button disabled={busyId === r._id} onClick={() => handleReject(r._id)} className="flex-1 py-2 px-6 rounded-xl bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <X size={18}/> Decline
                              </button>
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-full text-xs font-bold capitalize shrink-0 bg-white/5 text-gray-400 border border-white/10">
                              {r.status}
                            </div>
                          )}
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            ) : (
              <motion.div key="sent" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                {requests.sent.length === 0 ? (
                  <GlassCard className="p-12 text-center text-gray-400">
                    <p>You haven't sent any requests yet.</p>
                  </GlassCard>
                ) : (
                  requests.sent.map(r => (
                    <GlassCard key={r._id} className="p-5 flex items-center justify-between border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
                          {r.receiver?.name?.[0]}
                        </div>
                        <div>
                          <div className="font-bold">{r.receiver?.name}</div>
                          <div className="text-xs text-gray-500">{timeAgo(r.createdAt)}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        r.status === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : r.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                        {r.status}
                      </div>
                    </GlassCard>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

// Quick stub for UserPlus icon missing above
const UserPlus = ({size, className}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>;

export default CollaborationPage;
