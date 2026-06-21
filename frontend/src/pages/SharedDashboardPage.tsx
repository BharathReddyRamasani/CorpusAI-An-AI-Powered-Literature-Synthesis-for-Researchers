import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { researchApi } from '../api/research';
import { Card } from '../components/ui/Card';
import { FileText, Activity, FileOutput, MessageSquare, ArrowLeft } from 'lucide-react';

const SharedDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      researchApi.getSharedDashboard(id).then(res => {
        setData(res);
      }).catch(err => {
        setError(true);
      });
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
        <Card className="p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileOutput size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Dashboard Not Found</h2>
          <p className="text-[var(--color-text-secondary)] mb-8">This dashboard link is invalid, expired, or you do not have permission to view it.</p>
          <Link to="/" className="text-[var(--color-primary)] font-semibold hover:underline">
            Return Home
          </Link>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading dashboard snapshot...</p>
        </div>
      </div>
    );
  }

  const stats = data.snapshot_data;

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6 md:p-10">
      <div className="max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-8 group transition-colors">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Powered by Corpus AI
        </Link>
        
        <div className="mb-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] p-8 rounded-[24px] text-white shadow-xl">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-3">Public Research Dashboard</h1>
          <p className="opacity-90 text-lg">Snapshot published on {new Date(data.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 bg-[var(--color-surface)] border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)] mb-4 font-medium text-sm uppercase tracking-wider">
              <div className="p-2 bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)] rounded-lg"><FileText size={18}/></div>
              Total Papers
            </div>
            <div className="text-4xl font-display font-bold text-[var(--color-text-primary)]">{stats.total_papers || 0}</div>
          </Card>
          
          <Card className="p-6 bg-[var(--color-surface)] border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)] mb-4 font-medium text-sm uppercase tracking-wider">
              <div className="p-2 bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent)] rounded-lg"><Activity size={18}/></div>
              Ready Papers
            </div>
            <div className="text-4xl font-display font-bold text-[var(--color-text-primary)]">{stats.ready_papers || 0}</div>
          </Card>

          <Card className="p-6 bg-[var(--color-surface)] border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)] mb-4 font-medium text-sm uppercase tracking-wider">
              <div className="p-2 bg-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] text-[var(--color-secondary)] rounded-lg"><FileOutput size={18}/></div>
              Reports
            </div>
            <div className="text-4xl font-display font-bold text-[var(--color-text-primary)]">{stats.total_reports || 0}</div>
          </Card>

          <Card className="p-6 bg-[var(--color-surface)] border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)] mb-4 font-medium text-sm uppercase tracking-wider">
              <div className="p-2 bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)] rounded-lg"><MessageSquare size={18}/></div>
              Q&A
            </div>
            <div className="text-4xl font-display font-bold text-[var(--color-text-primary)]">{stats.total_qa_interactions || 0}</div>
          </Card>
        </div>

        {stats.recent_papers && stats.recent_papers.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)] mb-6">Recent Additions</h2>
            <Card className="overflow-hidden border-none shadow-sm p-0">
              <div className="divide-y divide-[var(--color-border)]">
                {stats.recent_papers.map((paper: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-5 hover:bg-[var(--color-background-secondary)] transition-colors">
                    <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shrink-0">
                      <FileText size={20} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1 text-base">{paper.title || 'Untitled Paper'}</h4>
                      <p className="text-sm text-[var(--color-text-secondary)]">Uploaded {new Date(paper.upload_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedDashboardPage;
