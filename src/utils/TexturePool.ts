import * as THREE from 'three'

class TexturePool {
    private pool: Map<string, THREE.Texture> = new Map()
    private loader = new THREE.TextureLoader()

    getTexture(url: string): THREE.Texture {
        if (this.pool.has(url)) {
            return this.pool.get(url)!
        }

        const texture = this.loader.load(url)
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        this.pool.set(url, texture)
        return texture
    }

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