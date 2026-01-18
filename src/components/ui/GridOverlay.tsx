import React from 'react'
import { Grid } from '@react-three/drei'
import useGameStore from '../../store'

export const GridOverlay: React.FC = () => {
    const isEditMode = useGameStore(state => state.isEditMode)

    if (!isEditMode) return null

    return (
        <group position={[0, 0.01, 0]}>
            <Grid
                args={[100, 100]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#6f6f6f"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#9d9d9d"
                fadeDistance={30}
                fadeStrength={1}
                infiniteGrid
            />
        </group>
    )
}
