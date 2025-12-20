import React from 'react';

interface SpriteIconProps {
  src: string;
  size?: number; // Display size in pixels (width/height)
  sheetSize?: number; // Total width/height of the sprite sheet
  iconSize?: number; // Width/height of a single icon in the sheet
  index?: number; // Index of the icon (row-major)
  x?: number; // Custom x coordinate (if not using index)
  y?: number; // Custom y coordinate (if not using index)
  style?: React.CSSProperties;
  className?: string;
}

const SpriteIcon: React.FC<SpriteIconProps> = ({
  src,
  size = 32,
  sheetSize = 128,
  iconSize = 32,
  index = 0,
  x,
  y,
  style,
  className
}) => {
  // Calculate position
  let posX = x;
  let posY = y;

  if (posX === undefined || posY === undefined) {
    const iconsPerRow = Math.floor(sheetSize / iconSize);
    posX = (index % iconsPerRow) * iconSize;
    posY = Math.floor(index / iconsPerRow) * iconSize;
  }

  // Calculate scaling factor
  // We want to show a 'iconSize' chunk at 'size' dimensions.
  // background-size should be: (sheetSize / iconSize) * size
  const scale = size / iconSize;
  const bgSize = sheetSize * scale;

  // Background position needs to be negative
  const bgPosX = -posX! * scale;
  const bgPosY = -posY! * scale;

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
        backgroundSize: `${bgSize}px ${bgSize}px`,
        imageRendering: 'pixelated', // Important for pixel art
        flexShrink: 0,
        ...style
      }}
    />
  );
};

export default SpriteIcon;
