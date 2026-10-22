import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, Tag, Calendar, User, CheckCircle2, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'text-gray-400', dot: 'bg-gray-400', border: 'border-gray-400/20', bg: 'bg-gray-400/5' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-400', dot: 'bg-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/5' },
  { id: 'REVIEW', label: 'Review', color: 'text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5' },
  { id: 'COMPLETED', label: 'Completed', color: 'text-green-400', dot: 'bg-green-400', border: 'border-green-400/20', bg: 'bg-green-400/5' },
];

const PRIORITY_CONFIG = {
  Critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-300 border-green-500/30',
};

const NEXT_STATUS = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'REVIEW', REVIEW: 'COMPLETED', COMPLETED: 'TODO' };

const TaskCard = ({ task, members, onStatusChange, onDelete }) => {
  const assignee = members.find(m => m.user?._id === (task.assignedTo?._id || task.assignedTo));
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-[#050816]/80 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium}`}>
          {task.priority || 'Medium'}
        </span>
        <button onClick={() => onDelete(task._id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"><X size={14} /></button>
      </div>
      <p className="text-sm font-semibold text-white mb-2 leading-snug">{task.title}</p>
      {task.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                {assignee.user?.name?.[0] || '?'}
              </div>
              <span className="text-xs text-gray-400 truncate max-w-[80px]">{assignee.user?.name?.split(' ')[0]}</span>
            </div>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={10} />
              {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        <button onClick={() => onStatusChange(task._id, NEXT_STATUS[task.status])}
          className="text-xs text-gray-500 hover:text-blue-400 transition-colors px-2 py-0.5 rounded border border-transparent hover:border-blue-500/30">
          Move →
        </button>
      </div>
    </motion.div>
  );
};

const TasksPage = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });

  useEffect(() => { if (user?.teamId) fetchData(); else setLoading(false); }, [user]);

  const fetchData = async () => {
    try {
      const [tasksRes, teamRes] = await Promise.all([
        api.get(`/tasks/${user.teamId}`),
        api.get('/teams/my')
      ]);
      setTasks(tasksRes.data.data || []);
      setMembers(teamRes.data.data?.members || []);
    } catch (err) { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) { toast.error('Task title required'); return; }
    try {
      const res = await api.post('/tasks', { ...newTask, team: user.teamId });
      setTasks(prev => [...prev, res.data.data]);
      setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '' });
      setShowModal(false);
      toast.success('Task created! ✅');
    } catch (err) { toast.error('Failed to create task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { toast.error('Failed to update task'); }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) { toast.error('Failed to delete task'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!user?.teamId) return (
    <div className="max-w-2xl mx-auto text-center mt-20">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10">
        <CheckCircle2 size={64} className="mx-auto mb-6 text-gray-500" />
        <h2 className="text-2xl font-bold mb-4">Kanban Board</h2>
        <p className="text-gray-400 mb-6">Join a team to start managing tasks with your teammates.</p>
        <a href="/teammates" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">Find Teammates →</a>
      </div>
    </div>
  );

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-gray-400 text-sm mt-1">
            {totalCount > 0 ? `${completedCount}/${totalCount} tasks completed` : 'No tasks yet — add your first task!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
              </div>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
          )}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={`min-w-[280px] flex-shrink-0 flex flex-col rounded-2xl border ${col.border} ${col.bg} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className={`font-bold text-sm ${col.color}`}>{col.label}</h3>
                </div>
                <span className="text-xs bg-black/30 px-2.5 py-1 rounded-full font-mono font-bold">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[120px]">
                <AnimatePresence>
                  {colTasks.map(task => (
                    <TaskCard key={task._id} task={task} members={members} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 text-gray-600 text-xs text-center">
                    <div className="w-8 h-8 rounded-full border border-dashed border-gray-700 flex items-center justify-center mb-2"><Plus size={14} /></div>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Plus size={18} className="text-blue-400" /> New Task</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Task Title *</label>
                  <input type="text" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Build authentication API"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                  <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                    placeholder="Optional task details..." rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm">
                      {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Assign To</label>
                    <select value={newTask.assignedTo} onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm">
                      <option value="">Unassigned</option>
                      {members.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name?.split(' ')[0]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold hover:opacity-90 transition-all">Create Task</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
