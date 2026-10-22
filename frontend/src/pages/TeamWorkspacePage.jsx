import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, CheckSquare, Github, Folder, Users, Activity, Target, Clock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'members', label: 'Members', icon: Users },
];

const TeamWorkspacePage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [team, setTeam] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.teamId) fetchAll();
    else setLoading(false);
  }, [user]);

  const fetchAll = async () => {
    try {
      const [teamRes, projectRes, tasksRes] = await Promise.all([
        api.get('/teams/my'),
        api.get('/projects/my').catch(() => ({ data: { data: null } })),
        api.get(`/tasks/${user.teamId}`).catch(() => ({ data: { data: [] } })),
      ]);
      setTeam(teamRes.data.data);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data || []);
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!user?.teamId) return (
    <div className="max-w-2xl mx-auto text-center mt-20">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10">
        <LayoutDashboard size={64} className="mx-auto mb-6 text-gray-500" />
        <h2 className="text-2xl font-bold mb-4">Team Workspace</h2>
        <p className="text-gray-400 mb-6">Join a team to access your collaborative workspace.</p>
        <Link to="/teammates" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">Find Teammates →</Link>
      </div>
    </div>
  );

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div>
            <h1 className="text-3xl font-bold">{team?.name || 'Team Workspace'}</h1>
            <p className="text-gray-400 text-sm mt-1">Team Code: <span className="font-mono text-blue-300">{team?.teamCode}</span> • {team?.members?.length || 0} Members</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/chat" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold hover:opacity-90 transition-all">
              <MessageSquare size={14} /> Open Chat
            </Link>
            <Link to="/project" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm hover:bg-white/20 transition-all">
              <Folder size={14} /> Project Details
            </Link>
          </div>
        </div>

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Project Progress</span>
              <span className="text-sm font-bold text-blue-300">{progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{completedTasks}/{tasks.length} tasks completed</p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/tasks', icon: CheckSquare, label: 'Kanban Board', desc: `${tasks.length} tasks`, color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20' },
          { to: '/chat', icon: MessageSquare, label: 'Team Chat', desc: 'Real-time messaging', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/20' },
          { to: '/github', icon: Github, label: 'GitHub', desc: project?.githubUrl ? 'Connected' : 'Not linked', color: 'from-gray-500/20 to-slate-500/20 border-gray-500/20' },
          { to: '/project', icon: Folder, label: 'Project Details', desc: project?.title || 'Not filled', color: 'from-orange-500/20 to-red-500/20 border-orange-500/20' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} className={`bg-gradient-to-br ${color} border rounded-xl p-4 hover:scale-105 transition-all`}>
            <Icon size={22} className="mb-3 text-gray-300" />
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-4">
          {/* Stats */}
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'text-blue-400' },
            { label: 'Completed', value: completedTasks, color: 'text-green-400' },
            { label: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-yellow-400' },
            { label: 'Team Members', value: team?.members?.length || 0, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
              <Activity size={20} className={s.color} />
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}

          {project && (
            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Target size={16} className="text-blue-400" /> Selected Problem</h3>
              <p className="text-gray-300 text-sm">{team?.problem?.title || 'Problem not selected'}</p>
              <p className="text-xs text-gray-500 mt-1">{team?.problem?.domain}</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'tasks' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {tasks.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <CheckSquare size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 mb-3">No tasks yet</p>
              <Link to="/tasks" className="text-blue-400 text-sm hover:underline">Open Kanban Board →</Link>
            </div>
          ) : (
            <>
              {tasks.slice(0, 10).map(task => (
                <div key={task._id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.status === 'COMPLETED' ? 'bg-green-400' : task.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                  <span className="text-sm flex-1">{task.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                    task.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>{task.priority}</span>
                </div>
              ))}
              <Link to="/tasks" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                View Full Kanban Board →
              </Link>
            </>
          )}
        </motion.div>
      )}

      {activeTab === 'members' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4">
          {(team?.members || []).map((m, i) => {
            const memberUser = m.user;
            const isLeader = team?.leader?._id === memberUser?._id || team?.leader === memberUser?._id;
            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {memberUser?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{memberUser?.name}</span>
                    {isLeader && <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex-shrink-0">👑 Leader</span>}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{memberUser?.college}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(memberUser?.skills || []).slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default TeamWorkspacePage;
