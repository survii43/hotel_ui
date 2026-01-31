import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { scanBarcode } from '../api/client';
import AppBar from '../components/AppBar';
import './Scan.css';

/**
 * Landing page for /order?code=TABLE_xxx.
 * Reads table code from URL, resolves via scan API, then navigates to menu.
 * If no code or scan fails, shows manual code entry.
 */
export default function OrderEntry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useApp();
  const codeFromUrl = searchParams.get('code')?.trim() || null;

  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(!!codeFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(!codeFromUrl);
  const resolvedFromUrl = useRef(false);

  const resolveCode = useCallback(
    async (code: string) => {
      setError(null);
      setLoading(true);
      try {
        const data = await scanBarcode(code);
        dispatch({ type: 'SET_QR', payload: data });
        navigate('/menu', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error'));
        setShowManual(true);
        setManualCode(code);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate, t]
  );

  // Resolve code from URL on mount (once)
  useEffect(() => {
    if (!codeFromUrl || resolvedFromUrl.current) return;
    resolvedFromUrl.current = true;
    resolveCode(codeFromUrl);
  }, [codeFromUrl, resolveCode]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = manualCode.trim();
    if (!trimmed) {
      setError(t('scan.noOutlet'));
      return;
    }
    resolveCode(trimmed);
  }

  return (
    <>
      <AppBar title={t('app.name')} showNotifications={false} />
      <main className="main-content">
        <div className="container scan-page">
          {loading ? (
            <div className="scan-hero">
              <p className="scan-sub">{t('common.loading')}</p>
            </div>
          ) : (
            <>
              <div className="scan-hero">
                <div className="scan-icon-wrap">
                  <QrCode size={48} strokeWidth={1.5} />
                </div>
                <h2>
                  {showManual && !codeFromUrl
                    ? t('orderEntry.manualTitle')
                    : t('scan.title')}
                </h2>
                <p className="scan-sub">
                  {showManual && !codeFromUrl
                    ? t('orderEntry.manualHint')
                    : t('scan.placeholder')}
                </p>
              </div>
              <form className="scan-form" onSubmit={handleManualSubmit}>
                <input
                  type="text"
                  className="input scan-input"
                  placeholder={t('scan.placeholder')}
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  autoFocus
                />
                {error && <p className="scan-error">{error}</p>}
                <button
                  type="submit"
                  className="btn btn-primary scan-btn"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('scan.scanBtn')}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}
