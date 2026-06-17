import React, { useCallback, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { motion } from 'framer-motion'

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        await processFile(file)
      } else {
        alert('Only PDF files are supported.')
      }
    }
  }, [onUpload])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0])
    }
  }

  const processFile = async (file: File) => {
    try {
      setIsUploading(true)
      await onUpload(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card 
      style={{
        border: isDragging ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-subtle)',
        background: isDragging ? 'var(--accent-glow)' : 'transparent',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10
        }}
      />
      
      <motion.div
        animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ 
          width: '64px', height: '64px', 
          borderRadius: '50%', 
          background: 'var(--bg-surface-hover)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--accent-primary)'
        }}>
          {isUploading ? <Spinner size="lg" /> : <UploadCloud size={32} />}
        </div>
      </motion.div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', pointerEvents: 'none' }}>
        {isUploading ? 'Uploading...' : 'Click or drag PDF to upload'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', pointerEvents: 'none' }}>
        Maximum file size 50MB
      </p>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0,
          cursor: 'pointer',
          zIndex: 20,
          display: isDragging ? 'none' : 'block' // hide during drag to allow drop event
        }}
      />
    </Card>
  )
}
