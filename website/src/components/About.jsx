import React from 'react';
import { howWeBuild } from '../data';
import { Lightbulb, Code2, Users, Palette } from 'lucide-react';

const icons = [Lightbulb, Code2, Users, Palette];
const cardPalettes = [
  {
    '--card-bg-start': 'rgba(16, 30, 56, 0.96)',
    '--card-bg-end': 'rgba(8, 10, 24, 0.98)',
    '--card-glow-a': 'rgba(0, 212, 255, 0.2)',
    '--card-glow-b': 'rgba(87, 140, 255, 0.12)',
  },
  {
    '--card-bg-start': 'rgba(40, 19, 58, 0.96)',
    '--card-bg-end': 'rgba(11, 10, 28, 0.98)',
    '--card-glow-a': 'rgba(167, 139, 250, 0.18)',
    '--card-glow-b': 'rgba(116, 50, 180, 0.14)',
  },
  {
    '--card-bg-start': 'rgba(14, 36, 44, 0.96)',
    '--card-bg-end': 'rgba(8, 10, 24, 0.98)',
    '--card-glow-a': 'rgba(45, 212, 191, 0.18)',
    '--card-glow-b': 'rgba(0, 212, 255, 0.12)',
  },
  {
    '--card-bg-start': 'rgba(30, 22, 50, 0.96)',
    '--card-bg-end': 'rgba(10, 10, 24, 0.98)',
    '--card-glow-a': 'rgba(244, 114, 182, 0.12)',
    '--card-glow-b': 'rgba(167, 139, 250, 0.18)',
  },
];

const About = () => {
  return (
    <section id="about" className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="kicker-badge">
              About Us
            </div>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
            How we <span className="text-gradient">build</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
            A small team learning big things and building what we wish existed.
          </p>
        </div>

        <div className="adaptive-card-grid">
          {howWeBuild.map((item, index) => {
            const Icon = icons[index] || Code2;
            const palette = cardPalettes[index % cardPalettes.length];
            return (
              <div key={index} className="static-texture-card rough-gradient-card" style={{
                ...palette,
                display: 'flex', flexDirection: 'column', gap: '1rem',
              }}>
                <div style={{
                  width: '46px', height: '46px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(180deg, rgba(0,212,255,.08), rgba(255,255,255,.02))',
                  border: '1px solid rgba(0,212,255,.14)',
                  borderRadius: '10px', color: 'var(--neon-cyan)',
                }}>
                  <Icon size={22} />
                </div>

                <span style={{
                  fontSize: '0.72rem', textTransform: 'uppercase',
                  letterSpacing: '0.15em', fontWeight: 600, color: 'var(--neon-cyan)',
                }}>
                  {item.tag}
                </span>

                <h3 className="heading-md" style={{ fontSize: '1.15rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
