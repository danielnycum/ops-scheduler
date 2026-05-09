import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ onClose, title, width = 440, children }) {
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        className="flex flex-col overflow-hidden
                   w-full max-h-[92dvh] rounded-t-2xl
                   md:rounded-xl md:max-h-[90vh]
                   md:w-[var(--modal-w)] md:max-w-[94vw]"
        style={{
          '--modal-w': `${width}px`,
          background: 'var(--gradient-modal)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px var(--teal-surface)',
        }}
        initial={{ scale: 0.97, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.97, opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 md:px-6 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-[15px] font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-subtle hover:text-text transition-colors duration-150"
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={15} />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="px-5 md:px-6 pb-6 pt-5 overflow-y-auto flex-1">{children}</div>
      </motion.div>
    </motion.div>
  );
}
