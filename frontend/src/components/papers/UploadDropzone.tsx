import React, { useCallback, useState } from 'react'
import { UploadCloud, Type } from 'lucide-react'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadDropzoneProps {
  onUpload?: (file: File) => Promise<void>;
  onUploadText?: (title: string, content: string) => Promise<void>;
  onUploadUrl?: (url: string) => Promise<void>;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUpload, onUploadText, onUploadUrl }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'link'>('file')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [textTitle, setTextTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [urlInput, setUrlInput] = useState('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onUpload) {
      const file = e.dataTransfer.files[0]
      await processFile(file)
    }
  }, [onUpload])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onUpload) {
      await processFile(e.target.files[0])
    }
  }

  const processFile = async (file: File) => {
    if (!onUpload) return;
    try {
      setIsUploading(true)
      await onUpload(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!onUploadText || !textTitle.trim() || !textContent.trim()) return;
    try {
      setIsUploading(true)
      await onUploadText(textTitle, textContent)
      setTextTitle('')
      setTextContent('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!onUploadUrl || !urlInput.trim()) return;
    try {
      setIsUploading(true)
      await onUploadUrl(urlInput.trim())
      setUrlInput('')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card 
      style={{
        background: 'var(--bg-surface)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('file')}
          style={{
            flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: activeTab === 'file' ? 'var(--accent-glow)' : 'transparent',
            borderBottom: activeTab === 'file' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'file' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600, transition: 'all 0.2s'
          }}
        >
          <UploadCloud size={18} /> Upload File
        </button>
        <button
          onClick={() => setActiveTab('text')}
          style={{
            flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: activeTab === 'text' ? 'var(--accent-glow)' : 'transparent',
            borderBottom: activeTab === 'text' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600, transition: 'all 0.2s'
          }}
        >
          <Type size={18} /> Paste Text
        </button>
        <button
          onClick={() => setActiveTab('link')}
          style={{
            flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: activeTab === 'link' ? 'var(--accent-glow)' : 'transparent',
            borderBottom: activeTab === 'link' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'link' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600, transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Web Link
        </button>
      </div>

      <div style={{ padding: '2rem' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'file' ? (
            <motion.div
              key="file-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-subtle)',
                background: isDragging ? 'var(--accent-glow)' : 'transparent',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
                style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface-hover)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-primary)'
                }}>
                  {isUploading ? <Spinner size="lg" /> : <UploadCloud size={32} />}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {isUploading ? 'Uploading...' : 'Click or drag file to upload'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Supports PDF, DOCX, TXT, CSV (Max 50MB)
                </p>
              </motion.div>

              <input
                type="file"
                accept=".pdf,.txt,.md,.csv,.docx"
                onChange={handleFileInput}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  opacity: 0, cursor: 'pointer', zIndex: 20, display: isDragging ? 'none' : 'block'
                }}
                disabled={isUploading}
              />
            </motion.div>
          ) : activeTab === 'text' ? (
            <motion.div
              key="text-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Document Title</label>
                <Input 
                  placeholder="e.g., Summary of meeting notes" 
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Paste Content Here</label>
                <textarea 
                  placeholder="Paste your raw text here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isUploading}
                  style={{
                    width: '100%', minHeight: '200px', padding: '1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)', resize: 'vertical', fontSize: '1rem', outline: 'none'
                  }}
                />
              </div>
              <Button 
                onClick={handleTextSubmit} 
                disabled={isUploading || !textTitle.trim() || !textContent.trim()}
                style={{ alignSelf: 'flex-end' }}
              >
                {isUploading ? <><Spinner size="sm" /> Processing...</> : 'Process Text'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="link-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Paste Web Link / URL</label>
                <Input 
                  placeholder="https://example.com/article" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isUploading}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  The research assistant will automatically download and extract the main article text from the webpage.
                </p>
              </div>
              <Button 
                onClick={handleUrlSubmit} 
                disabled={isUploading || !urlInput.trim()}
                style={{ alignSelf: 'flex-end', marginTop: '1rem' }}
              >
                {isUploading ? <><Spinner size="sm" /> Processing...</> : 'Fetch Webpage'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
