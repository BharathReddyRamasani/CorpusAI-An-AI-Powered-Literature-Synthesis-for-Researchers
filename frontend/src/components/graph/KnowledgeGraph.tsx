import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d'
import { Spinner } from '../ui/Spinner'
import { api } from '../../api/axios'
import { GlowCard } from '../ui/GlowCard'

interface GraphNode {
  id: string
  name: string
  group: number
  val: number
}

interface GraphLink {
  source: any
  target: any
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export const KnowledgeGraph: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const graphRef = useRef<ForceGraphMethods>()

  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>())
  const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>())

  // Fetch graph data
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/graph')
        setData(response.data)
      } catch (err) {
        console.error("Failed to load knowledge graph", err)
        setError("Failed to load knowledge graph. Please make sure you have uploaded some papers.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchGraph()
  }, [])

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 600
        })
      }
    }
    
    window.addEventListener('resize', updateDimensions)
    setTimeout(updateDimensions, 100)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  const handleEngineStop = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50)
    }
  }, [])

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    highlightNodes.clear()
    highlightLinks.clear()

    if (node && data) {
      highlightNodes.add(node.id)
      data.links.forEach(link => {
        // link.source/target are objects after initialization by force-graph
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target
        
        if (sourceId === node.id || targetId === node.id) {
          highlightLinks.add(link)
          highlightNodes.add(sourceId)
          highlightNodes.add(targetId)
        }
      })
    }

    setHoverNode(node)
    setHighlightNodes(new Set(highlightNodes))
    setHighlightLinks(new Set(highlightLinks))
  }, [data])

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHovered = node.id === hoverNode?.id
    const isHighlighted = highlightNodes.has(node.id)
    const isDimmed = hoverNode && !isHighlighted

    // Colors
    const primaryColor = node.group === 1 ? '#3b82f6' : '#9ca3af'
    
    // Draw Glow for highlighted nodes
    if (isHighlighted || isHovered) {
      ctx.beginPath()
      const glowSize = Math.max(node.val || 1, 4) * 1.5 + 4
      ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI, false)
      ctx.fillStyle = node.group === 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(156, 163, 175, 0.4)'
      ctx.fill()
    }

    // Draw core node
    ctx.beginPath()
    const nodeSize = Math.max(node.val || 1, 4)
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false)
    ctx.fillStyle = isDimmed ? 'rgba(100, 116, 139, 0.2)' : primaryColor
    ctx.fill()

    // Draw label if hovered or highlighted or if it's a main paper node
    if (isHovered || isHighlighted || node.group === 1) {
      const fontSize = 12 / globalScale
      ctx.font = `${fontSize}px Sans-Serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const labelOffset = Math.max(node.val || 1, 4) + fontSize
      ctx.fillText(node.name, node.x, node.y + labelOffset)
    }
  }, [hoverNode, highlightNodes])

  if (loading) {
    return (
      <GlowCard className="p-16 flex flex-col items-center justify-center min-h-[600px]">
        <Spinner size="lg" />
        <p className="mt-4 text-[var(--color-text-secondary)]">Analyzing relationships...</p>
      </GlowCard>
    )
  }

  if (error || !data || data.nodes.length === 0) {
    return (
      <GlowCard className="p-16 text-center min-h-[600px] flex flex-col justify-center">
        <h3 className="text-[var(--color-text-primary)] mb-4 text-xl">No Data Available</h3>
        <p className="text-[var(--color-text-secondary)]">{error || "Upload some papers to see their citation relationships here."}</p>
      </GlowCard>
    )
  }

  return (
    <GlowCard 
      className="p-0 overflow-hidden flex flex-col h-full min-h-[600px] relative border-[var(--color-border)]"
      glowColor="color-mix(in srgb, var(--color-accent) 20%, transparent)"
    >
      <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]/50 backdrop-blur-md absolute top-0 left-0 w-full z-10 pointer-events-none">
        <h2 className="m-0 text-xl font-bold text-[var(--color-text-primary)]">
          Interactive Knowledge Graph
        </h2>
        <p className="m-0 mt-2 text-[var(--color-text-secondary)] text-sm">
          Drag nodes to explore connections. Blue nodes are your uploaded papers, gray nodes are external citations.
        </p>
      </div>
      
      <div ref={containerRef} className="flex-1 w-full bg-[var(--color-surface)] cursor-grab active:cursor-grabbing">
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel={() => ''} // Handled by custom painter
          nodeRelSize={4}
          linkColor={(link: any) => highlightLinks.has(link) ? 'rgba(59, 130, 246, 0.8)' : 'rgba(100, 116, 139, 0.4)'}
          linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
          linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
          linkDirectionalParticleWidth={3}
          linkDirectionalParticleColor={() => '#60a5fa'}
          onNodeHover={handleNodeHover}
          nodeCanvasObject={paintNode}
          onEngineStop={handleEngineStop}
          backgroundColor="transparent"
          d3VelocityDecay={0.3}
        />
      </div>
    </GlowCard>
  )
}
