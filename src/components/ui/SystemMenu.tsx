import React from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'

export const SystemMenu: React.FC = () => {
    const { isSystemMenuOpen, toggleSystemMenu } = useUIStore()
    const settings = useSettingsStore()

    if (!isSystemMenuOpen) return null

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleSystemMenu}>
            <div
                className="bg-cozy-bg w-full max-w-md p-8 rounded-xl border-4 border-cozy-text shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cozy-text font-serif">System Settings</h2>
                    <button onClick={toggleSystemMenu} className="text-2xl font-bold text-cozy-text hover:text-cozy-accent">✕</button>
                </div>

                <div className="space-y-6">
                    {/* Audio Settings */}
                    <div className="space-y-2">
                        <label className="block font-bold text-cozy-text">Master Volume</label>
                        <input
                            type="range"
                            min="0" max="1" step="0.1"
                            value={settings.masterVolume}
                            onChange={(e) => settings.setMasterVolume(parseFloat(e.target.value))}
                            className="w-full accent-cozy-accent"
                            title="Master Volume"
                            aria-label="Master Volume"
                        />
                    </div>

                    {/* Camera Tuning - Moved from Leva */}
                    <div className="space-y-4 pt-4 border-t border-cozy-primary">
                         <h3 className="font-bold text-cozy-text">Camera Tuning</h3>

                         <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Distance</span>
                                <span>{settings.camDistance.toFixed(1)}m</span>
                            </label>
                            <input
                                type="range"
                                min="2" max="20" step="0.5"
                                value={settings.camDistance}
                                onChange={(e) => settings.setCamDistance(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                         </div>

                         <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Sensitivity</span>
                                <span>{settings.camSensitivity.toFixed(1)}x</span>
                            </label>
                            <input
                                type="range"
                                min="0.1" max="5.0" step="0.1"
                                value={settings.camSensitivity}
                                onChange={(e) => settings.setCamSensitivity(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                         </div>

                         <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Damping (Smoothness)</span>
                                <span>{settings.camDamping.toFixed(0)}</span>
                            </label>
                            <input
                                type="range"
                                min="1" max="50" step="1"
                                value={settings.camDamping}
                                onChange={(e) => settings.setCamDamping(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                         </div>

                         <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Look Ahead</span>
                                <span>{settings.camLookAhead.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0" max="2" step="0.1"
                                value={settings.camLookAhead}
                                onChange={(e) => settings.setCamLookAhead(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                         </div>
                    </div>

                    {/* Graphics Settings */}
                    <div className="space-y-2 pt-4 border-t border-cozy-primary">
                        <label className="block font-bold text-cozy-text">Graphics Quality</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => settings.setQualityPreset('LOW')}
                                className={`flex-1 py-1 px-3 border-2 border-cozy-accent rounded font-bold transition-colors ${settings.qualityPreset === 'LOW' ? 'bg-cozy-accent text-white' : 'bg-white text-cozy-accent hover:bg-cozy-primary'}`}
                            >
                                Low
                            </button>
                            <button
                                onClick={() => settings.setQualityPreset('HIGH')}
                                className={`flex-1 py-1 px-3 border-2 border-cozy-accent rounded font-bold transition-colors ${settings.qualityPreset === 'HIGH' ? 'bg-cozy-accent text-white' : 'bg-white text-cozy-accent hover:bg-cozy-primary'}`}
                            >
                                High
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-cozy-primary">
                        <p className="text-xs text-center text-cozy-text/60">v1.1.0 - Digital Hygge Update</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
