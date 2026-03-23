import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { scrollToAnchor } from '../lib/smoothScroll';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../lib/brandAssets';

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Team', href: '#team' },
  { name: 'Projects', href: '#projects' },
  { name: 'Journey', href: '#journey' },
  { name: 'FAQ', href: '#faq' },
];

const Navbar = () => {
  const [activeHash, setActiveHash] = useState(() => window.location.hash || '#about');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navOffset = useMemo(() => (isScrolled ? '0rem' : '0rem'), [isScrolled]);

  const scrollToTarget = useCallback((href) => {
    scrollToAnchor(href);
    setActiveHash(href);
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      scrollToTarget(window.location.hash);
    }, 60);

    return () => window.clearTimeout(timer);
  }, [scrollToTarget]);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        setActiveHash(window.location.hash);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavClick = (href) => (event) => {
    event.preventDefault();
    scrollToTarget(href);
  };

  return (
    <nav className={`site-nav-min ${isScrolled ? 'is-scrolled' : ''}`} style={{ '--nav-offset': navOffset }}>
      <div className="nav-shell">
        <a href="#" className="nav-brand" aria-label="Code Catalysts home" onClick={handleNavClick('#')}>
          <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="nav-brand-image" />
        </a>

        <ul className="nav-links" role="list">
          {navLinks.map((link) => {
            const isActive = activeHash === link.href;
            return (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="nav-link"
                  data-active={isActive || undefined}
                  onClick={handleNavClick(link.href)}
                >
                  {link.name}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="nav-actions">
          <a href="#join" className="nav-cta" onClick={(e) => { handleNavClick('#join')(e); setIsMenuOpen(false); }}>
            Join
          </a>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ul className="nav-links-mobile-vertical" role="list">
              {navLinks.map((link) => {
                const isActive = activeHash === link.href;
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="nav-link-mobile"
                      data-active={isActive || undefined}
                      onClick={(e) => { handleNavClick(link.href)(e); setIsMenuOpen(false); }}
                    >
                      {link.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .site-nav-min {
          position: fixed;
          top: var(--nav-offset, 0);
          left: 0;
          right: 0;
          z-index: 120;
          display: grid;
          gap: 0;
          transition: top 0.24s ease;
          pointer-events: none;
        }

        .site-nav-min::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -22px;
          height: 22px;
          background: linear-gradient(180deg, rgba(7, 14, 30, 0.34) 0%, rgba(7, 14, 30, 0.16) 48%, rgba(7, 14, 30, 0) 100%);
          pointer-events: none;
        }

        .nav-shell,
        .mobile-menu-overlay {
          width: 100%;
          margin: 0;
          pointer-events: auto;
        }

        .nav-shell {
          min-height: 58px;
          padding: 0.55rem clamp(0.8rem, 2.2vw, 1.6rem);
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.9rem;
          border: 0;
          border-bottom: 1px solid rgba(138, 186, 250, 0.16);
          background: linear-gradient(180deg, rgba(8, 16, 34, 0.54) 0%, rgba(8, 16, 34, 0.34) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
        }

        .site-nav-min.is-scrolled .nav-shell {
          border-color: rgba(148, 198, 255, 0.2);
          background: linear-gradient(180deg, rgba(8, 16, 34, 0.62) 0%, rgba(8, 16, 34, 0.42) 100%);
        }

        .nav-brand {
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 0.15rem 0.2rem;
          border-radius: 0;
          color: #eef5ff;
          flex: 0 0 auto;
        }

        .nav-brand-image {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          object-fit: cover;
          display: block;
          border: 0;
          filter: drop-shadow(0 0 8px rgba(126, 190, 255, 0.14));
        }

        .nav-links {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0;
          border-radius: 0;
          background: transparent;
          border: 0;
          list-style: none;
        }

        .nav-link,
        .nav-link-mobile {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0.4rem 0.86rem 0.34rem;
          border-radius: 0;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(214, 225, 244, 0.78);
          transition: color 0.22s ease, text-shadow 0.22s ease;
          white-space: nowrap;
        }

        .nav-link:hover,
        .nav-link-mobile:hover {
          color: #f2f8ff;
          text-shadow: 0 0 10px rgba(124, 188, 255, 0.24);
        }

        .nav-link[data-active],
        .nav-link-mobile[data-active] {
          color: #eaf6ff;
          text-shadow: 0 0 12px rgba(124, 188, 255, 0.3);
        }

        .nav-link[data-active]::after,
        .nav-link-mobile[data-active]::after {
          content: '';
          position: absolute;
          left: 0.86rem;
          right: 0.86rem;
          bottom: 0.2rem;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(146, 206, 255, 0.65) 50%, transparent 100%);
        }

        .nav-cta {
          min-height: 38px;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(126, 190, 255, 0.28);
          background: rgba(112, 204, 255, 0.1);
          color: #ecf6ff;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          flex: 0 0 auto;
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }

        .nav-cta:hover {
          transform: translateY(-1px);
          border-color: rgba(144, 206, 255, 0.42);
          background: rgba(112, 204, 255, 0.16);
        }

        .nav-actions {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          flex: 0 0 auto;
        }

        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #eef5ff;
          cursor: pointer;
          padding: 0.2rem;
          transition: color 0.2s ease;
        }

        .mobile-menu-btn:hover {
          color: #7db8ff;
        }

        .mobile-menu-overlay {
          background: rgba(8, 16, 34, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(138, 186, 250, 0.16);
          overflow: hidden;
          width: 100%;
        }

        .nav-links-mobile-vertical {
          display: flex;
          flex-direction: column;
          padding: 1.25rem clamp(0.8rem, 2.2vw, 1.6rem) 1.5rem;
          list-style: none;
          margin: 0;
          gap: 0.75rem;
        }

        .nav-links-mobile-vertical .nav-link-mobile {
          justify-content: flex-start;
          font-size: 1.1rem;
          padding: 0.6rem 1rem;
        }

        .nav-links-mobile-vertical .nav-link-mobile[data-active]::after {
          left: 1rem;
          right: auto;
          width: 40px;
        }

        /* Mobile nav row is completely replaced by dropdown */

        @media (max-width: 920px) {
          .nav-shell {
            min-height: 54px;
            padding: 0.45rem 0.7rem;
          }

          .nav-links {
            display: none;
          }

          .mobile-menu-btn {
            display: inline-flex;
          }
        }

        @media (max-width: 540px) {
          .site-nav-min {
            top: 0;
          }

          .nav-shell,
          .mobile-menu-overlay {
            width: 100%;
          }

          .nav-shell {
            min-height: 52px;
            border-radius: 0;
          }

          /* Removed nav-links-mobile border radius */

          .nav-cta {
            min-height: 34px;
            padding: 0.45rem 0.78rem;
            font-size: 0.74rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
