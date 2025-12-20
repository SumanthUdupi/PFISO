import React from 'react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import useGameStore, { SkillTier } from '../../store';
import SpriteIcon from './SpriteIcon';

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

  // Flatten skills for the inventory bar, or pick top skills?
  // Let's flatten all items to show in the bar.
  const allSkills = skills.flatMap(cat => cat.items);

  const getTierColor = (tier: SkillTier) => {
    switch (tier) {
        case 'Master': return '#F1C40F'; // Gold
        case 'Proficient': return '#3498DB'; // Blue
        case 'Novice': return '#2ECC71'; // Green
        default: return '#95A5A6'; // Grey (Locked)
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      padding: '8px',
      background: 'rgba(0,0,0,0.8)',
      border: '4px solid #333',
      borderRadius: '4px',
      pointerEvents: 'auto',
      zIndex: 100,
      maxWidth: '90vw',
      overflowX: 'auto'
    }}>
      {allSkills.map((skill, index) => {
        const currentTier = unlockedSkills[skill.name] || 'Locked';
        const isLocked = currentTier === 'Locked';

        return (
            <div key={index} style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            background: isLocked ? '#2c3e50' : getTierColor(currentTier),
            border: isLocked ? '2px dashed #7f8c8d' : '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLocked ? '#7f8c8d' : 'white',
            fontSize: '16px',
            cursor: 'help',
            flexShrink: 0,
            opacity: isLocked ? 0.5 : 1,
            transition: 'all 0.3s ease'
            }}
            title={isLocked ? '???' : `${skill.name} (${currentTier}): ${skill.description}`}
            >
            {isLocked ? (
                <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px' }}>?</span>
            ) : (
                <SpriteIcon
                    src="./assets/sprites/skill-icons.png"
                    size={32}
                    sheetSize={128}
                    iconSize={32}
                    index={index}
                />
            )}
            {/* Tiny tier indicator dot */}
            {!isLocked && (
                <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    border: '1px solid black'
                }} />
            )}
            </div>
        );
      })}
      <div style={{
        position: 'absolute',
        top: '-25px',
        left: '0',
        width: '100%',
        textAlign: 'center',
        color: 'white',
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '10px',
        textShadow: '2px 2px #000'
      }}>
        INVENTORY (SKILLS)
      </div>
    </div>
  );
};

export default SkillInventory;
