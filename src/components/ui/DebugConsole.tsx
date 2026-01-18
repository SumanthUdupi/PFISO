import React, { useState, useEffect, useRef } from 'react'
import useGameStore from '../../store'
import inputs from '../../systems/InputManager'

export const DebugConsole: React.FC = () => {
    const { isConsoleOpen, toggleConsole, setDebugFlag, debugFlags } = useGameStore()
    const [inputStr, setInputStr] = useState('')
    const [logs, setLogs] = useState<string[]>(['Debug Console v0.1 - Type "help" for commands'])
    const inputRef = useRef<HTMLInputElement>(null)

    // Log helper
    const log = (msg: string) => setLogs(prev => [...prev, msg].slice(-20))

    // Toggle listener
    useEffect(() => {
        const checkToggle = () => {
            if (inputs.justPressed('TOGGLE_CONSOLE')) {
                toggleConsole()
            }
        }
        // Poll input manager
        const interval = setInterval(checkToggle, 16)
        return () => clearInterval(interval)
    }, [toggleConsole])

    // Focus input when open
    useEffect(() => {
        if (isConsoleOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isConsoleOpen])

    const handleCommand = (cmd: string) => {
        log(`> ${cmd}`)
        const parts = cmd.toLowerCase().trim().split(' ')
        const command = parts[0]
        const arg = parts[1]

        switch (command) {
            case 'help':
                log('Commands: help, nav, phys, fps, clear, close')
                break
            case 'clear':
                setLogs([])
                break
            case 'nav':
                if (arg === 'on') setDebugFlag('showNavMesh', true)
                else if (arg === 'off') setDebugFlag('showNavMesh', false)
                else setDebugFlag('showNavMesh', !debugFlags.showNavMesh)
                log(`NavMesh debug: ${!debugFlags.showNavMesh ? 'ON' : 'OFF'}`) // Logic inverse because update is fresh
                break
            case 'phys':
                if (arg === 'on') setDebugFlag('showPhysics', true)
                else if (arg === 'off') setDebugFlag('showPhysics', false)
                else setDebugFlag('showPhysics', !debugFlags.showPhysics)
                log(`Physics debug: ${!debugFlags.showPhysics ? 'ON' : 'OFF'}`)
                break
            case 'fps':
                if (arg === 'on') setDebugFlag('showFPS', true)
                else if (arg === 'off') setDebugFlag('showFPS', false)
                else setDebugFlag('showFPS', !debugFlags.showFPS)
                log(`FPS debug: ${!debugFlags.showFPS ? 'ON' : 'OFF'}`)
                break
            case 'close':
                toggleConsole()
                break
            default:
                log(`Unknown command: ${command}`)
        }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (inputStr.trim()) {
                handleCommand(inputStr)
                setInputStr('')
            }
        }
        // Use Escape to close too (though globally it might be MENU)
        // If console is open, we consume input ideally
        if (e.key === '`' || e.key === '~') {
            e.preventDefault() // prevent typing `
        }
    }

    if (!isConsoleOpen) return null

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '30vh', // Half screen
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#0f0',
            fontFamily: 'monospace',
            zIndex: 99999,
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
                {logs.map((L, i) => <div key={i}>{L}</div>)}
            </div>
            <div style={{ display: 'flex' }}>
                <span style={{ marginRight: '8px' }}>$</span>
                <input
                    ref={inputRef}
                    value={inputStr}
                    onChange={e => setInputStr(e.target.value)}
                    onKeyDown={onKeyDown}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontFamily: 'monospace',
                        outline: 'none'
                    }}
                />
            </div>
            {/* Legend */}
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                fontSize: '12px',
                color: '#aaa',
                pointerEvents: 'none'
            }}>
                Status: Nav[{debugFlags.showNavMesh ? 'ON' : 'OFF'}] Phys[{debugFlags.showPhysics ? 'ON' : 'OFF'}]
            </div>
        </div>
    )
}
