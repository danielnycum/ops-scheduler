import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary:   'text-white border-0 shadow-[0_0_0_1px_rgba(20,184,166,0.3),0_4px_12px_rgba(20,184,166,0.2)] hover:shadow-[0_0_0_1px_rgba(20,184,166,0.5),0_6px_20px_rgba(20,184,166,0.3)]',
  ai:        'bg-ai-surface border border-ai-dim text-ai-text hover:border-ai hover:shadow-[0_0_12px_rgba(20,184,166,0.2)]',
  danger:    'bg-danger-surface border border-[rgba(127,29,29,0.55)] text-danger-text hover:border-danger',
  success:   'bg-success-surface border border-[rgba(20,83,45,0.7)] text-success-text',
  secondary: 'bg-panel-alt border border-border text-muted hover:border-border-hi hover:text-text',
  ghost:     'text-subtle hover:text-text',
};

const VARIANT_STYLES = {
  primary: {
    background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
  },
  ghost: {
    background: 'var(--surface-1)',
    border: '1px solid var(--border-subtle)',
  },
};

export function Button({ children, variant = 'secondary', onClick, disabled, title, className, type = 'button', style }) {
  const variantStyle = VARIANT_STYLES[variant] || {};
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ ...variantStyle, ...style }}
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
