import { useTexture, useKTX2 } from '@react-three/drei'

import { resolveAssetPath } from './assetUtils'

export function useSmartTexture(url: string) {
    const isKTX2 = (path: string) => path.toLowerCase().endsWith('.ktx2')
    const finalUrl = resolveAssetPath(url)

    if (isKTX2(finalUrl)) {
        return useKTX2(finalUrl)
    } else {
        return useTexture(finalUrl)
    }
}

// Preload method
useSmartTexture.preload = (url: string | string[]) => {
    const isKTX2 = (path: string) => path.toLowerCase().endsWith('.ktx2')
    if (Array.isArray(url)) {
        const fixedUrls = url.map(u => resolveAssetPath(u))
        const hasKTX2 = fixedUrls.some(u => isKTX2(u))
        if (hasKTX2) useKTX2.preload(fixedUrls)
        else useTexture.preload(fixedUrls)
    } else {
        const finalUrl = resolveAssetPath(url)
        if (isKTX2(finalUrl)) useKTX2.preload(finalUrl)
        else useTexture.preload(finalUrl)
    }
}
