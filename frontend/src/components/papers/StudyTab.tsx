import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { papersApi } from '../../api/papers'
import { RefreshCcw, CheckCircle, XCircle } from 'lucide-react'

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

  if (loading) return <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>

  const handleNextCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    setCurrentCard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1))
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Button variant={activeMode === 'flashcards' ? 'primary' : 'secondary'} onClick={() => setActiveMode('flashcards')}>
          Interactive Flashcards
        </Button>
        <Button variant={activeMode === 'quiz' ? 'primary' : 'secondary'} onClick={() => setActiveMode('quiz')}>
          Multiple Choice Quiz
        </Button>
      </div>

      {activeMode === 'flashcards' && flashcards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              height: '350px', 
              perspective: '1000px', 
              cursor: 'pointer' 
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transition: 'transform 0.6s',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                background: 'var(--bg-card)', border: '2px solid var(--border-subtle)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', color: 'var(--text-muted)' }}>Question {currentCard + 1}/{flashcards.length}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>{flashcards[currentCard].question}</h3>
                <p style={{ position: 'absolute', bottom: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCcw size={16} /> Click to flip
                </p>
              </div>
              
              {/* Back */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                background: 'var(--accent-glow)', border: '2px solid var(--accent-primary)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem',
                transform: 'rotateY(180deg)', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
              }}>
                <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', color: 'var(--accent-primary)' }}>Answer</span>
                <p style={{ fontSize: '1.25rem', textAlign: 'center', lineHeight: 1.6, color: 'var(--text-primary)' }}>{flashcards[currentCard].answer}</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Button variant="secondary" onClick={handlePrevCard}>Previous</Button>
            <Button variant="secondary" onClick={handleNextCard}>Next Card</Button>
          </div>
        </div>
      )}

      {activeMode === 'quiz' && quizzes.length > 0 && (
        <Card style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Test Your Knowledge</h3>
            {showResults && (
              <span style={{ padding: '0.5rem 1rem', background: 'var(--bg-deep-void)', borderRadius: '9999px', fontWeight: 600 }}>
                Score: {calculateScore()} / {quizzes.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {quizzes.map((quiz, qIndex) => (
              <div key={qIndex} style={{ borderBottom: qIndex !== quizzes.length - 1 ? '1px solid var(--border-subtle)' : 'none', paddingBottom: qIndex !== quizzes.length - 1 ? '2rem' : 0 }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>
                  {qIndex + 1}. {quiz.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quiz.options.map((opt: string, oIndex: number) => {
                    const isSelected = quizAnswers[qIndex] === opt;
                    let bg = 'var(--bg-deep-void)'
                    let border = '1px solid var(--border-subtle)'
                    
                    if (isSelected) {
                      bg = 'var(--bg-card-hover)'
                      border = '1px solid var(--accent-primary)'
                    }
                    
                    if (showResults) {
                      if (opt === quiz.answer) {
                        bg = 'rgba(16, 185, 129, 0.1)'
                        border = '1px solid var(--color-success)'
                      } else if (isSelected && opt !== quiz.answer) {
                        bg = 'rgba(239, 68, 68, 0.1)'
                        border = '1px solid var(--color-error)'
                      }
                    }

                    return (
                      <div 
                        key={oIndex}
                        onClick={() => handleQuizSelect(qIndex, opt)}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          background: bg,
                          border: border,
                          cursor: showResults ? 'default' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{opt}</span>
                        {showResults && opt === quiz.answer && <CheckCircle size={18} color="var(--color-success)" />}
                        {showResults && isSelected && opt !== quiz.answer && <XCircle size={18} color="var(--color-error)" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {!showResults ? (
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <Button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length < quizzes.length}>
                Submit Answers
              </Button>
            </div>
          ) : (
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <Button onClick={() => { setShowResults(false); setQuizAnswers({}); }}>
                Retake Quiz
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
