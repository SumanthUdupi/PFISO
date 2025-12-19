import React from 'react';
import { motion } from 'framer-motion';

interface PixelTransitionProps {
  children: React.ReactNode;
}

const PixelTransition: React.FC<PixelTransitionProps> = ({ children }) => {
  // A simple dissolve effect using a pixel pattern mask or just opacity with steps
  // Since real pixel dissolve requires complex shaders or many divs, we'll simulate it with a grainy opacity transition

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: "steps(5)" }} // Stepped easing gives a jerky/retro feel
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PixelTransition;
