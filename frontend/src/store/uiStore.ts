import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean;
  chatOpen: boolean;
  selectedPaperIdForChat: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
  openChatForPaper: (paperId: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true, // Default open on desktop
  chatOpen: false,
  selectedPaperIdForChat: null,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  openChatForPaper: (paperId) => set({ chatOpen: true, selectedPaperIdForChat: paperId }),
}))
