import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { scanBarcode } from '../api/client';
import AppBar from '../components/AppBar';
import './Scan.css';

export default function Scan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (!trimmed) {
      setError(t('scan.noOutlet'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await scanBarcode(trimmed);
      dispatch({ type: 'SET_QR', payload: data });
      navigate('/menu', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppBar title={t('app.name')} showNotifications={false} />
      <main className="main-content">
        <div className="container scan-page">
          <div className="scan-hero">
            <div className="scan-icon-wrap">
              <QrCode size={48} strokeWidth={1.5} />
            </div>
            <h2>{t('scan.title')}</h2>
            <p className="scan-sub">{t('scan.placeholder')}</p>
          </div>
          <form className="scan-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="input scan-input"
              placeholder={t('scan.placeholder')}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {error && <p className="scan-error">{error}</p>}
            <button type="submit" className="btn btn-primary scan-btn" disabled={loading}>
              {loading ? t('common.loading') : t('scan.scanBtn')}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
