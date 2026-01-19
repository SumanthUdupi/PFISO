import React from 'react'

interface CreditsOverlayProps {
    onClose: () => void
}

const CreditsOverlay: React.FC<CreditsOverlayProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[2100] bg-black/90 flex flex-col items-center justify-center text-cozy-text font-serif">
            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-white hover:text-cozy-accent text-2xl"
            >
                ✕
            </button>
            <div className="w-full max-w-2xl h-[80vh] overflow-y-auto pr-4 custom-scrollbar text-center">
                <h1 className="text-4xl font-bold mb-8 text-cozy-accent">PFISO</h1>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-white">Development</h2>
                        <p className="text-lg">Sumanth Udupi</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-white">Design & Art</h2>
                        <p className="text-lg">Sumanth Udupi</p>
                        <p className="text-sm opacity-70 mt-2">Special thanks to open source assets.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-white">Music & Audio</h2>
                        <p className="text-lg">Generated / Ambient</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-white">Technology</h2>
                        <p>React Three Fiber</p>
                        <p>Rapier Physics</p>
                        <p>Zustand</p>
                    </section>
                </div>

                <div className="mt-20 opacity-50 text-sm">
                    Thank you for playing.
                </div>
            </div>
        </div>
    )
}

export default CreditsOverlay
