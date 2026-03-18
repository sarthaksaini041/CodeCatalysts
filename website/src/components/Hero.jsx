import React from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { teamData } from '../data';

const Hero = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', paddingTop: '80px',
      background: 'transparent',
    }}>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>

        {/* kicker badge */}
        <div className="animate-in" style={{ marginBottom: '2.5rem' }}>
          <span className="kicker-badge">
            Code Catalysts — Learn. Build. Ship.
          </span>
        </div>

        <h1 className="heading-xl animate-in delay-1" style={{
          marginBottom: '0.8rem', maxWidth: '900px', margin: '0 auto 0.8rem auto',
        }}>
          <span className="text-gradient">Code</span> Catalysts
        </h1>
        <p className="animate-in delay-1" style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
          fontWeight: 400, color: 'rgba(200,210,225,.7)',
          maxWidth: '680px', margin: '0 auto 1.5rem auto', lineHeight: 1.6,
        }}>
          Not experts yet — just people who love learning and creating.
        </p>

        {/* est. marker like original */}
        <div className="animate-in delay-2" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            width: '48px', height: '2px', borderRadius: '1px',
            background: 'rgba(255,255,255,.35)',
          }} />
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: 'rgba(148,163,184,.7)',
          }}>
            Est. 2025
          </span>
        </div>

        {/* Buttons — glass pill system */}
        <div className="animate-in delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#projects" className="glass-btn glass-btn-primary">
            Explore Projects <ArrowUpRight size={16} />
          </a>
          <a href="#team" className="glass-btn glass-btn-secondary">
            Meet the Team <Users size={16} />
          </a>
        </div>

        {/* stats */}
        <div className="animate-in delay-4" style={{
          display: 'flex', justifyContent: 'center', gap: '3rem',
          marginTop: '5rem', flexWrap: 'wrap',
        }}>
          {[
            { value: String(teamData.length), label: 'Team Members' },
            { value: 'Soon', label: 'Projects Shipping' },
            { value: 'Infinite', label: 'Problems to Solve' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.2rem', fontWeight: 700,
              }}>
                <span className="text-gradient">{s.value}</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
