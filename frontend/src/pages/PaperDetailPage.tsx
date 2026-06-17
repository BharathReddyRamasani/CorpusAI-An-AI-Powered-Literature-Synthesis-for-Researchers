import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FileText, Download, MessageSquare, BookOpen, Clock, 
  CheckCircle, AlertTriangle, FileOutput, BarChart2, Lightbulb
} from 'lucide-react'
import { papersApi, PaperDetail, Summary, Citation } from '../api/papers'
import { reportsApi } from '../api/reports'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { ChatWindow } from '../components/chat/ChatWindow'
import { InsightsTab } from '../components/papers/InsightsTab'
import { StudyTab } from '../components/papers/StudyTab'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const PaperDetailPage = () => {
  const { paperId } = useParams<{ paperId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'insights' | 'chat' | 'study' | 'citations' | 'reports'>('overview')
  
  const [paper, setPaper] = useState<PaperDetail | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    if (!paperId) return
    const fetchData = async () => {
      try {
        const p = await papersApi.getPaper(paperId)
        setPaper(p)
        
        if (p.status === 'ready') {
          try {
            const s = await papersApi.getSummary(paperId)
            setSummary(s.summary)
          } catch (e) { /* Summary might not exist yet */ }
          
          try {
            const c = await papersApi.getCitations(paperId)
            setCitations(c.citations)
          } catch (e) { /* Citations might not exist */ }
        }
      } catch (error) {
        toast.error('Failed to load paper details')
        navigate('/papers')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [paperId, navigate])

  // Poll for updates if the paper is in 'processing' status
  useEffect(() => {
    if (paper?.status === 'processing' || paper?.status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const p = await papersApi.getPaper(paperId!)
          setPaper(p)
          
          if (p.status === 'ready') {
            // Once ready, fetch summary and citations
            try {
              const s = await papersApi.getSummary(paperId!)
              setSummary(s.summary)
            } catch (e) { /* Summary might not exist yet */ }
            
            try {
              const c = await papersApi.getCitations(paperId!)
              setCitations(c.citations)
            } catch (e) { /* Citations might not exist */ }
          }
        } catch (error) {
          // Silent fail on poll
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [paper?.status, paperId])

  const handleGenerateReport = async (format: 'pdf' | 'docx') => {
    if (!paperId) return
    try {
      setGeneratingReport(true)
      const blob = await reportsApi.generateReport(paperId, format)
      toast.success('Report generated successfully!')
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${paperId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Spinner size="lg" /></div>
  }

  if (!paper) return null

  const isReady = paper.status === 'ready'

  return (
    <div className="page-container relative z-10" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Decorative ambient background */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <span style={{ 
            padding: '0.35rem 0.85rem', 
            borderRadius: '9999px', 
            fontSize: '0.8rem', 
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: isReady ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isReady ? 'var(--color-success)' : 'var(--color-warning)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: isReady ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 0 15px rgba(245, 158, 11, 0.2)'
          }}>
            {isReady ? <CheckCircle size={16} /> : <Clock size={16} />}
            {paper.status.toUpperCase()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Uploaded {new Date(paper.upload_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h1 className="text-glow" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{paper.title || paper.filename}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>{paper.authors}</p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem', gap: '0.5rem' }}>
        {[
          { id: 'overview', label: 'Overview', icon: <FileText size={18} /> },
          { id: 'summary', label: 'AI Summary', icon: <BookOpen size={18} /> },
          { id: 'insights', label: 'Insights & Visuals', icon: <BarChart2 size={18} /> },
          { id: 'chat', label: 'Ask Paper (RAG)', icon: <MessageSquare size={18} /> },
          { id: 'study', label: 'Study Mode', icon: <Lightbulb size={18} /> },
          { id: 'citations', label: 'Citations', icon: <FileOutput size={18} /> },
          { id: 'reports', label: 'Reports', icon: <Download size={18} /> },
        ].map(tab => {
          const isActive = activeTab === tab.id
          const isDisabled = !isReady && tab.id !== 'overview'
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={isDisabled}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                color: isActive ? '#fff' : isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                fontWeight: isActive ? 600 : 500,
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute', bottom: -9, left: 0, right: 0, height: 3, 
                    background: 'var(--accent-primary)', borderRadius: '3px 3px 0 0',
                    boxShadow: '0 -2px 10px rgba(99,102,241,0.5)'
                  }}
                  transition={{ duration: 0.2 }}
                />
              )}
              {tab.icon} {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ flex: 1, minHeight: 0 }}
        >
          {activeTab === 'overview' && (
            <Card style={{ padding: '3rem', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={24} color="var(--accent-primary)" />
                </div>
                Abstract
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                {paper.abstract || (isReady ? "No abstract extracted." : "Paper is still processing. Abstract will appear here.")}
              </p>
            </Card>
          )}

          {activeTab === 'summary' && isReady && (
            <Card style={{ padding: '3rem', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {summary ? (
                <div className="markdown-body" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary.summary}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <AlertTriangle size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.2rem' }}>Summary is being generated or failed to generate.</p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'insights' && isReady && paperId && (
            <InsightsTab paperId={paperId} />
          )}

          {activeTab === 'chat' && isReady && paperId && (
            <div style={{ height: 'calc(100vh - 350px)', minHeight: '500px' }}>
              <ChatWindow paperId={paperId} />
            </div>
          )}

          {activeTab === 'study' && isReady && paperId && (
            <StudyTab paperId={paperId} />
          )}

          {activeTab === 'citations' && isReady && (
            <Card style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {citations.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {citations.map((c, i) => (
                    <motion.li 
                      key={c.id} 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1.25rem' }}
                    >
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.25rem' }}>[{i + 1}]</span>
                      <div>
                        {c.title && <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{c.title}</h4>}
                        {c.author && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>{c.author} {c.year ? <span style={{ color: 'var(--accent-violet)' }}>({c.year})</span> : ''}</p>}
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>{c.raw_text}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No citations extracted.</p>
              )}
            </Card>
          )}

          {activeTab === 'reports' && isReady && (
            <Card style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <motion.div className="animate-float" style={{ display: 'inline-flex', padding: '2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: '50%', marginBottom: '2rem' }}>
                  <FileOutput size={64} color="var(--accent-primary)" />
                </motion.div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }} className="text-glow">Generate Comprehensive Report</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                  Generate a downloadable, publication-ready report containing the paper's metadata, AI summary, extracted citations, and insights.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                  <Button 
                    onClick={() => handleGenerateReport('pdf')} 
                    isLoading={generatingReport}
                    size="lg"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                  >
                    Generate PDF Report
                  </Button>
                  <Button 
                    onClick={() => handleGenerateReport('docx')} 
                    isLoading={generatingReport}
                    size="lg"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                  >
                    Generate DOCX Report
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default PaperDetailPage
