import React, { useEffect, useState } from 'react'
import { useUIStore } from '../../stores/uiStore'

export const BootSplash: React.FC = () => {
    const { setHasSeenBootSplash } = useUIStore()
    const [step, setStep] = useState(0) // 0: Blank, 1: Studio, 2: Tech, 3: Warning, 4: Done

    useEffect(() => {
        // Simple sequence
        const sequence = async () => {
            // Wait a bit
            await new Promise(r => setTimeout(r, 500))
            setStep(1) // Studio
            await new Promise(r => setTimeout(r, 2000))
            setStep(0) // Fade out
            await new Promise(r => setTimeout(r, 500))

            setStep(2) // Tech
            await new Promise(r => setTimeout(r, 2000))
            setStep(0) // Fade out
            await new Promise(r => setTimeout(r, 500))

            setStep(3) // Warning
            await new Promise(r => setTimeout(r, 2500))
            setStep(0) // Fade out
            await new Promise(r => setTimeout(r, 500))

            setHasSeenBootSplash(true)
        }
        sequence()
    }, [setHasSeenBootSplash])

    return (
        <div className="fixed inset-0 z-[9999] bg-black pointer-events-none flex items-center justify-center text-white font-sans select-none">
            {/* Step 1: Studio Logo */}
            <div className={`transition-opacity duration-1000 absolute ${step === 1 ? 'opacity-100' : 'opacity-0'}`}>
                <h1 className="text-6xl font-black tracking-[1em] text-center">ANTIGRAVITY<br />studios</h1>
            </div>

            {/* Step 2: Tech/Engine */}
            <div className={`transition-opacity duration-1000 absolute ${step === 2 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex flex-col items-center gap-4">
                    <span className="text-8xl">⚛️</span>
                    <span className="text-2xl font-mono tracking-widest uppercase">Powered by React Three Fiber</span>
                </div>
            </div>

            {/* Step 3: Warning */}
            <div className={`transition-opacity duration-1000 absolute ${step === 3 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="max-w-xl text-center">
                    <h2 className="text-red-500 font-bold text-3xl mb-4 uppercase">Content Warning</h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                        This experience contains flashing lights and rapid visual effects that may specifically affect photosensitive viewers.
                    </p>
                    <p className="mt-4 text-sm text-gray-500 font-mono">PLAYER DISCRETION ADVISED</p>
                </div>
            </div>

            {/* Skip Button (always visible if interacting, but we made it pointer-events-none... let's enable pointer events if mouse moves? nah, just let them wait or press Space to skip) */}
        </div>
    )
}
