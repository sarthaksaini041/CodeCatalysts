import React from 'react';
import { ArrowUpRight, Github, Globe, Rocket, Sparkles, SquareKanban } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';

const ProjectLinks = React.memo(function ProjectLinks({ project }) {
  const links = [
    project.liveUrl ? { href: project.liveUrl, label: 'Live', icon: Globe } : null,
    project.githubUrl ? { href: project.githubUrl, label: 'Code', icon: Github } : null,
  ].filter(Boolean);

  if (!links.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
        >
          <Icon size={14} />
          <span>{label}</span>
          <ArrowUpRight size={14} />
        </a>
      ))}
    </div>
  );
});

const ProjectCard = React.memo(function ProjectCard({ project }) {
  const cardRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const pointerRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--mouse-x', `${pointerRef.current.x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${pointerRef.current.y}px`);
    });
  };

  return (
    <article
      ref={cardRef}
      className="project-card premium-glass-card"
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        '--project-color': project.featured ? 'rgba(0, 212, 255, 1)' : 'rgba(127, 108, 255, 1)'
      }}
    >
      <div className="project-card-spotlight" />
      <div className="project-card-border" />
      <div className="project-card-inner">
        <div className="project-image-wrapper">
          {project.image ? (
            <img src={project.image} alt={project.title} loading="lazy" />
          ) : (
            <div className="project-image-fallback">
              <SquareKanban size={40} />
            </div>
          )}
          <div className="project-image-overlay" />
          <div className="project-badges">
            {project.featured && (
              <span className="project-badge highlighted">
                <Sparkles size={13} />
                <span>Featured</span>
              </span>
            )}
            {project.category && <span className="project-badge">{project.category}</span>}
          </div>
        </div>

        <div className="project-content">
          <div className="project-header">
            <h3 className="project-title">{project.title}</h3>
            {project.status && <span className="project-status">{project.status}</span>}
          </div>
          
          <p className="project-description">
            {project.shortDescription}
          </p>

          {project.techStack?.length > 0 && (
            <div className="project-tech-stack">
              {project.techStack.slice(0, 5).map((item) => (
                <span key={item} className="project-chip">{item}</span>
              ))}
            </div>
          )}

          <div style={{ flexGrow: 1 }} />
          <div className="project-footer">
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>
    </article>
  );
});

const Projects = () => {
  const { projects, loading } = usePublicContent();

  return (
    <section className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="section-intro-shell" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="kicker-badge">
              Projects
            </div>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
            Things we've <span className="text-gradient">built</span>
          </h2>
          <p className="section-intro-copy" style={{ maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Explore the applications, interfaces, and platforms we've crafted to inspire and innovate.
          </p>
        </div>

        {loading ? (
          <div className="adaptive-card-grid">
            {[0, 1, 2].map((index) => (
              <div key={index} className="static-texture-card rough-gradient-card" style={{
                '--card-bg-start': 'rgba(18, 24, 48, 0.94)',
                '--card-bg-end': 'rgba(8, 10, 24, 0.98)',
                '--card-glow-a': 'rgba(0, 212, 255, 0.14)',
                '--card-glow-b': 'rgba(127, 108, 255, 0.12)',
                minHeight: '420px',
                opacity: 0.72,
              }} />
            ))}
          </div>
        ) : !projects.length ? (
          <div className="static-texture-card rough-gradient-card" style={{
            '--card-bg-start': 'rgba(22, 24, 50, 0.96)',
            '--card-bg-end': 'rgba(10, 8, 22, 0.98)',
            '--card-glow-a': 'rgba(0, 212, 255, 0.2)',
            '--card-glow-b': 'rgba(127, 108, 255, 0.18)',
            textAlign: 'center',
            padding: '4rem 2rem',
            maxWidth: '750px',
            margin: '0 auto',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-gradient)' }} />

            <div style={{
              width: '64px', height: '64px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(0,212,255,.1), rgba(255,255,255,.02))',
              border: '1px solid rgba(0,212,255,.16)',
              borderRadius: '14px', color: 'var(--neon-cyan)',
              margin: '0 auto 2rem auto',
            }}>
              <Rocket size={28} />
            </div>

            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>
              Fresh builds <span className="text-gradient">coming soon</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 2rem auto', fontSize: '1rem', lineHeight: 1.7 }}>
              No visible project cards are published yet. Add or unhide projects from the admin portal and they will appear here automatically.
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
                Ready for launch
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2.5rem',
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {projects.map((project) => (
              <ProjectCard key={project.id || project.slug} project={project} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .premium-glass-card {
          position: relative;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -24%), rgba(238, 254, 255, calc(0.05 + (var(--surface-light-strength, 0.34) * 0.16))) 0%, rgba(122, 238, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.38))) 18%, transparent 56%),
            rgba(8, 12, 24, 0.4);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          isolation: isolate;
          overflow: hidden;
          width: 100%;
          max-width: 420px;
          flex: 1 1 340px;
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 24px) var(--surface-shadow-blur, 42px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.12)),
            calc(var(--surface-shadow-x, 0px) * 0.45) calc(var(--surface-shadow-y, 24px) * 0.52) calc(var(--surface-shadow-blur, 42px) * 0.56) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.44)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.04 + (var(--surface-edge-opacity, 0.08) * 0.7))),
            inset 0 -22px 36px rgba(0, 0, 0, calc(var(--surface-occlusion-opacity, 0.14) * 0.82));
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
        }

        .premium-glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -18%), rgba(255, 255, 255, calc(0.06 + (var(--surface-light-strength, 0.34) * 0.16))) 0%, rgba(142, 240, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.32))) 18%, transparent 44%),
            linear-gradient(180deg, rgba(196, 252, 255, calc(0.05 + (var(--surface-sheen-opacity, 0.08) * 0.74))) 0%, rgba(108, 232, 255, calc(0.02 + (var(--surface-sheen-opacity, 0.08) * 0.34))) 16%, transparent 34%);
          pointer-events: none;
          z-index: 1;
          opacity: 0.95;
          mix-blend-mode: screen;
        }

        .premium-glass-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow:
            var(--surface-shadow-x, 0px) calc(var(--surface-shadow-y, 24px) + 8px) calc(var(--surface-shadow-blur, 42px) + 10px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.16)),
            calc(var(--surface-shadow-x, 0px) * 0.45) calc(var(--surface-shadow-y, 24px) * 0.58) calc(var(--surface-shadow-blur, 42px) * 0.6) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.5)),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .project-card-spotlight {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.04),
            transparent 40%
          );
          z-index: 1;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .premium-glass-card:hover .project-card-spotlight {
          opacity: 1;
        }

        .project-card-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(
            400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            var(--project-color),
            transparent 40%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
        }

        .premium-glass-card:hover .project-card-border {
          opacity: 0.6;
        }

        .project-card-inner {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          flex: 1;
          background:
            linear-gradient(180deg, rgba(196, 252, 255, 0.08) 0%, rgba(16, 20, 36, 0.16) 14%, rgba(8, 10, 20, 0.6) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: inherit;
        }

        .project-image-wrapper {
          position: relative;
          height: 240px;
          padding: 1rem;
          overflow: hidden;
        }

        .project-image-wrapper img, .project-image-fallback {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
        }

        .project-image-fallback {
          display: grid;
          place-items: center;
          color: rgba(0, 212, 255, 0.6);
        }

        .premium-glass-card:hover .project-image-wrapper img {
          transform: scale(1.06);
        }

        .project-image-overlay {
          position: absolute;
          inset: 1rem;
          border-radius: 12px;
          background: linear-gradient(180deg, transparent 40%, rgba(4, 6, 14, 0.9) 100%);
          pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .project-badges {
          position: absolute;
          bottom: 1.8rem;
          left: 1.8rem;
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          z-index: 10;
        }

        .project-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: rgba(8, 14, 28, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(220, 230, 255, 0.9);
          font-size: 0.75rem;
          font-weight: 500;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .project-badge.highlighted {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.3);
          color: #5ed6ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
        }

        .project-content {
          padding: 0.5rem 1.8rem 1.8rem 1.8rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.8rem;
        }

        .project-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .project-status {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          background: rgba(125, 108, 255, 0.1);
          border: 1px solid rgba(125, 108, 255, 0.25);
          color: #a797ff;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .project-description {
          color: rgba(180, 195, 220, 0.85);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .project-tech-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .project-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -20%), rgba(255, 255, 255, calc(0.02 + (var(--surface-light-strength, 0.34) * 0.08))) 0%, transparent 58%),
            rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(180, 195, 220, 0.75);
          font-size: 0.75rem;
          transition: all 0.3s ease;
        }

        .premium-glass-card:hover .project-chip {
          border-color: rgba(255, 255, 255, 0.12);
          color: rgba(220, 230, 255, 0.9);
        }

        .project-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -20%), rgba(236, 253, 255, calc(0.03 + (var(--surface-light-strength, 0.34) * 0.12))) 0%, transparent 58%),
            rgba(0, 212, 255, 0.06);
          border: 1px solid rgba(0, 212, 255, 0.15);
          color: #5ed6ff;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow:
            var(--surface-shadow-x, 0px) calc(var(--surface-shadow-y, 18px) * 0.42) calc(var(--surface-shadow-blur, 30px) * 0.38) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.32)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.32)));
        }

        .project-link:hover {
          background: rgba(0, 212, 255, 0.12);
          border-color: rgba(0, 212, 255, 0.35);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.15);
        }
      `}</style>
    </section>
  );
};

export default Projects;
