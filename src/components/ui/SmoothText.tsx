import React from 'react';
import { motion } from 'framer-motion';

interface SmoothTextProps {
    text: string | React.ReactNode;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
}

const SmoothText: React.FC<SmoothTextProps> = ({ text, delay = 0, className, style }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
            style={style}
        >
            {text}
        </motion.div>
    );
};

export default SmoothText;
