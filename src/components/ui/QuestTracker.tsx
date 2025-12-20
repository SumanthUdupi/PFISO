import React from 'react';
import useGameStore from '../../store';

const QuestTracker: React.FC = () => {
  const { currentObjective, isObjectiveComplete } = useGameStore();

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '10px 15px',
      background: 'rgba(0, 0, 0, 0.7)',
      border: '2px solid #F39C12', // Orange for visibility
      borderRadius: '8px',
      color: '#fff',
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '10px',
      maxWidth: '300px',
      zIndex: 100,
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      transition: 'all 0.5s ease',
      transform: isObjectiveComplete ? 'scale(0.95)' : 'scale(1)',
      opacity: isObjectiveComplete ? 0.7 : 1
    }}>
      <div style={{
          color: '#F39C12',
          marginBottom: '5px',
          borderBottom: '1px solid #F39C12',
          paddingBottom: '2px'
      }}>
        CURRENT OBJECTIVE
      </div>
      <div style={{ lineHeight: '1.5', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 'bold' }}>
        {currentObjective}
      </div>
      {isObjectiveComplete && (
          <div style={{ marginTop: '5px', color: '#2ECC71' }}>
              ✓ COMPLETED
          </div>
      )}
    </div>
  );
};

export default QuestTracker;
