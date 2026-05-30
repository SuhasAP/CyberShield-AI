import React from 'react'
import { motion } from 'framer-motion'

export default function CyberButton({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'cyan', // 'cyan', 'rose', 'emerald', 'amber', 'slate'
  className = '', 
  disabled = false,
  loading = false
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'rose':
        return 'border-cyber-rose/60 text-cyber-rose hover:bg-cyber-rose/10 hover:shadow-cyber-rose';
      case 'emerald':
        return 'border-cyber-emerald/60 text-cyber-emerald hover:bg-cyber-emerald/10 hover:shadow-cyber-emerald';
      case 'amber':
        return 'border-cyber-amber/60 text-cyber-amber hover:bg-cyber-amber/10 hover:shadow-cyber-amber';
      case 'slate':
        return 'border-cyber-slate/40 text-cyber-slate hover:bg-cyber-slate/10';
      case 'cyan':
      default:
        return 'border-cyber-cyan/60 text-cyber-cyan hover:bg-cyber-cyan/10 hover:shadow-cyber-cyan';
    }
  };

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-5 py-2.5 rounded border font-semibold text-sm uppercase tracking-wider
        transition-all duration-300 ease-out focus:outline-none flex items-center justify-center gap-2
        ${getVariantStyles()}
        ${disabled || loading ? 'opacity-40 cursor-not-allowed border-gray-600 text-gray-500 hover:bg-transparent hover:shadow-none' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </>
      ) : children}
    </motion.button>
  );
}
