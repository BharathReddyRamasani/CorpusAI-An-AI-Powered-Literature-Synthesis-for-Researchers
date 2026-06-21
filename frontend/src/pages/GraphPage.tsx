import React from 'react'
import { motion } from 'framer-motion'
import { KnowledgeGraph } from '../components/graph/KnowledgeGraph'

const GraphPage = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}
        >
          Research Knowledge Graph
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-secondary)', margin: 0 }}
        >
          Explore the citation networks and relationships between your uploaded papers and external research.
        </motion.p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ flex: 1, minHeight: 0 }}
      >
        <KnowledgeGraph />
      </motion.div>
    </div>
  )
}

export default GraphPage
