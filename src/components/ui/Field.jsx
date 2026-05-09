import { cn } from '../../lib/utils';

export function Field({ label, error, children, className, htmlFor }) {
  return (
    <div className={cn('mb-3', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[11px] font-medium uppercase tracking-[0.04em] text-subtle mb-1.5"
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-danger-text leading-tight">{error}</p>
      )}
    </div>
  );
}
