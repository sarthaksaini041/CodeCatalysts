import React from 'react';
import { howWeBuild } from '../data';
import { Lightbulb, Code2, Users, Palette } from 'lucide-react';

const icons = [Lightbulb, Code2, Users, Palette];

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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.5rem',
        }}>
          {howWeBuild.map((item, index) => {
            const Icon = icons[index] || Code2;
            return (
              <div key={index} className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  width: '46px', height: '46px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,212,255,.06)',
                  border: '1px solid rgba(0,212,255,.1)',
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
