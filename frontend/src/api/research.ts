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

export const researchApi = {
  globalChat: async (data: { paper_ids: string[]; question: string }): Promise<GlobalChatResponse> => {
    const response = await api.post('/api/research/global-chat', data)
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

  getCitationIntelligence: async (): Promise<CitationIntelligenceResponse> => {
    const response = await api.get('/api/research/citation-intelligence')
    return response.data
  }
}
