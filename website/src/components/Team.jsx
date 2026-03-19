import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, Instagram, Linkedin, Twitter, X as CloseIcon } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';

/* ── Department accent colours ── */
const deptColor = {
  'Full-Stack': '#00f3ff',
  'AI/ML': '#c084fc',
  Backend: '#fb923c',
  Frontend: '#22d3ee',
  Design: '#f472b6',
};

const getImagePosition = (member, variant) => (
  member.imagePosition?.[variant]
  || member.imagePosition?.default
  || 'top center'
);

const PLACEHOLDER_PROFILE_URLS = new Set([
  'https://github.com',
  'https://www.github.com',
  'https://linkedin.com',
  'https://www.linkedin.com',
  'https://instagram.com',
  'https://www.instagram.com',
]);

const hasRealProfileUrl = (value) => {
  if (!value) {
    return false;
  }

  return !PLACEHOLDER_PROFILE_URLS.has(value.trim().replace(/\/+$/, '').toLowerCase());
};

/* ═══════════════════════════════════════════
   CINEMATIC SPOTLIGHT GRID
   Interactive grid with proximity glow effects
   ═══════════════════════════════════════════ */
const SpotlightCard = memo(({ member, color, onClick }) => {
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
  };

  return (
    <button
      type="button"
      ref={cardRef}
      className="team-card-wrapper"
      aria-label={`Open ${member.name}'s profile`}
      style={{
        '--team-accent': color,
        '--team-accent-glow': `${color}22`,
      }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
    >
      <div className="team-card-border-glow" />
      <div className="team-card-inner">
        <div className="team-card-bg-glow" />
        <div className="card-accent-line" />
        
        <div className="team-card-image">
          <img
            src={member.image}
            alt={member.name}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: getImagePosition(member, 'card') }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="team-card-fallback">
            <span style={{ color, fontSize: '2.5rem', fontWeight: 800, opacity: 0.4 }}>
              {member.name.split(' ').map((w) => w[0]).join('')}
            </span>
          </div>
        </div>

        <div className="team-card-body">
          <span className="team-role" style={{ color }}>{member.role}</span>
          <h3 className="team-name">{member.name}</h3>
          {member.skills && member.skills.length > 0 && (
            <p className="team-skills">{member.skills.slice(0, 3).join(' · ')}</p>
          )}
        </div>
      </div>
    </button>
  );
});
SpotlightCard.displayName = 'SpotlightCard';

const TeamGrid = memo(({ members, loading, onSelectMember }) => {
  if (loading) {
    return (
      <div className="container">
        <div className="team-grid-container">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="team-grid-item">
              <div className="team-card-wrapper" aria-hidden="true">
                <div className="team-card-inner" style={{ opacity: 0.65 }}>
                  <div className="team-card-image" />
                  <div className="team-card-body">
                    <span className="team-role">Loading member</span>
                    <h3 className="team-name">Fetching live content...</h3>
                    <p className="team-skills">Please wait a moment.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="container">
        <div className="static-texture-card rough-gradient-card" style={{
          '--card-bg-start': 'rgba(18, 28, 48, 0.92)',
          '--card-bg-end': 'rgba(8, 10, 24, 0.98)',
          '--card-glow-a': 'rgba(0, 212, 255, 0.12)',
          '--card-glow-b': 'rgba(167, 139, 250, 0.12)',
          textAlign: 'center',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '2.2rem',
        }}>
          <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>
            Team cards will show up here
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            No visible members are published yet. Add or unhide members from the admin portal to populate this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="team-grid-container">
        {members.map((member, i) => {
          const color = deptColor[member.department] || '#00f3ff';
          return (
            <motion.div
              key={member.id || member.name}
              className="team-grid-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
            >
              <SpotlightCard 
                member={member} 
                color={color} 
                onClick={() => onSelectMember(member)} 
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
TeamGrid.displayName = 'TeamGrid';

/* ═══════════════════════════════════════════
   ORBITAL DISPLAY (for modal)
   ═══════════════════════════════════════════ */
const OrbitalDisplay = ({ activeMember, allMembers, onSelectMember }) => {
  const color = deptColor[activeMember.department] || '#00f3ff';
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);

  const others = useMemo(
    () => allMembers.filter((m) => m.name !== activeMember.name),
    [allMembers, activeMember.name]
  );
  const ring1Members = useMemo(
    () => others.slice(0, Math.min(5, others.length)),
    [others]
  );
  const ring2Members = useMemo(
    () => others.slice(5, 10),
    [others]
  );
  const R1 = 155, R2 = 110;

  useEffect(() => {
    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = () => {
      angleRef.current += 0.15;
      [[ring1Ref, ring1Members, R1, 1], [ring2Ref, ring2Members, R2, -0.7]].forEach(([ref, members, r, dir]) => {
        if (!ref.current || !members.length) return;
        const kids = ref.current.children;
        for (let i = 0; i < kids.length; i++) {
          const a = ((360 / members.length) * i + angleRef.current * dir) * (Math.PI / 180);
          kids[i].style.transform = `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px)`;
        }
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (document.visibilityState === 'hidden' || rafRef.current) return;
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    start();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stop();
    };
  }, [ring1Members, ring2Members]);

  const avatar = (sz) => ({
    width: `${sz}px`, height: `${sz}px`,
    position: 'absolute', top: '50%', left: '50%',
    marginTop: `-${sz / 2}px`, marginLeft: `-${sz / 2}px`,
    borderRadius: '50%', overflow: 'hidden',
    cursor: 'pointer', transition: 'box-shadow .3s ease',
    border: 0,
    padding: 0,
    background: 'transparent',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', position: 'relative' }}>
      <div style={{ position: 'relative', width: '340px', height: '340px' }}>
        {[R1, R2].map((r, i) =>
          (i === 1 && !ring2Members.length) ? null : (
            <div key={r} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: `${r * 2}px`, height: `${r * 2}px`,
              marginTop: `-${r}px`, marginLeft: `-${r}px`,
              borderRadius: '50%', border: `1px solid ${i === 0 ? 'rgba(0,243,255,.1)' : 'rgba(167,139,250,.08)'}`,
              pointerEvents: 'none',
            }} />
          )
        )}
        <div ref={ring1Ref}>
          {ring1Members.map((m) => (
            <button type="button" key={m.name} style={avatar(42)} onClick={() => onSelectMember(m)} title={m.name} className="orbital-avatar" aria-label={`View ${m.name}`}>
              <img src={m.image} alt={m.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: getImagePosition(m, 'avatar'), borderRadius: '50%', border: '2px solid rgba(255,255,255,.12)' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            </button>
          ))}
        </div>
        <div ref={ring2Ref}>
          {ring2Members.map((m) => (
            <button type="button" key={m.name} style={avatar(36)} onClick={() => onSelectMember(m)} title={m.name} className="orbital-avatar" aria-label={`View ${m.name}`}>
              <img src={m.image} alt={m.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: getImagePosition(m, 'avatar'), borderRadius: '50%', border: '2px solid rgba(255,255,255,.08)' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            </button>
          ))}
        </div>
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <div key={`d-${i}`} style={{
              position: 'absolute', width: '5px', height: '5px', borderRadius: '50%',
              top: '50%', left: '50%', marginTop: '-2.5px', marginLeft: '-2.5px',
              transform: `translate(${Math.cos(rad) * (R1 + 18)}px, ${Math.sin(rad) * (R1 + 18)}px)`,
              background: i % 2 === 0 ? 'rgba(0,243,255,.25)' : 'rgba(167,139,250,.25)',
              boxShadow: i % 2 === 0 ? '0 0 6px rgba(0,243,255,.4)' : '0 0 6px rgba(167,139,250,.4)',
              pointerEvents: 'none',
            }} />
          );
        })}
        <motion.div
          key={activeMember.name}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '140px', height: '140px',
            marginTop: '-70px', marginLeft: '-70px',
            borderRadius: '50%', overflow: 'hidden',
            border: `3px solid ${color}`,
            boxShadow: `0 0 30px rgba(0,243,255,.15), 0 0 60px rgba(167,139,250,.08)`,
          }}
        >
          <img src={activeMember.image} alt={activeMember.name}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: getImagePosition(activeMember, 'modal') }}
            onError={(e) => { e.target.style.display = 'none'; }} />
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MODAL PANEL
   ═══════════════════════════════════════════ */
const MemberPanel = ({ member, allMembers, onClose, onSwitch }) => {
  if (!member) return null;
  const color = deptColor[member.department] || '#00f3ff';
  const socialLinks = [
    member.github && hasRealProfileUrl(member.github)
      ? { href: member.github, label: 'GitHub', icon: Github }
      : null,
    member.linkedin && hasRealProfileUrl(member.linkedin)
      ? { href: member.linkedin, label: 'LinkedIn', icon: Linkedin }
      : null,
    member.instagram && hasRealProfileUrl(member.instagram)
      ? { href: member.instagram, label: 'Instagram', icon: Instagram }
      : null,
    member.twitter && hasRealProfileUrl(member.twitter)
      ? { href: member.twitter, label: 'Twitter / X', icon: Twitter }
      : null,
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="cyber-panel-overlay"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="cyber-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-name"
      >
        <span className="corner corner-tl" />
        <span className="corner corner-br" />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

        <button type="button" onClick={onClose} className="panel-close-btn"
          aria-label={`Close ${member.name}'s profile`}
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', color: '#888', cursor: 'pointer', transition: 'all .3s ease' }}
        >
          <CloseIcon size={18} />
        </button>

        <div className="panel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '420px' }}>
          <OrbitalDisplay activeMember={member} allMembers={allMembers} onSelectMember={onSwitch} />

          <div style={{ padding: '3rem 2.5rem 3rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div key={member.name} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <h2 id="team-member-name" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem', color: '#fff' }}>
                {member.name}
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {[member.role, member.department].map((badge, i) => (
                  <span key={i} style={{ padding: '5px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#ccc' }}>{badge}</span>
                ))}
              </div>
              {member.bio && (
                <p style={{ color: 'rgba(180,190,210,.8)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{member.bio}</p>
              )}
              {member.skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(150,160,180,.6)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Core Strengths</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {member.skills.map((s, i) => (
                      <span key={i} style={{ padding: '5px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', color: '#aaa' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {socialLinks.length > 0 && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="panel-social-btn">
                      <Icon size={15} /> {label}
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   TEAM SECTION — MAIN COMPONENT
   ═══════════════════════════════════════════ */
const Team = () => {
  const { members, loading } = usePublicContent();
  const [selectedMember, setSelectedMember] = useState(null);
  const activeSelectedMember = useMemo(() => {
    if (!selectedMember) {
      return null;
    }

    return members.find((member) => (
      selectedMember.id
        ? member.id === selectedMember.id
        : member.name === selectedMember.name
    )) || null;
  }, [members, selectedMember]);

  useEffect(() => {
    document.body.style.overflow = activeSelectedMember ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeSelectedMember]);

  useEffect(() => {
    if (!activeSelectedMember) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedMember(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSelectedMember]);

  return (
    <section className="section cyber-team-section">
      {/* Section header (above the 3D viewport) */}
      <div className="container" style={{ position: 'relative', zIndex: 3, marginBottom: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="kicker-badge">Our Team</span>
          </div>
          <h2 className="heading-lg" style={{ marginBottom: '0.8rem' }}>
            Meet the <span className="text-gradient">Catalysts</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>
            A passionate group of developers, designers, and creators building the future together.
          </p>
        </div>
      </div>

      {/* ═══ CINEMATIC GRID ═══ */}
      <TeamGrid members={members} loading={loading} onSelectMember={setSelectedMember} />

      {/* Modal */}
      <AnimatePresence>
        {activeSelectedMember && (
          <MemberPanel
            member={activeSelectedMember}
            allMembers={members}
            onClose={() => setSelectedMember(null)}
            onSwitch={(m) => setSelectedMember(m)}
          />
        )}
      </AnimatePresence>

      {/* ═══ ALL CSS ═══ */}
      <style>{`
        /* ── SECTION ── */
        .cyber-team-section {
          position: relative;
          padding: 4rem 0 4rem;
          background: transparent;
          overflow-x: clip;
        }

        /* ══════════════════════════════════
           CINEMATIC GRID
           ══════════════════════════════════ */
        .team-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.8rem;
          padding: 2rem 0;
          position: relative;
          z-index: 10;
          align-items: stretch;
        }

        .team-grid-item {
          height: 100%;
        }

        .team-card-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: clamp(380px, 32vw, 470px);
          aspect-ratio: 0.82 / 1;
          border: 0;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05); /* Border base color */
          padding: 1px; /* The spotlight border width */
          cursor: pointer;
          text-align: left;
          appearance: none;
          font: inherit;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          --spotlight-x: 50%;
          --spotlight-y: 50%;
        }

        .team-card-wrapper:hover {
          transform: translateY(-8px);
        }
        .team-card-wrapper:focus-visible {
          outline: 2px solid rgba(0, 243, 255, 0.85);
          outline-offset: 4px;
          transform: translateY(-4px);
        }

        .team-card-border-glow {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          z-index: 0;
          opacity: 0;
          background: radial-gradient(600px circle at var(--spotlight-x) var(--spotlight-y), rgba(255,255,255,0.25), transparent 40%);
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .team-card-wrapper:hover .team-card-border-glow {
          opacity: 1;
        }

        .team-card-inner {
          position: relative;
          z-index: 1;
          background: rgba(12, 12, 28, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 19px;
          overflow: hidden;
          height: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
        }

        .team-card-bg-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0;
          background: radial-gradient(400px circle at var(--spotlight-x) var(--spotlight-y), var(--team-accent-glow), transparent 50%);
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .team-card-wrapper:hover .team-card-bg-glow {
          opacity: 1;
        }

        .card-accent-line {
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; z-index: 5;
          border-radius: 19px 19px 0 0;
          background: linear-gradient(90deg, transparent, var(--team-accent), transparent);
        }

        .team-card-image {
          width: 100%;
          height: 72%;
          min-height: clamp(250px, 24vw, 340px);
          overflow: hidden; position: relative;
          background: rgba(20, 20, 40, 0.5);
          z-index: 2;
          -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
        }
        .team-card-image img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .team-card-wrapper:hover .team-card-image img {
          transform: scale(1.05);
        }
        
        .team-card-fallback {
          display: none; width: 100%; height: 100%;
          align-items: center; justify-content: center;
          position: absolute; top: 0; left: 0;
          background: linear-gradient(135deg, rgba(0,212,255,.08), rgba(12,12,28,.8));
        }

        .team-card-body {
          padding: 0 1.25rem 1.25rem;
          margin-top: -20px;
          position: relative; z-index: 4;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        
        .team-role {
          font-size: .65rem; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
          display: block; margin-bottom: 6px;
        }
        .team-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.15rem; font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .team-skills {
          font-size: .75rem;
          color: var(--text-secondary, #8888a0);
          font-weight: 500;
          margin: 0;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .team-grid-container {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.25rem;
            padding: 1rem 0;
          }
          .team-card-wrapper {
            min-height: clamp(320px, 58vw, 390px);
            aspect-ratio: 0.72 / 1;
          }
          .team-card-image {
            height: 70%;
            min-height: 220px;
          }
          .team-card-body {
            padding: 0 1rem 1rem;
          }
          .team-name {
            font-size: 1.02rem;
          }
        }

        @media (max-width: 420px) {
          .team-grid-container {
            grid-template-columns: 1fr;
          }
          .team-card-wrapper {
            min-height: 410px;
            aspect-ratio: 0.78 / 1;
          }
          .team-card-image {
            height: 74%;
            min-height: 300px;
          }
        }

        /* ── MODAL ── */
        .cyber-panel-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(2,2,14,.88);
          backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          padding: 2rem; cursor: pointer;
        }
        .cyber-panel {
          position: relative; max-width: 920px; width: 100%;
          border-radius: 1.5rem;
          background: linear-gradient(160deg, rgba(8,12,28,.97), rgba(4,6,16,.98));
          border: 1px solid rgba(255,255,255,.06);
          box-shadow: 0 40px 80px rgba(0,0,0,.6), 0 0 60px rgba(0,243,255,.04);
          overflow: hidden; cursor: default;
        }
        .panel-close-btn:hover {
          border-color: rgba(255,255,255,.2) !important;
          color: #fff !important;
          background: rgba(255,255,255,.08) !important;
        }
        .panel-social-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-size: .85rem; font-weight: 600;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.1);
          color: #bbb; transition: all .3s ease; text-decoration: none;
        }
        .panel-social-btn:hover {
          border-color: rgba(0,243,255,.35); color: #fff;
          background: rgba(0,243,255,.06);
          box-shadow: 0 0 12px rgba(0,243,255,.1);
        }
        .orbital-avatar:hover {
          box-shadow: 0 0 16px rgba(0,243,255,.3) !important; z-index: 10;
        }
        .orbital-avatar:hover img {
          border-color: rgba(0,243,255,.5) !important;
        }
        .orbital-avatar:focus-visible {
          outline: 2px solid rgba(0, 243, 255, 0.85);
          outline-offset: 3px;
          box-shadow: 0 0 16px rgba(0,243,255,.3) !important;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .panel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default Team;
