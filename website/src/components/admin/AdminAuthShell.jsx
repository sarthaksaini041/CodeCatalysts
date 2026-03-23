import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../../lib/brandAssets';

const DEFAULT_HIGHLIGHTS = [
  'Secure, role-based access for approved admins only.',
  'Fast content operations without changing backend logic.',
  'Responsive controls built to stay usable on every screen size.',
];

export default function AdminAuthShell({
  title,
  description,
  children,
  highlights = DEFAULT_HIGHLIGHTS,
}) {
  return (
    <div className="admin-shell admin-auth-shell">
      <div className="admin-auth-grid">
        <aside className="admin-auth-aside">
          <Link to="/" className="admin-auth-brand" aria-label="Back to Code Catalysts">
            <span className="admin-brand-mark">
              <img
                src={SITE_LOGO_SRC}
                alt={SITE_LOGO_ALT}
                className="admin-brand-image"
                loading="eager"
                decoding="async"
              />
            </span>
            <span className="admin-auth-brand-copy">
              <strong>Code Catalysts</strong>
              <span>Admin workspace</span>
            </span>
          </Link>

          <div className="admin-auth-copy">
            <span className="admin-page-kicker">Operations</span>
            <h1>Simple admin access.</h1>
            <p>
              This workspace stays lightweight and static while preserving the existing
              backend integrations and content workflows.
            </p>
          </div>

          <div className="admin-auth-highlights" aria-label="Portal highlights">
            {highlights.map((item) => (
              <div key={item} className="admin-auth-highlight">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="admin-auth-aside-footer">
            <div className="admin-mini-chip">
              <span>Static monochrome workspace</span>
            </div>
            <Link to="/" className="admin-auth-site-link">
              <span>View public site</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </aside>

        <section className="admin-card admin-login-card">
          <div className="admin-card-body">
            <div className="admin-auth-form-header">
              <span className="admin-page-kicker">Admin access</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
