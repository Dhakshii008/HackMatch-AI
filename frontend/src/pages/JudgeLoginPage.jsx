import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Shield, Award, CheckCircle, Eye, EyeOff, ArrowRight, Zap, Star, FileCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AnimatedJudgeBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#070913]">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
    <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.4s' }} />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}
    />
  </div>
);

const JudgeLoginPage = () => {
  const [email, setEmail] = useState('judge@hackmatch.ai');
  const [password, setPassword] = useState('Judge@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'judge' || user?.role === 'admin') {
        navigate('/judge', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoggingIn(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      if (loggedUser?.role !== 'judge' && loggedUser?.role !== 'admin') {
        toast('Logged in, but this account is not registered as a Judge.', { icon: 'ℹ️' });
        navigate('/dashboard');
        return;
      }
      toast.success(`Welcome back, Judge ${loggedUser?.name || ''}! ⚖️`);
      navigate('/judge');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid judge credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoggingIn(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen text-white flex flex-col justify-between">
      <AnimatedJudgeBg />

      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-amber-500/20 bg-black/40 backdrop-blur-xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            HM
          </div>
          <div>
            <div className="font-bold text-lg bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              HackMatch AI
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono tracking-wider uppercase">Judge & Evaluator Portal</div>
          </div>
        </Link>
        <Link
          to="/login"
          className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5"
        >
          Participant Login <ArrowRight size={13} />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Info Panel */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Gavel size={14} className="text-amber-400" /> Official Judging Portal
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Evaluate. Score.{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Inspire.
              </span>
            </h1>

            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome to the official HackMatch AI Judge Board. Review real-time participant submissions, examine GitHub repositories, live deployments, videos, and pitch decks, and award rubric scores directly to the database.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { icon: Shield, title: 'Secure Judge Authentication', desc: 'Protected session with role validation and persistent access.' },
                { icon: FileCheck, title: 'Live Project Submissions', desc: 'Direct MongoDB sync displays newly submitted projects instantly.' },
                { icon: Star, title: '6-Criterion Rubric Scoring', desc: 'Innovation, Technical, Relevance, UI/UX, Impact & Presentation.' },
                { icon: Award, title: 'Instant Award Issuance', desc: 'Automatic score calculation upgrades certificates and leaderboard.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{title}</h4>
                    <p className="text-[11px] text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Login Box */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Quick Demo Login Card */}
            <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 border border-amber-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">Quick Judge Demo Login</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  Official Account
                </span>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/10 mb-3 space-y-1 font-mono text-xs">
                <div className="text-gray-400">
                  Email: <span className="text-amber-300 font-bold">judge@hackmatch.ai</span>
                </div>
                <div className="text-gray-400">
                  Password: <span className="text-amber-300 font-bold">Judge@123</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLogin('judge@hackmatch.ai', 'Judge@123')}
                disabled={loggingIn}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Authenticating Judge...
                  </>
                ) : (
                  <>
                    <Gavel size={14} /> One-Click Login as Judge
                  </>
                )}
              </button>
            </div>

            {/* Manual Sign-In Form */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" /> Judge Credentials
                </h3>
                <p className="text-xs text-gray-400 mt-1">Sign in with your assigned judge or administrator account</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Judge Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="judge@hackmatch.ai"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loggingIn ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Access Judge Dashboard
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-gray-500">
                Are you a hackathon participant?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1">
                  Participant Login →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-600 border-t border-white/5">
        © 2026 HackMatch AI • Hackathon Evaluation & Matchmaking Engine
      </footer>
    </div>
  );
};

export default JudgeLoginPage;
