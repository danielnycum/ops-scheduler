import { useState, useEffect } from 'react';
import { AlertTriangle, CalendarDays, Menu, Sun, Moon, Sparkles, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function Header({ onMenuClick, isMobile }) {
  const {
    conflicts, done, total, pct, tasks,
    view, setView, setSelectedDay,
    setModal, setEditTarget, aiOpen, setAiOpen,
  } = useAppContext();

  const conflictCount = Math.ceil(conflicts.size / 2);
  const [theme, setTheme] = useState(() => localStorage.getItem('clarus_theme') || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('clarus_theme', theme);
  }, [theme]);

  function goToFirstConflict() {
    const t = tasks.find(t => conflicts.has(t.id));
    if (t) { setSelectedDay(t.day); setView('daily'); }
  }

  const pillBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  };

  return (
    <header style={{
      background: 'var(--color-panel)',
      borderBottom: '1px solid rgba(20,184,166,0.2)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 8, flexShrink: 0,
    }}>

      {/* ── Left: hamburger + brand card ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{
            ...pillBase,
            width: 34, height: 34, borderRadius: 9999,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-subtle)',
          }}
          aria-label="Open navigation"
        >
          <Menu size={17} />
        </button>

        {/* Brand card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px 6px 10px',
          borderRadius: 12,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--teal)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarDays size={13} color="white" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              Clarus
            </div>
            <div className="hidden md:block" style={{ fontSize: 10, color: 'var(--color-subtle)', marginTop: 1 }}>
              Study smarter. Not harder.
            </div>
          </div>
        </div>
      </div>

      {/* ── Center: Week / Day pill toggle ── */}
      <div style={{
        display: 'flex', gap: 2, padding: 3,
        borderRadius: 9999,
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        {[
          { key: 'weekly', label: 'Week' },
          { key: 'daily',  label: 'Day'  },
        ].map(({ key, label }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                ...pillBase,
                padding: '5px 14px',
                borderRadius: 9999,
                background: active
                  ? 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)'
                  : 'transparent',
                color: active ? 'white' : 'var(--color-subtle)',
                fontSize: 12, fontWeight: 600,
                boxShadow: active ? '0 1px 6px var(--teal-glow)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Right: conflict + AI + Add Task + progress + theme ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Conflict badge — desktop only */}
        {conflictCount > 0 && (
          <button
            onClick={goToFirstConflict}
            className="hidden md:flex items-center"
            style={{
              ...pillBase,
              gap: 6, padding: '6px 12px', borderRadius: 9999,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 11, fontWeight: 600,
              animation: 'conflictPulse 2.5s ease-in-out infinite',
            }}
          >
            <AlertTriangle size={11} strokeWidth={2.5} />
            {conflictCount} Conflict{conflictCount > 1 ? 's' : ''}
          </button>
        )}

        {/* AI Optimize — desktop only */}
        <button
          onClick={() => setAiOpen(p => !p)}
          className="hidden md:flex items-center"
          style={{
            ...pillBase,
            gap: 7, padding: '7px 16px', borderRadius: 9999,
            background: aiOpen
              ? 'linear-gradient(135deg, var(--teal-deeper) 0%, var(--teal-dark) 100%)'
              : 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
            color: 'white', fontSize: 12, fontWeight: 700,
            boxShadow: '0 2px 10px var(--teal-glow)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px var(--teal-glow)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px var(--teal-glow)'; }}
        >
          <Sparkles size={13} />
          {aiOpen ? 'Close AI' : 'AI Optimize'}
        </button>

        {/* Add Task — always visible */}
        <button
          onClick={() => { setEditTarget(null); setModal('addTask'); }}
          style={{
            ...pillBase,
            gap: 6, padding: '7px 16px', borderRadius: 9999,
            background: 'var(--teal)',
            color: 'white', fontSize: 12, fontWeight: 700,
            boxShadow: '0 2px 10px var(--teal-glow)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-dark)'; e.currentTarget.style.boxShadow = '0 4px 18px var(--teal-glow)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.boxShadow = '0 2px 10px var(--teal-glow)'; }}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Progress pill — desktop only */}
        <div
          className="hidden md:flex items-center"
          style={{
            gap: 8, padding: '6px 14px', borderRadius: 9999,
            background: 'rgba(20,184,166,0.1)',
            border: '1px solid var(--teal-border)',
          }}
        >
          <svg viewBox="0 0 20 20" style={{ width: 18, height: 18, transform: 'rotate(-90deg)', flexShrink: 0 }}>
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
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-muted)' }}>
            {done}<span style={{ color: 'var(--color-subtle)' }}>/{total}</span>
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? 'var(--color-success-text)' : 'var(--teal)' }}>
            {pct}%
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => {
            document.body.classList.add('theme-switching');
            setTheme(t => t === 'dark' ? 'light' : 'dark');
            setTimeout(() => document.body.classList.remove('theme-switching'), 900);
          }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            ...pillBase,
            width: 34, height: 34, borderRadius: 9999,
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-subtle)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-subtle)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
