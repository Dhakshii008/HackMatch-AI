import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import { Users, Target, Shield, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const stats = [
    { label: 'Total Users', value: 512, icon: Users, color: 'text-blue-400' },
    { label: 'Teams Formed', value: 124, icon: Shield, color: 'text-purple-400' },
    { label: 'Submissions', value: 89, icon: Target, color: 'text-green-400' },
    { label: 'Evaluated', value: 45, icon: Award, color: 'text-yellow-400' },
  ];

  const chartData = [
    { name: 'AI', count: 40 },
    { name: 'Health', count: 30 },
    { name: 'FinTech', count: 20 },
    { name: 'Web3', count: 15 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Console</h1>
      
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {['overview', 'participants', 'teams', 'problems', 'submissions'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <GlassCard key={s.label} className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}><s.icon size={24}/></div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6 h-80">
              <h3 className="font-bold mb-4">Submissions by Domain</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>
      )}
      
      {activeTab !== 'overview' && (
        <GlassCard className="p-12 text-center text-gray-400">
          Table view for {activeTab} goes here. (Admin functionality).
        </GlassCard>
      )}
    </div>
  );
};

export default AdminDashboard;
