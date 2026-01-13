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
      width: '32px',
      height: '32px',
      background: active ? '#E74C3C' : '#fff', // White instead of grey
      color: active ? 'white' : '#111', // Darker text
      border: '4px solid #111',
      borderBottomWidth: active ? '4px' : '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '10px',
      margin: '2px',
      boxShadow: active ? 'none' : '0 4px 0 rgba(0,0,0,0.2)',
      transform: active ? 'translateY(4px)' : 'none',
      transition: 'all 0.05s',
    };
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none', // Allow clicks to pass through
      zIndex: 100
    }}>
      <div style={getKeyStyle(['KeyW', 'ArrowUp'])}>W</div>
      <div style={{ display: 'flex' }}>
        <div style={getKeyStyle(['KeyA', 'ArrowLeft'])}>A</div>
        <div style={getKeyStyle(['KeyS', 'ArrowDown'])}>S</div>
        <div style={getKeyStyle(['KeyD', 'ArrowRight'])}>D</div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: 'white', textShadow: '2px 2px #000', fontFamily: '"Press Start 2P", cursive' }}>
        MOVE
      </div>
    </div>
  );
};

export default KeyboardGuide;
