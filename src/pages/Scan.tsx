import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveCode } from '../hooks/useResolveCode';
import CodeEntryForm from '../components/CodeEntryForm';
import AppBar from '../components/AppBar';

export default function Scan() {
  const { t } = useTranslation();
  const [codeValue, setCodeValue] = useState('');
  const { resolveCode, loading, error, setError } = useResolveCode({
    initialCode: null,
    errorMessage: t('common.error'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = codeValue.trim();
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
          <CodeEntryForm
            value={codeValue}
            onChange={setCodeValue}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            title={t('scan.title')}
            subtitle={t('scan.placeholder')}
            placeholder={t('scan.placeholder')}
            buttonText={t('scan.scanBtn')}
            loadingButtonText={t('common.loading')}
          />
        </div>
      </main>
    </>
  );
}
