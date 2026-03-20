import React from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';
import { scrollToAnchor } from '../lib/smoothScroll';

function renderHeroTitle(title) {
  const parts = String(title || 'Code Catalysts').trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return <span className="hero-code-accent" style={{ position: 'relative', zIndex: 10 }}>{parts[0] || 'Code Catalysts'}</span>;
  }

  return (
    <>
      <span className="hero-code-accent" style={{ position: 'relative', zIndex: 10 }}>{parts[0]}</span>{' '}
      <span style={{ position: 'relative', zIndex: 10 }}>{parts.slice(1).join(' ')}</span>
    </>
  );
}

const Hero = () => {
  const { members, projects, siteSettings, loading } = usePublicContent();
  const projectCount = loading ? '--' : String(projects.length).padStart(2, '0');
  const catalystCount = loading ? '--' : String(members.length).padStart(2, '0');
  const handleAnchorClick = (href) => (event) => {
    event.preventDefault();
    scrollToAnchor(href);
  };

  return (
    <section className="hero-domain">
      <div className="container hero-content" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="hero-center-stack">
          <div className="hero-title-stage" data-hero-title-stage="true">
            <h1 className="heading-xl animate-in delay-1 hero-title">
              {renderHeroTitle(siteSettings.heroTitle)}
            </h1>
          </div>

          <div className="hero-supporting-content">
            <p className="animate-in delay-1 hero-subtitle">
              {siteSettings.heroSubtitle}
            </p>

            <div className="animate-in delay-3 hero-actions">
              <a href="#projects" className="glass-btn glass-btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={handleAnchorClick('#projects')}>
                Explore Projects <ArrowUpRight size={16} />
              </a>
              <a href="#team" className="glass-btn glass-btn-secondary" onClick={handleAnchorClick('#team')}>
                Meet the Team <Users size={16} />
              </a>
            </div>

            <div className="hero-metrics animate-in delay-3" aria-label="Site metrics">
              <div className="hero-metric">
                <span className="hero-metric-value">{projectCount}</span>
                <span className="hero-metric-label">Projects</span>
              </div>
              <div className="hero-metric-divider" aria-hidden="true" />
              <div className="hero-metric">
                <span className="hero-metric-value">{catalystCount}</span>
                <span className="hero-metric-label">Catalysts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-domain {
          min-height: calc(100vh + clamp(5rem, 10vw, 8rem));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: clamp(7.75rem, 11vh, 9.5rem) 0 clamp(7rem, 11vw, 10rem);
          background: transparent;
          overflow: hidden;
        }

        .hero-content {
          min-height: calc(100vh - 148px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: clamp(4rem, 8vw, 7rem);
        }

        .hero-center-stack {
          width: min(100%, 1320px);
          display: grid;
          justify-items: center;
          align-items: start;
          row-gap: clamp(1rem, 1.8vw, 1.6rem);
          transform: translateY(clamp(6.2rem, 10vh, 8.5rem));
        }

        .hero-title-stage {
          width: 100%;
          min-height: clamp(9.5rem, 16vw, 12.4rem);
          display: grid;
          place-items: center;
        }

        .hero-supporting-content {
          width: min(100%, 860px);
          display: grid;
          justify-items: center;
          row-gap: clamp(1rem, 1.8vw, 1.45rem);
        }

        .hero-title {
          font-size: clamp(5.4rem, 11.6vw, 8.9rem);
          line-height: 0.92;
          max-width: 1260px;
          margin: 0 auto;
          text-shadow:
            calc(var(--surface-drop-shadow-x, 0px) * 0.2)
            calc(var(--surface-drop-shadow-y, 16px) * 0.28)
            calc(var(--surface-drop-shadow-blur, 28px) * 0.42)
            rgba(0, 0, 0, calc(var(--surface-text-shadow-opacity, 0.18) + 0.22)),
            0 0 calc(12px + (var(--surface-drop-shadow-blur, 28px) * 0.24))
            rgba(150, 244, 255, calc(var(--surface-text-glow-opacity, 0.05) * 0.82));
          filter:
            drop-shadow(calc(var(--surface-drop-shadow-x, 0px) * 0.12)
            calc(var(--surface-drop-shadow-y, 16px) * 0.16)
            calc(var(--surface-drop-shadow-blur, 28px) * 0.24)
            rgba(0, 0, 0, calc(var(--surface-drop-shadow-opacity, 0.18) + 0.14)));
          font-weight: 800;
          letter-spacing: -0.055em;
          transition: text-shadow 0.35s ease, filter 0.35s ease;
        }

        .hero-code-accent {
          background: linear-gradient(135deg, #8ff7ff 0%, #35d7ff 34%, #4ea9ff 68%, #7ca7ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
          filter:
            drop-shadow(0 0 18px rgba(58, 216, 255, 0.18))
            drop-shadow(0 12px 28px rgba(0, 0, 0, 0.26));
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.35rem);
          font-weight: 400;
          color: rgba(200, 210, 225, 0.84);
          max-width: 760px;
          margin: 0 auto;
          line-height: 1.6;
          text-shadow:
            calc(var(--surface-drop-shadow-x, 0px) * 0.12)
            calc(var(--surface-drop-shadow-y, 16px) * 0.16)
            calc(var(--surface-drop-shadow-blur, 28px) * 0.24)
            rgba(0, 0, 0, calc(var(--surface-text-shadow-opacity, 0.18) + 0.18)),
            0 0 calc(6px + (var(--surface-drop-shadow-blur, 28px) * 0.12))
            rgba(132, 238, 255, calc(var(--surface-text-glow-opacity, 0.05) * 0.46));
          transition: text-shadow 0.35s ease;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          width: 100%;
          margin: 0 auto;
        }

        .hero-metrics {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 0.95rem 1.25rem;
          border-radius: 999px;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -20%), rgba(236, 253, 255, calc(0.05 + (var(--surface-light-strength, 0.34) * 0.14))) 0%, rgba(120, 238, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.44))) 22%, transparent 58%),
            rgba(6, 10, 20, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 18px) var(--surface-shadow-blur, 32px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.06)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.42))),
            inset 0 -12px 24px rgba(0, 0, 0, calc(var(--surface-occlusion-opacity, 0.14) * 0.72));
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          margin: 0 auto;
        }

        .hero-metric {
          display: grid;
          gap: 0.18rem;
          justify-items: center;
          min-width: 5.8rem;
        }

        .hero-metric-value {
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .hero-metric-label {
          color: rgba(192, 204, 226, 0.66);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          line-height: 1;
          text-transform: uppercase;
        }

        .hero-metric-divider {
          width: 1px;
          height: 2rem;
          background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.16), transparent);
        }

        @media (max-width: 768px) {
          .hero-domain {
            min-height: calc(100vh + 3rem);
            padding: clamp(7rem, 10vh, 8rem) 0 5.5rem;
          }

          .hero-content {
            min-height: calc(100vh - 126px);
            padding-bottom: 3.5rem;
          }

          .hero-center-stack {
            transform: translateY(clamp(4.8rem, 8vh, 6rem));
          }

          .hero-title-stage {
            min-height: clamp(10.3rem, 24vw, 14rem);
          }

          .hero-title {
            font-size: clamp(4.2rem, 12.8vw, 6.2rem);
            max-width: 96%;
            line-height: 0.94;
          }

          .hero-actions {
            gap: 0.85rem;
          }

          .hero-metrics {
            gap: 0.75rem;
            padding: 0.82rem 1rem;
          }

          .hero-metric {
            min-width: 4.9rem;
          }
        }

        @media (max-width: 520px) {
          .hero-domain {
            padding: clamp(6.5rem, 9vh, 7.5rem) 0 4.75rem;
          }

          .hero-content {
            min-height: calc(100vh - 114px);
            padding-bottom: 2.75rem;
          }

          .hero-center-stack {
            transform: translateY(clamp(4rem, 7vh, 5rem));
          }

          .hero-title-stage {
            min-height: clamp(8.8rem, 30vw, 11.4rem);
          }

          .hero-title {
            font-size: clamp(3.4rem, 15vw, 5.2rem);
            max-width: 100%;
          }

          .hero-metrics {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
