import { useState } from 'react';

export default function ChromeBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('install_banner_dismissed') === 'true'
  );

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem('install_banner_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div className="chrome-banner">
      <div className="chrome-banner-inner">
        <div className="chrome-banner-left">
          <span className="chrome-banner-icon">📲</span>
          <div>
            <p className="chrome-banner-title">Get notified on all your devices</p>
            <p className="chrome-banner-sub">
              Install <strong>Google Tasks</strong> on your phone, sign in with the same Google account, and enable notifications — that's it! Works on Android, Windows, Mac, and especially iOS. 🍎
            </p>
          </div>
        </div>
        <button className="chrome-banner-close" onClick={dismiss}>Got it</button>
      </div>
    </div>
  );
}
