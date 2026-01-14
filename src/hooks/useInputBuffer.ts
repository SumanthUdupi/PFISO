import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

type InputBufferMap = Map<string, number>

interface UseInputBufferReturn {
    bufferInput: (action: string, duration?: number) => void
    consumeInput: (action: string) => boolean
    hasInput: (action: string) => boolean
}

export const useInputBuffer = (): UseInputBufferReturn => {
    const buffer = useRef<InputBufferMap>(new Map())

    // Update loop to prune expired inputs
    useFrame((state, delta) => {
        buffer.current.forEach((timeLeft, action) => {
            const newTime = timeLeft - delta
            if (newTime <= 0) {
                buffer.current.delete(action)
            } else {
                buffer.current.set(action, newTime)
            }
        })
    })

    const bufferInput = useCallback((action: string, duration: number = 0.15) => {
        buffer.current.set(action, duration)
    }, [])

    const consumeInput = useCallback((action: string) => {
        if (buffer.current.has(action)) {
            buffer.current.delete(action)
            return true
        }
        return false
    }, [])

    const hasInput = useCallback((action: string) => {
        return buffer.current.has(action)
    }, [])

    return { bufferInput, consumeInput, hasInput }
}
