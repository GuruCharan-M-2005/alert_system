const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function Privacy() {
  return (
    <div className="privacy-container">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <div className="nav-logo-mark"><BellIcon /></div>
            <span className="nav-title">Alertify</span>
          </div>
          <a href="/" className="btn-logout" style={{ textDecoration: 'none' }}>← Back</a>
        </div>
      </header>

      <main className="privacy-main">
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-date">Last updated: July 2026</p>

        <section className="privacy-section">
          <h2>Overview</h2>
          <p>
            Alertify is a personal alert and reminder application. We take your privacy seriously
            and are committed to being transparent about how your data is handled.
          </p>
        </section>

        <section className="privacy-section">
          <h2>What We Collect</h2>
          <p>
            When you sign in with Google, we access your basic profile information (name, email,
            and profile photo) and your Google Tasks, solely to create and manage your alerts.
            We do not collect any other personal data.
          </p>
        </section>

        <section className="privacy-section">
          <h2>How Your Data Is Stored</h2>
          <p>
            Your alerts are saved securely in Firebase Firestore and are bound exclusively to
            your Google account. Only you can access your alerts — no other user or third party
            can view your data.
          </p>
          <p>
            Alert reminders are created as tasks in your own Google Tasks account. This data
            lives in your Google account and is governed by Google's privacy policy.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Google Tasks Access</h2>
          <p>
            Alertify requests access to your Google Tasks to create, update, and delete reminders
            on your behalf. We only access the "Alertify" task list we create — we do not read,
            modify, or delete any other tasks in your Google account.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Data Sharing</h2>
          <p>
            We do not sell, share, or disclose your personal data to any third parties.
            Your information is used solely to provide the Alertify service to you.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Data Deletion</h2>
          <p>
            You can delete your alerts at any time within the app. To remove all your data,
            contact us and we will delete your account and associated data within 7 days.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Contact</h2>
          <p>
            If you have any questions about this privacy policy, please reach out at{' '}
            <a href="mailto:gurumrd005@gmail.com" className="privacy-link">gurumrd005@gmail.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
