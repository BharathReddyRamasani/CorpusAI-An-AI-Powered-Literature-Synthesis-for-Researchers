import { api } from './axios'

export interface ChatMessage {
  id: number;
  paper_id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  paper_id: string;
  total: number;
  history: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  paper_id: string;
  question: string;
  answer: string;
  sources: string[];
}

export const chatApi = {
  getHistory: async (paperId: string): Promise<ChatHistoryResponse> => {
    const response = await api.get(`/api/chat/${paperId}/history`)
    return response.data
  },

  askQuestion: async (data: { paper_id: string; question: string }): Promise<ChatResponse> => {
    const response = await api.post('/api/chat', data)
    return response.data
  },

  askSectionQuestion: async (data: { paper_id: string; section: string; question: string }): Promise<ChatResponse> => {
    const response = await api.post('/api/chat/section', data)
    return response.data
  }
}
