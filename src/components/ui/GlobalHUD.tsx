import React from 'react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

interface GlobalHUDProps {
  onNavigate: (section: 'projects' | 'about' | 'contact' | null) => void;
  activeSection: 'projects' | 'about' | 'contact' | null;
}

const GlobalHUD: React.FC<GlobalHUDProps> = ({ onNavigate, activeSection }) => {
  const { isMobile } = useDeviceDetect();
  const navItems = [
    { id: 'projects', label: 'WORK', icon: '💼' },
    { id: 'about', label: 'BIO', icon: '👤' },
    { id: 'contact', label: 'MAIL', icon: '✉️' },
  ] as const;

  return (
    <div style={{
      position: 'absolute',
      top: isMobile ? '20px' : '20px',
      bottom: 'auto',
      right: '20px',
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'row',
      gap: isMobile ? '16px' : '12px',
      zIndex: 1000,
      pointerEvents: 'auto',
    }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            background: activeSection === item.id ? '#F39C12' : '#2C3E50',
            color: activeSection === item.id ? '#333' : 'white',
            border: isMobile ? '2px solid #fff' : '4px solid #fff',
            boxShadow: isMobile ? '2px 2px 0px #000' : '4px 4px 0px #000',
            padding: isMobile ? '16px 20px' : '10px 15px', // Increased touch target
            minWidth: isMobile ? '60px' : 'auto',
            minHeight: isMobile ? '60px' : 'auto',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: isMobile ? '24px' : '12px', // Larger icon on mobile
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
        >
          <span>{item.icon}</span>
          <span className="hud-label" style={{ display: 'none' }}>{item.label}</span>
        </button>
      ))}
      <style>{`
        @media (min-width: 768px) {
          .hud-label {
            display: inline !important;
          }
        }
      `}</style>

      <a
          href="./assets/resume.pdf"
          download
          style={{
            background: '#3498DB',
            color: 'white',
            border: '4px solid #fff',
            boxShadow: '4px 4px 0px #000',
            padding: '10px 15px',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            transition: 'transform 0.1s',
            marginLeft: '10px'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
      >
          <span>💾</span>
          <span className="hud-label" style={{ display: 'none' }}>CV</span>
      </a>
    </div>
  );
};

export default GlobalHUD;
