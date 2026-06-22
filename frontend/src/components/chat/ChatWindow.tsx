import React, { useEffect, useState, useRef } from 'react'
import { Send, User as UserIcon, Bot, Loader2, Sparkles, StopCircle, Mic, Volume2 } from 'lucide-react'
import { chatApi, ChatMessage } from '../../api/chat'
import { researchApi } from '../../api/research'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { cn } from '../../lib/cn'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { MermaidRenderer } from '../ui/MermaidRenderer'

const ChartRenderer = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '')
  if (!inline && match && match[1] === 'json-chart') {
    try {
      const data = JSON.parse(String(children).replace(/\n$/, ''))
      return (
        <div className="w-full h-64 my-6 bg-[var(--color-surface)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] rounded-[16px] p-4 shadow-sm shadow-[var(--color-primary)]/5">
          {data.title && <h4 className="text-center font-bold text-sm mb-4 text-[var(--color-text-primary)]">{data.title}</h4>}
          <div className="w-full h-[calc(100%-2rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-secondary)', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-secondary)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'var(--color-background-secondary)'}}
                  contentStyle={{backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)'}}
                  itemStyle={{color: 'var(--color-text-primary)', fontWeight: 'bold'}}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]}>
                  {data.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    } catch (e) {
      return <code className={className} {...props}>{children}</code>
    }
  }
  if (!inline && match && match[1] === 'mermaid') {
    return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />
  }
  return <code className={className} {...props}>{children}</code>
}

interface ChatWindowProps {
  paperId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ paperId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Voice JARVIS
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [usedMic, setUsedMic] = useState(false)
  
  // Live Web Search
  const [useWebSearch, setUseWebSearch] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInput(transcript)
      }
      
      recognitionRef.current.onend = () => setIsListening(false)
    }
    
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return toast.error("Browser doesn't support speech recognition.")
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setInput('')
      setUsedMic(true)
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const speak = (text: string) => {
    if (!synthRef.current) return
    synthRef.current.cancel() // Stop previous speaking
    
    // Strip markdown formatting, code blocks, bullet points, and citations for speech
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.')
                          .replace(/\[.*?\]/g, '') // Remove inline citations like [1]
                          .replace(/<[^>]*>?/gm, '') // Remove HTML tags
                          .replace(/[-=_*~#<>|\\+{}`]/g, ' ') // Replace markdown/formatting symbols with space
                          .replace(/\n+/g, '. ') // Replace newlines with periods for natural pauses
                          .replace(/\s{2,}/g, ' ') // Collapse multiple spaces into one
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    // Pick a good assistant voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find((v: any) => v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Female'))
    if (preferredVoice) utterance.voice = preferredVoice
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

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

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

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
      if (useWebSearch) {
        res = await researchApi.webSearch({ question, paper_id: paperId })
      } else {
        if (selectedSection === 'All Sections') {
          res = await chatApi.askQuestion({ paper_id: paperId, question })
        } else {
          res = await chatApi.askSectionQuestion({ paper_id: paperId, section: selectedSection, question })
        }
      }
      
      // Update with real answer
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, answer: res.answer, id: Date.now() } // Replace temp with real
          : msg
      ))

      // Auto-read if microphone was used
      if (usedMic) {
        speak(res.answer)
        setUsedMic(false)
      }

    } catch (error: any) {
      toast.error('Failed to get answer')
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[var(--color-primary)]" /></div>
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)] relative rounded-[20px] overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.03] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)] rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.03] pointer-events-none" />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 relative z-10 scroll-smooth">
        {messages.length === 0 && !sending && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-center m-auto max-w-md"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] rounded-full p-0.5 shadow-lg shadow-[var(--color-primary)]/20 mb-6">
              <div className="w-full h-full bg-[var(--color-surface)] rounded-full flex items-center justify-center">
                <Sparkles className="text-[var(--color-primary)]" size={32} />
              </div>
            </div>
            <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2">Corpus AI</h3>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
              I've read this paper and I'm ready to answer your questions. You can ask about specific sections or the paper as a whole.
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-6">
              {/* User Question */}
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="self-end max-w-[85%] md:max-w-[75%] flex gap-4"
              >
                <div className="bg-[var(--color-text-primary)] text-[var(--color-background)] px-5 py-3.5 rounded-[20px] rounded-tr-sm shadow-sm text-[15px] leading-relaxed">
                  {msg.question}
                </div>
                <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-background-secondary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] mt-1">
                  <UserIcon size={14} />
                </div>
              </motion.div>

              {/* AI Answer */}
              {msg.answer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="self-start max-w-[85%] md:max-w-[75%] flex gap-4"
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white mt-1 shadow-md shadow-[var(--color-primary)]/20">
                    <Bot size={14} />
                  </div>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-6 py-5 rounded-[20px] rounded-tl-sm shadow-sm prose-custom max-w-none text-[15px] overflow-hidden">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{ code: ChartRenderer as any }}
                    >
                      {msg.answer}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {sending && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="self-start max-w-[85%] flex gap-4">
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white mt-1 shadow-md shadow-[var(--color-primary)]/20">
              <Bot size={14} />
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-4 rounded-[20px] rounded-tl-sm shadow-sm flex items-center gap-2">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-[var(--color-text-secondary)] ml-2 font-medium">Synthesizing response...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-[var(--color-surface)] border-t border-[var(--color-border)] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-[20px] blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center bg-[var(--color-background-secondary)] rounded-[18px] border border-[var(--color-border)] p-2 transition-colors focus-within:border-[var(--color-primary)] focus-within:bg-[var(--color-surface)] shadow-inner">
            
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent text-[var(--color-text-secondary)] text-sm font-medium border-none outline-none pl-3 pr-8 py-2 cursor-pointer hover:text-[var(--color-text-primary)] transition-colors appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              {sections.map(s => <option key={s} value={s}>{s === 'All Sections' ? s : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            
            <button
              type="button"
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={cn(
                "px-3 py-1.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all border shrink-0 mr-2",
                useWebSearch
                  ? "bg-blue-500 text-white border-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]"
              )}
            >
              🌐 Web
            </button>
            
            <div className="h-6 w-px bg-[var(--color-border)] mx-1" />

            <input
              value={input}
              onChange={(e) => { setInput(e.target.value); setUsedMic(false); }}
              placeholder="Message Corpus AI..."
              disabled={sending}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] py-3 px-2 disabled:opacity-50"
            />
            
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-200 shrink-0",
                isListening
                  ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse"
                  : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
              )}
            >
              <Mic size={18} />
            </button>
            
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="ml-1 w-10 h-10 rounded-[12px] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] animate-pulse"
                title="Stop JARVIS"
              >
                <Volume2 size={18} />
              </button>
            )}
            
            <button 
              type="submit" 
              disabled={!input.trim() || sending}
              className={cn(
                "ml-2 w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-200 shrink-0",
                input.trim() && !sending
                  ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95"
                  : "bg-[var(--color-background)] text-[var(--color-text-muted)] cursor-not-allowed border border-[var(--color-border)]"
              )}
            >
              {sending ? <StopCircle size={18} /> : <Send size={18} className="ml-0.5" />}
            </button>
          </div>
        </form>
        <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-3">AI responses can be inaccurate. Please verify information.</p>
      </div>

    </div>
  )
}
