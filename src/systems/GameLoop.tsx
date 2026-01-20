import { useFrame } from '@react-three/fiber'
import gameSystem from './GameSystem'

export const GameLoop = () => {
    useFrame((state, delta) => {
        gameSystem.update(state.clock.elapsedTime, delta)
    })
    return null
}
