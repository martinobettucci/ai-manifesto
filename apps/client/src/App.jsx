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

  const locale = i18n.resolvedLanguage ?? 'fr';
  const promisePoints = t('promise.points', { returnObjects: true });
  const freedomVow = Array.isArray(promisePoints)
    ? String(promisePoints[promisePoints.length - 1] ?? '')
    : '';
  const allManifestoChecked = form.manifestoChecks.every((value) => value === true);

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
      <div className="page-noise" aria-hidden="true" />
      <a href="#main-content" className="skip-link">
        {t('meta.skipLink', { defaultValue: 'Skip to content' })}
      </a>

      <header className="topbar">
        <div className="topbar-copy">
          <span className="eyebrow">{t('hero.eyebrow')}</span>
          <span className="live-pill">
            {new Intl.NumberFormat(locale).format(directory.total)} {t('meta.liveCount')}
          </span>
        </div>

        <label className="language-switcher">
          <span>{t('meta.languageLabel')}</span>
          <select
            value={locale}
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
      </header>

      <main id="main-content">
        <section className="hero section frame">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="section-label">{t('hero.eyebrow')}</p>
              <h1>{t('hero.title')}</h1>
              <p className="hero-lead">{t('hero.lead')}</p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => scrollToSection('signature')}
                >
                  {t('hero.primaryCta')}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => scrollToSection('charter')}
                >
                  {t('hero.secondaryCta')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {verifyState.status !== 'idle' && (
          <section className="section verification-strip">
            <div className={`verification-card ${verifyState.status}`} role="status">
              {verifyState.status === 'loading' && <p>{t('verification.loading')}</p>}
              {verifyState.status === 'success' && (
                <>
                  <h2>{t('verification.successTitle')}</h2>
                  <p>{t('verification.successBody')}</p>
                  {verifyState.message && (
                    <p className="verification-public-name">{verifyState.message}</p>
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

        <section className="section">
          <div className="section-heading">
            <p className="section-label">{REFLECTION_TITLE}</p>
            <h2>{REFLECTION_TITLE}</h2>
          </div>

          <article className="longform-card">
            {REFLECTION_BODY_LINES.map((line, index) => {
              if (REFLECTION_SUBHEADINGS.has(line)) {
                return (
                  <h3 key={`${line}-${index}`} className="longform-subheading">
                    {line}
                  </h3>
                );
              }

              return (
                <p key={`${line}-${index}`} className="longform-line">
                  {line}
                </p>
              );
            })}
          </article>
        </section>

        <section id="charter" className="section frame">
          <div className="section-heading">
            <p className="section-label">{MANIFESTO_TITLE}</p>
            <h2>{MANIFESTO_TITLE}</h2>
          </div>

          <article className="longform-card manifesto-card">
            {MANIFESTO_COMMITMENTS.map((item, index) => (
              <label
                key={item.recognize}
                className="manifesto-item"
                data-checked={form.manifestoChecks[index] ? 'true' : 'false'}
              >
                <input
                  type="checkbox"
                  className="manifesto-item-toggle"
                  checked={form.manifestoChecks[index]}
                  onChange={(event) => updateManifestoCheck(index, event.target.checked)}
                />
                <span className="manifesto-item-content">
                  <span className="manifesto-recognize">{item.recognize}</span>
                  <span className="manifesto-act">{item.act}</span>
                </span>
              </label>
            ))}

            <h3 className="longform-subheading">{MANIFESTO_POSITION_TITLE}</h3>
            {MANIFESTO_POSITION_LINES.map((line, index) => (
              <p key={`${line}-${index}`} className="longform-line">
                {line}
              </p>
            ))}

            <h3 className="longform-subheading">{MANIFESTO_ENGAGEMENT_TITLE}</h3>
            {MANIFESTO_ENGAGEMENT_LINES.map((line, index) => (
              <p key={`${line}-${index}`} className="longform-line">
                {line}
              </p>
            ))}
          </article>
        </section>

        <section id="signature" className="section signature-layout">
          <div className="signature-copy">
            <div className="section-heading">
              <p className="section-label">{t('sections.signatureTitle')}</p>
              <h2>{t('sections.signatureTitle')}</h2>
              <p>{t('sections.signatureIntro')}</p>
            </div>

            <div className="publication-card">
              <p className="publication-label">{t('publication.exampleLabel')}</p>
              <p className="publication-example">{t('publication.example')}</p>
              <p>{t('sections.publicationIntro')}</p>
              {freedomVow && <p className="manifesto-vow">{freedomVow}</p>}
              <a
                href="https://p2enjoy.studio/privacy/politique-confidentialite"
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {t('footer.privacyCta')}
              </a>
            </div>
          </div>

          <form className="signature-form" onSubmit={handleSubmit} aria-busy={busy}>
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
              <button type="submit" className="primary-button" disabled={busy}>
                {t('form.submit')}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={busy}
                onClick={handleResend}
              >
                {t('form.resend')}
              </button>
            </div>

            <div aria-live="polite">{renderSubmitMessage()}</div>
          </form>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="section-label">{t('sections.directoryTitle')}</p>
            <h2>{t('sections.directoryTitle')}</h2>
            <p>{t('sections.directoryIntro')}</p>
          </div>

          <div className="directory-toolbar">
            <p className="directory-total">
              {new Intl.NumberFormat(locale).format(directory.total)} {t('directory.countLabel')}
            </p>
            <label className="directory-search">
              <span>{t('form.searchLabel')}</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('form.searchPlaceholder')}
              />
            </label>
          </div>

          {directoryState === 'loading' && <p role="status">{t('directory.loading')}</p>}
          {directoryState === 'error' && <p role="status">{t('form.genericError')}</p>}
          {directoryState === 'ready' && filteredSigners.length === 0 && (
            <p role="status">{t('directory.empty')}</p>
          )}

          <div className="directory-grid" aria-busy={directoryState === 'loading'}>
            {filteredSigners.map((signer) => (
              <article key={signer.id} className="signer-card">
                <p className="signer-name">{signer.publicDisplayName}</p>
                <p className="signer-date">{formatSignedDate(signer.verifiedAt, locale)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>{t('footer.privacyNote')}</p>
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
