import React from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';

function renderHeroTitle(title) {
  const parts = String(title || 'Code Catalysts').trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return <span className="text-gradient">{parts[0] || 'Code Catalysts'}</span>;
  }

  return (
    <>
      <span className="text-gradient">{parts[0]}</span>{' '}
      {parts.slice(1).join(' ')}
    </>
  );
}

const Hero = () => {
  const { members, projects, siteSettings, loading } = usePublicContent();

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', paddingTop: '80px',
      background: 'transparent',
    }}>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="animate-in" style={{ marginBottom: '2.5rem' }}>
          <span className="kicker-badge">
            Code Catalysts - Learn. Build. Ship.
          </span>
        </div>

        <h1 className="heading-xl animate-in delay-1" style={{
          marginBottom: '0.8rem', maxWidth: '900px', margin: '0 auto 0.8rem auto',
        }}>
          {renderHeroTitle(siteSettings.heroTitle)}
        </h1>
        <p className="animate-in delay-1" style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
          fontWeight: 400, color: 'rgba(200,210,225,.7)',
          maxWidth: '680px', margin: '0 auto 1.5rem auto', lineHeight: 1.6,
        }}>
          {siteSettings.heroSubtitle}
        </p>

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

        <div className="animate-in delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#projects" className="glass-btn glass-btn-primary">
            Explore Projects <ArrowUpRight size={16} />
          </a>
          <a href="#team" className="glass-btn glass-btn-secondary">
            Meet the Team <Users size={16} />
          </a>
        </div>

        <div className="animate-in delay-4" style={{
          display: 'flex', justifyContent: 'center', gap: '3rem',
          marginTop: '5rem', flexWrap: 'wrap',
        }}>
          {[
            { value: loading ? '...' : String(members.length), label: 'Team Members' },
            { value: loading ? '...' : projects.length ? String(projects.length) : 'Soon', label: 'Projects Shipping' },
            { value: 'Infinite', label: 'Problems to Solve' },
          ].map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.2rem', fontWeight: 700,
              }}>
                <span className="text-gradient">{stat.value}</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
