import React from 'react';
import { Rocket } from 'lucide-react';

const Projects = () => {
  return (
    <section id="projects" className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="kicker-badge">
              Projects
            </div>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
            Things we've <span className="text-gradient">built</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
            Current builds in the pipeline. Stay tuned for demos and live links.
          </p>
        </div>

        <div className="neon-card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-gradient)' }} />

          <div style={{
            width: '64px', height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,212,255,.06)',
            border: '1px solid rgba(0,212,255,.1)',
            borderRadius: '14px', color: 'var(--neon-cyan)',
            margin: '0 auto 2rem auto',
          }}>
            <Rocket size={28} />
          </div>

          <h3 className="heading-md" style={{ marginBottom: '1rem' }}>
            Fresh builds <span className="text-gradient">coming soon</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 2rem auto', fontSize: '1rem', lineHeight: 1.7 }}>
            We're heads-down on our next projects right now. Demos and links will show up here as soon as they're ready.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', background: 'rgba(0,212,255,.04)',
            border: '1px dashed rgba(0,212,255,.18)', borderRadius: '6px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.08em' }}>
              Building in stealth
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </section>
  );
};

export default Projects;
