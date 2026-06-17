import { api } from './axios'

export interface Report {
  id: number;
  paper_id: string;
  report_path: string;
  format: string;
  created_at: string;
}

export interface ReportsResponse {
  success: boolean;
  total: number;
  reports: Report[];
}

export interface GenerateReportResponse {
  success: boolean;
  message: string;
  paper_id: string;
  report_id: number;
  format: string;
  download_url: string;
}

export interface DashboardStats {
  total_papers: number;
  ready_papers: number;
  processing_papers: number;
  total_reports: number;
  total_qa_interactions: number;
  recent_papers: Array<{
    paper_id: string;
    title: string;
    status: string;
    upload_date: string;
  }>;
}

export const reportsApi = {
  listReports: async (): Promise<ReportsResponse> => {
    const response = await api.get('/api/reports')
    return response.data
  },

  generateReport: async (paperId: string, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> => {
    const response = await api.post(`/api/papers/${paperId}/report`, { format }, { responseType: 'blob' })
    return response.data
  },

  getDashboard: async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await api.get('/api/dashboard')
    return response.data
  }
}
