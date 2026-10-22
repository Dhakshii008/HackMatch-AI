import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import TeamChatPanel from '../components/chat/TeamChatPanel';

const ChatPage = () => {
  const { user } = useAuthStore();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const initChat = async () => {
      try {
        const teamRes = await api.get('/teams/my');
        // Backend responds { success, data: team }.
        if (cancelled) return;
        setTeam(teamRes.data?.data || null);
      } catch (err) {
        console.error('Chat init error:', err);
        if (!cancelled) {
          setChatError(err.response?.data?.message || 'Could not load team chat');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initChat();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!team) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center text-center px-6">
        <Users size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Team Found</h2>
        <p className="text-gray-400 mb-6">
          {chatError || 'Join a team to access the team chat workspace. Chat unlocks once a collaboration request is accepted.'}
        </p>
        <Link to="/teammates" className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">
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
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Shield className="text-blue-400" size={20}/> {team.name}
          </h3>
          <p className="text-xs text-gray-400 mb-6 bg-black/30 p-3 rounded-lg border border-white/5 font-mono">
            ID: {team.teamCode || team._id}
          </p>

          <h4 className="font-bold text-sm text-gray-300 mb-3 uppercase tracking-wider">Members</h4>
          <div className="space-y-3">
            {members.map((m, i) => {
              const isMe = String(m.user?._id) === String(user?._id);
              return (
                <div key={m.user?._id || i} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow">
                      {(m.user?.name || '?')[0]}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#050816] rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">{m.user?.name} {isMe ? '(You)' : ''}</span>
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
