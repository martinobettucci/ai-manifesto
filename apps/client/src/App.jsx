import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { api } from './lib/api.js';
import { SUPPORTED_LOCALES } from './locales.js';
import {
  MANIFESTO_COMMITMENTS,
  MANIFESTO_ENGAGEMENT_LINES,
  MANIFESTO_ENGAGEMENT_TITLE,
  MANIFESTO_POSITION_LINES,
  MANIFESTO_POSITION_TITLE,
  MANIFESTO_REQUIRED_CHECKS,
  MANIFESTO_TITLE,
  REFLECTION_BODY_LINES,
  REFLECTION_SUBHEADINGS,
  REFLECTION_TITLE,
} from './manifestoText.js';

const REQUIRED_MANIFESTO_CHECKS = MANIFESTO_REQUIRED_CHECKS;

function createInitialForm(locale = 'fr') {
  return {
    fullName: '',
    email: '',
    profession: '',
    department: '',
    diffusionAccepted: false,
    privacyAccepted: false,
    manifestoChecks: Array.from({ length: REQUIRED_MANIFESTO_CHECKS }, () => false),
    locale,
  };
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatSignedDate(date, locale) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const [directory, setDirectory] = useState({ total: 0, signers: [] });
  const [directoryState, setDirectoryState] = useState('loading');
  const [form, setForm] = useState(() => createInitialForm());
  const [submitState, setSubmitState] = useState({ type: 'idle', message: '' });
  const [verifyState, setVerifyState] = useState({ status: 'idle', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [busy, setBusy] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);

  const locale = i18n.resolvedLanguage ?? 'fr';
  const promisePoints = t('promise.points', { returnObjects: true });
  const motiveItems = t('motives.items', { returnObjects: true });
  const localizedPromisePoints = Array.isArray(promisePoints) ? promisePoints : [];
  const localizedMotiveItems = Array.isArray(motiveItems) ? motiveItems : [];
  const allManifestoChecked = form.manifestoChecks.every((value) => value === true);
  const checkedManifestoCount = form.manifestoChecks.filter(Boolean).length;
  const progressPercent = Math.round((checkedManifestoCount / REQUIRED_MANIFESTO_CHECKS) * 100);
  const totalSigners = new Intl.NumberFormat(locale).format(directory.total);
  const totalLocales = new Intl.NumberFormat(locale).format(SUPPORTED_LOCALES.length);

  const sectionLinks = [
    { id: 'reflection', label: t('sections.whyTitle') },
    { id: 'charter', label: t('sections.charterTitle') },
    { id: 'signature', label: t('sections.signatureTitle') },
    { id: 'directory', label: t('sections.directoryTitle') },
  ];

  useEffect(() => {
    document.title = t('meta.siteTitle');
  }, [t, locale]);

  useEffect(() => {
    setForm((current) => ({ ...current, locale }));
  }, [locale]);

  useEffect(() => {
    void loadDirectory();
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('verify');

    if (token) {
      void verifyToken(token);
    }
  }, []);

  async function loadDirectory() {
    setDirectoryState('loading');

    try {
      const data = await api.getDirectory();

      startTransition(() => {
        setDirectory(data);
        setDirectoryState('ready');
      });
    } catch (error) {
      setDirectoryState('error');
    }
  }

  async function verifyToken(token) {
    setVerifyState({ status: 'loading', message: t('verification.loading') });

    try {
      const data = await api.verifyToken(token);

      startTransition(() => {
        setVerifyState({
          status: 'success',
          message: data.signer?.publicDisplayName ?? '',
        });
      });

      window.history.replaceState({}, '', window.location.pathname);
      await loadDirectory();
    } catch (error) {
      setVerifyState({ status: 'error', message: error.code ?? 'INVALID_TOKEN' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!allManifestoChecked) {
      setSubmitState({ type: 'invalid', message: 'VALIDATION_ERROR' });
      return;
    }

    setBusy(true);
    setSubmitState({ type: 'idle', message: '' });

    try {
      const payload = {
        ...form,
        department: form.department.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        profession: form.profession.trim(),
      };

      const response = await api.registerSigner(payload);
      setLastSubmittedEmail(payload.email);
      setSubmitState({ type: 'success', message: response.status });
      setForm((current) => createInitialForm(current.locale));
    } catch (error) {
      const nextType =
        error.code === 'ALREADY_VERIFIED'
          ? 'verified'
          : error.code === 'VALIDATION_ERROR'
            ? 'invalid'
            : 'error';

      setSubmitState({ type: nextType, message: error.code ?? 'REQUEST_FAILED' });
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    const email = form.email.trim() || lastSubmittedEmail;

    if (!email) {
      setSubmitState({ type: 'invalid', message: 'EMAIL_REQUIRED' });
      return;
    }

    setBusy(true);

    try {
      const response = await api.resendVerification(email);
      setLastSubmittedEmail(email);
      const type = response.status === 'already_verified' ? 'verified' : 'success';
      setSubmitState({ type, message: response.status });
    } catch (error) {
      setSubmitState({ type: 'error', message: error.code ?? 'REQUEST_FAILED' });
    } finally {
      setBusy(false);
    }
  }

  const filteredSigners = (() => {
    const query = deferredSearchTerm.trim().toLowerCase();

    if (!query) {
      return directory.signers;
    }

    return directory.signers.filter((signer) =>
      [signer.publicDisplayName, signer.profession, signer.department]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  })();

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateManifestoCheck(index, value) {
    setForm((current) => {
      const nextChecks = [...current.manifestoChecks];
      nextChecks[index] = value;

      return {
        ...current,
        manifestoChecks: nextChecks,
      };
    });
  }

  function renderSubmitMessage() {
    if (submitState.type === 'success') {
      return <p className="form-note success">{t('form.success')}</p>;
    }

    if (submitState.type === 'verified') {
      return <p className="form-note success">{t('form.alreadyVerified')}</p>;
    }

    if (submitState.type === 'invalid') {
      return <p className="form-note warning">{t('form.invalid')}</p>;
    }

    if (submitState.type === 'error') {
      return <p className="form-note warning">{t('form.genericError')}</p>;
    }

    return null;
  }

  return (
    <div className="page-shell">
      <div className="page-grain" aria-hidden="true" />

      <a href="#main-content" className="skip-link">
        {t('meta.skipLink', { defaultValue: 'Skip to content' })}
      </a>

      <header className="topbar">
        <span className="brand-title">{t('meta.siteTitle')}</span>

        <nav className="section-links">
          {sectionLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className="nav-link"
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <span className="live-pill">
            <span className="live-dot" aria-hidden="true" />
            {totalSigners} {t('meta.liveCount')}
          </span>

          <label className="language-switcher">
            <select
              value={locale}
              aria-label={t('meta.languageLabel')}
              onChange={(event) => {
                startTransition(() => {
                  void i18n.changeLanguage(event.target.value);
                });
              }}
            >
              {SUPPORTED_LOCALES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.nativeName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main id="main-content">
        <section className="hero">
          <div className="hero-inner">
            <p className="hero-eyebrow">{t('hero.eyebrow')}</p>
            <h1 className="hero-title">{t('hero.title')}</h1>
            <p className="hero-lead">{t('hero.lead')}</p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => scrollToSection('charter')}
              >
                {t('hero.primaryCta')}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => scrollToSection('reflection')}
              >
                {t('hero.secondaryCta')}
              </button>
            </div>

            <div className="hero-proof">
              <span className="proof-stat">
                <strong>{totalSigners}</strong> {t('directory.countLabel')}
              </span>
              <span className="proof-divider" aria-hidden="true" />
              <span className="proof-stat">
                <strong>{totalLocales}</strong> {t('meta.languageLabel')}
              </span>
            </div>
          </div>
        </section>

        {verifyState.status !== 'idle' && (
          <section className="verification-strip">
            <div className={`verification-card ${verifyState.status}`} role="status">
              {verifyState.status === 'loading' && <p>{t('verification.loading')}</p>}
              {verifyState.status === 'success' && (
                <>
                  <h2>{t('verification.successTitle')}</h2>
                  <p>{t('verification.successBody')}</p>
                  {verifyState.message && (
                    <p className="verification-name">{verifyState.message}</p>
                  )}
                </>
              )}
              {verifyState.status === 'error' && (
                <>
                  <h2>{t('verification.invalidTitle')}</h2>
                  <p>{t('verification.invalidBody')}</p>
                </>
              )}
            </div>
          </section>
        )}

        <section id="reflection" className="section">
          <div className="section-header">
            <h2 className="section-title">{t('sections.whyTitle')}</h2>
            <p className="section-intro">{t('sections.whyIntro')}</p>
          </div>

          <div className="motive-grid">
            {localizedMotiveItems.map((item, index) => (
              <article key={item.title} className="motive-card" style={{ '--i': index }}>
                <h3 className="motive-heading">{item.title}</h3>
                <p className="motive-body">{item.body}</p>
              </article>
            ))}
          </div>

          <article className="reflection-block">
            <button
              type="button"
              className="reflection-toggle"
              aria-expanded={reflectionOpen}
              onClick={() => setReflectionOpen((open) => !open)}
            >
              <span className="reflection-toggle-title">{REFLECTION_TITLE}</span>
              <span className="reflection-toggle-hint">
                {reflectionOpen ? '−' : '+'}
              </span>
            </button>

            {reflectionOpen && (
              <div className="reflection-body">
                {REFLECTION_BODY_LINES.map((line, index) => {
                  if (REFLECTION_SUBHEADINGS.has(line)) {
                    return (
                      <h4 key={`${line}-${index}`} className="reflection-subheading">
                        {line}
                      </h4>
                    );
                  }

                  return (
                    <p key={`${line}-${index}`} className="reflection-line">
                      {line}
                    </p>
                  );
                })}
              </div>
            )}
          </article>
        </section>

        <section id="charter" className="section">
          <div className="section-header">
            <h2 className="section-title">{t('sections.charterTitle')}</h2>
            <p className="section-intro">{t('sections.charterIntro')}</p>
          </div>

          <div className="charter-progress">
            <div className="progress-label">
              <span className="progress-count">{checkedManifestoCount}</span>
              <span className="progress-total">/{REQUIRED_MANIFESTO_CHECKS}</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={MANIFESTO_TITLE}
              aria-valuemin={0}
              aria-valuemax={REQUIRED_MANIFESTO_CHECKS}
              aria-valuenow={checkedManifestoCount}
            >
              <span
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="charter-list">
            {MANIFESTO_COMMITMENTS.map((item, index) => (
              <label
                key={item.recognize}
                className="charter-item"
                data-checked={form.manifestoChecks[index] ? 'true' : 'false'}
              >
                <span className="charter-index">{String(index + 1).padStart(2, '0')}</span>
                <input
                  type="checkbox"
                  className="charter-toggle"
                  checked={form.manifestoChecks[index]}
                  onChange={(event) => updateManifestoCheck(index, event.target.checked)}
                />
                <span className="charter-content">
                  <span className="charter-recognize">{item.recognize}</span>
                  <span className="charter-act">{item.act}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="charter-declarations">
            <article className="declaration-block">
              <h3 className="declaration-title">{MANIFESTO_POSITION_TITLE}</h3>
              {MANIFESTO_POSITION_LINES.map((line, index) => (
                <p key={`${line}-${index}`} className="declaration-line">
                  {line}
                </p>
              ))}
            </article>

            <article className="declaration-block declaration-final">
              <h3 className="declaration-title">{MANIFESTO_ENGAGEMENT_TITLE}</h3>
              {MANIFESTO_ENGAGEMENT_LINES.map((line, index) => (
                <p key={`${line}-${index}`} className="declaration-line">
                  {line}
                </p>
              ))}
            </article>
          </div>

          <div className="charter-cta">
            <button
              type="button"
              className="btn-primary btn-large"
              onClick={() => scrollToSection('signature')}
            >
              {t('hero.primaryCta')}
            </button>
          </div>
        </section>

        <section id="signature" className="section">
          <div className="signature-layout">
            <div className="signature-preamble">
              <div className="section-header">
                <h2 className="section-title">{t('sections.signatureTitle')}</h2>
                <p className="section-intro">{t('sections.signatureIntro')}</p>
              </div>

              <div className="promise-block">
                <h3 className="promise-title">{t('sections.promiseTitle')}</h3>
                <p className="promise-intro">{t('sections.promiseIntro')}</p>
                <ul className="promise-list">
                  {localizedPromisePoints.map((point) => (
                    <li key={point} className="promise-item">{point}</li>
                  ))}
                </ul>
              </div>

              <div className="publication-block">
                <p className="publication-label">{t('publication.exampleLabel')}</p>
                <p className="publication-example">{t('publication.example')}</p>
                <p className="publication-note">{t('sections.publicationIntro')}</p>
              </div>
            </div>

            <form className="signature-form" onSubmit={handleSubmit} aria-busy={busy}>
              <div className="form-heading">
                <h3>{t('hero.primaryCta')}</h3>
                <p>{t('footer.privacyNote')}</p>
              </div>

              <label>
                <span>{t('form.fullName')}</span>
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  required
                />
              </label>

              <label>
                <span>{t('form.email')}</span>
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  <span>{t('form.profession')}</span>
                  <input
                    type="text"
                    autoComplete="organization-title"
                    maxLength={120}
                    value={form.profession}
                    onChange={(event) => updateField('profession', event.target.value)}
                    required
                  />
                </label>

                <label>
                  <span>{t('form.department')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-describedby="department-hint"
                    maxLength={3}
                    pattern="[0-9]{2,3}"
                    value={form.department}
                    onChange={(event) => updateField('department', event.target.value)}
                    required
                  />
                  <small id="department-hint">{t('form.departmentHint')}</small>
                </label>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.diffusionAccepted}
                  onChange={(event) => updateField('diffusionAccepted', event.target.checked)}
                />
                <span>{t('form.diffusionLabel')}</span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={(event) => updateField('privacyAccepted', event.target.checked)}
                />
                <span>{t('form.privacyLabel')}</span>
              </label>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={busy}>
                  {t('form.submit')}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={handleResend}
                >
                  {t('form.resend')}
                </button>
              </div>

              <div aria-live="polite">{renderSubmitMessage()}</div>

              <a
                href="https://p2enjoy.studio/privacy/politique-confidentialite"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {t('footer.privacyCta')}
              </a>
            </form>
          </div>
        </section>

        <section id="directory" className="section">
          <div className="section-header">
            <h2 className="section-title">{t('sections.directoryTitle')}</h2>
            <p className="section-intro">{t('sections.directoryIntro')}</p>
          </div>

          <div className="directory-frame">
            <div className="directory-toolbar">
              <p className="directory-total">
                {totalSigners} {t('directory.countLabel')}
              </p>

              <label className="directory-search">
                <span className="sr-only">{t('form.searchLabel')}</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('form.searchPlaceholder')}
                />
              </label>
            </div>

            {directoryState === 'loading' && (
              <p className="status-text" role="status">
                {t('directory.loading')}
              </p>
            )}
            {directoryState === 'error' && (
              <p className="status-text warning" role="status">
                {t('form.genericError')}
              </p>
            )}
            {directoryState === 'ready' && filteredSigners.length === 0 && (
              <p className="status-text" role="status">
                {t('directory.empty')}
              </p>
            )}

            <div className="directory-grid" aria-busy={directoryState === 'loading'}>
              {filteredSigners.map((signer) => (
                <article key={signer.id} className="signer-card">
                  <div className="signer-header">
                    <p className="signer-name">{signer.publicDisplayName}</p>
                    <span className="signer-chip">{signer.department}</span>
                  </div>
                  <p className="signer-role">{signer.profession}</p>
                  <p className="signer-date">{formatSignedDate(signer.verifiedAt, locale)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-title">{t('meta.siteTitle')}</p>
        <a
          href="https://p2enjoy.studio/privacy/politique-confidentialite"
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          {t('footer.privacyCta')}
        </a>
      </footer>
    </div>
  );
}

export default App;
