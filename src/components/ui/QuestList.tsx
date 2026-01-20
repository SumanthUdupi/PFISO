import React, { useState } from 'react'

interface Quest {
    id: string
    title: string
    completed: boolean
}

// Temporary mock data or store integration
// Ideally this would come from a questStore
const MOCK_QUESTS: Quest[] = [
    { id: 'q1', title: 'Explore the Office', completed: true },
    { id: 'q2', title: 'Find the Keycard', completed: false },
    { id: 'q3', title: 'Access the Server Room', completed: false },
]

export const QuestList: React.FC = () => {
    // In a real implementation, use useQuestStore()
    const [quests] = useState<Quest[]>(MOCK_QUESTS)

    // Filter to show active or recently active?
    // Let's show currently active + recently completed (if we tracked time)
    // For now, simple list.

    return (
        <div className="absolute top-20 right-4 w-64 pointer-events-none z-[1000] font-sans">
            <h3 className="text-white font-bold text-lg mb-2 drop-shadow-md">Current Objectives</h3>
            <ul className="space-y-2">
                {quests.map(quest => (
                    <li key={quest.id} className={`flex items-start gap-2 ${quest.completed ? 'opacity-50' : 'opacity-100'}`}>
                        <div className={`mt-1 min-w-[16px] h-4 w-4 border-2 flex items-center justify-center rounded-sm ${quest.completed ? 'bg-cozy-accent border-cozy-accent' : 'border-white'}`}>
                            {quest.completed && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`text-white drop-shadow-sm ${quest.completed ? 'line-through' : ''}`}>
                            {quest.title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
