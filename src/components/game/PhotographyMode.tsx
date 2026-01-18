import React, { useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import usePhotographyStore from '../../stores/photographyStore'
import { getCursorUrl } from '../ui/CursorIcons'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'

const PhotographyMode: React.FC = () => {
    const { gl } = useThree()
    const { capturePhoto, setPhotographyMode } = usePhotographyStore()
    const { isMobile } = useDeviceDetect()

    const handleCapture = useCallback(() => {
        const dataUrl = gl.domElement.toDataURL('image/png')
        capturePhoto(dataUrl)
    }, [gl, capturePhoto])

    useEffect(() => {
        // Set cursor
        document.body.style.cursor = `url('${getCursorUrl('camera')}') 16 16, auto`

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setPhotographyMode(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.cursor = 'auto'
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [setPhotographyMode])

    if (isMobile) {
        return (
            <div className="fixed inset-0 pointer-events-none">
                <button
                    onClick={handleCapture}
                    className="pointer-events-auto fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-full shadow-lg"
                >
                    📷 Capture
                </button>
            </div>
        )
    }

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Prevent if clicking on UI
            if ((e.target as HTMLElement).closest('.modal, button, input')) return
            handleCapture()
        }

        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('click', handleClick)
        }
    }, [handleCapture])

    return null
}

export default PhotographyMode