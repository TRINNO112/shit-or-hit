import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  title = '', 
  type = 'button',
  disabled = false,
  pullStrength = 0.35,
  proximity = 60,
  style = {}
}) {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { stiffness: 350, damping: 20, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (disabled || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < proximity) {
      setIsHovered(true);
      x.set(distanceX * pullStrength);
      y.set(distanceY * pullStrength);
    } else {
      setIsHovered(false);
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <motion.button
        ref={buttonRef}
        type={type}
        title={title}
        disabled={disabled}
        onClick={onClick}
        style={{ x, y, ...style }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}
