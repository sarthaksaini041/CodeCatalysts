import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  X as CloseIcon,
} from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';

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

const withAlpha = (value, alpha) => (
  /^#[0-9a-f]{6}$/i.test(value) ? `${value}${alpha}` : value
);

const wrapIndex = (value, total) => {
  if (!total) {
    return 0;
  }

  return ((value % total) + total) % total;
};

const getCarouselOffset = (index, activeIndex, total) => {
  if (!total) {
    return 0;
  }

  let offset = index - activeIndex;

  if (offset > total / 2) {
    offset -= total;
  } else if (offset < -total / 2) {
    offset += total;
  }

  return offset;
};

const TeamCarousel = memo(({
  members,
  loading,
  activeIndex,
  onActiveIndexChange,
  onSelectMember,
}) => {
  if (loading) {
    return (
      <div className="container">
        <div className="team-carousel-shell">
          <div className="team-carousel-stage-wrap is-loading" aria-hidden="true">
            <div className="team-carousel-noise" />
            <div className="team-carousel-stage">
              {[-1, 0, 1].map((offset, index) => (
                <div
                  key={offset}
                  className={`team-carousel-item team-carousel-placeholder ${offset === 0 ? 'is-active' : ''}`}
                  style={{
                    '--offset': offset,
                    '--abs': Math.abs(offset),
                    opacity: 1 - Math.abs(offset) * 0.18,
                    zIndex: 3 - index,
                  }}
                >
                  <div className="team-carousel-card">
                    <div className="team-carousel-image loading-block" />
                    <div className="team-carousel-copy">
                      <span className="team-carousel-role">Loading member</span>
                      <h3>Fetching live content...</h3>
                      <p>Please wait a moment.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="container">
        <div
          className="static-texture-card rough-gradient-card"
          style={{
            '--card-bg-start': 'rgba(18, 28, 48, 0.92)',
            '--card-bg-end': 'rgba(8, 10, 24, 0.98)',
            '--card-glow-a': 'rgba(0, 212, 255, 0.12)',
            '--card-glow-b': 'rgba(167, 139, 250, 0.12)',
            textAlign: 'center',
            maxWidth: '760px',
            margin: '0 auto',
            padding: '2.2rem',
          }}
        >
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
      <div className="team-carousel-shell">
        <div className="team-carousel-stage-wrap">
          <div className="team-carousel-noise" />
          <div className="team-carousel-grid" />

          <div className="team-carousel-stage">
            {members.map((member, index) => {
              const offset = getCarouselOffset(index, activeIndex, members.length);
              const absoluteOffset = Math.abs(offset);
              const isActive = offset === 0;
              const isVisible = absoluteOffset <= 3;
              const color = deptColor[member.department] || '#00f3ff';
              const skillPreview = member.skills?.slice(0, 2).join(' / ');

              return (
                <button
                  key={member.id || member.name}
                  type="button"
                  className={`team-carousel-item ${isActive ? 'is-active' : ''}`}
                  aria-label={isActive ? `Open ${member.name}'s profile` : `Focus ${member.name}`}
                  aria-pressed={isActive}
                  tabIndex={isVisible ? 0 : -1}
                  style={{
                    '--offset': offset,
                    '--abs': absoluteOffset,
                    '--accent': color,
                    '--accent-soft': withAlpha(color, '22'),
                    '--accent-line': withAlpha(color, '70'),
                    opacity: isVisible ? 1 - absoluteOffset * 0.18 : 0,
                    zIndex: members.length - absoluteOffset,
                    pointerEvents: isVisible ? 'auto' : 'none',
                  }}
                  onClick={() => {
                    if (isActive) {
                      onSelectMember(member);
                      return;
                    }

                    onActiveIndexChange(index);
                  }}
                >
                  <span className="team-carousel-card-glow" />
                  <div className="team-carousel-card">
                    <div className="team-carousel-image">
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: getImagePosition(member, 'card') }}
                        onError={(event) => {
                          event.target.style.display = 'none';
                          event.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="team-carousel-fallback" aria-hidden="true">
                        {member.name.split(' ').map((word) => word[0]).join('')}
                      </div>
                    </div>

                    <div className="team-carousel-overlay" />
                    <div className="team-carousel-sheen" />

                    <div className="team-carousel-copy">
                      <span className="team-carousel-role" style={{ color }}>
                        {member.role}
                      </span>
                      <h3>{member.name}</h3>
                      <p>
                        {member.department}
                        {skillPreview ? ` / ${skillPreview}` : ''}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="team-carousel-controls">
            <div className="team-carousel-counter">
              <span>Team</span>
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong>
              <span>/ {String(members.length).padStart(2, '0')}</span>
            </div>

            <div className="team-carousel-button-row">
              <button
                type="button"
                className="team-carousel-nav"
                onClick={() => onActiveIndexChange(wrapIndex(activeIndex - 1, members.length))}
                disabled={members.length < 2}
                aria-label="Show previous team member"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                className="team-carousel-nav"
                onClick={() => onActiveIndexChange(wrapIndex(activeIndex + 1, members.length))}
                disabled={members.length < 2}
                aria-label="Show next team member"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TeamCarousel.displayName = 'TeamCarousel';

const OrbitalDisplay = ({ activeMember, allMembers, onSelectMember }) => {
  const color = deptColor[activeMember.department] || '#00f3ff';
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);

  const others = useMemo(
    () => allMembers.filter((member) => member.name !== activeMember.name),
    [allMembers, activeMember.name],
  );
  const ring1Members = useMemo(
    () => others.slice(0, Math.min(5, others.length)),
    [others],
  );
  const ring2Members = useMemo(
    () => others.slice(5, 10),
    [others],
  );
  const ring1Radius = 155;
  const ring2Radius = 110;

  useEffect(() => {
    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = () => {
      angleRef.current += 0.15;

      [
        [ring1Ref, ring1Members, ring1Radius, 1],
        [ring2Ref, ring2Members, ring2Radius, -0.7],
      ].forEach(([ref, ringMembers, radius, direction]) => {
        if (!ref.current || !ringMembers.length) {
          return;
        }

        const children = ref.current.children;

        for (let index = 0; index < children.length; index += 1) {
          const angle = (
            (360 / ringMembers.length) * index
            + angleRef.current * direction
          ) * (Math.PI / 180);

          children[index].style.transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (document.visibilityState === 'hidden' || rafRef.current) {
        return;
      }

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

  const avatarStyle = (size) => ({
    width: `${size}px`,
    height: `${size}px`,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: `-${size / 2}px`,
    marginLeft: `-${size / 2}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow .3s ease',
    border: 0,
    padding: 0,
    background: 'transparent',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', width: '340px', height: '340px' }}>
        {[ring1Radius, ring2Radius].map((radius, index) => (
          index === 1 && !ring2Members.length ? null : (
            <div
              key={radius}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                marginTop: `-${radius}px`,
                marginLeft: `-${radius}px`,
                borderRadius: '50%',
                border: `1px solid ${index === 0 ? 'rgba(0,243,255,.1)' : 'rgba(167,139,250,.08)'}`,
                pointerEvents: 'none',
              }}
            />
          )
        ))}

        <div ref={ring1Ref}>
          {ring1Members.map((member) => (
            <button
              type="button"
              key={member.name}
              style={avatarStyle(42)}
              onClick={() => onSelectMember(member)}
              title={member.name}
              className="orbital-avatar"
              aria-label={`View ${member.name}`}
            >
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: getImagePosition(member, 'avatar'),
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.12)',
                }}
                onError={(event) => {
                  event.target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>

        <div ref={ring2Ref}>
          {ring2Members.map((member) => (
            <button
              type="button"
              key={member.name}
              style={avatarStyle(36)}
              onClick={() => onSelectMember(member)}
              title={member.name}
              className="orbital-avatar"
              aria-label={`View ${member.name}`}
            >
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: getImagePosition(member, 'avatar'),
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.08)',
                }}
                onError={(event) => {
                  event.target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>

        {[0, 90, 180, 270].map((angle, index) => {
          const radians = (angle * Math.PI) / 180;

          return (
            <div
              key={`dot-${angle}`}
              style={{
                position: 'absolute',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                marginTop: '-2.5px',
                marginLeft: '-2.5px',
                transform: `translate(${Math.cos(radians) * (ring1Radius + 18)}px, ${Math.sin(radians) * (ring1Radius + 18)}px)`,
                background: index % 2 === 0 ? 'rgba(0,243,255,.25)' : 'rgba(167,139,250,.25)',
                boxShadow: index % 2 === 0
                  ? '0 0 6px rgba(0,243,255,.4)'
                  : '0 0 6px rgba(167,139,250,.4)',
                pointerEvents: 'none',
              }}
            />
          );
        })}

        <motion.div
          key={activeMember.name}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '140px',
            height: '140px',
            marginTop: '-70px',
            marginLeft: '-70px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${color}`,
            boxShadow: '0 0 30px rgba(0,243,255,.15), 0 0 60px rgba(167,139,250,.08)',
          }}
        >
          <img
            src={activeMember.image}
            alt={activeMember.name}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: getImagePosition(activeMember, 'modal'),
            }}
            onError={(event) => {
              event.target.style.display = 'none';
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

const MemberPanel = ({ member, allMembers, onClose, onSwitch }) => {
  if (!member) {
    return null;
  }

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="cyber-panel-overlay"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="cyber-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-name"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />

        <button
          type="button"
          onClick={onClose}
          className="panel-close-btn"
          aria-label={`Close ${member.name}'s profile`}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: '8px',
            color: '#888',
            cursor: 'pointer',
            transition: 'all .3s ease',
          }}
        >
          <CloseIcon size={18} />
        </button>

        <div
          className="panel-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            minHeight: '420px',
          }}
        >
          <OrbitalDisplay
            activeMember={member}
            allMembers={allMembers}
            onSelectMember={onSwitch}
          />

          <div
            style={{
              padding: '3rem 2.5rem 3rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                id="team-member-name"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginBottom: '1rem',
                  color: '#fff',
                }}
              >
                {member.name}
              </h2>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.2rem',
                }}
              >
                {[member.role, member.department].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.1)',
                      color: '#ccc',
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {member.bio && (
                <p
                  style={{
                    color: 'rgba(180,190,210,.8)',
                    fontSize: '0.98rem',
                    lineHeight: 1.7,
                    marginBottom: '1.5rem',
                  }}
                >
                  {member.bio}
                </p>
              )}

              {member.skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'rgba(150,160,180,.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                      }}
                    >
                      Core Strengths
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: '5px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          background: 'rgba(255,255,255,.03)',
                          border: '1px solid rgba(255,255,255,.08)',
                          color: '#aaa',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="panel-social-btn"
                    >
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

const Team = () => {
  const { members, loading } = usePublicContent();
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

    return () => {
      document.body.style.overflow = '';
    };
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

  const focusMember = (member) => {
    const memberIndex = members.findIndex((entry) => (
      member.id ? entry.id === member.id : entry.name === member.name
    ));

    if (memberIndex >= 0) {
      setActiveIndex(memberIndex);
    }

    setSelectedMember(member);
  };

  return (
    <section className="section cyber-team-section">
      <div className="container team-intro-wrap" style={{ position: 'relative', zIndex: 3 }}>
        <div className="section-intro-shell team-section-intro" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="kicker-badge">Our Team</span>
          </div>
          <h2 className="heading-lg team-section-title" style={{ marginBottom: '0.8rem' }}>
            Meet the <span className="text-gradient">Catalysts</span>
          </h2>
          <p
            className="section-intro-copy team-section-subtitle"
            style={{
              maxWidth: '560px',
              margin: '0 auto',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            <span className="team-section-subtitle-desktop">
              A focused carousel of the people behind CodeCatalysts, adapted from your idea and built around the member content we already have.
            </span>
            <span className="team-section-subtitle-mobile">
              Meet the people building CodeCatalysts.
            </span>
          </p>
        </div>
      </div>

      <TeamCarousel
        members={members}
        loading={loading}
        activeIndex={wrapIndex(activeIndex, members.length)}
        onActiveIndexChange={setActiveIndex}
        onSelectMember={focusMember}
      />

      <AnimatePresence>
        {activeSelectedMember && (
          <MemberPanel
            member={activeSelectedMember}
            allMembers={members}
            onClose={() => setSelectedMember(null)}
            onSwitch={focusMember}
          />
        )}
      </AnimatePresence>

      <style>{`
        .cyber-team-section {
          position: relative;
          padding: 4rem 0 4.5rem;
          background: transparent;
          overflow: clip;
        }

        .cyber-team-section::before {
          content: '';
          position: absolute;
          inset: auto auto 0 50%;
          width: min(68rem, 90vw);
          height: 24rem;
          transform: translateX(-50%);
          background:
            radial-gradient(circle at 30% 40%, rgba(0, 243, 255, 0.12), transparent 34%),
            radial-gradient(circle at 72% 58%, rgba(192, 132, 252, 0.08), transparent 32%);
          filter: blur(26px);
          pointer-events: none;
        }

        .team-intro-wrap {
          margin-bottom: 1rem;
        }

        .team-section-subtitle-mobile {
          display: none;
        }

        .team-carousel-shell {
          position: relative;
          display: grid;
          gap: 1.5rem;
          z-index: 1;
        }

        .team-carousel-stage-wrap {
          position: relative;
          isolation: isolate;
          border-radius: 34px;
          padding: clamp(1.1rem, 2vw, 1.75rem);
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -28%), rgba(242, 254, 255, calc(0.04 + (var(--surface-light-strength, 0.34) * 0.14))) 0%, rgba(110, 236, 255, calc(0.02 + (var(--surface-glow-opacity, 0.12) * 0.3))) 18%, transparent 58%),
            linear-gradient(180deg, rgba(9, 13, 30, 0.86), rgba(5, 8, 18, 0.94)),
            rgba(4, 6, 18, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 26px) var(--surface-shadow-blur, 44px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.1)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.34)));
          overflow: hidden;
        }

        .team-carousel-stage-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 16% 18%, rgba(0, 243, 255, 0.14), transparent 24%),
            radial-gradient(circle at 84% 74%, rgba(192, 132, 252, 0.11), transparent 22%);
          pointer-events: none;
        }

        .team-carousel-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.45), transparent 85%);
          pointer-events: none;
        }

        .team-carousel-noise {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(125deg, rgba(255, 255, 255, 0.08), transparent 28%, transparent 72%, rgba(255, 255, 255, 0.05)),
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.06), transparent 42%);
          opacity: 0.6;
          pointer-events: none;
        }

        .team-carousel-stage {
          --carousel-step-x: min(18rem, 24vw);
          --carousel-card-width: clamp(250px, 28vw, 338px);
          --carousel-card-height: clamp(340px, 43vw, 468px);
          position: relative;
          min-height: clamp(380px, 52vw, 560px);
          perspective: 1800px;
          transform-style: preserve-3d;
        }

        .team-carousel-item {
          position: absolute;
          top: 50%;
          left: 50%;
          width: var(--carousel-card-width);
          height: var(--carousel-card-height);
          padding: 0;
          border: 0;
          background: transparent;
          appearance: none;
          color: inherit;
          cursor: pointer;
          text-align: left;
          transform-style: preserve-3d;
          will-change: transform, opacity, filter;
          transform:
            translate3d(
              calc(-50% + var(--offset) * var(--carousel-step-x)),
              calc(-50% + var(--abs) * 1.2rem),
              calc((4 - var(--abs)) * 18px)
            )
            rotateY(calc(var(--offset) * -10deg))
            rotateZ(calc(var(--offset) * 8deg))
            scale(calc(1 - var(--abs) * 0.1));
          filter:
            saturate(calc(1 - var(--abs) * 0.12))
            brightness(calc(1 - var(--abs) * 0.06));
          transition:
            transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1),
            opacity 0.45s ease,
            filter 0.45s ease;
        }

        .team-carousel-item:hover {
          filter: saturate(1.04) brightness(1.04);
        }

        .team-carousel-item.is-active {
          transform:
            translate3d(-50%, -50%, 72px)
            rotateY(0deg)
            rotateZ(0deg)
            scale(1);
          filter: none;
        }

        .team-carousel-item:focus-visible {
          outline: 2px solid rgba(0, 243, 255, 0.85);
          outline-offset: 6px;
        }

        .team-carousel-card-glow {
          position: absolute;
          inset: 8% 12%;
          border-radius: 999px;
          background: radial-gradient(circle, var(--accent-soft), transparent 72%);
          filter: blur(36px);
          opacity: 0.85;
          pointer-events: none;
        }

        .team-carousel-card {
          position: relative;
          height: 100%;
          border-radius: 28px;
          overflow: hidden;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -26%), rgba(244, 254, 255, calc(0.05 + (var(--surface-light-strength, 0.34) * 0.16))) 0%, rgba(116, 236, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.34))) 18%, transparent 56%),
            linear-gradient(180deg, rgba(12, 16, 34, 0.94), rgba(7, 10, 20, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 24px) var(--surface-shadow-blur, 38px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.12)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.03 + (var(--surface-edge-opacity, 0.08) * 0.46))),
            0 0 0 1px var(--accent-soft);
        }

        .team-carousel-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 24%, transparent 70%, rgba(0, 0, 0, 0.3));
          pointer-events: none;
        }

        .team-carousel-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-top: 1px solid var(--accent-line);
          border-radius: 28px;
          pointer-events: none;
        }

        .team-carousel-image {
          position: absolute;
          inset: 0;
        }

        .team-carousel-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .team-carousel-item:hover .team-carousel-image img,
        .team-carousel-item.is-active .team-carousel-image img {
          transform: scale(1.04);
        }

        .team-carousel-fallback {
          display: none;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, rgba(0, 243, 255, 0.14), rgba(10, 12, 28, 0.95));
          color: rgba(255, 255, 255, 0.66);
          font-size: clamp(2.5rem, 8vw, 3.6rem);
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .team-carousel-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(2, 4, 10, 0.08), rgba(2, 4, 10, 0.15) 34%, rgba(2, 4, 10, 0.86)),
            linear-gradient(120deg, transparent 52%, rgba(255, 255, 255, 0.08) 60%, transparent 75%);
          pointer-events: none;
        }

        .team-carousel-sheen {
          position: absolute;
          inset: auto -25% 45% 10%;
          height: 10rem;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
          transform: rotate(16deg);
          filter: blur(24px);
          opacity: 0.5;
          pointer-events: none;
        }

        .team-carousel-index {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.88);
          background: rgba(10, 14, 30, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .team-carousel-copy {
          position: absolute;
          left: 1.2rem;
          right: 1.2rem;
          bottom: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          z-index: 1;
        }

        .team-carousel-role {
          font-size: 0.72rem;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .team-carousel-copy h3 {
          margin: 0;
          color: #ffffff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.2rem, 2.5vw, 1.55rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .team-carousel-copy p {
          margin: 0;
          color: rgba(214, 223, 240, 0.75);
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .team-carousel-controls {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 1.25rem;
        }

        .team-carousel-counter {
          display: inline-flex;
          align-items: baseline;
          gap: 0.45rem;
          color: rgba(215, 224, 241, 0.72);
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .team-carousel-counter strong {
          color: #ffffff;
          font-size: 1.35rem;
          letter-spacing: -0.04em;
        }

        .team-carousel-button-row {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .team-carousel-nav {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -18%), rgba(255, 255, 255, calc(0.03 + (var(--surface-light-strength, 0.34) * 0.1))) 0%, transparent 56%),
            rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.82);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            background 0.3s ease,
            color 0.3s ease;
          box-shadow:
            var(--surface-shadow-x, 0px) calc(var(--surface-shadow-y, 18px) * 0.42) calc(var(--surface-shadow-blur, 30px) * 0.34) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.3)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.3)));
        }

        .team-carousel-nav:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(0, 243, 255, 0.3);
          background: rgba(0, 243, 255, 0.08);
          color: #ffffff;
        }

        .team-carousel-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .team-carousel-placeholder {
          cursor: default;
        }

        .loading-block {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.05));
          background-size: 200% 100%;
          animation: team-loading-shimmer 1.8s linear infinite;
        }

        @keyframes team-loading-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .cyber-panel-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(2, 2, 14, 0.88);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          cursor: pointer;
        }

        .cyber-panel {
          position: relative;
          max-width: 920px;
          width: 100%;
          border-radius: 1.5rem;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -28%), rgba(244, 254, 255, calc(0.04 + (var(--surface-light-strength, 0.34) * 0.12))) 0%, rgba(110, 236, 255, calc(0.02 + (var(--surface-glow-opacity, 0.12) * 0.26))) 18%, transparent 58%),
            linear-gradient(160deg, rgba(8, 12, 28, 0.97), rgba(4, 6, 16, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 34px) calc(var(--surface-shadow-blur, 48px) + 20px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.24)),
            0 0 60px rgba(0, 243, 255, 0.04);
          overflow: hidden;
          cursor: default;
        }

        .panel-close-btn:hover {
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
          background: rgba(255, 255, 255, 0.08) !important;
        }

        .panel-social-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -16%), rgba(255, 255, 255, calc(0.02 + (var(--surface-light-strength, 0.34) * 0.08))) 0%, transparent 54%),
            rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #bbb;
          transition: all 0.3s ease;
          text-decoration: none;
          box-shadow:
            var(--surface-shadow-x, 0px) calc(var(--surface-shadow-y, 18px) * 0.36) calc(var(--surface-shadow-blur, 28px) * 0.32) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.26)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.24)));
        }

        .panel-social-btn:hover {
          border-color: rgba(0, 243, 255, 0.35);
          color: #fff;
          background: rgba(0, 243, 255, 0.06);
          box-shadow: 0 0 12px rgba(0, 243, 255, 0.1);
        }

        .orbital-avatar:hover {
          box-shadow: 0 0 16px rgba(0, 243, 255, 0.3) !important;
          z-index: 10;
        }

        .orbital-avatar:hover img {
          border-color: rgba(0, 243, 255, 0.5) !important;
        }

        .orbital-avatar:focus-visible {
          outline: 2px solid rgba(0, 243, 255, 0.85);
          outline-offset: 3px;
          box-shadow: 0 0 16px rgba(0, 243, 255, 0.3) !important;
          z-index: 10;
        }

        @media (max-width: 900px) {
          .team-carousel-stage {
            --carousel-step-x: min(13rem, 26vw);
            --carousel-card-width: clamp(220px, 34vw, 300px);
            --carousel-card-height: clamp(300px, 46vw, 410px);
            min-height: clamp(330px, 56vw, 460px);
          }

          .team-carousel-stage-wrap {
            border-radius: 28px;
          }
        }

        @media (max-width: 768px) {
          .team-intro-wrap {
            margin-bottom: 1.35rem;
          }

          .team-section-intro {
            padding: 1rem 0.6rem 0.35rem;
          }

          .team-section-title {
            margin-bottom: 1rem !important;
          }

          .team-section-subtitle {
            max-width: 30rem !important;
            font-size: 0.98rem !important;
            line-height: 1.72 !important;
          }

          .team-carousel-stage {
            --carousel-step-x: min(8.5rem, 24vw);
            --carousel-card-width: clamp(200px, 54vw, 260px);
            --carousel-card-height: clamp(276px, 72vw, 360px);
            min-height: 390px;
          }

          .team-carousel-item {
            transform:
              translate3d(
                calc(-50% + var(--offset) * var(--carousel-step-x)),
                calc(-50% + var(--abs) * 0.85rem),
                calc((4 - var(--abs)) * 12px)
              )
              rotateY(calc(var(--offset) * -8deg))
              rotateZ(calc(var(--offset) * 6deg))
              scale(calc(1 - var(--abs) * 0.09));
          }

          .team-carousel-controls {
            margin-top: 1rem;
          }

          .panel-grid {
            grid-template-columns: 1fr !important;
          }

          .cyber-panel-overlay {
            padding: 1rem;
          }
        }

        @media (max-width: 560px) {
          .cyber-team-section {
            padding: 3.6rem 0 4.25rem;
          }

          .team-intro-wrap {
            margin-bottom: 1.6rem;
          }

          .team-section-intro {
            padding: 0.95rem 0.45rem 0.5rem;
          }

          .team-section-title {
            margin-bottom: 1.05rem !important;
          }

          .team-section-subtitle {
            max-width: 18rem !important;
            font-size: 0.96rem !important;
            line-height: 1.76 !important;
          }

          .team-section-subtitle-desktop {
            display: none;
          }

          .team-section-subtitle-mobile {
            display: inline;
          }

          .team-carousel-stage {
            --carousel-step-x: 5.7rem;
            --carousel-card-width: min(72vw, 250px);
            --carousel-card-height: min(96vw, 332px);
            min-height: 360px;
          }

          .team-carousel-stage-wrap {
            padding: 1.12rem 1rem 1.16rem;
            border-radius: 24px;
          }

          .team-carousel-controls {
            margin-top: 1.1rem;
            flex-direction: column;
            align-items: stretch;
          }

          .team-carousel-counter {
            justify-content: center;
          }

          .team-carousel-button-row {
            justify-content: center;
          }

          .cyber-panel {
            max-height: calc(100vh - 2rem);
            overflow: auto;
          }
        }
      `}</style>
    </section>
  );
};

export default Team;
