import React, { useEffect, useState } from 'react'
import { FileText, MessageSquare, FileOutput, Activity } from 'lucide-react'
import { reportsApi, DashboardStats } from '../api/reports'
import { StatCard } from '../components/dashboard/StatCard'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { motion } from 'framer-motion'

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reportsApi.getDashboard()
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back. Here's what's happening with your research.</p>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Total Papers" 
          value={stats?.total_papers || 0} 
          icon={<FileText size={24} />} 
          trend="Processed & ready"
          delay={0.1}
        />
        <StatCard 
          title="Ready Papers" 
          value={stats?.ready_papers || 0} 
          icon={<Activity size={24} />} 
          delay={0.2}
        />
        <StatCard 
          title="Reports Generated" 
          value={stats?.total_reports || 0} 
          icon={<FileOutput size={24} />} 
          delay={0.3}
        />
        <StatCard 
          title="Q&A Interactions" 
          value={stats?.total_qa_interactions || 0} 
          icon={<MessageSquare size={24} />} 
          delay={0.4}
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Papers</h2>
        <Card>
          {stats?.recent_papers && stats.recent_papers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.recent_papers.map((paper) => (
                <div key={paper.paper_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-deep-void)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                      <FileText size={20} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 500 }}>{paper.title || 'Untitled Paper'}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(paper.upload_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 500,
                    background: paper.status === 'ready' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: paper.status === 'ready' ? 'var(--color-success)' : 'var(--color-warning)'
                  }}>
                    {paper.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No recent papers found.</p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default DashboardPage
