import React, { useState, useEffect } from 'react'

export const HUDClock: React.FC = React.memo(() => {
    const [timeString, setTimeString] = useState('')

    useEffect(() => {
        const updateTime = () => {
            setTimeString(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
        updateTime() // Init
        const timer = setInterval(updateTime, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="text-white font-mono text-sm bg-black/50 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
            {timeString}
        </div>
    )
})
