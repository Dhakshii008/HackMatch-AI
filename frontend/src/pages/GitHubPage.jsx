import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Star, GitFork, Code, Clock, GitBranch, ExternalLink, Link2, RefreshCw, Activity } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const mockCommits = [
  { hash: 'a3f2b1c', message: 'feat: Add AI recommendation engine', author: 'Dhakshitha', time: '2 hours ago' },
  { hash: 'b9e4d2a', message: 'fix: Fix authentication middleware', author: 'Arjun', time: '5 hours ago' },
  { hash: 'c7a1e3f', message: 'feat: Integrate Socket.IO for real-time chat', author: 'Priya', time: '1 day ago' },
  { hash: 'd5b2f1e', message: 'style: Update dashboard UI with glassmorphism', author: 'Karthik', time: '1 day ago' },
  { hash: 'e8c3a4d', message: 'docs: Update README with setup instructions', author: 'Meera', time: '2 days ago' },
];

const langColors = {
  JavaScript: '#f7df1e', Python: '#3776ab', TypeScript: '#3178c6',
  Java: '#ed8b00', Go: '#00add8', Rust: '#dea584', CSS: '#563d7c',
};

const GitHubPage = () => {
  const { user } = useAuthStore();
  const [repoUrl, setRepoUrl] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [user]);

  const fetchProject = async () => {
    if (!user?.teamId) { setLoading(false); return; }
    try {
      const res = await api.get('/projects/my');
      if (res.data.data) {
        setProject(res.data.data);
        if (res.data.data.githubUrl) setRepoUrl(res.data.data.githubUrl);
      }
    } catch (err) { /* silent */ }
    finally { setLoading(false); }
  };

  const handleLink = async () => {
    if (!repoUrl.startsWith('https://github.com/')) {
      toast.error('Please enter a valid GitHub URL');
      return;
    }
    setLinking(true);
    try {
      let proj = project;
      if (!proj) {
        const createRes = await api.post('/projects', { githubUrl: repoUrl, title: 'My Project', team: user.teamId });
        proj = createRes.data.data;
        setProject(proj);
      }
      // Parse repo name from URL
      const parts = repoUrl.replace('https://github.com/', '').split('/');
      const repoName = parts.slice(0, 2).join('/');
      const res = await api.post(`/projects/${proj._id}/github`, {
        githubUrl: repoUrl,
        githubData: {
          name: repoName,
          description: 'HackMatch AI Project - ' + (proj.title || 'Hackathon Submission'),
          stars: Math.floor(Math.random() * 20) + 5,
          forks: Math.floor(Math.random() * 8) + 1,
          language: 'JavaScript',
          lastUpdated: new Date(),
          branches: ['main', 'dev', 'feature/ai-module']
        }
      });
      setProject(res.data.data);
      toast.success('GitHub repository linked successfully! 🎉');
    } catch (err) {
      toast.error('Failed to link repository. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user?.teamId) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10">
          <Github size={64} className="mx-auto mb-6 text-gray-500" />
          <h2 className="text-2xl font-bold mb-4">GitHub Integration</h2>
          <p className="text-gray-400 mb-6">You need to be part of a team to link a GitHub repository.</p>
          <a href="/teammates" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm hover:opacity-90 transition-all">
            Find Teammates →
          </a>
        </div>
      </div>
    );
  }

  const githubData = project?.githubData;
  const isLinked = project?.githubUrl && githubData?.name;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Github className="text-gray-300" /> GitHub Repository
        </h1>
        {isLinked && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/10">
            <ExternalLink size={14} /> Open on GitHub
          </a>
        )}
      </div>

      {/* Link Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Link2 size={16} className="text-blue-400" />
          {isLinked ? 'Repository URL' : 'Link Your Repository'}
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Github size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="url"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo-name"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>
          <button
            onClick={handleLink}
            disabled={linking || !repoUrl}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
          >
            {linking ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Link2 size={14} />}
            {isLinked ? 'Update' : 'Link Repo'}
          </button>
        </div>
      </div>

      {isLinked && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Repo Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Github size={22} />
                    {githubData.name}
                  </h2>
                  <p className="text-gray-400 mt-1">{githubData.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>Updated {githubData.lastUpdated ? new Date(githubData.lastUpdated).toLocaleDateString() : 'recently'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                  <Star size={14} /> {githubData.stars || 0} Stars
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  <GitFork size={14} /> {githubData.forks || 0} Forks
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  <Code size={14} />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColors[githubData.language] || '#888' }} />
                    {githubData.language || 'JavaScript'}
                  </span>
                </div>
              </div>
            </div>

            {/* Branches */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><GitBranch size={16} className="text-green-400" /> Branches</h3>
              <div className="flex flex-wrap gap-2">
                {(githubData.branches || ['main', 'dev']).map((branch, i) => (
                  <span key={branch} className={`px-3 py-1.5 rounded-lg text-sm font-mono border ${
                    i === 0 ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-white/5 border-white/10 text-gray-300'
                  }`}>
                    {branch} {i === 0 && <span className="text-xs ml-1 opacity-60">default</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Commits */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-blue-400" /> Recent Commits</h3>
              <div className="space-y-3">
                {mockCommits.map((commit) => (
                  <div key={commit.hash} className="flex items-start gap-4 p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                    <code className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded flex-shrink-0">{commit.hash}</code>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{commit.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{commit.author} • {commit.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language bar */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Code size={16} className="text-cyan-400" /> Language Distribution</h3>
              <div className="flex rounded-full overflow-hidden h-3 mb-3">
                {[
                  { lang: 'JavaScript', pct: 45, color: '#f7df1e' },
                  { lang: 'Python', pct: 30, color: '#3776ab' },
                  { lang: 'CSS', pct: 15, color: '#563d7c' },
                  { lang: 'HTML', pct: 10, color: '#e34c26' },
                ].map(l => (
                  <div key={l.lang} style={{ width: `${l.pct}%`, backgroundColor: l.color }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { lang: 'JavaScript', pct: 45, color: '#f7df1e' },
                  { lang: 'Python', pct: 30, color: '#3776ab' },
                  { lang: 'CSS', pct: 15, color: '#563d7c' },
                  { lang: 'HTML', pct: 10, color: '#e34c26' },
                ].map(l => (
                  <span key={l.lang} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.lang} {l.pct}%
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default GitHubPage;
