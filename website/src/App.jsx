import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParallaxBG from './components/ParallaxBG';
import Hero from './components/Hero';
import About from './components/About';
import Team from './components/Team';
import Projects from './components/Projects';
import Journey from './components/Journey';
import Join from './components/Join';
import ApplyPage from './pages/Apply';
import Preloader from './components/Preloader';

import { motion } from 'framer-motion';

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

function HomePage({ ready }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate={ready ? 'visible' : 'hidden'}
    >
      {/* Background scales in first */}
      <motion.div variants={scaleFade}>
        <ParallaxBG />
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
          <SectionWrapper delay={0.1}><Team /></SectionWrapper>
          <SectionWrapper delay={0.1}><Projects /></SectionWrapper>
          <SectionWrapper delay={0.1}><Journey /></SectionWrapper>
        </main>

        <motion.div variants={fadeUp}>
          <Join />
        </motion.div>
      </div>
    </motion.div>
  );
}

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage ready={preloaderDone} />} />
          <Route path="/apply" element={<ApplyPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
