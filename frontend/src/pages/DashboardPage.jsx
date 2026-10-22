import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import { Target, Users, FileText, Activity, Shield, Trophy, UploadCloud, Medal, Clock, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [team, setTeam] = useState(null);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Target date: Jan 15, 2027
    const targetDate = new Date('2027-01-15T00:00:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    const fetchData = async () => {
      try {
        const [teamRes, notifRes] = await Promise.all([
          api.get('/teams/my').catch(() => ({ data: { team: null } })),
          api.get('/notifications').catch(() => ({ data: { data: [] } }))
        ]);
        setTeam(teamRes.data?.data || teamRes.data?.team || null);
        setRecentNotifs(notifRes.data.data?.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold">
          Good {getGreeting()}, <span className="neon-text">{user?.name}</span>! 👋
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Here is your HackMatch AI command center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Profile Strength', value: '92%', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'AI Skill Score', value: '850', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Team Compatibility', value: team ? '94%' : 'N/A', icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Problem Match', value: '96%', icon: Target, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
              <stat.icon className={`w-8 h-8 opacity-40 ${stat.color}`} />
            </div>
            <div className="relative z-10">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.label}</span>
              <div className={`text-4xl font-black mt-2 ${stat.color}`}>{stat.value}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Countdown */}
          <GlassCard className="p-8 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">HackMatch AI 2026</h3>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold animate-pulse border border-blue-500/30">HACKING PHASE</span>
                </div>
                <p className="text-gray-400">Submission deadline approaching. Keep building!</p>
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'Days', val: timeLeft.days },
                  { label: 'Hours', val: timeLeft.hours },
                  { label: 'Mins', val: timeLeft.mins },
                  { label: 'Secs', val: timeLeft.secs }
                ].map((t, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-inner font-mono">
                      {t.val.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-gray-500 mt-2 uppercase font-bold">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions Grid */}
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { to: '/resume', label: 'Analyze Resume', icon: FileText, c: 'text-blue-400', bg: 'bg-blue-500/10' },
                { to: '/problems', label: 'Match Problems', icon: Target, c: 'text-purple-400', bg: 'bg-purple-500/10' },
                { to: '/teammates', label: 'Find Teammates', icon: Users, c: 'text-green-400', bg: 'bg-green-500/10' },
                { to: '/team', label: 'My Team', icon: Shield, c: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { to: '/submit', label: 'Submit Project', icon: UploadCloud, c: 'text-pink-400', bg: 'bg-pink-500/10' },
                { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, c: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { to: '/certificates', label: 'Certificates', icon: Medal, c: 'text-orange-400', bg: 'bg-orange-500/10' },
              ].map((action, i) => (
                <Link key={i} to={action.to}>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center text-center gap-3 h-32 group">
                    <div className={`p-3 rounded-xl ${action.bg} ${action.c} group-hover:scale-110 transition-transform`}><action.icon size={24} /></div>
                    <span className="font-semibold text-sm">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* AI Insights */}
          <GlassCard className="p-6 border-t-4 border-t-purple-500">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-purple-400"/> AI Profile Insights</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Based on your repository history and resume, you have strong backend capabilities. 
              Your optimal problem domain is <span className="font-bold text-white">Healthcare AI</span>.
            </p>
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-500 uppercase">Top Skills Recognized</div>
              <div className="flex flex-wrap gap-2">
                {['Node.js', 'Python', 'System Design', 'React'].map(s => (
                  <span key={s} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Recent Activity</h3>
              <Link to="/notifications" className="text-xs text-blue-400 hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl"></div>)}
              </div>
            ) : recentNotifs.length > 0 ? (
              <div className="space-y-4">
                {recentNotifs.map((n, i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="mt-1"><Clock size={14} className="text-gray-500" /></div>
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No recent activity to show.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
