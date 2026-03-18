import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const CC_LOGO_PATH = "M349.00004,682.42774 c 27.6132,-4.01546 53.6308,-13.54456 79.0271,-28.9442 18.8469,-11.42825 19.1581,-11.69871 75.9729,-66.02338 35.7334,-34.16728 46.6642,-44.05234 56.1484,-50.77691 7.7963,-5.52772 21.8761,-12.30273 33.8516,-16.28889 10.8249,-3.60319 13.4439,-6.02164 12.6926,-11.72038 -0.7419,-5.62744 -5.3888,-9.55299 -16.5268,-13.96136 -30.0508,-11.89397 -67.7452,-15.02823 -91.7117,-7.62575 -7.9491,2.45525 -8.8455,3.20213 -43.1768,35.97496 -51.9637,49.60487 -57.7405,54.37042 -78.8497,65.04647 -26.7407,13.52422 -56.6901,16.83349 -85.7139,9.47099 -39.4608,-10.01006 -70.2017,-41.91138 -80.4311,-83.46724 -2.2718,-9.22908 -2.6034,-12.63202 -2.5449,-26.11205 0.059,-13.45911 0.4163,-16.81207 2.7174,-25.46483 9.2081,-34.62534 33.4969,-62.12492 67.2475,-76.13728 22.4194,-9.30797 51.0692,-10.94006 75.1228,-4.27951 16.2852,4.50946 34.1091,14.10538 48.3561,26.03362 l 4.8073,4.0249 4.0442,-3.20308 c 5.9458,-4.70913 52.2397,-49.25745 52.7274,-50.73918 0.5576,-1.69429 -12.2554,-14.87314 -22.5978,-23.24296 -20.657,-16.71714 -52.4027,-31.41578 -79.6626,-36.88474 -49.4938,-9.92957 -101.4605,-1.11442 -143.5,24.34203 -32.5065,19.68381 -59.3344,49.21421 -75.905,83.55103 -45.678802,94.65394 -6.4168,209.81818 87.5502,256.80427 25.2892,12.64529 46.3821,18.49903 77.8548,21.60638 7.2578,0.71658 31.8156,-0.4292 42.5,-1.98291 z m 313.3928,0.0846 c 51.1335,-7.78556 95.1485,-33.72244 127.0211,-74.85006 22.9334,-29.59276 35.9383,-63.7599 38.7882,-101.90654 3.4238,-45.82739 -8.0091,-88.45242 -34.2665,-127.7557 -6.2537,-9.36077 -11.6264,-15.79072 -21.3933,-25.60321 -20.357,-20.45205 -39.5117,-33.64703 -62.6336,-43.1462 -63.7134,-26.17539 -133.2676,-17.56162 -188.5969,23.35636 -7.798,5.76692 -31.2381,27.70252 -68.2981,63.91444 -30.5245,29.82591 -40.3163,37.39535 -62.5137,48.32527 -13.8136,6.80173 -26.5019,11.1533 -32.521,11.1533 -2.5551,0 -4.9249,0.27917 -5.2661,0.62039 -0.7471,0.74713 5.4459,10.7344 9.1443,14.74666 8.4269,9.14202 23.807,17.96839 37.6428,21.60246 17.9262,4.70848 35.1662,4.68542 54,-0.0722 16.4212,-4.14824 20.9399,-7.14583 42,-27.8619 50.9446,-50.11241 62.6477,-60.39846 80,-70.31342 9.9791,-5.70199 26.3453,-11.94427 37.5,-14.30294 10.0414,-2.12328 30.2698,-2.39962 39.7875,-0.54355 22.0185,4.29394 46.0361,17.44567 60.614,33.19152 31.4854,34.00805 38.9804,85.05696 18.7096,127.43303 -19.3173,40.38266 -62.5171,64.76429 -107.1598,60.48013 -22.7723,-2.18536 -41.0434,-9.60405 -60.7097,-24.65021 l -8.2584,-6.31826 -17.2416,16.68805 c -31.9572,30.93112 -36.8637,35.79154 -38.7733,38.40891 l -1.9032,2.60861 10.0284,8.86549 c 13.6871,12.09984 24.2926,19.47271 37.9065,26.35214 14.882,7.5203 28.1705,12.44333 43.319,16.04849 10.6451,2.53343 15.55,3.34651 32.681,5.41755 6.3409,0.76657 30.3168,-0.35444 40.3928,-1.8886 z";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let rafId = null;

    const updateScrollState = () => {
      rafId = null;
      const nextValue = window.scrollY > 50;
      setIsScrolled((prev) => (prev === nextValue ? prev : nextValue));
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Team', href: '#team' },
    { name: 'Projects', href: '#projects' },
    { name: 'Journey', href: '#journey' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Join Us', href: '#join' },
  ];

  return (
    <nav className="site-nav" data-scrolled={isScrolled || undefined}>
      <div className="nav-inner">
        {/* Logo */}
        <a href="#" className="nav-logo" aria-label="Code Catalysts home">
          <svg viewBox="108 254 722 430" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            className="nav-logo-svg" aria-hidden="true">
            <path d={CC_LOGO_PATH} />
          </svg>
        </a>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`nav-link${link.name === 'Join Us' ? ' nav-link-cta' : ''}`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            {navLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className={`mobile-link${link.name === 'Join Us' ? ' mobile-link-cta' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        .site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 1rem 0;
          transition: all 0.45s cubic-bezier(.23,1,.32,1);
          border-bottom: 1px solid transparent;
          background: linear-gradient(180deg, rgba(2,2,18,0.72) 0%, rgba(2,2,18,0.38) 58%, rgba(2,2,18,0) 100%);
        }
        .site-nav[data-scrolled] {
          padding: 0.5rem 0;
          background: rgba(2,2,18,0.82);
          backdrop-filter: blur(24px) saturate(130%);
          -webkit-backdrop-filter: blur(24px) saturate(130%);
          border-bottom-color: rgba(255,255,255,.08);
          box-shadow: 0 8px 32px rgba(0,0,0,.32), inset 0 -1px 0 rgba(255,255,255,.03);
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Logo */
        .nav-logo {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
          background: rgba(0,212,255,.05);
          border: 1px solid rgba(0,212,255,.1);
          transition: all 0.3s ease;
          position: relative;
        }
        .nav-logo::after {
          content: '';
          position: absolute; inset: -2px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0,212,255,.15), rgba(167,139,250,.1));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .nav-logo:hover {
          border-color: rgba(0,212,255,.25);
          background: rgba(0,212,255,.08);
          box-shadow: 0 0 20px rgba(0,212,255,.1);
        }
        .nav-logo:hover::after { opacity: 1; }
        .nav-logo-svg {
          width: 22px; height: 18px;
          color: var(--neon-cyan);
        }

        /* Desktop links */
        .desktop-nav { display: none; }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem;
          border-radius: 14px;
          background: rgba(8, 12, 30, 0.52);
          border: 1px solid rgba(255,255,255,.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 14px 34px rgba(0,0,0,.24);
        }
        .nav-link {
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(236, 241, 252, 0.92);
          padding: 0.45rem 1rem;
          border-radius: 10px;
          transition: all 0.25s ease;
          letter-spacing: 0.02em;
          position: relative;
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
        }
        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,.08);
        }
        .nav-link-cta {
          color: #041a2b;
          background: linear-gradient(100deg, #2ae8ff 0%, #4acfff 40%, #7d6cff 100%);
          border: 1px solid rgba(120, 225, 255, 0.45);
          box-shadow: 0 12px 30px rgba(0, 212, 255, 0.22), 0 8px 22px rgba(125, 108, 255, 0.18);
          text-shadow: none;
        }
        .nav-link-cta:hover {
          color: #03131e;
          background: linear-gradient(100deg, #49eeff 0%, #62d7ff 40%, #9279ff 100%);
          box-shadow: 0 16px 34px rgba(0, 212, 255, 0.28), 0 10px 28px rgba(125, 108, 255, 0.22);
          transform: translateY(-1px);
        }

        /* Mobile */
        .mobile-toggle {
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 10px;
          color: rgba(200,210,225,.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .mobile-toggle:hover {
          border-color: rgba(0,212,255,.2);
          color: var(--neon-cyan);
        }

        .mobile-menu {
          position: absolute; top: 100%; left: 0; right: 0;
          background: rgba(4,4,16,0.97);
          backdrop-filter: blur(24px);
          padding: 0.8rem 1.5rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,.04);
          box-shadow: 0 20px 50px rgba(0,0,0,.5);
        }
        .mobile-menu ul {
          display: flex; flex-direction: column; gap: 0.2rem;
        }
        .mobile-link {
          display: block;
          font-size: 0.95rem; font-weight: 600;
          color: rgba(236, 241, 252, 0.9);
          padding: 0.7rem 1rem;
          border-radius: 10px;
          transition: all 0.25s ease;
        }
        .mobile-link:hover {
          color: var(--neon-cyan);
          background: rgba(0,212,255,.07);
        }
        .mobile-link-cta {
          margin-top: 0.35rem;
          color: #041a2b;
          background: linear-gradient(100deg, #2ae8ff 0%, #55d8ff 42%, #8a73ff 100%);
          border: 1px solid rgba(120, 225, 255, 0.4);
          box-shadow: 0 14px 30px rgba(0, 212, 255, 0.18), 0 8px 20px rgba(125, 108, 255, 0.16);
        }
        .mobile-link-cta:hover {
          color: #03131e;
          background: linear-gradient(100deg, #4bf0ff 0%, #68ddff 42%, #9a83ff 100%);
        }

        @media (min-width: 768px) {
          .desktop-nav { display: block !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
