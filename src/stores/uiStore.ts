import { create } from 'zustand'

export interface ModalContent {
    title: string
    subtitle?: string
    description: string
    tags?: string[]
    image?: string
    links?: { label: string, url: string }[]
    video?: string
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

    // SYS-035: Subtitles
    subtitle: string | null
    subtitleDuration: number
    showSubtitle: (text: string, duration?: number) => void

    // UX-010: HUD Clutter Fade
    hudOpacity: number
    setHudOpacity: (val: number) => void

    // UX-013: Interaction Progress
    interactionProgress: number // 0 to 1
    setInteractionProgress: (val: number) => void

    // UX-017
    hasSeenBootSplash: boolean
    setHasSeenBootSplash: (val: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    isModalOpen: false,
    modalContent: null,

    // SYS-035: Init
    subtitle: null,
    subtitleDuration: 3000,
    showSubtitle: (text: string, duration = 3000) => set({ subtitle: text, subtitleDuration: duration }),

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

    // UX-010
    hudOpacity: 1.0,
    setHudOpacity: (val) => set({ hudOpacity: val }),

    // UX-013
    interactionProgress: 0,
    setInteractionProgress: (val) => set({ interactionProgress: val }),

    // UX-017: Boot Splash
    hasSeenBootSplash: false,
    setHasSeenBootSplash: (val: boolean) => set({ hasSeenBootSplash: val })
}))
