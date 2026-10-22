import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center p-6">
    <div className="fixed inset-0 -z-10">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
    </div>
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
      <div className="relative mb-8">
        <div className="text-[10rem] font-extrabold leading-none bg-gradient-to-r from-blue-600/20 to-purple-600/20 bg-clip-text text-transparent select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
            <AlertTriangle size={36} className="text-white" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold mb-3">Page Not Found</h1>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Link to="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Home size={16} /> Go to Dashboard
        </Link>
        <button onClick={() => window.history.back()} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-all">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
