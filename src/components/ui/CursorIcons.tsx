import React from 'react'

// SVG Strings for cursors
// Using strict 32x32 viewbox for standard cursor size

const ICONS = {
    talk: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="-2" y="-2" width="36" height="36">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.5"/>
        </filter>
        <g filter="url(#shadow)">
            <path d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V20C28 22.2091 26.2091 24 24 24H10L4 29V8Z" fill="#ffeb3b"/>
            <path d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V20C28 22.2091 26.2091 24 24 24H10L4 29V8Z" stroke="black" stroke-width="2"/>
            <circle cx="10" cy="14" r="2" fill="black"/>
            <circle cx="16" cy="14" r="2" fill="black"/>
            <circle cx="22" cy="14" r="2" fill="black"/>
        </g>
    </svg>
    `,
    inspect: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
         <filter id="shadow" x="-2" y="-2" width="36" height="36">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.5"/>
        </filter>
        <g filter="url(#shadow)">
            <circle cx="14" cy="14" r="9" stroke="#29b6f6" stroke-width="3" fill="rgba(41, 182, 246, 0.2)"/>
            <path d="M21 21L28 28" stroke="#29b6f6" stroke-width="4" stroke-linecap="round"/>
            <path d="M21 21L28 28" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </g>
    </svg>
    `,
    grab: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
         <filter id="shadow" x="-2" y="-2" width="36" height="36">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.5"/>
        </filter>
        <g filter="url(#shadow)">
             <path d="M10 4C8.89543 4 8 4.89543 8 6V18C8 19.1046 8.89543 20 10 20C11.1046 20 12 19.1046 12 18V6C12 4.89543 11.1046 4 10 4Z" fill="#ff7043"/>
             <path d="M16 4C14.8954 4 14 4.89543 14 6V18C14 19.1046 14.8954 20 16 20C17.1046 20 18 19.1046 18 18V6C18 4.89543 17.1046 4 16 4Z" fill="#ff7043"/>
             <path d="M22 6C20.8954 6 20 6.89543 20 8V18C20 19.1046 20.8954 20 22 20C23.1046 20 24 19.1046 24 18V8C24 6.89543 23.1046 6 22 6Z" fill="#ff7043"/>
             <path d="M16 28C22.6274 28 28 22.6274 28 16V14H24V17C24 20.5 21.5 24 16 24C10.5 24 8 20.5 8 17V14H4V16C4 22.6274 9.37258 28 16 28Z" fill="#ff7043"/>
             <path d="M4 14H28" stroke="black" stroke-width="1.5"/>
        </g>
    </svg>
    `,
    camera: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
         <filter id="shadow" x="-2" y="-2" width="36" height="36">
             <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.5"/>
         </filter>
         <g filter="url(#shadow)">
             <rect x="4" y="8" width="24" height="16" rx="2" fill="#4caf50" stroke="black" stroke-width="2"/>
             <circle cx="16" cy="16" r="6" fill="none" stroke="black" stroke-width="2"/>
             <circle cx="16" cy="16" r="4" fill="#ffffff"/>
             <circle cx="22" cy="12" r="2" fill="#ff5722"/>
         </g>
    </svg>
    `,
    default: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
         <filter id="shadow" x="-2" y="-2" width="36" height="36">
             <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.5"/>
         </filter>
         <path d="M7 2L23 16L16 17L21 27L17 29L12 19L7 26V2Z" fill="white" filter="url(#shadow)"/>
         <path d="M7 2L23 16L16 17L21 27L17 29L12 19L7 26V2Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
    `
}

export const getCursorUrl = (type: 'talk' | 'inspect' | 'grab' | 'camera' | 'default') => {
    const svg = ICONS[type] || ICONS.default
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
}
