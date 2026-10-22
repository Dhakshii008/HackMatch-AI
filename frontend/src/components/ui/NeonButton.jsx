import React from 'react';
import clsx from 'clsx';

const NeonButton = ({ children, className, variant = 'primary', ...props }) => {
  const base = "relative px-6 py-2.5 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-transparent",
    outline: "bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
};

export default NeonButton;
