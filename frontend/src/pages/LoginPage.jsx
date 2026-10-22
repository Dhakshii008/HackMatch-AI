import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Brain, Users, Shield, ChevronDown, ChevronUp, CheckCircle, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

// Presentation-only styling, derived from the account's real role.
const ROLE_STYLE = {
  participant: { color: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Participant' },
  judge: { color: 'from-yellow-500 to-orange-500', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Judge' },
  admin: { color: 'from-red-500 to-pink-600', badge: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Admin' },
};
const styleFor = (role) => ROLE_STYLE[role] || ROLE_STYLE.participant;

const AnimatedBg = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(true);
  const [loggingInAs, setLoggingInAs] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'judge') {
        navigate('/judge', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Accounts come from the same User collection the API authenticates against,
  // so a shortcut can never point at an account that does not exist.
  useEffect(() => {
    let active = true;
    api.get('/auth/accounts')
      .then((res) => {
        if (!active) return;
        setAccounts(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => { if (active) setAccounts([]); })
      .finally(() => { if (active) setLoadingAccounts(false); });
    return () => { active = false; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loggedIn = await login(email, password);
      toast.success(`Welcome back, ${loggedIn?.name?.split(' ')[0]}! 🚀`);
      if (loggedIn?.role === 'judge') {
        navigate('/judge');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    }
  };

  const handleDemoLogin = async (account) => {
    if (!account.demoPassword) {
      toast.error(`No working password on record for ${account.email}.`);
      return;
    }
    setLoggingInAs(account.email);
    setEmail(account.email);
    setPassword(account.demoPassword);
    try {
      const loggedIn = await login(account.email, account.demoPassword);
      toast.success(`Logged in as ${loggedIn?.name?.split(' ')[0]}! 🎉`);
      if (loggedIn?.role === 'judge') {
        navigate('/judge');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Demo login failed. Ensure backend is running.');
    } finally {
      setLoggingInAs(null);
    }
  };

  return (
    <div className="min-h-screen text-white flex">
      <AnimatedBg />

      {/* Left Branding Panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative"
      >
        <div>
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              HM
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              HackMatch AI
            </span>
          </Link>

          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Welcome Back,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Innovator.
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Sign in to continue your hackathon journey, collaborate with your team, and build the future.
          </p>

          <div className="space-y-4">
            {[
              { icon: Brain, text: 'AI-powered skill & problem matching', color: 'text-blue-400' },
              { icon: Users, text: 'Intelligent team formation & collaboration', color: 'text-purple-400' },
              { icon: Shield, text: 'Secure JWT-based authentication', color: 'text-cyan-400' },
              { icon: Zap, text: 'Real-time notifications & team chat', color: 'text-green-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3 text-gray-300">
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
                  <Icon size={16} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-gray-600 text-sm">
          © 2026 HackMatch AI • Built with passion by Dhakshitha Mylsamy
        </div>
      </motion.div>

      {/* Right Login Panel */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl">HM</div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">HackMatch AI</span>
          </div>

          {/* Judge Portal Direct Link */}
          <Link
            to="/judge/login"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/15 transition-all group shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                ⚖️
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  Judging this Hackathon?
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 uppercase font-mono">Judge Portal</span>
                </div>
                <div className="text-[11px] text-gray-400">Access Judge Board & Project Scoring Rubric</div>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
              Judge Login →
            </span>
          </Link>

          {/* Demo Accounts Panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowDemoPanel(!showDemoPanel)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-gray-200">⚡ Quick Demo Login</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {loadingAccounts ? 'Loading…' : `${accounts.length} Accounts`}
                </span>
              </div>
              {showDemoPanel ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            <AnimatePresence>
              {showDemoPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
                    {loadingAccounts && (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                        <Loader2 size={16} className="animate-spin" /> Loading accounts…
                      </div>
                    )}
                    {!loadingAccounts && accounts.length === 0 && (
                      <div className="py-6 text-center text-sm text-gray-400">
                        No accounts available. Start the backend and run the seed.
                      </div>
                    )}
                    {accounts.map((account) => {
                      const style = styleFor(account.role);
                      return (
                      <motion.button
                        key={account.email}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleDemoLogin(account)}
                        disabled={loggingInAs !== null}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
                      >
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${style.color} flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg`}>
                          {account.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">{account.name}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full border flex-shrink-0 ${style.badge}`}>{style.label}</span>
                          </div>
                          <div className="text-xs text-gray-400 truncate">{account.email}</div>
                          {account.skills && account.skills.length > 0 && (
                            <div className="text-[11px] text-gray-500 truncate mt-0.5">
                              {account.skills.slice(0, 3).join(' • ')}
                            </div>
                          )}
                        </div>
                        {loggingInAs === account.email ? (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex-shrink-0" />
                        ) : (
                          <CheckCircle size={16} className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                        )}
                      </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">or sign in manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hackmatch.ai"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500/30"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Sign In to HackMatch AI
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500">
            New to HackMatch AI?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create your account →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
