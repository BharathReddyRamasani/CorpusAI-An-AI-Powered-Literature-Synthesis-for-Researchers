import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, ChevronRight, Activity, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { papersApi, Paper } from '../api/papers';
import { UploadDropzone } from '../components/papers/UploadDropzone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/cn';

// ── Skeleton for the table ──────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="flex flex-col divide-y divide-[var(--color-border)]">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
          <Skeleton className="skeleton h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="skeleton h-4 w-3/4" />
        </div>
        <div className="col-span-4 hidden md:block">
          <Skeleton className="skeleton h-3 w-1/2" />
        </div>
        <div className="col-span-3">
          <Skeleton className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="col-span-3 lg:col-span-1 flex justify-end">
          <Skeleton className="skeleton h-3 w-12" />
        </div>
      </div>
    ))}
  </div>
);

// ── Stagger variants ────────────────────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const PapersPage = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPapers = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await papersApi.listPapers({ search: debouncedSearch });
      setPapers(res?.papers ?? res?.data?.papers ?? []);
    } catch (error: any) {
      toast.error('Failed to load papers');
      setPapers([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchPapers(true);
  }, [fetchPapers]);

  useEffect(() => {
    const processingPapers = papers.filter(p => p.status === 'processing' || p.status === 'pending');
    if (processingPapers.length === 0) return;

    const interval = setInterval(() => fetchPapers(false), 5000);
    return () => clearInterval(interval);
  }, [papers, fetchPapers]);

  const handleUpload = async (file: File) => {
    try {
      await papersApi.uploadPaper(file);
      toast.success('Paper uploaded! Processing started.');
      await fetchPapers(false);
      setShowUpload(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload paper');
    }
  };

  const handleUploadText = async (title: string, content: string) => {
    try {
      await papersApi.uploadText(title, content);
      toast.success('Text uploaded! Processing started.');
      await fetchPapers(false);
      setShowUpload(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to process text');
    }
  };

  const handleUploadUrl = async (url: string) => {
    try {
      await papersApi.uploadUrl(url);
      toast.success('Webpage downloaded! Processing started.');
      await fetchPapers(false);
      setShowUpload(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to download webpage');
    }
  };

  const selectedPaper = papers.find(p => p.paper_id === selectedPaperId);

  return (
    <div className="flex min-h-full w-full bg-[var(--color-background)]">
      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <motion.div
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        className={cn(
          "flex-1 flex flex-col min-h-full",
          selectedPaperId ? "lg:w-[65%]" : "w-full"
        )}
      >
        <div className="p-6 md:p-8 flex flex-col min-h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 shrink-0">
            <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-1">
                My Papers
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[15px]">
                Manage and interact with your uploaded research material.
              </p>
            </motion.div>
            <motion.div initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <Button onClick={() => setShowUpload(!showUpload)} size="lg" variant={showUpload ? 'secondary' : 'primary'} className="shadow-md shadow-[var(--color-primary)]/20">
                <Plus size={18} className={cn("mr-2 transition-transform duration-300", showUpload && "rotate-45")} />
                {showUpload ? 'Cancel' : 'Upload File'}
              </Button>
            </motion.div>
          </div>

          {/* Upload Dropzone Dropdown */}
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-8 shrink-0 overflow-hidden"
              >
                <div className="p-1 rounded-[24px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] opacity-90 shadow-xl">
                  <Card className="p-1 border-0 bg-[var(--color-surface)]/95 backdrop-blur">
                    <UploadDropzone onUpload={handleUpload} onUploadText={handleUploadText} onUploadUrl={handleUploadUrl} />
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar */}
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="mb-6 max-w-md shrink-0">
            <Input
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              className="bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm rounded-full px-5"
            />
          </motion.div>

          {/* Table Container */}
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[24px] overflow-hidden flex flex-col shadow-sm"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)] text-[12px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] sticky top-0 z-10">
              <div className="col-span-6 md:col-span-5 pl-2">Title</div>
              <div className="col-span-4 hidden md:block">Authors</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-3 lg:col-span-1 text-right pr-2">Date</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {loading ? (
                <TableSkeleton />
              ) : papers.length === 0 ? (
                <div className="py-20 h-full flex items-center justify-center">
                  <EmptyState
                    icon={<FileText size={32} />}
                    title="No papers found"
                    description={search ? "We couldn't find any papers matching your search criteria." : "You haven't uploaded any research papers yet. Get started by uploading your first PDF."}
                  />
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col divide-y divide-[var(--color-border)]">
                  {papers.map((paper) => (
                    <motion.div
                      key={paper.paper_id}
                      variants={fadeUp}
                      onClick={() => setSelectedPaperId(selectedPaperId === paper.paper_id ? null : paper.paper_id)}
                      className={cn(
                        "grid grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors duration-200 group",
                        selectedPaperId === paper.paper_id
                          ? "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                          : "hover:bg-[var(--color-background-secondary)]"
                      )}
                    >
                      {/* Title col */}
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3 pl-2 min-w-0">
                        <div className={cn(
                          "p-2 rounded-[10px] transition-colors shrink-0",
                          selectedPaperId === paper.paper_id
                            ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                            : "bg-[color-mix(in_srgb,var(--color-text-secondary)_10%,transparent)] text-[var(--color-text-secondary)] group-hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] group-hover:text-[var(--color-primary)]"
                        )}>
                          <FileText size={16} />
                        </div>
                        <span className={cn(
                          "font-semibold text-sm truncate",
                          selectedPaperId === paper.paper_id ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"
                        )} title={paper.title || paper.filename}>
                          {paper.title || paper.filename}
                        </span>
                      </div>

                      {/* Authors col */}
                      <div className="col-span-4 hidden md:block text-[13px] text-[var(--color-text-secondary)] truncate" title={paper.authors || 'Unknown'}>
                        {paper.authors || 'Unknown'}
                      </div>

                      {/* Status col */}
                      <div className="col-span-3">
                        <Badge variant={paper.status === 'ready' ? 'success' : paper.status === 'failed' ? 'danger' : 'warning'}>
                          {paper.status === 'ready' ? 'Ready' : paper.status === 'failed' ? 'Failed' : 'Processing'}
                        </Badge>
                      </div>

                      {/* Date col */}
                      <div className="col-span-3 lg:col-span-1 text-right pr-2 text-[13px] text-[var(--color-text-secondary)] font-medium">
                        {new Date(paper.upload_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Side Metadata Panel — slides in ────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedPaperId && selectedPaper && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden lg:flex w-[35%] border-l border-[var(--color-border)] bg-[var(--color-surface)] flex-col h-[calc(100vh-64px)] sticky top-0 shadow-2xl z-20"
          >
            <div className="p-8 flex flex-col h-full overflow-y-auto">
              {/* Close Button */}
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]">
                  <FileText size={28} />
                </div>
                <button
                  onClick={() => setSelectedPaperId(null)}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-background-secondary)] transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              {/* Title & Meta */}
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-primary)] mb-3 leading-normal break-words">
                  {selectedPaper.title || selectedPaper.filename}
                </h2>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {selectedPaper.authors || 'Unknown Authors'}
                </p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[var(--color-background-secondary)] rounded-[16px] p-4 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Status</span>
                  <div>
                    <Badge variant={selectedPaper.status === 'ready' ? 'success' : 'warning'}>
                      {selectedPaper.status === 'ready' ? 'Ready' : 'Processing'}
                    </Badge>
                  </div>
                </div>
                <div className="bg-[var(--color-background-secondary)] rounded-[16px] p-4 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Size</span>
                  <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                    {selectedPaper.file_size ? `${(selectedPaper.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                  </span>
                </div>
                <div className="col-span-2 bg-[var(--color-background-secondary)] rounded-[16px] p-4 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">Upload Date</span>
                  <span className="font-semibold text-[var(--color-text-primary)] text-sm">
                    {new Date(selectedPaper.upload_date).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-6 space-y-3 border-t border-[var(--color-border)]">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-between group"
                  onClick={() => navigate(`/papers/${selectedPaper.paper_id}`)}
                  disabled={selectedPaper.status !== 'ready'}
                >
                  <span className="flex items-center gap-2">
                    <Activity size={18} />
                    Explore Analysis
                  </span>
                  <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  Download Original File
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PapersPage;
