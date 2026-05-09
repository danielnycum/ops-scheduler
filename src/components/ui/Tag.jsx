import { cn } from '../../lib/utils';

export function Tag({ children, color, bg, border, pill = false, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap',
        pill ? 'px-2 py-0.5 rounded-full' : 'px-1.5 py-0.5 rounded',
        className,
      )}
      style={{
        color,
        background: bg,
        border: border ? `1px solid ${border}` : undefined,
      }}
    >
      {children}
    </span>
  );
}
