import React from 'react';

interface NineSlicePanelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const NineSlicePanel: React.FC<NineSlicePanelProps> = ({ children, style }) => {
  // A 24x24 SVG for a retro "raised" button/window look.
  // 8px corners/edges.
  // Colors: #FFF (Light), #888 (Dark), #C0C0C0 (Face)
  const svgData = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Face -->
  <rect x="0" y="0" width="24" height="24" fill="#C0C0C0"/>

  <!-- Top Highlight -->
  <path d="M0 0H24V8H8V24H0V0Z" fill="white"/>

  <!-- Bottom Shadow -->
  <path d="M24 24H0V16H16V0H24V24Z" fill="#888888"/>

  <!-- Inner Face (Center 8x8) -->
  <rect x="8" y="8" width="8" height="8" fill="#C0C0C0"/>
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
      ...style
    }}>
      {children}
    </div>
  );
};

export default NineSlicePanel;
