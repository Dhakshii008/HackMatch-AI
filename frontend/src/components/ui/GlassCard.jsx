import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className, hover = false, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, boxShadow: '0 10px 30px -10px rgba(59,130,246,0.3)' } : {}}
      className={clsx(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
