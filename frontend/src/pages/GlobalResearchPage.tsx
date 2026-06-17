import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { papersApi, Paper } from '../api/papers'
import { researchApi, AnalysisResponse, ComparisonResponse, GapsListResponse, LiteratureReviewResponse, CitationIntelligenceResponse } from '../api/research'
import { Search, MessageSquare, BarChart2, CheckSquare, Settings, FileText, Layers, Lightbulb, BookOpen, Quote, Sparkles, ChevronRight, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const GlobalResearchPage = () => {
  const [papers, setPapers] = useState<Paper[]>([])
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'analyze' | 'compare' | 'gaps' | 'literature' | 'citation'>('chat')
  
  const [actionLoading, setActionLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [chatResponse, setChatResponse] = useState<{ answer: string, sources: string[] } | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null)
  const [gaps, setGaps] = useState<GapsListResponse | null>(null)
  const [literatureReview, setLiteratureReview] = useState<LiteratureReviewResponse | null>(null)
  const [citationIntel, setCitationIntel] = useState<CitationIntelligenceResponse | null>(null)

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await papersApi.listPapers({ page_size: 50 })
        const readyPapers = response.papers.filter(p => p.status === 'ready')
        setPapers(readyPapers)
      } catch (err) {
        toast.error('Failed to load papers')
      } finally {
        setLoading(false)
      }
    }
    fetchPapers()
  }, [])

  const handleSelectPaper = (id: string) => {
    if (selectedPaperIds.includes(id)) {
      setSelectedPaperIds(selectedPaperIds.filter(pid => pid !== id))
    } else {
      setSelectedPaperIds([...selectedPaperIds, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedPaperIds.length === papers.length) {
      setSelectedPaperIds([])
    } else {
      setSelectedPaperIds(papers.map(p => p.paper_id))
    }
  }

  // Handlers for all actions...
  const handleGlobalChat = async () => {
    if (selectedPaperIds.length === 0) return toast.error('Select at least one paper')
    if (!question.trim()) return toast.error('Enter a question')
    
    setActionLoading(true)
    try {
      const res = await researchApi.globalChat({ paper_ids: selectedPaperIds, question })
      setChatResponse(res)
    } catch (err) {
      toast.error('Failed to get answer')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (selectedPaperIds.length < 2) return toast.error('Select at least two papers')
    setActionLoading(true)
    try {
      const res = await researchApi.analyze({ paper_ids: selectedPaperIds })
      setAnalysis(res)
    } catch (err) {
      toast.error('Failed to analyze papers')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompare = async () => {
    if (selectedPaperIds.length < 2) return toast.error('Select at least two papers')
    setActionLoading(true)
    try {
      const res = await researchApi.compare({ paper_ids: selectedPaperIds })
      setComparison(res)
    } catch (err) {
      toast.error('Failed to compare papers')
    } finally {
      setActionLoading(false)
    }
  }

  const handleGaps = async () => {
    if (selectedPaperIds.length < 2) return toast.error('Select at least two papers')
    setActionLoading(true)
    try {
      const res = await researchApi.detectGaps({ paper_ids: selectedPaperIds })
      setGaps(res)
    } catch (err) {
      toast.error('Failed to detect gaps')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLiterature = async () => {
    if (selectedPaperIds.length < 2) return toast.error('Select at least two papers')
    setActionLoading(true)
    try {
      const res = await researchApi.generateLiteratureReview({ paper_ids: selectedPaperIds })
      setLiteratureReview(res)
    } catch (err) {
      toast.error('Failed to generate literature review')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCitationIntel = async () => {
    setActionLoading(true)
    try {
      const res = await researchApi.getCitationIntelligence()
      setCitationIntel(res)
    } catch (err) {
      toast.error('Failed to load citation intelligence')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spinner size="lg" /></div>

  const tabs = [
    { id: 'chat', label: 'Global Chat', icon: <MessageSquare size={16} />, gradient: 'linear-gradient(135deg, #6366f1, #a855f7)' },
    { id: 'analyze', label: 'Analysis', icon: <BarChart2 size={16} />, gradient: 'linear-gradient(135deg, #3b82f6, #2dd4bf)' },
    { id: 'compare', label: 'Compare', icon: <Layers size={16} />, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
    { id: 'gaps', label: 'Gaps', icon: <Lightbulb size={16} />, gradient: 'linear-gradient(135deg, #10b981, #3b82f6)' },
    { id: 'literature', label: 'Lit Review', icon: <BookOpen size={16} />, gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
    { id: 'citation', label: 'Citation Intel', icon: <Quote size={16} />, gradient: 'linear-gradient(135deg, #f43f5e, #f97316)' },
  ]

  return (
    <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Decorative background gradients */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, filter: 'blur(60px)' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, filter: 'blur(60px)' }} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles className="text-accent-primary" /> Global Research Intelligence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Analyze, compare, and query across your entire library of uploaded papers simultaneously.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Left Sidebar: Paper Selection */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Library <span style={{ padding: '0.2rem 0.6rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: '9999px', fontSize: '0.8rem' }}>{papers.length}</span>
              </h3>
            </div>
            
            <div style={{ padding: '1rem' }}>
              <Button variant="secondary" size="sm" onClick={handleSelectAll} style={{ width: '100%', marginBottom: '1rem', background: 'var(--bg-surface-solid)' }}>
                {selectedPaperIds.length === papers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {papers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <Layers size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No processed papers available.</p>
                </div>
              ) : (
                papers.map(p => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={p.paper_id} 
                    onClick={() => handleSelectPaper(p.paper_id)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-md)', 
                      background: selectedPaperIds.includes(p.paper_id) ? 'var(--accent-glow)' : 'var(--bg-surface-solid)',
                      border: selectedPaperIds.includes(p.paper_id) ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ color: selectedPaperIds.includes(p.paper_id) ? 'var(--accent-primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedPaperIds.includes(p.paper_id) ? <CheckSquare size={18} /> : <div style={{ width: 18, height: 18, border: '2px solid var(--text-muted)', borderRadius: 4 }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4, color: selectedPaperIds.includes(p.paper_id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {p.title || p.filename}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Content Area */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          
          {/* Beautiful Tab Navigation */}
          <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    position: 'relative',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s',
                    zIndex: 1
                  }}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: tab.gradient,
                        borderRadius: 'var(--radius-md)',
                        zIndex: -1,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  {tab.icon} {tab.label}
                </button>
              )
            })}
          </div>

          <div className="glass-panel" style={{ flex: 1, padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient tab glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: tabs.find(t => t.id === activeTab)?.gradient, opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Global Chat */}
            {activeTab === 'chat' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', color: '#6366f1' }}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Multi-Paper Chat</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Ask a question against all selected papers. The AI will synthesize an answer.</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      style={{ 
                        width: '100%', 
                        padding: '1.25rem 1.5rem', 
                        paddingRight: '4rem',
                        borderRadius: 'var(--radius-lg)', 
                        background: 'var(--bg-surface-solid)', 
                        border: '1px solid var(--border-focus)',
                        color: 'var(--text-primary)',
                        fontSize: '1.1rem',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g. Compare the methodologies used in these papers..."
                      onKeyDown={(e) => e.key === 'Enter' && handleGlobalChat()}
                    />
                    <button 
                      onClick={handleGlobalChat} 
                      disabled={selectedPaperIds.length === 0 || actionLoading}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: selectedPaperIds.length === 0 ? 0.5 : 1,
                        cursor: selectedPaperIds.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {actionLoading ? <Spinner size="sm" /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                </div>

                {chatResponse && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="markdown-body" style={{ padding: '2rem', background: 'var(--bg-surface-solid)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-panel)' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{chatResponse.answer}</ReactMarkdown>
                    </div>
                    {chatResponse.sources && chatResponse.sources.length > 0 && (
                      <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Quote size={14} /> EXTRACTED SOURCES
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {chatResponse.sources.map((src, i) => (
                            <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-primary)' }}>
                              {src}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Analysis */}
            {activeTab === 'analyze' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', color: '#3b82f6' }}>
                      <BarChart2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Multi-Paper Analysis</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Extract common models, datasets, and trends.</p>
                    </div>
                  </div>
                  <Button onClick={handleAnalyze} isLoading={actionLoading} disabled={selectedPaperIds.length < 2} size="lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #2dd4bf)' }}>
                    Analyze {selectedPaperIds.length} Papers
                  </Button>
                </div>

                {analysis && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ background: 'var(--bg-surface-solid)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} /> Common Models</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {analysis.common_models.map((m, i) => (
                            <span key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 500, border: '1px solid rgba(59, 130, 246, 0.2)' }}>{m}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-surface-solid)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ fontWeight: 600, color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Common Datasets</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {analysis.common_datasets.map((d, i) => (
                            <span key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 500, border: '1px solid rgba(16, 185, 129, 0.2)' }}>{d}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-surface-solid)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '1rem', fontSize: '1.1rem' }}>Key Research Trends</h4>
                      <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {analysis.research_trends.map((t, i) => <li key={i} style={{ marginBottom: '0.75rem' }}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Compare */}
            {activeTab === 'compare' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', color: '#f59e0b' }}>
                      <Layers size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Comparison Engine</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Generate a side-by-side technical comparison matrix.</p>
                    </div>
                  </div>
                  <Button onClick={handleCompare} isLoading={actionLoading} disabled={selectedPaperIds.length < 2} size="lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                    Compare {selectedPaperIds.length} Papers
                  </Button>
                </div>

                {comparison && (
                  <div style={{ overflowX: 'auto', background: 'var(--bg-surface-solid)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ padding: '1.25rem', borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>Feature</th>
                          {comparison.papers.map((p, i) => (
                            <th key={i} style={{ padding: '1.25rem', borderBottom: '2px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>{p.substring(0, 15)}...</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {['dataset', 'model', 'accuracy', 'methodology', 'limitations'].map((feature) => (
                          <motion.tr key={feature} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                              {feature}
                            </td>
                            {comparison.papers.map((p, i) => (
                              <td key={i} style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                {comparison.comparison[feature as keyof typeof comparison.comparison]?.[p] || '-'}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* Gaps */}
            {activeTab === 'gaps' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                      <Lightbulb size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Gap Detection</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Identify unexplored research opportunities.</p>
                    </div>
                  </div>
                  <Button onClick={handleGaps} isLoading={actionLoading} disabled={selectedPaperIds.length < 2} size="lg" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                    Detect Gaps
                  </Button>
                </div>

                {gaps && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {gaps.gaps.map((g, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} 
                        style={{ padding: '1.5rem', background: 'var(--bg-surface-solid)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #10b981' }}
                      >
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Lightbulb size={18} className="text-success" />
                          {g.gap}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{g.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Lit Review */}
            {activeTab === 'literature' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: 'var(--radius-md)', color: '#8b5cf6' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Literature Review</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Generate a cohesive review from selected papers.</p>
                    </div>
                  </div>
                  <Button onClick={handleLiterature} isLoading={actionLoading} disabled={selectedPaperIds.length < 2} size="lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                    Generate Review
                  </Button>
                </div>

                {literatureReview && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem', background: 'var(--bg-surface-solid)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                    {[
                      { title: 'Introduction', content: literatureReview.introduction },
                      { title: 'Existing Methods', content: literatureReview.existing_methods },
                      { title: 'Challenges', content: literatureReview.challenges },
                      { title: 'Future Directions', content: literatureReview.future_directions },
                      { title: 'Conclusion', content: literatureReview.conclusion },
                    ].map((section, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                          {section.title}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>{section.content}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Citation Intel */}
            {activeTab === 'citation' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-md)', color: '#f43f5e' }}>
                      <Quote size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Citation Intelligence</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Discover the most influential entities across your library.</p>
                    </div>
                  </div>
                  <Button onClick={handleCitationIntel} isLoading={actionLoading} size="lg" style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)' }}>
                    Run Intelligence
                  </Button>
                </div>
                
                {citationIntel && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'var(--bg-surface-solid)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-panel)' }}>
                      <h4 style={{ fontWeight: 700, color: '#10b981', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}><FileText size={20} /></div> Top Papers
                      </h4>
                      <ol style={{ paddingLeft: '1.5rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {citationIntel.top_papers.map((p, i) => <li key={i} style={{ marginBottom: '0.75rem' }}>{p}</li>)}
                      </ol>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'var(--bg-surface-solid)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-panel)' }}>
                      <h4 style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}><Settings size={20} /></div> Top Models
                      </h4>
                      <ol style={{ paddingLeft: '1.5rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {citationIntel.top_models.map((m, i) => <li key={i} style={{ marginBottom: '0.75rem' }}>{m}</li>)}
                      </ol>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'var(--bg-surface-solid)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-panel)' }}>
                      <h4 style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '8px' }}><BarChart2 size={20} /></div> Top Datasets
                      </h4>
                      <ol style={{ paddingLeft: '1.5rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {citationIntel.top_datasets.map((d, i) => <li key={i} style={{ marginBottom: '0.75rem' }}>{d}</li>)}
                      </ol>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GlobalResearchPage
