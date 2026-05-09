import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const VARIANTS = {
  /* Solid indigo — the primary CTA */
  primary:   'bg-accent text-white border border-accent hover:bg-[#5558eb] hover:border-[#5558eb] shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_12px_rgba(99,102,241,0.2)] hover:shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_6px_20px_rgba(99,102,241,0.3)]',
  ai:        'bg-ai-surface border border-ai-dim text-ai-text hover:border-ai hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  danger:    'bg-danger-surface border border-[rgba(127,29,29,0.55)] text-danger-text hover:border-danger',
  success:   'bg-success-surface border border-[rgba(20,83,45,0.7)] text-success-text',
  secondary: 'bg-panel-alt border border-border text-muted hover:border-border-hi hover:text-text',
  ghost:     'bg-transparent border border-transparent text-subtle hover:bg-panel-hi hover:border-border hover:text-text',
};

export function Button({ children, variant = 'secondary', onClick, disabled, title, className, type = 'button', style }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'inline-flex items-center justify-center gap-1.5',
        'px-3 py-1.5 rounded-lg text-[13px] font-medium leading-none',
        'transition-all duration-150 cursor-pointer select-none whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant] || VARIANTS.secondary,
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
