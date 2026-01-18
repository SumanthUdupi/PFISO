import React from 'react'
import { useUIStore } from '../../stores/uiStore'
import useGameStore from '../../store'
import bioData from '../../assets/data/bio.json'

export const SkillsMenu: React.FC = () => {
    const { isSkillsMenuOpen, toggleSkillsMenu } = useUIStore()
    const { unlockedSkills } = useGameStore()

    if (!isSkillsMenuOpen) return null

    const skillCategories = bioData.skills

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleSkillsMenu}>
            <div
                className="bg-cozy-beige w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl border-4 border-cozy-orange p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold text-cozy-text font-serif">Skills Inventory</h2>
                    <button onClick={toggleSkillsMenu} className="text-2xl font-bold text-cozy-text hover:text-cozy-orange" aria-label="Close Skills Menu">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillCategories.map((category) => (
                        <div key={category.category} className="bg-white/50 p-4 rounded-lg border border-cozy-green/30">
                            <h3 className="text-xl font-bold text-cozy-green mb-4 border-b border-cozy-green/20 pb-2">{category.category}</h3>
                            <div className="space-y-3">
                                {category.items.map((skill) => {
                                    // Visual check for unlocked status
                                    const isUnlocked = unlockedSkills[skill.name] !== undefined || true // Defaulting to true for portfolio visibility

                                    return (
                                        <div key={skill.name} className={`flex items-start p-2 rounded ${isUnlocked ? 'bg-white shadow-sm' : 'opacity-50 grayscale'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${isUnlocked ? 'bg-cozy-orange text-white' : 'bg-gray-300 text-gray-500'}`}>
                                                {skill.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{skill.name}</h4>
                                                <p className="text-xs text-gray-600">{skill.level}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
