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
    { id: 'projects', label: 'MY WORK', iconIndex: 0 },
    { id: 'about', label: 'ABOUT ME', iconIndex: 1 },
    { id: 'contact', label: 'CONTACT', iconIndex: 2 },
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
        gap: isMobile ? '16px' : '12px',
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
            whileTap={{ scale: 0.95 }}
            style={{
              background: activeSection === item.id ? '#ffa726' : '#4b3b60',
              color: activeSection === item.id ? '#333' : 'white',
              border: isMobile ? '2px solid #fff' : '4px solid #fff',
              boxShadow: isMobile ? '2px 2px 0px #000' : '4px 4px 0px #000',
              padding: isMobile ? '10px' : '10px 15px',
              minWidth: isMobile ? '48px' : 'auto',
              minHeight: isMobile ? '48px' : 'auto',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: isMobile ? '12px' : '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <SpriteIcon
              src="./assets/sprites/ui-icons.webp"
              size={isMobile ? 32 : 24}
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
          whileTap={{ scale: 0.95 }}
          style={{
            background: '#26a69a',
            color: 'white',
            border: '4px solid #fff',
            boxShadow: '4px 4px 0px #000',
            padding: '10px 15px',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '10px',
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
            size={isMobile ? 32 : 24}
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
