import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Join from './components/Join';
import Preloader from './components/Preloader';

import { motion } from 'framer-motion';

const PRELOADER_SESSION_KEY = 'codecatalysts:preloader-complete';
const ParallaxBG = lazy(() => import('./components/ParallaxBG'));
const Team = lazy(() => import('./components/Team'));
const Projects = lazy(() => import('./components/Projects'));
const Journey = lazy(() => import('./components/Journey'));
const ApplyPage = lazy(() => import('./pages/Apply'));
const ANCHOR_INTENT_EVENT = 'codecatalysts:anchor-intent';

function shouldSkipPreloader() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const alreadySeen = window.sessionStorage.getItem(PRELOADER_SESSION_KEY) === 'true';
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const isHomeRoute = window.location.pathname === '/';

    return !isHomeRoute || alreadySeen || prefersReducedMotion;
  } catch {
    return window.location.pathname !== '/';
  }
}

function markPreloaderComplete() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
  } catch {
    // Ignore storage failures and continue without session persistence.
  }
}

/* ── Stagger container — orchestrates child entrance ── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/* ── Slide-down (for Navbar) ── */
const slideDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

/* ── Fade-up (for Hero + content) ── */
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  },
};

/* ── Scale-fade (for background) ── */
const scaleFade = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const sectionFallbackBase = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  borderRadius: '24px',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.04)',
  opacity: 0.45,
};

const SectionFallback = ({ minHeight }) => (
  <div
    aria-hidden="true"
    style={{
      ...sectionFallbackBase,
      minHeight,
    }}
  />
);

const RouteFallback = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }} />
);

const SectionWrapper = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

const DeferredSection = ({
  children,
  minHeight,
  anchorId,
  rootMargin = '500px 0px 250px 0px',
}) => {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window)
  );

  useEffect(() => {
    if (shouldRender) return undefined;

    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  useEffect(() => {
    if (!anchorId || shouldRender) return undefined;

    const handleAnchorIntent = (event) => {
      if (event.detail === anchorId) {
        setShouldRender(true);
      }
    };

    window.addEventListener(ANCHOR_INTENT_EVENT, handleAnchorIntent);
    return () => window.removeEventListener(ANCHOR_INTENT_EVENT, handleAnchorIntent);
  }, [anchorId, shouldRender]);

  return (
    <div
      id={anchorId}
      ref={containerRef}
      style={{ minHeight, width: '100%', scrollMarginTop: '6.75rem' }}
    >
      {shouldRender ? children : <SectionFallback minHeight={minHeight} />}
    </div>
  );
};

function HomePage({ backgroundReady, contentReady }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate={contentReady ? 'visible' : 'hidden'}
    >
      {/* Background scales in first */}
      <motion.div
        initial="hidden"
        animate={backgroundReady ? 'visible' : 'hidden'}
        variants={scaleFade}
      >
        {backgroundReady ? (
          <Suspense fallback={null}>
            <ParallaxBG />
          </Suspense>
        ) : null}
      </motion.div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar slides down */}
        <motion.div variants={slideDown}>
          <Navbar />
        </motion.div>

        <main>
          {/* Hero fades up */}
          <motion.div variants={fadeUp}>
            <Hero />
          </motion.div>

          <SectionWrapper delay={0.1}><About /></SectionWrapper>
          <DeferredSection anchorId="team" minHeight={980}>
            <Suspense fallback={<SectionFallback minHeight={980} />}>
              <SectionWrapper delay={0.1}><Team /></SectionWrapper>
            </Suspense>
          </DeferredSection>
          <DeferredSection anchorId="projects" minHeight={560}>
            <Suspense fallback={<SectionFallback minHeight={560} />}>
              <SectionWrapper delay={0.1}><Projects /></SectionWrapper>
            </Suspense>
          </DeferredSection>
          <DeferredSection anchorId="journey" minHeight={720}>
            <Suspense fallback={<SectionFallback minHeight={720} />}>
              <SectionWrapper delay={0.1}><Journey /></SectionWrapper>
            </Suspense>
          </DeferredSection>
        </main>

        <motion.div variants={fadeUp}>
          <Join />
        </motion.div>
      </div>
    </motion.div>
  );
}

function App() {
  const skipPreloader = shouldSkipPreloader();
  const [backgroundReady, setBackgroundReady] = useState(skipPreloader);
  const [preloaderDone, setPreloaderDone] = useState(skipPreloader);

  return (
    <>
      {!preloaderDone && !skipPreloader && (
        <Preloader
          onReveal={() => setBackgroundReady(true)}
          onComplete={() => {
            markPreloaderComplete();
            setPreloaderDone(true);
          }}
        />
      )}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                backgroundReady={backgroundReady}
                contentReady={preloaderDone}
              />
            }
          />
          <Route
            path="/apply"
            element={(
              <Suspense fallback={<RouteFallback />}>
                <ApplyPage />
              </Suspense>
            )}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
