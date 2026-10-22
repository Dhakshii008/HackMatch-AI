import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, User, Settings, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { AnimatePresence, motion } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { unreadCount, notifications, markAllRead } = useNotificationStore();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') navigate(`/search?q=${e.target.value}`);
  };

  return (
    <header className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-40 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-gray-300 hover:text-white p-2 bg-white/5 rounded-lg">
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search HackMatch AI..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-white"
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)} 
            className={`relative p-2.5 text-gray-300 hover:text-white transition-colors rounded-xl border ${showNotifs ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050816] animate-pulse"></span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute right-0 mt-3 w-80 bg-[#0a0f25] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Check size={12}/> Mark all read</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.slice(0, 5).map((n, i) => (
                    <div key={i} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                        <div>
                          <p className={`text-sm ${!n.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>{n.title || 'New Notification'}</p>
                          <p className="text-xs text-gray-500 mt-1">{n.message || 'Check your updates'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <div className="p-6 text-center text-sm text-gray-500">No new notifications</div>}
                </div>
                <Link to="/notifications" className="block p-3 text-center text-sm text-blue-400 hover:bg-white/5 border-t border-white/10 bg-black/20 font-medium transition-colors">
                  View All Notifications
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 p-1 pl-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-colors ml-2">
            <span className="text-sm font-bold text-white hidden md:block max-w-[100px] truncate">{user?.name || 'Hacker'}</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
              {user?.name?.[0] || 'U'}
            </div>
          </button>
          
          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute right-0 mt-3 w-48 bg-[#0a0f25] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
                <Link to="/profile" className="flex items-center gap-2 w-full p-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  <User size={16}/> Profile
                </Link>
                <button className="flex items-center gap-2 w-full p-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  <Settings size={16}/> Settings
                </button>
                <div className="h-px bg-white/10 my-1 mx-2"></div>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full p-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors font-medium">
                  <LogOut size={16}/> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
