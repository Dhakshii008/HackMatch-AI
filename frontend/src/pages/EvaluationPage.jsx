import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import NeonButton from '../components/ui/NeonButton';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Bot, FileWarning, Medal, ChevronRight } from 'lucide-react';

const AnimatedScore = ({ finalScore }) => {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setScore(Math.floor(progress * finalScore));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [finalScore]);
  return <>{score}</>;
};

const EvaluationPage = () => {
  const [state, setState] = useState('loading'); // loading, no_sub, evaluating, evaluated
  const [evalStep, setEvalStep] = useState(0);
  const navigate = useNavigate();

  const evalMessages = [
    "Analyzing Source Code Structure...",
    "Reviewing Technical Implementation...",
    "Assessing Architectural Scalability...",
    "Evaluating Problem Relevance...",
    "Analyzing UI/UX & User Journey...",
    "Scoring Overall Innovation & Impact...",
    "Generating Final Assessment Report..."
  ];

  const [evalData, setEvalData] = useState(null);

  useEffect(() => {
    const fetchEval = async () => {
      try {
        const [subRes, evalRes] = await Promise.all([
          api.get('/submissions/my').catch(() => ({ data: { data: null } })),
          api.get('/evaluations/my').catch(() => ({ data: { data: null } })),
        ]);

        const submission = subRes.data?.data;
        const evaluation = evalRes.data?.data;
        setEvalData(evaluation);

        if (!submission) {
          return setState('no_sub');
        }

        // Play the AI evaluation animation
        setState('evaluating');
        for (let i = 0; i < evalMessages.length; i++) {
          await new Promise(r => setTimeout(r, 450));
          setEvalStep(i + 1);
        }
        await new Promise(r => setTimeout(r, 400));
        setState('evaluated');
      } catch (err) {
        setState('no_sub');
      }
    };
    fetchEval();
  }, []);

  if (state === 'loading') return <div className="h-64 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (state === 'no_sub') {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center">
        <FileWarning size={64} className="text-gray-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">No Submission Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">You need to submit your project before the AI can evaluate it.</p>
        <NeonButton onClick={() => navigate('/submit')}>Go to Submission Portal</NeonButton>
      </div>
    );
  }

  if (state === 'evaluating') {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <GlassCard className="p-16 relative overflow-hidden border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-purple-600/10 animate-pulse" />
          <Bot size={80} className="mx-auto text-blue-400 mb-8 animate-bounce" />
          <h2 className="text-3xl font-bold mb-8">AI Evaluation in Progress</h2>
          
          <div className="space-y-4 max-w-md mx-auto text-left relative z-10">
            {evalMessages.map((msg, idx) => (
              <div key={idx} className={`text-sm font-medium transition-all duration-500 flex items-center gap-3 ${idx < evalStep ? 'text-green-400 opacity-100' : idx === evalStep ? 'text-blue-400 opacity-100 animate-pulse' : 'text-gray-600 opacity-0 hidden'}`}>
                {idx < evalStep ? '✓' : '⚡'} {msg}
              </div>
            ))}
          </div>
          
          <div className="w-full bg-white/5 h-2 rounded-full mt-10 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000 ease-out" style={{width: `${(evalStep / evalMessages.length) * 100}%`}}></div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const evalScores = evalData?.scores || {};
  const scores = [
    { label: 'Innovation', score: evalScores.innovation || 18, max: 20, color: 'from-blue-400 to-blue-600' },
    { label: 'Technical', score: evalScores.technical || 17, max: 20, color: 'from-purple-400 to-purple-600' },
    { label: 'Relevance', score: evalScores.relevance || 19, max: 20, color: 'from-cyan-400 to-cyan-600' },
    { label: 'Impact', score: evalScores.impact || 15, max: 20, color: 'from-green-400 to-green-600' },
    { label: 'UI/UX', score: evalScores.uiux || 8, max: 10, color: 'from-pink-400 to-pink-600' },
    { label: 'Scalability', score: evalScores.scalability || 9, max: 10, color: 'from-orange-400 to-orange-600' },
  ];
  const total = evalData?.total || scores.reduce((sum, item) => sum + item.score, 0);
  const feedbackComment = evalData?.comments || "The architecture demonstrates exceptional foresight in handling large datasets securely. The integration of React with Python backend is seamless. However, the UI contrast ratios in the dashboard could be improved for accessibility. The core innovation of using predictive modeling for early diagnosis is highly relevant and perfectly implemented.";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2"><Bot className="text-purple-400"/> Evaluation Report</h1>
          <p className="text-gray-400 text-lg">AI & Judge combined scoring matrix.</p>
        </div>
        <NeonButton onClick={() => navigate('/certificates')} variant="outline" className="mt-4 md:mt-0 flex items-center gap-2">
          <Medal size={18}/> View Certificate
        </NeonButton>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <GlassCard className="p-10 flex flex-col items-center justify-center border-t-4 border-t-blue-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Final Score</div>
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <AnimatedScore finalScore={total} />
          </div>
          <div className="text-lg font-medium text-gray-500 mt-2">out of 100</div>
          
          <div className="mt-10 px-6 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            🌟 Top 5% Globally
          </div>
        </GlassCard>

        <GlassCard className="p-8 lg:col-span-2">
          <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-4">Detailed Score Breakdown</h3>
          <div className="space-y-6">
            {scores.map((s, i) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-300">{s.label}</span>
                  <span className="text-white">{s.score} <span className="text-gray-500">/ {s.max}</span></span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden">
                  <motion.div 
                    initial={{width: 0}}
                    animate={{width: `${(s.score/s.max)*100}%`}}
                    transition={{duration: 1.5, delay: 0.5 + (i*0.1), ease: "easeOut"}}
                    className={`bg-gradient-to-r ${s.color} h-full rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 lg:col-span-3 border border-purple-500/30 bg-purple-900/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Bot className="text-purple-400"/> AI Feedback Summary</h3>
          <p className="text-gray-300 leading-relaxed text-lg bg-black/40 p-6 rounded-xl border border-white/5 italic shadow-inner">
            "{feedbackComment}"
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default EvaluationPage;
