import React, { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const BESTIARY_ENTRIES = [
    { id: 'enemy_grunt', name: 'Security Grunt', description: 'Standard private security. Weak but works in groups.', type: 'Humanoid', unlocked: true },
    { id: 'enemy_drone', name: 'Seeker Drone', description: 'Surveillance drone equipped with a taser.', type: 'Mechanical', unlocked: true },
    { id: 'enemy_boss', name: 'Sector Warden', description: 'Heavily armored boss unit.', type: 'Boss', unlocked: false },
    { id: 'lore_pfiso', name: 'PFISO Protocol', description: 'The Para-Fidelity ISO standard governing this facility.', type: 'Lore', unlocked: true },
];

export const BestiaryUI: React.FC = () => {
    const [selectedEntry, setSelectedEntry] = useState<typeof BESTIARY_ENTRIES[0] | null>(null);

    return (
        <div className="flex h-full gap-4 text-white">
            {/* List */}
            <div className="w-1/3 p-4 bg-zinc-900/50 rounded-lg overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Codex</h2>
                <div className="flex flex-col gap-2">
                    {BESTIARY_ENTRIES.map(entry => (
                        <button
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            disabled={!entry.unlocked}
                            className={`p-3 rounded text-left transition-colors flex justify-between items-center ${selectedEntry?.id === entry.id ? 'bg-orange-500 text-black' : 'bg-black/40 hover:bg-white/10'
                                } ${!entry.unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="font-mono">{entry.unlocked ? entry.name : '???'}</span>
                            <span className="text-xs opacity-70">{entry.type}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* details */}
            <div className="flex-1 p-6 bg-black/80 rounded-lg border border-white/10 flex flex-col">
                <AnimatePresence mode='wait'>
                    {selectedEntry ? (
                        <motion.div
                            key={selectedEntry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h1 className="text-3xl font-bold mb-2 text-orange-500">{selectedEntry.name}</h1>
                            <div className="text-sm uppercase tracking-widest opacity-60 mb-6">{selectedEntry.type}</div>

                            <div className="h-[200px] bg-zinc-800 rounded mb-6 flex items-center justify-center border border-white/5">
                                <span className="text-zinc-600 italic">Image Data Corrupted</span>
                            </div>

                            <p className="leading-relaxed text-lg text-zinc-300">
                                {selectedEntry.description}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-500 italic">
                            Select an entry to decrypt...
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
