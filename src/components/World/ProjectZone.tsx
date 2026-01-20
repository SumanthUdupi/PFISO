import React, { Suspense } from 'react'
import { Text } from '@react-three/drei'
import { InteractableItem } from '../game/InteractableItem'
import ProjectEasel from '../game/Environment/ProjectEasel'
import projectsData from '../../assets/data/projects.json'
import { useUIStore } from '../../stores/uiStore'
import { resolveAssetPath } from '../../utils/assetUtils'
import { useSmartTexture } from '../../utils/useSmartTexture'

interface ProjectData {
    id: string
    title: string
    description: string
    heroImage?: string
    techStack: string[]
    links: { demo?: string, github?: string }
}

export const ProjectZone: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const openModal = useUIStore(state => state.openModal)
    const projects = projectsData as ProjectData[]

    // Preload textures to avoid render-phase updates
    React.useEffect(() => {
        projects.forEach(project => {
            if (project.heroImage) useSmartTexture.preload(resolveAssetPath(project.heroImage))
        })
    }, [])

    return (
        <group position={position}>
            <Text
                position={[0, 4, 0]}
                fontSize={1}
                color="#2F4F4F"
            // font="https://fonts.gstatic.com/s/outfit/v6/QGYyz_MVcBeNP4NjuGObqx1XmO1I.woff" // Causing errors
            >
                PROJECTS
            </Text>

            {projects.map((project, idx) => {
                // Arrange in a gallery layout (staggered)
                const x = (idx % 2 === 0 ? -1 : 1) * (2 + Math.random()) // Stagger left/right
                const z = idx * 5 // Spacing

                return (
                    <InteractableItem
                        key={project.id}
                        position={[x, 0, z]}
                        label="View Project"
                        onInteract={() => openModal({
                            title: project.title,
                            description: project.description,
                            image: project.heroImage ? resolveAssetPath(project.heroImage) : undefined,
                            tags: project.techStack,
                            links: project.links.demo ? [{ label: "Demo", url: project.links.demo }] : [],
                            type: 'PROJECT'
                        })}
                    >
                        <Suspense fallback={null}>
                            <ProjectEasel position={[0, 0, 0]} image={project.heroImage ? resolveAssetPath(project.heroImage) : undefined} />
                        </Suspense>
                    </InteractableItem>
                )
            })}
        </group>
    )
}
