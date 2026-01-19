import React, { useEffect, useState } from 'react';

const KeyboardGuide = () => {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.code]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getKeyStyle = (codes: string[]) => {
    const active = codes.some(code => keys[code]);
    return {
      width: '40px',
      height: '40px',
      background: active ? '#FFAB91' : '#FFF8E1', // Pastel Orange / Cream
      color: '#5D4037', // Dark Brown
      borderRadius: '12px', // COZY: Rounded
      border: 'none',
      borderBottom: active ? 'none' : '4px solid #D7CCC8', // Soft shadow
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      fontWeight: '600',
      fontSize: '14px',
      margin: '4px',
      transform: active ? 'translateY(4px)' : 'none',
      transition: 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: active ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : '0 4px 0 rgba(0,0,0,0.05)'
    };
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      <div style={getKeyStyle(['KeyW', 'ArrowUp'])}>W</div>
      <div style={{ display: 'flex' }}>
        <div style={getKeyStyle(['KeyA', 'ArrowLeft'])}>A</div>
        <div style={getKeyStyle(['KeyS', 'ArrowDown'])}>S</div>
        <div style={getKeyStyle(['KeyD', 'ArrowRight'])}>D</div>
      </div>
      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        color: '#5D4037',
        fontFamily: '"Fredoka", sans-serif',
        fontWeight: 'bold',
        opacity: 0.8
      }}>
        MOVE
      </div>

      {/* SYS-012: Example of a video tooltip trigger (e.g. Space to Jump) */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...getKeyStyle(['Space']), width: '140px' }}>SPACE</div>
        <div style={{
          marginTop: '5px',
          fontSize: '12px',
          color: '#5D4037',
          fontFamily: '"Fredoka", sans-serif',
          fontWeight: 'bold',
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          JUMP
          {/* Video Icon or Indicator */}
          <span style={{ fontSize: '10px', background: '#FF7043', color: 'white', padding: '1px 4px', borderRadius: '4px' }}>VID</span>
        </div>
        {/* The actual video would be shown in a modal or popover when requested, 
                but for the requirement "Tutorial tooltips only display text", 
                we've added video support to InfoModal which serves as the tutorial viewer. 
                This indicator shows available media. 
            */}
      </div>
    </div>
  );
};

export default KeyboardGuide;
