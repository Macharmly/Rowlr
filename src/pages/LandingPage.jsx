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
    overflow: 'hidden',
  },

  container: {
    width: '100%',
    maxWidth: 1180,
    margin: '0 auto',
    padding: '0 24px',
    boxSizing: 'border-box',
  },

  nav: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: 'var(--text)',
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
  },

  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
    gridTemplateColumns: '1.4fr 1fr 1fr',
    gap: 12,
  },

  statCard: {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
  },

  statLabel: {
    fontSize: 10,
    color: 'var(--text-subtle)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },

  statValue: {
    marginTop: 7,
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },

  statChange: {
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    color: 'var(--text-muted)',
  },

  chartCard: {
    marginTop: 12,
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
  },

  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  chartTitle: {
    fontSize: 12,
    fontWeight: 600,
  },

  chartSubtle: {
    fontSize: 10,
    color: 'var(--text-subtle)',
  },

  chart: {
    height: 150,
    marginTop: 18,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    padding: '0 8px',
  },

  bar: {
    flex: 1,
    backgroundColor: 'var(--text)',
    opacity: 0.12,
    borderRadius: '5px 5px 2px 2px',
  },

  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginTop: 12,
  },

  featureCard: {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 16,
  },

  featureIcon: {
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

  featureTitle: {
    fontSize: 11,
    fontWeight: 600,
    marginTop: 12,
  },

  featureText: {
    fontSize: 10,
    color: 'var(--text-subtle)',
    lineHeight: 1.5,
    marginTop: 4,
  },

  bottomSection: {
    maxWidth: 700,
    margin: '100px auto 80px',
    textAlign: 'center',
  },

  bottomTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 'clamp(34px, 5vw, 48px)',
    lineHeight: 1,
    letterSpacing: '-1.8px',
    fontWeight: 800,
  },

  bottomText: {
    maxWidth: 500,
    margin: '18px auto 0',
    color: 'var(--text-muted)',
    fontSize: 14,
    lineHeight: 1.6,
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
}

export default function LandingPage({
  dark,
  setDark,
  onGetStarted,
  onSignIn,
}) {
  return (
    <div style={s.page}>

      {/* Navbar */}
      <header>
        <div style={{ ...s.container, ...s.nav }}>

          <div style={s.logo}>
            <div style={s.logoMark}>
              <Wallet size={17} color="var(--bg)" />
            </div>

            <span style={s.logoText}>Rowlr</span>
          </div>

          <nav style={s.navLinks}>
            <a href="#features" style={s.navLink}>
              Features
            </a>

            <a href="#overview" style={s.navLink}>
              Overview
            </a>

            <a href="#how-it-works" style={s.navLink}>
              How it works
            </a>
          </nav>

          <div style={s.navActions}>

            <button
              onClick={() => setDark(!dark)}
              style={s.themeButton}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={onSignIn}
              style={s.signIn}
            >
              Sign in
            </button>

            <button
              onClick={onGetStarted}
              style={s.getStartedSmall}
            >
              Get started
            </button>

          </div>
        </div>
      </header>

      {/* Hero */}
      <main>

        <section style={{ ...s.container, ...s.hero }}>

          <div style={s.eyebrow}>
            <ShieldCheck size={13} />
            Simple finance management
          </div>

          <h1 style={s.heroTitle}>
            Your money,
            <br />
            <span style={s.heroAccent}>made clearer.</span>
          </h1>

          <p style={s.heroDescription}>
            Rowlr brings your spending, budgets, goals, and
            financial insights together in one simple place.
          </p>

          <div style={s.heroActions}>

            <button
              onClick={onGetStarted}
              style={s.primaryButton}
            >
              Get started
              <ArrowRight size={15} />
            </button>

            <button
              onClick={onSignIn}
              style={s.secondaryButton}
            >
              Sign in
            </button>

          </div>

          {/* Dashboard Preview */}
          <div style={s.previewWrapper}>

            <div style={s.previewGlow} />

            <div style={s.dashboard}>

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

              <div style={s.dashboardBody}>

                <div style={s.dashboardGrid}>

                  <div style={s.statCard}>
                    <div style={s.statLabel}>
                      Total balance
                    </div>

                    <div style={s.statValue}>
                      ₱125,430
                    </div>

                    <div style={s.statChange}>
                      <TrendingUp size={11} />
                      8.4% from last month
                    </div>
                  </div>

                  <div style={s.statCard}>
                    <div style={s.statLabel}>
                      Income
                    </div>

                    <div style={s.statValue}>
                      ₱45,000
                    </div>

                    <div style={s.statChange}>
                      This month
                    </div>
                  </div>

                  <div style={s.statCard}>
                    <div style={s.statLabel}>
                      Expenses
                    </div>

                    <div style={s.statValue}>
                      ₱18,450
                    </div>

                    <div style={s.statChange}>
                      This month
                    </div>
                  </div>

                </div>

                <div style={s.chartCard}>

                  <div style={s.chartHeader}>
                    <div style={s.chartTitle}>
                      Spending overview
                    </div>

                    <div style={s.chartSubtle}>
                      Last 6 months
                    </div>
                  </div>

                  <div style={s.chart}>
                    <div style={{ ...s.bar, height: '35%' }} />
                    <div style={{ ...s.bar, height: '50%' }} />
                    <div style={{ ...s.bar, height: '42%' }} />
                    <div style={{ ...s.bar, height: '68%' }} />
                    <div style={{ ...s.bar, height: '55%' }} />
                    <div style={{ ...s.bar, height: '78%' }} />
                    <div style={{ ...s.bar, height: '62%' }} />
                    <div style={{ ...s.bar, height: '45%' }} />
                    <div style={{ ...s.bar, height: '72%' }} />
                    <div style={{ ...s.bar, height: '58%' }} />
                    <div style={{ ...s.bar, height: '82%' }} />
                    <div style={{ ...s.bar, height: '65%' }} />
                  </div>

                </div>

                <div id="features" style={s.features}>

                  <div style={s.featureCard}>
                    <div style={s.featureIcon}>
                      <Wallet size={15} />
                    </div>

                    <div style={s.featureTitle}>
                      Wallets
                    </div>

                    <div style={s.featureText}>
                      Keep track of your money across your accounts.
                    </div>
                  </div>

                  <div style={s.featureCard}>
                    <div style={s.featureIcon}>
                      <BarChart3 size={15} />
                    </div>

                    <div style={s.featureTitle}>
                      Analytics
                    </div>

                    <div style={s.featureText}>
                      Understand where your money goes.
                    </div>
                  </div>

                  <div style={s.featureCard}>
                    <div style={s.featureIcon}>
                      <Target size={15} />
                    </div>

                    <div style={s.featureTitle}>
                      Goals
                    </div>

                    <div style={s.featureText}>
                      Plan toward the things that matter.
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Overview */}
        <section
          id="overview"
          style={{
            ...s.container,
            ...s.bottomSection,
          }}
        >

          <div style={s.eyebrow}>
            <Check size={13} />
            Built for everyday finances
          </div>

          <h2 style={s.bottomTitle}>
            Everything you need
            <br />
            to understand your money.
          </h2>

          <p style={s.bottomText}>
            From everyday expenses to long-term goals,
            Rowlr gives you a clearer view of your financial
            life without making things complicated.
          </p>

        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          style={{
            ...s.container,
            paddingBottom: 100,
          }}
        >

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >

            <div style={s.featureCard}>
              <div style={s.featureIcon}>
                <Wallet size={15} />
              </div>

              <div style={s.featureTitle}>
                01 — Add your finances
              </div>

              <div style={s.featureText}>
                Organize your wallets, income, expenses,
                and financial accounts.
              </div>
            </div>

            <div style={s.featureCard}>
              <div style={s.featureIcon}>
                <CalendarDays size={15} />
              </div>

              <div style={s.featureTitle}>
                02 — Plan ahead
              </div>

              <div style={s.featureText}>
                Manage budgets, bills, planned expenses,
                and financial goals.
              </div>
            </div>

            <div style={s.featureCard}>
              <div style={s.featureIcon}>
                <BarChart3 size={15} />
              </div>

              <div style={s.featureTitle}>
                03 — Understand
              </div>

              <div style={s.featureText}>
                Use analytics and insights to understand
                your financial habits.
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={{ ...s.container, ...s.footerInner }}>

          <div style={s.footerText}>
            © 2026 RRC Development
          </div>

          <div style={s.footerText}>
            Rowlr Personal Finance
          </div>

        </div>
      </footer>

    </div>
  )
}