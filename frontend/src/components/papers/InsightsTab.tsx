import React, { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { papersApi } from '../../api/papers'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Lightbulb, TrendingUp } from 'lucide-react'

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

  if (loading) return <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>

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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
            <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (chart.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={2} />
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
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    return <p>Unsupported chart type</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Visualizations */}
      {visualizations?.charts && visualizations.charts.length > 0 && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={24} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Interactive Data Visualization</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {visualizations.charts.map((chart: any, index: number) => (
              <div key={index} style={{ padding: '1rem', background: 'var(--bg-deep-void)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ textAlign: 'center', fontWeight: 600, marginBottom: '1rem' }}>{chart.title}</h4>
                {renderChart(chart)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights */}
      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Card>
            <h4 style={{ fontWeight: 600, color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} /> Key Contributions
            </h4>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {insights.contributions.map((c: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{c}</li>)}
            </ul>
          </Card>
          <Card>
            <h4 style={{ fontWeight: 600, color: 'var(--color-info)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} /> Novel Ideas
            </h4>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {insights.novel_ideas.map((c: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{c}</li>)}
            </ul>
          </Card>
          <Card>
            <h4 style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} /> Major Findings
            </h4>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {insights.key_findings.map((c: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{c}</li>)}
            </ul>
          </Card>
          <Card>
            <h4 style={{ fontWeight: 600, color: 'var(--color-warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} /> Limitations
            </h4>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {insights.limitations.map((c: string, i: number) => <li key={i} style={{ marginBottom: '0.5rem' }}>{c}</li>)}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
