import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { GlowCard } from '../components/ui/GlowCard'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { papersApi, Paper } from '../api/papers'
import { researchApi, AnalysisResponse, ComparisonResponse, GapsListResponse, LiteratureReviewResponse, CitationIntelligenceResponse } from '../api/research'
import { Search, MessageSquare, BarChart2, Settings, FileText, Layers, Lightbulb, BookOpen, Quote, Sparkles, ChevronRight, Zap, Headphones, Check, Clock, Mic, MicOff, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../lib/cn'

// ── Stagger variants ──
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } }
}

const GlobalResearchPage = () => {
  const [papers, setPapers] = useState<Paper[]>([])
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'analyze' | 'compare' | 'gaps' | 'literature' | 'citation' | 'timeline'>('chat')
  
  const [actionLoading, setActionLoading] = useState(false)
  const [question, setQuestion] = useState('')
  
  // Results
  const [chatResponse, setChatResponse] = useState<{ answer: string, sources: string[] } | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null)
  const [gaps, setGaps] = useState<GapsListResponse | null>(null)
  const [literatureReview, setLiteratureReview] = useState<LiteratureReviewResponse | null>(null)
  const [citationIntel, setCitationIntel] = useState<CitationIntelligenceResponse | null>(null)
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null)

  // Voice JARVIS
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [usedMic, setUsedMic] = useState(false)
  const recognitionRef = React.useRef<any>(null)
  const synthRef = React.useRef<any>(null)

  useEffect(() => {
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
        setQuestion(transcript)
      }
      
      recognitionRef.current.onend = () => setIsListening(false)
    }
    
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
      setQuestion('')
      setUsedMic(true)
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const speak = (text: string) => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.')
                          .replace(/[*_#`]/g, '')
                          .replace(/<[^>]*>?/gm, '')
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
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
    papersApi.listPapers({ page_size: 50 })
      .then(res => {
        setPapers(res.papers.filter(p => p.status === 'ready'))

      })
      .catch(() => toast.error('Failed to load papers'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectPaper = (id: string) => {
    setSelectedPaperIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    setSelectedPaperIds(selectedPaperIds.length === papers.length ? [] : papers.map(p => p.paper_id))
  }

  // ── Actions ──
  const handleGlobalChat = async () => {
    if (!selectedPaperIds.length) return toast.error('Select at least one paper')
    if (!question.trim()) return toast.error('Enter a question')
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    setActionLoading(true)
    try { 
      const res = await researchApi.globalChat({ paper_ids: selectedPaperIds, question })
      setChatResponse(res) 
      if (usedMic) {
        speak(res.answer)
        setUsedMic(false)
      }
    }
    catch { toast.error('Failed to get answer') }
    finally { setActionLoading(false) }
  }

  const handleAction = async (action: () => Promise<any>, setter: (data: any) => void, minPapers = 2) => {
    if (selectedPaperIds.length < minPapers) return toast.error(`Select at least ${minPapers} papers`)
    setActionLoading(true)
    try { setter(await action()) }
    catch { toast.error('Action failed') }
    finally { setActionLoading(false) }
  }



  if (loading) return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>

  const tabs = [
    { id: 'chat',       label: 'Chat',        icon: <MessageSquare size={16} />, accent: 'var(--color-primary)' },
    { id: 'analyze',    label: 'Analysis',    icon: <BarChart2 size={16} />,     accent: 'var(--color-accent)' },
    { id: 'compare',    label: 'Compare',     icon: <Layers size={16} />,        accent: '#f59e0b' },
    { id: 'gaps',       label: 'Gaps',        icon: <Lightbulb size={16} />,     accent: 'var(--color-secondary)' },
    { id: 'literature', label: 'Lit Review',  icon: <BookOpen size={16} />,      accent: '#8b5cf6' },
    { id: 'citation',   label: 'Citations',   icon: <Quote size={16} />,         accent: '#ec4899' },
    { id: 'timeline',   label: 'Timeline',    icon: <Clock size={16} />,         accent: 'var(--color-accent)' },

  ] as const

  const activeAccent = tabs.find(t => t.id === activeTab)?.accent

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col min-h-full">
      {/* ── Header ── */}
      <motion.div {...fadeUp} className="mb-8 shrink-0">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2 flex items-center gap-3">
          <Sparkles className="text-[var(--color-accent)]" /> Global Intelligence
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[15px]">
          Query, compare, and analyze across your entire library simultaneously.
        </p>
      </motion.div>

      {/* ── Main Layout Split ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar */}
        <motion.div {...fadeUp} className="lg:w-[320px] shrink-0 flex flex-col h-[400px] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-6 bg-[var(--color-surface)] border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] rounded-[24px] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)] flex justify-between items-center">
            <h3 className="font-semibold text-[14px] flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-primary)]" />
              Library
              <Badge variant="primary" className="ml-1">{papers.length}</Badge>
            </h3>
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs py-1 px-2 h-auto">
              {selectedPaperIds.length === papers.length ? 'Deselect' : 'Select All'}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {papers.length === 0 ? (
              <div className="text-center p-8 text-[var(--color-text-muted)]">
                <Layers size={24} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No ready papers.</p>
              </div>
            ) : (
              papers.map(p => {
                const isSelected = selectedPaperIds.includes(p.paper_id)
                return (
                  <div
                    key={p.paper_id}
                    onClick={() => handleSelectPaper(p.paper_id)}
                    className={cn(
                      "p-3 rounded-[16px] cursor-pointer flex gap-3 items-start transition-all duration-200 border",
                      isSelected 
                        ? "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] shadow-sm" 
                        : "bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-background-secondary)]"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                      isSelected ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white" : "border-[var(--color-text-muted)] bg-[var(--color-surface)]"
                    )}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <p className={cn("text-[13px] font-medium leading-snug line-clamp-2", isSelected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
                      {p.title || p.filename}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Right Content Area (2/3 width) */}
        <motion.div {...fadeUp} className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Beautiful Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 shrink-0 hide-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-[16px] text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap z-10 border",
                    isActive ? "text-[var(--color-text-primary)] border-transparent" : "text-[var(--color-text-secondary)] border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="global-tab"
                      className="absolute inset-0 rounded-[16px] z-[-1] shadow-md border"
                      style={{ 
                        background: `color-mix(in srgb, ${tab.accent} 10%, var(--color-surface))`,
                        borderColor: `color-mix(in srgb, ${tab.accent} 30%, transparent)`
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span style={{ color: isActive ? tab.accent : 'inherit' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Active Tab Workspace */}
          <GlowCard className="flex-1 rounded-[24px] relative flex flex-col shadow-lg border-[var(--color-border)] overflow-hidden">
            {/* Ambient workspace glow */}
            <div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-10 transition-colors duration-700" 
              style={{ background: activeAccent }} 
            />

            <div className="p-6 md:p-8 relative z-10">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} {...fadeUp}>
                  
                  {/* ── 1. GLOBAL CHAT ── */}
                  {activeTab === 'chat' && (
                    <div className="max-w-4xl">
                      <div className="mb-8 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)]">
                          <MessageSquare size={24} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-text-primary)]">Multi-Paper Chat</h3>
                          <p className="text-[var(--color-text-secondary)] text-sm">Ask a question against all selected papers. The AI will synthesize an answer.</p>
                        </div>
                      </div>
                      
                      <div className="relative mb-8 flex group shadow-sm rounded-[20px] hover-lift">
                        <Input
                          value={question}
                          onChange={(e) => { setQuestion(e.target.value); setUsedMic(false); }}
                          placeholder="e.g. Compare the methodologies used in these papers..."
                          onKeyDown={(e) => e.key === 'Enter' && handleGlobalChat()}
                          className="w-full text-base py-4 px-5 pr-32 rounded-[20px] border-[var(--color-border)] bg-[var(--color-surface)] shadow-inner transition-colors group-hover:border-[var(--color-primary)]"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {isSpeaking && (
                            <button
                              type="button"
                              onClick={stopSpeaking}
                              className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-[var(--color-accent)] animate-pulse"
                            >
                              <Volume2 size={18} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={cn(
                              "w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-200 shrink-0",
                              isListening
                                ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse"
                                : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                            )}
                          >
                            <Mic size={18} />
                          </button>
                          <button 
                            onClick={handleGlobalChat} 
                            disabled={!selectedPaperIds.length || actionLoading || !question.trim()}
                            className="w-10 h-10 rounded-[14px] bg-[var(--color-primary)] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                          >
                            {actionLoading ? <Spinner size="sm" /> : <ChevronRight size={20} />}
                          </button>
                        </div>
                      </div>

                      {chatResponse && (
                        <motion.div {...fadeUp}>
                          <div className="prose-custom max-w-none p-6 rounded-[20px] bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-surface))] border border-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] mb-6 shadow-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{chatResponse.answer}</ReactMarkdown>
                          </div>
                          {chatResponse.sources?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Quote size={14} /> Extracted Sources
                              </h4>
                              <div className="flex flex-col gap-3">
                                {chatResponse.sources.map((src, i) => (
                                  <div key={i} className="p-4 rounded-[14px] bg-[var(--color-background-secondary)] text-sm text-[var(--color-text-secondary)] border-l-4 border-[var(--color-primary)] font-mono leading-relaxed">
                                    "{src}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── 2. ANALYSIS ── */}
                  {activeTab === 'analyze' && (
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]">
                            <BarChart2 size={24} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold tracking-tight">Multi-Paper Analysis</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Extract common models, datasets, and trends.</p>
                          </div>
                        </div>
                        <Button onClick={() => handleAction(() => researchApi.analyze({ paper_ids: selectedPaperIds }), setAnalysis)} isLoading={actionLoading} disabled={selectedPaperIds.length < 2}>
                          Analyze {selectedPaperIds.length} Papers
                        </Button>
                      </div>

                      {analysis && (
                        <div className="flex flex-col gap-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card-surface p-6 rounded-[20px]">
                              <h4 className="font-semibold text-[var(--color-accent)] mb-4 flex items-center gap-2"><Zap size={16} /> Common Models</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.common_models.map((m, i) => (
                                  <Badge key={i} variant="primary" className="bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)] border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]">{m}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="card-surface p-6 rounded-[20px]">
                              <h4 className="font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2"><FileText size={16} /> Common Datasets</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.common_datasets.map((d, i) => (
                                  <Badge key={i} variant="primary" className="bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]">{d}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="card-surface p-6 md:p-8 rounded-[20px]">
                            <h4 className="font-display text-lg font-bold mb-4">Key Research Trends</h4>
                            <ul className="space-y-3">
                              {analysis.research_trends.map((t, i) => (
                                <li key={i} className="text-[var(--color-text-secondary)] leading-relaxed flex items-start gap-3">
                                  <span className="text-[var(--color-accent)] mt-1">•</span> {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── 3. COMPARE ── */}
                  {activeTab === 'compare' && (
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-500">
                            <Layers size={24} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold tracking-tight">Comparison Engine</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Generate a side-by-side technical comparison matrix.</p>
                          </div>
                        </div>
                        <Button onClick={() => handleAction(() => researchApi.compare({ paper_ids: selectedPaperIds }), setComparison)} isLoading={actionLoading} disabled={selectedPaperIds.length < 2}>
                          Compare {selectedPaperIds.length} Papers
                        </Button>
                      </div>

                      {comparison && (
                        <div className="card-surface p-6 md:p-8 rounded-[20px] overflow-x-auto">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr>
                                <th className="p-3 border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium">Criteria</th>
                                {comparison.papers.map((p, i) => (
                                  <th key={i} className="p-3 border-b border-[var(--color-border)] font-semibold text-[var(--color-text-primary)] min-w-[200px]">{p}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(comparison.comparison).map(([criterion, data]) => (
                                <tr key={criterion} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background-secondary)]">
                                  <td className="p-3 font-semibold text-[var(--color-text-primary)] capitalize align-top">{criterion}</td>
                                  {comparison.papers.map((p, i) => (
                                    <td key={i} className="p-3 text-[var(--color-text-secondary)] align-top">{data[p] || '-'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── 4. TIMELINE ── */}
                  {activeTab === 'timeline' && (
                    <div>
                      <div className="mb-8 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)]">
                          <Clock size={24} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold tracking-tight">Research Timeline</h3>
                          <p className="text-[var(--color-text-secondary)] text-sm">Chronological evolution of papers in your library.</p>
                        </div>
                      </div>
                      
                      <div className="relative border-l-2 border-[color-mix(in_srgb,var(--color-border)_50%,transparent)] ml-4 py-4 space-y-8">
                        {[...papers].sort((a, b) => new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()).map((p, i) => (
                          <motion.div key={p.paper_id} {...fadeUp} transition={{ delay: i * 0.05 }} className="relative pl-8">
                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[var(--color-surface)] border-4 border-[var(--color-accent)] shadow-[0_0_0_4px_var(--color-surface)]" />
                            <div className="card-surface p-5 rounded-[16px] hover-lift group cursor-pointer border-[var(--color-border)]">
                              <p className="text-[var(--color-accent)] text-xs font-bold mb-1 tracking-wider uppercase">
                                {new Date(p.upload_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <h4 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                                {p.title || p.filename}
                              </h4>
                              <p className="text-[var(--color-text-secondary)] text-sm line-clamp-1">{p.authors || 'Unknown Authors'}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}


                  
                  {/* ── 6. GAPS ── */}
                  {activeTab === 'gaps' && (
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] text-[var(--color-secondary)]">
                            <Lightbulb size={24} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold tracking-tight">Research Gaps</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Identify contradictions and unexplored areas across papers.</p>
                          </div>
                        </div>
                        <Button onClick={() => handleAction(() => researchApi.detectGaps({ paper_ids: selectedPaperIds }), setGaps)} isLoading={actionLoading} disabled={selectedPaperIds.length < 2}>
                          Detect Gaps in {selectedPaperIds.length} Papers
                        </Button>
                      </div>

                      {gaps && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {gaps.gaps.map((g, i) => (
                            <div key={i} className="card-surface p-6 rounded-[20px]">
                              <h4 className="font-display text-lg font-bold mb-3 text-[var(--color-secondary)] flex items-start gap-2">
                                <span className="mt-1"><Lightbulb size={16} /></span> {g.gap}
                              </h4>
                              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{g.reason}</p>
                            </div>
                          ))}
                          {gaps.gaps.length === 0 && (
                            <div className="col-span-1 md:col-span-2 text-center p-8 text-[var(--color-text-muted)]">
                              No significant gaps identified.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── 7. LITERATURE REVIEW ── */}
                  {activeTab === 'literature' && (
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-purple-500/15 text-purple-500">
                            <BookOpen size={24} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold tracking-tight">Literature Review</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Generate a synthesized academic literature review.</p>
                          </div>
                        </div>
                        <Button onClick={() => handleAction(() => researchApi.generateLiteratureReview({ paper_ids: selectedPaperIds }), setLiteratureReview)} isLoading={actionLoading} disabled={selectedPaperIds.length < 2}>
                          Generate Review for {selectedPaperIds.length} Papers
                        </Button>
                      </div>

                      {literatureReview && (
                        <div className="card-surface p-6 md:p-8 rounded-[20px] prose-custom max-w-none">
                          <h2 className="text-[var(--color-primary)] font-display">Introduction</h2>
                          <p>{literatureReview.introduction}</p>
                          <h2 className="text-[var(--color-accent)] font-display mt-6">Existing Methods</h2>
                          <p>{literatureReview.existing_methods}</p>
                          <h2 className="text-rose-500 font-display mt-6">Challenges</h2>
                          <p>{literatureReview.challenges}</p>
                          <h2 className="text-[var(--color-secondary)] font-display mt-6">Future Directions</h2>
                          <p>{literatureReview.future_directions}</p>
                          <h2 className="text-[var(--color-primary)] font-display mt-6">Conclusion</h2>
                          <p>{literatureReview.conclusion}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── 8. CITATIONS ── */}
                  {activeTab === 'citation' && (
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-pink-500/15 text-pink-500">
                            <Quote size={24} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold tracking-tight">Citation Intelligence</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Discover the most cited and influential papers in your library.</p>
                          </div>
                        </div>
                        <Button onClick={() => handleAction(() => researchApi.getCitationIntelligence(), setCitationIntel, 0)} isLoading={actionLoading}>
                          Analyze Global Citations
                        </Button>
                      </div>

                      {citationIntel && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="card-surface p-6 rounded-[20px]">
                            <h4 className="font-display text-lg font-bold mb-4 text-[var(--color-primary)]">Most Cited Papers</h4>
                            <ul className="space-y-3">
                              {citationIntel.top_papers.map((p, i) => (
                                <li key={i} className="text-sm font-medium text-[var(--color-text-primary)] leading-snug flex items-start gap-2"><span className="text-[var(--color-primary)] mt-0.5">•</span>{p}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="card-surface p-6 rounded-[20px]">
                            <h4 className="font-display text-lg font-bold mb-4 text-[var(--color-accent)]">Top Models</h4>
                            <ul className="space-y-3">
                              {citationIntel.top_models.map((a, i) => (
                                <li key={i} className="text-sm font-medium text-[var(--color-text-primary)] leading-snug flex items-start gap-2"><span className="text-[var(--color-accent)] mt-0.5">•</span>{a}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="card-surface p-6 rounded-[20px]">
                            <h4 className="font-display text-lg font-bold mb-4 text-[var(--color-secondary)]">Top Datasets</h4>
                            <ul className="space-y-3">
                              {citationIntel.top_datasets.map((c, i) => (
                                <li key={i} className="text-sm font-medium text-[var(--color-text-primary)] leading-snug flex items-start gap-2"><span className="text-[var(--color-secondary)] mt-0.5">•</span>{c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── 9. PODCAST ── */}
                  {activeTab === 'podcast' && (
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-500">
                            <Headphones size={24} />
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-bold tracking-tight">Audio Podcast</h3>
                            <p className="text-[var(--color-text-secondary)] text-sm">Generate an AI-hosted audio discussion of the selected papers.</p>
                          </div>
                        </div>
                        <Button 
                          onClick={async () => {
                            if (selectedPaperIds.length === 0) return toast.error('Select at least one paper')
                            setActionLoading(true)
                            try {
                              const blob = await researchApi.generatePodcast({ paper_ids: selectedPaperIds })
                              setPodcastUrl(URL.createObjectURL(blob))
                              toast.success('Podcast generated!')
                            } catch { toast.error('Failed to generate podcast') }
                            finally { setActionLoading(false) }
                          }} 
                          isLoading={actionLoading} 
                          disabled={selectedPaperIds.length === 0}
                        >
                          Generate Podcast
                        </Button>
                      </div>

                      {podcastUrl && (
                        <div className="card-surface p-8 rounded-[20px] flex flex-col items-center justify-center border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] shadow-lg shadow-[var(--color-primary)]/10">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 mb-6 flex items-center justify-center shadow-inner">
                            <Headphones size={40} className="text-white" />
                          </div>
                          <h4 className="font-display text-xl font-bold mb-2 text-[var(--color-text-primary)]">Your Research Podcast is Ready</h4>
                          <p className="text-[var(--color-text-secondary)] mb-8 text-center max-w-md">Listen to an engaging audio summary of the research papers you selected.</p>
                          <audio controls src={podcastUrl} className="w-full max-w-md" autoPlay />
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  )
}

export default GlobalResearchPage
