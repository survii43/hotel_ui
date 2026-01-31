import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResolveCode } from '../hooks/useResolveCode';
import CodeEntryForm from '../components/CodeEntryForm';
import AppBar from '../components/AppBar';
import '../components/CodeEntryForm.css';

/**
 * Landing page for /order?code=TABLE_xxx.
 * Reads code from URL, resolves via cache then API (with retry); on success navigates to menu.
 * If no code or all attempts fail, shows shared code-entry form.
 */
export default function OrderEntry() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code')?.trim() || null;

  const [manualCode, setManualCode] = useState('');
  const onUrlResolveFail = useCallback((code: string) => setManualCode(code), []);

  const { resolveCode, loading, error, setError, urlResolveFailed } = useResolveCode({
    initialCode: codeFromUrl,
    onUrlResolveFail,
    errorMessage: t('common.error'),
  });

  const showForm = !codeFromUrl || urlResolveFailed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = manualCode.trim();
    if (!trimmed) {
      setError(t('scan.noOutlet'));
      return;
    }
    setError(null);
    resolveCode(trimmed);
  }

  return (
    <>
      <AppBar title={t('app.name')} showNotifications={false} />
      <main className="main-content">
        <div className="container code-entry-wrapper">
          {loading && !showForm ? (
            <div className="code-entry-page">
              <p className="code-entry-sub">{t('common.loading')}</p>
            </div>
          ) : (
            <CodeEntryForm
              value={manualCode}
              onChange={setManualCode}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              title={
                showForm && !codeFromUrl
                  ? t('orderEntry.manualTitle')
                  : t('scan.title')
              }
              subtitle={
                showForm && !codeFromUrl
                  ? t('orderEntry.manualHint')
                  : t('scan.placeholder')
              }
              placeholder={t('scan.placeholder')}
              buttonText={t('scan.scanBtn')}
              loadingButtonText={t('common.loading')}
            />
          )}
        </div>
      </main>
    </>
  );
}
