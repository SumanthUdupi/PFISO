/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cozy-bg': '#fffcf5', // Warm Cream
                'cozy-primary': '#eaddcf', // Soft Cashmere
                'cozy-accent': '#d4a373', // Warm Wood/Caramel
                'cozy-sage': '#ccd5ae', // Muted Sage
                'cozy-text': '#4a403a', // Deep Espresso
                'cozy-highlight': '#faedcd', // Soft Vanilla
                'cozy-orange': 'var(--color-primary-glow)', // Keep for backward compat if needed, but redefine var

            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
