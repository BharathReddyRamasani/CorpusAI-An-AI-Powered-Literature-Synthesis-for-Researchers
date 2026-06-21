import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { papersApi } from '../../api/papers'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Lightbulb, TrendingUp, Key, Zap, Target, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

export const InsightsTab = ({ paperId }: { paperId: string }) => {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<any>(null)
  const [visualizations, setVisualizations] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsData, visData] = await Promise.all([
          papersApi.getInsights(paperId),
          papersApi.getVisualizations(paperId)
        ])
        setInsights(insightsData)
        setVisualizations(visData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [paperId])

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>

  if (!insights && !visualizations) {
    return (
      <div className="p-12 text-center text-[var(--color-text-secondary)]">
        <p>Failed to load insights. The AI model might not be configured correctly, or the API key is missing.</p>
        <p className="mt-2 text-sm">Please check your backend logs or your Groq API Key in the `.env` file.</p>
      </div>
    )
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const renderChart = (chart: any) => {
    const data = chart.labels.map((label: string, i: number) => ({
      name: label,
      value: chart.values[i]
    }))

    if (chart.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
            <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chart.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={12} />
            <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-accent)' }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (chart.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    return <p>Unsupported chart type</p>
  }

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }
  
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Visualizations */}
      {visualizations?.charts && visualizations.charts.length > 0 && (
        <Card className="p-8 border-[var(--color-border)] glass">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]">
              <TrendingUp size={22} />
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Data Visualizations
            </h3>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {visualizations.charts.map((chart: any, index: number) => (
              <div key={index} className="p-6 bg-[var(--color-background-secondary)] rounded-[20px] border border-[var(--color-border)] shadow-sm">
                <h4 className="text-center font-semibold text-[var(--color-text-primary)] mb-6 font-display">{chart.title}</h4>
                {renderChart(chart)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      {insights && insights.contributions && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <motion.div variants={fadeUp}>
            <div className="h-full p-8 rounded-[24px] bg-[color-mix(in_srgb,#10b981_6%,var(--color-surface))] border border-[color-mix(in_srgb,#10b981_20%,transparent)] shadow-inner hover-lift">
              <h4 className="font-display text-xl font-bold text-[#10b981] mb-6 flex items-center gap-3 border-b border-[#10b981]/20 pb-4">
                <Key size={22} className="opacity-80" /> Key Contributions
              </h4>
              <ul className="space-y-4">
                {insights.contributions.map((c: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                    <span className="text-[#10b981] mt-0.5 shrink-0">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="h-full p-8 rounded-[24px] bg-[color-mix(in_srgb,#3b82f6_6%,var(--color-surface))] border border-[color-mix(in_srgb,#3b82f6_20%,transparent)] shadow-inner hover-lift">
              <h4 className="font-display text-xl font-bold text-[#3b82f6] mb-6 flex items-center gap-3 border-b border-[#3b82f6]/20 pb-4">
                <Zap size={22} className="opacity-80" /> Novel Ideas
              </h4>
              <ul className="space-y-4">
                {insights.novel_ideas.map((c: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                    <span className="text-[#3b82f6] mt-0.5 shrink-0">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="h-full p-8 rounded-[24px] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] shadow-inner hover-lift">
              <h4 className="font-display text-xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3 border-b border-[var(--color-primary)]/20 pb-4">
                <Target size={22} className="opacity-80" /> Major Findings
              </h4>
              <ul className="space-y-4">
                {insights.key_findings.map((c: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                    <span className="text-[var(--color-primary)] mt-0.5 shrink-0">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="h-full p-8 rounded-[24px] bg-[color-mix(in_srgb,#f59e0b_6%,var(--color-surface))] border border-[color-mix(in_srgb,#f59e0b_20%,transparent)] shadow-inner hover-lift">
              <h4 className="font-display text-xl font-bold text-[#f59e0b] mb-6 flex items-center gap-3 border-b border-[#f59e0b]/20 pb-4">
                <AlertTriangle size={22} className="opacity-80" /> Limitations
              </h4>
              <ul className="space-y-4">
                {insights.limitations.map((c: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                    <span className="text-[#f59e0b] mt-0.5 shrink-0">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  )
}
