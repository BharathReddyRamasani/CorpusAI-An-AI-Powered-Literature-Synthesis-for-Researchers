import React from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  Upload,
  Sparkles,
  Quote,
  Wrench,
  ShieldCheck,
  FileStack,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react"
import { LandingNav } from "../components/landing/LandingNav"
import { AnimatedBackground } from "../components/landing/AnimatedBackground"
import { FeatureSection } from "../components/landing/FeatureSection"
import { KnowledgeGraphHero } from "../components/landing/KnowledgeGraphHero"
import { Button } from "../components/ui/Button"
import { Logo } from "../components/ui/Logo"
import {
  UploadVisual,
  InsightVisual,
  CitationVisual,
  ToolsVisual,
  SecurityVisual,
} from "../components/landing/featureVisuals"

// Stagger container — orchestrated, not uniform
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

// Scroll-reveal — once, not looping
const reveal = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const features = [
  {
    tag: "Sources",
    icon: Upload,
    title: "Upload your sources",
    desc: "Bring PDFs, Word documents, plain text, and pasted notes into one focused research workspace.",
    points: ["PDF, DOCX, TXT & raw text", "Drag and drop or paste", "Organize into collections"],
    visual: <UploadVisual />,
  },
  {
    tag: "Understanding",
    icon: Sparkles,
    title: "Instant insights",
    desc: "Corpus AI reads across all your material and surfaces key themes, findings, and open questions in seconds.",
    points: ["Cross-source synthesis", "Key theme extraction", "Highlighted gaps and contradictions"],
    visual: <InsightVisual />,
  },
  {
    tag: "Trust",
    icon: Quote,
    title: "Source-backed answers",
    desc: "Every answer is grounded in your documents with inline citations you can click to jump to the original passage.",
    points: ["Inline citation chips", "Page-level references", "Zero hallucinated facts"],
    visual: <CitationVisual />,
  },
  {
    tag: "Toolkit",
    icon: Wrench,
    title: "Research tools",
    desc: "Generate summaries, mind maps, quizzes, flashcards, and reports from your sources in one click.",
    points: ["Summary & citations", "Study and reporting modes", "Export-ready outputs"],
    visual: <ToolsVisual />,
  },
  {
    tag: "Security",
    icon: ShieldCheck,
    title: "Privacy and security",
    desc: "Your sources stay yours. Everything is private to your workspace and never used to train models.",
    points: ["Private by default", "Local-first mock demo", "Never used for training"],
    visual: <SecurityVisual />,
  },
]

const STATS = [
  { v: "4+",   l: "Source types"  },
  { v: "6+",   l: "Research tools" },
  { v: "Fast", l: "RAG Pipeline"  },
  { v: "100%", l: "Source-backed" },
]

export default function LandingPage() {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen overflow-x-hidden bg-[var(--color-background)] selection:bg-[var(--color-primary)]/30"
    >
      <LandingNav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-36 pb-12 md:pt-44 md:pb-20">
        <AnimatedBackground />

        {/* Text block — staggered entrance */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-4xl text-center z-10"
        >
          <motion.div variants={item} className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 shadow-sm">
            <Sparkles size={14} className="text-[var(--color-accent)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)] tracking-wide uppercase">
              Multimodal research, grounded in your sources
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-balance text-[var(--color-text-primary)] md:text-7xl"
          >
            Understand Research.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] pb-2 block">
              Analyze Anything.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)] text-pretty"
          >
            Upload documents, notes, and research material. Generate summaries, citations,
            mind maps, quizzes, reports, and source-backed insights.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base group">
                Start Researching
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── THE SIGNATURE MOMENT: Knowledge Graph Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div
            className="card-featured overflow-hidden rounded-[28px] p-[1px] shadow-2xl"
            style={{
              boxShadow: '0 32px 80px -16px rgba(79,70,229,0.25), 0 8px 32px -8px rgba(0,0,0,0.15)',
            }}
          >
            <div
              className="rounded-[27px] p-2"
              style={{ background: 'var(--color-background-secondary)' }}
            >
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="ml-3 flex-1 h-6 max-w-xs rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center px-3">
                  <FileStack size={10} className="text-[var(--color-text-secondary)] mr-2" />
                  <span className="text-[10px] text-[var(--color-text-secondary)]">insight.ai / graph</span>
                </div>
              </div>
              {/* The animated knowledge graph */}
              <KnowledgeGraphHero />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-12 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.l}
              variants={item}
              className="card-surface rounded-[20px] p-6 text-center hover-lift"
            >
              <p className="font-display text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                {s.v}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features — scroll-triggered, once per element ──────────────── */}
      <section id="features" className="px-6 py-24 md:py-32 relative z-10 bg-[var(--color-background)]">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-[var(--color-text-primary)] md:text-5xl">
            Everything you need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] pb-1">
              make sense of it all
            </span>
          </h2>
          <p className="mt-6 text-xl text-[var(--color-text-secondary)]">
            From raw sources to source-backed understanding, in one focused workspace.
          </p>
        </motion.div>

        <div id="how" className="mx-auto flex max-w-5xl flex-col gap-24 md:gap-36">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              id={f.tag === "Security" ? "security" : undefined}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <FeatureSection feature={f} index={i} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 relative z-10">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center md:p-20 shadow-2xl"
        >
          <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 right-0 h-60 w-60 rounded-full bg-[var(--color-accent)] opacity-10 blur-[80px] pointer-events-none" />
          <h2 className="relative font-display text-4xl font-bold tracking-tight text-balance text-[var(--color-text-primary)] md:text-5xl">
            Start understanding your research today
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-xl text-[var(--color-text-secondary)]">
            Free to explore. No credit card required. Bring your first sources in minutes.
          </p>
          <Link to="/register" className="relative mt-10 inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base group">
              Start Researching
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] px-6 py-12 relative z-10 bg-[var(--color-background)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo size="sm" />
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            © 2026 Corpus AI. Multimodal Research Assistant.
          </p>
          <div className="flex gap-4">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] transition-all duration-200 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] hover:-translate-y-0.5 border border-[var(--color-border)]"
                aria-label="Social link"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
