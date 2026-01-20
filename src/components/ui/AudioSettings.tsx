import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import useAudioStore from '../../audioStore'

const AudioSettings = ({ onClose }: { onClose: () => void }) => {
    const {
        volumes, setVolume,
        mono, toggleMono,
        bassBoost, toggleBassBoost,
        muteOnFocusLoss, toggleMuteOnFocusLoss
    } = useAudioStore()

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '20px',
            color: 'white',
            fontFamily: 'monospace',
            zIndex: 1000,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            <h2 style={{ borderBottom: '1px solid #555', paddingBottom: '10px', marginTop: 0 }}>AUDIO SETTINGS</h2>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Master Volume: {Math.round(volumes.master * 100)}%</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={volumes.master}
                    onChange={(e) => setVolume('master', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Music Volume: {Math.round(volumes.music * 100)}%</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={volumes.music}
                    onChange={(e) => setVolume('music', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>SFX Volume: {Math.round(volumes.sfx * 100)}%</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={volumes.sfx}
                    onChange={(e) => setVolume('sfx', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Voice Volume: {Math.round(volumes.voice * 100)}%</label>
                <input
                    type="range" min="0" max="1" step="0.01"
                    value={volumes.voice}
                    onChange={(e) => setVolume('voice', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={mono} onChange={toggleMono} />
                    Mono Audio (AUD-023)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={bassBoost} onChange={toggleBassBoost} />
                    Bass Boost / LFE (AUD-048)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={muteOnFocusLoss} onChange={toggleMuteOnFocusLoss} />
                    Mute in Background (AUD-050)
                </label>

                {/* AUD-042: Speaker Output Placeholder */}
                <div style={{ opacity: 0.5 }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Output Device (AUD-042)</label>
                    <select disabled style={{ width: '100%', background: '#222', color: '#888', border: '1px solid #444' }}>
                        <option>Default Output</option>
                    </select>
                </div>
            </div>

            <button
                onClick={onClose}
                style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '10px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                CLOSE
            </button>
        </div>
    )
}

export default AudioSettings
