import { motion } from 'framer-motion';
import { Sparkles, GraduationCap, CalendarDays, Zap, FileUp, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const STEPS = [
  {
    n: 1,
    Icon: GraduationCap,
    color: '#818cf8',
    glow: '#6366f1',
    title: 'Add your courses',
    desc: 'Add them in the sidebar or upload your syllabus to pull in every assignment at once.',
  },
  {
    n: 2,
    Icon: CalendarDays,
    color: '#c084fc',
    glow: '#a855f7',
    title: 'Deadlines fill in automatically',
    desc: 'Assignments, exams, and grade weights flow straight from your syllabus into the calendar.',
  },
  {
    n: 3,
    Icon: Zap,
    color: '#e879f9',
    glow: '#c026d3',
    title: 'AI shows you what to do today',
    desc: 'Hit AI Optimize and get a ranked list of what to tackle first based on weight and urgency.',
  },
];

export default function OnboardingOverlay() {
  const { setModal } = useAppContext();

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-8 py-10 overflow-hidden">

      {/* Soft radial backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(99,102,241,0.08) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 70% 70%, rgba(168,85,247,0.05) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Logo */}
      <motion.div
        className="flex flex-col items-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.div
          className="w-11 h-11 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 md:mb-4"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            boxShadow: '0 0 48px rgba(99,102,241,0.40), 0 0 0 1px rgba(99,102,241,0.3)',
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={20} className="text-white md:hidden" strokeWidth={1.8} />
          <Sparkles size={26} className="text-white hidden md:block" strokeWidth={1.8} />
        </motion.div>

        <h1
          className="text-[32px] md:text-[44px] font-bold tracking-tight leading-none mb-2"
          style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Clarus
        </h1>
        <p className="text-[13px] md:text-[15px] font-medium tracking-wide" style={{ color: 'var(--color-subtle)' }}>
          Study smarter. Not harder.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl mb-7 md:mb-10">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
          >
            <StepCard step={step} />
          </motion.div>
        ))}
      </div>

      {/* CTAs */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.52 }}
      >
        <motion.button
          onClick={() => setModal('syllabus')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-[14px] font-semibold text-white select-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.5), 0 8px 36px rgba(99,102,241,0.38)',
          }}
        >
          <FileUp size={16} strokeWidth={2.2} />
          Upload Your Syllabus
        </motion.button>

        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-disabled)' }}>
          <span className="w-12 h-px" style={{ background: 'var(--color-border)' }} />
          or
          <span className="w-12 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        <button
          onClick={() => setModal('addCourse')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium border transition-all duration-150 cursor-pointer select-none"
          style={{
            color: 'var(--color-subtle)',
            borderColor: 'var(--color-border)',
            background: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-muted)';
            e.currentTarget.style.borderColor = 'var(--color-border-hi)';
            e.currentTarget.style.background = 'var(--color-panel-hi)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-subtle)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Plus size={14} strokeWidth={2.2} />
          Add Course Manually
        </button>
      </motion.div>
    </div>
  );
}

function StepCard({ step }) {
  const { Icon } = step;
  return (
    <div
      className="flex flex-row md:flex-col items-start md:items-center gap-3 md:gap-3 p-4 md:p-5 rounded-2xl border md:text-center h-full"
      style={{
        background:   `rgba(${hexChannels(step.glow)},0.05)`,
        borderColor:  `rgba(${hexChannels(step.glow)},0.14)`,
      }}
    >
      {/* Icon circle */}
      <div
        className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background:   `rgba(${hexChannels(step.glow)},0.14)`,
          color:        step.color,
          boxShadow:    `0 0 16px rgba(${hexChannels(step.glow)},0.18)`,
        }}
      >
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">

      {/* Step label */}
      <span
        className="text-[9px] font-bold uppercase tracking-[0.18em]"
        style={{ color: step.color, opacity: 0.85 }}
      >
        Step {step.n}
      </span>

      {/* Title */}
      <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
        {step.title}
      </p>

      {/* Description */}
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-subtle)' }}>
        {step.desc}
      </p>

      </div>
    </div>
  );
}

function hexChannels(hex) {
  if (!hex?.startsWith('#')) return '148,163,184';
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  if (isNaN(r+g+b)) return '148,163,184';
  return `${r},${g},${b}`;
}
