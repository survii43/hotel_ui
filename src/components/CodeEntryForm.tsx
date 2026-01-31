import { QrCode } from 'lucide-react';
import './CodeEntryForm.css';

export interface CodeEntryFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  loadingButtonText?: string;
}

/**
 * Shared code-entry UI (hero + input + error + button).
 * Used by Scan and OrderEntry to avoid duplication.
 */
export default function CodeEntryForm({
  value,
  onChange,
  onSubmit,
  loading,
  error,
  title,
  subtitle,
  placeholder,
  buttonText,
  loadingButtonText = 'Loading...',
}: CodeEntryFormProps) {
  return (
    <div className="code-entry-page">
      <div className="code-entry-hero">
        <div className="code-entry-icon-wrap">
          <QrCode size={48} strokeWidth={1.5} />
        </div>
        <h2 className="code-entry-title">{title}</h2>
        <p className="code-entry-sub">{subtitle}</p>
      </div>
      <form className="code-entry-form" onSubmit={onSubmit}>
        <input
          type="text"
          className="input code-entry-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          autoFocus
        />
        {error && <p className="code-entry-error">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary code-entry-btn"
          disabled={loading}
        >
          {loading ? loadingButtonText : buttonText}
        </button>
      </form>
    </div>
  );
}
