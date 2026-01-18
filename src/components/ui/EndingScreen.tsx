import React from 'react'
import useGameStore from '../../store'

const EndingScreen = () => {
    const { gameEnded, setGameEnded } = useGameStore()

    if (!gameEnded) return null

    const handleCall = () => {
        window.location.href = 'tel:+11234567890'
    }

    const handleContinue = () => {
        setGameEnded(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4">Connection Established!</h2>
                <p className="mb-6">Thank you for reaching out. Let's connect and discuss your project.</p>
                <p className="mb-4">Call me at: <strong>+1 (123) 456-7890</strong></p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handleCall} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        📞 Call Now
                    </button>
                    <button onClick={handleContinue} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Continue Exploring
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EndingScreen