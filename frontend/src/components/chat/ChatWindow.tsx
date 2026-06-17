import React, { useEffect, useState, useRef } from 'react'
import { Send, User as UserIcon, Bot, Loader2 } from 'lucide-react'
import { chatApi, ChatMessage } from '../../api/chat'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  paperId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ paperId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatApi.getHistory(paperId)
        setMessages(res.history)
      } catch (error) {
        toast.error('Failed to load chat history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [paperId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const sections = ['All Sections', 'abstract', 'introduction', 'methodology', 'results', 'conclusion']
  const [selectedSection, setSelectedSection] = useState('All Sections')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const question = input.trim()
    setInput('')
    
    // Optimistic UI update
    const tempId = Date.now()
    setMessages(prev => [...prev, {
      id: tempId,
      paper_id: paperId,
      question: selectedSection !== 'All Sections' ? `[${selectedSection}] ${question}` : question,
      answer: '',
      timestamp: new Date().toISOString()
    }])
    
    setSending(true)

    try {
      let res;
      if (selectedSection === 'All Sections') {
        res = await chatApi.askQuestion({ paper_id: paperId, question })
      } else {
        res = await chatApi.askSectionQuestion({ paper_id: paperId, section: selectedSection, question })
      }
      
      // Update with real answer
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, answer: res.answer, id: Date.now() } // Replace temp with real
          : msg
      ))
    } catch (error: any) {
      toast.error('Failed to get answer')
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.length === 0 && !sending && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>
            <Bot size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Ask anything about this paper.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* User Question */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                style={{ alignSelf: 'flex-end', maxWidth: '80%', display: 'flex', gap: '1rem' }}
              >
                <div style={{ background: 'var(--accent-primary)', padding: '1rem', borderRadius: '1rem 1rem 0 1rem', color: '#fff' }}>
                  {msg.question}
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserIcon size={16} />
                </div>
              </motion.div>

              {/* AI Answer */}
              {msg.answer && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  style={{ alignSelf: 'flex-start', maxWidth: '80%', display: 'flex', gap: '1rem' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} />
                  </div>
                  <div style={{ background: 'var(--bg-deep-void)', padding: '1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.answer}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </AnimatePresence>

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', display: 'flex', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} />
            </div>
            <div style={{ background: 'var(--bg-deep-void)', padding: '1rem', borderRadius: '0 1rem 1rem 1rem', border: '1px solid var(--border-subtle)' }}>
              <Loader2 size={16} className="animate-spin text-muted" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-deep-void)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ 
              background: 'var(--bg-surface)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '0.25rem 0.5rem', 
              fontSize: '0.875rem' 
            }}
          >
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', position: 'relative' }}>
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the paper..."
            disabled={sending}
            style={{ paddingRight: '3rem', borderRadius: '2rem' }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || sending}
            style={{ 
              position: 'absolute', 
              right: '0.5rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
              color: input.trim() ? 'white' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: input.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={16} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>
    </div>
  )
}
