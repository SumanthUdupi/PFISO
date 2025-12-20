import * as THREE from 'three'

// Simple Grid-based Pathfinding (A* style or BFS since no weights)
// Grid Size: 15x15
// Center: (0,0)
// Range: -7.5 to 7.5

// We map world coordinates to grid coordinates (0 to 14)

const GRID_SIZE = 15
const OFFSET = 7 // -7 to 7 -> 0 to 14

export interface Point {
    x: number
    y: number
}

// Blocked tiles (hardcoded based on Lobby layout)
// Projects: [4, 0, -3] -> x=4, z=-3
// About: [-4, 0, -3] -> x=-4, z=-3
// Contact: [0, 0, -5] -> x=0, z=-5
// Desks occupy roughly 2x1 or 2x2.
// Interactive Objects occupy 1x1.

const BLOCKED_TILES: Point[] = [
    { x: 4, y: -3 }, { x: 3, y: -3 }, { x: 5, y: -3 }, // Projects Desk
    { x: -4, y: -3 }, { x: -3, y: -3 }, { x: -5, y: -3 }, // About Bookshelf area
    { x: 0, y: -5 }, { x: -1, y: -5 }, { x: 1, y: -5 }, // Contact Desk
]

const isBlocked = (x: number, y: number) => {
    return BLOCKED_TILES.some(p => Math.round(p.x) === x && Math.round(p.y) === y)
}

const worldToGrid = (x: number, z: number): Point => {
    return {
        x: Math.round(x),
        y: Math.round(z)
    }
}

// A* Algorithm
export const findPath = (start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3[] => {
    const startGrid = worldToGrid(start.x, start.z)
    const endGrid = worldToGrid(end.x, end.z)

    // Optimization: If simple direct line is clear, use it (simplified check could be added)
    // For now, full A*

    const openList: { pos: Point, g: number, h: number, f: number, parent?: any }[] = []
    const closedList: Set<string> = new Set()

    openList.push({
        pos: startGrid,
        g: 0,
        h: heuristic(startGrid, endGrid),
        f: 0
    })

    while (openList.length > 0) {
        // Sort by f
        openList.sort((a, b) => a.f - b.f)
        const current = openList.shift()!

        const key = `${current.pos.x},${current.pos.y}`
        if (closedList.has(key)) continue
        closedList.add(key)

        // Check if reached (allow being adjacent to target if target is blocked?)
        // For floor clicking, target is usually walkable.
        if (current.pos.x === endGrid.x && current.pos.y === endGrid.y) {
            // Reconstruct path
            const path: THREE.Vector3[] = []
            let curr = current
            while (curr) {
                path.push(new THREE.Vector3(curr.pos.x, 0, curr.pos.y))
                curr = curr.parent
            }
            return path.reverse() // Start to End
        }

        // Neighbors
        const neighbors = [
            { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
            // Diagonals? Maybe later.
        ]

        for (const n of neighbors) {
            const nextPos = { x: current.pos.x + n.x, y: current.pos.y + n.y }

            // Bounds check
            if (nextPos.x < -7 || nextPos.x > 7 || nextPos.y < -7 || nextPos.y > 7) continue

            // Block check
            if (isBlocked(nextPos.x, nextPos.y)) continue

            const gScore = current.g + 1
            const hScore = heuristic(nextPos, endGrid)
            const fScore = gScore + hScore

            const existing = openList.find(o => o.pos.x === nextPos.x && o.pos.y === nextPos.y)
            if (existing && existing.g <= gScore) continue

            openList.push({
                pos: nextPos,
                g: gScore,
                h: hScore,
                f: fScore,
                parent: current
            })
        }
    }

    // No path found, return simple line or empty
    return [end]
}

const heuristic = (a: Point, b: Point) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
