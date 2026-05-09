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
      style={style}
      className={cn(
        'w-full bg-[#070c14] rounded-md text-text text-[13px] font-sans',
        'px-3 py-2 border transition-colors duration-150',
        'placeholder:text-subtle',
        error ? 'border-danger' : 'border-border hover:border-border-hi',
        className,
      )}
    />
  );
}
