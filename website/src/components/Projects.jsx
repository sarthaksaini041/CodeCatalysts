import React from 'react';
import { ArrowUpRight, Github, Globe, Rocket, Sparkles, SquareKanban } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';

function ProjectLinks({ project }) {
  const links = [
    project.liveUrl ? { href: project.liveUrl, label: 'Live', icon: Globe } : null,
    project.githubUrl ? { href: project.githubUrl, label: 'Code', icon: Github } : null,
  ].filter(Boolean);

  if (!links.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
        >
          <Icon size={15} />
          <span>{label}</span>
          <ArrowUpRight size={14} />
        </a>
      ))}
    </div>
  );
}

const Projects = () => {
  const { projects, loading } = usePublicContent();

  return (
    <section className="section" style={{ background: 'transparent' }}>
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
            Live project cards managed from the admin portal and published straight from Supabase.
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
          <div className="adaptive-card-grid" style={{ alignItems: 'stretch' }}>
            {projects.map((project) => (
              <article key={project.id || project.slug} className="static-texture-card rough-gradient-card project-card" style={{
                '--card-bg-start': 'rgba(18, 24, 48, 0.96)',
                '--card-bg-end': 'rgba(8, 10, 24, 0.98)',
                '--card-glow-a': project.featured ? 'rgba(0, 212, 255, 0.22)' : 'rgba(127, 108, 255, 0.12)',
                '--card-glow-b': project.featured ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0, 212, 255, 0.12)',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  position: 'relative',
                  minHeight: '220px',
                  background: 'linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))',
                  overflow: 'hidden',
                }}>
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ minHeight: '220px', display: 'grid', placeItems: 'center', color: 'var(--neon-cyan)' }}>
                      <SquareKanban size={40} />
                    </div>
                  )}

                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(3, 6, 16, 0.04) 0%, rgba(3, 6, 16, 0.28) 55%, rgba(3, 6, 16, 0.88) 100%)',
                  }} />

                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    display: 'flex',
                    gap: '0.55rem',
                    flexWrap: 'wrap',
                  }}>
                    {project.featured ? (
                      <span className="project-badge">
                        <Sparkles size={13} />
                        <span>Featured</span>
                      </span>
                    ) : null}
                    {project.category ? <span className="project-badge muted">{project.category}</span> : null}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'flex-start' }}>
                    <h3 className="heading-md" style={{ fontSize: '1.3rem' }}>{project.title}</h3>
                    {project.status ? <span className="project-status">{project.status}</span> : null}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.9rem', lineHeight: 1.7 }}>
                    {project.shortDescription}
                  </p>

                  {project.techStack?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.2rem' }}>
                      {project.techStack.slice(0, 5).map((item) => (
                        <span key={item} className="project-chip">{item}</span>
                      ))}
                    </div>
                  ) : null}

                  <ProjectLinks project={project} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .project-card img {
          transition: transform 0.45s ease;
        }

        .project-card:hover img {
          transform: scale(1.04);
        }

        .project-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.38rem 0.7rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 600;
          backdrop-filter: blur(12px);
        }

        .project-badge.muted {
          color: rgba(228, 233, 244, 0.88);
        }

        .project-status {
          display: inline-flex;
          align-items: center;
          padding: 0.34rem 0.72rem;
          border-radius: 999px;
          background: rgba(0, 212, 255, 0.08);
          border: 1px solid rgba(0, 212, 255, 0.16);
          color: var(--neon-cyan);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .project-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.38rem 0.72rem;
          border-radius: 999px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          color: rgba(228,233,244,.86);
          font-size: 0.8rem;
        }

        .project-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.72rem 0.92rem;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.04);
          color: #eef5ff;
          font-weight: 600;
        }

        .project-link:hover {
          border-color: rgba(0,212,255,.24);
          background: rgba(0,212,255,.08);
          color: #fff;
        }
      `}</style>
    </section>
  );
};

export default Projects;
