import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Users, MessageSquare, Award, AlertCircle, Star, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useNotificationStore from '../store/notificationStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  collaboration_request: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', link: '/collaboration' },
  request_accepted: { icon: CheckCheck, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', link: '/team' },
  request_rejected: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', link: '/collaboration' },
  team_invitation: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', link: '/team' },
  new_member: { icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', link: '/team' },
  new_message: { icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', link: '/chat' },
  task_assigned: { icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', link: '/tasks' },
  submitted: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', link: '/evaluation' },
  evaluated: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', link: '/evaluation' },
  certificate_ready: { icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', link: '/certificates' },
  deadline: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', link: '/submit' },
};

const FILTERS = ['All', 'Unread', 'Collaboration', 'Team', 'Evaluation'];

const NotificationsPage = () => {
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const { notifications, fetchNotifications, markRead, markAllRead, unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success('All notifications marked as read');
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await markRead(notif._id);
    const cfg = TYPE_CONFIG[notif.type];
    if (cfg?.link) navigate(cfg.link);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Collaboration') return n.type?.includes('collaboration') || n.type?.includes('request');
    if (filter === 'Team') return n.type?.includes('team') || n.type?.includes('member');
    if (filter === 'Evaluation') return n.type?.includes('evaluated') || n.type?.includes('submitted') || n.type?.includes('certificate');
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="text-purple-400" /> Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">{unreadCount} unread</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Stay updated on your hackathon activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-all">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center">
          <Bell size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold mb-2">No {filter !== 'All' ? filter.toLowerCase() : ''} notifications</h3>
          <p className="text-gray-500 text-sm">
            {filter === 'Unread' ? "You're all caught up! 🎉" : 'Activity will appear here as your hackathon progresses.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, i) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.team_invitation;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleClick(notif)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  notif.isRead ? 'bg-white/3 border-white/5 hover:bg-white/5' : 'bg-white/8 border-white/15 hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>{notif.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mt-0.5 ${notif.isRead ? 'text-gray-500' : 'text-gray-300'}`}>{notif.message}</p>
                </div>
                <ChevronRight size={14} className="text-gray-600 flex-shrink-0 mt-1" />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
