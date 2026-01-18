import React from 'react'
import { useUIStore } from '../../stores/uiStore'

export const SystemMenu: React.FC = () => {
    const { isSystemMenuOpen, toggleSystemMenu } = useUIStore()

    if (!isSystemMenuOpen) return null

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleSystemMenu}>
            <div
                className="bg-cozy-beige w-full max-w-md p-8 rounded-xl border-4 border-cozy-text shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cozy-text font-serif">System Settings</h2>
                    <button onClick={toggleSystemMenu} className="text-2xl font-bold text-cozy-text hover:text-cozy-orange">✕</button>
                </div>

                <div className="space-y-6">
                    {/* Audio Settings */}
                    <div className="space-y-2">
                        <label className="block font-bold text-cozy-text">Master Volume</label>
                        <input
                            type="range"
                            className="w-full accent-cozy-orange"
                            title="Master Volume"
                            aria-label="Master Volume"
                        />
                    </div>

                    {/* Graphics Settings */}
                    <div className="space-y-2">
                        <label className="block font-bold text-cozy-text">Graphics Quality</label>
                        <div className="flex gap-2">
                            <button className="flex-1 py-1 px-3 bg-white border-2 border-cozy-orange rounded text-cozy-orange font-bold hover:bg-cozy-orange hover:text-white transition-colors">Low</button>
                            <button className="flex-1 py-1 px-3 bg-cozy-orange text-white border-2 border-cozy-orange rounded font-bold shadow-inner">High</button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-300">
                        <p className="text-xs text-center text-gray-500">v1.0.0 - Cozy Portfolio</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
