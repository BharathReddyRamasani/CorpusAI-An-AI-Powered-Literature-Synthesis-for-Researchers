import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, MessageSquare, FileOutput, Activity, Inbox, Search, TrendingUp, ArrowRight, Sparkles, Share } from 'lucide-react'
import { reportsApi, DashboardStats } from '../api/reports'
import { researchApi } from '../api/research'
import { StatCard } from '../components/dashboard/StatCard'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// ── Skeleton layout mirrors the real layout so there's no jarring shift ──────
const DashboardSkeleton = () => (
  <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
    {/* Header */}
    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <Skeleton className="skeleton h-9 w-40 mb-2" />
        <Skeleton className="skeleton h-5 w-72" />
      </div>
      <Skeleton className="skeleton h-10 w-44" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card-surface rounded-[20px] p-6">
          <div className="flex justify-between mb-4">
            <Skeleton className="skeleton h-4 w-20" />
            <Skeleton className="skeleton h-9 w-9 rounded-[12px]" />
          </div>
          <Skeleton className="skeleton h-10 w-16" />
        </div>
      ))}
    </div>

    {/* Body grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card-surface rounded-[20px] overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--color-border)] last:border-0">
            <Skeleton className="skeleton h-11 w-11 rounded-[12px] flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="skeleton h-4 w-3/4 mb-2" />
              <Skeleton className="skeleton h-3 w-1/3" />
            </div>
            <Skeleton className="skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="card-surface rounded-[20px] p-4 flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="skeleton h-10 w-full rounded-[14px]" />)}
        </div>
      </div>
    </div>
  </div>
)

// ── Stagger animation variants ────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const up = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    reportsApi.getDashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <motion.div variants={up}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-1">
            Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Welcome back. Here's what's happening with your research.
          </p>
        </motion.div>
        <motion.div variants={up} className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="md" 
            onClick={async () => {
              if (!stats) return;
              try {
                setPublishing(true);
                const res = await researchApi.shareDashboard({ snapshot_data: stats });
                const url = `${window.location.origin}/share/${res.share_id}`;
                await navigator.clipboard.writeText(url);
                toast.success('Dashboard published! Link copied to clipboard.');
              } catch (err) {
                toast.error('Failed to publish dashboard');
              } finally {
                setPublishing(false);
              }
            }} 
            className="group"
            isLoading={publishing}
          >
            <Share size={16} className="mr-2" />
            Publish
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate('/papers')} className="group">
            <Sparkles size={16} className="mr-2" />
            New Paper
            <ArrowRight size={15} className="ml-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Stat cards — 4-col uniform grid (data doesn't warrant asymmetry here) ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        <motion.div variants={up}>
          <StatCard
            title="Total Papers"
            value={stats?.total_papers || 0}
            icon={<FileText size={20} />}
            trend="Processed & ready"
            delay={0}
            accent="var(--color-primary)"
          />
        </motion.div>
        <motion.div variants={up}>
          <StatCard
            title="Ready Papers"
            value={stats?.ready_papers || 0}
            icon={<Activity size={20} />}
            delay={0}
            accent="var(--color-accent)"
          />
        </motion.div>
        <motion.div variants={up}>
          <StatCard
            title="Reports"
            value={stats?.total_reports || 0}
            icon={<FileOutput size={20} />}
            delay={0}
            accent="var(--color-secondary)"
          />
        </motion.div>
        <motion.div variants={up}>
          <StatCard
            title="Q&A Interactions"
            value={stats?.total_qa_interactions || 0}
            icon={<MessageSquare size={20} />}
            delay={0}
            accent="var(--color-primary)"
          />
        </motion.div>
      </motion.div>

      {/* ── Main content — intentional asymmetry: 2/3 activity + 1/3 quick actions ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Activity — wider, more important */}
        <motion.div variants={up} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/papers')} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              View all →
            </Button>
          </div>

          <Card className="p-0 overflow-hidden hover-lift">
            {stats?.recent_papers && stats.recent_papers.length > 0 ? (
              <div className="divide-y divide-[var(--color-border)]">
                {stats.recent_papers.map((paper, i) => (
                  <motion.div
                    key={paper.paper_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate(`/papers/${paper.paper_id}`)}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-[var(--color-background-secondary)] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2.5 bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] rounded-[12px] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[var(--color-text-primary)] mb-0.5 truncate max-w-[260px] sm:max-w-sm text-sm group-hover:text-[var(--color-primary)] transition-colors">
                          {paper.title || 'Untitled Paper'}
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {new Date(paper.upload_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={paper.status === 'ready' ? 'success' : 'warning'}>
                        {paper.status === 'ready' ? 'Ready' : 'Processing'}
                      </Badge>
                      <ArrowRight size={14} className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Inbox size={32} />}
                title="No papers yet"
                description="Upload your first research paper to get started."
                actionLabel="Upload Paper"
                onAction={() => navigate('/papers')}
              />
            )}
          </Card>
        </motion.div>

        {/* Right column — Quick Actions + Trends */}
        <motion.div variants={up} className="lg:col-span-1 flex flex-col gap-6">

          {/* Quick Actions */}
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)] mb-5">
              Quick Actions
            </h2>
            <Card className="flex flex-col gap-2 p-3">
              {[
                { icon: <Search size={16} />, label: 'Explore Global Research', path: '/global-research', accent: 'var(--color-primary)' },
                { icon: <FileOutput size={16} />, label: 'Generate Meta-Analysis', path: '/global-research', accent: 'var(--color-secondary)' },
                { icon: <MessageSquare size={16} />, label: 'Ask AI Assistant', path: '/papers', accent: 'var(--color-accent)' },
              ].map(({ icon, label, path, accent }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-3 p-3 rounded-[14px] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200 group text-left"
                >
                  <span
                    className="p-1.5 rounded-[8px] transition-colors"
                    style={{
                      background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                      color: accent,
                    }}
                  >
                    {icon}
                  </span>
                  {label}
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              ))}
            </Card>
          </div>

          {/* Research Trends */}
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)] mb-5">
              Research Trends
            </h2>
            <Card className="p-0 overflow-hidden">
              {[
                { tag: 'Machine Learning', growth: '+24%', count: '124 papers' },
                { tag: 'RAG Systems',      growth: '+18%', count: '89 papers'  },
                { tag: 'Biomedical',       growth: '+12%', count: '56 papers'  },
                { tag: 'Transformers',     growth: '+8%',  count: '42 papers'  },
              ].map((trend, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background-secondary)] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text-primary)]">{trend.tag}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{trend.count}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-accent)] flex items-center gap-1">
                    <TrendingUp size={11} /> {trend.growth}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default DashboardPage
