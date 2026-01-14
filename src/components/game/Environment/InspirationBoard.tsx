import React, { useRef } from 'react'
import * as THREE from 'three'
import BoardItem from './BoardItem'

interface InspirationBoardProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    onClick?: () => void
}

const InspirationBoard: React.FC<InspirationBoardProps> = ({ position, rotation = [0, 0, 0], onClick }) => {
    return (
        <group position={position} rotation={rotation} onClick={onClick}>
             {/* Board Base (Cork) */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[2, 1.2, 0.1]} />
                <meshStandardMaterial color="#8d6e63" roughness={0.9} /> {/* Cork Color */}
            </mesh>

            {/* Frame */}
            <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[2.1, 1.3, 0.08]} />
                <meshStandardMaterial color="#5d4037" /> {/* Wood Frame */}
            </mesh>

             {/* Items */}
            <BoardItem
                position={[-0.6, 1.8, 0.06]}
                type="polaroid"
                rotation={[0, 0, 0.1]}
                onClick={onClick}
            />
             <BoardItem
                position={[0.5, 1.6, 0.06]}
                type="ticket"
                rotation={[0, 0, -0.2]}
                onClick={onClick}
            />
             <BoardItem
                position={[-0.2, 1.4, 0.06]}
                type="sketch"
                rotation={[0, 0, 0.05]}
                onClick={onClick}
            />
             <BoardItem
                position={[0.7, 1.2, 0.06]}
                type="polaroid"
                rotation={[0, 0, -0.1]}
                onClick={onClick}
            />

             {/* String connecting items (Detective style) */}
             {/* Simple line implementation using a thin cylinder or tube */}
             <mesh position={[-0.05, 1.6, 0.07]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.005, 0.005, 1.2, 4]} />
                <meshStandardMaterial color="#fcf4e8" />
             </mesh>
        </group>
    )
}

export default InspirationBoard
