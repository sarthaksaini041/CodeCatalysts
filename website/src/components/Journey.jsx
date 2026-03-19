import React from 'react';
import { usePublicContent } from '../context/PublicContentContext';

const Journey = () => {
  const { journey, loading } = usePublicContent();

  return (
    <section className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div className="kicker-badge">
              Journey
            </div>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: '1rem' }}>
            Moments that <span className="text-gradient">shaped</span> us
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
            A quick timeline of the wins and milestones behind Code Catalysts.
          </p>
        </div>

        {loading ? (
          <div className="static-texture-card rough-gradient-card" style={{
            '--card-bg-start': 'rgba(12, 42, 58, 0.88)',
            '--card-bg-end': 'rgba(8, 10, 22, 0.96)',
            '--card-glow-a': 'rgba(34, 211, 238, 0.18)',
            '--card-glow-b': 'rgba(167, 139, 250, 0.12)',
            padding: '2rem',
            maxWidth: '760px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>Loading journey</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Pulling the latest timeline entries from Supabase.
            </p>
          </div>
        ) : !journey.length ? (
          <div className="static-texture-card rough-gradient-card" style={{
            '--card-bg-start': 'rgba(12, 42, 58, 0.88)',
            '--card-bg-end': 'rgba(8, 10, 22, 0.96)',
            '--card-glow-a': 'rgba(34, 211, 238, 0.18)',
            '--card-glow-b': 'rgba(167, 139, 250, 0.12)',
            padding: '2rem',
            maxWidth: '760px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>Timeline entries will appear here</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              No visible journey entries are published yet. Add or unhide milestones from the admin portal.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: '20px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--neon-cyan), var(--neon-purple), transparent)',
              zIndex: 0,
            }} />

            {journey.map((item, index) => (
              <div key={item.id || `${item.date}-${item.title}`} style={{
                position: 'relative', paddingLeft: '56px',
                marginBottom: index < journey.length - 1 ? '2.5rem' : 0,
                zIndex: 1,
              }}>
                <div style={{
                  position: 'absolute', top: '1rem', left: '10px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'var(--bg-color)',
                  border: '2px solid var(--neon-cyan)',
                  boxShadow: '0 0 12px rgba(0,212,255,.4)',
                }} />

                <div className="static-texture-card rough-gradient-card" style={{
                  '--card-bg-start': 'rgba(12, 42, 58, 0.96)',
                  '--card-bg-end': 'rgba(8, 10, 22, 0.98)',
                  '--card-glow-a': 'rgba(34, 211, 238, 0.22)',
                  '--card-glow-b': 'rgba(167, 139, 250, 0.14)',
                  padding: '1.8rem',
                }}>
                  <span style={{
                    color: 'var(--neon-purple)', fontWeight: 600, fontSize: '0.85rem',
                    letterSpacing: '0.04em', marginBottom: '0.6rem', display: 'block',
                  }}>
                    {item.date}
                  </span>
                  <h3 className="heading-md" style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Journey;
