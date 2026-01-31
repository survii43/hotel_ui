import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../hooks/useApp';
import { supportedLangs } from '../i18n';
import i18n from '../i18n';
import './AppBar.css';

interface AppBarProps {
  title?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
}

export default function AppBar({
  title,
  showNotifications = true,
  showSettings = true,
}: AppBarProps) {
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { state, markAllNotificationsRead } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node)
        && langRef.current && !langRef.current.contains(e.target as Node)
        && themeRef.current && !themeRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
        setLangOpen(false);
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <header className="app-bar">
      <div className="app-bar-inner">
        <h1 className="app-bar-title">{title ?? state.outlet?.name ?? t('app.name')}</h1>
        <div className="app-bar-actions">
          {showNotifications && (
            <div className="app-bar-dropdown" ref={notifRef}>
              <button
                type="button"
                className="app-bar-icon-btn"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label={t('notifications.title')}
              >
                <Bell size={22} />
                {unreadCount > 0 && <span className="app-bar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="app-bar-popover">
                  <div className="app-bar-popover-header">
                    <span>{t('notifications.title')}</span>
                    {state.notifications.length > 0 && (
                      <button
                        type="button"
                        className="app-bar-popover-link"
                        onClick={() => {
                          markAllNotificationsRead();
                          setNotifOpen(false);
                        }}
                      >
                        {t('notifications.markRead')}
                      </button>
                    )}
                  </div>
                  <div className="app-bar-popover-body">
                    {state.notifications.length === 0 ? (
                      <p className="app-bar-popover-empty">{t('notifications.empty')}</p>
                    ) : (
                      <ul className="app-bar-notif-list">
                        {state.notifications.slice(0, 10).map((n) => (
                          <li key={n.id} className={n.read ? 'read' : ''}>
                            {n.message}
                            {n.orderId && <span className="order-id">#{n.orderId.slice(0, 8)}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {showSettings && (
            <>
              <div className="app-bar-dropdown" ref={langRef}>
                <button
                  type="button"
                  className="app-bar-icon-btn"
                  onClick={() => setLangOpen((o) => !o)}
                  aria-label={t('common.language')}
                >
                  <Globe size={22} />
                </button>
                {langOpen && (
                  <div className="app-bar-popover app-bar-lang-list">
                    {supportedLangs.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        className={i18n.language === l.code ? 'active' : ''}
                        onClick={() => {
                          i18n.changeLanguage(l.code);
                          setLangOpen(false);
                        }}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="app-bar-dropdown" ref={themeRef}>
                <button
                  type="button"
                  className="app-bar-icon-btn"
                  onClick={() => setThemeOpen((o) => !o)}
                  aria-label={t('common.theme')}
                >
                  {resolvedTheme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
                </button>
                {themeOpen && (
                  <div className="app-bar-popover app-bar-theme-list">
                    <button
                      type="button"
                      className={theme === 'light' ? 'active' : ''}
                      onClick={() => { setTheme('light'); setThemeOpen(false); }}
                    >
                      {t('common.theme_light')}
                    </button>
                    <button
                      type="button"
                      className={theme === 'dark' ? 'active' : ''}
                      onClick={() => { setTheme('dark'); setThemeOpen(false); }}
                    >
                      {t('common.theme_dark')}
                    </button>
                    <button
                      type="button"
                      className={theme === 'system' ? 'active' : ''}
                      onClick={() => { setTheme('system'); setThemeOpen(false); }}
                    >
                      {t('common.theme_system')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
