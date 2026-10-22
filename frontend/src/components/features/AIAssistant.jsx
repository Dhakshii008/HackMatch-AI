import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Target, ShieldAlert, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const aiResponses = {
  'problem': "Based on your skills, I recommend **'Smart Healthcare AI Assistant'** with a 94% match! Your Python and React expertise make you a perfect fit. Want to see the details?",
  'team': "I found 5 potential teammates for you! **Arjun Kumar** (Backend) and **Priya Sharma** (ML) are your top matches with 91%+ compatibility. Should I draft an invite?",
  'skills': "Your team's skill coverage is currently 87%. I've analyzed your project scope and recommend adding someone with **Cloud/DevOps** expertise to complete the stack.",
  'status': "Your project is in the development phase. Don't forget to add your **GitHub URL** and **demo link** before submission! You have 3 pending tasks.",
  'default': "I'm the HackMatch AI Assistant! I can help you find the right problem, match with teammates, analyze your team's skills, or track your project status. What do you need?"
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: aiResponses.default, sender: 'ai' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    // Determine response
    const query = text.toLowerCase();
    let replyKey = 'default';
    if (query.includes('problem') || query.includes('statement')) replyKey = 'problem';
    else if (query.includes('team') || query.includes('member')) replyKey = 'team';
    else if (query.includes('skill') || query.includes('missing') || query.includes('gap')) replyKey = 'skills';
    else if (query.includes('status') || query.includes('progress') || query.includes('submit')) replyKey = 'status';

    // Fake delay
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, text: aiResponses[replyKey], sender: 'ai' }]);
      setIsTyping(false);
    }, 1200);
  };

  const quickChips = [
    { label: 'Recommend Problem', key: 'problem' },
    { label: 'Find Teammates', key: 'team' },
    { label: 'Skill Gaps', key: 'skills' },
    { label: 'Check Status', key: 'status' }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform z-50 group"
      >
        <Bot size={28} className="group-hover:animate-bounce" />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#050816] animate-pulse"></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-[#0a0f25]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">HackMatch AI</h3>
                  <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-md ${
                    m.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm' 
                      : 'bg-white/10 text-gray-200 rounded-bl-sm border border-white/5'
                  }`}>
                    {/* Render bold text logic */}
                    {m.text.split('**').map((part, i) => (
                      i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                    ))}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-bl-sm p-4 w-16 flex justify-center items-center gap-1 border border-white/5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {quickChips.map(chip => (
                <button 
                  key={chip.key}
                  onClick={() => handleSend(chip.label)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            
            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask AI assistant..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 p-2.5 rounded-xl text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
