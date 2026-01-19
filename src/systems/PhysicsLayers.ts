// PH-014: Collision Layers
// Rapier uses bitmasks for interaction groups.
// 16 bits available (0-15).

export enum PhysicsLayers {
    DEFAULT = 0,
    PLAYER = 1,
    ENVIRONMENT = 2,
    PROP = 3,
    INTERACTABLE = 4,
    TRIGGER = 5,
    VEHICLE = 6,
    WATER = 7
}

export const COLLISION_GROUPS = {
    DEFAULT: 0xffff0000 | (1 << PhysicsLayers.DEFAULT), // Collides with everything
    PLAYER: 0xffff0000 | (1 << PhysicsLayers.PLAYER),
    PROP: 0xffff0000 | (1 << PhysicsLayers.PROP),
    // PH-042: Prop Fly Fix - Held objects collide with everything EXCEPT Player (Bit 1)
    HELD_PROP: (0xffff0000 | (1 << PhysicsLayers.PROP)) & ~(1 << PhysicsLayers.PLAYER),
    // Define specific interactions if needed (e.g. TRIGGER only sensing PLAYER)
    // For now, these are the masks.
    // Interaction group format: [membership, filter]
}

// Function to helper generate interaction groups
export const getInteractionGroup = (membership: number, filter: number[] = []) => {
    // This is complex in Rapier notation, simpler to just use generic groups for now.
    // We'll stick to a simpler export for this batch: just the Enums.
}
