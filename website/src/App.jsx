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

import { motion } from 'framer-motion';

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

function HomePage() {
  return (
    <>
      <ParallaxBG />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <main>
          <Hero />
          <SectionWrapper delay={0.1}><About /></SectionWrapper>
          <SectionWrapper delay={0.1}><Team /></SectionWrapper>
          <SectionWrapper delay={0.1}><Projects /></SectionWrapper>
          <SectionWrapper delay={0.1}><Journey /></SectionWrapper>
        </main>
        <Join />
      </div>
    </>
  );
}

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/apply" element={<ApplyPage />} />
        </Routes>
      </BrowserRouter>
    </motion.div>
  );
}

export default App;
