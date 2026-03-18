import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Check, AlertCircle, ChevronDown,
  Layout, Server, Smartphone, Brain, Cloud, Shield, Palette 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ParallaxBG from '../components/ParallaxBG';

/* ── Configuration ── */
const STEPS = [
  { id: 'personal', label: 'Personal', title: 'Personal Details', desc: 'Start with your core profile.' },
  { id: 'academic', label: 'Academic', title: 'Academic Background', desc: 'Share your college and study details.' },
  { id: 'profiles', label: 'Profiles', title: 'Profile Links', desc: 'Add your public profiles so we can see your work.' },
  { id: 'domain',   label: 'Domain',   title: 'Domain & Tech Stack', desc: 'Tell us what you build with.' },
  { id: 'motivation', label: 'Motivation', title: 'Why Code Catalysts?', desc: 'A few lines on what you want to build here.' },
  { id: 'review',   label: 'Review',   title: 'Review & Submit', desc: 'Double-check everything before sending.' },
];

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Grad'];
const DOMAIN_OPTIONS = [
  'Frontend Development', 'Backend Development', 'App Development',
  'AI/ML', 'Cloud', 'Cyber Security', 'UI/UX',
];

const DOMAIN_ICONS = {
  'Frontend Development': <Layout size={16} />,
  'Backend Development': <Server size={16} />,
  'App Development': <Smartphone size={16} />,
  'AI/ML': <Brain size={16} />,
  'Cloud': <Cloud size={16} />,
  'Cyber Security': <Shield size={16} />,
  'UI/UX': <Palette size={16} />,
};

const INITIAL = {
  name: '', email: '', year: '', college: '', branch: '',
  github: '', linkedin: '', domain: '', techStack: '',
  whyJoin: '', project: '',
};

const FIELD_META = {
  name: { label: 'Full Name', placeholder: 'Your full name', required: true },
  email: { label: 'Email', placeholder: 'you@domain.com', type: 'email', required: true },
  college: { label: 'College / University', placeholder: 'e.g. GLA University', required: true },
  branch: { label: 'Branch', placeholder: 'e.g. Computer Science', required: true },
  year: { label: 'Year of Study', required: true, type: 'select', options: YEAR_OPTIONS },
  github: { label: 'GitHub', placeholder: 'https://github.com/you', required: true },
  linkedin: { label: 'LinkedIn', placeholder: 'https://linkedin.com/in/you', required: true },
  domain: { label: 'Primary Domain', required: true, type: 'select', options: DOMAIN_OPTIONS },
  techStack: { label: 'Tech Stack', placeholder: 'Languages, frameworks, tools you ship with...', required: true, type: 'textarea' },
  project: { label: 'A Project You\'re Proud Of', placeholder: 'What you built, your role, stack, and outcome', required: true, type: 'textarea' },
  whyJoin: { label: 'Why Join Code Catalysts?', placeholder: 'What do you want to build here? What excites you?', required: true, type: 'textarea' },
};

const STEP_FIELDS = [
  ['name', 'email'],
  ['college', 'branch', 'year'],
  ['github', 'linkedin'],
  ['domain', 'techStack', 'project'],
  ['whyJoin'],
  Object.keys(INITIAL), // review
];

const PROD_API_ORIGIN = 'https://code-catalysts.vercel.app';
const SUCCESS_REDIRECT_SECONDS = 10;

const normalizeBaseUrl = (value) => (value ? value.replace(/\/$/, '') : '');

function getApplyApiUrl() {
  const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL?.trim());
  if (configuredBaseUrl) {
    return `${configuredBaseUrl}/api/apply`;
  }

  if (typeof window === 'undefined') {
    return '/api/apply';
  }

  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${PROD_API_ORIGIN}/api/apply`;
  }

  return '/api/apply';
}

/* ── Custom Select Component ── */
const CustomSelect = ({ value, onChange, options, placeholder, baseStyle, icons = {} }) => {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState('bottom');
  const containerRef = useRef(null);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDirection(spaceBelow < 300 && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: open ? 100 : 1 }}>
      <div 
        className="premium-input select-trigger"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        style={{ 
          ...baseStyle, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          color: value ? '#e8e8f0' : 'rgba(160,175,195,.4)',
          border: open ? '1.5px solid rgba(0,212,255,0.4)' : baseStyle.border,
          boxShadow: open ? '0 0 15px rgba(0,212,255,0.1)' : 'none',
        }}
        tabIndex={0}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {value && icons[value] && (
            <span style={{ color: 'var(--neon-cyan)', display: 'flex', opacity: 0.8 }}>
              {icons[value]}
            </span>
          )}
          <span style={{ transition: 'all 0.3s ease' }}>{value || placeholder || "Choose..."}</span>
        </div>
        <ChevronDown size={18} style={{ 
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          opacity: 0.7,
          color: open ? 'var(--neon-cyan)' : 'inherit'
        }} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: direction === 'bottom' ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'bottom' ? -5 : 5, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              [direction === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 12px)',
              left: 0,
              right: 0,
              background: 'rgba(10, 12, 28, 0.99)',
              backdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: '16px',
              padding: '0.6rem',
              zIndex: 100,
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(0,212,255,0.15)',
              maxHeight: 'min(450px, 70vh)',
              overflowY: 'auto',
              transformOrigin: direction === 'bottom' ? 'top center' : 'bottom center',
              paddingBottom: '1rem'
            }}
            className="custom-scrollbar"
          >
            {options.map((o, idx) => (
              <motion.div 
                key={o}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => { onChange(o); setOpen(false); }}
                className="select-option"
                style={{
                  padding: '0.85rem 1.2rem',
                  borderRadius: '12px',
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  color: value === o ? '#fff' : 'rgba(210, 220, 240, 0.8)',
                  background: value === o ? 'linear-gradient(90deg, rgba(0,212,255,0.15), transparent)' : 'transparent',
                  borderLeft: value === o ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  marginBottom: '4px',
                  fontWeight: value === o ? 600 : 400
                }}
                onMouseEnter={e => {
                  if (value !== o) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (value !== o) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.color = 'rgba(210, 220, 240, 0.8)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {icons[o] && (
                      <span style={{ 
                        color: value === o ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.4)',
                        display: 'flex', transition: 'all 0.2s ease'
                      }}>
                        {icons[o]}
                      </span>
                    )}
                    <span>{o}</span>
                  </div>
                  {value === o && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check size={14} color="var(--neon-cyan)" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function validate(data) {
  const err = {};
  const isValidHttpUrl = (value) => {
    if (!value.trim()) {
      return false;
    }

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!data.name.trim()) err.name = 'Name is required.';
  if (!data.email.trim()) err.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = 'Enter a valid email.';
  if (!data.year) err.year = 'Select your year.';
  if (!data.college.trim()) err.college = 'College is required.';
  if (!data.branch.trim()) err.branch = 'Branch is required.';
  if (!data.github.trim()) err.github = 'GitHub link is required.';
  else if (!isValidHttpUrl(data.github)) err.github = 'Enter a valid GitHub URL starting with http:// or https://.';
  if (!data.linkedin.trim()) err.linkedin = 'LinkedIn link is required.';
  else if (!isValidHttpUrl(data.linkedin)) err.linkedin = 'Enter a valid LinkedIn URL starting with http:// or https://.';
  if (!data.domain) err.domain = 'Select your domain.';
  if (!data.techStack.trim()) err.techStack = 'Tech stack is required.';
  if (!data.whyJoin.trim()) err.whyJoin = 'Tell us why you want to join.';
  if (!data.project.trim()) err.project = 'Share at least one project.';
  return err;
}

async function readApiResponse(res) {
  const raw = await res.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      ok: false,
      error: res.ok
        ? 'The server returned an unreadable response. Please refresh and check whether the application was saved.'
        : 'The server returned an unexpected response. Please try again.',
    };
  }
}

/* ── Apply Page ── */
const SuccessModal = ({ countdown, onReturnHome }) => (
  <AnimatePresence>
    <motion.div
      key="success-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'rgba(3, 10, 18, 0.72)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-success-title"
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 'min(100%, 460px)',
          padding: '2rem 1.8rem 1.7rem',
          borderRadius: '28px',
          textAlign: 'center',
          border: '1px solid rgba(110, 231, 183, 0.22)',
          background: 'radial-gradient(circle at top, rgba(16, 185, 129, 0.18), rgba(7, 16, 28, 0.98) 55%)',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.42), 0 0 50px rgba(16, 185, 129, 0.12)',
        }}
      >
        <div style={{ position: 'relative', width: '118px', height: '118px', margin: '0 auto 1.4rem' }}>
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1.12, opacity: [0, 0.35, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              border: '1px solid rgba(110, 231, 183, 0.28)',
            }}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 48%, transparent 72%)',
              boxShadow: '0 0 45px rgba(16, 185, 129, 0.18)',
            }}
          />
          <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, ease: [0.2, 0.9, 0.2, 1] }}
              style={{ rotate: '-90deg', transformOrigin: '50% 50%' }}
            />
            <motion.path
              d="M40 61 L54 75 L81 47"
              fill="none"
              stroke="#d1fae5"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.45, ease: 'easeOut' }}
            />
          </svg>
        </div>

        <h2
          id="submission-success-title"
          style={{
            marginBottom: '0.45rem',
            color: '#f8fffb',
            fontSize: 'clamp(1.7rem, 4vw, 2.15rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Submitted
        </h2>

        <p style={{ marginBottom: '0.55rem', color: 'rgba(221, 255, 239, 0.88)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Your application has been received successfully.
        </p>
        <p style={{ marginBottom: '1.35rem', color: 'rgba(191, 246, 223, 0.7)', fontSize: '0.92rem', lineHeight: 1.6 }}>
          We will reach out within 1-3 days and return you to the home page automatically.
        </p>

        <div style={{ display: 'grid', gap: '0.95rem' }}>
          <motion.div
            key={countdown}
            initial={{ scale: 0.94, opacity: 0.65 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.6rem',
              margin: '0 auto',
              padding: '0.7rem 1rem',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(110, 231, 183, 0.18)',
              color: '#d1fae5',
              fontSize: '0.92rem',
              fontWeight: 600,
            }}
          >
            <span>Closing in</span>
            <span style={{
              minWidth: '2.1rem',
              padding: '0.22rem 0.45rem',
              borderRadius: '999px',
              background: 'rgba(110, 231, 183, 0.16)',
              color: '#f0fdf4',
            }}>
              {countdown}s
            </span>
          </motion.div>

          <button
            type="button"
            onClick={onReturnHome}
            className="glass-btn glass-btn-primary"
            style={{
              justifyContent: 'center',
              width: '100%',
              padding: '0.78rem 1.2rem',
              borderRadius: '999px',
              fontSize: '0.92rem',
            }}
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const ApplyPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [statusMsg, setStatusMsg] = useState('');
  const [successCountdown, setSuccessCountdown] = useState(SUCCESS_REDIRECT_SECONDS);

  const isLast = step === STEPS.length - 1;
  const active = STEPS[step];

  useEffect(() => {
    if (status !== 'success') {
      return undefined;
    }

    setSuccessCountdown(SUCCESS_REDIRECT_SECONDS);

    const countdownInterval = window.setInterval(() => {
      setSuccessCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(countdownInterval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      navigate('/');
    }, SUCCESS_REDIRECT_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate, status]);

  const setField = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: undefined }));
    if (status !== 'idle') { setStatus('idle'); setStatusMsg(''); }
  };

  const goNext = () => {
    if (isLast) return;
    const all = validate(form);
    const stepErr = {};
    STEP_FIELDS[step].forEach(f => { if (all[f]) stepErr[f] = all[f]; });
    setErrors(p => {
      const cleaned = { ...p };
      STEP_FIELDS[step].forEach(f => delete cleaned[f]);
      return { ...cleaned, ...stepErr };
    });
    if (Object.keys(stepErr).length) return;
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setConfirmError('');
    setStep(s => Math.max(s - 1, 0));
  };

  const jumpTo = (i) => { if (i <= step) { setConfirmError(''); setStep(i); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const all = validate(form);
    if (Object.keys(all).length) {
      setErrors(all);
      const firstErrStep = STEP_FIELDS.findIndex(fields => fields.some(f => all[f]));
      if (firstErrStep >= 0) setStep(firstErrStep);
      return;
    }
    if (!confirmChecked) {
      setConfirmError('Please confirm that the information is correct.');
      return;
    }
    setSubmitting(true); setStatus('idle'); setStatusMsg('');
    try {
      // Send the payload to our secure Vercel serverless function backend proxy
      const res = await fetch(getApplyApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await readApiResponse(res);

      if (!res.ok || !data?.ok) {
        if (res.status === 404) {
          throw new Error('Submission endpoint not found. If you are testing locally, set VITE_API_BASE_URL or use the deployed site.');
        }

        throw new Error(data?.error || data?.message || `Submission failed (${res.status})`);
      }

      setStatus('success');
      setStatusMsg('');
    } catch (error) {
      setStatus('error');
      setStatusMsg(error.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !isLast && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault(); goNext();
    }
  };

  /* ── Render field ── */
  const renderField = (key) => {
    const meta = FIELD_META[key];
    if (!meta) return null;
    const err = errors[key];
    const base = {
      fontSize: '0.95rem', width: '100%', padding: '0.85rem 1.2rem',
      borderRadius: '12px',
      background: 'rgba(255,255,255,.03)',
      border: `1.5px solid ${err ? 'rgba(244,63,94,.5)' : 'rgba(255,255,255,.08)'}`,
      color: '#e8e8f0', fontFamily: "'Inter', sans-serif",
      outline: 'none', transition: 'border-color .3s ease, box-shadow .3s ease, background .3s ease',
    };

    return (
      <div key={key} style={{ marginBottom: '0.2rem' }}>
        <label style={{
          display: 'block', fontSize: '0.82rem', fontWeight: 600,
          color: err ? '#f87171' : 'rgba(200,210,225,.8)',
          marginBottom: '6px', letterSpacing: '0.01em',
        }}>
          {meta.label} {meta.required && <span style={{ color: 'var(--neon-cyan)', opacity: 0.6 }}>*</span>}
        </label>
        {meta.type === 'select' ? (
          <CustomSelect
            value={form[key]}
            onChange={(val) => setField(key, val)}
            options={meta.options}
            placeholder="Choose..."
            baseStyle={base}
            error={err}
            icons={key === 'domain' ? DOMAIN_ICONS : {}}
          />
        ) : meta.type === 'textarea' ? (
          <textarea 
            value={form[key]} 
            onChange={e => setField(key, e.target.value)}
            className="premium-input"
            placeholder={meta.placeholder} 
            rows={4}
            style={{ ...base, resize: 'vertical', minHeight: '120px', lineHeight: 1.6 }} 
          />
        ) : (
          <input 
            type={meta.type || 'text'} 
            value={form[key]}
            onChange={e => setField(key, e.target.value)}
            className="premium-input"
            placeholder={meta.placeholder}
            style={base} 
          />
        )}
        {err && <p style={{ color: '#f87171', fontSize: '0.76rem', marginTop: '6px', fontWeight: 500 }}>{err}</p>}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative', overflow: 'hidden',
    }}>
      <ParallaxBG />

      <div style={{
        maxWidth: '750px', margin: '0 auto', padding: '2rem 1.5rem 4rem',
        position: 'relative', zIndex: 1,
      }}>
        {/* Back */}
        <button onClick={() => navigate('/')} className="glass-btn glass-btn-secondary" style={{
          padding: '0.55rem 1.2rem', fontSize: '0.85rem', marginBottom: '2rem',
          borderRadius: '50px',
        }}>
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700, letterSpacing: '-0.03em',
            color: '#fff', marginBottom: '0.4rem',
          }}>
            Apply to <span className="text-gradient">Join Us</span>
          </h1>
          <p style={{
            color: 'var(--neon-cyan)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            Become a Catalyst
          </p>
        </div>

        {/* ── Progress stepper ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0',
          marginBottom: '2.5rem',
          padding: '1rem 1.2rem',
          borderRadius: '16px',
          background: 'rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div style={{
                    flex: 1, height: '2px',
                    background: done ? 'var(--neon-cyan)' : 'rgba(255,255,255,.06)',
                    transition: 'background .4s ease',
                  }} />
                )}
                <button
                  onClick={() => jumpTo(i)}
                  disabled={i > step}
                  style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    cursor: i <= step ? 'pointer' : 'default',
                    transition: 'all .3s ease',
                    background: done
                      ? 'var(--neon-cyan)'
                      : current
                        ? 'rgba(0,212,255,.12)'
                        : 'rgba(255,255,255,.04)',
                    color: done ? '#041a2b' : current ? 'var(--neon-cyan)' : '#555',
                    border: current ? '1.5px solid rgba(0,212,255,.4)' : '1.5px solid transparent',
                    boxShadow: current ? '0 0 12px rgba(0,212,255,.15)' : 'none',
                  }}
                  title={s.label}
                >
                  {done ? <Check size={14} /> : i + 1}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Form Card ── */}
        <div style={{ position: 'relative' }}>
          {/* Ambient Form Glow */}
          <div style={{
            position: 'absolute', inset: '-20px',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.15), transparent 70%)',
            filter: 'blur(40px)', opacity: 0.6, pointerEvents: 'none', zIndex: -1,
          }} />

          <div className="static-texture-card" style={{
            padding: 0,
            borderRadius: '24px',
            background: 'radial-gradient(120% 100% at 50% 100%, rgba(0, 212, 255, 0.15) 0%, rgba(10, 10, 26, 0.95) 100%)',
            border: '1px solid rgba(255,255,255,.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,.4)',
            backdropFilter: 'blur(20px)',
            overflow: 'visible',
            zIndex: 1,
            transform: 'none'
          }}>
          {/* top accent */}
          <div style={{
            height: '2px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            background: 'linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-purple), transparent)',
          }} />

          <form onSubmit={handleSubmit} onKeyDown={handleKey} style={{ padding: '2rem 2rem 1.5rem' }}>
            {/* step header */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '6px',
                  fontSize: '0.68rem', fontWeight: 700,
                  background: 'rgba(0,212,255,.08)',
                  border: '1px solid rgba(0,212,255,.15)',
                  color: 'var(--neon-cyan)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Step {step + 1} / {STEPS.length}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: '6px',
                  fontSize: '0.68rem', fontWeight: 600,
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.08)',
                  color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {active.label}
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.6rem', fontWeight: 700, color: '#fff',
                letterSpacing: '-0.02em', marginBottom: '0.4rem',
              }}>
                {active.title}
              </h2>
              <p style={{ color: 'rgba(160,175,195,.65)', fontSize: '0.92rem' }}>
                {active.desc}
              </p>
            </div>

            {/* ── STEP CONTENT ── */}
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: step < 3 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr' }}>
              {step < 5 && STEP_FIELDS[step].map(f => renderField(f))}
            </div>

            {/* ── REVIEW STEP ── */}
            {step === 5 && (
              <div>
                <div style={{
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,.02)',
                  border: '1px solid rgba(255,255,255,.06)',
                  padding: '1.2rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: 'rgba(0,212,255,.7)',
                    textTransform: 'uppercase', letterSpacing: '0.14em',
                    marginBottom: '1rem',
                  }}>Review Details</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                    {Object.keys(INITIAL).map(k => {
                      const meta = FIELD_META[k];
                      if (!meta) return null;
                      const val = form[k]?.trim() || 'Not provided';
                      return (
                        <div key={k} style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,.02)',
                          border: '1px solid rgba(255,255,255,.04)',
                        }}>
                          <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                            {meta.label}
                          </p>
                          <p style={{ fontSize: '0.88rem', color: '#ccc', lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {val}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* confirm checkbox */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: `1px solid ${confirmError ? 'rgba(244,63,94,.4)' : 'rgba(0,212,255,.12)'}`,
                  background: 'rgba(0,212,255,.02)',
                  cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={confirmChecked}
                    onChange={e => { setConfirmChecked(e.target.checked); if (e.target.checked) setConfirmError(''); }}
                    style={{
                      marginTop: '2px', width: '16px', height: '16px',
                      accentColor: 'var(--neon-cyan)',
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'rgba(220,225,235,.85)', lineHeight: 1.5 }}>
                    All the information I have filled is correct and I understand that my application will be reviewed.
                  </span>
                </label>
                {confirmError && (
                  <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '6px', fontWeight: 500 }}>{confirmError}</p>
                )}
              </div>
            )}

            {/* status messages */}
            {isLast && status === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.8rem 1rem', borderRadius: '12px',
                marginTop: '1rem',
                background: 'rgba(244,63,94,.06)',
                border: '1px solid rgba(244,63,94,.25)',
                color: '#fca5a5',
                fontSize: '0.9rem', fontWeight: 500,
              }}>
                <AlertCircle size={16} />
                {statusMsg}
              </div>
            )}

            {/* ── Navigation ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '2rem', paddingTop: '1.2rem',
              borderTop: '1px solid rgba(255,255,255,.05)',
            }}>
              <span style={{ fontSize: '0.78rem', color: '#555', fontWeight: 500 }}>
                Section {step + 1} of {STEPS.length}
              </span>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {step > 0 && (
                  <button type="button" onClick={goBack} disabled={submitting}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem', borderRadius: '50px' }}>
                    Back
                  </button>
                )}
                {isLast ? (
                  <button type="submit" disabled={submitting}
                    className="glass-btn glass-btn-primary"
                    style={{ padding: '0.6rem 2rem', fontSize: '0.92rem', borderRadius: '50px' }}>
                    {submitting ? 'Submitting...' : 'Submit'} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="button" onClick={goNext} disabled={submitting}
                    className="glass-btn glass-btn-primary"
                    style={{ padding: '0.6rem 2rem', fontSize: '0.92rem', borderRadius: '50px' }}>
                    Next <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>

      {status === 'success' && (
        <SuccessModal
          countdown={successCountdown}
          onReturnHome={() => navigate('/')}
        />
      )}

      <style>{`
        input:focus, textarea:focus, select:focus {
          border-color: rgba(0,212,255,.35) !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,.06);
        }
        select option { background: #0a0a1a; color: #ccc; }
      `}</style>
      <style>{`
        .premium-input:focus {
          border-color: rgba(0,212,255,.5) !important;
          box-shadow: 0 0 0 2px rgba(0,212,255,.1) !important;
          background: rgba(0,212,255,.02) !important;
        }
        .premium-input::placeholder {
          color: rgba(160,175,195,.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.4);
          border-radius: 10px;
          border: 1px solid rgba(10, 12, 28, 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.6);
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 255, 0.4) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ApplyPage;
