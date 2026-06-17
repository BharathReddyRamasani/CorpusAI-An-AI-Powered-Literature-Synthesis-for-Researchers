import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { papersApi, Paper } from '../api/papers'
import { UploadDropzone } from '../components/papers/UploadDropzone'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { TiltCard } from '../components/ui/TiltCard'
import { Spinner } from '../components/ui/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

const PapersPage = () => {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const fetchPapers = async () => {
    try {
      const res = await papersApi.listPapers({ search })
      setPapers(res.papers)
    } catch (error) {
      toast.error('Failed to load papers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPapers()
  }, [search])

  // Poll for updates if any paper is in 'processing' status
  useEffect(() => {
    const hasProcessing = papers.some(p => p.status === 'processing' || p.status === 'pending')
    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchPapers()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [papers])

  const handleUpload = async (file: File) => {
    try {
      await papersApi.uploadPaper(file)
      toast.success('Paper uploaded! Processing started.')
      setShowUpload(false)
      fetchPapers() // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload paper')
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ready': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)' }
      case 'processing': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' }
      case 'failed': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-error)' }
      default: return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-warning)' }
    }
  }

  return (
    <div className="page-container relative z-10">
      {/* Decorative ambient background */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 60%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }} className="text-glow">My Papers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage and interact with your uploaded research papers.</p>
        </motion.div>
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Button onClick={() => setShowUpload(!showUpload)} size="lg" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-violet))', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            Upload PDF
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            style={{ overflow: 'hidden', marginBottom: '2rem' }}
          >
            <div style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.5))', borderRadius: 'calc(var(--radius-xl) + 2px)' }}>
              <UploadDropzone onUpload={handleUpload} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ marginBottom: '2.5rem', maxWidth: '400px', position: 'relative' }}
      >
        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} />
        <Input 
          placeholder="Search by title or author..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '3rem', paddingRight: '1rem', height: '3rem', fontSize: '1.05rem', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
        />
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', padding: '6rem', justifyContent: 'center' }}>
          <Spinner size="lg" />
        </div>
      ) : papers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
        >
          <Card style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.div 
              className="animate-float"
              style={{ display: 'inline-flex', padding: '2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: '30%', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 2px 10px rgba(255,255,255,0.1)' }}
            >
              <FileText size={64} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.5))' }} />
            </motion.div>
            <h3 className="text-glow" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>No papers found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
              {search ? "We couldn't find any papers matching your search criteria. Try adjusting your filters." : "You haven't uploaded any research papers yet. Get started by uploading your first PDF."}
            </p>
          </Card>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {papers.map((paper, i) => {
            const colors = getStatusColor(paper.status)
            return (
              <motion.div
                key={paper.paper_id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5 }}
              >
                <TiltCard 
                  onClick={() => navigate(`/papers/${paper.paper_id}`)}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <span style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      background: colors.bg,
                      color: colors.text,
                      boxShadow: `0 0 10px ${colors.bg}`
                    }}>
                      {paper.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(paper.upload_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {paper.title || paper.filename}
                  </h3>
                  
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {paper.authors || 'Unknown Authors'}
                  </p>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Button variant="ghost" size="sm" style={{ padding: 0, color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Explore Analysis &rarr;
                    </Button>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PapersPage
