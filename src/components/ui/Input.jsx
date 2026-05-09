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
        background: 'rgba(255,255,255,0.05)',
        border: error ? '1px solid var(--color-danger)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#e2e8f4',
        ...style,
      }}
      className={cn(
        'w-full text-[13px] font-sans',
        'px-3 py-2 transition-colors duration-150',
        'placeholder:text-[#475569]',
        'focus:outline-none focus:border-[rgba(99,102,241,0.6)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
        className,
      )}
    />
  );
}
