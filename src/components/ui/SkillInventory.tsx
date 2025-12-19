import React from 'react';

interface SkillInventoryProps {
  skills: string[];
}

const SkillInventory: React.FC<SkillInventoryProps> = ({ skills }) => {
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
      zIndex: 100
    }}>
      {skills.map((skill, index) => (
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
          fontSize: '16px', // Icon placeholder size
          cursor: 'help'
        }}
        title={skill}
        >
          {/* Simple initial char as icon or specific icon mapping could go here */}
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px' }}>
            {skill.substring(0, 2).toUpperCase()}
          </span>

          <div style={{
            position: 'absolute',
            bottom: '-20px',
            fontSize: '8px',
            width: '100%',
            textAlign: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            textShadow: '1px 1px #000'
          }}>
            {skill}
          </div>
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
