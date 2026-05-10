import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import HistoryView from './components/HistoryView';

export default function App() {
  const { ready, view, setView, modal, aiOpen, tasks, courses } = useAppContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

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

        {/* Mobile backdrop */}
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

        {/* Sidebar */}
        <div
          className={[
            'fixed inset-y-0 left-0 z-50',
            'md:relative md:inset-auto md:z-auto md:translate-x-0',
            'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          style={{ width: isMobile ? '85vw' : '240px' }}
        >
          <Sidebar onClose={() => setMobileNavOpen(false)} />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
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
                ) : view === 'history' ? (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1,  x: 0  }}
                    exit={{    opacity: 0,  x: 12  }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full"
                  >
                    <HistoryView />
                  </motion.div>
                ) : (
                  <motion.div
                    key="daily-view"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1,  x: 0  }}
                    exit={{    opacity: 0,  x: 12  }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full"
                  >
                    <DailyView />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(modal === 'addTask' || modal === 'editTask') && <TaskModal key="task-modal" />}
        {modal === 'addCat' && <CatModal key="cat-modal" />}
        {(modal === 'addCourse' || modal === 'editCourse') && <CourseModal key="course-modal" />}
        {modal === 'syllabus'        && <SyllabusModal key="syllabus-modal" />}
        {modal === 'syllabusConfirm' && <SyllabusConfirmModal key="syllabus-confirm-modal" />}
        {modal === 'gradeCalc'       && <GradeCalculatorModal key="grade-calc-modal" />}
      </AnimatePresence>

      {/* AI Panel */}
      <AnimatePresence>
        {aiOpen && <AIPanel key="ai-panel" />}
      </AnimatePresence>
    </div>
  );
}
