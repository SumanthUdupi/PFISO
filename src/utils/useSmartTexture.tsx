import { useTexture, useKTX2 } from '@react-three/drei'

export function useSmartTexture(url: string) {
    const isKTX2 = (path: string) => path.toLowerCase().endsWith('.ktx2')

    if (isKTX2(url)) {
        return useKTX2(url)
    } else {
        return useTexture(url)
    }
}

// Preload method
useSmartTexture.preload = (url: string | string[]) => {
    const isKTX2 = (path: string) => path.toLowerCase().endsWith('.ktx2')
    if (Array.isArray(url)) {
        const hasKTX2 = url.some(u => isKTX2(u))
        if (hasKTX2) useKTX2.preload(url)
        else useTexture.preload(url)
    } else {
        if (isKTX2(url)) useKTX2.preload(url)
        else useTexture.preload(url)
    }
}
