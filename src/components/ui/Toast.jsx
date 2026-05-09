import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const TYPE_STYLE = {
  success: { bg:'#062014', border:'#14532d', color:'#4ade80', Icon: CheckCircle2 },
  warn:    { bg:'#1c1002', border:'#78350f', color:'#fbbf24', Icon: AlertTriangle },
  error:   { bg:'#1c0505', border:'#7f1d1d', color:'#f87171', Icon: AlertCircle  },
  info:    { bg:'#060e1e', border:'#1e3a5f', color:'#93c5fd', Icon: Info          },
};

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => {
          const { bg, border, color, Icon } = TYPE_STYLE[t.type] || TYPE_STYLE.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: 12, scale: 0.95  }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onDismiss(t.id)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[12px] font-medium max-w-xs shadow-[0_8px_32px_rgba(0,0,0,0.65)] cursor-pointer pointer-events-auto select-none"
              style={{ background: bg, border: `1px solid ${border}`, color }}
            >
              <Icon size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span className="flex-1 leading-snug">{t.msg}</span>
              {t.onUndo && (
                <button
                  onClick={e => { e.stopPropagation(); t.onUndo(); onDismiss(t.id); }}
                  className="text-[11px] font-semibold uppercase tracking-wide ml-1 opacity-80 hover:opacity-100 transition-opacity"
                >
                  Undo
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
