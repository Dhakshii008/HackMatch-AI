import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Award, Star, Zap, Users, Gift, Briefcase, ExternalLink } from 'lucide-react';

const prizes = [
  {
    rank: 1,
    emoji: '🥇',
    title: 'GRAND WINNER',
    amount: '₹1,00,000',
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
    glow: 'shadow-[0_0_60px_rgba(234,179,8,0.4)]',
    border: 'border-yellow-400/40',
    bg: 'from-yellow-500/10 to-amber-500/5',
    perks: ['Cash Prize', 'Internship at Partner Company', 'Mentorship Program', 'Featured on HackMatch AI Hall of Fame'],
  },
  {
    rank: 2,
    emoji: '🥈',
    title: 'FIRST RUNNER-UP',
    amount: '₹50,000',
    gradient: 'from-gray-300 via-slate-400 to-gray-500',
    glow: 'shadow-[0_0_40px_rgba(148,163,184,0.3)]',
    border: 'border-gray-400/40',
    bg: 'from-gray-500/10 to-slate-500/5',
    perks: ['Cash Prize', '3-Month Mentorship', 'Cloud Credits Worth ₹10,000'],
  },
  {
    rank: 3,
    emoji: '🥉',
    title: 'SECOND RUNNER-UP',
    amount: '₹25,000',
    gradient: 'from-orange-400 via-amber-600 to-orange-700',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    border: 'border-orange-400/40',
    bg: 'from-orange-500/10 to-amber-500/5',
    perks: ['Cash Prize', '1-Month Mentorship', 'HackMatch AI Merchandise'],
  },
];

const specialAwards = [
  { icon: '🤖', title: 'Best AI Innovation', amount: '₹15,000', desc: 'Most creative use of artificial intelligence' },
  { icon: '💚', title: 'Best Social Impact', amount: '₹15,000', desc: 'Addresses real-world societal challenges' },
  { icon: '🎨', title: 'Best UI/UX Design', amount: '₹10,000', desc: 'Outstanding user experience and interface design' },
  { icon: '⚡', title: 'Best Emerging Technology', amount: '₹10,000', desc: 'Innovative use of cutting-edge technologies' },
  { icon: '🌱', title: 'Best Sustainability Solution', amount: '₹10,000', desc: 'Environmental impact and green innovation' },
  { icon: '🚀', title: 'Most Scalable Solution', amount: '₹10,000', desc: 'Architecture designed to scale globally' },
];

const sponsors = [
  { name: 'TechCorp India', tier: 'Platinum', color: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10' },
  { name: 'AI Ventures', tier: 'Platinum', color: 'text-purple-300 border-purple-500/30 bg-purple-500/10' },
  { name: 'CloudBase Systems', tier: 'Gold', color: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10' },
  { name: 'InnovateLabs', tier: 'Gold', color: 'text-orange-300 border-orange-500/30 bg-orange-500/10' },
  { name: 'DevStudio Co.', tier: 'Silver', color: 'text-gray-300 border-gray-500/30 bg-gray-500/10' },
  { name: 'StartupHub', tier: 'Silver', color: 'text-blue-300 border-blue-500/30 bg-blue-500/10' },
];

const PrizesPage = () => (
  <div className="max-w-5xl mx-auto space-y-12 pb-10">
    {/* Header */}
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm font-medium mb-6">
        <Trophy size={16} /> Prize Pool Worth ₹2,45,000+
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Win <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">Amazing Prizes</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        Compete for life-changing prizes, mentorship opportunities, internships, and national recognition.
      </p>
    </motion.div>

    {/* Top 3 Prizes — Podium */}
    <div className="grid md:grid-cols-3 gap-6 items-end">
      {/* Runner-up first (left) */}
      {[prizes[1], prizes[0], prizes[2]].map((prize, idx) => (
        <motion.div
          key={prize.rank}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`relative rounded-3xl border p-8 text-center ${prize.border} ${prize.glow} bg-gradient-to-b ${prize.bg} ${idx === 1 ? 'md:-mt-8 z-10' : ''} overflow-hidden`}
        >
          {idx === 1 && (
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
          )}
          <div className="text-6xl mb-4">{prize.emoji}</div>
          <div className={`text-xs font-bold tracking-widest uppercase mb-2 bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
            {prize.title}
          </div>
          <div className={`text-4xl font-extrabold mb-6 bg-gradient-to-r ${prize.gradient} bg-clip-text text-transparent`}>
            {prize.amount}
          </div>
          <div className="space-y-2">
            {prize.perks.map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-gray-300">
                <Star size={12} className="text-yellow-400 flex-shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Special Awards */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Special Awards</h2>
        <p className="text-gray-400">Recognizing excellence in specific domains</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialAwards.map((award, i) => (
          <motion.div
            key={award.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all"
          >
            <div className="text-3xl mb-3">{award.icon}</div>
            <div className="text-lg font-bold mb-1">{award.title}</div>
            <div className="text-2xl font-extrabold text-purple-400 mb-2">{award.amount}</div>
            <p className="text-xs text-gray-500">{award.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Perks */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">All Participants Get</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Award, label: 'Participation Certificate', desc: 'With unique QR verification' },
          { icon: Users, label: 'Networking Sessions', desc: 'Meet industry leaders' },
          { icon: Briefcase, label: 'Career Fair Access', desc: 'Connect with top companies' },
          { icon: Gift, label: 'Goodies & Swag', desc: 'HackMatch AI merchandise' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <Icon size={28} className="mx-auto mb-3 text-blue-400" />
            <div className="text-sm font-bold mb-1">{label}</div>
            <div className="text-xs text-gray-500">{desc}</div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Sponsors */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-300">Our Sponsors</h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {sponsors.map(s => (
          <div key={s.name} className={`px-5 py-2.5 rounded-xl border text-sm font-semibold ${s.color}`}>
            {s.name}
            <span className="text-xs ml-1.5 opacity-60">{s.tier}</span>
          </div>
        ))}
      </div>
    </motion.div>

    {/* CTA */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center py-8">
      <h2 className="text-3xl font-bold mb-4">Ready to Compete?</h2>
      <p className="text-gray-400 mb-8">Submit your project and compete for these amazing prizes.</p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Link to="/submit" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2">
          <Zap size={18} /> Submit Your Project
        </Link>
        <Link to="/leaderboard" className="px-8 py-3.5 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-all flex items-center gap-2">
          <Trophy size={18} /> View Leaderboard
        </Link>
      </div>
    </motion.div>
  </div>
);

export default PrizesPage;
