import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { GlowCard } from '../components/ui/GlowCard'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Input } from '../components/ui/Input'
import { researchApi, ArxivPaper } from '../api/research'
import { Search, BookOpen, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { cn } from '../lib/cn'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } }
}

const ArxivPage = () => {
  const [arxivQuery, setArxivQuery] = useState('')
  const [arxivResults, setArxivResults] = useState<ArxivPaper[]>([])
  const [arxivRecommendations, setArxivRecommendations] = useState<ArxivPaper[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [arxivSearching, setArxivSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [importingUrls, setImportingUrls] = useState<Record<string, boolean>>({})

  useEffect(() => {
    researchApi.getArxivRecommendations()
      .then(setArxivRecommendations)
      .catch(() => {})
      .finally(() => setLoadingRecommendations(false))
  }, [])

  const handleArxivSearch = async () => {
    if (!arxivQuery.trim()) return toast.error('Enter a search query')
    setHasSearched(true)
    setArxivSearching(true)
    try { 
      setArxivResults(await researchApi.searchArxiv(arxivQuery)) 
    }
    catch { 
      toast.error('Search failed') 
    }
    finally { 
      setArxivSearching(false) 
    }
  }

  const handleImportArxiv = async (paper: ArxivPaper) => {
    setImportingUrls(prev => ({ ...prev, [paper.pdf_url]: true }))
    try {
      await researchApi.importArxivPaper({ url: paper.pdf_url, title: paper.title })
      toast.success('Import started!')
    } catch { 
      toast.error('Import failed') 
    }
    finally { 
      setImportingUrls(prev => ({ ...prev, [paper.pdf_url]: false })) 
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full flex flex-col min-h-full">
      {/* ── Header ── */}
      <motion.div {...fadeUp} className="mb-8 shrink-0">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2 flex items-center gap-3">
          <BookOpen className="text-sky-500" /> ArXiv Search
        </h1>
        <p className="text-[var(--color-text-secondary)] text-[15px]">
          Search external research papers and import them directly into your library.
        </p>
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div {...fadeUp} className="relative mb-8 flex group shadow-sm rounded-[20px] hover-lift z-10 shrink-0">
        <Input
          value={arxivQuery}
          onChange={(e) => setArxivQuery(e.target.value)}
          placeholder="e.g. quantum computing error correction..."
          onKeyDown={(e) => e.key === 'Enter' && handleArxivSearch()}
          className="w-full text-lg py-5 px-6 pr-16 rounded-[20px] border-[var(--color-border)] bg-[var(--color-surface)] shadow-inner transition-colors group-hover:border-sky-500"
        />
        <button 
          onClick={handleArxivSearch} 
          disabled={arxivSearching}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-[14px] bg-sky-500 text-white flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          {arxivSearching ? <Spinner size="sm" /> : <Search size={24} />}
        </button>
      </motion.div>

      {/* ── Results Container ── */}
      <div className="flex-1 pr-2 pb-8">
        <div className="space-y-6">
          {/* Section Headers */}
          {hasSearched && arxivResults.length > 0 && !arxivSearching && (
            <h2 className="font-display text-xl font-bold mb-4 text-[var(--color-text-primary)]">Search Results</h2>
          )}
          
          {!hasSearched && loadingRecommendations && (
            <div className="flex justify-center items-center py-12">
              <Spinner size="md" />
              <span className="ml-3 text-[var(--color-text-muted)]">Analyzing your library to find recommendations...</span>
            </div>
          )}

          {!hasSearched && arxivRecommendations.length > 0 && !loadingRecommendations && (
            <div className="mb-6 p-4 rounded-[16px] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
              <h2 className="font-display text-lg font-bold text-[var(--color-primary)] flex items-center gap-2 mb-1">
                <Sparkles size={18} /> Recommended for You
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Dynamically generated based on the papers currently in your library.
              </p>
            </div>
          )}

          <AnimatePresence>
            {(arxivResults.length > 0 ? arxivResults : arxivRecommendations).map((paper, i) => (
              <GlowCard 
                key={paper.pdf_url} 
                {...fadeUp} transition={{ delay: i * 0.05 }}
                className="p-6 md:p-8"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 transition-transform origin-top group-hover:scale-y-110" />
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-2 leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{paper.title}</h4>
                    <p className="text-sky-600 dark:text-sky-400 text-sm mb-2">{paper.authors.join(', ')}</p>
                    <p className="text-[var(--color-text-muted)] text-xs font-mono">Published: {new Date(paper.published).toLocaleDateString()}</p>
                  </div>
                  <Button 
                    onClick={() => handleImportArxiv(paper)} 
                    isLoading={importingUrls[paper.pdf_url]}
                    disabled={importingUrls[paper.pdf_url]}
                    className="shrink-0 w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 px-6 py-2.5 rounded-[12px]"
                  >
                    Import PDF
                  </Button>
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed line-clamp-4 md:line-clamp-none bg-[var(--color-background-secondary)] p-4 md:p-5 rounded-[16px] font-serif border border-[var(--color-border)]/50">
                  {paper.summary}
                </p>
              </GlowCard>
            ))}
          </AnimatePresence>
          
          {((!hasSearched && arxivRecommendations.length === 0 && !loadingRecommendations) || 
            (hasSearched && arxivResults.length === 0 && !arxivSearching)) && (
             <div className="text-center p-12 text-[var(--color-text-muted)]">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>{hasSearched ? "No results found for your search." : "No recommendations available yet. Try searching!"}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArxivPage
