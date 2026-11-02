import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Shield, MessageSquare, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import TeamChatPanel from '../components/chat/TeamChatPanel';

const ChatPage = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const initialTeam = location.state?.team || null;
  const passedTeamId = location.state?.teamId || initialTeam?._id;

  const [team, setTeam] = useState(initialTeam);
  const [loading, setLoading] = useState(!initialTeam);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const initChat = async () => {
      try {
        const teamRes = await api.get('/teams/my');
        if (cancelled) return;
        const myTeam = teamRes.data?.data || teamRes.data?.team;
        if (myTeam) {
          setTeam(myTeam);
        } else if (passedTeamId) {
          try {
            const specificRes = await api.get(`/teams/${passedTeamId}`);
            if (!cancelled && (specificRes.data?.data || specificRes.data?.team)) {
              setTeam(specificRes.data.data || specificRes.data.team);
            }
          } catch {}
        }
      } catch (err) {
        console.error('Chat init error:', err);
        if (!cancelled && !initialTeam) {
          setChatError(err.response?.data?.message || 'Could not load team chat');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initChat();
    return () => { cancelled = true; };
  }, [location.state, passedTeamId]);

  if (loading && !team) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Opening Team Chat workspace...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center text-center px-6">
        <Users size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Team Found</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          {chatError || 'Join a team to access the team chat workspace. Chat unlocks automatically as soon as a collaboration request is accepted.'}
        </p>
        <Link to="/teammates" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          Find Teammates →
        </Link>
      </div>
    );
  }

  const members = team.members || [];

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 pb-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="hidden md:flex w-72 flex-col gap-6">
        <GlassCard className="p-6">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
            <Shield className="text-blue-400 shrink-0" size={20}/> 
            <span className="truncate">{team.name}</span>
          </h3>
          <p className="text-xs text-gray-400 mb-6 bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono flex items-center justify-between">
            <span>Code: <span className="text-white font-semibold">{team.teamCode || team._id}</span></span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          </p>

          <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">
            Team Members ({members.length})
          </h4>
          <div className="space-y-3">
            {members.map((m, i) => {
              const memberUser = typeof m.user === 'object' && m.user !== null 
                ? m.user 
                : (typeof m === 'object' && m.name ? m : { _id: m.user || m, name: 'Team Member' });
              const isMe = String(memberUser._id) === String(user?._id);
              const initial = (memberUser.name || '?')[0].toUpperCase();
              return (
                <div key={memberUser._id || i} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow text-white">
                      {initial}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#050816] rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate flex items-center gap-1.5">
                      <span>{memberUser.name}</span>
                      {isMe && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-semibold">You</span>}
                    </div>
                    <div className="text-[11px] text-gray-400 capitalize truncate">
                      {m.role || (i === 0 ? 'Leader' : 'Member')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <TeamChatPanel team={team} maxHeight={9999} className="flex-1" />
    </div>
  );
};

export default ChatPage;
