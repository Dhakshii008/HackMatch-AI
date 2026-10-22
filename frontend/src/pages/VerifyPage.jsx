import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, MapPin, Target, Calendar, Award } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import api from '../services/api';

const VerifyPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const cleanId = (id || '').trim();

  useEffect(() => {
    let cancelled = false;
    const verifyCert = async () => {
      try {
        // Public endpoint — no auth required, so anyone can check a certificate.
        const res = await api.get(`/certificates/verify/${encodeURIComponent(cleanId)}`);
        if (cancelled) return;
        if (!res.data?.valid) {
          setError(true);
        } else {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Certificate verification failed:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    verifyCert();
    return () => { cancelled = true; };
  }, [cleanId]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 relative text-white">
      <AnimatedBackground />
      
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-xl">HM</div>
        <span className="font-bold text-xl neon-text hidden sm:block">HackMatch AI</span>
      </div>

      {loading ? (
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold animate-pulse">Verifying Blockchain Record...</h2>
          <p className="text-gray-400 mt-2">Checking authenticity of certificate {cleanId || id}</p>
        </div>
      ) : error ? (
        <GlassCard className="w-full max-w-lg p-10 z-10 text-center border-red-500/30 bg-red-900/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          <XCircle className="text-red-500 w-24 h-24 mx-auto mb-6 relative z-10" />
          <h2 className="text-3xl font-bold mb-4 text-red-400 relative z-10">Certificate Not Found</h2>
          <p className="text-gray-300 mb-8 relative z-10 text-lg">
            The certificate ID <span className="font-mono text-red-300">{cleanId || id}</span> is invalid or has been revoked by the organizers.
          </p>
          <Link to="/" className="inline-block bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-colors relative z-10">
            Return to Homepage
          </Link>
        </GlassCard>
      ) : (
        <GlassCard className="w-full max-w-2xl p-0 z-10 border-green-500/50 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-gradient-to-b from-green-500/20 to-transparent p-10 text-center border-b border-white/5 relative">
            <ShieldCheck size={120} className="absolute -top-10 -right-10 text-green-500/10 rotate-12" />
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-500/30">
              <CheckCircle2 className="text-green-400 w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Verified Authentic</h2>
            <p className="text-gray-300 text-lg">This certificate is officially verified by HackMatch AI.</p>
          </div>
          
          <div className="p-10 space-y-6 bg-black/40">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Participant Name</span>
                <div className="text-xl font-bold text-white">{data.user?.name}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Award</span>
                <div className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                  <Award size={20}/> <span className="capitalize">{(data.awardTitle || data.type || 'participation').replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1"><Target size={14}/> Project</span>
                <div className="text-lg text-blue-300 font-medium">{data.projectTitle || '—'}{data.team?.name ? ` (Team ${data.team.name})` : ''}</div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1"><MapPin size={14}/> Institution</span>
                <div className="text-base text-gray-300">
                  {data.user?.college || '—'}{data.user?.department ? ` - ${data.user.department}` : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={16}/> Issued: <span className="text-white font-medium">{data.issueDate ? new Date(data.issueDate).toLocaleDateString() : '—'}</span>
            </div>
            <div className="font-mono bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
              ID: {data?.certificateId || cleanId || id}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default VerifyPage;
