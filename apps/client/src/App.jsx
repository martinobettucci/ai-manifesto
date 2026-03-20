import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { api } from './lib/api.js';
import { SUPPORTED_LOCALES } from './locales.js';
import {
  getCountryOptions,
  normalizeCountryCode,
  resolveDefaultCountryCode,
} from './countries.js';
import {
  DEFAULT_MANIFESTO,
  DEFAULT_REFLECTION,
  EN_REFLECTION,
  getReflectionContent,
} from './manifestoText.js';
import {
  getReflectionForLocale,
  hasReflectionForLocale,
} from './reflectionLocales.js';
import {
  getLocalizedCelebration,
  getLocalizedManifestoContent,
} from './manifestoLocales.js';

const THEME_STORAGE_KEY = 'manifesto-theme';
const VISITOR_STATE_STORAGE_KEY = 'manifesto-visitor-state-v1';

function getPreferredTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getThemeCopy(t, theme) {
  return {
    currentLabel: theme === 'dark' ? t('theme.dark') : t('theme.light'),
    actionLabel: theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark'),
  };
}

function createInitialForm(
  locale = 'fr',
  requiredChecks = DEFAULT_MANIFESTO.commitments.length,
) {
  return {
    fullName: '',
    email: '',
    profession: '',
    department: '',
    country: resolveDefaultCountryCode(),
    aiProfessionalAccepted: false,
    professionalWebsite: '',
    diffusionAccepted: false,
    privacyAccepted: false,
    manifestoChecks: Array.from({ length: requiredChecks }, () => false),
    locale,
  };
}

function createInitialVisitorSubmission() {
  return {
    status: 'idle',
    verificationCode: '',
    signerId: null,
    signerPosition: null,
    publicDisplayName: '',
  };
}

function createVisitorBootstrap() {
  const requiredChecks = DEFAULT_MANIFESTO.commitments.length;
  const fallback = {
    form: createInitialForm('fr', requiredChecks),
    submission: createInitialVisitorSubmission(),
    hasPersistedState: false,
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawState = window.localStorage.getItem(VISITOR_STATE_STORAGE_KEY);

  if (!rawState) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawState);
    const rawForm = parsed?.form ?? {};
    const rawSubmission = parsed?.submission ?? {};

    const nextForm = {
      fullName: typeof rawForm.fullName === 'string' ? rawForm.fullName : '',
      email: typeof rawForm.email === 'string' ? rawForm.email : '',
      profession: typeof rawForm.profession === 'string' ? rawForm.profession : '',
      department: typeof rawForm.department === 'string' ? rawForm.department : '',
      country: normalizeCountryCode(
        rawForm.country ?? rawForm.nation ?? rawForm.countryCode ?? rawForm.nationCode,
      ),
      aiProfessionalAccepted: rawForm.aiProfessionalAccepted === true,
      professionalWebsite:
        typeof rawForm.professionalWebsite === 'string' ? rawForm.professionalWebsite : '',
      diffusionAccepted: rawForm.diffusionAccepted === true,
      privacyAccepted: rawForm.privacyAccepted === true,
      manifestoChecks: Array.isArray(rawForm.manifestoChecks)
        ? rawForm.manifestoChecks.map((value) => value === true)
        : Array.from({ length: requiredChecks }, () => false),
      locale: typeof rawForm.locale === 'string' ? rawForm.locale : 'fr',
    };

    const verificationCode =
      typeof rawSubmission.verificationCode === 'string'
        ? rawSubmission.verificationCode
        : '';

    const status =
      (rawSubmission.status === 'pending' || rawSubmission.status === 'verified') &&
      verificationCode
        ? rawSubmission.status
        : 'idle';

    const nextSubmission = {
      status,
      verificationCode,
      signerId: Number.isInteger(rawSubmission.signerId) ? rawSubmission.signerId : null,
      signerPosition: Number.isInteger(rawSubmission.signerPosition)
        ? rawSubmission.signerPosition
        : null,
      publicDisplayName:
        typeof rawSubmission.publicDisplayName === 'string'
          ? rawSubmission.publicDisplayName
          : '',
    };

    return {
      form: nextForm,
      submission: nextSubmission,
      hasPersistedState: true,
    };
  } catch {
    return fallback;
  }
}

function createSubmissionFromStatus(statusPayload, verificationCode) {
  const signer = statusPayload?.signer ?? {};

  if (statusPayload?.status === 'verified') {
    return {
      status: 'verified',
      verificationCode,
      signerId: Number.isInteger(signer.id) ? signer.id : null,
      signerPosition: Number.isInteger(signer.position) ? signer.position : null,
      publicDisplayName:
        typeof signer.publicDisplayName === 'string' ? signer.publicDisplayName : '',
    };
  }

  if (statusPayload?.status === 'pending') {
    return {
      status: 'pending',
      verificationCode,
      signerId: Number.isInteger(signer.id) ? signer.id : null,
      signerPosition: null,
      publicDisplayName:
        typeof signer.publicDisplayName === 'string' ? signer.publicDisplayName : '',
    };
  }

  return createInitialVisitorSubmission();
}

function renderInlineMarkdown(text, keyPrefix) {
  if (typeof text !== 'string' || text.length === 0) {
    return text;
  }

  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    return <span key={key}>{part}</span>;
  });
}

function removeMarkdownMarkers(text) {
  return typeof text === 'string' ? text.replace(/\*\*|\*/g, '') : '';
}

function getLanguageCode(locale) {
  return locale?.split('-')[0] ?? 'fr';
}

function getProgressTone(completionRatio) {
  const hue = Math.round(6 + completionRatio * 128);
  const hueEnd = Math.min(hue + 18, 144);
  const glow = `hsla(${hue} 85% 55% / 0.42)`;
  const shellGlow = `hsla(${hue} 70% 45% / 0.14)`;

  return {
    '--progress-hue': `${hue}`,
    '--progress-hue-end': `${hueEnd}`,
    '--progress-glow': glow,
    '--progress-shell-glow': shellGlow,
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

function stripDepartmentFromDisplayName(publicDisplayName, department) {
  const safeDisplayName =
    typeof publicDisplayName === 'string' ? publicDisplayName.trim() : '';
  const safeDepartment = typeof department === 'string' ? department.trim() : '';

  if (!safeDisplayName || !safeDepartment) {
    return safeDisplayName;
  }

  const suffix = ` - ${safeDepartment}`;

  return safeDisplayName.endsWith(suffix)
    ? safeDisplayName.slice(0, -suffix.length)
    : safeDisplayName;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripProfessionFromDisplayName(publicDisplayName, profession) {
  const safeDisplayName =
    typeof publicDisplayName === 'string' ? publicDisplayName.trim() : '';
  const safeProfession = typeof profession === 'string' ? profession.trim() : '';

  if (!safeDisplayName || !safeProfession) {
    return safeDisplayName;
  }

  const professionSuffixPattern = new RegExp(
    `\\s*\\(${escapeRegExp(safeProfession)}\\)\\s*$`,
  );

  return safeDisplayName.replace(professionSuffixPattern, '').trim();
}

function createReflectionFallbackContent({ locale, title, intro, motives }) {
  if (locale === 'fr') {
    return DEFAULT_REFLECTION;
  }

  if (locale === 'en') {
    return EN_REFLECTION;
  }

  const safeTitle = typeof title === 'string' && title.trim() ? title.trim() : DEFAULT_REFLECTION.title;
  const safeIntro = typeof intro === 'string' && intro.trim() ? intro.trim() : '';
  const safeMotives = Array.isArray(motives)
    ? motives.filter(
        (item) =>
          typeof item?.title === 'string' &&
          item.title.trim() &&
          typeof item?.body === 'string' &&
          item.body.trim(),
      )
    : [];

  const bodyLines = [
    ...(safeIntro ? [safeIntro] : []),
    ...safeMotives.flatMap((item) => [item.title.trim(), item.body.trim()]),
  ];

  return {
    title: safeTitle,
    subheadings: safeMotives.map((item) => item.title.trim()),
    bodyLines,
  };
}

function App() {
  const { t, i18n } = useTranslation();
  const [bootstrap] = useState(() => createVisitorBootstrap());
  const [directory, setDirectory] = useState({ total: 0, signers: [] });
  const [directoryState, setDirectoryState] = useState('loading');
  const [form, setForm] = useState(() => bootstrap.form);
  const [visitorSubmission, setVisitorSubmission] = useState(() => bootstrap.submission);
  const [submitState, setSubmitState] = useState({ type: 'idle', message: '' });
  const [verifyState, setVerifyState] = useState({ status: 'idle', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [countrySearch, setCountrySearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [theme, setTheme] = useState(() => getPreferredTheme());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const pendingReminderModalRef = useRef(null);
  const initialCountryRef = useRef(bootstrap.form.country);
  const countryPrefillAttemptedRef = useRef(
    bootstrap.hasPersistedState && Boolean(bootstrap.form.country),
  );

  const locale = i18n.resolvedLanguage ?? 'fr';
  const language = getLanguageCode(locale);
  const themeCopy = getThemeCopy(t, theme);
  const countryOptions = useMemo(() => getCountryOptions(locale), [locale]);
  const filteredCountryOptions = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();

    if (!query) {
      return countryOptions;
    }

    return countryOptions.filter((option) => {
      const label = option.label.toLowerCase();
      return label.includes(query) || option.code.toLowerCase().includes(query);
    });
  }, [countryOptions, countrySearch]);
  const promisePoints = t('promise.points', { returnObjects: true });
  const motiveItems = t('motives.items', { returnObjects: true });
  const charterItems = t('charter.items', { returnObjects: true });
  const localizedMotiveItems = Array.isArray(motiveItems) ? motiveItems : [];
  const reflectionFallback = hasReflectionForLocale(language)
    ? getReflectionForLocale(language)
    : createReflectionFallbackContent({
        locale: language,
        title: t('reflection.title'),
        intro: t('sections.whyIntro'),
        motives: localizedMotiveItems,
      });
  const reflectionContent = getReflectionContent(null, reflectionFallback);
  const manifestoContent = getLocalizedManifestoContent(locale, charterItems);
  const requiredManifestoChecks = manifestoContent.requiredChecks;
  const localizedPromisePoints = Array.isArray(promisePoints) ? promisePoints : [];
  const allManifestoChecked =
    form.manifestoChecks.length === requiredManifestoChecks &&
    form.manifestoChecks.every((value) => value === true);
  const showManifestoReminder =
    form.diffusionAccepted && form.privacyAccepted && !allManifestoChecked;
  const checkedManifestoCount = form.manifestoChecks.filter(Boolean).length;
  const progressPercent =
    requiredManifestoChecks > 0
      ? Math.round((checkedManifestoCount / requiredManifestoChecks) * 100)
      : 0;
  const completionRatio =
    requiredManifestoChecks > 0 ? checkedManifestoCount / requiredManifestoChecks : 0;
  const progressTone = getProgressTone(completionRatio);
  const celebration = getLocalizedCelebration(locale);
  const totalSigners = new Intl.NumberFormat(locale).format(directory.total);
  const totalLocales = new Intl.NumberFormat(locale).format(SUPPORTED_LOCALES.length);
  const hasSubmitted =
    visitorSubmission.status === 'pending' || visitorSubmission.status === 'verified';
  const showPendingReminderModal = visitorSubmission.status === 'pending';
  const previousAllManifestoCheckedRef = useRef(allManifestoChecked);

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
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setForm((current) => ({ ...current, locale }));
  }, [locale]);

  useEffect(() => {
    if (countryPrefillAttemptedRef.current) {
      return;
    }

    countryPrefillAttemptedRef.current = true;
    let cancelled = false;

    const applyFallbackCountry = () => {
      const fallbackCountry = resolveDefaultCountryCode();
      if (!fallbackCountry || cancelled) {
        return;
      }

      setForm((current) => {
        const canAutoFill = !current.country || current.country === initialCountryRef.current;
        if (!canAutoFill || current.country === fallbackCountry) {
          return current;
        }

        return {
          ...current,
          country: fallbackCountry,
        };
      });
    };

    const resolveVisitorCountry = async () => {
      try {
        const data = await api.getVisitorCountry();
        const detectedCountry = normalizeCountryCode(data?.countryCode);

        if (!detectedCountry || cancelled) {
          applyFallbackCountry();
          return;
        }

        setForm((current) => {
          const canAutoFill = !current.country || current.country === initialCountryRef.current;
          if (!canAutoFill || current.country === detectedCountry) {
            return current;
          }

          return {
            ...current,
            country: detectedCountry,
          };
        });
      } catch {
        applyFallbackCountry();
      }
    };

    void resolveVisitorCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      VISITOR_STATE_STORAGE_KEY,
      JSON.stringify({
        form,
        submission: visitorSubmission,
      }),
    );
  }, [form, visitorSubmission]);

  useEffect(() => {
    const wasFullyChecked = previousAllManifestoCheckedRef.current;
    previousAllManifestoCheckedRef.current = allManifestoChecked;

    if (hasSubmitted) {
      setShowCelebration(false);
      return;
    }

    const justCompletedAllChecks = !wasFullyChecked && allManifestoChecked;

    if (!justCompletedAllChecks) {
      if (!allManifestoChecked) {
        setShowCelebration(false);
      }
      return;
    }

    setShowCelebration(true);
    setCelebrationKey((current) => current + 1);

    const timeoutId = window.setTimeout(() => {
      setShowCelebration(false);
    }, 3600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [allManifestoChecked, hasSubmitted]);

  useEffect(() => {
    if (!showPendingReminderModal) {
      return;
    }

    pendingReminderModalRef.current?.focus();
  }, [showPendingReminderModal]);

  useEffect(() => {
    if (!showPendingReminderModal || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showPendingReminderModal]);

  useEffect(() => {
    setForm((current) => {
      if (current.manifestoChecks.length === requiredManifestoChecks) {
        return current;
      }

      return {
        ...current,
        manifestoChecks: Array.from({ length: requiredManifestoChecks }, (_, index) =>
          current.manifestoChecks[index] ?? false,
        ),
      };
    });
  }, [requiredManifestoChecks]);

  useEffect(() => {
    void loadDirectory();
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('verify');

    if (token) {
      void verifyToken(token);
    }
  }, []);

  useEffect(() => {
    if (!visitorSubmission.verificationCode) {
      return;
    }

    void refreshSubmissionStatus(visitorSubmission.verificationCode);
  }, [visitorSubmission.verificationCode]);

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

  async function refreshSubmissionStatus(verificationCode) {
    try {
      const data = await api.getVerificationStatus(verificationCode);
      const nextSubmission = createSubmissionFromStatus(data, verificationCode);
      setVisitorSubmission(nextSubmission);

      if (nextSubmission.status === 'verified') {
        setSearchTerm('');
        await loadDirectory();
      }
    } catch (error) {
      if (error.code === 'INVALID_TOKEN' || error.code === 'VALIDATION_ERROR') {
        setVisitorSubmission(createInitialVisitorSubmission());
      }
    }
  }

  async function verifyToken(token) {
    setVerifyState({ status: 'loading', message: t('verification.loading') });

    try {
      const data = await api.verifyToken(token);
      const nextSubmission = createSubmissionFromStatus(data, token);
      setVisitorSubmission(nextSubmission);

      startTransition(() => {
        setVerifyState({
          status: 'success',
          message: stripDepartmentFromDisplayName(
            data.signer?.publicDisplayName ?? '',
            form.department,
          ),
        });
      });

      setSearchTerm('');
      window.history.replaceState({}, '', window.location.pathname);
      await loadDirectory();
    } catch (error) {
      setVerifyState({ status: 'error', message: error.code ?? 'INVALID_TOKEN' });
      if (token === visitorSubmission.verificationCode) {
        setVisitorSubmission(createInitialVisitorSubmission());
      }
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
        aiProfessionalAccepted: form.aiProfessionalAccepted,
        department: form.department.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        professionalWebsite: form.professionalWebsite.trim(),
        profession: form.profession.trim(),
      };

      const response = await api.registerSigner(payload);
      const verificationCode =
        typeof response.verificationCode === 'string' ? response.verificationCode : '';

      setVisitorSubmission({
        status: 'pending',
        verificationCode,
        signerId: null,
        signerPosition: null,
        publicDisplayName:
          typeof response.signer?.publicDisplayName === 'string'
            ? response.signer.publicDisplayName
            : '',
      });
      setSubmitState({ type: 'success', message: response.status });
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

  const filteredSigners = (() => {
    const query = deferredSearchTerm.trim().toLowerCase();

    if (!query) {
      return directory.signers;
    }

    return directory.signers.filter((signer) =>
      [
        signer.publicDisplayName,
        signer.profession,
        signer.department,
        signer.professionalWebsite,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  })();

  const highlightedSignerId =
    visitorSubmission.status === 'verified' ? visitorSubmission.signerId : null;

  const highlightedSignerPosition = (() => {
    if (!highlightedSignerId) {
      return Number.isInteger(visitorSubmission.signerPosition)
        ? visitorSubmission.signerPosition
        : null;
    }

    const index = directory.signers.findIndex((signer) => signer.id === highlightedSignerId);

    if (index >= 0) {
      return index + 1;
    }

    return Number.isInteger(visitorSubmission.signerPosition)
      ? visitorSubmission.signerPosition
      : null;
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
      if (showManifestoReminder) {
        return null;
      }

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

      {showPendingReminderModal && (
        <div className="pending-reminder-overlay">
          <section
            ref={pendingReminderModalRef}
            className="pending-reminder-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-reminder-title"
            aria-describedby="pending-reminder-body pending-reminder-email pending-reminder-proof"
            tabIndex={-1}
          >
            <p className="pending-reminder-badge">{t('visitorState.pendingBadge')}</p>
            <h2 id="pending-reminder-title">{t('visitorState.pendingTitle')}</h2>
            <p id="pending-reminder-body">{t('visitorState.pendingBody')}</p>
            {form.email && (
              <div className="pending-reminder-email" id="pending-reminder-email">
                <span className="pending-reminder-email-label">{t('form.email')}</span>
                <strong>{form.email}</strong>
              </div>
            )}
            <p className="pending-reminder-proof" id="pending-reminder-proof">
              {t('visitorState.pendingProof')}
            </p>
          </section>
        </div>
      )}

      <a href="#main-content" className="skip-link">
        {t('meta.skipLink')}
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

          <button
            type="button"
            className="theme-toggle"
            aria-label={themeCopy.actionLabel}
            title={themeCopy.actionLabel}
            aria-pressed={theme === 'light'}
            onClick={() => {
              setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
            }}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === 'dark' ? '☾' : '☀'}
            </span>
            <span className="theme-toggle-label">{themeCopy.currentLabel}</span>
          </button>

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
        {visitorSubmission.status === 'verified' && (
          <section className="welcome-strip" role="status" aria-live="polite">
            <div className="welcome-card success">
              <p className="welcome-badge">{t('visitorState.verifiedBadge')}</p>
              <h2>{t('visitorState.verifiedTitle')}</h2>
              <p>{t('visitorState.verifiedBody')}</p>
              <p className="welcome-position">
                {highlightedSignerPosition
                  ? t('visitorState.verifiedPosition', {
                      position: new Intl.NumberFormat(locale).format(
                        highlightedSignerPosition,
                      ),
                    })
                  : t('visitorState.verifiedPositionUnknown')}
              </p>
            </div>
          </section>
        )}

        {visitorSubmission.status === 'pending' && (
          <section className="welcome-strip" role="status" aria-live="polite">
            <div className="welcome-card pending">
              <p className="welcome-badge">{t('visitorState.pendingBadge')}</p>
              <h2>{t('visitorState.pendingTitle')}</h2>
              <p>{t('visitorState.pendingBody')}</p>
              <p className="welcome-proof">{t('visitorState.pendingProof')}</p>
            </div>
          </section>
        )}

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

        {showCelebration && (
          <div className="celebration-overlay" aria-live="polite">
            <div
              key={celebrationKey}
              className="celebration-modal"
              role="status"
              aria-label={celebration.title}
            >
              <div className="celebration-emoticons" aria-hidden="true">
                {celebration.emoticons.map((emoticon, index) => (
                  <span
                    key={`${emoticon}-${index}`}
                    className="celebration-emoticon"
                    style={{ '--i': index }}
                  >
                    {emoticon}
                  </span>
                ))}
              </div>
              <p className="celebration-eyebrow">{celebration.eyebrow}</p>
              <h2 className="celebration-title">{celebration.title}</h2>
              <p className="celebration-body">{celebration.body}</p>
            </div>
          </div>
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
              <span className="reflection-toggle-title">{reflectionContent.title}</span>
              <span className="reflection-toggle-hint">
                {reflectionOpen ? '−' : '+'}
              </span>
            </button>

            {reflectionOpen && (
              <div className="reflection-body">
                {reflectionContent.bodyLines.map((line, index) => {
                  if (reflectionContent.subheadings.has(removeMarkdownMarkers(line))) {
                    return (
                      <h4 key={`${line}-${index}`} className="reflection-subheading">
                        {renderInlineMarkdown(line, `reflection-heading-${index}`)}
                      </h4>
                    );
                  }

                  return (
                    <p key={`${line}-${index}`} className="reflection-line">
                      {renderInlineMarkdown(line, `reflection-line-${index}`)}
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

          <div
            className="charter-progress"
            data-complete={allManifestoChecked ? 'true' : 'false'}
            style={progressTone}
          >
            <div className="progress-label">
              <span className="progress-count">{checkedManifestoCount}</span>
              <span className="progress-total">/{requiredManifestoChecks}</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={t('meta.siteTitle')}
              aria-valuemin={0}
              aria-valuemax={requiredManifestoChecks}
              aria-valuenow={checkedManifestoCount}
            >
              <span
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="charter-list">
            {manifestoContent.commitments.map((item, index) => (
              <label
                key={item.recognize}
                className="charter-item"
                data-checked={form.manifestoChecks[index] ? 'true' : 'false'}
              >
                <span className="charter-index">{String(index + 1).padStart(2, '0')}</span>
                <input
                  type="checkbox"
                  className="charter-toggle"
                  checked={form.manifestoChecks[index] ?? false}
                  onChange={(event) => updateManifestoCheck(index, event.target.checked)}
                />
                <span className="charter-content">
                  <span className="charter-recognize">
                    {renderInlineMarkdown(item.recognize, `manifesto-recognize-${index}`)}
                  </span>
                  <span className="charter-act">
                    {renderInlineMarkdown(item.act, `manifesto-act-${index}`)}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <div className="charter-declarations">
            <article className="declaration-block">
              <h3 className="declaration-title">{manifestoContent.positionTitle}</h3>
              {manifestoContent.positionLines.map((line, index) => (
                <p key={`${line}-${index}`} className="declaration-line">
                  {renderInlineMarkdown(line, `manifesto-position-${index}`)}
                </p>
              ))}
            </article>

            <article className="declaration-block declaration-final">
              <h3 className="declaration-title">{manifestoContent.engagementTitle}</h3>
              {manifestoContent.engagementLines.map((line, index) => (
                <p key={`${line}-${index}`} className="declaration-line">
                  {renderInlineMarkdown(line, `manifesto-engagement-${index}`)}
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

            {hasSubmitted ? (
              <article className="signature-lock" role="status" aria-live="polite">
                <p className="signature-lock-badge">
                  {visitorSubmission.status === 'verified'
                    ? t('visitorState.verifiedBadge')
                    : t('visitorState.pendingBadge')}
                </p>
                <h3>
                  {visitorSubmission.status === 'verified'
                    ? t('visitorState.formLockedVerified')
                    : t('visitorState.formLockedPending')}
                </h3>
                <p>
                  {visitorSubmission.status === 'verified'
                    ? highlightedSignerPosition
                      ? t('visitorState.verifiedPosition', {
                          position: new Intl.NumberFormat(locale).format(
                            highlightedSignerPosition,
                          ),
                        })
                      : t('visitorState.verifiedPositionUnknown')
                    : t('visitorState.pendingProof')}
                </p>
              </article>
            ) : (
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
                      inputMode="text"
                      autoComplete="off"
                      aria-describedby="department-hint"
                      maxLength={3}
                      pattern="(?:[0-9]{2,3}|2[AaBb])"
                      title="Format attendu: 2 chiffres, 3 chiffres, 2A ou 2B."
                      value={form.department}
                      onChange={(event) => updateField('department', event.target.value.toUpperCase())}
                      required
                    />
                    <small id="department-hint">{t('form.departmentHint')}</small>
                  </label>
                </div>

                <label>
                  <span>{t('form.country')}</span>
                  <div className="country-combobox">
                    <input
                      type="search"
                      value={countrySearch}
                      onChange={(event) => setCountrySearch(event.target.value)}
                      placeholder={t('form.countrySearchPlaceholder')}
                      autoComplete="off"
                    />
                    <select
                      value={form.country}
                      onChange={(event) =>
                        updateField('country', normalizeCountryCode(event.target.value))
                      }
                      required
                    >
                      <option value="">{t('form.countrySelectPlaceholder')}</option>
                      {filteredCountryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <small>{t('form.countryHint')}</small>
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.aiProfessionalAccepted}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setForm((current) => ({
                        ...current,
                        aiProfessionalAccepted: checked,
                        professionalWebsite: checked ? current.professionalWebsite : '',
                      }));
                    }}
                  />
                  <span>{t('aiProfessional.declarationLabel')}</span>
                </label>

                {form.aiProfessionalAccepted && (
                  <label>
                    <span>{t('aiProfessional.websiteLabel')}</span>
                    <input
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      maxLength={240}
                      placeholder={t('aiProfessional.websitePlaceholder')}
                      value={form.professionalWebsite}
                      onChange={(event) =>
                        updateField('professionalWebsite', event.target.value)
                      }
                      required
                    />
                    <small>{t('aiProfessional.websiteHint')}</small>
                  </label>
                )}

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

                {showManifestoReminder && (
                  <p className="form-note warning">
                    {t('form.invalidManifestoReminder', {
                      count: requiredManifestoChecks,
                    })}
                  </p>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={busy}>
                    {t('form.submit')}
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
            )}
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
              {filteredSigners.map((signer) => {
                const isCurrentSigner =
                  highlightedSignerId !== null && signer.id === highlightedSignerId;
                const isAiProfessional = signer.aiProfessionalConsent === 1;
                const visibleDisplayName = stripProfessionFromDisplayName(
                  stripDepartmentFromDisplayName(signer.publicDisplayName, signer.department),
                  signer.profession,
                );

                return (
                  <article
                    key={signer.id}
                    className={`signer-card ${isCurrentSigner ? 'is-current-signer' : ''} ${
                      isAiProfessional ? 'is-ai-pro' : ''
                    }`}
                  >
                    <div className="signer-header">
                      <p className="signer-name">{visibleDisplayName}</p>
                      <div className="signer-chips">
                        {isAiProfessional && (
                          <span className="signer-chip signer-chip-pro">
                            {t('aiProfessional.proBadge')}
                          </span>
                        )}
                        <span className="signer-chip">{signer.department}</span>
                      </div>
                    </div>
                    {isCurrentSigner && (
                      <p className="signer-self-tag">{t('visitorState.cardHighlight')}</p>
                    )}
                    {isAiProfessional && signer.professionalWebsite && (
                      <a
                        href={signer.professionalWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="signer-website"
                      >
                        {signer.professionalWebsite}
                      </a>
                    )}
                    <p className="signer-role">{signer.profession}</p>
                    <p className="signer-date">{formatSignedDate(signer.verifiedAt, locale)}</p>
                  </article>
                );
              })}
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
