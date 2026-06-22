import { api } from './axios'

export interface AnalysisResponse {
  common_models: string[];
  common_datasets: string[];
  research_trends: string[];
}

export interface ComparisonResponse {
  papers: string[];
  comparison: {
    dataset: Record<string, string>;
    model: Record<string, string>;
    accuracy: Record<string, string>;
    methodology: Record<string, string>;
    limitations: Record<string, string>;
  };
}

export interface GlobalChatResponse {
  answer: string;
  sources: string[];
}

export interface GapResponse {
  gap: string;
  reason: string;
}

export interface GapsListResponse {
  gaps: GapResponse[];
}

export interface LiteratureReviewResponse {
  introduction: string;
  existing_methods: string;
  challenges: string;
  future_directions: string;
  conclusion: string;
}

export interface CitationIntelligenceResponse {
  top_papers: string[];
  top_models: string[];
  top_datasets: string[];
}

export interface PeerReviewResponse {
  scores: {
    novelty: number;
    methodology: number;
    clarity: number;
  };
  critiques: string[];
  improvements: string[];
  overall_decision: string;
}

export const researchApi = {
  globalChat: async (data: { paper_ids: string[]; question: string }): Promise<GlobalChatResponse> => {
    const response = await api.post('/api/research/global-chat', data)
    return response.data
  },

  webSearch: async (data: { question: string, paper_id?: string }): Promise<GlobalChatResponse> => {
    const response = await api.post('/api/research/web-search', data)
    return response.data
  },

  analyze: async (data: { paper_ids: string[] }): Promise<AnalysisResponse> => {
    const response = await api.post('/api/research/analyze', data)
    return response.data
  },

  compare: async (data: { paper_ids: string[] }): Promise<ComparisonResponse> => {
    const response = await api.post('/api/research/compare', data)
    return response.data
  },

  detectGaps: async (data: { paper_ids: string[] }): Promise<GapsListResponse> => {
    const response = await api.post('/api/research/gaps', data)
    return response.data
  },

  generateLiteratureReview: async (data: { paper_ids: string[] }): Promise<LiteratureReviewResponse> => {
    const response = await api.post('/api/research/literature-review', data)
    return response.data
  },

  generatePeerReview: async (data: { paper_id: string }): Promise<PeerReviewResponse> => {
    const response = await api.post('/api/research/peer-review', data)
    return response.data
  },

  translateText: async (data: { text: string, target_language: string }): Promise<{ translated_text: string }> => {
    const response = await api.post('/api/research/translate', data)
    return response.data
  },

  getCitationIntelligence: async (): Promise<CitationIntelligenceResponse> => {
    const response = await api.get('/api/research/citation-intelligence')
    return response.data
  },

  searchArxiv: async (query: string, limit: number = 10): Promise<ArxivPaper[]> => {
    const response = await api.get(`/api/research/arxiv/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  },

  getArxivRecommendations: async (): Promise<ArxivPaper[]> => {
    const response = await api.get('/api/research/arxiv/recommendations')
    return response.data
  },

  importArxivPaper: async (data: { url: string; title: string }): Promise<any> => {
    const response = await api.post('/api/research/arxiv/import', data)
    return response.data
  },

  generatePodcast: async (data: { paper_ids: string[] }): Promise<Blob> => {
    const response = await api.post('/api/research/podcast', data, { responseType: 'blob' })
    return response.data
  },

  shareDashboard: async (data: { snapshot_data: any }): Promise<{ share_id: string }> => {
    const response = await api.post('/api/research/share', data)
    return response.data
  },

  getSharedDashboard: async (id: string): Promise<{ snapshot_data: any, created_at: string }> => {
    const response = await api.get(`/api/research/share/${id}`)
    return response.data
  }
}

export interface ArxivPaper {
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdf_url: string;
}
