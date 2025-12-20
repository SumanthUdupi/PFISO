import React from 'react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

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

  if (isMobile) return null;

  // Flatten skills for the inventory bar, or pick top skills?
  // Let's flatten all items to show in the bar.
  const allSkills = skills.flatMap(cat => cat.items);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      padding: '8px',
      background: 'rgba(0,0,0,0.6)',
      border: '4px solid #333',
      borderRadius: '4px',
      pointerEvents: 'auto',
      zIndex: 100,
      maxWidth: '90vw',
      overflowX: 'auto'
    }}>
      {allSkills.map((skill, index) => (
        <div key={index} style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          background: '#2c3e50',
          border: '2px solid #7f8c8d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          cursor: 'help',
          flexShrink: 0
        }}
        title={`${skill.name} (${skill.level}): ${skill.description}`}
        >
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px' }}>
            {skill.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      ))}
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
