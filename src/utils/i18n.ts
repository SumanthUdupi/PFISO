export type Locale = 'en' | 'es' | 'fr' | 'de';

const dictionaries: Record<Locale, Record<string, string>> = {
    en: {
        'game.title': 'PFISO',
        'menu.start': 'Start Game',
        'menu.settings': 'Settings',
        'menu.quit': 'Quit',
        'gameover.respawn': 'Respawn',
        'gameover.title': 'Game Over',
        'hud.objective': 'Current Objective',
        'inventory.title': 'Inventory',
        'inventory.sort': 'Sort',
        'interaction.pickup': 'Pick up',
        'interaction.open': 'Open',
    },
    es: {
        'game.title': 'PFISO',
        'menu.start': 'Iniciar Juego',
        'menu.settings': 'Ajustes',
        'menu.quit': 'Salir',
        'gameover.respawn': 'Reaparecer',
        'gameover.title': 'Fin del Juego',
        'hud.objective': 'Objetivo Actual',
        'inventory.title': 'Inventario',
        'inventory.sort': 'Ordenar',
        'interaction.pickup': 'Recoger',
        'interaction.open': 'Abrir',
    },
    fr: {
        'game.title': 'PFISO',
        'menu.start': 'Commencer',
        'menu.settings': 'Paramètres',
        'menu.quit': 'Quitter',
        'gameover.respawn': 'Réapparaître',
        'gameover.title': 'Jeu Terminé',
        'hud.objective': 'Objectif Actuel',
        'inventory.title': 'Inventaire',
        'inventory.sort': 'Trier',
        'interaction.pickup': 'Ramasser',
        'interaction.open': 'Ouvrir',
    },
    de: {
        'game.title': 'PFISO',
        'menu.start': 'Starten',
        'menu.settings': 'Einstellungen',
        'menu.quit': 'Beenden',
        'gameover.respawn': 'Wiederbeleben',
        'gameover.title': 'Spiel Vorbei',
        'hud.objective': 'Aktuelles Ziel',
        'inventory.title': 'Inventar',
        'inventory.sort': 'Sortieren',
        'interaction.pickup': 'Aufheben',
        'interaction.open': 'Öffnen',
    }
};

let currentLocale: Locale = 'en';

export const setLocale = (locale: Locale) => {
    if (dictionaries[locale]) {
        currentLocale = locale;
        // Dispatch event to force re-render if using hook
        window.dispatchEvent(new Event('language-change'));
    }
};

export const t = (key: string): string => {
    return dictionaries[currentLocale][key] || key;
};

// SYS-038: Locale Date
export const formatDate = (date: Date | string | number) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
