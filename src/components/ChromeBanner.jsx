import { useState } from 'react';

function isWindowsChrome() {
  const ua = navigator.userAgent;
  return ua.includes('Windows') && ua.includes('Chrome') && !ua.includes('Edg');
}

export default function ChromeBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('chrome_banner_dismissed') === 'true'
  );

  if (dismissed || !isWindowsChrome()) return null;

  function dismiss() {
    localStorage.setItem('chrome_banner_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div className="chrome-banner">
      <div className="chrome-banner-inner">
        <div className="chrome-banner-left">
          <span className="chrome-banner-icon">💡</span>
          <div>
            <p className="chrome-banner-title">Get alerts even when Chrome is closed</p>
            <p className="chrome-banner-sub">
              Chrome Settings → System → turn on{' '}
              <strong>"Continue running background apps when Google Chrome is closed"</strong>
            </p>
          </div>
        </div>
        <button className="chrome-banner-close" onClick={dismiss}>Got it</button>
      </div>
    </div>
  );
}
