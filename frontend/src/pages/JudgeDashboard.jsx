import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
  Gavel,
  Trophy,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Github,
  Globe,
  Video,
  FileText,
  Users,
  Award,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  List,
  LogOut,
  X,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Presentation
} from 'lucide-react';

const TIER_CONFIG = {
  winner: { label: 'Grand Prize Winner', color: 'from-amber-400 to-yellow-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  runner_up: { label: 'First Runner-Up', color: 'from-slate-300 to-gray-400', badge: 'bg-slate-400/20 text-slate-200 border-slate-400/40' },
  second_runner_up: { label: 'Second Runner-Up', color: 'from-amber-700 to-yellow-800', badge: 'bg-amber-700/20 text-amber-200 border-amber-700/40' },
  alternate: { label: 'Alternate Prize', color: 'from-cyan-400 to-blue-500', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  special_mention: { label: 'Special Mention', color: 'from-purple-400 to-pink-500', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  participation: { label: 'Participation', color: 'from-blue-500 to-indigo-500', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
};

const getTierInfo = (score) => {
  const s = Number(score) || 0;
  if (s >= 85) return TIER_CONFIG.winner;
  if (s >= 70) return TIER_CONFIG.runner_up;
  if (s >= 60) return TIER_CONFIG.second_runner_up;
  if (s >= 50) return TIER_CONFIG.alternate;
  if (s >= 40) return TIER_CONFIG.special_mention;
  return TIER_CONFIG.participation;
};

const CRITERIA_DEF = [
  { key: 'innovation', label: '1. Innovation & Uniqueness', max: 20, desc: 'Novelty, creativity, and original approach to the problem.' },
  { key: 'technical', label: '2. Technical Implementation', max: 20, desc: 'Code architecture, tech stack complexity, robustness & execution.' },
  { key: 'relevance', label: '3. Problem Relevance', max: 20, desc: 'Direct alignment with hackathon problem statement and real user needs.' },
  { key: 'uiux', label: '4. UI / UX Design', max: 15, desc: 'Interface aesthetics, responsiveness, clarity, and user experience.' },
  { key: 'impact', label: '5. Scalability & Impact', max: 15, desc: 'Practical utility, scalability, and societal or market impact.' },
  { key: 'presentation', label: '6. Presentation & Pitch', max: 10, desc: 'Clarity of documentation, demo video, PPT slides, and repository.' },
];

const JudgeDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, evaluated: 0, pending: 0, topScore: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, evaluated
  const [domainFilter, setDomainFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, score_high, score_low, title
  const [viewMode, setViewMode] = useState('cards'); // cards, table

  // Modals state
  const [viewingProject, setViewingProject] = useState(null);
  const [evaluatingProject, setEvaluatingProject] = useState(null);

  // Evaluation Form state
  const [evalScores, setEvalScores] = useState({
    innovation: 15,
    technical: 15,
    relevance: 15,
    uiux: 10,
    impact: 10,
    presentation: 8,
  });
  const [comments, setComments] = useState('');
  const [feedback, setFeedback] = useState('');
  const [finalRemarks, setFinalRemarks] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Fetch all submissions from backend
  const fetchSubmissions = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/judge/submissions');
      const data = res.data?.data || [];
      const backendStats = res.data?.stats;

      setSubmissions(data);

      if (backendStats) {
        setStats(backendStats);
      } else {
        // Compute locally if not returned
        const evaluated = data.filter((s) => s.status === 'evaluated' || s.evaluation?.status === 'completed').length;
        const total = data.length;
        const pending = total - evaluated;
        let top = 0;
        let sum = 0;
        data.forEach((s) => {
          const score = s.evaluation?.total || s.autoEvalScore || 0;
          if (s.status === 'evaluated' || s.evaluation?.status === 'completed') {
            sum += score;
            if (score > top) top = score;
          }
        });
        setStats({
          total,
          evaluated,
          pending,
          topScore: top,
          avgScore: evaluated > 0 ? Math.round(sum / evaluated) : 0,
        });
      }

      if (isManualRefresh) toast.success('Judge Board updated with latest submissions!');
    } catch (err) {
      console.error('Failed to fetch judge submissions:', err);
      toast.error(err.response?.data?.message || 'Failed to load submitted projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out from Judge Portal');
    navigate('/judge/login');
  };

  // Extract unique domains for category filter
  const availableDomains = useMemo(() => {
    const set = new Set();
    submissions.forEach((s) => {
      const d = s.project?.problem?.domain || s.team?.problem?.domain;
      if (d) set.add(d);
    });
    return Array.from(set);
  }, [submissions]);

  // Filtered and sorted submissions list
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter((s) => s.status !== 'evaluated');
    } else if (statusFilter === 'evaluated') {
      result = result.filter((s) => s.status === 'evaluated');
    }

    // Domain filter
    if (domainFilter !== 'all') {
      result = result.filter((s) => {
        const d = s.project?.problem?.domain || s.team?.problem?.domain || '';
        return d.toLowerCase() === domainFilter.toLowerCase();
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((s) => {
        const title = (s.project?.title || '').toLowerCase();
        const desc = (s.project?.description || '').toLowerCase();
        const teamName = (s.team?.name || '').toLowerCase();
        const prob = (s.project?.problem?.title || s.team?.problem?.title || '').toLowerCase();
        const tech = Array.isArray(s.project?.techStack) ? s.project.techStack.join(' ').toLowerCase() : '';
        const members = Array.isArray(s.team?.members) ? s.team.members.map((m) => m.user?.name || '').join(' ').toLowerCase() : '';
        const id = (s.submissionId || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || teamName.includes(q) || prob.includes(q) || tech.includes(q) || members.includes(q) || id.includes(q);
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt || a.createdAt || 0) - new Date(b.submittedAt || b.createdAt || 0);
      }
      if (sortBy === 'score_high') {
        const scoreA = a.evaluation?.total ?? (a.status === 'evaluated' ? a.autoEvalScore : -1);
        const scoreB = b.evaluation?.total ?? (b.status === 'evaluated' ? b.autoEvalScore : -1);
        return scoreB - scoreA;
      }
      if (sortBy === 'score_low') {
        const scoreA = a.evaluation?.total ?? (a.status === 'evaluated' ? a.autoEvalScore : 999);
        const scoreB = b.evaluation?.total ?? (b.status === 'evaluated' ? b.autoEvalScore : 999);
        return scoreA - scoreB;
      }
      if (sortBy === 'title') {
        const titleA = a.project?.title || a.team?.name || '';
        const titleB = b.project?.title || b.team?.name || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

    return result;
  }, [submissions, statusFilter, domainFilter, searchTerm, sortBy]);

  // Open evaluation modal and preload existing scores if already evaluated
  const startEvaluation = (sub) => {
    setEvaluatingProject(sub);
    if (sub.evaluation) {
      const prev = sub.evaluation.scores || {};
      setEvalScores({
        innovation: prev.innovation ?? 15,
        technical: prev.technical ?? 15,
        relevance: prev.relevance ?? 15,
        uiux: prev.uiux ?? 10,
        impact: prev.impact ?? 10,
        presentation: prev.presentation ?? 8,
      });
      setComments(sub.evaluation.comments || '');
      setFeedback(sub.evaluation.feedback || '');
      setFinalRemarks(sub.evaluation.finalRemarks || '');
    } else {
      // Clean defaults
      setEvalScores({
        innovation: 16,
        technical: 16,
        relevance: 16,
        uiux: 12,
        impact: 12,
        presentation: 8,
      });
      setComments('');
      setFeedback('');
      setFinalRemarks('');
    }
  };

  // Calculate live total score
  const currentTotal = useMemo(() => {
    return Object.values(evalScores).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }, [evalScores]);

  const currentTier = useMemo(() => getTierInfo(currentTotal), [currentTotal]);

  const handleScoreSliderChange = (key, value) => {
    setEvalScores((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    if (!evaluatingProject) return;

    setSubmittingEval(true);
    try {
      const res = await api.post('/judge/evaluate', {
        submissionId: evaluatingProject._id,
        scores: evalScores,
        comments,
        feedback,
        finalRemarks,
      });

      toast.success(`Evaluation saved for ${evaluatingProject.project?.title || evaluatingProject.team?.name}! Score: ${currentTotal}/100 🏆`);

      const savedEval = res.data?.data;

      // Update state in place
      setSubmissions((prev) =>
        prev.map((s) => {
          if (s._id === evaluatingProject._id) {
            return {
              ...s,
              status: 'evaluated',
              autoEvalScore: currentTotal,
              evaluation: savedEval || {
                scores: evalScores,
                total: currentTotal,
                comments,
                feedback,
                finalRemarks,
                status: 'completed',
                evaluatedAt: new Date().toISOString(),
              },
            };
          }
          return s;
        })
      );

      // Re-fetch stats to stay 100% in sync with backend
      api.get('/judge/stats').then((res) => {
        if (res.data?.data) setStats(res.data.data);
      });

      setEvaluatingProject(null);
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmittingEval(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/30 p-6 md:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <Gavel size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">Judge Board & Evaluation Center</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-mono font-bold tracking-wider">
                    Official
                  </span>
                </div>
                <p className="text-gray-300 text-xs md:text-sm">
                  Review submitted participant projects, explore technical deliverables, and assign official rubric scores.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchSubmissions(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all disabled:opacity-50"
              title="Fetch latest submissions from database"
            >
              <RotateCcw size={14} className={refreshing ? 'animate-spin text-amber-400' : 'text-gray-400'} />
              <span>{refreshing ? 'Syncing...' : 'Sync Submissions'}</span>
            </button>

            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
                title="Dense Table View"
              >
                <List size={14} /> Table
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-all"
              title="Sign out of judge portal"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Total */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Total Submitted</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.total}</span>
            <span className="text-xs text-gray-400 font-medium">Projects</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-2">All submitted teams in MongoDB</div>
        </div>

        {/* Stat 2: Evaluated */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Projects Evaluated</span>
            <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-green-400">{stats.evaluated}</span>
            <span className="text-xs text-gray-400 font-medium">
              / {stats.total} ({stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.evaluated / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Stat 3: Pending */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Pending Evaluation</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{stats.pending}</span>
            <span className="text-xs text-gray-400 font-medium">Awaiting Scores</span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-2 font-medium">
            {stats.pending > 0 ? 'Requires judge review' : 'All projects scored ✓'}
          </div>
        </div>

        {/* Stat 4: Top Score */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400">Top Score / Avg</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Trophy size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.topScore}</span>
            <span className="text-xs text-gray-400 font-medium">/ 100</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 ml-auto font-mono">
              Avg: {stats.avgScore}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-2">Highest scored submission</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project name, team, participants, tech stack, or problem..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'pending' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('evaluated')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'evaluated' ? 'bg-green-500/30 text-green-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Evaluated ({stats.evaluated})
            </button>
          </div>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">All Categories</option>
            {availableDomains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="score_high">Sort: Highest Score</option>
            <option value="score_low">Sort: Lowest Score</option>
            <option value="title">Sort: Project Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Submissions Section */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-white/5 rounded-2xl border border-white/10 animate-pulse p-6 space-y-4">
              <div className="h-6 bg-white/10 rounded-md w-1/3" />
              <div className="h-8 bg-white/10 rounded-md w-3/4" />
              <div className="h-16 bg-white/10 rounded-md w-full" />
              <div className="h-8 bg-white/10 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Gavel size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">No Submitted Projects Found</h3>
          <p className="text-gray-400 text-sm">
            {searchTerm || statusFilter !== 'all' || domainFilter !== 'all'
              ? 'No submissions match your active filter criteria. Try resetting filters.'
              : 'Participants have not submitted any projects yet. When projects are submitted, they will appear here in real-time.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || domainFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDomainFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid Cards View */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((sub) => {
            const isEvaluated = sub.status === 'evaluated' || sub.evaluation?.status === 'completed';
            const score = sub.evaluation?.total ?? sub.autoEvalScore ?? 0;
            const tier = isEvaluated ? getTierInfo(score) : null;
            const teamMembers = sub.team?.members || [];
            const problemTitle = sub.project?.problem?.title || sub.team?.problem?.title || 'Problem Challenge';
            const problemDomain = sub.project?.problem?.domain || sub.team?.problem?.domain || 'General';

            return (
              <motion.div
                key={sub._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)] ${
                  isEvaluated ? 'border-green-500/30 hover:border-green-500/50' : 'border-amber-500/30 hover:border-amber-500/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Submission ID + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-gray-400 tracking-wider bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                      {sub.submissionId || 'HM-SUBMISSION'}
                    </span>
                    {isEvaluated ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${tier?.badge}`}>
                          Score: {score}/100
                        </span>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                    ) : (
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock size={10} /> Pending Evaluation
                      </span>
                    )}
                  </div>

                  {/* Project Title & Team */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {sub.project?.title || `${sub.team?.name || 'Team'} Solution`}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-amber-400/90 font-medium">
                      <Users size={12} />
                      <span>{sub.team?.name || 'Independent Team'}</span>
                    </div>
                  </div>

                  {/* Problem Statement Badge */}
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                      <span>Problem Statement</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                        {problemDomain}
                      </span>
                    </div>
                    <div className="text-xs text-gray-200 line-clamp-1 font-medium">{problemTitle}</div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {sub.project?.description || sub.project?.innovation || 'No detailed description provided.'}
                  </p>

                  {/* Tech Stack Pills */}
                  {Array.isArray(sub.project?.techStack) && sub.project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sub.project.techStack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                      {sub.project.techStack.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-500 font-mono">
                          +{sub.project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Team Members */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[11px] text-gray-400 font-medium mb-1.5 flex items-center justify-between">
                      <span>Participants ({teamMembers.length})</span>
                      <span className="text-[10px] text-gray-500">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teamMembers.map((m, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {m.user?.name || 'Member'}
                        </span>
                      ))}
                      {teamMembers.length === 0 && (
                        <span className="text-[11px] text-gray-500 italic">Leader: {sub.submittedBy?.name || 'Participant'}</span>
                      )}
                    </div>
                  </div>

                  {/* Deliverable Quick Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                    {sub.project?.githubUrl && (
                      <a
                        href={sub.project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                        title="GitHub Repository"
                      >
                        <Github size={14} />
                      </a>
                    )}
                    {sub.project?.demoUrl && (
                      <a
                        href={sub.project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 transition-colors"
                        title="Live Demo"
                      >
                        <Globe size={14} />
                      </a>
                    )}
                    {sub.project?.videoUrl && (
                      <a
                        href={sub.project.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                        title="Video Demo"
                      >
                        <Video size={14} />
                      </a>
                    )}
                    {(sub.project?.presentationUrl || sub.project?.documentationUrl) && (
                      <a
                        href={sub.project.presentationUrl || sub.project.documentationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                        title="PPT / Slides / Prototype"
                      >
                        <Presentation size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setViewingProject(sub)}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} /> View Project
                  </button>

                  <button
                    onClick={() => startEvaluation(sub)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isEvaluated
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    }`}
                  >
                    <Edit3 size={13} /> {isEvaluated ? 'Edit Score' : 'Evaluate'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10 font-mono">
                <tr>
                  <th className="py-3.5 px-4">Status & Score</th>
                  <th className="py-3.5 px-4">Project & Team</th>
                  <th className="py-3.5 px-4">Problem Domain</th>
                  <th className="py-3.5 px-4">Participants</th>
                  <th className="py-3.5 px-4">Deliverables</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubmissions.map((sub) => {
                  const isEvaluated = sub.status === 'evaluated' || sub.evaluation?.status === 'completed';
                  const score = sub.evaluation?.total ?? sub.autoEvalScore ?? 0;
                  const tier = isEvaluated ? getTierInfo(score) : null;
                  const teamMembers = sub.team?.members || [];
                  const problemDomain = sub.project?.problem?.domain || sub.team?.problem?.domain || 'General';

                  return (
                    <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isEvaluated ? (
                          <div className="space-y-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tier?.badge}`}>
                              {score}/100 • {tier?.label}
                            </span>
                            <div className="text-[10px] text-green-400 font-mono">Evaluated ✓</div>
                          </div>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Project & Team */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white max-w-xs truncate">
                          {sub.project?.title || `${sub.team?.name || 'Team'} Solution`}
                        </div>
                        <div className="text-xs text-amber-400/90 font-medium mt-0.5">{sub.team?.name || 'Independent'}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{sub.submissionId}</div>
                      </td>

                      {/* Domain */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono">
                          {problemDomain}
                        </span>
                      </td>

                      {/* Participants */}
                      <td className="py-4 px-4">
                        <div className="text-xs text-gray-300 max-w-xs truncate">
                          {teamMembers.map((m) => m.user?.name).filter(Boolean).join(', ') || sub.submittedBy?.name || 'Team Member'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">{teamMembers.length} members</div>
                      </td>

                      {/* Deliverables */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {sub.project?.githubUrl && (
                            <a
                              href={sub.project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                              title="GitHub"
                            >
                              <Github size={13} />
                            </a>
                          )}
                          {sub.project?.demoUrl && (
                            <a
                              href={sub.project.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-400"
                              title="Live Demo"
                            >
                              <Globe size={13} />
                            </a>
                          )}
                          {sub.project?.videoUrl && (
                            <a
                              href={sub.project.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                              title="Video"
                            >
                              <Video size={13} />
                            </a>
                          )}
                          {(sub.project?.presentationUrl || sub.project?.documentationUrl) && (
                            <a
                              href={sub.project.presentationUrl || sub.project.documentationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                              title="PPT / Slides"
                            >
                              <Presentation size={13} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-400">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setViewingProject(sub)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs"
                            title="View Project Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => startEvaluation(sub)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isEvaluated
                                ? 'bg-green-600 hover:bg-green-500 text-white'
                                : 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold'
                            }`}
                          >
                            <Edit3 size={12} /> {isEvaluated ? 'Rescore' : 'Score'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PROJECT DETAILS MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {viewingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0f1f] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 text-white my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/10">
                      {viewingProject.submissionId || 'HM-SUBMISSION'}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        viewingProject.status === 'evaluated'
                          ? 'bg-green-500/20 text-green-300 border-green-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {viewingProject.status === 'evaluated' ? 'Evaluated' : 'Pending Evaluation'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 mt-2">
                    {viewingProject.project?.title || `${viewingProject.team?.name} Solution`}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Team: <span className="text-white font-semibold">{viewingProject.team?.name || 'Hackathon Team'}</span> • Submitted on{' '}
                    {viewingProject.submittedAt ? new Date(viewingProject.submittedAt).toLocaleString() : 'Recent'}
                  </p>
                </div>

                <button
                  onClick={() => setViewingProject(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Links Bar */}
              <div className="flex items-center gap-3 flex-wrap p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-xs font-semibold text-gray-400">Deliverables:</span>
                {viewingProject.project?.githubUrl ? (
                  <a
                    href={viewingProject.project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                  >
                    <Github size={14} /> Open GitHub <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic">No GitHub</span>
                )}

                {viewingProject.project?.demoUrl ? (
                  <a
                    href={viewingProject.project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30 text-xs font-bold transition-colors"
                  >
                    <Globe size={14} /> Live Deployment <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic">No Demo URL</span>
                )}

                {viewingProject.project?.videoUrl ? (
                  <a
                    href={viewingProject.project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-xs font-bold transition-colors"
                  >
                    <Video size={14} /> Watch Demo Video <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic">No Video</span>
                )}

                {(viewingProject.project?.presentationUrl || viewingProject.project?.documentationUrl) && (
                  <a
                    href={viewingProject.project?.presentationUrl || viewingProject.project?.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold transition-colors"
                  >
                    <Presentation size={14} /> View PPT / Prototype <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* Grid Content */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left 2 Cols: Project Information */}
                <div className="md:col-span-2 space-y-6">
                  {/* Problem Statement Card */}
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">Problem Statement</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                        {viewingProject.project?.problem?.domain || viewingProject.team?.problem?.domain || 'Hackathon Track'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {viewingProject.project?.problem?.title || viewingProject.team?.problem?.title || 'Problem Title'}
                    </div>
                    {viewingProject.project?.problem?.organization && (
                      <div className="text-xs text-gray-400">
                        Organization: {viewingProject.project.problem.organization}
                      </div>
                    )}
                  </div>

                  {/* Project Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Project Description</h4>
                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-line">
                      {viewingProject.project?.description || 'No project description submitted.'}
                    </p>
                  </div>

                  {/* Solution Approach */}
                  {viewingProject.project?.solution && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Solution Approach</h4>
                      <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-line">
                        {viewingProject.project.solution}
                      </p>
                    </div>
                  )}

                  {/* Innovation & Impact */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles size={14} /> Key Innovation
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {viewingProject.project?.innovation || 'Standard implementation architecture.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-green-400 flex items-center gap-1.5">
                        <TrendingUp size={14} /> Expected Impact
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {viewingProject.project?.impact || 'Solves operational bottlenecks for target users.'}
                      </p>
                    </div>
                  </div>

                  {/* Architecture & Future Scope */}
                  {(viewingProject.project?.architecture || viewingProject.project?.futureScope) && (
                    <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
                      {viewingProject.project?.architecture && (
                        <div>
                          <span className="font-bold text-gray-300">Architecture: </span>
                          <span className="text-gray-400">{viewingProject.project.architecture}</span>
                        </div>
                      )}
                      {viewingProject.project?.futureScope && (
                        <div>
                          <span className="font-bold text-gray-300">Future Scope: </span>
                          <span className="text-gray-400">{viewingProject.project.futureScope}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tech Stack */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(viewingProject.project?.techStack) && viewingProject.project.techStack.length > 0 ? (
                        viewingProject.project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono"
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">No tech stack specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col: Team Members & Evaluation State */}
                <div className="space-y-6">
                  {/* Team Members List */}
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                        <Users size={14} className="text-amber-400" /> Team Members
                      </h4>
                      <span className="text-xs text-gray-500">{viewingProject.team?.members?.length || 0} members</span>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {Array.isArray(viewingProject.team?.members) && viewingProject.team.members.length > 0 ? (
                        viewingProject.team.members.map((m, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{m.user?.name || 'Member'}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-gray-400 font-mono">
                                {m.role || 'Member'}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">{m.user?.email}</div>
                            {m.user?.college && (
                              <div className="text-[10px] text-gray-500 truncate">{m.user.college}</div>
                            )}
                            {Array.isArray(m.user?.skills) && m.user.skills.length > 0 && (
                              <div className="text-[10px] text-cyan-300 font-mono truncate">
                                {m.user.skills.slice(0, 3).join(', ')}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-xl bg-white/5 text-xs text-gray-400">
                          Submitter: {viewingProject.submittedBy?.name || 'Participant'} ({viewingProject.submittedBy?.email})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evaluation Status Card */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                      <Award size={14} /> Evaluation Summary
                    </h4>

                    {viewingProject.evaluation ? (
                      <div className="space-y-3">
                        <div className="text-center p-3 rounded-xl bg-black/40 border border-white/10">
                          <div className="text-[10px] uppercase text-gray-400 font-bold">Total Score</div>
                          <div className="text-3xl font-extrabold text-white mt-1">
                            {viewingProject.evaluation.total} <span className="text-sm text-gray-400">/ 100</span>
                          </div>
                          <div className="text-xs text-amber-400 font-bold mt-1">
                            {getTierInfo(viewingProject.evaluation.total)?.label}
                          </div>
                        </div>

                        {viewingProject.evaluation.scores && (
                          <div className="space-y-1.5 text-xs text-gray-300">
                            <div className="flex justify-between">
                              <span>Innovation:</span>
                              <span className="font-mono text-white">{viewingProject.evaluation.scores.innovation || 0}/20</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Technical:</span>
                              <span className="font-mono text-white">{viewingProject.evaluation.scores.technical || 0}/20</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Relevance:</span>
                              <span className="font-mono text-white">{viewingProject.evaluation.scores.relevance || 0}/20</span>
                            </div>
                            <div className="flex justify-between">
                              <span>UI/UX:</span>
                              <span className="font-mono text-white">{viewingProject.evaluation.scores.uiux || 0}/15</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Impact:</span>
                              <span className="font-mono text-white">{viewingProject.evaluation.scores.impact || 0}/15</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Presentation:</span>
                              <span className="font-mono text-white">{viewingProject.evaluation.scores.presentation || 0}/10</span>
                            </div>
                          </div>
                        )}

                        {viewingProject.evaluation.comments && (
                          <div className="text-xs bg-black/40 p-2.5 rounded-lg border border-white/5">
                            <span className="font-bold text-gray-400 block mb-1">Judge Comments:</span>
                            <span className="italic text-gray-300">"{viewingProject.evaluation.comments}"</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-2">
                        <Clock size={24} className="mx-auto text-amber-400" />
                        <p className="text-xs text-gray-400">This project has not been scored yet.</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const target = viewingProject;
                        setViewingProject(null);
                        startEvaluation(target);
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                      <Edit3 size={13} /> {viewingProject.evaluation ? 'Edit Score & Rubric' : 'Evaluate This Project Now'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. EVALUATION & SCORING MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {evaluatingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0f1f] border border-amber-500/30 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 text-white my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 mb-2">
                    <Gavel size={12} /> Scoring Rubric
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">
                    Evaluating: {evaluatingProject.project?.title || `${evaluatingProject.team?.name} Solution`}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Team: <span className="text-amber-400 font-semibold">{evaluatingProject.team?.name}</span> • ID:{' '}
                    <span className="font-mono text-gray-300">{evaluatingProject.submissionId}</span>
                  </p>
                </div>

                <button
                  onClick={() => setEvaluatingProject(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Rubric Score Calculation Hero */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/20 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Total Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-black text-white">{currentTotal}</span>
                    <span className="text-lg text-gray-400 font-medium">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Predicted Tier
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${currentTier.badge}`}>
                    {currentTier.label}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleEvaluationSubmit} className="space-y-6">
                {/* 6 Criteria Sliders */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Award size={16} className="text-amber-400" /> Evaluation Criteria
                  </h3>

                  <div className="grid gap-3">
                    {CRITERIA_DEF.map(({ key, label, max, desc }) => (
                      <div
                        key={key}
                        className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">{label}</div>
                            <div className="text-[11px] text-gray-400">{desc}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={max}
                              value={evalScores[key] ?? 0}
                              onChange={(e) => handleScoreSliderChange(key, e.target.value)}
                              className="w-14 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-center font-mono text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-xs text-gray-500 font-mono">/ {max}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={max}
                            value={evalScores[key] ?? 0}
                            onChange={(e) => handleScoreSliderChange(key, e.target.value)}
                            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-black/40 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-amber-400" /> Judge Notes & Remarks
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Judge Comments (Visible to team)
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Highlight team strengths, code quality, and positive aspects of their solution..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Constructive Feedback & Areas for Improvement
                    </label>
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Actionable suggestions on what to build next, UX improvements, test coverage, etc..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Final Remarks / Judging Deliberation Note
                    </label>
                    <input
                      type="text"
                      value={finalRemarks}
                      onChange={(e) => setFinalRemarks(e.target.value)}
                      placeholder="e.g. Excellent contender for Grand Prize; well-rounded pitch and repository."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEvaluatingProject(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingEval}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-black font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingEval ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        Saving to Database...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Submit Official Evaluation ({currentTotal}/100)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JudgeDashboard;
