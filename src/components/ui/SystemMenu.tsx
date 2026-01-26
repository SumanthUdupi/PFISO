import React, { useState, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'
import useGameStore from '../../store'
import useAudioStore from '../../audioStore'
import { useConversationStore } from '../../stores/conversationStore' // UX-034
import { BestiaryUI } from './BestiaryUI' // UX-043
import CreditsOverlay from './CreditsOverlay'
import { PhotoGallery } from './PhotoGallery'

export const SystemMenu: React.FC = () => {
    const { isSystemMenuOpen, toggleSystemMenu } = useUIStore()
    const settings = useSettingsStore()
    const { logs } = useConversationStore() // UX-034
    const [showCredits, setShowCredits] = useState(false) // SYS-017
    const [view, setView] = useState<'MAIN' | 'GALLERY' | 'LOGS' | 'CODEX'>('MAIN') // UX-043: Codex

    // UX-031: Rebind State
    const [rebindAction, setRebindAction] = useState<string | null>(null)

    const menuRef = React.useRef<HTMLDivElement>(null)

    // UX-008: Menu Navigation (Keyboard Support)
    React.useEffect(() => {
        if (isSystemMenuOpen) {
            // Focus first interactable element
            const focusable = menuRef.current?.querySelectorAll('button, input, select')
            if (focusable && focusable.length > 0) {
                (focusable[0] as HTMLElement).focus()
            }
        }
    }, [isSystemMenuOpen])

    // UX-031: Specific effect to handle rebind input
    useEffect(() => {
        if (!rebindAction) return

        const handleRebind = (e: KeyboardEvent) => {
            e.preventDefault()
            e.stopPropagation()

            // Ignore Escape to cancel?
            if (e.key === 'Escape') {
                setRebindAction(null)
                return
            }

            // console.log(`Rebind ${rebindAction} to ${e.key}`)
            import('../../systems/InputManager').then(({ default: inputs }) => {
                inputs.rebind(rebindAction as any, [e.key.toLowerCase()])
                setRebindAction(null)
            })
        }

        window.addEventListener('keydown', handleRebind, { capture: true })
        return () => window.removeEventListener('keydown', handleRebind, { capture: true })
    }, [rebindAction])


    // Trap focus inside menu (only if not rebinding)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (rebindAction) return
        if (e.key === 'Escape') toggleSystemMenu()
    }

    if (!isSystemMenuOpen) return null

    // Render Logic for different Views
    if (view === 'GALLERY') {
        return (
            <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col">
                <div className="p-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Photo Gallery</h2>
                    <button onClick={() => setView('MAIN')} className="px-4 py-2 bg-white/20 rounded hover:bg-white/40">Back</button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <PhotoGallery />
                </div>
            </div>
        )
    }

    if (view === 'LOGS') {
        return (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setView('MAIN')}>
                <div className="bg-cozy-bg w-full max-w-2xl p-8 rounded-xl border-4 border-cozy-text shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6 border-b border-cozy-primary pb-4">
                        <h2 className="text-2xl font-bold text-cozy-text font-serif">Conversation History</h2>
                        <button onClick={() => setView('MAIN')} className="text-cozy-text hover:text-cozy-accent font-bold">Close</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {logs.length === 0 ? (
                            <div className="text-center text-cozy-text/50 italic py-10">No conversation history yet.</div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="bg-white/40 p-3 rounded border border-cozy-primary/30">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-cozy-accent text-sm">{log.speaker}</span>
                                        <span className="text-xs text-cozy-text/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-cozy-text text-sm">{log.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={toggleSystemMenu}
            onKeyDown={handleKeyDown}
        >
            <div
                ref={menuRef}
                className="bg-cozy-bg w-full max-w-md p-8 rounded-xl border-4 border-cozy-text shadow-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Rebind Overlay */}
                {rebindAction && (
                    <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white rounded-xl">
                        <div className="text-xl font-bold mb-4">Rebinding: {rebindAction}</div>
                        <div className="animate-pulse text-cozy-accent">Press any key to bind...</div>
                        <div className="mt-4 text-xs text-white/50">Press ESC to cancel</div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cozy-text font-serif">System Settings</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setView('LOGS')} className="text-sm font-bold text-cozy-text hover:text-cozy-accent underline">Logs</button>
                        <button onClick={() => setView('GALLERY')} className="text-sm font-bold text-cozy-text hover:text-cozy-accent underline">Gallery</button>
                    </div>
                    <button onClick={toggleSystemMenu} onMouseEnter={() => useAudioStore.getState().playSynthSound('hover', 0.1)} className="text-2xl font-bold text-cozy-text hover:text-cozy-accent"><span className="font-sans">✕</span></button>
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

                    {/* Crosshair Customization */}
                    <div className="space-y-4 pt-4 border-t border-cozy-primary">
                        <h3 className="font-bold text-cozy-text">Crosshair</h3>

                        <div className="space-y-2">
                            <label className="text-sm text-cozy-text block">Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => settings.setCrosshairColor(color)}
                                        className={`w-6 h-6 rounded border-2 ${settings.crosshairColor === color ? 'border-cozy-text scale-110' : 'border-transparent hover:border-white/50'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Size</span>
                                <span>{settings.crosshairSize}px</span>
                            </label>
                            <input
                                type="range"
                                min="4" max="50" step="2"
                                value={settings.crosshairSize}
                                onChange={(e) => settings.setCrosshairSize(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Gap</span>
                                <span>{settings.crosshairGap}px</span>
                            </label>
                            <input
                                type="range"
                                min="0" max="20" step="1"
                                value={settings.crosshairGap}
                                onChange={(e) => settings.setCrosshairGap(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Thickness</span>
                                <span>{settings.crosshairThickness}px</span>
                            </label>
                            <input
                                type="range"
                                min="1" max="10" step="1"
                                value={settings.crosshairThickness}
                                onChange={(e) => settings.setCrosshairThickness(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                        </div>
                    </div>

                    {/* Input Bindings (SYS-013 & UX-031) */}
                    <div className="space-y-2 pt-4 border-t border-cozy-primary">
                        <label className="block font-bold text-cozy-text mb-2">Controls</label>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto bg-white/20 p-2 rounded">
                            {['JUMP', 'DASH', 'INTERACT', 'INVENTORY', 'CROUCH'].map((action) => (
                                <div key={action} className="flex justify-between items-center text-sm">
                                    <span>{action}</span>
                                    <button
                                        className="bg-white/50 px-2 py-1 rounded hover:bg-white min-w-[60px] text-center"
                                        onClick={() => setRebindAction(action)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gameplay Settings (SYS-027 & UX-026) */}
                    <div className="space-y-2 pt-4 border-t border-cozy-primary">
                        <label className="block font-bold text-cozy-text">Gameplay</label>

                        {/* UX-026: Hardware Cursor */}
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-cozy-text">Hardware Cursor (Reduces Menu Lag)</label>
                            <input
                                type="checkbox"
                                checked={settings.hardwareCursor}
                                onChange={(e) => settings.setHardwareCursor(e.target.checked)}
                                className="w-5 h-5 accent-cozy-accent"
                            />
                        </div>

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

                    {/* SYS-037: Fast Travel */}
                    <div className="space-y-2 pt-4 border-t border-cozy-primary">
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
                                    // ARCHIVES coordinates
                                    import('../../systems/EventBus').then(({ default: bus }) => bus.emit('TELEPORT', { x: 30, y: 1, z: 0 }))
                                    toggleSystemMenu()
                                }}
                                className="py-1 px-3 bg-white text-cozy-accent border-2 border-cozy-accent rounded hover:bg-cozy-primary transition-colors font-bold"
                            >
                                ARCHIVES
                            </button>
                            <button
                                onClick={() => {
                                    // ROOF coordinates
                                    import('../../systems/EventBus').then(({ default: bus }) => bus.emit('TELEPORT', { x: 0, y: 20, z: 0 }))
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
                        <div className="flex gap-2 mb-2">
                            {/* Quality Buttons */}
                            {['LOW', 'HIGH'].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => settings.setQualityPreset(q as any)}
                                    className={`flex-1 py-1 px-3 border-2 border-cozy-accent rounded font-bold transition-colors ${settings.qualityPreset === q ? 'bg-cozy-accent text-white' : 'bg-white text-cozy-accent hover:bg-cozy-primary'}`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* UX-029: Resolution Scale */}
                        <div className="space-y-1">
                            <label className="text-sm text-cozy-text flex justify-between">
                                <span>Resolution Scale</span>
                                <span>{(settings.resolutionScale * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                min="0.5" max="2.0" step="0.1"
                                value={settings.resolutionScale}
                                onChange={(e) => settings.setResolutionScale(parseFloat(e.target.value))}
                                className="w-full accent-cozy-accent"
                            />
                        </div>
                    </div>

                    {/* ... other settings ... */}

                    {/* SYS-039 & UX-028: Statistics */}
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
                                <div className="text-xs uppercase tracking-wider opacity-70">Enemies Defeated</div>
                                <div className="font-bold text-lg">{useGameStore.getState().statistics?.kills || 0}</div>
                            </div>
                            <div className="bg-white/50 p-2 rounded">
                                <div className="text-xs uppercase tracking-wider opacity-70">Damage Dealt</div>
                                <div className="font-bold text-lg">{useGameStore.getState().statistics?.damageDealt || 0}</div>
                            </div>
                            <div className="bg-white/50 p-2 rounded">
                                <div className="text-xs uppercase tracking-wider opacity-70">Steps</div>
                                <div className="font-bold text-lg">{useGameStore.getState().stats.stepsTaken.toFixed(0)}</div>
                            </div>
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

