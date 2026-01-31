import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { scanBarcode } from '../api/client';
import { getCachedContext, setCachedContext } from '../utils/scanCache';

const RETRY_DELAY_MS = 1500;
const MAX_ATTEMPTS = 2;

export interface UseResolveCodeOptions {
  /** Code from URL (e.g. ?code=TABLE_xxx). When set, effect will resolve on mount with cache-first + retry. */
  initialCode: string | null;
  /** Called when initialCode resolve failed (after retries). Use to pre-fill manual form. */
  onUrlResolveFail?: (code: string) => void;
  /** Error message when API fails (e.g. from i18n). */
  errorMessage?: string;
}

export interface UseResolveCodeResult {
  /** Resolve a code: cache-first, then API; on success dispatch + navigate to /menu. Returns true on success. */
  resolveCode: (code: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  /** True when initialCode was set and all resolve attempts failed (show manual form). */
  urlResolveFailed: boolean;
}
//
/**
 * Single place for "resolve table/outlet code → menu" flow.
 * Uses localStorage cache first to reduce server load; then API with retry for URL code.
 */
export function useResolveCode(options: UseResolveCodeOptions): UseResolveCodeResult {
  const { initialCode, onUrlResolveFail, errorMessage = 'Something went wrong' } = options;
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(!!initialCode);
  const [error, setError] = useState<string | null>(null);
  const [urlResolveFailed, setUrlResolveFailed] = useState(false);

  const resolveCode = useCallback(
    async (code: string): Promise<boolean> => {
      const trimmed = code.trim();
      if (!trimmed) return false;
      setError(null);
      setLoading(true);
      try {
        const cached = getCachedContext(trimmed);
        if (cached?.qrContext) {
          dispatch({ type: 'SET_QR', payload: cached });
          navigate('/menu', { replace: true });
          return true;
        }
        const data = await scanBarcode(trimmed);
        setCachedContext(trimmed, data);
        dispatch({ type: 'SET_QR', payload: data });
        navigate('/menu', { replace: true });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : errorMessage;
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate, errorMessage]
  );

  const resolveCodeRef = useRef(resolveCode);
  resolveCodeRef.current = resolveCode;

  useEffect(() => {
    const codeToResolve = initialCode?.trim() ?? '';
    if (!codeToResolve) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let attempt = 0;

    async function run() {
      while (attempt < MAX_ATTEMPTS && !cancelled) {
        attempt++;
        const ok = await resolveCodeRef.current(codeToResolve);
        if (cancelled) return;
        if (ok) return;
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          if (cancelled) return;
          setError(null);
          setLoading(true);
        }
      }
      if (!cancelled) {
        setUrlResolveFailed(true);
        onUrlResolveFail?.(codeToResolve);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [initialCode, onUrlResolveFail]);

  return { resolveCode, loading, error, setError, urlResolveFailed };
}
