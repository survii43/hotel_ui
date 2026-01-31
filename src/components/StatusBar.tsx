import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './StatusBar.css';

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: false });
}

export default function StatusBar() {
  const { resolvedTheme } = useTheme();
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`status-bar status-bar--${resolvedTheme}`} role="presentation">
      <span className="status-bar-time">{time}</span>
      <div className="status-bar-right">
        <span className="status-bar-icon status-bar-signal" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="12"><path fill="currentColor" d="M2 18h3v4H2v-4zm5-6h3v10H7V12zm5-6h3v16h-3V6zm5 9h3v7h-3v-7z"/></svg>
        </span>
        <span className="status-bar-icon status-bar-wifi" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="14"><path fill="currentColor" d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.7 2.06 7.3 2.06 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
        </span>
        <span className="status-bar-battery" aria-label="Battery full">
          <span className="status-bar-battery-body">
            <span className="status-bar-battery-level" style={{ width: '100%' }} />
          </span>
        </span>
      </div>
    </div>
  );
}
