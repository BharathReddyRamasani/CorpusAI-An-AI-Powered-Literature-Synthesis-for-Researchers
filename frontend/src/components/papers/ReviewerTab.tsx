import React, { useState } from 'react'
import { researchApi, PeerReviewResponse } from '../../api/research'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Sparkles, ShieldAlert, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export const ReviewerTab = ({ paperId }: { paperId: string }) => {
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState<PeerReviewResponse | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await researchApi.generatePeerReview({ paper_id: paperId })
      setReview(res)
    } catch {
      toast.error('Failed to generate peer review')
    } finally {
      setLoading(false)
    }
  }

  if (!review) {
    return (
      <Card className="p-12 text-center border-[var(--color-border)] glass flex flex-col items-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={40} className="text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold font-display text-[var(--color-text-primary)] mb-4">"Reviewer 2" Mode</h3>
        <p className="text-[var(--color-text-secondary)] max-w-lg mb-8">
          Subject this paper to an aggressive, hyper-critical peer review. 
          The AI will evaluate novelty, methodology, and clarity, and identify critical flaws.
        </p>
        <Button onClick={handleGenerate} isLoading={loading} className="bg-rose-500 hover:bg-rose-600 text-white">
          <Sparkles className="mr-2" size={18} />
          Generate Peer Review
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard title="Novelty" score={review.scores.novelty} color="#3b82f6" />
        <ScoreCard title="Methodology" score={review.scores.methodology} color="#8b5cf6" />
        <ScoreCard title="Clarity" score={review.scores.clarity} color="#10b981" />
      </div>

      <Card className="p-6 border-rose-500/30 bg-rose-500/5">
        <h4 className="text-lg font-bold text-rose-500 flex items-center gap-2 mb-4">
          <AlertTriangle size={20} /> Major Critiques
        </h4>
        <ul className="space-y-3">
          {review.critiques.map((c, i) => (
            <li key={i} className="flex gap-3 text-[var(--color-text-primary)]">
              <span className="text-rose-500 font-bold shrink-0">{i + 1}.</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 border-amber-500/30 bg-amber-500/5">
        <h4 className="text-lg font-bold text-amber-500 flex items-center gap-2 mb-4">
          <AlertCircle size={20} /> Suggested Improvements
        </h4>
        <ul className="space-y-3">
          {review.improvements.map((c, i) => (
            <li key={i} className="flex gap-3 text-[var(--color-text-primary)]">
              <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] flex justify-between items-center">
        <div>
          <p className="text-[var(--color-text-secondary)] text-sm font-semibold uppercase tracking-wider mb-1">Overall Decision</p>
          <h3 className="text-2xl font-bold font-display text-[var(--color-text-primary)]">{review.overall_decision}</h3>
        </div>
        <div className="text-rose-500 opacity-20">
          <ShieldAlert size={64} />
        </div>
      </Card>
    </div>
  )
}

const ScoreCard = ({ title, score, color }: { title: string, score: number, color: string }) => (
  <Card className="p-6 flex flex-col items-center border-[var(--color-border)] hover-lift">
    <div className="w-24 h-24 mb-4">
      <CircularProgressbar
        value={score * 10}
        text={`${score}/10`}
        styles={buildStyles({
          pathColor: color,
          textColor: 'var(--color-text-primary)',
          trailColor: 'var(--color-border)',
          textSize: '24px',
        })}
      />
    </div>
    <h4 className="font-bold text-[var(--color-text-primary)]">{title}</h4>
  </Card>
)
