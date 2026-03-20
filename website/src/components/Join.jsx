import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Mail, Twitter, Zap, ArrowUpRight, ChevronDown } from 'lucide-react';
import { usePublicContent } from '../context/PublicContentContext';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../lib/brandAssets';

function renderAccentTitle(title) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return null;
  }

  if (words.length === 1) {
    return <span className="join-cta-highlight">{words[0]}</span>;
  }

  return (
    <>
      {words.slice(0, -1).join(' ')}{' '}
      <span className="join-cta-highlight">{words[words.length - 1]}</span>
    </>
  );
}

const Join = () => {
  const [openFaq, setOpenFaq] = useState({});
  const currentYear = new Date().getFullYear();
  const { siteSettings, sectionList } = usePublicContent();
  const contactEmail = siteSettings.contactEmail || 'team@codecatalysts.dev';
  const brandLinks = Array.isArray(siteSettings.brandLinks) ? siteSettings.brandLinks : [];
  const ctaButtonText = siteSettings.ctaButtonText || 'Join the Build Squad';
  const faqSection = sectionList.find((section) => section.sectionKey === 'faq')
    || sectionList.find((section) => section.layoutType === 'faq')
    || null;
  const connectLinks = [
    siteSettings.githubUrl
      ? { icon: Github, href: siteSettings.githubUrl, label: 'GitHub' }
      : null,
    siteSettings.instagramUrl
      ? { icon: Instagram, href: siteSettings.instagramUrl, label: 'Instagram' }
      : null,
    siteSettings.linkedinUrl
      ? { icon: Linkedin, href: siteSettings.linkedinUrl, label: 'LinkedIn' }
      : null,
    siteSettings.twitterUrl
      ? { icon: Twitter, href: siteSettings.twitterUrl, label: 'Twitter / X' }
      : null,
    { icon: Mail, href: `mailto:${contactEmail}`, label: 'Email' },
  ].filter(Boolean);
  const socialLinks = connectLinks.filter((link) => link.label !== 'Email');
  const footerNavLinks = [
    { label: 'About', href: '#about' },
    { label: 'Team', href: '#team' },
    { label: 'Projects', href: '#projects' },
    { label: 'Journey', href: '#journey' },
    faqSection
      ? { label: faqSection.label || 'FAQ', href: `#${faqSection.anchorId || faqSection.sectionKey}` }
      : null,
  ].filter(Boolean);
  const footerBrandCopy = siteSettings.heroSubtitle || 'Building, learning, and shipping together since 2025.';
  const footerText = (siteSettings.footerText || 'Copyright {year} Code Catalysts. Built by the team.')
    .replace('{year}', String(currentYear));

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

        {/* â”€â”€ CTA Card â”€â”€ */}
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
              <span className="join-cta-button-label">{ctaButtonText}</span>
              <span className="join-cta-button-arrow">
                <ArrowUpRight size={16} />
              </span>
            </Link>

            <p className="join-cta-meta">
              Takes about 3 minutes. We get back within 1-3 days.<br />
              Or drop us a line at{' '}
              <a href={`mailto:${contactEmail}`} className="join-cta-mail">
                {contactEmail}
              </a>
            </p>
          </div>
        </div>

        {faqSection ? (() => {
          const section = faqSection;
          const visibleItems = Array.isArray(section.items)
            ? section.items.filter((item) => item?.isVisible !== false)
            : [];
          const openIndex = typeof openFaq[section.sectionKey] === 'number'
            ? openFaq[section.sectionKey]
            : 0;

          return (
            <section
              key={section.id || section.sectionKey}
              id={section.anchorId || section.sectionKey}
              className="join-faq-section"
              aria-labelledby={`${section.sectionKey}-title`}
            >
              <div className="join-faq-shell">
                <div className="join-faq-head">
                  <span className="join-faq-kicker">{section.kicker || section.label || 'FAQ'}</span>
                  <h3 id={`${section.sectionKey}-title`} className="join-faq-title">
                    {renderAccentTitle(section.title || section.label)}
                  </h3>
                  {section.description ? (
                    <p className="join-faq-copy">
                      {section.description}
                    </p>
                  ) : null}
                </div>

                <div className="join-faq-list">
                  {visibleItems.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                      <article key={item.id || item.title} className={`join-faq-item ${isOpen ? 'is-open' : ''}`}>
                        <button
                          type="button"
                          className="join-faq-trigger"
                          onClick={() => setOpenFaq((current) => ({
                            ...current,
                            [section.sectionKey]: isOpen ? -1 : index,
                          }))}
                          aria-expanded={isOpen}
                          aria-controls={`${section.sectionKey}-panel-${index}`}
                        >
                          <span>{item.title}</span>
                          <span className="join-faq-icon" aria-hidden="true">
                            <ChevronDown size={18} />
                          </span>
                        </button>
                        <div
                          id={`${section.sectionKey}-panel-${index}`}
                          className="join-faq-answer-wrap"
                          hidden={!isOpen}
                        >
                          <p className="join-faq-answer">{item.description}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })() : null}
      </div>
      <div className="footer-stage">
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="footer-panel">
            <div className="footer-panel-pattern" />
            <div className="footer-panel-glow footer-panel-glow-left" />
            <div className="footer-panel-glow footer-panel-glow-right" />

            <div className="footer-emblem" aria-hidden="true">
              <div className="footer-emblem-core">
                <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="footer-emblem-image" />
              </div>
            </div>

            <div className="footer-shell">
              <div className="footer-column footer-contact">
                <h4 className="footer-heading">Contact</h4>
                <a href={`mailto:${contactEmail}`} className="footer-mail-link">
                  {contactEmail}
                </a>
                {socialLinks.length ? (
                  <div className="footer-text-links">
                    {socialLinks.map(({ href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-text-link"
                      >
                        <span>{label}</span>
                        <ArrowUpRight size={14} />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="footer-column footer-brand">
                <h3 className="footer-brand-title">
                  <span className="footer-brand-accent">Code</span>
                  <span>Catalysts</span>
                </h3>
                <p className="footer-brand-copy">
                  {footerBrandCopy}
                </p>


              </div>

              <div className="footer-column footer-explore">
                <h4 className="footer-heading">Navigate</h4>
                <div className="footer-nav-grid">
                  {footerNavLinks.map((item) => (
                    <a key={item.label} href={item.href} className="footer-link">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="footer-bottom" data-has-links={brandLinks.length ? 'true' : undefined}>
              <p className="footer-bottom-copy">
                {footerText}
              </p>
              {brandLinks.length ? (
                <div className="footer-brand-links">
                  {brandLinks.map((item) => (
                    <a
                      key={`${item.label}-${item.url}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-brand-link"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
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
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -26%), rgba(242, 254, 255, calc(0.05 + (var(--surface-light-strength, 0.34) * 0.16))) 0%, rgba(116, 236, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.38))) 18%, transparent 56%),
            linear-gradient(180deg, rgba(196, 252, 255, calc(0.03 + (var(--surface-sheen-opacity, 0.08) * 0.6))) 0%, rgba(12, 14, 30, 0.95) 18%, rgba(8, 10, 24, 0.97) 48%, rgba(4, 5, 14, 0.99) 100%);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 28px) var(--surface-shadow-blur, 46px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.14)),
            calc(var(--surface-shadow-x, 0px) * 0.45) calc(var(--surface-shadow-y, 28px) * 0.52) calc(var(--surface-shadow-blur, 46px) * 0.56) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.42)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.03 + (var(--surface-edge-opacity, 0.08) * 0.56))),
            inset 0 -24px 44px rgba(0, 0, 0, calc(var(--surface-occlusion-opacity, 0.14) * 0.92));
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
          inset: -22% 14% auto;
          height: 52%;
          background: radial-gradient(circle, rgba(132, 247, 255, 0.24), rgba(0, 212, 255, 0.12) 42%, transparent 70%);
          filter: blur(56px);
          opacity: 0.82;
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
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 18px 30px rgba(0, 0, 0, 0.24);
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
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -18%), rgba(255, 255, 255, calc(0.06 + (var(--surface-light-strength, 0.34) * 0.14))) 0%, rgba(188, 246, 255, calc(0.03 + (var(--surface-glow-opacity, 0.12) * 0.3))) 20%, transparent 52%),
            linear-gradient(100deg, #32dcff 0%, #49c7ff 32%, #6898ff 66%, #8d67ff 100%);
          color: #132844;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 20px) var(--surface-shadow-blur, 34px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.06)),
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
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -24%), rgba(242, 254, 255, calc(0.04 + (var(--surface-light-strength, 0.34) * 0.12))) 0%, rgba(116, 236, 255, calc(0.02 + (var(--surface-glow-opacity, 0.12) * 0.26))) 18%, transparent 58%),
            linear-gradient(180deg, rgba(10, 12, 28, 0.88) 0%, rgba(7, 9, 22, 0.95) 100%);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 22px) var(--surface-shadow-blur, 40px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.08)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.34)));
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
          gap: 0.6rem;
        }
        .join-faq-item {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -28%), rgba(255, 255, 255, calc(0.02 + (var(--surface-light-strength, 0.34) * 0.08))) 0%, transparent 56%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.015) 100%);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .join-faq-item.is-open {
          border-color: rgba(94, 186, 255, 0.24);
          background: linear-gradient(180deg, rgba(0, 212, 255, 0.05) 0%, rgba(167, 139, 250, 0.035) 100%);
          box-shadow: var(--surface-shadow-x, 0px) calc(var(--surface-shadow-y, 18px) * 0.54) calc(var(--surface-shadow-blur, 30px) * 0.48) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.36));
        }
        .join-faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.95rem 1.1rem;
          border: 0;
          background: transparent;
          color: #eef5ff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.45;
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
          padding: 0 1.1rem 0.95rem;
        }
        .join-faq-answer {
          max-width: 64ch;
          color: rgba(194, 208, 233, 0.78);
          font-size: 0.94rem;
          line-height: 1.7;
        }
        .footer-stage {
          position: relative;
          z-index: 10;
          margin-top: 1.75rem;
          padding: 2.4rem 0 1.5rem;
        }
        .footer-panel {
          position: relative;
          overflow: visible;
          border-radius: 34px;
          padding: clamp(3.75rem, 7vw, 5rem) clamp(1.3rem, 4vw, 2.5rem) 1.35rem;
          border: 1px solid rgba(80, 160, 255, 0.12);
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -26%), rgba(238, 254, 255, calc(0.04 + (var(--surface-light-strength, 0.34) * 0.14))) 0%, rgba(96, 232, 255, calc(0.02 + (var(--surface-glow-opacity, 0.12) * 0.34))) 18%, transparent 54%),
            radial-gradient(circle at top center, rgba(0, 212, 255, 0.08), transparent 34%),
            linear-gradient(180deg, rgba(8, 12, 26, 0.98) 0%, rgba(4, 6, 14, 0.99) 100%);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 28px) var(--surface-shadow-blur, 48px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.14)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.38)));
        }
        .footer-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 14%, rgba(255, 255, 255, 0.02) 100%);
        }
        .footer-panel-pattern,
        .footer-panel-glow {
          position: absolute;
          pointer-events: none;
        }
        .footer-panel-pattern {
          inset: 0;
          border-radius: inherit;
          background-image: url("data:image/svg+xml,%3Csvg width='900' height='520' viewBox='0 0 900 520' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1.2'%3E%3Cpath d='M-60 120C40 40 180 34 270 100C360 166 500 164 594 98C688 32 826 40 948 120'/%3E%3Cpath d='M-84 216C38 132 184 132 274 198C364 264 504 264 602 190C700 116 846 122 972 206'/%3E%3Cpath d='M-52 330C58 250 200 246 296 304C392 362 526 364 620 310C714 256 846 252 952 328'/%3E%3Cpath d='M-98 438C24 352 186 350 286 414C386 478 540 480 646 418C752 356 904 356 1018 442'/%3E%3Cpath d='M120 -40C70 52 80 152 132 220C184 288 188 386 132 484'/%3E%3Cpath d='M332 -30C280 58 280 164 330 248C380 332 384 430 338 548'/%3E%3Cpath d='M580 -52C530 54 530 164 584 246C638 328 650 426 618 546'/%3E%3Cpath d='M786 -44C750 44 752 146 804 232C856 318 876 414 842 536'/%3E%3C/g%3E%3C/svg%3E");
          background-size: cover;
          background-position: center;
          opacity: 0.9;
        }
        .footer-panel-glow-left {
          inset: 16% auto auto -4%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.12), transparent 70%);
          filter: blur(40px);
        }
        .footer-panel-glow-right {
          inset: auto -6% 10% auto;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(167, 139, 250, 0.12), transparent 72%);
          filter: blur(46px);
        }
        .footer-emblem {
          position: absolute;
          left: 50%;
          top: 0;
          width: 92px;
          height: 92px;
          transform: translate(-50%, -44%);
          z-index: 2;
        }
        .footer-emblem-core {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 30px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(8, 14, 28, 0.98) 0%, rgba(4, 6, 16, 0.98) 100%);
          border: 1px solid rgba(80, 192, 255, 0.28);
          box-shadow:
            var(--surface-shadow-x, 0px) var(--surface-shadow-y, 18px) var(--surface-shadow-blur, 28px) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) + 0.08)),
            0 0 34px rgba(0, 212, 255, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.03 + (var(--surface-edge-opacity, 0.08) * 0.4)));
        }
        .footer-emblem-core::before {
          content: '';
          position: absolute;
          inset: 12%;
          border-radius: 22px;
          background:
            radial-gradient(circle at 24% 24%, rgba(0, 212, 255, 0.3), transparent 42%),
            radial-gradient(circle at 78% 78%, rgba(167, 139, 250, 0.18), transparent 54%);
          filter: blur(10px);
        }
        .footer-emblem-image {
          position: relative;
          z-index: 1;
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 14px;
          display: block;
        }
        .footer-shell,
        .footer-bottom {
          position: relative;
          z-index: 1;
        }
        .footer-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 1.35fr) minmax(0, 1fr);
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: start;
        }
        .footer-column {
          display: flex;
          flex-direction: column;
        }
        .footer-contact {
          padding-top: 0.55rem;
        }
        .footer-explore {
          align-items: flex-end;
          padding-top: 0.55rem;
        }
        .footer-heading {
          margin-bottom: 0.9rem;
          color: rgba(180, 210, 255, 0.76);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .footer-mail-link {
          width: fit-content;
          color: #f5f7ff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
        }
        .footer-mail-link:hover {
          color: #7fe2ff;
        }
        .footer-text-links {
          display: grid;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .footer-text-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          width: fit-content;
          color: rgba(214, 220, 234, 0.78);
          font-size: 0.92rem;
          transition: color 0.25s ease;
        }
        .footer-text-link svg {
          opacity: 0.65;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }
        .footer-text-link:hover {
          color: #ffffff;
        }
        .footer-text-link:hover svg {
          opacity: 1;
          transform: translate(2px, -2px);
        }
        .footer-brand {
          align-items: center;
          text-align: center;
        }
        .footer-brand-title {
          display: flex;
          flex-direction: column;
          gap: 0.05rem;
          margin: 0;
          color: #f0f4ff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.3rem);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 0.95;
          text-shadow: 0 6px 28px rgba(0, 0, 0, 0.22);
        }
        .footer-brand-accent {
          background: linear-gradient(120deg, #b4d8ff 0%, #00d4ff 42%, #a78bfa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .footer-brand-copy {
          max-width: 32ch;
          margin-top: 1rem;
          color: rgba(214, 222, 236, 0.72);
          font-size: 0.96rem;
          line-height: 1.75;
        }
        .footer-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.65rem;
        }
        .footer-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 48px;
          padding: 0 1.15rem;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 0.92rem;
          font-weight: 700;
          transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }
        .footer-action-primary {
          color: #0d1a2b;
          background: linear-gradient(100deg, #32dcff 0%, #49c7ff 30%, #6898ff 72%, #8d67ff 100%);
          box-shadow:
            0 14px 28px rgba(0, 0, 0, 0.18),
            0 10px 24px rgba(56, 199, 255, 0.12);
        }
        .footer-action-secondary {
          color: #f1f4fb;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .footer-nav-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(100px, auto));
          gap: 0.65rem 1.25rem;
          justify-content: flex-end;
          justify-items: start;
        }
        .footer-link {
          padding: 0.1rem 0;
          color: rgba(226, 232, 244, 0.84);
          font-size: 0.95rem;
          font-weight: 600;
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .footer-link:hover {
          color: #ffffff;
          transform: translateX(2px);
        }
        .footer-bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.9rem 1.25rem;
          margin-top: 2rem;
          padding-top: 1.1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .footer-bottom[data-has-links] {
          justify-content: space-between;
        }
        .footer-bottom-copy {
          color: rgba(198, 204, 216, 0.74);
          font-size: 0.84rem;
          font-weight: 500;
          text-align: center;
        }
        .footer-brand-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          justify-content: flex-end;
        }
        .footer-brand-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          padding: 0 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            radial-gradient(circle at var(--surface-light-x, 50%) var(--surface-light-y, -18%), rgba(255, 255, 255, calc(0.02 + (var(--surface-light-strength, 0.34) * 0.08))) 0%, transparent 54%),
            rgba(255, 255, 255, 0.05);
          color: rgba(230, 240, 250, 0.88);
          font-size: 0.82rem;
          font-weight: 600;
          transition: all 0.25s ease;
          box-shadow:
            var(--surface-shadow-x, 0px) calc(var(--surface-shadow-y, 18px) * 0.4) calc(var(--surface-shadow-blur, 30px) * 0.36) rgba(0, 0, 0, calc(var(--surface-shadow-opacity, 0.24) * 0.28)),
            inset 0 1px 0 rgba(255, 255, 255, calc(0.02 + (var(--surface-edge-opacity, 0.08) * 0.28)));
        }
        .footer-brand-link:hover {
          color: #ffffff;
          border-color: rgba(92, 210, 255, 0.3);
          background: rgba(92, 210, 255, 0.09);
        }

        @media (max-width: 960px) {
          .footer-shell {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
          .footer-contact,
          .footer-brand,
          .footer-explore {
            align-items: center;
            padding-top: 0;
            text-align: center;
          }
          .footer-mail-link,
          .footer-text-link {
            margin-inline: auto;
          }
          .footer-nav-grid {
            justify-content: center;
            justify-items: center;
          }
          .footer-bottom[data-has-links] {
            justify-content: center;
          }
          .footer-brand-links {
            justify-content: center;
          }
        }

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
          .footer-action:hover {
            transform: translateY(-2px);
          }
          .footer-action-primary:hover {
            box-shadow:
              0 18px 36px rgba(0, 0, 0, 0.22),
              0 14px 28px rgba(56, 199, 255, 0.18);
          }
          .footer-action-secondary:hover {
            border-color: rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.08);
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
            padding: 0.9rem 1rem;
            font-size: 0.95rem;
          }
          .join-faq-answer-wrap {
            padding: 0 1rem 0.9rem;
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
          .footer-stage {
            padding-top: 2rem;
          }
          .footer-panel {
            border-radius: 28px;
            padding: 3.25rem 1rem 1.2rem;
          }
          .footer-emblem {
            width: 78px;
            height: 78px;
          }
          .footer-emblem-core {
            border-radius: 24px;
          }
          .footer-emblem-image {
            width: 42px;
            height: 42px;
          }
          .footer-brand-title {
            font-size: clamp(1.9rem, 10vw, 2.6rem);
          }
          .footer-actions {
            width: 100%;
          }
          .footer-action {
            width: 100%;
            max-width: 320px;
          }
          .footer-nav-grid {
            width: min(100%, 320px);
            grid-template-columns: repeat(2, minmax(110px, 1fr));
            gap: 0.55rem 0.85rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Join;

