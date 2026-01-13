import React from 'react';
import { motion } from 'framer-motion';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import QuestTracker from './QuestTracker';
import SpriteIcon from './SpriteIcon';
import useAudioStore from '../../audioStore';

interface GlobalHUDProps {
  onNavigate: (section: 'projects' | 'about' | 'contact' | null) => void;
  activeSection: 'projects' | 'about' | 'contact' | null;
}

const GlobalHUD: React.FC<GlobalHUDProps> = ({ onNavigate, activeSection }) => {
  const { isMobile } = useDeviceDetect();
  const { playSound } = useAudioStore();
  // Icons from ui-icons.webp (128x128, assumed 2x2 grid of 64x64 icons)
  // 0: Projects, 1: About, 2: Contact, 3: Resume
  const navItems = [
    { id: 'projects', label: 'WORK', iconIndex: 0, color: '#80CBC4' }, // Pastel Teal
    { id: 'about', label: 'ABOUT', iconIndex: 1, color: '#FFCC80' },   // Pastel Orange
    { id: 'contact', label: 'CONTACT', iconIndex: 2, color: '#EF9A9A' }, // Pastel Red
  ] as const;

  return (
    <>
      <QuestTracker />
      <div style={{
        position: 'absolute',
        top: isMobile ? 'calc(20px + var(--safe-area-top))' : '20px',
        bottom: 'auto',
        right: 'calc(20px + env(safe-area-inset-right, 0px))',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'row',
        gap: isMobile ? '12px' : '16px',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}>
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => {
              playSound('click');
              onNavigate(item.id);
            }}
            whileHover={{ scale: 1.05, rotate: isMobile ? 0 : [0, -2, 2, 0] }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: activeSection === item.id ? item.color : '#FFF8E1', // Active color or Cream
              color: '#3E2723', // Darker Brown text for contrast
              border: activeSection === item.id ? '3px solid #fff' : `3px solid ${item.color}`,
              borderRadius: '20px', // Rounded
              boxShadow: activeSection === item.id
                ? 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                : '0px 4px 0px rgba(0,0,0,0.1)', // Soft shadow
              transform: activeSection === item.id ? 'translate(0px, 2px)' : 'none',
              padding: isMobile ? '8px' : '10px 18px',
              minWidth: isMobile ? '48px' : 'auto',
              minHeight: isMobile ? '48px' : 'auto',
              fontFamily: '"Fredoka", sans-serif',
              fontWeight: '600',
              fontSize: isMobile ? '12px' : '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.1s'
            }}
          >
            <SpriteIcon
              src="./assets/sprites/ui-icons.webp"
              size={isMobile ? 28 : 24}
              sheetSize={128}
              iconSize={64}
              index={item.iconIndex}
            />
            <span className="hud-label" style={{ display: 'none' }}>{item.label}</span>
          </motion.button>
        ))}
        <style>{`
        @media (min-width: 768px) {
          .hud-label {
            display: inline !important;
          }
        }
      `}</style>

        <motion.a
          href="./assets/resume.pdf"
          download
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#81D4FA', // Pastel Blue
            color: '#FFFFFF',
            border: '3px solid #FFF',
            borderRadius: '20px',
            boxShadow: '0px 4px 0px rgba(0,0,0,0.1)',
            padding: '10px 15px',
            fontFamily: '"Fredoka", sans-serif',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            marginLeft: '10px'
          }}
        >
          <SpriteIcon
            src="./assets/sprites/ui-icons.webp"
            size={isMobile ? 28 : 24}
            sheetSize={128}
            iconSize={64}
            index={3}
          />
          <span className="hud-label" style={{ display: 'none' }}>CV</span>
        </motion.a>
      </div>
    </>
  );
};

export default GlobalHUD;
