import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import TeamChatPanel from '../components/chat/TeamChatPanel';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Users, UserPlus, BrainCircuit, ChevronDown, Check, X, Inbox, Search, MessageSquare, Send, Github, Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FindTeammatesPage = () => {
  const { user } = useAuthStore();
  const myId = user?._id;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [incoming, setIncoming] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [busyId, setBusyId] = useState(null);
  // The shared team chat opens automatically once a request is accepted.
  const [chatOpen, setChatOpen] = useState(false);
  // Submitted from the chat's "share code" control.
  const [sharedRepo, setSharedRepo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sent requests are read from the API so the "Sent" state survives a
  // refresh or a re-login instead of living only in component state.
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const [matchRes, reqRes, teamRes, projRes] = await Promise.all([
          api.get('/collaboration/matches'),
          api.get('/collaboration/requests').catch(() => ({ data: { data: { sent: [], received: [] } } })),
          api.get('/teams/my').catch(() => ({ data: { data: null } })),
          api.get('/projects/my').catch(() => ({ data: { data: null } })),
        ]);

        setMatches(Array.isArray(matchRes.data?.data) ? matchRes.data.data : []);

        const all = [
          ...(reqRes.data?.data?.sent || []),
          ...(reqRes.data?.data?.received || []),
        ];
        setSentRequests(new Set(
          all
            .filter((r) => r.status === 'pending' || r.status === 'accepted')
            .map((r) => String((r.receiver?._id || r.sender?._id)))
        ));
        // Only the receiver ever sees a request as incoming.
        setIncoming((reqRes.data?.data?.received || []).filter((r) => r.status === 'pending'));
        setMyTeam(teamRes.data?.data || null);

        const project = projRes.data?.data || null;
        setSharedRepo(project?.githubUrl || '');
        setSubmitted(!!project?.isSubmitted);
      } catch (err) {
        console.error('Failed to load teammate matches:', err);
        toast.error(err.response?.data?.message || 'Failed to load teammate matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Per-user relationship state.
  // Prefers the server-computed status (authoritative, pair-specific) and falls
  // back to the local request sets if the API did not send one. Rejected and
  // pending pairs are rendered explicitly instead of being hidden.
  const statusFor = (userId, match) => {
    const id = String(userId);
    if (myTeam?.members?.some((m) => String(m.user?._id) === id)) return 'ALREADY_TEAMMATE';
    if (sentRequests.has(id)) return 'REQUEST_SENT';
    if (incoming.some((r) => String(r.sender?._id) === id)) return 'PENDING';
    if (match?.status) return match.status;
    return 'AVAILABLE';
  };

  const STATUS_UI = {
    ALREADY_TEAMMATE: { label: 'Teammates', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30', Icon: Users },
    ACCEPTED: { label: 'Teammates', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30', Icon: Users },
    REQUEST_SENT: { label: 'Request Sent', cls: 'bg-green-500/20 text-green-400 border-green-500/30', Icon: Check },
    PENDING: { label: 'Respond Pending', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', Icon: Clock },
    REJECTED: { label: 'Request Again', cls: 'bg-red-500/20 text-red-300 border-red-500/30', Icon: RotateCcw },
  };

  const openRequestModal = (userMatch) => {
    setSelectedUser(userMatch);
    setMessage(`Hi ${userMatch.user.name.split(' ')[0]}, our AI profiles have a ${userMatch.matchScore}% match! I'd love to team up.`);
    setShowModal(true);
  };

  const sendRequest = async () => {
    if (!selectedUser || sending) return;
    // The backend expects the receiver's user id, which lives on match.user._id.
    const receiverId = selectedUser.user?._id;
    if (!receiverId) {
      toast.error('Could not identify that participant. Please refresh and try again.');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/collaboration/request', { receiverId, message });
      setSentRequests(prev => new Set(prev).add(String(receiverId)));
      setMatches(prev => prev.map(m => String(m.user?._id) === String(receiverId) ? { ...m, status: 'REQUEST_SENT' } : m));
      setShowModal(false);
      setMessage('');
      toast.success(res.data?.message || 'Collaboration request sent!');
    } catch (err) {
      console.error('Failed to send collaboration request:', err);
      const msg = err.response?.data?.message || 'Failed to send request';
      if (/already sent|already sent you/i.test(msg)) {
        setSentRequests(prev => new Set(prev).add(String(receiverId)));
        setMatches(prev => prev.map(m => String(m.user?._id) === String(receiverId) ? { ...m, status: 'REQUEST_SENT' } : m));
      }
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // Accept / Reject happen inline on this page — no navigation, no reload.
  const handleAccept = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await api.put(`/collaboration/requests/${id}/accept`);
      const acceptedReq = incoming.find((r) => r._id === id);
      const senderId = acceptedReq?.sender?._id;
      setIncoming(prev => prev.filter((r) => r._id !== id));
      // Prefer the team the accept response returns; fall back to a refetch.
      let team = res.data?.team || null;
      if (!team) {
        try {
          const teamRes = await api.get('/teams/my');
          team = teamRes.data?.data || null;
        } catch { /* non-fatal */ }
      }
      setMyTeam(team);
      if (team?._id) {
        useAuthStore.getState().updateUser({ teamId: team._id });
      }
      if (senderId) {
        setSentRequests(prev => new Set(prev).add(String(senderId)));
        setMatches(prev => prev.map(m => String(m.user?._id) === String(senderId) ? { ...m, status: 'ALREADY_TEAMMATE' } : m));
      }
      // The shared chatbox opens the moment the team exists.
      setChatOpen(true);
      toast.success(`Team formed: ${res.data?.team?.name || team?.name || 'your team'} is ready! Chat is now open.`);
    } catch (err) {
      console.error('Failed to accept request:', err);
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setBusyId(null);
    }
  };

  // Final submission — uses the repo link shared from the chat, and creates
  // the project on demand so a team can submit without a detour.
  const handleSubmitProject = async () => {
    if (submitting || !myTeam) return;
    if (!sharedRepo.trim()) {
      toast.error('Share your GitHub link from the chatbox first.');
      return;
    }
    setSubmitting(true);
    try {
      let projRes = await api.get('/projects/my');
      let project = projRes.data?.data;
      if (!project) {
        project = (await api.post('/projects', { title: myTeam.name })).data?.data;
      }
      await api.post(`/projects/${project._id}/github`, { githubUrl: sharedRepo.trim() });
      const sub = await api.post('/submissions', { githubUrl: sharedRepo.trim() });
      setSubmitted(true);
      toast.success(
        sub.data?.alreadySubmitted
          ? 'Already submitted — your certificate is ready.'
          : 'Project submitted — your certificate is ready!'
      );
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await api.put(`/collaboration/requests/${id}/reject`);
      const rejectedReq = incoming.find((r) => r._id === id);
      const senderId = rejectedReq?.sender?._id;
      setIncoming(prev => prev.filter((r) => r._id !== id));
      if (senderId) {
        setMatches(prev => prev.map(m => String(m.user?._id) === String(senderId) ? { ...m, status: 'REJECTED' } : m));
      }
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 flex justify-center items-center gap-3">
          <Users className="text-purple-500" size={36}/> Find Your Perfect Team
        </h1>
        <p className="text-gray-400 text-lg">
          Our AI analyzes thousands of participants to find individuals whose skills perfectly complement yours, maximizing your chances of winning.
        </p>
      </div>

      {/* INCOMING REQUESTS — top of the same /teammates page */}
      {!loading && incoming.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Inbox className="text-blue-400" size={24}/> Incoming Requests
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              {incoming.length}
            </span>
          </h2>
          <div className="space-y-4">
            <AnimatePresence>
              {incoming.map(r => (
                <motion.div
                  key={r._id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <GlassCard className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-l-4 border-l-blue-500">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0">
                        {r.sender?.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-lg">
                          {r.sender?.name} wants to connect with you
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.sender?.college || '—'}{r.sender?.department ? ` • ${r.sender.department}` : ''} • {timeAgo(r.createdAt)}
                        </p>
                        {r.message && (
                          <p className="mt-2 text-sm text-gray-300 italic bg-black/30 p-3 rounded-lg border border-white/5">
                            "{r.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => handleAccept(r._id)}
                        disabled={busyId === r._id}
                        className="flex-1 md:flex-none py-2.5 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={16}/> {busyId === r._id ? 'Working…' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        disabled={busyId === r._id}
                        className="flex-1 md:flex-none py-2.5 px-6 rounded-xl bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={16}/> Reject
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* FIND TEAMMATES — real registered users from the database */}
      <section>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
        <Search className="text-purple-400" size={24}/> Find Teammates
      </h2>
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <GlassCard key={i} className="h-[400px] animate-pulse bg-white/5" />)}
        </div>
      ) : matches.length === 0 ? (
        <GlassCard className="p-16 text-center text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-bold text-white mb-1">No more teammates available</p>
          <p>You've matched with everyone who fits your profile. Check your collaboration requests for updates.</p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m, i) => (
            <motion.div key={m._id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i*0.1}}>
              <GlassCard className="flex flex-col h-full hover:border-purple-500/50 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                
                <div className="p-6 pb-0 flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-black shadow-lg">
                      {m.user.name[0]}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{m.matchScore}%</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Overall Match</div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-1">{m.user.name}</h2>
                  <p className="text-sm text-gray-400 mb-4">{m.user.college} • {m.user.department || m.user.dept}</p>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-6">
                    <BrainCircuit size={14} /> Recommended: {m.roles?.[0] || 'Full Stack Developer'}
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2 font-bold text-gray-400">
                      <span>Complementarity Score</span>
                      <span className="text-white">{m.complementarity}/100</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full" style={{width: `${m.complementarity}%`}}></div>
                    </div>
                  </div>
                </div>

                {/* Expandable Why section */}
                <div className="px-6 relative z-10">
                  <button 
                    onClick={() => setExpandedCard(expandedCard === m._id ? null : m._id)}
                    className="flex justify-between items-center w-full py-3 border-t border-white/10 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Why this match? <ChevronDown size={16} className={`transition-transform ${expandedCard === m._id ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedCard === m._id && (
                      <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden">
                        <ul className="pb-4 space-y-2 text-sm text-gray-400 list-disc pl-4">
                          {(Array.isArray(m.reasons) ? m.reasons : [m.reasons]).filter(Boolean).map((r, idx) => <li key={idx}>{r}</li>)}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-6 pt-2 mt-auto border-t border-white/10 flex gap-3 relative z-10 bg-black/20">
                  <button className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-colors">
                    View Profile
                  </button>
                  {(() => {
                    const st = statusFor(m.user._id, m);
                    const ui = STATUS_UI[st];
                    // REJECTED stays actionable so a declined pair can try again
                    // later without the person disappearing from the list.
                    if (ui && st !== 'REJECTED') {
                      const Icon = ui.Icon;
                      return (
                        <button disabled className={`flex-1 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed ${ui.cls}`}>
                          <Icon size={16}/> {ui.label}
                        </button>
                      );
                    }
                    return (
                      <button onClick={() => openRequestModal(m)} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
                        <UserPlus size={16}/> {st === 'REJECTED' ? 'Request Again' : 'Request'}
                      </button>
                    );
                  })()}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
      </section>

      {/* MY TEAMMATES — accepted teammates, their shared chat, and submission */}
      {!loading && myTeam && myTeam.members?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Users className="text-green-400" size={24}/> My Teammates
          </h2>
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="font-bold text-xl">{myTeam.name}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">Code: {myTeam.teamCode}</div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setChatOpen((v) => !v)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16}/> {chatOpen ? 'Hide Chat' : 'Team Chat'}
                </button>
                <Link
                  to="/team"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-colors text-center shrink-0"
                >
                  Open Team
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myTeam.members.map((m, i) => {
                const isMe = String(m.user?._id) === String(myId);
                return (
                  <div key={m.user?._id || i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-gradient-to-tr from-blue-600 to-blue-700' : 'bg-gradient-to-tr from-purple-600 to-pink-600'}`}>
                      {(m.user?.name || '?')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">
                        {m.user?.name}{isMe ? ' (You)' : ''}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {(m.user?.skills || []).slice(0, 3).join(', ') || '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* The single shared chatbox between the two teammates — opens by
              default the moment a request is accepted. */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <TeamChatPanel
                    team={myTeam}
                    onClose={() => setChatOpen(false)}
                    onCodeShared={(url) => setSharedRepo(url)}
                    maxHeight={460}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT — the repo link shared in the chat is what gets submitted */}
          <GlassCard className="p-6 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Github size={18} className="text-white"/> Submit Your Project
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Share the code link in the chatbox, then submit. Certificates are issued for every member.
                </p>
                {sharedRepo && (
                  <a
                    href={sharedRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-blue-300 hover:text-blue-200 break-all"
                  >
                    {sharedRepo}
                  </a>
                )}
              </div>
              {submitted ? (
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-5 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 font-bold text-sm flex items-center gap-2">
                    <Check size={16}/> Submitted
                  </span>
                  <Link
                    to="/certificates"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:opacity-90 transition-all"
                  >
                    View Certificate
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleSubmitProject}
                  disabled={submitting || !sharedRepo.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={16}/> {submitting ? 'Submitting…' : 'Submit Project'}
                </button>
              )}
            </div>
          </GlassCard>
        </section>
      )}

      {/* Request Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}>
              <GlassCard className="w-full max-w-md p-6 border-purple-500/50">
                <h3 className="text-2xl font-bold mb-2">Send Request</h3>
                <p className="text-gray-400 text-sm mb-6">Invite <span className="text-white font-bold">{selectedUser.user.name}</span> to collaborate on a project.</p>
                
                <label className="block text-sm font-bold text-gray-300 mb-2">Message (Optional)</label>
                <textarea 
                  rows="4" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 mb-6 resize-none"
                ></textarea>
                
                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors">Cancel</button>
                  <NeonButton onClick={sendRequest} disabled={sending} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-none text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    {sending ? 'Sending…' : 'Send Invite'}
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindTeammatesPage;
