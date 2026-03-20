import React from 'react';
import { Lightbulb, Code2, Users, Palette } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';

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

function renderAccentTitle(title) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return null;
  }

  if (words.length === 1) {
    return <span className="text-gradient">{words[0]}</span>;
  }

  return (
    <>
      {words.slice(0, -1).join(' ')}{' '}
      <span className="text-gradient">{words[words.length - 1]}</span>
    </>
  );
}

const About = () => {
  const { sectionList, loading } = usePublicContent();
  const cardSections = sectionList.filter((section) => section.layoutType === 'card_grid');

  if (loading && !cardSections.length) {
    return (
      <section id="about" className="section" style={{ background: 'transparent' }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="section-intro-shell" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div className="kicker-badge">About Us</div>
            </div>
            <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
              Loading <span className="text-gradient">sections</span>
            </h2>
            <p className="section-intro-copy" style={{ maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
              Pulling your managed sections from Supabase.
            </p>
          </div>

          <div className="adaptive-card-grid">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="static-texture-card rough-gradient-card"
                style={{
                  ...cardPalettes[index % cardPalettes.length],
                  minHeight: '280px',
                  opacity: 0.72,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!cardSections.length) {
    return null;
  }

  return (
    <>
      {cardSections.map((section, sectionIndex) => (
        <section
          key={section.id || section.sectionKey}
          id={section.anchorId || section.sectionKey}
          className="section"
          style={{ background: 'transparent' }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div className="section-intro-shell" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="kicker-badge">
                  {section.kicker || section.label || 'Section'}
                </div>
              </div>
              <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
                {renderAccentTitle(section.title || section.label)}
              </h2>
              {section.description ? (
                <p className="section-intro-copy" style={{ maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
                  {section.description}
                </p>
              ) : null}
            </div>

            <div className="adaptive-card-grid">
              {section.items.map((item, index) => {
                const Icon = icons[(sectionIndex + index) % icons.length] || Code2;
                const palette = cardPalettes[(sectionIndex + index) % cardPalettes.length];

                return (
                  <div
                    key={item.id || `${section.sectionKey}-${index}`}
                    className="static-texture-card rough-gradient-card"
                    style={{
                      ...palette,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div style={{
                      width: '46px', height: '46px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(180deg, rgba(0,212,255,.08), rgba(255,255,255,.02))',
                      border: '1px solid rgba(0,212,255,.14)',
                      borderRadius: '10px', color: 'var(--neon-cyan)',
                    }}>
                      <Icon size={22} />
                    </div>

                    {item.subtitle ? (
                      <span style={{
                        fontSize: '0.72rem', textTransform: 'uppercase',
                        letterSpacing: '0.15em', fontWeight: 600, color: 'var(--neon-cyan)',
                      }}>
                        {item.subtitle}
                      </span>
                    ) : null}

                    <h3 className="heading-md" style={{ fontSize: '1.15rem' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </>
  );
};

export default About;
