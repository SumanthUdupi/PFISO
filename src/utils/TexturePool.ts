import * as THREE from 'three'

import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'

class TexturePool {
    private pool: Map<string, THREE.Texture> = new Map()
    private loader = new THREE.TextureLoader()
    private ktx2Loader: KTX2Loader | null = null

    initKTX2(renderer: THREE.WebGLRenderer) {
        if (!this.ktx2Loader) {
            this.ktx2Loader = new KTX2Loader()
            this.ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/basis/')
            this.ktx2Loader.detectSupport(renderer)
        }
    }

    getTexture(url: string): THREE.Texture {
        if (this.pool.has(url)) {
            return this.pool.get(url)!
        }

        if (url.endsWith('.ktx2')) {
            // Handle KTX2 - Returns a dummy texture initially or needs async handling
            // Since this method is synchronous, we'll return a placeholder and update when loaded
            const texture = new THREE.Texture() // Placeholder
            if (this.ktx2Loader) {
                this.ktx2Loader.load(url, (loadedTexture) => {
                    texture.image = loadedTexture.image
                    texture.format = loadedTexture.format
                    texture.needsUpdate = true
                    this.pool.set(url, loadedTexture)
                    // Replace the placeholder in the pool? Or just update properties?
                    // Updating properties of 'texture' is safer if it's already used
                })
            } else {
                console.warn('KTX2Loader not initialized. Call initKTX2(renderer) first.')
            }
            return texture
        }

        const texture = this.loader.load(url)
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        this.pool.set(url, texture)
        return texture
    }

    // ... existing dispose methods ...
    disposeTexture(url: string): void {
        const texture = this.pool.get(url)
        if (texture) {
            texture.dispose()
            this.pool.delete(url)
        }
    }

    disposeAll(): void {
        for (const texture of this.pool.values()) {
            texture.dispose()
        }
        this.pool.clear()
    }
}

const texturePool = new TexturePool()
export default texturePool