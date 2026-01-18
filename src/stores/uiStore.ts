import { create } from 'zustand'

export interface ModalContent {
    title: string
    subtitle?: string
    description: string
    tags?: string[]
    image?: string
    links?: { label: string, url: string }[]
    type?: 'PROJECT' | 'EXPERIENCE' | 'GENERIC' | 'CONTACT'
}

interface UIState {
    isModalOpen: boolean
    modalContent: ModalContent | null
    openModal: (content: ModalContent) => void
    closeModal: () => void

    isSkillsMenuOpen: boolean
    toggleSkillsMenu: () => void

    isSystemMenuOpen: boolean
    toggleSystemMenu: () => void

    isJournalOpen: boolean
    toggleJournal: () => void

    isProjectModalOpen: boolean
    toggleProjectModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isModalOpen: false,
    modalContent: null,
    openModal: (content) => set({ isModalOpen: true, modalContent: content }),
    closeModal: () => set({ isModalOpen: false, modalContent: null }),

    isSkillsMenuOpen: false,
    toggleSkillsMenu: () => set((state) => ({ isSkillsMenuOpen: !state.isSkillsMenuOpen })),

    isSystemMenuOpen: false,
    toggleSystemMenu: () => set((state) => ({ isSystemMenuOpen: !state.isSystemMenuOpen })),

    isJournalOpen: false,
    toggleJournal: () => set((state) => ({ isJournalOpen: !state.isJournalOpen })),

    isProjectModalOpen: false,
    toggleProjectModal: () => set((state) => ({ isProjectModalOpen: !state.isProjectModalOpen })),
}))
