import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Smile, Shield, Github, Link2, X, Check,
  MessageSquare, Code2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useSocketStore from '../../store/socketStore';
import api from '../../services/api';
import GlassCard from '../ui/GlassCard';

const EMOJIS = ['😀','😂','🥰','😎','🤔','🙌','🔥','✨','🎉','🚀','💡','👍','🤝','👀'];

// Backend stores message text in `content`; normalise to a UI shape here.
const normalise = (m) => ({
  _id: m._id,
  text: m.content ?? m.text ?? '',
  sender: { _id: m.sender?._id || m.sender, name: m.sender?.name || 'Unknown' },
  timestamp: m.createdAt || m.timestamp,
});

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isUrl = (s) => /^https?:\/\/\S+$/i.test(s.trim());

/** Render message text, turning bare links into clickable cards. */
const MessageBody = ({ text }) => {
  const trimmed = (text || '').trim();

  if (isUrl(trimmed)) {
    let host = '';
    try { host = new URL(trimmed).hostname.replace(/^www\./, ''); } catch { host = trimmed; }
    const isRepo = /(^|\.)github\.com$/i.test(host);
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 no-underline"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isRepo ? 'bg-white/15' : 'bg-blue-500/25'}`}>
          {isRepo ? <Github size={18} /> : <Link2 size={18} />}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider opacity-70 font-bold">
            {isRepo ? 'Code shared' : 'Link shared'}
          </div>
          <div className="text-xs font-semibold truncate">{trimmed}</div>
          <div className="text-[10px] opacity-60">{host}</div>
        </div>
      </a>
    );
  }

  // Inline-linkify any URL embedded in a longer sentence.
  const parts = String(text || '').split(/(https?:\/\/[^\s]+)/g);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        /^https?:\/\//i.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
};

/**
 * A single shared chatbox for a team. Rendered inline on /teammates right after
 * a request is accepted, and reused by the standalone /chat route, so both
 * surfaces talk to the same team room and the same message history.
 */
const TeamChatPanel = ({
  team,
  currentUserId,
  maxHeight = 520,
  allowCodeShare = true,
  onCodeShared,
  onClose,
  className = '',
}) => {
  const { user } = useAuthStore();
  const meId = currentUserId || user?._id;
  const { socket, connect, joinTeamRoom, leaveTeamRoom } = useSocketStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [repoNote, setRepoNote] = useState('');
  const [sharing, setSharing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const endRef = useRef(null);
  const teamId = team?._id;

  // Load history and subscribe to the team room.
  useEffect(() => {
    if (!teamId) return undefined;
    let cancelled = false;

    setHistoryLoading(true);
    (async () => {
      try {
        const res = await api.get(`/messages/${teamId}`);
        if (cancelled) return;
        setMessages((res.data?.data || []).map(normalise));
      } catch (err) {
        console.error('Failed to load team messages:', err);
        if (!cancelled) toast.error(err.response?.data?.message || 'Could not load chat history');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    connect(meId);
    joinTeamRoom(teamId);
    return () => {
      cancelled = true;
      leaveTeamRoom(teamId);
    };
  }, [teamId, meId, connect, joinTeamRoom, leaveTeamRoom]);

  // Realtime messages.
  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (payload) => {
      const m = normalise(payload);
      setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
    };
    socket.on('new_message', onNew);
    return () => socket.off('new_message', onNew);
  }, [socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, historyLoading]);

  const sendMessage = useCallback(
    async (text) => {
      const body = String(text || '').trim();
      if (!body || !teamId || sending) return false;
      setSending(true);
      try {
        const res = await api.post(`/messages/${teamId}`, { content: body });
        const saved = normalise(res.data?.data || { content: body, sender: { _id: meId, name: user?.name }, createdAt: new Date().toISOString() });
        setMessages((prev) => (prev.some((x) => x._id === saved._id) ? prev : [...prev, saved]));
        return true;
      } catch (err) {
        console.error('Send message failed:', err);
        toast.error(err.response?.data?.message || 'Failed to send message');
        return false;
      } finally {
        setSending(false);
      }
    },
    [teamId, sending, meId, user]
  );

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (await sendMessage(input)) {
      setInput('');
      setShowEmoji(false);
    }
  };

  /**
   * Share the repository link: it is saved to the team project AND posted into
   * the chat, so the teammate sees the code drop inside the conversation.
   */
  const shareCode = async () => {
    const url = repoUrl.trim();
    if (!url || sharing) return;
    if (!isUrl(url)) {
      toast.error('Enter a full link starting with http:// or https://');
      return;
    }
    setSharing(true);
    try {
      const projRes = await api.get('/projects/my');
      const project = projRes.data?.data;
      if (!project) {
        toast.error('Create your project details before sharing code.');
        return;
      }
      await api.post(`/projects/${project._id}/github`, { githubUrl: url });

      const note = repoNote.trim();
      const message = note ? `${note}\n${url}` : url;
      const posted = await sendMessage(message);

      setRepoUrl('');
      setRepoNote('');
      setShowCode(false);
      if (posted) {
        toast.success('Code link shared with your team');
        onCodeShared?.(url);
      }
    } catch (err) {
      console.error('Failed to share code:', err);
      toast.error(err.response?.data?.message || 'Failed to share code link');
    } finally {
      setSharing(false);
    }
  };

  if (!teamId) return null;

  const members = team.members || [];
  const otherMembers = members.filter((m) => String(m.user?._id) !== String(meId));

  return (
    <GlassCard className={`flex flex-col overflow-hidden ${className}`}>
      {/* Header: both teammates shown, so it reads as one shared thread */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
            <MessageSquare size={17} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{team.name} Chat</div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              {members.length} member{members.length === 1 ? '' : 's'} · one shared thread
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} title="Close chat" className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Both avatars, connected — emphasises the two-way chat */}
      <div className="px-4 py-2.5 border-b border-white/5 bg-black/20 flex items-center gap-3 flex-wrap">
        {members.map((m, i) => {
          const isMe = String(m.user?._id) === String(meId);
          return (
            <React.Fragment key={m.user?._id || i}>
              {i > 0 && <span className="text-gray-600 text-xs">↔</span>}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isMe ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'}`}>
                  {(m.user?.name || '?')[0]}
                </div>
                <span className="text-xs text-gray-300">
                  {isMe ? 'You' : m.user?.name}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight }}>
        {historyLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <Shield size={32} className="mb-3 text-gray-600 opacity-50" />
            <p className="text-sm text-gray-400">
              {otherMembers.length > 0
                ? `Chat with ${otherMembers.map((m) => m.user?.name).filter(Boolean).join(', ')} — say hello or share your code.`
                : 'Your team chat is ready.'}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = String(m.sender?._id) === String(meId);
            const linkOnly = isUrl((m.text || '').trim());
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && <span className="text-[11px] text-gray-400 mb-1 ml-1">{m.sender?.name}</span>}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl shadow-lg border ${
                    isMe
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/30 rounded-br-sm'
                      : 'bg-white/10 backdrop-blur-md text-gray-100 border-white/5 rounded-bl-sm'
                  } ${linkOnly ? 'py-2.5' : ''}`}
                >
                  <MessageBody text={m.text} />
                  <div className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : ''}`}>
                    {formatTime(m.timestamp)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Code share drawer */}
      <AnimatePresence>
        {showCode && allowCodeShare && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-blue-500/5"
          >
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <Code2 size={14} /> Share your code with the team
              </div>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your-name/your-repo"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <input
                value={repoNote}
                onChange={(e) => setRepoNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && shareCode()}
                placeholder="Optional note — e.g. 'Backend is up, please review the auth flow'"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowCode(false)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={shareCode}
                  disabled={!repoUrl.trim() || sharing}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {sharing ? 'Sharing…' : <><Check size={13} /> Share link</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="p-3 bg-black/40 border-t border-white/10 flex gap-2 items-end relative">
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full mb-2 left-3 bg-[#141a2e] border border-white/10 rounded-xl p-2.5 shadow-2xl flex flex-wrap gap-1 w-56 z-20"
            >
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setInput((p) => p + e)} className="text-lg hover:scale-125 transition-transform p-0.5">
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {allowCodeShare && (
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            title="Share code link"
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${showCode ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            <Github size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
        >
          <Smile size={18} />
        </button>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Message your teammate..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none max-h-28"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_22px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:shadow-none transition-all shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </GlassCard>
  );
};

export default TeamChatPanel;
