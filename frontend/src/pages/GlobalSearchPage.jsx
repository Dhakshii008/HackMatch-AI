import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Target, Folder, X, ChevronRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const GlobalSearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ participants: [], problems: [], teams: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query.trim()) {
      doSearch(query);
    }
  }, [query]);

  const doSearch = async (q) => {
    setLoading(true);
    try {
      const [usersRes, problemsRes] = await Promise.all([
        api.get(`/users/search?q=${encodeURIComponent(q)}`).catch(() => ({ data: { data: [] } })),
        api.get(`/problems?q=${encodeURIComponent(q)}`).catch(() => ({ data: { data: [] } })),
      ]);
      const participants = (usersRes.data.data || []).filter(u => u.role === 'participant');
      const problems = problemsRes.data.data || [];
      setResults({ participants, problems, teams: [] });
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const total = results.participants.length + results.problems.length + results.teams.length;

  const tabs = [
    { id: 'all', label: 'All Results', count: total },
    { id: 'participants', label: 'Participants', count: results.participants.length, icon: Users },
    { id: 'problems', label: 'Problems', count: results.problems.length, icon: Target },
  ];

  if (!query) return (
    <div className="max-w-3xl mx-auto text-center mt-20">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16">
        <Search size={64} className="mx-auto mb-6 text-gray-500" />
        <h2 className="text-2xl font-bold mb-4">Global Search</h2>
        <p className="text-gray-400">Use the search bar in the header to search for participants, problems, and teams.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><Search className="text-blue-400" /> Search Results</h1>
        <p className="text-gray-400 mt-1">
          {loading ? 'Searching...' : `${total} results for "${query}"`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}>
            {tab.label}
            <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : total === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
          <Search size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-gray-500">Try different search terms or browse participants directly.</p>
          <Link to="/teammates" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-sm">
            Browse Participants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Participants */}
          {(activeTab === 'all' || activeTab === 'participants') && results.participants.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Users size={18} className="text-blue-400" /> Participants ({results.participants.length})</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {results.participants.map(user => (
                  <motion.div key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold flex-shrink-0">
                      {user.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user.college} • {user.department}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(user.skills || []).slice(0, 3).map(s => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{s}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Problems */}
          {(activeTab === 'all' || activeTab === 'problems') && results.problems.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Target size={18} className="text-purple-400" /> Problems ({results.problems.length})</h2>
              <div className="space-y-3">
                {results.problems.map(problem => (
                  <motion.div key={problem._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Link to={`/problems/${problem._id}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/8 transition-all block">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">{problem.domain}</span>
                          <span className="text-xs text-gray-500">{problem.problemId}</span>
                        </div>
                        <div className="font-semibold text-sm">{problem.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{problem.organization}</div>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchPage;
