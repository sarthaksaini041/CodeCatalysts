import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CircleHelp,
  Compass,
  FolderOpen,
  Info,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { scrollToAnchor } from '../lib/smoothScroll';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../lib/brandAssets';

const navLinks = [
  { name: 'About', href: '#about', icon: Info },
  { name: 'Team', href: '#team', icon: Users },
  { name: 'Projects', href: '#projects', icon: FolderOpen },
  { name: 'Journey', href: '#journey', icon: Compass },
  { name: 'FAQ', href: '#faq', icon: CircleHelp },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuPanelRef = useRef(null);

  const scrollToTarget = useCallback((href) => {
    scrollToAnchor(href);
  }, []);

  useEffect(() => {
    if (!window.location.hash) return undefined;

    const timer = window.setTimeout(() => {
      scrollToTarget(window.location.hash);
    }, 60);

    return () => window.clearTimeout(timer);
  }, [scrollToTarget]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      const target = event.target;
      if (menuButtonRef.current?.contains(target) || menuPanelRef.current?.contains(target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMenuOpen]);

  const handleNavClick = (href) => (event) => {
    event.preventDefault();
    setIsMenuOpen(false);
    scrollToTarget(href);
  };

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <a href="#" className="nav-logo" aria-label="Code Catalysts home" onClick={handleNavClick('#')}>
          <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="nav-logo-image" />
        </a>

        <button
          ref={menuButtonRef}
          className="header-menu-toggle"
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="site-header-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="header-menu-label">Menu</span>
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        ref={menuPanelRef}
        id="site-header-menu"
        className="header-menu-panel"
        data-open={isMenuOpen || undefined}
        aria-hidden={!isMenuOpen}
      >
        <div className="header-menu-panel-shell">
          <ul>
            {navLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="header-menu-link" onClick={handleNavClick(link.href)}>
                  <span className="header-menu-link-symbol" aria-hidden="true">
                    <link.icon size={16} strokeWidth={2.1} />
                  </span>
                  <span className="header-menu-link-label">{link.name}</span>
                  <span className="header-menu-link-mark" aria-hidden="true">/</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .site-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 0;
          background: transparent;
          border: 0;
          box-shadow: none;
          pointer-events: none;
        }

        .nav-inner {
          width: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          pointer-events: auto;
        }

        .nav-logo {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -28%), rgba(236, 253, 255, calc(0.07 + (var(--surface-light-strength, 0.3) * 0.14))) 0%, rgba(120, 238, 255, calc(0.04 + (var(--surface-glow-opacity, 0.12) * 0.28))) 24%, transparent 62%),
            linear-gradient(180deg, rgba(14, 22, 38, 0.56) 0%, rgba(8, 14, 28, 0.42) 100%);
          border: 1px solid rgba(170, 242, 255, 0.12);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 18px) var(--surface-shadow-blur, 30px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.22) + 0.06)),
            inset 0 1px 0 rgba(236, 253, 255, calc(0.04 + (var(--surface-edge-opacity, 0.08) * 0.56)));
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
        }

        .nav-logo:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 242, 255, 0.2);
          box-shadow:
            0 18px 32px rgba(0, 0, 0, 0.26),
            0 0 18px rgba(72, 222, 244, 0.12),
            inset 0 1px 0 rgba(236, 253, 255, 0.16);
        }

        .nav-logo-image {
          width: 26px;
          height: 26px;
          object-fit: cover;
          border-radius: 8px;
          display: block;
        }

        .header-menu-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          min-width: 118px;
          height: 48px;
          padding: 0 1rem 0 1.15rem;
          border: 1px solid rgba(200, 248, 255, 0.12);
          border-radius: 999px;
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -30%), rgba(236, 253, 255, calc(0.05 + (var(--surface-light-strength, 0.3) * 0.14))) 0%, rgba(120, 238, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.22))) 22%, transparent 62%),
            linear-gradient(180deg, rgba(14, 22, 38, 0.58) 0%, rgba(8, 14, 28, 0.42) 100%);
          color: rgba(227, 235, 245, 0.86);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 20px) var(--surface-shadow-blur, 34px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.22) + 0.08)),
            inset 0 1px 0 rgba(236, 253, 255, calc(0.04 + (var(--surface-edge-opacity, 0.08) * 0.6)));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          cursor: pointer;
          transition:
            transform 0.28s ease,
            border-color 0.28s ease,
            box-shadow 0.28s ease,
            color 0.28s ease,
            background 0.28s ease;
          pointer-events: auto;
        }

        .header-menu-toggle:hover,
        .header-menu-toggle[aria-expanded='true'] {
          transform: translateY(-1px);
          border-color: rgba(200, 248, 255, 0.2);
          color: #f4fbff;
          box-shadow:
            0 20px 36px rgba(0, 0, 0, 0.28),
            0 0 24px rgba(84, 234, 255, 0.14),
            inset 0 1px 0 rgba(236, 253, 255, 0.18);
        }

        .header-menu-label {
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .header-menu-panel {
          position: absolute;
          top: calc(100% + 0.34rem);
          right: 1.5rem;
          width: min(316px, calc(100vw - 2rem));
          padding: 0.8rem;
          border-radius: 28px;
          background:
            radial-gradient(circle at top center, rgba(196, 252, 255, 0.1) 0%, rgba(82, 228, 244, 0.05) 18%, transparent 56%),
            linear-gradient(180deg, rgba(10, 16, 28, 0.86) 0%, rgba(6, 12, 22, 0.94) 100%);
          border: 1px solid rgba(200, 248, 255, 0.12);
          box-shadow:
            0 28px 64px rgba(0, 0, 0, 0.42),
            0 8px 24px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(236, 253, 255, 0.12),
            inset 0 -24px 44px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(18px) saturate(130%);
          -webkit-backdrop-filter: blur(18px) saturate(130%);
          opacity: 0;
          transform: translateY(-14px) scale(0.98);
          transform-origin: top right;
          pointer-events: none;
          transition:
            opacity 0.3s ease,
            transform 0.28s ease,
            box-shadow 0.28s ease;
        }

        .header-menu-panel[data-open] {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .header-menu-panel::before,
        .header-menu-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
        }

        .header-menu-panel::before {
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at top right, rgba(214, 253, 255, 0.08) 0%, rgba(112, 236, 255, 0.03) 26%, transparent 54%);
          opacity: 0.9;
        }

        .header-menu-panel::after {
          inset: 0;
          background:
            linear-gradient(180deg, rgba(236, 253, 255, 0.08) 0%, transparent 24%);
          opacity: 0.65;
        }

        .header-menu-panel-shell {
          position: relative;
          z-index: 1;
        }

        .header-menu-panel ul {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .header-menu-panel li {
          width: 100%;
        }

        .header-menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          width: 100%;
          min-height: 56px;
          padding: 0.82rem 0.95rem;
          border-radius: 18px;
          color: rgba(236, 242, 249, 0.82);
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: 0.015em;
          text-align: left;
          border: 1px solid rgba(196, 248, 255, 0.05);
          background:
            linear-gradient(180deg, rgba(18, 30, 48, 0.42) 0%, rgba(10, 18, 32, 0.58) 100%);
          box-shadow:
            inset 0 1px 0 rgba(236, 253, 255, 0.06),
            0 12px 22px rgba(0, 0, 0, 0.12);
          transition:
            background 0.22s ease,
            color 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }

        .header-menu-link-symbol {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background:
            radial-gradient(circle at 30% 26%, rgba(226, 254, 255, 0.18) 0%, rgba(126, 244, 255, 0.06) 30%, transparent 70%),
            linear-gradient(180deg, rgba(16, 28, 46, 0.92) 0%, rgba(8, 16, 28, 0.98) 100%);
          border: 1px solid rgba(196, 248, 255, 0.08);
          color: rgba(210, 224, 236, 0.72);
          flex: 0 0 auto;
        }

        .header-menu-link-label {
          flex: 1 1 auto;
        }

        .header-menu-link-mark {
          color: rgba(112, 238, 255, 0.68);
          font-size: 0.88rem;
        }

        .header-menu-link:hover {
          color: #f7fcff;
          border-color: rgba(196, 248, 255, 0.1);
          background:
            radial-gradient(circle at top left, rgba(214, 252, 255, 0.12) 0%, rgba(120, 238, 255, 0.04) 28%, transparent 58%),
            linear-gradient(180deg, rgba(18, 30, 48, 0.72) 0%, rgba(10, 18, 32, 0.84) 100%);
          box-shadow:
            0 16px 28px rgba(0, 0, 0, 0.18),
            0 0 20px rgba(84, 234, 255, 0.05),
            inset 0 1px 0 rgba(236, 253, 255, 0.08);
          transform: translateX(2px);
        }

        @media (max-width: 767px) {
          .site-nav {
            padding: 0.9rem 0;
          }

          .nav-inner {
            padding: 0 1rem;
          }

          .header-menu-panel {
            right: 1rem;
            width: min(286px, calc(100vw - 1.5rem));
          }

          .header-menu-toggle {
            min-width: 108px;
            padding: 0 0.9rem 0 1rem;
          }

          .header-menu-link {
            min-height: 52px;
            font-size: 0.9rem;
            padding: 0.76rem 0.88rem;
          }

          .header-menu-link-symbol {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 540px) {
          .header-menu-label {
            letter-spacing: 0.14em;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
