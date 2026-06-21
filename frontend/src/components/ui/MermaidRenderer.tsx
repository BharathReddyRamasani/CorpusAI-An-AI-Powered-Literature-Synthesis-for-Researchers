import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#f8fafc',
    primaryTextColor: '#0f172a',
    primaryBorderColor: '#cbd5e1',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#e2e8f0',
  },
  securityLevel: 'loose',
});

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      try {
        if (!chart) return;
        
        // Sanitize common LLM Mermaid syntax errors (e.g., "-->|text|>" to "-->|text|")
        const sanitizedChart = chart.replace(/-->\|([^|]+)\|>/g, '-->|$1|');

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, sanitizedChart);
        setSvgContent(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 my-4">
        <p className="text-sm font-semibold mb-1">Diagram Error</p>
        <pre className="text-xs overflow-auto">{chart}</pre>
      </div>
    );
  }

  if (!svgContent) {
    return <div className="p-4 my-4 animate-pulse bg-[var(--color-surface)] rounded-lg h-32" />;
  }

  return (
    <div 
      className="flex justify-start md:justify-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] my-4 overflow-x-auto shadow-sm [&>svg]:min-w-max [&>svg]:max-w-none"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
