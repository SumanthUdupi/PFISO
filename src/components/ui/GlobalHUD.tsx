import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import QuestTracker from './QuestTracker';
import SpriteIcon from './SpriteIcon';
import useAudioStore from '../../audioStore';
import { resolveAssetPath } from '../../utils/assetUtils';

interface GlobalHUDProps {
  onNavigate: (section: 'projects' | 'about' | 'contact' | null) => void;
  activeSection: 'projects' | 'about' | 'contact' | null;
}

const GlobalHUD: React.FC<GlobalHUDProps> = ({ onNavigate, activeSection }) => {
  const { isMobile } = useDeviceDetect();
  const { playSound } = useAudioStore();
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Hide controls helper after 8 seconds
    const timer = setTimeout(() => setShowControls(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Icons from ui-icons.webp (128x128, assumed 2x2 grid of 64x64 icons)
  // 0: Projects, 1: About, 2: Contact, 3: Resume
  const navItems = [
    { id: 'projects', label: 'WORK', iconIndex: 0, color: '#FFD54F' }, // Warm Gold
    { id: 'about', label: 'ABOUT', iconIndex: 1, color: '#FFB74D' },   // Warm Orange
    { id: 'contact', label: 'CONTACT', iconIndex: 2, color: '#E57373' }, // Warm Red
  ] as const;

  return (
    <>
      <QuestTracker />

      {/* Controls Toast */}
      <AnimatePresence>
        {showControls && !activeSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fcf4e8',
              padding: '12px 24px',
              borderRadius: '8px',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '12px',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 900,
              border: '2px solid #4a3728'
            }}
          >
            {isMobile ? "DRAG TO MOVE • TAP TO INTERACT" : "WASD TO MOVE • ENTER TO INTERACT"}
          </motion.div>
        )}
      </AnimatePresence>

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
              background: activeSection === item.id ? item.color : '#fcf4e8', // Active color or Warm Cream
              color: '#4a3728', // Dark Coffee Brown text
              border: activeSection === item.id ? '3px solid #fff' : `3px solid ${item.color}`,
              borderRadius: '8px', // Pixel/Blocky look as requested
              boxShadow: activeSection === item.id
                ? 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                : '0px 4px 0px rgba(0,0,0,0.2)', // Harder shadow for blocky feel
              transform: activeSection === item.id ? 'translate(0px, 2px)' : 'none',
              padding: isMobile ? '8px' : '10px 18px',
              minWidth: isMobile ? '48px' : 'auto',
              minHeight: isMobile ? '48px' : 'auto',
              fontFamily: '"Press Start 2P", cursive', // Pixel font
              fontSize: isMobile ? '10px' : '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.1s'
            }}
          >
            <SpriteIcon
              src={resolveAssetPath("./assets/sprites/ui-icons.webp")}
              size={isMobile ? 24 : 20}
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
            background: '#9CCC65', // Earthy Green
            color: '#FFFFFF',
            border: '3px solid #33691E',
            borderRadius: '8px',
            boxShadow: '0px 4px 0px #33691E',
            padding: '10px 15px',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            marginLeft: '10px'
          }}
        >
          <SpriteIcon
            src={resolveAssetPath("./assets/sprites/ui-icons.webp")}
            size={isMobile ? 24 : 20}
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
