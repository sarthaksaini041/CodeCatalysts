import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Join from './components/Join';
import { PublicContentProvider } from './context/PublicContentContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import {
  ADMIN_LOGIN_PATH,
  ADMIN_PORTAL_BASE_PATH,
  ADMIN_RECOVERY_PATH,
  ADMIN_RESET_PASSWORD_PATH,
  LEGACY_ADMIN_BASE_PATH,
  adminPortalPath,
} from './lib/adminPortalRoutes';

import { motion } from 'framer-motion';

const Team = lazy(() => import('./components/Team'));
const Projects = lazy(() => import('./components/Projects'));
const Journey = lazy(() => import('./components/Journey'));
const ApplyPage = lazy(() => import('./pages/Apply'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const ProtectedAdminRoute = lazy(() => import('./components/admin/ProtectedAdminRoute'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminRecoveryPage = lazy(() => import('./pages/admin/AdminRecoveryPage'));
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminMembersPage = lazy(() => import('./pages/admin/AdminMembersPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminJourneyPage = lazy(() => import('./pages/admin/AdminJourneyPage'));
const AdminSectionsPage = lazy(() => import('./pages/admin/AdminSectionsPage'));
const AdminFaqPage = lazy(() => import('./pages/admin/AdminFaqPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));
const AdminApplicationsPage = lazy(() => import('./pages/admin/AdminApplicationsPage'));
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivityPage'));
const AdminAccountPage = lazy(() => import('./pages/admin/AdminAccountPage'));
const ANCHOR_INTENT_EVENT = 'codecatalysts:anchor-intent';

/* ── Stagger container — orchestrates child entrance ── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/* ── Slide-down (for Navbar) ── */
const slideDown = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

/* ── Fade-up (for Hero + content) ── */
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const sectionFallbackBase = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  borderRadius: '0px',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
  border: 'none',
  opacity: 0.45,
};

const SectionFallback = ({ minHeight }) => (
  <div
    aria-hidden="true"
    style={{
      ...sectionFallbackBase,
      minHeight,
    }}
  />
);

const RouteFallback = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }} />
);

const SectionWrapper = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

const DeferredSection = ({
  children,
  minHeight,
  anchorId,
  rootMargin = '500px 0px 250px 0px',
}) => {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window)
  );

  useEffect(() => {
    if (shouldRender) return undefined;

    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  useEffect(() => {
    if (!anchorId || shouldRender) return undefined;

    const handleAnchorIntent = (event) => {
      if (event.detail === anchorId) {
        setShouldRender(true);
      }
    };

    window.addEventListener(ANCHOR_INTENT_EVENT, handleAnchorIntent);
    return () => window.removeEventListener(ANCHOR_INTENT_EVENT, handleAnchorIntent);
  }, [anchorId, shouldRender]);

  return (
    <div
      id={anchorId}
      ref={containerRef}
      style={{ minHeight, width: '100%', scrollMarginTop: '6.75rem' }}
    >
      {shouldRender ? children : <SectionFallback minHeight={minHeight} />}
    </div>
  );
};

function HomePage() {
  return (
    <PublicContentProvider>
      <motion.div
        className="site-continuous"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Navbar slides down */}
          <motion.div variants={slideDown}>
            <Navbar />
          </motion.div>

          <main>
            {/* Hero fades up */}
            <motion.div variants={fadeUp}>
              <Hero />
            </motion.div>

            <SectionWrapper delay={0.1}><About /></SectionWrapper>
            <DeferredSection anchorId="team" minHeight={980}>
              <Suspense fallback={<SectionFallback minHeight={980} />}>
                <SectionWrapper delay={0.1}><Team /></SectionWrapper>
              </Suspense>
            </DeferredSection>
            <DeferredSection anchorId="projects" minHeight={560}>
              <Suspense fallback={<SectionFallback minHeight={560} />}>
                <SectionWrapper delay={0.1}><Projects /></SectionWrapper>
              </Suspense>
            </DeferredSection>
            <DeferredSection anchorId="journey" minHeight={720}>
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <SectionWrapper delay={0.1}><Journey /></SectionWrapper>
              </Suspense>
            </DeferredSection>
          </main>

          <motion.div variants={fadeUp}>
            <Join />
          </motion.div>
        </div>
      </motion.div>
    </PublicContentProvider>
  );
}

function LegacyAdminRedirect() {
  const location = useLocation();
  const legacyPrefixPattern = new RegExp(`^${LEGACY_ADMIN_BASE_PATH.replace('/', '\\/')}(?:\\/|$)`);
  const legacyRemainder = location.pathname.replace(legacyPrefixPattern, '');
  const nextPath = adminPortalPath(legacyRemainder);

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
}

function App() {
  return (
    <>
      <Analytics />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />
          <Route
            path="/apply"
            element={(
              <Suspense fallback={<RouteFallback />}>
                <ApplyPage />
              </Suspense>
            )}
          />
          <Route
            path={ADMIN_LOGIN_PATH}
            element={(
              <AdminAuthProvider>
                <Suspense fallback={<RouteFallback />}>
                  <AdminLoginPage />
                </Suspense>
              </AdminAuthProvider>
            )}
          />
          <Route
            path={ADMIN_RESET_PASSWORD_PATH}
            element={(
              <AdminAuthProvider>
                <Suspense fallback={<RouteFallback />}>
                  <AdminResetPasswordPage />
                </Suspense>
              </AdminAuthProvider>
            )}
          />
          <Route
            path={ADMIN_RECOVERY_PATH}
            element={(
              <AdminAuthProvider>
                <Suspense fallback={<RouteFallback />}>
                  <AdminRecoveryPage />
                </Suspense>
              </AdminAuthProvider>
            )}
          />
          <Route
            path={ADMIN_PORTAL_BASE_PATH}
            element={(
              <AdminAuthProvider>
                <Suspense fallback={<RouteFallback />}>
                  <ProtectedAdminRoute />
                </Suspense>
              </AdminAuthProvider>
            )}
          >
            <Route
              element={(
                <Suspense fallback={null}>
                  <AdminLayout />
                </Suspense>
              )}
            >
              <Route
                index
                element={(
                  <Suspense fallback={null}>
                    <AdminDashboardPage />
                  </Suspense>
                )}
              />
              <Route
                path="members"
                element={(
                  <Suspense fallback={null}>
                    <AdminMembersPage />
                  </Suspense>
                )}
              />
              <Route
                path="projects"
                element={(
                  <Suspense fallback={null}>
                    <AdminProjectsPage />
                  </Suspense>
                )}
              />
              <Route
                path="journey"
                element={(
                  <Suspense fallback={null}>
                    <AdminJourneyPage />
                  </Suspense>
                )}
              />
              <Route
                path="sections"
                element={(
                  <Suspense fallback={null}>
                    <AdminSectionsPage />
                  </Suspense>
                )}
              />
              <Route
                path="faqs"
                element={(
                  <Suspense fallback={null}>
                    <AdminFaqPage />
                  </Suspense>
                )}
              />
              <Route
                path="settings"
                element={(
                  <Suspense fallback={null}>
                    <AdminSettingsPage />
                  </Suspense>
                )}
              />
              <Route
                path="media"
                element={(
                  <Suspense fallback={null}>
                    <AdminMediaPage />
                  </Suspense>
                )}
              />
              <Route
                path="applications"
                element={(
                  <Suspense fallback={null}>
                    <AdminApplicationsPage />
                  </Suspense>
                )}
              />
              <Route
                path="activity"
                element={(
                  <Suspense fallback={null}>
                    <AdminActivityPage />
                  </Suspense>
                )}
              />
              <Route
                path="account"
                element={(
                  <Suspense fallback={null}>
                    <AdminAccountPage />
                  </Suspense>
                )}
              />
            </Route>
          </Route>
          <Route
            path={`${LEGACY_ADMIN_BASE_PATH}/*`}
            element={<LegacyAdminRedirect />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
