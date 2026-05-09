import { Sparkles, FileUp, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const STEPS = [
  {
    n: 1,
    title: 'Add your courses',
    desc: 'Add them in the sidebar or upload your syllabus to pull in every assignment at once.',
  },
  {
    n: 2,
    title: 'Deadlines fill in automatically',
    desc: 'Assignments, exams, and grade weights flow straight from your syllabus into the calendar.',
  },
  {
    n: 3,
    title: 'AI shows you what to do today',
    desc: 'Hit AI Optimize and get a ranked list of what to tackle first based on weight and urgency.',
  },
];

export default function OnboardingOverlay() {
  const { setModal } = useAppContext();

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
      boxSizing: 'border-box',
    }}>

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 20,
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        boxShadow: '0 0 40px rgba(99,102,241,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={26} color="white" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 40, fontWeight: 800, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #e879f9 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1.1,
      }}>
        Clarus
      </h1>

      {/* Tagline */}
      <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 40px', fontWeight: 500 }}>
        Study smarter. Not harder.
      </p>

      {/* Step cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        width: '100%',
        maxWidth: 760,
        marginBottom: 36,
      }}>
        {STEPS.map(step => (
          <div key={step.n} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '24px 20px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.16em', color: '#818cf8', marginBottom: 10,
            }}>
              Step {step.n}
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#e2e8f4',
              marginBottom: 8, lineHeight: 1.3,
            }}>
              {step.title}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              {step.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Syllabus button */}
      <button
        onClick={() => setModal('syllabus')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 32px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.5), 0 8px 32px rgba(99,102,241,0.35)',
          color: 'white', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', marginBottom: 16,
        }}
      >
        <FileUp size={17} strokeWidth={2.2} />
        Upload Your Syllabus
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 11, color: '#475569' }}>or</span>
        <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Add Course Manually button */}
      <button
        onClick={() => setModal('addCourse')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.04)',
          color: '#94a3b8', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <Plus size={14} strokeWidth={2.2} />
        Add Course Manually
      </button>
    </div>
  );
}
