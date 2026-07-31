const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function Terms() {
  return (
    <div className="privacy-container">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <div className="nav-logo-mark"><BellIcon /></div>
            <span className="nav-title">Alertify</span>
          </div>
          <div className="nav-right">
            <a href="/privacy" className="legal-nav-link">Privacy</a>
            <a href="/" className="btn-logout" style={{ textDecoration: 'none' }}>← Back</a>
          </div>
        </div>
      </header>

      <main className="privacy-main">
        <h1 className="privacy-title">Terms of Service</h1>
        <p className="privacy-date">Last updated: July 2026</p>

        <section className="privacy-section">
          <h2>Acceptance</h2>
          <p>
            By using Alertify, you agree to these terms. If you don't agree, please don't use the app.
          </p>
        </section>

        <section className="privacy-section">
          <h2>What Alertify Does</h2>
          <p>
            Alertify is a personal reminder tool that creates alerts in your Google Tasks account.
            We don't guarantee delivery of notifications — that depends on your device settings,
            Google Tasks app, and network connectivity.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Your Responsibilities</h2>
          <p>
            You are responsible for keeping your Google account secure. Don't share your login
            with others. Use Alertify only for lawful personal purposes.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Google Tasks</h2>
          <p>
            Alertify creates tasks in your Google account on your behalf. By using this app,
            you authorize us to create, edit, and delete tasks in the "Alertify" task list only.
            We do not touch any other data in your Google account.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Availability</h2>
          <p>
            Alertify is provided as-is. We may update, change, or discontinue the service at
            any time without notice. We're not liable for any missed reminders or lost data.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Changes to Terms</h2>
          <p>
            We may update these terms occasionally. Continued use of Alertify means you accept
            the updated terms.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Contact</h2>
          <p>
            Questions? Reach us at{' '}
            <a href="mailto:gurumrd005@gmail.com" className="privacy-link">gurumrd005@gmail.com</a>.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-mark"><BellIcon /></div>
            <span className="footer-name">Alertify</span>
          </div>
          <div className="footer-links">
            <a href="/privacy" className="footer-link">Privacy</a>
            <span className="footer-sep">·</span>
            <a href="/terms" className="footer-link" style={{color: 'var(--text)', fontWeight: 600}}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
