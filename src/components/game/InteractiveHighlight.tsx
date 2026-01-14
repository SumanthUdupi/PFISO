import React, { useEffect, useState } from 'react'
import { Select } from '@react-three/postprocessing'
import useInteractionStore from '../../stores/interactionStore'

// MECH-014: Object Highlight wrapper
const InteractiveHighlight = ({ children, id, enabled = true }: { children: React.ReactNode, id?: string, enabled?: boolean }) => {
    const { hoveredId, softLockedId } = useInteractionStore()
    const [isHighlighted, setIsHighlighted] = useState(false)

    useEffect(() => {
        if (!enabled || !id) return
        setIsHighlighted(hoveredId === id || softLockedId === id)
    }, [hoveredId, softLockedId, id, enabled])

    // If PostProcessing Select is too heavy or causes issues, we can fallback to a simple scale pulse or emissive addition here.
    // But since we saw <Outline> in Effects.tsx, let's try to use the Selection ecosystem if possible.
    // However, <Outline> in Effects.tsx uses the 'Selection' component logic from postprocessing.
    // We need to wrap meshes in <Select>.

    return (
        <Select enabled={isHighlighted}>
            {children}
        </Select>
    )
}

export default InteractiveHighlight
