import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import NeonButton from '../components/ui/NeonButton';
import {
  Download, Share2, ShieldCheck, Trophy, Medal, Award,
  Sparkles, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useSocketStore from '../store/socketStore';
import api from '../services/api';

/**
 * Visual identity per award tier. The winning tiers get gold treatment and a
 * heavier highlight; participation still looks polished but calmer.
 */
const TIER_STYLES = {
  winner: {
    label: 'Grand Prize Winner',
    icon: Trophy,
    accent: '#fbbf24',
    accent2: '#f59e0b',
    glow: 'rgba(251,191,36,0.45)',
    ring: 'border-yellow-400/60',
    text: 'text-yellow-300',
    bg: 'from-yellow-500/20',
    headline: 'CERTIFICATE OF EXCELLENCE',
    ribbon: 'WINNER',
  },
  runner_up: {
    label: 'First Runner-Up',
    icon: Medal,
    accent: '#e2e8f0',
    accent2: '#94a3b8',
    glow: 'rgba(226,232,240,0.35)',
    ring: 'border-slate-300/50',
    text: 'text-slate-200',
    bg: 'from-slate-400/20',
    headline: 'CERTIFICATE OF DISTINCTION',
    ribbon: 'RUNNER-UP',
  },
  second_runner_up: {
    label: 'Second Runner-Up',
    icon: Medal,
    accent: '#d97706',
    accent2: '#b45309',
    glow: 'rgba(217,119,6,0.35)',
    ring: 'border-amber-600/50',
    text: 'text-amber-300',
    bg: 'from-amber-600/20',
    headline: 'CERTIFICATE OF DISTINCTION',
    ribbon: '2ND RUNNER-UP',
  },
  alternate: {
    label: 'Alternate Prize',
    icon: Sparkles,
    accent: '#a78bfa',
    accent2: '#7c3aed',
    glow: 'rgba(167,139,250,0.45)',
    ring: 'border-purple-400/60',
    text: 'text-purple-300',
    bg: 'from-purple-500/20',
    headline: 'CERTIFICATE OF ALTERNATE PRIZE',
    ribbon: 'ALTERNATE PRIZE',
  },
  special_mention: {
    label: 'Special Mention',
    icon: Star,
    accent: '#22d3ee',
    accent2: '#0891b2',
    glow: 'rgba(34,211,238,0.4)',
    ring: 'border-cyan-400/50',
    text: 'text-cyan-300',
    bg: 'from-cyan-500/20',
    headline: 'CERTIFICATE OF SPECIAL MENTION',
    ribbon: 'SPECIAL MENTION',
  },
  participation: {
    label: 'Participation Award',
    icon: Award,
    accent: '#60a5fa',
    accent2: '#2563eb',
    glow: 'rgba(96,165,250,0.3)',
    ring: 'border-blue-400/40',
    text: 'text-blue-300',
    bg: 'from-blue-500/20',
    headline: 'CERTIFICATE OF PARTICIPATION',
    ribbon: 'PARTICIPANT',
  },
};

const styleFor = (type) => TIER_STYLES[type] || TIER_STYLES.participation;

const CertificateDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const certRef = useRef(null);

  const [cert, setCert] = useState(null);
  const [award, setAward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Public endpoint so a shared verification URL renders correctly too.
        const res = await api.get(`/certificates/verify/${id}`);
        if (cancelled) return;
        if (res.data?.valid) {
          setCert(res.data.data);
          // Prefer the server-resolved tier so labels can never drift.
          setAward(res.data.award || null);
        } else {
          setError('Certificate not found or revoked');
        }
      } catch (err) {
        console.error('Failed to load certificate:', err);
        if (!cancelled) setError(err.response?.data?.message || 'Certificate not found or revoked');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Live upgrade: when a judge awards an Alternate Prize / Special Mention the
  // certificate re-renders without the participant having to reload.
  useEffect(() => {
    let cancelled = false;
    let attached = null;

    const onAward = (payload) => {
      if (cancelled) return;
      if (payload?.certificateId && payload.certificateId !== id) return;
      setCert((prev) => (prev ? { ...prev, type: payload.type, awardTitle: payload.awardTitle } : prev));
      setAward((prev) => (prev ? { ...prev, type: payload.type, label: payload.awardTitle } : prev));
      toast.success(payload.message || 'Your certificate has been updated!');
    };

    (async () => {
      try {
        if (user?._id) useSocketStore.getState().connect(user._id);
        const socket = useSocketStore.getState().socket;
        if (!socket) return;
        socket.on('award_announced', onAward);
        attached = socket;
      } catch { /* socket is optional for a public certificate view */ }
    })();

    return () => {
      cancelled = true;
      if (attached) attached.off('award_announced', onAward);
    };
  }, [id, user?._id]);

  const certId = cert?.certificateId || id;

  const getVerificationBaseUrl = () => {
    const envUrl = import.meta.env.VITE_CLIENT_URL || import.meta.env.VITE_APP_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim().replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return '';
  };

  const verificationUrl = `${getVerificationBaseUrl()}/verify/${certId}`;

  const type = cert?.type || 'participation';
  const style = styleFor(type);
  const TierIcon = style.icon;
  const isTopTier = type === 'winner' || type === 'runner_up' || type === 'second_runner_up';

  const awardLabel = cert?.awardTitle || award?.label || style.label;
  const headline = cert?.awardHeadline || award?.headline || style.ribbon;
  const blurb = cert?.awardBlurb || award?.blurb || 'for building, deploying and presenting a project at HackMatch AI';
  const project = cert?.projectTitle || cert?.team?.name || '—';
  const date = cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '—';
  const score = cert?.awardScore;

  const downloadPDF = async () => {
    if (!certRef.current) return;
    const toastId = toast.loading('Generating high-res PDF...');

    // Save original createPattern to prevent html2canvas crash on subpixel gradient elements
    const originalCreatePattern = CanvasRenderingContext2D.prototype.createPattern;
    CanvasRenderingContext2D.prototype.createPattern = function (image, repetition) {
      if (image && (image instanceof HTMLCanvasElement || image.tagName === 'CANVAS')) {
        if (image.width === 0) image.width = 1;
        if (image.height === 0) image.height = 1;
      }
      return originalCreatePattern.call(this, image, repetition);
    };

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#050812',
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const win = clonedDoc.defaultView || window;
          if (win && win.CanvasRenderingContext2D && win.CanvasRenderingContext2D.prototype) {
            const origPattern = win.CanvasRenderingContext2D.prototype.createPattern;
            win.CanvasRenderingContext2D.prototype.createPattern = function (image, repetition) {
              if (image && typeof image === 'object') {
                if (image.width === 0) image.width = 1;
                if (image.height === 0) image.height = 1;
              }
              try {
                return origPattern.call(this, image, repetition);
              } catch (e) {
                const dummy = clonedDoc.createElement('canvas');
                dummy.width = 1;
                dummy.height = 1;
                return origPattern.call(this, dummy, repetition);
              }
            };
          }

          // Ensure thin divider lines with gradients have at least 2px height to render cleanly
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el) => {
            const bg = el.style?.background || el.style?.backgroundImage;
            if (bg && bg.includes('gradient')) {
              try {
                const comp = win.getComputedStyle(el);
                const h = parseFloat(comp.height);
                if (!isNaN(h) && h < 2) {
                  el.style.setProperty('min-height', '2px', 'important');
                  el.style.setProperty('height', '2px', 'important');
                }
              } catch (_) {}
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const Doc = typeof jsPDF === 'function' ? jsPDF : (jsPDF.jsPDF || window.jspdf?.jsPDF);
      if (!Doc) {
        throw new Error('PDF generator library not available');
      }

      const pdf = new Doc({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;

      let printWidth, printHeight;
      if (imgRatio > pageRatio) {
        printWidth = pageWidth;
        printHeight = pageWidth / imgRatio;
      } else {
        printHeight = pageHeight;
        printWidth = pageHeight * imgRatio;
      }

      const x = (pageWidth - printWidth) / 2;
      const y = (pageHeight - printHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, printWidth, printHeight, undefined, 'FAST');
      const cleanFileName = `HackMatch_${(awardLabel || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_')}_${certId || 'cert'}.pdf`;
      pdf.save(cleanFileName);
      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      CanvasRenderingContext2D.prototype.createPattern = originalCreatePattern;
    }
  };

  const share = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success('Verification link copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {error ? (
        <div className="max-w-xl mx-auto text-center py-20">
          <ShieldCheck size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2 text-red-400">Certificate Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-green-400"/> Your Certificate
              </h1>
              <p className="text-gray-400 text-sm mt-1">ID: <span className="font-mono">{certId}</span></p>
            </div>
            <div className="flex gap-3">
              <NeonButton onClick={share} variant="outline" className="px-6 shadow-none flex items-center gap-2"><Share2 size={16}/> Share</NeonButton>
              <NeonButton onClick={downloadPDF} className="px-6 flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border-none"><Download size={16}/> Download PDF</NeonButton>
            </div>
          </div>

          {/* Award banner — highlights the tier above the certificate itself */}
          <div
            className={`relative overflow-hidden rounded-2xl border ${style.ring} bg-gradient-to-r ${style.bg} via-transparent to-transparent p-5 flex flex-col sm:flex-row sm:items-center gap-4`}
            style={{ boxShadow: `0 0 40px ${style.glow}` }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${style.accent}, ${style.accent2})` }}
            >
              <TierIcon size={28} className="text-black/80" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Award Conferred</div>
              <div className={`text-2xl font-black ${style.text} leading-tight`}>{awardLabel}</div>
              <p className="text-xs text-gray-400 mt-0.5">{blurb}</p>
            </div>
            {score !== undefined && score !== null && (
              <div className="sm:ml-auto text-center shrink-0">
                <div className="text-3xl font-black" style={{ color: style.accent }}>
                  {Math.round(score)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Judge Score</div>
              </div>
            )}
          </div>

          {type === 'participation' && (
            <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4 text-sm text-purple-200">
              <span className="font-bold">Awaiting upgrade:</span> score higher in judging to be promoted to a
              Special Mention or Alternate Prize. Your certificate updates automatically.
            </div>
          )}

          <div className="overflow-x-auto pb-8 flex justify-center">
            {/* Certificate Container to capture */}
            <div
              ref={certRef}
              className="w-[1100px] h-[780px] bg-[#050812] relative flex flex-col justify-between shrink-0 p-10 overflow-hidden"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 38%, ${style.glow} 0%, transparent 68%)`,
                border: `2px solid ${style.accent}55`
              }}
            >
              {/* Inner double border */}
              <div
                className="absolute inset-3 border-[3px] border-double rounded-xl pointer-events-none z-10"
                style={{ borderColor: `${style.accent}55` }}
              />
              <div
                className="absolute inset-5 border border-white/10 rounded-lg pointer-events-none z-10"
              />

              {/* Corner elements */}
              {[
                'top-6 left-6 border-t-4 border-l-4',
                'top-6 right-6 border-t-4 border-r-4',
                'bottom-6 left-6 border-b-4 border-l-4',
                'bottom-6 right-6 border-b-4 border-r-4',
              ].map((c) => (
                <div key={c} className={`absolute w-12 h-12 pointer-events-none z-10 ${c}`} style={{ borderColor: style.accent }} />
              ))}

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                <span className="text-[260px] font-black tracking-widest text-white">HM</span>
              </div>

              {/* Top Section: Branding & Header */}
              <div className="relative z-20 text-center w-full flex flex-col items-center pt-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${style.accent}, ${style.accent2})`,
                    boxShadow: `0 0 25px ${style.glow}`
                  }}
                >
                  <span className="text-black font-black">HM</span>
                </div>

                <h1
                  className="text-2xl font-black tracking-[0.25em] uppercase text-center"
                  style={{ color: style.accent }}
                >
                  HackMatch AI 2026
                </h1>

                <div
                  className="w-48 h-0.5 mx-auto my-1.5"
                  style={{ background: `linear-gradient(to right, transparent, ${style.accent}aa, transparent)` }}
                />

                <p
                  className="tracking-[0.35em] text-xs uppercase font-bold text-center"
                  style={{ color: style.accent }}
                >
                  {style.headline || 'CERTIFICATE OF PARTICIPATION'}
                </p>
              </div>

              {/* Middle Section: Recipient & Recognition */}
              <div className="relative z-20 text-center w-full flex flex-col items-center px-12 my-auto">
                <p className="text-gray-300 text-sm italic font-serif mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                  This is proudly presented to
                </p>

                <h2
                  className="text-4xl font-bold text-white tracking-wide text-center my-1.5 px-4 max-w-3xl leading-tight drop-shadow-md break-words"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {cert?.user?.name || user?.name || 'Participant'}
                </h2>

                <div
                  className="w-56 h-px mx-auto mb-3"
                  style={{ background: `linear-gradient(to right, transparent, ${style.accent}88, transparent)` }}
                />

                {/* Award tier badge */}
                <div
                  className="inline-flex items-center gap-2 px-5 py-1 rounded-full mb-3 font-black uppercase tracking-widest text-xs"
                  style={{
                    background: `linear-gradient(135deg, ${style.accent}, ${style.accent2})`,
                    color: '#0b0f1a',
                    boxShadow: `0 0 20px ${style.glow}`
                  }}
                >
                  <TierIcon size={14} />
                  <span>{headline}</span>
                </div>

                <p className="text-gray-300 max-w-2xl text-sm leading-relaxed text-center mx-auto mb-3 px-6">
                  {isTopTier ? 'In recognition of winning ' : 'In recognition of active participation and contribution with '}
                  <span className="font-bold text-white" style={{ color: style.accent }}>{awardLabel}</span>{' '}
                  in building, deploying and presenting an innovative solution at HackMatch AI 2026.
                </p>

                {/* Dedicated Centered Project & Team Box */}
                <div className="max-w-2xl w-full mx-auto px-6 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-center shadow-inner">
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-300">
                    <div>
                      <span className="text-gray-500 uppercase font-bold tracking-wider mr-1.5">Project:</span>
                      <span className="font-bold text-white">"{project}"</span>
                    </div>
                    {cert?.team?.name && (
                      <>
                        <span className="text-gray-600 hidden sm:inline">•</span>
                        <div>
                          <span className="text-gray-500 uppercase font-bold tracking-wider mr-1.5">Team:</span>
                          <span className="font-semibold text-gray-200">{cert.team.name}</span>
                          {cert?.team?.teamCode && (
                            <span className="font-mono text-[10px] text-gray-400 ml-1">({cert.team.teamCode})</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Signatures & Verification Bar */}
              <div className="relative z-20 w-full px-6 pb-2">
                {/* Signatures Row */}
                <div className="flex justify-between items-end mb-4 px-12">
                  <div className="text-center w-52">
                    <div className="text-xl mb-1 text-white/90 select-none" style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}>
                      D. Mylsamy
                    </div>
                    <div className="w-full border-b border-gray-500/60 mb-1.5" />
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Platform Architect</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">HackMatch AI Core</p>
                  </div>

                  <div className="text-center w-52">
                    <div className="text-xl mb-1 text-white/90 select-none" style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}>
                      AI Evaluator & Jury
                    </div>
                    <div className="w-full border-b border-gray-500/60 mb-1.5" />
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Chief Judge</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Evaluation Council</p>
                  </div>
                </div>

                {/* Footer Bar: Certificate ID, Date, Verify URL on Left & Center, Dedicated QR on Right */}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between px-6">
                  <div className="flex flex-col text-[10px] text-gray-400 font-mono tracking-wider space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 uppercase font-semibold">Certificate ID:</span>
                      <span className="text-gray-300 font-bold">{certId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-gray-400">
                      <span><span className="text-gray-500 uppercase">Issued:</span> {date}</span>
                      <span>•</span>
                      <span><span className="text-gray-500 uppercase">Verification:</span> {verificationUrl}</span>
                    </div>
                  </div>

                  {/* Dedicated QR Code container on the RIGHT with white background and padding */}
                  <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 shrink-0">
                    <div className="bg-white p-1 rounded-lg shadow-md flex items-center justify-center">
                      <QRCodeSVG
                        value={verificationUrl}
                        size={64}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <div className="text-left font-mono text-[9px] text-gray-400 leading-tight">
                      <span className="font-bold text-white block uppercase tracking-wider text-[10px]">
                        Scan to Verify
                      </span>
                      <span className="text-gray-400">Official Authenticity</span>
                      <span className="block text-gray-500 text-[8px]">hackmatch.ai/verify</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CertificateDetailPage;
