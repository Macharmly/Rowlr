import { useEffect, useRef } from 'react'

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Moon,
  ShieldCheck,
  Sun,
  Target,
  Wallet,
  TrendingUp,
} from 'lucide-react'

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    overflowX: 'hidden',
  },

  container: {
    width: '100%',
    maxWidth: 1180,
    margin: '0 auto',
    padding: '0 24px',
    boxSizing: 'border-box',
  },

  nav: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: 'var(--text)',
    flexShrink: 0,
  },

  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: '-0.4px',
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 28,
  },

  navLink: {
    fontSize: 13,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 180ms ease',
  },

  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },

  themeButton: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },

  signIn: {
    padding: '9px 15px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  getStartedSmall: {
    padding: '9px 15px',
    backgroundColor: 'var(--text)',
    border: '1px solid var(--text)',
    borderRadius: 10,
    color: 'var(--bg)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  hero: {
    textAlign: 'center',
    paddingTop: 88,
  },

  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 10px',
    border: '1px solid var(--border)',
    borderRadius: 999,
    backgroundColor: 'var(--card)',
    color: 'var(--text-muted)',
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 22,
  },

  heroTitle: {
    maxWidth: 760,
    margin: '0 auto',
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 'clamp(46px, 7vw, 76px)',
    lineHeight: 0.98,
    letterSpacing: '-3px',
    fontWeight: 800,
    color: 'var(--text)',
  },

  heroAccent: {
    color: 'var(--text-muted)',
  },

  heroDescription: {
    maxWidth: 560,
    margin: '24px auto 0',
    fontSize: 16,
    lineHeight: 1.65,
    color: 'var(--text-muted)',
  },

  heroActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    marginTop: 30,
    flexWrap: 'wrap',
  },

  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 18px',
    backgroundColor: 'var(--text)',
    color: 'var(--bg)',
    border: '1px solid var(--text)',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 18px',
    backgroundColor: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  previewWrapper: {
    maxWidth: 980,
    margin: '72px auto 0',
    position: 'relative',
  },

  previewGlow: {
    position: 'absolute',
    width: 500,
    height: 300,
    left: '50%',
    top: 60,
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--text)',
    opacity: 0.035,
    filter: 'blur(80px)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },

  dashboard: {
    position: 'relative',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    boxShadow: '0 24px 70px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    textAlign: 'left',
  },

  dashboardTop: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid var(--border)',
  },

  dashboardBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
  },

  dashboardDots: {
    display: 'flex',
    gap: 5,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: 'var(--border)',
  },

  dashboardBody: {
    padding: 20,
  },

  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },

  overviewCard: {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
  },

  overviewIcon: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 9,
    color: 'var(--text-muted)',
  },

  overviewTitle: {
    fontSize: 12,
    fontWeight: 600,
    marginTop: 12,
  },

  overviewText: {
    fontSize: 10,
    color: 'var(--text-subtle)',
    lineHeight: 1.5,
    marginTop: 5,
  },

  overviewSection: {
    marginTop: 12,
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
  },

  overviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  overviewHeaderTitle: {
    fontSize: 12,
    fontWeight: 600,
  },

  overviewHeaderText: {
    fontSize: 10,
    color: 'var(--text-subtle)',
  },

  overviewItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginTop: 14,
  },

  overviewItem: {
    padding: '12px 10px',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    textAlign: 'center',
  },

  overviewItemIcon: {
    margin: '0 auto 7px',
    color: 'var(--text-muted)',
  },

  overviewItemTitle: {
    fontSize: 10,
    fontWeight: 600,
  },

  overviewItemText: {
    marginTop: 3,
    fontSize: 9,
    color: 'var(--text-subtle)',
  },

  section: {
    paddingTop: 120,
    paddingBottom: 120,
  },

  sectionHeader: {
    maxWidth: 700,
    margin: '0 auto 52px',
    textAlign: 'center',
  },

  sectionTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 'clamp(34px, 5vw, 48px)',
    lineHeight: 1,
    letterSpacing: '-1.8px',
    fontWeight: 800,
    margin: 0,
  },

  sectionText: {
    maxWidth: 520,
    margin: '18px auto 0',
    color: 'var(--text-muted)',
    fontSize: 14,
    lineHeight: 1.6,
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },

  featureCard: {
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 20,
  },

  featureIcon: {
    width: 34,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text-muted)',
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginTop: 15,
  },

  featureText: {
    fontSize: 12,
    color: 'var(--text-subtle)',
    lineHeight: 1.6,
    marginTop: 6,
  },

  largeFeatureCard: {
    height: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: 24,
  },

  number: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: '-1px',
  },

  finalCta: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: '72px 24px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
  },

  footer: {
    borderTop: '1px solid var(--border)',
    padding: '24px 0',
  },

  footerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },

  footerText: {
    fontSize: 11,
    color: 'var(--text-subtle)',
  },

  dashboardStat: {
    padding: 11,
    borderRadius: 12,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 14px rgba(0,0,0,0.025)',
  },

  dashboardStatLabel: {
    fontSize: 7,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--muted)',
  },

  dashboardStatValue: {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: '-0.3px',
    marginTop: 5,
  },

  dashboardStatChange: {
    fontSize: 7,
    fontWeight: 800,
    marginTop: 4,
  },

  dashboardPanel: {
    padding: 12,
    borderRadius: 13,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: '0 5px 18px rgba(0,0,0,0.025)',
  },

  floatingFinanceCard: {
    position: 'absolute',
    zIndex: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '11px 14px',
    minWidth: 145,
    borderRadius: 14,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: '0 18px 45px rgba(0,0,0,0.10)',
    backdropFilter: 'blur(14px)',
  },

  floatingIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  floatingLabel: {
    fontSize: 7,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--muted)',
  },

  floatingValue: {
    fontSize: 11,
    fontWeight: 900,
    marginTop: 3,
  },
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('rowlr-reveal-visible')
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`rowlr-reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function LandingPage({
  dark,
  setDark,
  onGetStarted,
  onSignIn,
}) {
  return (
    <>
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .rowlr-reveal {
          opacity: 0;
          transform: translateY(32px);
          transition:
            opacity 700ms ease,
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay);
        }

        .rowlr-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .rowlr-float {
          animation: rowlrFloat 6s ease-in-out infinite;
        }

        @keyframes rowlrFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        .rowlr-hover {
          transition:
            transform 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }

        .rowlr-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
        }

        .rowlr-button {
          transition:
            transform 180ms ease,
            opacity 180ms ease,
            box-shadow 180ms ease;
        }

        .rowlr-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        .rowlr-button:active {
          transform: translateY(0);
        }

        .rowlr-nav-link:hover {
          color: var(--text) !important;
        }

        .rowlr-nav-button {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background-color 180ms ease;
        }

        .rowlr-nav-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }

        @media (max-width: 900px) {
          .rowlr-nav-links {
            display: none !important;
          }

          .rowlr-dashboard-grid {
            grid-template-columns: 1fr !important;
          }

          .rowlr-overview-items {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .rowlr-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 620px) {
          .rowlr-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .rowlr-hero {
            padding-top: 56px !important;
          }

          .rowlr-hero-title {
            letter-spacing: -2px !important;
          }

          .rowlr-preview {
            margin-top: 48px !important;
          }

          .rowlr-dashboard-body {
            padding: 12px !important;
          }

          .rowlr-overview-items {
            grid-template-columns: 1fr 1fr !important;
          }

          .rowlr-cards-grid {
            grid-template-columns: 1fr !important;
          }

          .rowlr-final-cta {
            padding: 52px 20px !important;
          }

          .rowlr-footer-inner {
            flex-direction: column;
            text-align: center;
          }

          .rowlr-mobile-hide {
            display: none !important;
          }
        }

        @media (max-width: 620px) {
          .rowlr-dashboard-body {
            padding: 10px !important;
          }

          .rowlr-dashboard-body > div:first-child {
            grid-template-columns: 1fr !important;
          }

          .rowlr-dashboard-body [style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .rowlr-reveal,
          .rowlr-float,
          .rowlr-hover,
          .rowlr-button,
          .rowlr-nav-button {
            animation: none !important;
            transition: none !important;
          }

          .rowlr-reveal {
            opacity: 1;
            transform: none;
          }
        }

        /* =========================
          Rowlr Dashboard Animations
        ========================== */

        @keyframes rowlrBarGrow {
          from {
            transform: scaleY(0);
            opacity: 0;
          }

          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        .rowlr-floating-card {
          animation:
            rowlrFloatingCard 5s ease-in-out infinite;
        }

        .rowlr-floating-left {
          animation-delay: -1.5s;
        }

        .rowlr-floating-right {
          animation-delay: -3s;
        }

        @keyframes rowlrFloatingCard {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        .rowlr-dashboard-grid {
          perspective: 1000px;
        }

        .rowlr-dashboard-grid > * {
          animation:
            rowlrDashboardCardIn
            800ms
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .rowlr-dashboard-grid > *:nth-child(1) {
          animation-delay: 450ms;
        }

        .rowlr-dashboard-grid > *:nth-child(2) {
          animation-delay: 520ms;
        }

        .rowlr-dashboard-grid > *:nth-child(3) {
          animation-delay: 590ms;
        }

        @keyframes rowlrDashboardCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 900px) {
          .rowlr-floating-card {
            display: none !important;
          }
        }

        @media (max-width: 620px) {
          .rowlr-floating-card {
            display: none !important;
          }
        }
      `}</style>

      <div style={s.page}>

        {/* =========================
            NAVBAR
        ========================== */}

        <header>
          <div
            style={s.container}
            className="rowlr-container"
          >
            <div style={s.nav}>

              <div style={s.logo}>
                <div style={s.logoMark}>
                  <Wallet size={17} color="var(--bg)" />
                </div>

                <span style={s.logoText}>
                  Rowlr
                </span>
              </div>

              <nav
                style={s.navLinks}
                className="rowlr-nav-links"
              >
                <a
                  href="#features"
                  style={s.navLink}
                  className="rowlr-nav-link"
                >
                  Features
                </a>

                <a
                  href="#overview"
                  style={s.navLink}
                  className="rowlr-nav-link"
                >
                  Overview
                </a>

                <a
                  href="#how-it-works"
                  style={s.navLink}
                  className="rowlr-nav-link"
                >
                  How it works
                </a>
              </nav>

              <div style={s.navActions}>

                <button
                  onClick={() => setDark(!dark)}
                  style={s.themeButton}
                  aria-label="Toggle theme"
                  className="rowlr-nav-button"
                >
                  {dark ? (
                    <Sun size={15} />
                  ) : (
                    <Moon size={15} />
                  )}
                </button>

                <button
                  onClick={onSignIn}
                  style={s.signIn}
                  className="rowlr-nav-button rowlr-mobile-hide"
                >
                  Sign in
                </button>

                <button
                  onClick={onGetStarted}
                  style={s.getStartedSmall}
                  className="rowlr-nav-button"
                >
                  Get started
                </button>

              </div>

            </div>
          </div>
        </header>

        <main>

          {/* =========================
              HERO
          ========================== */}

          <section
            style={{
              ...s.container,
              ...s.hero,
            }}
            className="rowlr-container rowlr-hero"
          >

            <Reveal>
              <div style={s.eyebrow}>
                <ShieldCheck size={13} />
                Simple finance management
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1
                style={s.heroTitle}
                className="rowlr-hero-title"
              >
                Your money,
                <br />
                <span style={s.heroAccent}>
                  made clearer.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p style={s.heroDescription}>
                Rowlr brings your spending, budgets, goals,
                and financial insights together in one simple place.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div style={s.heroActions}>

                <button
                  onClick={onGetStarted}
                  className="rowlr-button"
                  style={s.primaryButton}
                >
                  Get started
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={onSignIn}
                  className="rowlr-button"
                  style={s.secondaryButton}
                >
                  Sign in
                </button>

              </div>
            </Reveal>

            {/* =========================
                FLOATING DASHBOARD PREVIEW
            ========================== */}

            <Reveal delay={350}>
              <div
                style={s.previewWrapper}
                className="rowlr-preview"
              >

                {/* Ambient glow */}
                <div style={s.previewGlow} />

                {/* Floating dashboard */}
                <div
                  style={{
                    ...s.dashboard,
                    position: 'relative',
                    zIndex: 2,
                  }}
                  className="rowlr-float"
                >

                  {/* Browser Header */}
                  <div style={s.dashboardTop}>

                    <div style={s.dashboardBrand}>
                      <Wallet size={14} />
                      Rowlr Dashboard
                    </div>

                    <div style={s.dashboardDots}>
                      <span style={s.dot} />
                      <span style={s.dot} />
                      <span style={s.dot} />
                    </div>

                  </div>

                  {/* Dashboard Body */}
                  <div
                    style={s.dashboardBody}
                    className="rowlr-dashboard-body"
                  >

                    {/* Dashboard heading */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: 18,
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            color: 'var(--muted)',
                          }}
                        >
                          Financial overview
                        </div>

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            letterSpacing: '-0.5px',
                            marginTop: 4,
                          }}
                        >
                          Your money at a glance
                        </div>

                      </div>

                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 11,
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BarChart3 size={16} />
                      </div>

                    </div>

                    {/* Main Stats */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 9,
                        marginBottom: 12,
                      }}
                    >

                      <div
                        style={{
                          ...s.dashboardStat,
                        }}
                      >
                        <div style={s.dashboardStatLabel}>
                          Balance
                        </div>

                        <div style={s.dashboardStatValue}>
                          ₱84.2K
                        </div>

                        <div
                          style={{
                            ...s.dashboardStatChange,
                            color: '#16a34a',
                          }}
                        >
                          +12.4%
                        </div>
                      </div>

                      <div
                        style={{
                          ...s.dashboardStat,
                        }}
                      >
                        <div style={s.dashboardStatLabel}>
                          Income
                        </div>

                        <div style={s.dashboardStatValue}>
                          ₱42.8K
                        </div>

                        <div
                          style={{
                            ...s.dashboardStatChange,
                            color: '#16a34a',
                          }}
                        >
                          This month
                        </div>
                      </div>

                      <div
                        style={{
                          ...s.dashboardStat,
                        }}
                      >
                        <div style={s.dashboardStatLabel}>
                          Expenses
                        </div>

                        <div style={s.dashboardStatValue}>
                          ₱18.6K
                        </div>

                        <div
                          style={{
                            ...s.dashboardStatChange,
                            color: '#ea580c',
                          }}
                        >
                          This month
                        </div>
                      </div>

                    </div>

                    {/* Spending Overview */}
                    <div
                      style={{
                        ...s.dashboardPanel,
                        marginBottom: 10,
                      }}
                    >

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 14,
                        }}
                      >

                        <div>

                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            Spending overview
                          </div>

                          <div
                            style={{
                              fontSize: 8,
                              color: 'var(--muted)',
                              marginTop: 3,
                            }}
                          >
                            Monthly spending activity
                          </div>

                        </div>

                        <BarChart3
                          size={16}
                          color="var(--accent)"
                        />

                      </div>

                      {/* Fake chart */}
                      <div
                        style={{
                          height: 92,
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 6,
                        }}
                      >

                        {[38, 52, 44, 67, 58, 73, 61, 81, 68, 88, 76, 94].map(
                          (height, index) => (
                            <div
                              key={index}
                              style={{
                                flex: 1,
                                height: `${height}%`,
                                borderRadius: '5px 5px 2px 2px',
                                background:
                                  index === 11
                                    ? 'var(--accent)'
                                    : 'var(--accent-soft)',
                                opacity:
                                  index === 11
                                    ? 1
                                    : 0.8,
                                transformOrigin: 'bottom',
                                animation: `rowlrBarGrow 900ms cubic-bezier(0.22, 1, 0.36, 1) ${
                                  index * 60
                                }ms both`,
                              }}
                            />
                          )
                        )}

                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 8,
                          fontSize: 7,
                          fontWeight: 700,
                          color: 'var(--muted)',
                        }}
                      >
                        <span>JAN</span>
                        <span>MAR</span>
                        <span>MAY</span>
                        <span>JUL</span>
                      </div>

                    </div>

                    {/* Bottom Overview */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr',
                        gap: 10,
                      }}
                    >

                      {/* Recent activity */}
                      <div style={s.dashboardPanel}>

                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            marginBottom: 10,
                          }}
                        >
                          Recent activity
                        </div>

                        {[
                          ['Salary', '+₱32,000', '#16a34a'],
                          ['Groceries', '-₱2,480', '#ea580c'],
                          ['Electricity', '-₱1,920', '#ea580c'],
                        ].map(([name, amount, color]) => (

                          <div
                            key={name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 0',
                              borderBottom:
                                '1px solid var(--border)',
                            }}
                          >

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                              }}
                            >

                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 8,
                                  background: 'var(--accent-soft)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--accent)',
                                }}
                              >
                                <Wallet size={11} />
                              </div>

                              <span
                                style={{
                                  fontSize: 8,
                                  fontWeight: 700,
                                }}
                              >
                                {name}
                              </span>

                            </div>

                            <span
                              style={{
                                fontSize: 8,
                                fontWeight: 800,
                                color,
                              }}
                            >
                              {amount}
                            </span>

                          </div>

                        ))}

                      </div>

                      {/* Financial health */}
                      <div style={s.dashboardPanel}>

                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          Financial health
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '13px 0',
                          }}
                        >

                          <div
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: '50%',
                              background:
                                'conic-gradient(var(--accent) 0deg 292deg, var(--accent-soft) 292deg 360deg)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >

                            <div
                              style={{
                                width: 58,
                                height: 58,
                                borderRadius: '50%',
                                background: 'var(--card)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >

                              <strong
                                style={{
                                  fontSize: 15,
                                  lineHeight: 1,
                                }}
                              >
                                81
                              </strong>

                              <span
                                style={{
                                  fontSize: 7,
                                  color: 'var(--muted)',
                                  marginTop: 3,
                                }}
                              >
                                / 100
                              </span>

                            </div>

                          </div>

                        </div>

                        <div
                          style={{
                            textAlign: 'center',
                            fontSize: 8,
                            fontWeight: 700,
                            color: '#16a34a',
                          }}
                        >
                          Looking good
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =========================
                    FLOATING CARDS
                ========================== */}

                <div
                  style={{
                    ...s.floatingFinanceCard,
                    left: -34,
                    top: '27%',
                  }}
                  className="rowlr-floating-card rowlr-floating-left"
                >

                  <div
                    style={{
                      ...s.floatingIcon,
                      color: '#16a34a',
                      background: 'rgba(22,163,74,0.10)',
                    }}
                  >
                    <TrendingUp size={15} />
                  </div>

                  <div>

                    <div style={s.floatingLabel}>
                      Monthly income
                    </div>

                    <div style={s.floatingValue}>
                      +₱42,800
                    </div>

                  </div>

                </div>

                <div
                  style={{
                    ...s.floatingFinanceCard,
                    right: -30,
                    bottom: '21%',
                  }}
                  className="rowlr-floating-card rowlr-floating-right"
                >

                  <div
                    style={{
                      ...s.floatingIcon,
                      color: '#ea580c',
                      background: 'rgba(234,88,12,0.10)',
                    }}
                  >
                    <Wallet size={15} />
                  </div>

                  <div>

                    <div style={s.floatingLabel}>
                      Spending
                    </div>

                    <div style={s.floatingValue}>
                      ₱18,600
                    </div>

                  </div>

                </div>

              </div>
            </Reveal>

          </section>

          {/* =========================
              FEATURES
          ========================== */}

          <section
            id="features"
            style={{
              ...s.container,
              ...s.section,
            }}
            className="rowlr-container"
          >

            <Reveal>
              <div style={s.sectionHeader}>

                <div style={s.eyebrow}>
                  <BarChart3 size={13} />
                  Powerful, without the complexity
                </div>

                <h2 style={s.sectionTitle}>
                  Everything you need
                  <br />
                  to manage your money.
                </h2>

                <p style={s.sectionText}>
                  Rowlr brings your everyday finances,
                  planning tools, and financial insights
                  together in one place.
                </p>

              </div>
            </Reveal>

            <div
              style={s.cardsGrid}
              className="rowlr-cards-grid"
            >

              <Reveal>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.featureIcon}>
                    <Wallet size={16} />
                  </div>

                  <div style={s.featureTitle}>
                    Wallets
                  </div>

                  <div style={s.featureText}>
                    Keep track of your money across
                    multiple wallets and accounts
                    in one place.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.featureIcon}>
                    <TrendingUp size={16} />
                  </div>

                  <div style={s.featureTitle}>
                    Income & Expenses
                  </div>

                  <div style={s.featureText}>
                    Record your income and expenses
                    so you always know where your
                    money is going.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.featureIcon}>
                    <Target size={16} />
                  </div>

                  <div style={s.featureTitle}>
                    Budgets & Goals
                  </div>

                  <div style={s.featureText}>
                    Set spending limits and work toward
                    your savings and financial goals.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.featureIcon}>
                    <CalendarDays size={16} />
                  </div>

                  <div style={s.featureTitle}>
                    Bills & Planning
                  </div>

                  <div style={s.featureText}>
                    Keep upcoming bills and planned
                    expenses visible before they
                    become surprises.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.featureIcon}>
                    <BarChart3 size={16} />
                  </div>

                  <div style={s.featureTitle}>
                    Analytics
                  </div>

                  <div style={s.featureText}>
                    Understand your spending patterns
                    through clear financial analytics
                    and trends.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={240}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.featureIcon}>
                    <ShieldCheck size={16} />
                  </div>

                  <div style={s.featureTitle}>
                    Financial Insights
                  </div>

                  <div style={s.featureText}>
                    Get a clearer picture of your financial
                    activity and make more informed
                    decisions.
                  </div>
                </div>
              </Reveal>

            </div>

          </section>

          {/* =========================
              OVERVIEW
          ========================== */}

          <section
            id="overview"
            style={{
              ...s.container,
              ...s.section,
            }}
            className="rowlr-container"
          >

            <Reveal>
              <div style={s.sectionHeader}>

                <div style={s.eyebrow}>
                  <Check size={13} />
                  A clearer financial picture
                </div>

                <h2 style={s.sectionTitle}>
                  Your finances,
                  <br />
                  connected.
                </h2>

                <p style={s.sectionText}>
                  Rowlr isn't just about recording
                  transactions. It's about helping you
                  see the bigger picture.
                </p>

              </div>
            </Reveal>

            <div
              style={s.cardsGrid}
              className="rowlr-cards-grid"
            >

              <Reveal>
                <div
                  style={s.largeFeatureCard}
                  className="rowlr-hover"
                >
                  <div
                    style={{
                      ...s.featureIcon,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <Wallet size={18} />
                  </div>

                  <div
                    style={{
                      ...s.featureTitle,
                      fontSize: 14,
                      marginTop: 18,
                    }}
                  >
                    Track
                  </div>

                  <div
                    style={{
                      ...s.featureText,
                      fontSize: 12,
                      marginTop: 7,
                    }}
                  >
                    Know what you have, what you've earned,
                    and where your money is going.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div
                  style={s.largeFeatureCard}
                  className="rowlr-hover"
                >
                  <div
                    style={{
                      ...s.featureIcon,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <CalendarDays size={18} />
                  </div>

                  <div
                    style={{
                      ...s.featureTitle,
                      fontSize: 14,
                      marginTop: 18,
                    }}
                  >
                    Plan
                  </div>

                  <div
                    style={{
                      ...s.featureText,
                      fontSize: 12,
                      marginTop: 7,
                    }}
                  >
                    Prepare for bills, upcoming expenses,
                    budgets, and long-term goals.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div
                  style={s.largeFeatureCard}
                  className="rowlr-hover"
                >
                  <div
                    style={{
                      ...s.featureIcon,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <BarChart3 size={18} />
                  </div>

                  <div
                    style={{
                      ...s.featureTitle,
                      fontSize: 14,
                      marginTop: 18,
                    }}
                  >
                    Understand
                  </div>

                  <div
                    style={{
                      ...s.featureText,
                      fontSize: 12,
                      marginTop: 7,
                    }}
                  >
                    Turn your financial activity into
                    insights that are easier to understand
                    and act on.
                  </div>
                </div>
              </Reveal>

            </div>

          </section>

          {/* =========================
              HOW IT WORKS
          ========================== */}

          <section
            id="how-it-works"
            style={{
              ...s.container,
              ...s.section,
            }}
            className="rowlr-container"
          >

            <Reveal>
              <div style={s.sectionHeader}>

                <div style={s.eyebrow}>
                  <ArrowRight size={13} />
                  Simple by design
                </div>

                <h2 style={s.sectionTitle}>
                  Start with your money.
                  <br />
                  Take control from there.
                </h2>

                <p style={s.sectionText}>
                  Getting started with Rowlr takes
                  just a few simple steps.
                </p>

              </div>
            </Reveal>

            <div
              style={s.cardsGrid}
              className="rowlr-cards-grid"
            >

              <Reveal>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.number}>
                    01
                  </div>

                  <div
                    style={{
                      ...s.featureTitle,
                      fontSize: 14,
                      marginTop: 18,
                    }}
                  >
                    Add your finances
                  </div>

                  <div
                    style={{
                      ...s.featureText,
                      fontSize: 12,
                      marginTop: 7,
                    }}
                  >
                    Add your wallets, income, expenses,
                    bills, and other financial information.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.number}>
                    02
                  </div>

                  <div
                    style={{
                      ...s.featureTitle,
                      fontSize: 14,
                      marginTop: 18,
                    }}
                  >
                    Plan ahead
                  </div>

                  <div
                    style={{
                      ...s.featureText,
                      fontSize: 12,
                      marginTop: 7,
                    }}
                  >
                    Create budgets, plan upcoming expenses,
                    and set goals for the future.
                  </div>
                </div>
              </Reveal>

              <Reveal delay={240}>
                <div
                  style={s.featureCard}
                  className="rowlr-hover"
                >
                  <div style={s.number}>
                    03
                  </div>

                  <div
                    style={{
                      ...s.featureTitle,
                      fontSize: 14,
                      marginTop: 18,
                    }}
                  >
                    Understand
                  </div>

                  <div
                    style={{
                      ...s.featureText,
                      fontSize: 12,
                      marginTop: 7,
                    }}
                  >
                    Use analytics and insights to understand
                    your financial habits and make better
                    decisions.
                  </div>
                </div>
              </Reveal>

            </div>

          </section>

          {/* =========================
              FINAL CTA
          ========================== */}

          <section
            style={{
              ...s.container,
              paddingBottom: 120,
            }}
            className="rowlr-container"
          >

            <Reveal>
              <div
                style={s.finalCta}
                className="rowlr-final-cta"
              >

                <div style={s.eyebrow}>
                  <ShieldCheck size={13} />
                  Start with Rowlr
                </div>

                <h2 style={s.sectionTitle}>
                  Ready to make your money
                  <br />
                  clearer?
                </h2>

                <p style={s.sectionText}>
                  Create your Rowlr account and start
                  building a clearer picture of your finances.
                </p>

                <div style={{ marginTop: 28 }}>

                  <button
                    onClick={onGetStarted}
                    className="rowlr-button"
                    style={s.primaryButton}
                  >
                    Get started
                    <ArrowRight size={15} />
                  </button>

                </div>

              </div>
            </Reveal>

          </section>

        </main>

        {/* =========================
            FOOTER
        ========================== */}

        <footer style={s.footer}>

          <div
            style={s.container}
            className="rowlr-container"
          >

            <div
              style={s.footerInner}
              className="rowlr-footer-inner"
            >

              <div style={s.footerText}>
                © 2026 RRC Development
              </div>

              <div style={s.footerText}>
                Rowlr Personal Finance
              </div>

            </div>

          </div>

        </footer>

      </div>
    </>
  )
}