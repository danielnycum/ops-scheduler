import { cn } from '../../lib/utils';

export function Input({
  value, onChange, placeholder, type = 'text', maxLength,
  error, autoFocus, onKeyDown, id, className, onBlur, style,
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      style={{
        background: 'var(--surface-1)',
        border: error ? '1px solid var(--color-danger)' : '1px solid var(--border-subtle)',
        borderRadius: '10px',
        color: 'var(--color-text)',
        ...style,
      }}
      className={cn(
        'w-full text-[13px] font-sans',
        'px-3 py-2 transition-colors duration-150',
        'placeholder:text-disabled',
        'focus:outline-none focus:border-[rgba(20,184,166,0.6)] focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)]',
        className,
      )}
    />
  );
}
