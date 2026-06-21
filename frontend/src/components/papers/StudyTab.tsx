import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { papersApi } from '../../api/papers'
import { RefreshCcw, CheckCircle, XCircle, BrainCircuit, Target, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/cn'

export const StudyTab = ({ paperId }: { paperId: string }) => {
  const [loading, setLoading] = useState(true)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  
  const [activeMode, setActiveMode] = useState<'flashcards' | 'quiz'>('flashcards')
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flashData, quizData] = await Promise.all([
          papersApi.getFlashcards(paperId),
          papersApi.getQuiz(paperId)
        ])
        setFlashcards(flashData)
        setQuizzes(quizData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [paperId])

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>

  const handleNextCard = () => {
    setIsFlipped(false)
    setTimeout(() => setCurrentCard((prev) => (prev + 1) % flashcards.length), 150)
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    setTimeout(() => setCurrentCard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1)), 150)
  }

  const handleQuizSelect = (index: number, option: string) => {
    if (showResults) return
    setQuizAnswers(prev => ({ ...prev, [index]: option }))
  }

  const calculateScore = () => {
    let score = 0
    quizzes.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) score++
    })
    return score
  }

  return (
    <div className="flex flex-col gap-8 pb-12 h-full">
      {/* Premium Toggle */}
      <div className="flex justify-center mb-4">
        <div className="p-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex gap-1 shadow-sm">
          <button
            onClick={() => setActiveMode('flashcards')}
            className={cn(
              "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2",
              activeMode === 'flashcards' 
                ? "bg-[var(--color-primary)] text-white shadow-md shadow-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]" 
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]"
            )}
          >
            <BrainCircuit size={16} /> Flashcards
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={cn(
              "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2",
              activeMode === 'quiz' 
                ? "bg-[var(--color-accent)] text-white shadow-md shadow-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]" 
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]"
            )}
          >
            <Target size={16} /> Quiz
          </button>
        </div>
      </div>

      {activeMode === 'flashcards' && flashcards.length > 0 && (
        <div className="flex flex-col items-center max-w-2xl mx-auto w-full h-full justify-center pb-20">
          
          <div className="relative w-full aspect-[4/2.5] md:aspect-[2/1] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className="w-full h-full relative">
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 card-surface rounded-[24px] border border-[var(--color-border)] p-8 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="absolute top-4 right-6 text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">
                      Card {currentCard + 1} / {flashcards.length}
                    </div>
                    <Sparkles className="absolute top-6 left-6 text-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]" size={24} />
                    <h3 className="font-display text-2xl md:text-3xl font-bold leading-snug text-[var(--color-text-primary)]">
                      {flashcards[currentCard].question}
                    </h3>
                    <div className="absolute bottom-6 flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-4 py-2 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                      <RefreshCcw size={14} /> Click to see answer
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 rounded-[24px] p-8 flex flex-col items-center justify-center text-center shadow-2xl shadow-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]"
                    style={{ 
                      background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, var(--color-surface)), color-mix(in srgb, var(--color-accent) 5%, var(--color-surface)))'
                    }}
                  >
                    <div className="absolute top-4 right-6 text-xs font-bold tracking-wider text-[var(--color-primary)] uppercase">
                      Answer
                    </div>
                    <p className="text-xl md:text-2xl leading-relaxed text-[var(--color-text-primary)] font-medium">
                      {flashcards[currentCard].answer}
                    </p>
                    <div className="absolute bottom-6 flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium bg-[var(--color-surface)] px-4 py-2 rounded-full opacity-80 group-hover:opacity-100 transition-opacity shadow-sm border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                      <RefreshCcw size={14} /> Show question
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={(e) => { e.stopPropagation(); handlePrevCard(); }} className="rounded-full px-8 hover-lift">
              Previous
            </Button>
            <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleNextCard(); }} className="rounded-full px-8 hover-lift">
              Next Card
            </Button>
          </div>

        </div>
      )}

      {activeMode === 'quiz' && quizzes.length > 0 && (
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8 bg-[var(--color-surface)] p-6 rounded-[24px] border border-[var(--color-border)] shadow-sm">
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Knowledge Check</h3>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1">Select the best answer for each question.</p>
            </div>
            <AnimatePresence>
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "px-6 py-3 rounded-[16px] font-bold text-lg border",
                    calculateScore() / quizzes.length > 0.7 
                      ? "bg-green-500/10 text-green-500 border-green-500/20" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}
                >
                  Score: {calculateScore()} / {quizzes.length}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-8">
            {quizzes.map((quiz, qIndex) => (
              <motion.div 
                key={qIndex} 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qIndex * 0.1 }}
                className="card-surface p-6 md:p-8 rounded-[24px] border border-[var(--color-border)] shadow-sm"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-background-secondary)] border border-[var(--color-border)] flex items-center justify-center font-bold text-sm text-[var(--color-text-secondary)]">
                    {qIndex + 1}
                  </div>
                  <p className="font-display text-lg font-semibold text-[var(--color-text-primary)] leading-snug pt-1">
                    {quiz.question}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                  {quiz.options.map((opt: string, oIndex: number) => {
                    const isSelected = quizAnswers[qIndex] === opt
                    let btnClass = "bg-[var(--color-background-secondary)] border-[var(--color-border)] hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-background-secondary))] hover:border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
                    let textClass = "text-[var(--color-text-secondary)]"
                    
                    if (isSelected && !showResults) {
                      btnClass = "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] border-[var(--color-primary)] shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                      textClass = "text-[var(--color-primary)] font-medium"
                    }
                    
                    if (showResults) {
                      if (opt === quiz.answer) {
                        btnClass = "bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                        textClass = "text-green-600 dark:text-green-400 font-medium"
                      } else if (isSelected && opt !== quiz.answer) {
                        btnClass = "bg-rose-500/10 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                        textClass = "text-rose-600 dark:text-rose-400 font-medium"
                      } else {
                        btnClass = "bg-[var(--color-background-secondary)] border-[var(--color-border)] opacity-50"
                        textClass = "text-[var(--color-text-muted)]"
                      }
                    }

                    return (
                      <button 
                        key={oIndex}
                        onClick={() => handleQuizSelect(qIndex, opt)}
                        disabled={showResults}
                        className={cn(
                          "text-left p-4 rounded-[16px] border transition-all duration-200 flex justify-between items-center",
                          btnClass
                        )}
                      >
                        <span className={cn("text-sm leading-snug", textClass)}>{opt}</span>
                        {showResults && opt === quiz.answer && <CheckCircle size={18} className="text-green-500 shrink-0 ml-2" />}
                        {showResults && isSelected && opt !== quiz.answer && <XCircle size={18} className="text-rose-500 shrink-0 ml-2" />}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex justify-center pb-12">
            {!showResults ? (
              <Button size="lg" className="rounded-full px-12 hover-lift" onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length < quizzes.length}>
                Submit Answers
              </Button>
            ) : (
              <Button size="lg" variant="secondary" className="rounded-full px-12 hover-lift" onClick={() => { setShowResults(false); setQuizAnswers({}); }}>
                Retake Quiz
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
