import { cn } from '../../lib/utils';

export function Select({ value, onChange, children, id, className }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={cn(
        'w-full text-[13px] font-sans px-3 py-2',
        'transition-colors duration-150',
        'cursor-pointer appearance-none',
        'focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
        className,
      )}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#e2e8f4',
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
