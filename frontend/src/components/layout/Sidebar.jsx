import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, User, FileText, Target, Users, Shield, Award, MessageSquare, CheckSquare, Github, Folder, UploadCloud, CheckCircle, Trophy, Medal, Gavel } from 'lucide-react';
import clsx from 'clsx';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  let links = [];

  if (user?.role === 'judge') {
    links = [
      { name: 'Home', path: '/', icon: Home },
      { name: 'Judge Board', path: '/judge', icon: Gavel },
      { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
      { name: 'Certificates', path: '/certificates', icon: Medal },
      { name: 'Prizes & Awards', path: '/prizes', icon: Award },
      { name: 'Problem Statements', path: '/problems', icon: Target },
      { name: 'Global Search', path: '/search', icon: Target },
    ];
  } else {
    links = [
      { name: 'Home', path: '/', icon: Home },
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', path: '/profile', icon: User },
      { name: 'Resume Analyzer', path: '/resume', icon: FileText },
      { name: 'AI Problem Matcher', path: '/problems', icon: Target },
      { name: 'Find Teammates', path: '/teammates', icon: Users },
      { name: 'Collaboration', path: '/collaboration', icon: Users },
      { name: 'My Team', path: '/team', icon: Shield },
      { name: 'Workspace', path: '/workspace', icon: Folder },
      { name: 'Chat', path: '/chat', icon: MessageSquare },
      { name: 'Tasks', path: '/tasks', icon: CheckSquare },
      { name: 'GitHub', path: '/github', icon: Github },
      { name: 'Project', path: '/project', icon: Folder },
      { name: 'Submit Project', path: '/submit', icon: UploadCloud },
      { name: 'Evaluation', path: '/evaluation', icon: CheckCircle },
      { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
      { name: 'Prizes', path: '/prizes', icon: Award },
      { name: 'Certificates', path: '/certificates', icon: Medal },
    ];

    if (user?.role === 'admin') {
      links.push({ name: 'Admin Dashboard', path: '/admin', icon: Shield });
      links.push({ name: 'Judge Panel', path: '/judge', icon: Gavel });
    }
  }

  return (
    <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-full hidden md:flex transition-all">
      <Link to={user?.role === 'judge' ? '/judge' : '/dashboard'} className="p-6 flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg">HM</div>
        <span className="font-bold text-xl neon-text">HackMatch AI</span>
      </Link>
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.path === '/'
            ? pathname === '/' || pathname === '/home' || pathname === '/landing'
            : pathname === link.path || pathname.startsWith(link.path + '/');
          return (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                isActive 
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold">
          {user?.name?.[0] || 'U'}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold truncate w-32">{user?.name}</span>
          <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
