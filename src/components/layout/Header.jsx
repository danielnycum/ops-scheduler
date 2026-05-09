import { AlertTriangle, CalendarDays, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function Header({ onMenuClick, isMobile }) {
  const { conflicts, done, total, pct, tasks, view, setView, setSelectedDay } = useAppContext();
  const conflictCount = Math.ceil(conflicts.size / 2);

  function goToFirstConflict() {
    const firstConflictTask = tasks.find(t => conflicts.has(t.id));
    if (firstConflictTask !== undefined) {
      setSelectedDay(firstConflictTask.day);
      setView('daily');
    }
  }

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 px-4 md:px-6 border-b border-border gap-3"
      style={{
        background: 'linear-gradient(180deg, #131c30 0%, var(--color-panel) 100%)',
        paddingTop: '14px',
        paddingBottom: '14px',
      }}
    >
      {/* Left: hamburger (mobile) + brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-subtle hover:text-text hover:bg-panel-hi transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
            }}
          >
            <CalendarDays size={16} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[16px] font-bold tracking-tight" style={{ color: '#e8edf5' }}>
              Clarus
            </h1>
            <div className="hidden md:block text-[11px] text-subtle">
              Study smarter. Not harder.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Week/Day toggle — center-right, visible only on mobile */}
      {isMobile && (
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {[
            { key: 'weekly', label: 'Week' },
            { key: 'daily',  label: 'Day'  },
          ].map(({ key, label }) => {
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 select-none"
                style={{
                  color:      active ? 'var(--color-accent-text)' : 'var(--color-subtle)',
                  background: active
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.12) 100%)'
                    : 'transparent',
                  boxShadow: active ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right: conflict badge + progress — desktop only */}
      <div className="hidden md:flex items-center gap-2.5 flex-wrap justify-end">
        {conflictCount > 0 && (
          <button
            onClick={goToFirstConflict}
            className="flex items-center gap-1.5 text-[11px] font-medium text-danger-text px-3 py-1.5 rounded-lg border border-[rgba(239,68,68,0.3)] bg-danger-surface cursor-pointer transition-all hover:border-danger hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            style={{ animation: 'conflictPulse 2.5s ease-in-out infinite' }}
          >
            <AlertTriangle size={12} strokeWidth={2.5} />
            {conflictCount} Conflict{conflictCount > 1 ? 's' : ''} — Review
          </button>
        )}

        {/* Progress pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="relative w-5 h-5 flex-shrink-0">
            <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
              <circle cx="10" cy="10" r="7" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
              <circle
                cx="10" cy="10" r="7" fill="none"
                stroke="var(--color-accent-text)"
                strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 7}`}
                strokeDashoffset={`${2 * Math.PI * 7 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
          </div>
          <span className="text-[12px] font-mono text-muted">
            {done}<span className="text-subtle">/{total}</span>
          </span>
          <span
            className="text-[12px] font-semibold"
            style={{ color: pct === 100 ? 'var(--color-success-text)' : 'var(--color-accent-text)' }}
          >
            {pct}%
          </span>
        </div>
      </div>
    </header>
  );
}
