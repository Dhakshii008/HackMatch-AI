import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AnimatedBackground from '../ui/AnimatedBackground';
import AIAssistant from '../features/AIAssistant';
import useNotificationStore from '../../store/notificationStore';

const AppLayout = () => {
  const { fetchNotifications } = useNotificationStore();
  
  useEffect(() => { 
    fetchNotifications(); 
  }, [fetchNotifications]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-[#050816] text-white">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default AppLayout;
