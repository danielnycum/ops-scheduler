import { cn } from '../../lib/utils';

export function Select({ value, onChange, children, id, className }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={cn(
        'w-full bg-[#070c14] border border-border rounded-md',
        'text-text text-[13px] font-sans px-3 py-2',
        'hover:border-border-hi transition-colors duration-150',
        'cursor-pointer appearance-none',
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a7a99' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '32px',
      }}
    >
      {children}
    </select>
  );
}
