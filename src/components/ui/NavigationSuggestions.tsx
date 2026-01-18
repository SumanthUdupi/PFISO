import React from 'react'
import useGameStore from '../../store'
import projectsData from '../../assets/data/projects.json'

const NavigationSuggestions: React.FC = () => {
    const { enableNavigationSuggestions, viewedProjects, motesCollected, currentObjective } = useGameStore()

    if (!enableNavigationSuggestions) return null

    const suggestions: string[] = []

    if (viewedProjects.length < projectsData.length) {
        suggestions.push("Consider viewing more of your projects to unlock skills.")
    }

    if (motesCollected < 10) {
        suggestions.push("Explore the environment to collect more inspiration motes.")
    }

    if (currentObjective.includes("projects")) {
        suggestions.push("Head to the project boards to review your work.")
    }

    if (suggestions.length === 0) {
        suggestions.push("You're doing great! Keep exploring.")
    }

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            zIndex: 1000
        }}>
            <h4>Predictive Suggestions</h4>
            <ul>
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </div>
    )
}

export default NavigationSuggestions