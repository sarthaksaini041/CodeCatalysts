import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamData } from '../data';
import { Github, Linkedin, Instagram, ChevronLeft, ChevronRight, X } from 'lucide-react';

/* department colour map */
const deptColor = {
  'Full-Stack': '#00d4ff',
  'AI/ML': '#c084fc',
  'Backend': '#fb923c',
  'Frontend': '#22d3ee',
  'Design': '#f472b6',
};

/* ═══════════════════════════════════════
   ORBITAL AVATAR DISPLAY
   Uses JS animation so each face stays upright
   ═══════════════════════════════════════ */
const OrbitalDisplay = ({ activeMember, allMembers, onSelectMember }) => {
  const color = deptColor[activeMember.department] || '#00d4ff';
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);

  // split other members into two rings
  const others = allMembers.filter(m => m.name !== activeMember.name);
  const ring1Members = others.slice(0, Math.min(5, others.length));
  const ring2Members = others.slice(5, 10);

  const RING1_RADIUS = 155;
  const RING2_RADIUS = 110;

  const updatePositions = useCallback(() => {
    angleRef.current += 0.15; // degrees per frame

    // ring 1 — outer, clockwise
    if (ring1Ref.current) {
      const items = ring1Ref.current.children;
      for (let i = 0; i < items.length; i++) {
        const baseAngle = (360 / ring1Members.length) * i;
        const currentAngle = baseAngle + angleRef.current;
        const rad = (currentAngle * Math.PI) / 180;
        const x = Math.cos(rad) * RING1_RADIUS;
        const y = Math.sin(rad) * RING1_RADIUS;
        items[i].style.transform = `translate(${x}px, ${y}px)`;
      }
    }

    // ring 2 — inner, counter-clockwise
    if (ring2Ref.current) {
      const items = ring2Ref.current.children;
      for (let i = 0; i < items.length; i++) {
        const baseAngle = (360 / ring2Members.length) * i;
        const currentAngle = baseAngle - angleRef.current * 0.7;
        const rad = (currentAngle * Math.PI) / 180;
        const x = Math.cos(rad) * RING2_RADIUS;
        const y = Math.sin(rad) * RING2_RADIUS;
        items[i].style.transform = `translate(${x}px, ${y}px)`;
      }
    }

    rafRef.current = requestAnimationFrame(updatePositions);
  }, [ring1Members.length, ring2Members.length]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updatePositions);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [updatePositions]);

  const avatarStyle = (size, isClickable = true) => ({
    width: `${size}px`, height: `${size}px`,
    position: 'absolute',
    top: '50%', left: '50%',
    marginTop: `-${size / 2}px`,
    marginLeft: `-${size / 2}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: isClickable ? 'pointer' : 'default',
    transition: 'box-shadow .3s ease',
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      position: 'relative',
      background: 'radial-gradient(circle at 50% 50%, rgba(0,212,255,.03), transparent 70%)',
    }}>
      <div style={{ position: 'relative', width: '340px', height: '340px' }}>

        {/* outer ring border */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: `${RING1_RADIUS * 2}px`, height: `${RING1_RADIUS * 2}px`,
          marginTop: `-${RING1_RADIUS}px`, marginLeft: `-${RING1_RADIUS}px`,
          borderRadius: '50%',
          border: '1px solid rgba(0,212,255,.1)',
          pointerEvents: 'none',
        }} />

        {/* inner ring border */}
        {ring2Members.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: `${RING2_RADIUS * 2}px`, height: `${RING2_RADIUS * 2}px`,
            marginTop: `-${RING2_RADIUS}px`, marginLeft: `-${RING2_RADIUS}px`,
            borderRadius: '50%',
            border: '1px solid rgba(167,139,250,.08)',
            pointerEvents: 'none',
          }} />
        )}

        {/* outer ring members */}
        <div ref={ring1Ref}>
          {ring1Members.map((m, i) => (
            <div
              key={m.name}
              style={avatarStyle(42)}
              onClick={() => onSelectMember(m)}
              title={m.name}
              className="orbital-avatar"
            >
              <img
                src={m.image}
                alt={m.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.12)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* inner ring members */}
        <div ref={ring2Ref}>
          {ring2Members.map((m, i) => (
            <div
              key={m.name}
              style={avatarStyle(36)}
              onClick={() => onSelectMember(m)}
              title={m.name}
              className="orbital-avatar"
            >
              <img
                src={m.image}
                alt={m.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.08)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* decorative glowing dots on outer ring */}
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * (RING1_RADIUS + 18);
          const y = Math.sin(rad) * (RING1_RADIUS + 18);
          return (
            <div key={`dot-${i}`} style={{
              position: 'absolute',
              width: '5px', height: '5px',
              borderRadius: '50%',
              top: '50%', left: '50%',
              marginTop: '-2.5px', marginLeft: '-2.5px',
              transform: `translate(${x}px, ${y}px)`,
              background: i % 2 === 0 ? 'rgba(0,212,255,.25)' : 'rgba(167,139,250,.25)',
              boxShadow: i % 2 === 0 ? '0 0 6px rgba(0,212,255,.4)' : '0 0 6px rgba(167,139,250,.4)',
              pointerEvents: 'none',
            }} />
          );
        })}

        {/* center avatar */}
        <motion.div
          key={activeMember.name}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [.23, 1, .32, 1] }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: '140px', height: '140px',
            marginTop: '-70px', marginLeft: '-70px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${color}`,
            boxShadow: `0 0 30px rgba(0,212,255,.15), 0 0 60px rgba(167,139,250,.08)`,
          }}
        >
          <img
            src={activeMember.image}
            alt={activeMember.name}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top center',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════
   MEMBER DETAIL PANEL
   ═══════════════════════════════════════ */
const MemberPanel = ({ member, allMembers, onClose, onSwitch }) => {
  if (!member) return null;
  const color = deptColor[member.department] || '#00d4ff';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(2,2,14,.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', cursor: 'pointer',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [.23, 1, .32, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '920px', width: '100%',
          borderRadius: '1.5rem',
          background: 'linear-gradient(160deg, rgba(8,12,28,.97), rgba(4,6,16,.98))',
          border: '1px solid rgba(255,255,255,.06)',
          boxShadow: '0 40px 80px rgba(0,0,0,.6), 0 0 60px rgba(0,212,255,.04)',
          overflow: 'hidden', cursor: 'default',
        }}
      >
        {/* top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />

        {/* close */}
        <button onClick={onClose} className="panel-close-btn" style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
          width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '8px', color: '#888', cursor: 'pointer', transition: 'all .3s ease',
        }}>
          <X size={18} />
        </button>

        {/* grid */}
        <div className="panel-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '420px',
        }}>
          {/* LEFT — orbital */}
          <OrbitalDisplay
            activeMember={member}
            allMembers={allMembers}
            onSelectMember={onSwitch}
          />

          {/* RIGHT — info */}
          <div style={{
            padding: '3rem 2.5rem 3rem 1rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 700, letterSpacing: '-0.02em',
                marginBottom: '1rem', color: '#fff',
              }}>
                {member.name}
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {[member.role, member.department].map((badge, i) => (
                  <span key={i} style={{
                    padding: '5px 14px', borderRadius: '8px',
                    fontSize: '0.82rem', fontWeight: 600,
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.1)', color: '#ccc',
                  }}>{badge}</span>
                ))}
              </div>

              {member.bio && (
                <p style={{
                  color: 'rgba(180,190,210,.8)',
                  fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.5rem',
                }}>{member.bio}</p>
              )}

              {member.skills && member.skills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: color, boxShadow: `0 0 8px ${color}`,
                    }} />
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'rgba(150,160,180,.6)',
                      textTransform: 'uppercase', letterSpacing: '0.15em',
                    }}>Core Strengths</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {member.skills.map((s, i) => (
                      <span key={i} style={{
                        padding: '5px 14px', borderRadius: '8px',
                        fontSize: '0.82rem', fontWeight: 600,
                        background: 'rgba(255,255,255,.03)',
                        border: '1px solid rgba(255,255,255,.08)', color: '#aaa',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="panel-social-btn">
                    <Github size={15} /> GitHub
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="panel-social-btn">
                    <Linkedin size={15} /> LinkedIn
                  </a>
                )}
                {member.instagram && (
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="panel-social-btn">
                    <Instagram size={15} /> Instagram
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


/* ═══════════════════════════════════════
   TEAM SECTION
   ═══════════════════════════════════════ */
const Team = () => {
  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    // Seamless wrap-around for manual scroll
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      
      // If we scroll too far left, jump to the similar position in the right half
      if (scrollLeft <= 0) {
        container.scrollLeft = scrollWidth / 3;
      } 
      // If we scroll too far right, jump to the similar position in the left half
      else if (scrollLeft >= (scrollWidth * 2) / 3 - 10) {
        container.scrollLeft = scrollWidth / 3;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial jump to the middle section for seamless two-way scrolling
    container.scrollLeft = container.scrollWidth / 3;

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedMember ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedMember]);

  const scrollToIdx = (idx) => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: idx * 300, behavior: 'smooth' });
  };

  return (
    <section id="team" className="section" style={{ background: 'transparent', padding: '6rem 0 4rem' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem', padding: '0 2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="kicker-badge">Our Team</span>
        </div>
        <h2 className="heading-lg" style={{ marginBottom: '0.8rem' }}>
          Meet the <span className="text-gradient">Catalysts</span>
        </h2>
        <p style={{
          color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto',
          fontSize: '1rem', lineHeight: 1.6,
        }}>
          A passionate group of developers, designers, and creators building the future together.
        </p>
      </div>

      {/* INFINITE MARQUEE CAROUSEL */}
      <div 
        ref={scrollRef}
        style={{ 
          position: 'relative', 
          width: '100%', 
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '1.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="marquee-container"
      >
        {/* faded edges */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '100px', zIndex: 10,
          background: 'linear-gradient(to right, var(--bg-color), transparent)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: 0, width: '100px', zIndex: 10,
          background: 'linear-gradient(to left, var(--bg-color), transparent)', pointerEvents: 'none',
        }} />

        <div className="marquee-track" style={{
          display: 'flex', gap: '1.5rem', width: 'max-content',
        }}>
          {/* Tripled data for seamlessness in both directions */}
          {[...teamData, ...teamData, ...teamData].map((member, index) => {
            const c = deptColor[member.department] || '#00d4ff';
            return (
              <div key={index}
                style={{ flex: '0 0 280px', minWidth: '280px', cursor: 'pointer' }}
                className="team-card"
                onClick={() => setSelectedMember(member)}
              >
                <div style={{
                  borderRadius: '20px', overflow: 'hidden',
                  background: 'rgba(12,12,28,.6)', border: '1px solid rgba(255,255,255,.06)',
                  transition: 'all .4s cubic-bezier(.23,1,.32,1)',
                }}>
                  <div style={{ width: '100%', height: '340px', overflow: 'hidden', position: 'relative', background: 'rgba(20,20,40,.5)' }}>
                    <img src={member.image} alt={member.name} style={{
                      width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transition: 'transform .5s ease',
                    }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <div style={{
                      display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(0,212,255,.08), rgba(12,12,28,.8))',
                      position: 'absolute', top: 0, left: 0,
                    }}>
                      <span style={{ fontSize: '3.5rem', fontWeight: 700, color: c, opacity: 0.5 }}>
                        {member.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px',
                      background: 'linear-gradient(transparent, rgba(12,12,28,.95))', pointerEvents: 'none',
                    }} />
                  </div>
                  <div style={{ padding: '0 1.3rem 1.3rem', marginTop: '-28px', position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: c, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      {member.role}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                      {member.name}
                    </h3>
                    {member.skills && member.skills.length > 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {member.skills.slice(0, 3).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAIL PANEL */}
      <AnimatePresence>
        {selectedMember && (
          <MemberPanel
            member={selectedMember}
            allMembers={teamData}
            onClose={() => setSelectedMember(null)}
            onSwitch={(m) => setSelectedMember(m)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .marquee-container::-webkit-scrollbar {
          display: none;
        }
        .marquee-track {
          animation: scrollX 60s linear infinite;
          animation-play-state: running;
        }
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes scrollX {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.333% - 0.5rem)); }
        }
        .team-card:hover > div {
          border-color: rgba(255,255,255,.12) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,.3);
          transform: translateY(-4px);
        }
        .team-card:hover img { transform: scale(1.05) !important; }
        .panel-close-btn:hover {
          border-color: rgba(255,255,255,.2) !important;
          color: #fff !important;
          background: rgba(255,255,255,.08) !important;
        }
        .panel-social-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-size: 0.85rem; font-weight: 600;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.1);
          color: #bbb; transition: all .3s ease; text-decoration: none;
        }
        .panel-social-btn:hover {
          border-color: rgba(0,212,255,.35); color: #fff;
          background: rgba(0,212,255,.06);
          box-shadow: 0 0 12px rgba(0,212,255,.1);
        }
        .orbital-avatar:hover {
          box-shadow: 0 0 16px rgba(0,212,255,.3) !important;
          z-index: 10;
        }
        .orbital-avatar:hover img {
          border-color: rgba(0,212,255,.5) !important;
        }
        @media (max-width: 768px) {
          .panel-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .team-card { flex: 0 0 240px !important; min-width: 240px !important; }
        }
      `}</style>
    </section>
  );
};

export default Team;
