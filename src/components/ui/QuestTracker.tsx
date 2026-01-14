import React from 'react';
import useGameStore from '../../store';

const QuestTracker: React.FC = () => {
  const { currentObjective, isObjectiveComplete } = useGameStore();

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '12px 18px',
      background: 'rgba(255, 253, 240, 0.9)', // Cream
      border: '3px solid #E6B0AA', // Pastel Pink / soft red
      borderRadius: '20px', // Rounded
      color: '#5D4037', // Dark Wood Text
      fontFamily: '"Fredoka", sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '300px',
      zIndex: 100,
      boxShadow: '0 4px 10px rgba(93, 64, 55, 0.1)', // Soft shadow
      transition: 'all 0.5s ease',
      transform: isObjectiveComplete ? 'scale(0.95)' : 'scale(1)',
      opacity: isObjectiveComplete ? 0.8 : 1
    }}>
      <div style={{
        color: '#D84315', // Burnt Orange
        marginBottom: '5px',
        borderBottom: '2px dashed #D84315',
        paddingBottom: '4px',
        fontSize: '12px',
        letterSpacing: '1px'
      }}>
        CURRENT GOAL
      </div>
      <div style={{ lineHeight: '1.4' }}>
        {currentObjective}
      </div>
      {isObjectiveComplete && (
        <div style={{ marginTop: '5px', color: '#66BB6A', fontWeight: 'bold' }}>
          ✓ DONE!
        </div>
      )}
    </div>
  );
};

export default QuestTracker;
