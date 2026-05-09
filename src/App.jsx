import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Plus, LayoutGrid, Calendar } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import WeeklyView from './components/WeeklyView';
import DailyView from './components/DailyView';
import TaskModal from './components/TaskModal';
import CatModal from './components/CatModal';
import CourseModal from './components/CourseModal';
import SyllabusModal from './components/SyllabusModal';
import SyllabusConfirmModal from './components/SyllabusConfirmModal';
import GradeCalculatorModal from './components/GradeCalculatorModal';
import OnboardingOverlay from './components/OnboardingOverlay';
import AIPanel from './components/AIPanel';
import { Button } from './components/ui/Button';

export default function App() {
  const { ready, view, setView, modal, aiOpen, setModal, setEditTarget, setAiOpen, tasks, courses } = useAppContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  // Track mobile breakpoint and auto-switch to daily on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    if (mq.matches) setView('daily');
    const handler = e => {
      setIsMobile(e.matches);
      if (e.matches) setView('daily');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close mobile nav when a modal opens
  useEffect(() => {
    if (modal) setMobileNavOpen(false);
  }, [modal]);


  if (!ready) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="flex items-center gap-3 text-[12px] font-medium text-subtle uppercase tracking-[0.16em]">
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--color-accent)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          Loading
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text font-sans flex flex-col" style={{ background: 'transparent' }}>
      <Header onMenuClick={() => setMobileNavOpen(p => !p)} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">

        {/* ── Mobile backdrop ── */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              key="mobile-backdrop"
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Sidebar: fixed drawer on mobile, normal flow on desktop ── */}
        <div
          className={[
            'fixed inset-y-0 left-0 z-50',
            'md:relative md:inset-auto md:z-auto md:translate-x-0',
            'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <Sidebar onClose={() => setMobileNavOpen(false)} />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── Toolbar ── */}
          <div
            className="flex items-center justify-end md:justify-between px-4 md:px-5 py-3 border-b border-border flex-shrink-0 gap-3"
            style={{ background: 'rgba(11,15,26,0.7)', backdropFilter: 'blur(8px)' }}
          >
            {/* View toggle — desktop only */}
            <div
              className="hidden md:flex gap-0.5 p-1 rounded-xl border border-border"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {[
                { key: 'weekly', label: 'Week', Icon: LayoutGrid },
                { key: 'daily',  label: 'Day',  Icon: Calendar   },
              ].map(({ key, label, Icon }) => (
                <div key={key} className="relative">
                  {view === key && (
                    <motion.div
                      layoutId="viewToggleActive"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.1) 100%)',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                    />
                  )}
                  <button
                    onClick={() => setView(key)}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors duration-150 cursor-pointer z-10 select-none"
                    style={{ color: view === key ? 'var(--color-accent-text)' : 'var(--color-subtle)' }}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* AI Optimize — desktop only (mobile: in sidebar) */}
              <Button
                variant="ai"
                onClick={() => setAiOpen(p => !p)}
                className={`hidden md:flex ${aiOpen ? 'border-ai' : ''}`}
              >
                <Sparkles size={13} />
                {aiOpen ? 'Close AI' : 'AI Optimize'}
              </Button>

              {/* Add Task — always visible */}
              <motion.button
                onClick={() => { setEditTarget(null); setModal('addTask'); }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white select-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #5558eb 100%)',
                  boxShadow: '0 0 0 1px rgba(99,102,241,0.5), 0 4px 14px rgba(99,102,241,0.3)',
                  transition: 'box-shadow 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.7), 0 6px 20px rgba(99,102,241,0.45)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6a6ef5 0%, #6366f1 100%)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(99,102,241,0.5), 0 4px 14px rgba(99,102,241,0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #5558eb 100%)';
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Task</span>
                <span className="sm:hidden">Add</span>
                <kbd className="hidden md:inline-flex items-center text-[10px] font-mono opacity-50 ml-0.5 border border-white/20 rounded px-1">N</kbd>
              </motion.button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-auto p-4 md:p-5 flex flex-col">
            {tasks.length === 0 && courses.length === 0 ? (
              <OnboardingOverlay />
            ) : (
            <AnimatePresence mode="wait" initial={false}>
              {view === 'weekly' ? (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1,  x: 0   }}
                  exit={{    opacity: 0,  x: -12  }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  className="h-full"
                >
                  <WeeklyView />
                </motion.div>
              ) : (
                <motion.div
                  key="daily-view"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1,  x: 0  }}
                  exit={{    opacity: 0,  x: 12  }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  <DailyView />
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(modal === 'addTask' || modal === 'editTask') && <TaskModal key="task-modal" />}
        {modal === 'addCat' && <CatModal key="cat-modal" />}
        {(modal === 'addCourse' || modal === 'editCourse') && <CourseModal key="course-modal" />}
        {modal === 'syllabus'        && <SyllabusModal key="syllabus-modal" />}
        {modal === 'syllabusConfirm' && <SyllabusConfirmModal key="syllabus-confirm-modal" />}
        {modal === 'gradeCalc'       && <GradeCalculatorModal key="grade-calc-modal" />}
      </AnimatePresence>

      {/* ── AI Panel ── */}
      <AnimatePresence>
        {aiOpen && <AIPanel key="ai-panel" />}
      </AnimatePresence>
    </div>
  );
}
