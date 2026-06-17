import { api } from './axios'

export interface Paper {
  paper_id: string;
  user_id: number;
  filename: string;
  title: string | null;
  authors: string | null;
  abstract: string | null;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  upload_date: string;
}

export interface PaperDetail extends Paper {
  full_text: string | null;
}

export interface PapersResponse {
  success: boolean;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  papers: Paper[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  paper_id: string;
  filename: string;
  status: string;
}

export interface Summary {
  id: number;
  paper_id: string;
  summary: string;
  created_at: string;
}

export interface Citation {
  id: number;
  paper_id: string;
  author: string | null;
  year: string | null;
  title: string | null;
  raw_text: string | null;
}

export const papersApi = {
  listPapers: async (params?: { page?: number; page_size?: number; search?: string; sort_by?: string; sort_order?: string }): Promise<PapersResponse> => {
    const response = await api.get('/api/papers', { params })
    return response.data
  },

  getPaper: async (id: string): Promise<PaperDetail> => {
    const response = await api.get(`/api/papers/${id}`)
    return response.data
  },

  uploadPaper: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/papers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getSummary: async (id: string): Promise<{ success: boolean; paper_id: string; summary: Summary }> => {
    const response = await api.get(`/api/papers/${id}/summary`)
    return response.data
  },

  getCitations: async (id: string): Promise<{ success: boolean; paper_id: string; total_citations: number; citations: Citation[] }> => {
    const response = await api.get(`/api/papers/${id}/citations`)
    return response.data
  },

  getInsights: async (id: string): Promise<any> => {
    const response = await api.get(`/api/papers/${id}/insights`)
    return response.data
  },

  getVisualizations: async (id: string): Promise<any> => {
    const response = await api.get(`/api/papers/${id}/visualizations`)
    return response.data
  },

  getFlashcards: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/papers/${id}/flashcards`)
    return response.data
  },

  getQuiz: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/papers/${id}/quiz`)
    return response.data
  }
}
