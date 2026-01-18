export interface ArtAsset {
    id: string;
    title: string;
    type: string;
    dimensions: string;
    color: string;
    dimensions3D?: [number, number, number];
}

export const ASSET_REGISTRY: Record<string, ArtAsset> = {
    'ARTREQ_001': {
        id: 'ARTREQ_001',
        title: "Modular Office Floor Tile - Warm Oak",
        type: "Environment / Structural",
        dimensions: "4m x 4m (tiling)",
        color: '#d4a373',
        dimensions3D: [4, 0.1, 4]
    },
    'ARTREQ_002': {
        id: 'ARTREQ_002',
        title: "Standard Office Wall Section - Cream Plaster",
        type: "Environment / Structural",
        dimensions: "4m (width) x 3m (height) x 0.2m (depth)",
        color: '#fffcf5',
        dimensions3D: [4, 3, 0.2]
    },
    'ARTREQ_003': {
        id: 'ARTREQ_003',
        title: "Large Bay Window with Sill",
        type: "Environment / Structural",
        dimensions: "2.5m (width) x 2m (height)",
        color: '#ffffff'
    },
    'ARTREQ_004': {
        id: 'ARTREQ_004',
        title: "Minimalist Executive Desk - Walnut",
        type: "Environment / Prop (Hero Object)",
        dimensions: "1.8m x 0.8m x 0.75m",
        color: '#4a403a',
        dimensions3D: [1.8, 0.8, 0.75]
    },
    'ARTREQ_005': {
        id: 'ARTREQ_005',
        title: "Ergonomic Office Chair - Fabric",
        type: "Environment / Prop",
        dimensions: "Standard office chair size.",
        color: '#ccd5ae'
    },
    'ARTREQ_006': {
        id: 'ARTREQ_006',
        title: "Modular Open Bookshelf",
        type: "Environment / Prop",
        dimensions: "1.0m (width) x 2.2m (height) x 0.4m (depth)",
        color: '#4a403a'
    },
    'ARTREQ_007': {
        id: 'ARTREQ_007',
        title: "Geometric Area Rug - Aztec/Boho",
        type: "Environment / Decor",
        dimensions: "2.5m x 3.5m",
        color: '#fffcf5',
        dimensions3D: [2.5, 3.5, 0.1]
    },
    'ARTREQ_008': {
        id: 'ARTREQ_008',
        title: "Modern Pendant Ceiling Light",
        type: "Environment / Lighting Fixture",
        dimensions: "0.4m diameter.",
        color: '#ccd5ae'
    },
    'ARTREQ_009': {
        id: 'ARTREQ_009',
        title: "Potted Monstera Deliciosa",
        type: "Environment / Prop (Nature)",
        dimensions: "1.0m tall.",
        color: '#3a5a40'
    },
    'ARTREQ_010': {
        id: 'ARTREQ_010',
        title: "Floating Wall Shelf (Set of 3)",
        type: "Environment / Decor",
        dimensions: "Various lengths (0.6m, 0.8m, 1.0m).",
        color: '#d4a373'
    },
    'ARTREQ_011': {
        id: 'ARTREQ_011',
        title: "Modern Interior Door - White Oak",
        type: "Environment / Structural",
        dimensions: "0.9m x 2.1m.",
        color: '#fefae0'
    },
    'ARTREQ_012': {
        id: 'ARTREQ_012',
        title: "Wooden Venetian Blinds",
        type: "Environment / Prop",
        dimensions: "Fits Window (ARTREQ_003).",
        color: '#d4a373'
    },
    'ARTREQ_013': {
        id: 'ARTREQ_013',
        title: "Classic Architect Desk Lamp",
        type: "Environment / Prop / Lighting",
        dimensions: "0.6m height (adjustable).",
        color: '#da4b4b'
    },
    'ARTREQ_014': {
        id: 'ARTREQ_014',
        title: "Modern Wood Ceiling Fan",
        type: "Environment / Prop",
        dimensions: "1.2m diameter.",
        color: '#8c6a4a'
    },
    'ARTREQ_015': {
        id: 'ARTREQ_015',
        title: "Mid-Century Plant Stand",
        type: "Environment / Prop",
        dimensions: "0.4m height.",
        color: '#d4a373'
    },
    'ARTREQ_016': {
        id: 'ARTREQ_016',
        title: "Framed Wall Art - Abstract Shapes A",
        type: "Environment / Decor",
        dimensions: "0.6m x 0.9m (Portrait).",
        color: '#d4a373'
    },
    'ARTREQ_017': {
        id: 'ARTREQ_017',
        title: "Framed Wall Art - Abstract Lines B",
        type: "Environment / Decor",
        dimensions: "0.5m x 0.4m (Landscape).",
        color: '#ffffff'
    },
    'ARTREQ_018': {
        id: 'ARTREQ_018',
        title: "Low Office Cabinet / Credenza",
        type: "Environment / Prop",
        dimensions: "1.2m x 0.5m x 0.6m.",
        color: '#ffffff'
    },
    'ARTREQ_019': {
        id: 'ARTREQ_019',
        title: "Minimalist Wall Clock",
        type: "Environment / Prop",
        dimensions: "0.3m diameter.",
        color: '#d4a373'
    },
    'ARTREQ_020': {
        id: 'ARTREQ_020',
        title: "Round Side Table",
        type: "Environment / Prop",
        dimensions: "0.4m diameter, 0.5m height.",
        color: '#ccd5ae'
    },
    'ARTREQ_021': {
        id: 'ARTREQ_021',
        title: "Ceramic Coffee Mug",
        type: "Prop / Interactive",
        dimensions: "Standard mug size.",
        color: '#fefae0'
    },
    'ARTREQ_022': {
        id: 'ARTREQ_022',
        title: "Modern Laptop",
        type: "Prop / Interactive (Hero)",
        dimensions: "15-inch form factor.",
        color: '#cfcfcf'
    },
    'ARTREQ_023': {
        id: 'ARTREQ_023',
        title: "Wirebound Notebook (Open)",
        type: "Prop / Interactive",
        dimensions: "A5 size.",
        color: '#3a5a40'
    },
    'ARTREQ_024': {
        id: 'ARTREQ_024',
        title: "Custom Mechanical Keyboard (65%)",
        type: "Prop",
        dimensions: "65% layout size.",
        color: '#fffcf5'
    },
    'ARTREQ_025': {
        id: 'ARTREQ_025',
        title: "Ergonomic Wireless Mouse",
        type: "Prop",
        dimensions: "Standard mouse.",
        color: '#fffcf5'
    },
    'ARTREQ_026': {
        id: 'ARTREQ_026',
        title: "Small Potted Succulent (Echeveria)",
        type: "Prop / Nature",
        dimensions: "10cm cube.",
        color: '#ccd5ae',
        dimensions3D: [0.1, 0.1, 0.1]
    },
    'ARTREQ_027': {
        id: 'ARTREQ_027',
        title: "Desk Photo Frame",
        type: "Prop / Personal",
        dimensions: "4x6 photo size.",
        color: '#d4a373'
    },
    'ARTREQ_028': {
        id: 'ARTREQ_028',
        title: "Flip-Style Desk Calendar",
        type: "Prop / Interactive",
        dimensions: "Small desk footprint.",
        color: '#2d2424'
    },
    'ARTREQ_029': {
        id: 'ARTREQ_029',
        title: "Wire Mesh Trash Can",
        type: "Prop",
        dimensions: "Standard bin size.",
        color: '#4a403a'
    },
    'ARTREQ_030': {
        id: 'ARTREQ_030',
        title: "Over-Ear Headphones & Stand",
        type: "Prop / Audio",
        dimensions: "Head size.",
        color: '#eaddcf'
    },
    'ARTREQ_031': {
        id: 'ARTREQ_031',
        title: "Felt Desk Mat",
        type: "Prop",
        dimensions: "0.8m x 0.4m.",
        color: '#4a403a'
    },
    'ARTREQ_032': {
        id: 'ARTREQ_032',
        title: "Ceramic Pen Cup",
        type: "Prop",
        dimensions: "Small cylinder.",
        color: '#fffcf5'
    },
    'ARTREQ_033': {
        id: 'ARTREQ_033',
        title: "Sunlight Beam (God Rays)",
        type: "Lighting / Atmosphere",
        dimensions: "Cone shape matching window frame.",
        color: '#fffcf5'
    },
    'ARTREQ_034': {
        id: 'ARTREQ_034',
        title: "Desk Lamp Spot Light",
        type: "Lighting",
        dimensions: "Unknown",
        color: '#ffcc99'
    },
    'ARTREQ_035': {
        id: 'ARTREQ_035',
        title: "Monitor Screen Glow",
        type: "Lighting",
        dimensions: "Unknown",
        color: '#e0f7fa'
    },
    'ARTREQ_036': {
        id: 'ARTREQ_036',
        title: "Draped Fairy Lights",
        type: "Lighting / Prop",
        dimensions: "2m string.",
        color: '#fefae0'
    },
    'ARTREQ_037': {
        id: 'ARTREQ_037',
        title: "Ambient Room Fill Light",
        type: "Lighting",
        dimensions: "Unknown",
        color: '#d4a373'
    },
    'ARTREQ_038': {
        id: 'ARTREQ_038',
        title: "Floating Dust Motes (VFX)",
        type: "VFX / Atmosphere",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_039': {
        id: 'ARTREQ_039',
        title: "Global Volumetric Fog",
        type: "Atmosphere",
        dimensions: "Unknown",
        color: '#fffcf5'
    },
    'ARTREQ_040': {
        id: 'ARTREQ_040',
        title: "Window Bloom Profile",
        type: "Post-Processing",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_041': {
        id: 'ARTREQ_041',
        title: "Soft Interior Shadow Profile",
        type: "Lighting / Settings",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_042': {
        id: 'ARTREQ_042',
        title: "Warm Cinematic LUT",
        type: "Post-Processing / Color",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_043': {
        id: 'ARTREQ_043',
        title: "Night Mode Lighting Profile",
        type: "Lighting / Config",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_044': {
        id: 'ARTREQ_044',
        title: "Sunset HDRI Skybox",
        type: "Environment / Lighting",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_045': {
        id: 'ARTREQ_045',
        title: "Cozy Custom Cursor",
        type: "UI Element",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_046': {
        id: 'ARTREQ_046',
        title: "Interaction Prompt Bubble",
        type: "UI Element / World Space UI",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_047': {
        id: 'ARTREQ_047',
        title: "Glassmorphism Tooltip Box",
        type: "UI Element",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_048': {
        id: 'ARTREQ_048',
        title: "Main Menu Composition",
        type: "UI/Scene",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_049': {
        id: 'ARTREQ_049',
        title: '"Cozy Refined" Day Palette',
        type: "Color Theme",
        dimensions: "Unknown",
        color: '#ffffff'
    },
    'ARTREQ_050': {
        id: 'ARTREQ_050',
        title: '"Deep Focus" Night Palette',
        type: "Color Theme",
        dimensions: "Unknown",
        color: '#ffffff'
    },
};

export const ASSET_LIST = Object.values(ASSET_REGISTRY);
