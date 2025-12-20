import React from 'react';

interface NineSlicePanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const NineSlicePanel: React.FC<NineSlicePanelProps> = ({ children, style }) => {
  // A 24x24 SVG for a retro "raised" button/window look.
  // 8px corners/edges.
  // Colors: #FFF (Light), #dcd0c0 (Shadow), #fffbf0 (Face)
  const svgData = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Face -->
  <rect x="0" y="0" width="24" height="24" fill="#fffbf0"/>

  <!-- Top Highlight -->
  <path d="M0 0H24V8H8V24H0V0Z" fill="white"/>

  <!-- Bottom Shadow -->
  <path d="M24 24H0V16H16V0H24V24Z" fill="#dcd0c0"/>

  <!-- Inner Face (Center 8x8) -->
  <rect x="8" y="8" width="8" height="8" fill="#fffbf0"/>
</svg>
`;

  const borderImage = `url("data:image/svg+xml,${encodeURIComponent(svgData.trim())}")`;

  return (
    <div style={{
      borderStyle: 'solid',
      borderWidth: '8px',
      borderImageSource: borderImage,
      borderImageSlice: '8 fill',
      borderImageRepeat: 'stretch',
      imageRendering: 'pixelated',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}>
      {/* REQ-003: Subtle noise overlay for retro feel */}
      <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          zIndex: 0
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
      </div>
    </div>
  );
};

export default NineSlicePanel;
