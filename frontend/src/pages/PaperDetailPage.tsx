import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, MessageSquare, BookOpen, Clock,
  CheckCircle, AlertTriangle, FileOutput, BarChart2, Lightbulb, ArrowLeft, ShieldAlert
} from 'lucide-react';
import { papersApi, PaperDetail, Summary, Citation } from '../api/papers';
import { reportsApi } from '../api/reports';
import { researchApi } from '../api/research';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { ChatWindow } from '../components/chat/ChatWindow';
import { InsightsTab } from '../components/papers/InsightsTab';
import { StudyTab } from '../components/papers/StudyTab';
import { ReviewerTab } from '../components/papers/ReviewerTab';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ── Skeleton for the paper detail header + tabs ───────────────────────────────
const PaperDetailSkeleton = () => (
  <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
    <div className="mb-8 shrink-0">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="skeleton h-7 w-20 rounded-full" />
        <Skeleton className="skeleton h-4 w-36" />
      </div>
      <Skeleton className="skeleton h-10 w-3/4 mb-3" />
      <Skeleton className="skeleton h-10 w-2/4 mb-4" />
      <Skeleton className="skeleton h-5 w-64" />
    </div>
    <div className="mb-6 flex gap-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="skeleton h-9 w-24 rounded-full" />
      ))}
    </div>
    <div className="flex-1">
      <div className="card-surface rounded-[20px] p-8">
        <Skeleton className="skeleton h-7 w-32 mb-6" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="skeleton h-4 w-full mb-3" style={{ width: `${75 + Math.random() * 25}%` }} />
        ))}
      </div>
    </div>
  </div>
);

const TAB_ORDER = ['overview', 'summary', 'insights', 'chat', 'study', 'reviewer', 'citations', 'reports'];

const PaperDetailPage = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const prevTabRef = useRef('overview');

  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);

  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [translating, setTranslating] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!paperId) return;
    const fetchData = async () => {
      try {
        const p = await papersApi.getPaper(paperId);
        setPaper(p);
        setLoading(false);
        if (p.status === 'ready') {
          papersApi.getSummary(paperId).then(s => setSummary(s.summary)).catch(() => {});
          papersApi.getCitations(paperId).then(c => setCitations(c.citations)).catch(() => {});
        }
      } catch {
        toast.error('Failed to load paper details');
        navigate('/papers');
        setLoading(false);
      }
    };
    fetchData();
  }, [paperId, navigate]);

  useEffect(() => {
    if (paper?.status === 'processing' || paper?.status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const p = await papersApi.getPaper(paperId!);
          setPaper(p);
          if (p.status === 'ready') {
            papersApi.getSummary(paperId!).then(s => setSummary(s.summary)).catch(() => {});
            papersApi.getCitations(paperId!).then(c => setCitations(c.citations)).catch(() => {});
          }
        } catch { /* silent */ }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [paper?.status, paperId]);

  const handleGenerateReport = async (format: 'pdf' | 'docx') => {
    if (!paperId) return;
    try {
      setGeneratingReport(true);
      const blob = await reportsApi.generateReport(paperId, format);
      toast.success('Report generated!');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${paperId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  // ── Directional tab transition ───────────────────────────────────────────
  const handleTabChange = (id: string) => {
    prevTabRef.current = activeTab;
    setActiveTab(id);
  };

  const getDirection = (current: string, previous: string) => {
    const ci = TAB_ORDER.indexOf(current);
    const pi = TAB_ORDER.indexOf(previous);
    return ci > pi ? 1 : -1;
  };

  const direction = getDirection(activeTab, prevTabRef.current);

  const tabVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 32 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as any } },
    exit:  (dir: number) => ({ opacity: 0, x: dir * -32, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as any } }),
  };

  if (loading) return <PaperDetailSkeleton />;
  if (!paper) return null;

  const isReady = paper.status === 'ready';

  const tabOptions = [
    { id: 'overview',  label: 'Overview',    icon: <FileText size={15} /> },
    { id: 'summary',   label: 'AI Summary',  icon: <BookOpen size={15} /> },
    { id: 'insights',  label: 'Insights',    icon: <BarChart2 size={15} /> },
    { id: 'chat',      label: 'Ask AI',      icon: <MessageSquare size={15} /> },
    { id: 'study',     label: 'Study Mode',  icon: <Lightbulb size={15} /> },
    { id: 'reviewer',  label: 'Reviewer 2',  icon: <ShieldAlert size={15} /> },
    { id: 'citations', label: 'Citations',   icon: <FileOutput size={15} /> },
    { id: 'reports',   label: 'Reports',     icon: <Download size={15} /> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-7 shrink-0"
      >
        {/* Back link */}
        <button
          onClick={() => navigate('/papers')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-5 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          My Papers
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant={isReady ? 'success' : 'warning'}
            icon={isReady ? <CheckCircle size={13} /> : <Clock size={13} />}
          >
            {paper.status.toUpperCase()}
          </Badge>
          <span className="text-[var(--color-text-secondary)] text-sm">
            Uploaded {new Date(paper.upload_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2 leading-snug max-w-4xl line-clamp-3">
          {paper.title || paper.filename}
        </h1>
        <p className="text-[var(--color-text-secondary)] text-base max-w-3xl line-clamp-2">
          {paper.authors || 'Unknown Authors'}
        </p>
      </motion.div>

      {/* ── Tabs navigation ────────────────────────────────────────────────── */}
      <div className="mb-5 shrink-0 overflow-x-auto pb-1 -mx-2 px-2">
        <Tabs
          tabs={isReady ? tabOptions : tabOptions.filter(t => t.id === 'overview')}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* ── Tab content — directional slide ────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative overflow-hidden rounded-[20px]"
        >

          {/* Overview */}
          {activeTab === 'overview' && (
            <Card className="p-8 border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <FileText size={22} />
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                  Abstract
                </h3>
              </div>
              <div className="bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] rounded-[16px] p-6 shadow-inner">
                <p className="text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed text-[17px] max-w-4xl font-serif">
                  {paper.abstract
                    || (isReady ? 'No abstract extracted.'
                      : paper.status === 'failed' ? 'Processing failed. Please retry.'
                      : 'Paper is still processing. Abstract will appear here shortly.')}
                </p>
              </div>
            </Card>
          )}

          {/* AI Summary */}
          {activeTab === 'summary' && isReady && (
            <Card className="p-8 border-[var(--color-border)] glass">
              {summary ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 justify-end">
                    <select 
                      value={targetLanguage} 
                      onChange={e => setTargetLanguage(e.target.value)}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-sm text-[var(--color-text-primary)]"
                    >
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          setTranslating(true);
                          const res = await researchApi.translateText({ text: summary.summary, target_language: targetLanguage });
                          setTranslatedSummary(res.translated_text);
                        } catch (err) {
                          toast.error('Translation failed');
                        } finally {
                          setTranslating(false);
                        }
                      }}
                      isLoading={translating}
                    >
                      Translate
                    </Button>
                    {translatedSummary && (
                      <Button variant="ghost" size="sm" onClick={() => setTranslatedSummary(null)}>
                        Original
                      </Button>
                    )}
                  </div>
                  <div className="prose-custom max-w-none bg-[color-mix(in_srgb,var(--color-accent)_6%,var(--color-surface))] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] rounded-[16px] p-6 shadow-inner">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedSummary || summary.summary}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] gap-4">
                  <AlertTriangle size={40} className="opacity-40" />
                  <p className="text-base">Summary is being generated — check back in a moment.</p>
                </div>
              )}
            </Card>
          )}

          {/* Insights */}
          {activeTab === 'insights' && isReady && paperId && (
            <div>
              <InsightsTab paperId={paperId} />
            </div>
          )}

          {/* Ask AI */}
          {activeTab === 'chat' && isReady && paperId && (
            <div className="h-[600px] overflow-hidden border border-[var(--color-border)] rounded-[20px] shadow-sm">
              <ChatWindow paperId={paperId} />
            </div>
          )}

          {/* Study Mode */}
          {activeTab === 'study' && isReady && paperId && (
            <div>
              <StudyTab paperId={paperId} />
            </div>
          )}

          {/* Reviewer 2 Mode */}
          {activeTab === 'reviewer' && isReady && paperId && (
            <div>
              <ReviewerTab paperId={paperId} />
            </div>
          )}

          {/* Citations */}
          {activeTab === 'citations' && isReady && (
            <Card className="p-8 border-[var(--color-border)] glass">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <FileOutput size={22} />
                </div>
                <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                  Extracted Citations
                </h3>
                {citations.length > 0 && (
                  <Badge variant="primary" className="ml-auto">{citations.length} found</Badge>
                )}
              </div>

              {citations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {citations.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover-lift relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]" />
                      <div className="flex justify-between items-start mb-3 pl-3">
                        <Badge variant="primary">#{i + 1}</Badge>
                        {c.year && <span className="text-xs text-[var(--color-text-secondary)] font-semibold">{c.year}</span>}
                      </div>
                      {c.title && (
                        <h4 className="font-display font-bold text-base text-[var(--color-text-primary)] mb-1.5 leading-snug pl-3">
                          {c.title}
                        </h4>
                      )}
                      {c.author && (
                        <p className="text-[var(--color-text-secondary)] mb-3 text-sm pl-3">{c.author}</p>
                      )}
                      <div className="mt-auto bg-[var(--color-background-secondary)] rounded-xl p-3 pl-3">
                        <p className="text-[var(--color-text-secondary)] text-xs font-mono leading-relaxed line-clamp-3">
                          "{c.raw_text}"
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileOutput size={40} className="mx-auto mb-4 text-[var(--color-text-secondary)] opacity-30" />
                  <p className="text-[var(--color-text-secondary)]">No citations were extracted from this document.</p>
                </div>
              )}
            </Card>
          )}

          {/* Reports */}
          {activeTab === 'reports' && isReady && (
            <Card className="p-16 border-[var(--color-border)] flex flex-col items-center justify-center text-center">
              <div className="p-5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] mb-8">
                <FileOutput size={56} className="text-[var(--color-primary)]" />
              </div>
              <h3 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-3">
                Generate Comprehensive Report
              </h3>
              <p className="text-[var(--color-text-secondary)] text-lg mb-10 max-w-xl">
                Download a publication-ready report containing metadata, AI summary, citations, and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleGenerateReport('pdf')}
                  isLoading={generatingReport}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                >
                  Generate PDF Report
                </Button>
                <Button
                  onClick={() => handleGenerateReport('docx')}
                  isLoading={generatingReport}
                  size="lg"
                  variant="primary"
                >
                  Generate DOCX Report
                </Button>
              </div>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PaperDetailPage;
