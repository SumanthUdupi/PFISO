
interface DiscordPresence {
    details?: string;
    state?: string;
    startTimestamp?: number;
    largeImageKey?: string;
    largeImageText?: string;
    smallImageKey?: string;
    smallImageText?: string;
    partyId?: string;
    partySize?: number;
    partyMax?: number;
    matchSecret?: string;
    joinSecret?: string;
    spectateSecret?: string;
    instance?: boolean;
}

class DiscordRPC {
    private isReady: boolean = false;
    private currentPresence: DiscordPresence = {};

    constructor() {
        this.init();
    }

    private init() {
        // Mock connection delay
        setTimeout(() => {
            this.isReady = true;
            console.log('[DiscordRPC] Connected to local RPC client (Mock)');
        }, 1000);
    }

    public updatePresence(presence: DiscordPresence) {
        if (!this.isReady) {
            // Queue or ignore? For mock, just log warning
            // console.warn('[DiscordRPC] Not ready yet');
            return;
        }

        this.currentPresence = { ...this.currentPresence, ...presence };
        console.log('[DiscordRPC] Presence Updated:', this.currentPresence);

        // In a real electron app, this would call ipcRenderer.send('discord-update-presence', presence);
    }

    public clearPresence() {
        this.currentPresence = {};
        console.log('[DiscordRPC] Presence Cleared');
    }
}

export const discordRPC = new DiscordRPC();
