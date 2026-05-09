import { useState, useEffect } from 'react';
import { AlertTriangle, CalendarDays, Menu, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function Header({ onMenuClick, isMobile }) {
  const { conflicts, done, total, pct, tasks, view, setView, setSelectedDay } = useAppContext();
  const conflictCount = Math.ceil(conflicts.size / 2);
  const [theme, setTheme] = useState(() => localStorage.getItem('clarus_theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('clarus_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  function goToFirstConflict() {
    const firstConflictTask = tasks.find(t => conflicts.has(t.id));
    if (firstConflictTask !== undefined) {
      setSelectedDay(firstConflictTask.day);
      setView('daily');
    }
  }

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 px-4 md:px-6 gap-3"
      style={{
        background: 'var(--gradient-header)',
        borderBottom: '1px solid var(--border-subtle)',
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
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)',
              boxShadow: '0 2px 8px var(--teal-glow)',
            }}
          >
            <CalendarDays size={16} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-text">Clarus</h1>
            <div className="hidden md:block text-[11px] text-subtle">Study smarter. Not harder.</div>
          </div>
        </div>
      </div>

      {/* Mobile Week/Day toggle */}
      {isMobile && (
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)' }}
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
                  color:      active ? 'var(--teal-light)' : 'var(--color-subtle)',
                  background: active ? 'var(--teal-surface)' : 'transparent',
                  boxShadow:  active ? '0 0 0 1px var(--teal-border)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right: conflict + progress + theme toggle */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {conflictCount > 0 && (
          <button
            onClick={goToFirstConflict}
            className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-danger-text px-3 py-1.5 rounded-lg cursor-pointer transition-all"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              animation: 'conflictPulse 2.5s ease-in-out infinite',
            }}
          >
            <AlertTriangle size={12} strokeWidth={2.5} />
            {conflictCount} Conflict{conflictCount > 1 ? 's' : ''} — Review
          </button>
        )}

        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="relative w-5 h-5 flex-shrink-0">
            <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
              <circle cx="10" cy="10" r="7" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
              <circle
                cx="10" cy="10" r="7" fill="none"
                stroke="var(--teal)"
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
            style={{ color: pct === 100 ? 'var(--color-success-text)' : 'var(--teal)' }}
          >
            {pct}%
          </span>
        </div>

        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-subtle)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--teal)';
            e.currentTarget.style.borderColor = 'var(--teal-border)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-subtle)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
