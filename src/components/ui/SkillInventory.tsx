import React from 'react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import useGameStore, { SkillTier } from '../../store';
import SpriteIcon from './SpriteIcon';
import { resolveAssetPath } from '../../utils/assetUtils';

interface SkillItem {
  name: string;
  level: string;
  description: string;
  certification?: string;
}

interface SkillCategory {
  category: string;
  items: SkillItem[];
}

interface SkillInventoryProps {
  skills: SkillCategory[];
}

const SkillInventory: React.FC<SkillInventoryProps> = ({ skills }) => {
  const { isMobile } = useDeviceDetect();
  const { unlockedSkills } = useGameStore();

  if (isMobile) return null;

  const allSkills = skills.flatMap(cat => cat.items);

  const getTierColor = (tier: SkillTier) => {
    switch (tier) {
      case 'Master': return '#FFD54F'; // Pastel Gold
      case 'Proficient': return '#90CAF9'; // Pastel Blue
      case 'Novice': return '#A5D6A7'; // Pastel Green
      default: return '#E0E0E0'; // Light Grey
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '12px',
      padding: '12px 20px',
      background: 'rgba(255, 253, 240, 0.95)', // Cream background
      borderRadius: '24px', // Rounded pill shape
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', // Soft diffuse shadow
      pointerEvents: 'auto',
      zIndex: 100,
      maxWidth: '90vw',
      overflowX: 'auto',
      border: '4px solid #FFE0B2' // Soft Orange Border
    }}>
      {allSkills.map((skill, index) => {
        const currentTier = unlockedSkills[skill.name] || 'Locked';
        const isLocked = currentTier === 'Locked';

        return (
          <div key={index} style={{
            position: 'relative',
            width: '48px',
            height: '48px',
            background: isLocked ? '#F5F5F5' : getTierColor(currentTier),
            borderRadius: '12px',
            border: isLocked ? '2px dashed #BDBDBD' : '3px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLocked ? '#BDBDBD' : '#5D4037',
            cursor: 'help',
            flexShrink: 0,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isLocked ? 'scale(0.9)' : 'scale(1)',
            boxShadow: isLocked ? 'none' : '0 4px 10px rgba(0,0,0,0.1)'
          }}
            title={isLocked ? '???' : `${skill.name} (${currentTier}): ${skill.description}`}
          >
            {isLocked ? (
              <span style={{ fontFamily: '"Fredoka", sans-serif', fontSize: '14px', fontWeight: 'bold' }}>?</span>
            ) : (
              <SpriteIcon
                src={resolveAssetPath("./assets/sprites/skill-icons.webp")}
                size={32}
                sheetSize={128}
                iconSize={32}
                index={index}
              />
            )}

            {/* Status Dot */}
            {!isLocked && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: getTierColor(currentTier), // Match tier color
                border: '2px solid white',
              }} />
            )}
          </div>
        );
      })}

      <div style={{
        position: 'absolute',
        top: '-32px',
        left: '0',
        width: '100%',
        textAlign: 'center',
        color: '#5D4037', // Dark Brown
        fontFamily: '"Fredoka", sans-serif',
        fontWeight: 'bold',
        fontSize: '14px',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '4px 12px',
        borderRadius: '12px',
        width: 'fit-content',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        🎒 SKILLS
      </div>
    </div>
  );
};

export default SkillInventory;
