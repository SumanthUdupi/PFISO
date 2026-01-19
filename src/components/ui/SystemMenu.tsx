import React, { useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'
import useGameStore from '../../store'
import CreditsOverlay from './CreditsOverlay'

export const SystemMenu: React.FC = () => {
    const { isSystemMenuOpen, toggleSystemMenu } = useUIStore()
    const settings = useSettingsStore()
    const [showCredits, setShowCredits] = useState(false) // SYS-017

    if (!isSystemMenuOpen) return null

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleSystemMenu}>
            <div
                className="bg-cozy-bg w-full max-w-md p-8 rounded-xl border-4 border-cozy-text shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cozy-text font-serif">System Settings</h2>
                    <button onClick={toggleSystemMenu} className="text-2xl font-bold text-cozy-text hover:text-cozy-accent"><span className="font-sans">✕</span></button>
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

                    {/* Input Bindings (SYS-013) */}
                    <div className="space-y-2 pt-4 border-t border-cozy-primary">
                        <label className="block font-bold text-cozy-text mb-2">Controls</label>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto bg-white/20 p-2 rounded">
                            {['JUMP', 'DASH', 'INTERACT', 'INVENTORY', 'CROUCH'].map((action) => (
                                <div key={action} className="flex justify-between items-center text-sm">
                                    <span>{action}</span>
                                    <button
                                        className="bg-white/50 px-2 py-1 rounded hover:bg-white"
                                        onClick={() => {
                                            const newKey = prompt(`Press new key for ${action}`);
                                            if (newKey) {
                                                console.log(`Rebind ${action} to ${newKey}`);
                                                // @ts-ignore
                                                import('../../systems/InputManager').then(({ default: inputs }) => {
                                                    inputs.rebind(action as any, [newKey.toLowerCase()]);
                                                });
                                            }
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gameplay Settings (SYS-027) */}
                    <div className="space-y-2 pt-4 border-t border-cozy-primary">
                        <label className="block font-bold text-cozy-text">Gameplay</label>
                        <div className="space-y-2">
                            <label className="text-sm text-cozy-text">Difficulty</label>
                            <div className="flex gap-2">
                                {(['easy', 'normal', 'hard'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => useGameStore.getState().setDifficulty(mode)}
                                        className={`flex-1 py-1 px-3 border-2 border-cozy-accent rounded font-bold capitalize transition-colors ${useGameStore.getState().difficulty === mode ? 'bg-cozy-accent text-white' : 'bg-white text-cozy-accent hover:bg-cozy-primary'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SYS-037: Fast Travel */}
                <div className="space-y-2 pt-4 border-t border-cozy-primary">
                    <label className="block font-bold text-cozy-text">Fast Travel</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => {
                                import('../../systems/EventBus').then(({ default: bus }) => bus.emit('TELEPORT', { x: 0, y: 1, z: 0 }))
                                toggleSystemMenu()
                            }}
                            className="py-1 px-3 bg-white text-cozy-accent border-2 border-cozy-accent rounded hover:bg-cozy-primary transition-colors font-bold"
                        >
                            START
                        </button>
                        <button
                            onClick={() => {
                                import('../../systems/EventBus').then(({ default: bus }) => bus.emit('TELEPORT', { x: 10, y: 1, z: 10 }))
                                toggleSystemMenu()
                            }}
                            className="py-1 px-3 bg-white text-cozy-accent border-2 border-cozy-accent rounded hover:bg-cozy-primary transition-colors font-bold"
                        >
                            LAB
                        </button>
                        <button
                            onClick={() => {
                                import('../../systems/EventBus').then(({ default: bus }) => bus.emit('TELEPORT', { x: -10, y: 5, z: -10 }))
                                toggleSystemMenu()
                            }}
                            className="py-1 px-3 bg-white text-cozy-accent border-2 border-cozy-accent rounded hover:bg-cozy-primary transition-colors font-bold"
                        >
                            ARCHIVES
                        </button>
                        <button
                            onClick={() => {
                                import('../../systems/EventBus').then(({ default: bus }) => bus.emit('TELEPORT', { x: 0, y: 10, z: 0 }))
                                toggleSystemMenu()
                            }}
                            className="py-1 px-3 bg-white text-cozy-accent border-2 border-cozy-accent rounded hover:bg-cozy-primary transition-colors font-bold"
                        >
                            ROOF
                        </button>
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

                {/* SYS-041: Cloud Save */}
                <div className="pt-4 border-t border-cozy-primary">
                    <label className="block font-bold text-cozy-text mb-2">Cloud Synchro</label>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                const { CloudSaveManager } = await import('../../systems/CloudSaveManager');
                                const success = await CloudSaveManager.syncToCloud();
                                alert(success ? "Uploaded to Cloud!" : "Upload Failed");
                            }}
                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded text-xs font-bold transition-colors"
                        >
                            ☁️ Upload
                        </button>
                        <button
                            onClick={async () => {
                                const { CloudSaveManager } = await import('../../systems/CloudSaveManager');
                                if (await CloudSaveManager.hasCloudSave()) {
                                    const success = await CloudSaveManager.restoreFromCloud();
                                    if (success) {
                                        alert("Downloaded from Cloud! reloading...");
                                        window.location.reload();
                                    } else {
                                        alert("Download Failed");
                                    }
                                } else {
                                    alert("No Cloud Save found");
                                }
                            }}
                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded text-xs font-bold transition-colors"
                        >
                            📥 Download
                        </button>
                    </div>
                </div>

                {/* SYS-039: Statistics */}
                <div className="space-y-2 pt-4 border-t border-cozy-primary">
                    <label className="block font-bold text-cozy-text">Statistics</label>
                    <div className="grid grid-cols-2 gap-2 text-sm text-cozy-text">
                        <div className="bg-white/50 p-2 rounded">
                            <div className="text-xs uppercase tracking-wider opacity-70">Time Played</div>
                            <div className="font-bold text-lg">
                                {new Date(useGameStore.getState().stats.timePlayed * 1000).toISOString().substr(11, 8)}
                            </div>
                        </div>
                        <div className="bg-white/50 p-2 rounded">
                            <div className="text-xs uppercase tracking-wider opacity-70">Steps</div>
                            <div className="font-bold text-lg">{useGameStore.getState().stats.stepsTaken.toFixed(0)}</div>
                        </div>
                        <div className="bg-white/50 p-2 rounded col-span-2">
                            <div className="text-xs uppercase tracking-wider opacity-70">Distance Traveled</div>
                            <div className="font-bold text-lg">{useGameStore.getState().stats.distanceTraveled.toFixed(1)} m</div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-cozy-primary">
                    <p className="text-xs text-center text-cozy-text/60">v1.1.0 - Digital Hygge Update</p>
                </div>
            </div>
        </div>
        </div >
    )
}
```
