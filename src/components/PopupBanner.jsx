import { useState, useEffect } from 'react';

export default function PopupBanner() {
  const [blocked, setBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('popup_banner_dismissed') === 'true'
  );

  useEffect(() => {
    // Test if popups are blocked by trying to open a tiny blank window
    const test = window.open('', '_blank', 'width=1,height=1');
    if (!test || test.closed || typeof test.closed === 'undefined') {
      setBlocked(true);
    } else {
      test.close();
      setBlocked(false);
    }
  }, []);

  if (!blocked || dismissed) return null;

  function dismiss() {
    localStorage.setItem('popup_banner_dismissed', 'true');
    setDismissed(true);
  }

  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <div className="popup-banner">
      <div className="popup-banner-inner">
        <span className="popup-banner-icon">🚫</span>
        <div className="popup-banner-text">
          <p className="popup-banner-title">Popups are blocked</p>
          <p className="popup-banner-sub">
            {isAndroid
              ? 'Tap the lock icon in the address bar → Site settings → Pop-ups and redirects → Allow'
              : 'Click the lock icon in address bar → Site settings → Pop-ups and redirects → Allow'}
          </p>
        </div>
        <button className="popup-banner-close" onClick={dismiss}>✕</button>
      </div>
    </div>
  );
}
