import { motion } from 'framer-motion';

export function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 bg-panel-hi rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, var(--color-accent-dim), var(--color-accent))' }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
