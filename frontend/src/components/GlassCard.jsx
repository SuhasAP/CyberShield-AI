import React from 'react'
import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', title, headerAction, delay = 0, hoverable = false }) {
  const cardClasses = `glass-panel rounded-xl p-5 ${
    hoverable ? 'glass-panel-hover' : ''
  } ${className}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cardClasses}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
          {title && (
            <h3 className="font-semibold text-lg text-cyber-text tracking-wide flex items-center gap-2">
              {title}
            </h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
