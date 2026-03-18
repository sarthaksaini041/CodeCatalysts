import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Mail, Zap, ArrowUpRight, ChevronDown } from 'lucide-react';

const faqItems = [
  {
    question: 'Who can apply to Code Catalysts?',
    answer:
      'Anyone who is curious, consistent, and excited to build. We care more about your energy, willingness to learn, and ability to collaborate than having a perfect resume.',
  },
  {
    question: 'Do I need to be highly experienced already?',
    answer:
      'No. Strong fundamentals help, but we also welcome learners who show initiative through projects, experiments, design work, writing, or thoughtful problem-solving.',
  },
  {
    question: 'How much time should I expect to commit?',
    answer:
      'The expectation is reasonable and student-friendly. We look for steady contribution and communication rather than unrealistic weekly hours.',
  },
  {
    question: 'What happens after I submit the application?',
    answer:
      'We review your application, reach out if there is a fit, and usually follow up within 1 to 3 days. Some applicants may be asked for a short conversation or project discussion.',
  },
  {
    question: 'What kinds of roles can I grow into here?',
    answer:
      'Depending on your strengths, you can contribute across development, design, product thinking, AI/ML, content, research, and team initiatives. Growth here is hands-on and collaborative.',
  },
];

const Join = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      position: 'relative', overflow: 'hidden',
      paddingTop: '6rem', paddingBottom: '2rem',
      background: 'transparent',
    }}>
      {/* top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,.1), rgba(167,139,250,.08), transparent)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexDirection: 'column' }}>

        {/* ── CTA Card ── */}
        <div id="join" className="join-cta-card">
          <div className="join-cta-topline" />
          <div className="join-cta-noise" />
          <div className="join-cta-vignette" />
          <div className="join-cta-glow join-cta-glow-top" />
          <div className="join-cta-glow join-cta-glow-bottom" />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="join-cta-badge">
              <Zap size={24} />
            </div>

            <h2 id="join-cta-title" className="join-cta-title">
              Become a <span className="join-cta-highlight">Catalyst</span>
            </h2>
            <p className="join-cta-copy">
              A team that learns together and builds things that matter. If that sounds
              like you, jump in.
            </p>

            <Link to="/apply" className="join-cta-button">
              <span className="join-cta-button-label">Join the Build Squad</span>
              <span className="join-cta-button-arrow">
                <ArrowUpRight size={16} />
              </span>
            </Link>

            <p className="join-cta-meta">
              Takes about 3 minutes. We get back within 1-3 days.<br />
              Or drop us a line at{' '}
              <a href="mailto:team@codecatalysts.dev" className="join-cta-mail">
                team@codecatalysts.dev
              </a>
            </p>
          </div>
        </div>

        <section id="faq" className="join-faq-section" aria-labelledby="join-faq-title">
          <div className="join-faq-shell">
            <div className="join-faq-head">
              <span className="join-faq-kicker">FAQ</span>
              <h3 id="join-faq-title" className="join-faq-title">
                Questions Before You <span className="join-cta-highlight">Apply</span>
              </h3>
              <p className="join-faq-copy">
                A few quick answers about joining the team, the application flow, and what
                we look for.
              </p>
            </div>

            <div className="join-faq-list">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.question} className={`join-faq-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="join-faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      aria-controls={`join-faq-panel-${index}`}
                    >
                      <span>{item.question}</span>
                      <span className="join-faq-icon" aria-hidden="true">
                        <ChevronDown size={18} />
                      </span>
                    </button>
                    <div
                      id={`join-faq-panel-${index}`}
                      className="join-faq-answer-wrap"
                      hidden={!isOpen}
                    >
                      <p className="join-faq-answer">{item.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div style={{ 
        background: '#04050a', 
        borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
        paddingTop: '4rem',
        marginTop: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          {/* ── Footer Grid ── */}
          <div className="footer-grid">
            {/* col 1: brand */}
            <div className="footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                <div style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '8px',
                  background: 'rgba(0,212,255,.05)',
                  border: '1px solid rgba(0,212,255,.1)',
                }}>
                  <svg viewBox="108 254 722 430" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '18px', height: '14px', color: 'var(--neon-cyan)' }} aria-hidden="true">
                    <path d="M349.00004,682.42774 c 27.6132,-4.01546 53.6308,-13.54456 79.0271,-28.9442 18.8469,-11.42825 19.1581,-11.69871 75.9729,-66.02338 35.7334,-34.16728 46.6642,-44.05234 56.1484,-50.77691 7.7963,-5.52772 21.8761,-12.30273 33.8516,-16.28889 10.8249,-3.60319 13.4439,-6.02164 12.6926,-11.72038 -0.7419,-5.62744 -5.3888,-9.55299 -16.5268,-13.96136 -30.0508,-11.89397 -67.7452,-15.02823 -91.7117,-7.62575 -7.9491,2.45525 -8.8455,3.20213 -43.1768,35.97496 -51.9637,49.60487 -57.7405,54.37042 -78.8497,65.04647 -26.7407,13.52422 -56.6901,16.83349 -85.7139,9.47099 -39.4608,-10.01006 -70.2017,-41.91138 -80.4311,-83.46724 -2.2718,-9.22908 -2.6034,-12.63202 -2.5449,-26.11205 0.059,-13.45911 0.4163,-16.81207 2.7174,-25.46483 9.2081,-34.62534 33.4969,-62.12492 67.2475,-76.13728 22.4194,-9.30797 51.0692,-10.94006 75.1228,-4.27951 16.2852,4.50946 34.1091,14.10538 48.3561,26.03362 l 4.8073,4.0249 4.0442,-3.20308 c 5.9458,-4.70913 52.2397,-49.25745 52.7274,-50.73918 0.5576,-1.69429 -12.2554,-14.87314 -22.5978,-23.24296 -20.657,-16.71714 -52.4027,-31.41578 -79.6626,-36.88474 -49.4938,-9.92957 -101.4605,-1.11442 -143.5,24.34203 -32.5065,19.68381 -59.3344,49.21421 -75.905,83.55103 -45.678802,94.65394 -6.4168,209.81818 87.5502,256.80427 25.2892,12.64529 46.3821,18.49903 77.8548,21.60638 7.2578,0.71658 31.8156,-0.4292 42.5,-1.98291 z m 313.3928,0.0846 c 51.1335,-7.78556 95.1485,-33.72244 127.0211,-74.85006 22.9334,-29.59276 35.9383,-63.7599 38.7882,-101.90654 3.4238,-45.82739 -8.0091,-88.45242 -34.2665,-127.7557 -6.2537,-9.36077 -11.6264,-15.79072 -21.3933,-25.60321 -20.357,-20.45205 -39.5117,-33.64703 -62.6336,-43.1462 -63.7134,-26.17539 -133.2676,-17.56162 -188.5969,23.35636 -7.798,5.76692 -31.2381,27.70252 -68.2981,63.91444 -30.5245,29.82591 -40.3163,37.39535 -62.5137,48.32527 -13.8136,6.80173 -26.5019,11.1533 -32.521,11.1533 -2.5551,0 -4.9249,0.27917 -5.2661,0.62039 -0.7471,0.74713 5.4459,10.7344 9.1443,14.74666 8.4269,9.14202 23.807,17.96839 37.6428,21.60246 17.9262,4.70848 35.1662,4.68542 54,-0.0722 16.4212,-4.14824 20.9399,-7.14583 42,-27.8619 50.9446,-50.11241 62.6477,-60.39846 80,-70.31342 9.9791,-5.70199 26.3453,-11.94427 37.5,-14.30294 10.0414,-2.12328 30.2698,-2.39962 39.7875,-0.54355 22.0185,4.29394 46.0361,17.44567 60.614,33.19152 31.4854,34.00805 38.9804,85.05696 18.7096,127.43303 -19.3173,40.38266 -62.5171,64.76429 -107.1598,60.48013 -22.7723,-2.18536 -41.0434,-9.60405 -60.7097,-24.65021 l -8.2584,-6.31826 -17.2416,16.68805 c -31.9572,30.93112 -36.8637,35.79154 -38.7733,38.40891 l -1.9032,2.60861 10.0284,8.86549 c 13.6871,12.09984 24.2926,19.47271 37.9065,26.35214 14.882,7.5203 28.1705,12.44333 43.319,16.04849 10.6451,2.53343 15.55,3.34651 32.681,5.41755 6.3409,0.76657 30.3168,-0.35444 40.3928,-1.8886 z" />
                  </svg>
                </div>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1rem', fontWeight: 700,
                }}>
                  <span className="text-gradient">Code</span>
                  <span style={{ color: '#fff' }}>Catalysts</span>
                </span>
              </div>
              <p style={{ color: 'rgba(230,240,250,.9)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '260px', fontWeight: 500 }}>
                Building, learning, and shipping together since 2025.
              </p>
            </div>

            {/* col 2: quick links */}
            <div className="footer-col">
              <h4 className="footer-heading" style={{ color: '#aab4c2' }}>Navigate</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {['About', 'Team', 'Projects', 'Journey'].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="footer-link" style={{ color: 'rgba(230,240,250,.8)' }}>{l}</a>
                ))}
              </div>
            </div>

            {/* col 3: connect */}
            <div className="footer-col">
              <h4 className="footer-heading" style={{ color: '#aab4c2' }}>Connect</h4>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {[
                  { icon: Instagram, href: 'https://www.instagram.com/codecatalysts', label: 'Instagram' },
                  { icon: Linkedin, href: 'https://www.linkedin.com/company/code-catalysts000/', label: 'LinkedIn' },
                  { icon: Mail, href: 'mailto:team@codecatalysts.dev', label: 'Email' },
                ].map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target={label !== 'Email' ? '_blank' : undefined}
                    rel="noopener noreferrer" aria-label={label}
                    className="footer-social" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div style={{
            marginTop: '2.5rem', paddingTop: '1.5rem', paddingBottom: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'flex', justifyContent: 'center',
          }}>
            <p style={{ color: 'rgba(200,210,230,.8)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
              &copy; {currentYear} Code Catalysts. Built by the team.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .join-cta-card {
          position: relative;
          isolation: isolate;
          order: 2;
          scroll-margin-top: 6.5rem;
          margin-bottom: 4rem;
          padding: clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem);
          text-align: center;
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid rgba(98, 176, 255, 0.14);
          background:
            linear-gradient(180deg, rgba(12, 14, 30, 0.95) 0%, rgba(8, 10, 24, 0.97) 48%, rgba(4, 5, 14, 0.99) 100%);
          box-shadow:
            0 28px 70px rgba(0, 0, 0, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .join-cta-topline {
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.52), rgba(167, 139, 250, 0.42), transparent);
          opacity: 0.9;
          z-index: 1;
        }
        .join-cta-noise,
        .join-cta-vignette,
        .join-cta-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .join-cta-noise {
          z-index: 0;
          opacity: 0.14;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E");
          background-size: 240px 240px;
          mix-blend-mode: soft-light;
        }
        .join-cta-vignette {
          z-index: 0;
          background:
            radial-gradient(circle at 50% 26%, rgba(85, 197, 255, 0.12), transparent 24%),
            radial-gradient(ellipse at 50% 112%, rgba(37, 224, 255, 0.28) 0%, rgba(93, 134, 255, 0.24) 20%, rgba(138, 111, 255, 0.18) 38%, rgba(93, 134, 255, 0.05) 56%, transparent 72%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 18%, rgba(0, 0, 0, 0.18) 100%);
        }
        .join-cta-glow-top {
          z-index: 0;
          inset: -20% 18% auto;
          height: 48%;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.14), transparent 66%);
          filter: blur(54px);
          opacity: 0.7;
        }
        .join-cta-glow-bottom {
          z-index: 0;
          inset: auto 8% -22%;
          height: 52%;
          background: radial-gradient(ellipse at center, rgba(0, 212, 255, 0.28), rgba(94, 114, 255, 0.22) 36%, rgba(167, 139, 250, 0.14) 54%, transparent 74%);
          filter: blur(50px);
          opacity: 0.95;
        }
        .join-cta-badge {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          border-radius: 18px;
          color: #b7f0ff;
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.1), rgba(167, 139, 250, 0.05));
          border: 1px solid rgba(108, 196, 255, 0.18);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 12px 24px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(10px);
        }
        .join-cta-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.9rem, 4vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #f5f7ff;
          margin-bottom: 0.8rem;
          text-shadow: 0 4px 24px rgba(71, 184, 255, 0.12);
        }
        .join-cta-highlight {
          background: linear-gradient(120deg, #eafcff 0%, #7ce4ff 38%, #6f92ff 68%, #b48dff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .join-cta-copy {
          max-width: 560px;
          margin: 0 auto 2rem;
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(214, 224, 245, 0.76);
        }
        @keyframes join-cta-arrow-float {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          22% {
            transform: translateX(0) scale(1);
          }
          48% {
            transform: translateX(3px) scale(1.04);
          }
          64% {
            transform: translateX(1px) scale(1);
          }
          82% {
            transform: translateX(4px) scale(1.05);
          }
        }
        .join-cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.7rem;
          min-height: 4.5rem;
          padding: 0 2rem;
          border-radius: 999px;
          border: 1px solid rgba(145, 176, 255, 0.5);
          background: linear-gradient(100deg, #32dcff 0%, #49c7ff 32%, #6898ff 66%, #8d67ff 100%);
          color: #132844;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.24),
            0 0 32px rgba(56, 199, 255, 0.22),
            0 10px 26px rgba(110, 80, 255, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.34);
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }
        .join-cta-button-label {
          display: inline-flex;
          align-items: center;
          line-height: 1;
        }
        .join-cta-button-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: currentColor;
          animation: join-cta-arrow-float 2.8s ease-in-out infinite;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .join-cta-button-arrow svg {
          transition: transform 0.25s ease;
          stroke-width: 2.2;
        }
        .join-cta-meta {
          margin-top: 1.5rem;
          font-size: 0.84rem;
          line-height: 1.7;
          color: rgba(175, 191, 217, 0.58);
        }
        .join-cta-mail {
          color: #7fe2ff;
          font-weight: 600;
        }
        .join-cta-mail:hover {
          color: #dff8ff;
        }
        .join-faq-section {
          order: 1;
          scroll-margin-top: 6.5rem;
          margin-bottom: 2.5rem;
        }
        .join-faq-shell {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: clamp(1.4rem, 3vw, 2rem);
          border: 1px solid rgba(103, 170, 255, 0.12);
          background:
            linear-gradient(180deg, rgba(10, 12, 28, 0.88) 0%, rgba(7, 9, 22, 0.95) 100%);
          box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }
        .join-faq-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.11;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grainFaq'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grainFaq)' opacity='1'/%3E%3C/svg%3E");
          background-size: 240px 240px;
          mix-blend-mode: soft-light;
        }
        .join-faq-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 18% 16%, rgba(0, 212, 255, 0.08), transparent 28%),
            radial-gradient(circle at 82% 100%, rgba(167, 139, 250, 0.12), transparent 34%);
        }
        .join-faq-head,
        .join-faq-list {
          position: relative;
          z-index: 1;
        }
        .join-faq-head {
          max-width: 640px;
          margin-bottom: 1.5rem;
        }
        .join-faq-kicker {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.7rem;
          margin-bottom: 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(0, 212, 255, 0.16);
          background: rgba(0, 212, 255, 0.06);
          color: #97ebff;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .join-faq-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #f5f7ff;
          margin-bottom: 0.6rem;
        }
        .join-faq-copy {
          max-width: 580px;
          color: rgba(195, 207, 230, 0.72);
          font-size: 0.98rem;
          line-height: 1.7;
        }
        .join-faq-list {
          display: grid;
          gap: 0.9rem;
        }
        .join-faq-item {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.015) 100%);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .join-faq-item.is-open {
          border-color: rgba(94, 186, 255, 0.24);
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.05) 0%, rgba(167, 139, 250, 0.035) 100%);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
        }
        .join-faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.2rem;
          border: 0;
          background: transparent;
          color: #eef5ff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }
        .join-faq-icon {
          flex: 0 0 auto;
          width: 2rem;
          height: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #9ce8ff;
          background: rgba(0, 212, 255, 0.08);
          border: 1px solid rgba(0, 212, 255, 0.12);
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }
        .join-faq-item.is-open .join-faq-icon {
          transform: rotate(180deg);
          background: rgba(99, 126, 255, 0.12);
          border-color: rgba(99, 126, 255, 0.18);
        }
        .join-faq-answer-wrap {
          padding: 0 1.2rem 1.2rem;
        }
        .join-faq-answer {
          max-width: 64ch;
          color: rgba(194, 208, 233, 0.78);
          font-size: 0.94rem;
          line-height: 1.7;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 3rem;
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
          .footer-col { align-items: center; }
          .footer-col p { margin: 0 auto; }
        }
        .footer-col {
          display: flex;
          flex-direction: column;
        }
        .footer-heading {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(160,170,190,.9);
          margin-bottom: 0.8rem;
        }
        .footer-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(160,170,190,.9);
          transition: all 0.25s ease;
          padding: 0.15rem 0;
        }
        .footer-link:hover {
          color: #fff;
        }
        .footer-social {
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(200,210,230,.9);
          transition: all 0.3s ease;
        }
        .footer-social:hover {
          color: var(--neon-cyan);
          border-color: rgba(0,212,255,.2);
          background: rgba(0,212,255,.04);
          box-shadow: 0 0 12px rgba(0,212,255,.08);
        }
        .hover-cyan:hover { color: var(--neon-cyan) !important; }

        @media (hover: hover) and (pointer: fine) {
          .join-cta-card:hover {
            box-shadow:
              0 34px 80px rgba(0, 0, 0, 0.42),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }
          .join-faq-item:hover {
            border-color: rgba(102, 170, 255, 0.16);
          }
          .join-cta-button:hover {
            transform: translateY(-3px);
            filter: brightness(1.02);
            box-shadow:
              0 18px 40px rgba(0, 0, 0, 0.28),
              0 0 38px rgba(56, 199, 255, 0.28),
              0 16px 32px rgba(110, 80, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.38);
          }
          .join-cta-button:hover .join-cta-button-arrow {
            animation: none;
            transform: translateX(2px) scale(1.04);
          }
          .join-cta-button:hover .join-cta-button-arrow svg {
            transform: translate(1px, -1px) rotate(6deg);
          }
        }
        @media (max-width: 640px) {
          .join-cta-card {
            border-radius: 24px;
            margin-bottom: 3rem;
          }
          .join-faq-shell {
            border-radius: 22px;
            padding: 1.2rem;
          }
          .join-faq-trigger {
            padding: 1rem;
            font-size: 0.95rem;
          }
          .join-faq-answer-wrap {
            padding: 0 1rem 1rem;
          }
          .join-cta-button {
            width: 100%;
            max-width: 340px;
            justify-content: center;
            font-size: 0.95rem;
            min-height: 4rem;
            padding: 0 1.5rem;
          }
          .join-cta-copy {
            font-size: 0.96rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Join;
