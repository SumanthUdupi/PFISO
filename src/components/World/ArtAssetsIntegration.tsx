import React from 'react'
import * as Assets from '../game/ProceduralAssets'

export const ArtAssetsIntegration = () => {
    // Generate a grid of assets
    const assetsList = Object.values(Assets).filter(asset => typeof asset === 'function')
    const gridSize = Math.ceil(Math.sqrt(assetsList.length))
    const spacing = 3

    return (
        <group position={[20, 0, 0]}>
            {/* Offset to side of main room */}
            {assetsList.map((AssetComponent, index) => {
                const row = Math.floor(index / gridSize)
                const col = index % gridSize
                return (
                    <AssetComponent
                        key={index}
                        position={[col * spacing, 1, row * spacing]}
                    />
                )
            })}
        </group>
    )
}
