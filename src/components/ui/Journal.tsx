import React, { useState } from 'react'
import useGameStore from '../../store'
import { useGlobalAudio } from '../audio/GlobalAudio'

// Placeholder for now, can be improved with assets
// Book aesthetic: Paper background, typewriter font.

const Journal = ({ onClose }: { onClose: () => void }) => {
    const { journalEntries, unlockedMemories } = useGameStore()
    const [page, setPage] = useState(0)
    const [activeTab, setActiveTab] = useState<'ENTRIES' | 'MEMORIES'>('ENTRIES')
    const playAudio = useGlobalAudio()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}>

            {/* Journal Book Container - Responsive */}
            <div className="relative w-full max-w-[900px] h-full max-h-[600px] bg-[#fdf5e6] rounded shadow-2xl overflow-hidden flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}>

                {/* Spiral / Binding - Hidden on mobile or adjusted */}
                <div className="absolute left-1/2 top-4 bottom-4 w-4 bg-[#d0c0a0] rounded-full z-10 -translate-x-1/2 shadow-inner border border-[#b0a080] hidden md:block"></div>

                {/* Left Page (Index / List) */}
                <div className="flex-1 p-4 md:p-8 md:pr-12 bg-[url('/assets/paper-texture.png')] bg-cover border-b md:border-b-0 md:border-r border-[#e0d0b0] overflow-y-auto">
                    <h2 className="text-2xl md:text-3xl font-serif text-[#4a4036] mb-4 md:mb-6 border-b-2 border-[#4a4036] pb-2">Journal</h2>

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-4 md:mb-6 text-[#5a5046] font-bold font-mono text-sm md:text-base">
                        <button
                            className={`hover:text-[#8a7060] ${activeTab === 'ENTRIES' ? 'underline decoration-2' : 'opacity-50'}`}
                            onClick={() => { setActiveTab('ENTRIES'); setPage(0); }}
                        >
                            Log
                        </button>
                        <button
                            className={`hover:text-[#8a7060] ${activeTab === 'MEMORIES' ? 'underline decoration-2' : 'opacity-50'}`}
                            onClick={() => { setActiveTab('MEMORIES'); setPage(0); }}
                        >
                            Memories
                        </button>
                    </div>

                    <ul className="space-y-2 md:space-y-3 font-serif text-[#4a4036] text-sm md:text-base">
                        {activeTab === 'ENTRIES' && journalEntries.map((entry, idx) => (
                            <li key={entry.id}
                                className={`cursor-pointer hover:bg-[#efe5d6] p-2 rounded ${idx === page ? 'bg-[#efe5d6] font-bold' : ''}`}
                                onClick={() => setPage(idx)}
                            >
                                <span className="text-xs md:text-sm opacity-60 mr-2 block md:inline">{entry.date}</span>
                                {entry.title}
                            </li>
                        ))}
                        {activeTab === 'MEMORIES' && unlockedMemories.map((memId, idx) => (
                            <li key={memId}
                                className={`cursor-pointer hover:bg-[#efe5d6] p-2 rounded ${idx === page ? 'bg-[#efe5d6] font-bold' : ''}`}
                                onClick={() => { setPage(idx); playAudio(memId) }}
                            >
                                Audio Log #{idx + 1}: {memId}
                            </li>
                        ))}
                        {activeTab === 'ENTRIES' && journalEntries.length === 0 && (
                            <li className="italic opacity-50">No entries yet... explore to write.</li>
                        )}
                        {activeTab === 'MEMORIES' && unlockedMemories.length === 0 && (
                            <li className="italic opacity-50">Find Memory Orbs to unlock logs.</li>
                        )}
                    </ul>
                </div>

                {/* Right Page (Content) */}
                <div className="flex-1 p-4 md:p-8 md:pl-12 bg-[url('/assets/paper-texture.png')] bg-cover grid content-start overflow-y-auto">
                    {activeTab === 'ENTRIES' && journalEntries[page] && (
                        <div className="animate-in fade-in duration-500">
                            <div className="w-full h-32 md:h-48 bg-[#e8e0d0] mb-4 md:mb-6 flex items-center justify-center border-2 border-dashed border-[#c0b090] rounded rotate-1 shadow-sm">
                                {/* Placeholder for "Sketch" */}
                                <span className="font-handwriting text-xl md:text-2xl text-[#a09070] opacity-50 transform -rotate-6 text-center px-2">Sketch of {journalEntries[page].title}</span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-serif text-[#2a2016] mb-2 md:mb-4">{journalEntries[page].title}</h3>
                            <p className="font-handwriting text-lg md:text-xl text-[#4a4036] leading-relaxed">
                                {journalEntries[page].description}
                            </p>

                            {/* Stickers */}
                            <div className="mt-4 md:mt-8 flex gap-2 flex-wrap">
                                {journalEntries[page].stickers.map(s => (
                                    <div key={s} className="w-10 h-10 md:w-12 md:h-12 bg-yellow-200 rounded-full flex items-center justify-center shadow-md rotate-12 border-2 border-white text-lg md:text-xl">
                                        ⭐
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Corner Close */}
                <button
                    className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 flex items-center justify-center text-[#4a4036] bg-[#fdf5e6]/50 hover:bg-[#efe5d6] rounded-full font-bold z-20"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

export default Journal
