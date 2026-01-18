import React from 'react'
import { Text } from '@react-three/drei'
import { WorkZone } from './WorkZone'
import { ProjectZone } from './ProjectZone'
import { SkillZone } from './SkillZone'
import { AboutZone } from './AboutZone'
import { ContactZone } from './ContactZone'

import ZoneTrigger from '../game/ZoneTrigger'
import MemoryOrb from '../game/MemoryOrb'
import { Basketball } from '../game/interactive/Basketball'
import { Hoop } from '../game/interactive/Hoop'
import { LightSwitch } from '../game/interactive/LightSwitch'
import { NewtonsCradle } from '../game/interactive/NewtonsCradle'
import { Blinds } from '../game/interactive/Blinds'
import { Faucet } from '../game/interactive/Faucet'

export const Zones: React.FC = () => {
    return (
        <>
            {/* HUB ZONE */}
            <group position={[0, 0, 0]}>
                <Text
                    position={[0, 3, 0]}
                    fontSize={0.8}
                    color="#2F4F4F"
                >
                    Welcome to Sumanth's Portfolio
                </Text>

                {/* Signposts */}
                <Text position={[-5, 1, -5]} rotation={[0, Math.PI / 4, 0]} fontSize={0.4} color="#E2725B">
                    ← Projects
                </Text>
                <Text position={[5, 1, -5]} rotation={[0, -Math.PI / 4, 0]} fontSize={0.4} color="#E2725B">
                    Experience →
                </Text>

                {/* Central Hub Floor Decoration */}
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <circleGeometry args={[4, 32]} />
                    <meshStandardMaterial color="#FDF5E6" />
                </mesh>

                {/* Hub Trigger */}
                <ZoneTrigger
                    id="zone-hub"
                    position={[0, 1, 0]}
                    size={[8, 4, 8]}
                    journalEntry={{
                        title: "The Lobby",
                        description: "The central hub of my digital mind palace. Paths diverge to all aspects of my work.",
                        stickers: ["🏠"]
                    }}
                />

                {/* Minigame Corner */}
                <Hoop position={[-4, 0, 4]} />
                <Basketball position={[-4, 2, 2]} />

                {/* Light Switch (on a pillar or wall) */}
                <group position={[2, 1.5, 2]}>
                    <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.5, 1.5, 0.5]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <LightSwitch position={[0, 0, 0.26]} />
                </group>

                {/* Newton's Cradle on a desk/stand */}
                <group position={[3, 0.5, -2]}>
                    <mesh position={[0, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.5, 1, 1]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                    <NewtonsCradle position={[0, 0.5, 0]} />
                </group>

                {/* Blinds on a "Window" (Simulated) */}
                <group position={[0, 1.5, -6]}>
                    <Blinds position={[0, 0, 0]} />
                    {/* Window Frame backing */}
                    <mesh position={[0, 0, -0.05]}>
                        <planeGeometry args={[1.2, 1.2]} />
                        <meshStandardMaterial color="skyblue" emissive="skyblue" emissiveIntensity={0.5} />
                    </mesh>
                </group>

                {/* Faucet / Sink Station */}
                <group position={[-3, 0.1, -6]}>
                    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, 0.8, 1]} />
                        <meshStandardMaterial color="#555" />
                    </mesh>
                    <Faucet position={[0, 0.8, 0]} />
                </group>
            </group>

            {/* ZONES PLACEMENT */}

            {/* Work Experience: East */}
            <WorkZone position={[15, 0, 0]} />
            <ZoneTrigger
                id="zone-work"
                position={[15, 1, 0]}
                size={[10, 4, 10]}
                journalEntry={{
                    title: "Workstation",
                    description: "Where the grind happens. A history of my professional endeavors.",
                    stickers: ["💼", "☕"]
                }}
            />
            <MemoryOrb id="mem-work-1" position={[18, 1.5, 2]} color="#ffaa00" />

            {/* Projects: West */}
            <ProjectZone position={[-15, 0, 0]} />
            <ZoneTrigger
                id="zone-projects"
                position={[-15, 1, 0]}
                size={[10, 4, 10]}
                journalEntry={{
                    title: "Project Gallery",
                    description: "A showcase of what I've built. Each project is a stepping stone.",
                    stickers: ["🚀", "💻"]
                }}
            />
            <MemoryOrb id="mem-proj-1" position={[-18, 1.5, -2]} color="#00aaff" />

            {/* Skills: North */}
            <SkillZone position={[0, 0, -15]} />
            <ZoneTrigger
                id="zone-skills"
                position={[0, 1, -15]}
                size={[10, 4, 10]}
                journalEntry={{
                    title: "Skill Library",
                    description: "The tools of the trade. Always expanding, always refining.",
                    stickers: ["📚", "🧠"]
                }}
            />
            <MemoryOrb id="mem-skill-1" position={[2, 1.5, -18]} color="#aa00ff" />

            {/* About Me: South */}
            <AboutZone position={[0, 0, 15]} />
            <ZoneTrigger
                id="zone-about"
                position={[0, 1, 15]}
                size={[10, 4, 10]}
                journalEntry={{
                    title: "Personal Space",
                    description: "Who I am beyond the code. A glimpse into the human behind the screen.",
                    stickers: ["✨", "👤"]
                }}
            />

            {/* Contact: South East */}
            <ContactZone position={[10, 0, 10]} />
            <ZoneTrigger
                id="zone-contact"
                position={[10, 1, 10]}
                size={[6, 4, 6]}
                journalEntry={{
                    title: "Contact Point",
                    description: "Let's connect. Frequency is open.",
                    stickers: ["📞", "✉️"]
                }}
            />
            <MemoryOrb id="mem-contact-1" position={[12, 1.5, 12]} color="#00ff00" />

        </>
    )
}
