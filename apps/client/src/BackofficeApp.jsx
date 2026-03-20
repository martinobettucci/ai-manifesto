import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { api } from './lib/api.js';
import { getCountryOptions } from './countries.js';

const ADMIN_VERIFY_QUERY_PARAM = 'admin_verify';

const SUPPORTED_LOCALES = [
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'et',
  'fi',
  'fr',
  'ga',
  'hr',
  'hu',
  'it',
  'lt',
  'lv',
  'mt',
  'nl',
  'pl',
  'pt',
  'ro',
  'sk',
  'sl',
  'sv',
];

const EMPTY_DATAROOM = {
  total: 0,
  pending: 0,
  verified: 0,
  signers: [],
};

function createInitialSignerForm() {
  return {
    publicDisplayName: '',
    profession: '',
    department: '',
    country: '',
    locale: 'fr',
    status: 'pending',
    aiProfessionalConsent: false,
    professionalWebsite: '',
    diffusionConsent: true,
    privacyConsent: true,
    charterConsent: true,
  };
}

function createSignerFormFromSigner(signer) {
  return {
    publicDisplayName: typeof signer.publicDisplayName === 'string' ? signer.publicDisplayName : '',
    profession: typeof signer.profession === 'string' ? signer.profession : '',
    department: typeof signer.department === 'string' ? signer.department : '',
    country: typeof signer.country === 'string' ? signer.country : '',
    locale: typeof signer.locale === 'string' ? signer.locale : 'fr',
    status: signer.status === 'verified' ? 'verified' : 'pending',
    aiProfessionalConsent: signer.aiProfessionalConsent === 1,
    professionalWebsite:
      typeof signer.professionalWebsite === 'string' ? signer.professionalWebsite : '',
    diffusionConsent: signer.diffusionConsent === 1,
    privacyConsent: signer.privacyConsent === 1,
    charterConsent: signer.charterConsent === 1,
  };
}

function formatDateTime(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return '-';
  }

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function stripAdminVerifyFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(ADMIN_VERIFY_QUERY_PARAM);
  const nextQuery = url.searchParams.toString();
  const nextPath = nextQuery ? `${url.pathname}?${nextQuery}` : url.pathname;
  window.history.replaceState({}, '', nextPath);
}

function formatStatus(status) {
  return status === 'verified' ? 'Vérifié' : status === 'pending' ? 'En attente' : status;
}

function formatBoolean(value) {
  return value === 1 ? 'Oui' : 'Non';
}

function formatValidationDetails(details) {
  if (!details || typeof details !== 'object') {
    return '';
  }

  const entries = Object.entries(details);

  if (entries.length === 0) {
    return '';
  }

  const text = entries
    .map(([field, code]) => `${field}: ${String(code)}`)
    .join(', ');

  return ` (${text})`;
}

function buildSignerPayload(form) {
  return {
    publicDisplayName: form.publicDisplayName.trim(),
    profession: form.profession.trim(),
    department: form.department.trim(),
    country: form.country.trim().toUpperCase(),
    locale: form.locale.trim().toLowerCase(),
    status: form.status,
    aiProfessionalConsent: form.aiProfessionalConsent,
    professionalWebsite: form.professionalWebsite.trim(),
    diffusionConsent: form.diffusionConsent,
    privacyConsent: form.privacyConsent,
    charterConsent: form.charterConsent,
  };
}

function BackofficeApp() {
  const [session, setSession] = useState({
    enabled: true,
    authenticated: false,
    expiresAt: '',
  });
  const [authState, setAuthState] = useState('loading');
  const [authFeedback, setAuthFeedback] = useState({ type: 'idle', message: '' });
  const [requestState, setRequestState] = useState('idle');
  const [dataroom, setDataroom] = useState(EMPTY_DATAROOM);
  const [dataroomState, setDataroomState] = useState('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const countryOptions = useMemo(() => getCountryOptions('fr'), []);

  const [editorMode, setEditorMode] = useState('create');
  const [editingSignerId, setEditingSignerId] = useState(null);
  const [signerForm, setSignerForm] = useState(() => createInitialSignerForm());
  const [mutationState, setMutationState] = useState('idle');
  const [mutationFeedback, setMutationFeedback] = useState({ type: 'idle', message: '' });
  const [activeDeleteId, setActiveDeleteId] = useState(null);

  function resetSignerEditor() {
    setEditorMode('create');
    setEditingSignerId(null);
    setSignerForm(createInitialSignerForm());
  }

  function applySessionExpiredState() {
    setSession((current) => ({
      ...current,
      authenticated: false,
      expiresAt: '',
    }));
    setAuthState('unauthenticated');
    setDataroom(EMPTY_DATAROOM);
    setDataroomState('idle');
    setMutationState('idle');
    setActiveDeleteId(null);
    resetSignerEditor();
    setAuthFeedback({
      type: 'warning',
      message: 'Votre session a expiré. Demandez un nouveau magic link.',
    });
    setMutationFeedback({ type: 'idle', message: '' });
  }

  async function loadSession() {
    const sessionState = await api.getAdminSession();

    setSession({
      enabled: sessionState.enabled !== false,
      authenticated: sessionState.authenticated === true,
      expiresAt: typeof sessionState.expiresAt === 'string' ? sessionState.expiresAt : '',
    });

    return sessionState;
  }

  async function loadDataroom() {
    setDataroomState('loading');

    try {
      const data = await api.getAdminDataroom();
      startTransition(() => {
        setDataroom({
          total: Number.isInteger(data.total) ? data.total : 0,
          pending: Number.isInteger(data.pending) ? data.pending : 0,
          verified: Number.isInteger(data.verified) ? data.verified : 0,
          signers: Array.isArray(data.signers) ? data.signers : [],
        });
        setDataroomState('ready');
      });
      return true;
    } catch (error) {
      if (error.code === 'ADMIN_UNAUTHORIZED') {
        applySessionExpiredState();
        return false;
      }

      setDataroomState('error');
      return false;
    }
  }

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setAuthState('loading');
      setAuthFeedback({ type: 'idle', message: '' });

      const token = new URLSearchParams(window.location.search).get(ADMIN_VERIFY_QUERY_PARAM);

      if (token) {
        try {
          await api.verifyAdminMagicLink(token);
          if (!cancelled) {
            setAuthFeedback({
              type: 'success',
              message: 'Connexion validée. La session backoffice est active.',
            });
          }
        } catch (error) {
          if (!cancelled) {
            setAuthFeedback({
              type: 'error',
              message:
                error.code === 'INVALID_TOKEN'
                  ? 'Le magic link est invalide ou expiré.'
                  : 'Impossible de valider le magic link.',
            });
          }
        } finally {
          stripAdminVerifyFromUrl();
        }
      }

      try {
        const sessionState = await loadSession();

        if (cancelled) {
          return;
        }

        if (sessionState.authenticated === true) {
          setAuthState('authenticated');
          const loaded = await loadDataroom();
          if (!loaded) {
            return;
          }
          return;
        }

        setAuthState('unauthenticated');
        setDataroom(EMPTY_DATAROOM);
      } catch {
        if (!cancelled) {
          setAuthState('error');
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRequestMagicLink() {
    setRequestState('sending');
    setAuthFeedback({ type: 'idle', message: '' });

    try {
      await api.requestAdminMagicLink();
      setRequestState('sent');
      setAuthFeedback({
        type: 'success',
        message: "Si le backoffice est configuré, un email de connexion vient d'être envoyé.",
      });
    } catch (error) {
      setRequestState('error');
      setAuthFeedback({
        type: 'error',
        message:
          error.code === 'ADMIN_AUTH_DISABLED'
            ? 'Le backoffice n’est pas activé (ADMIN_EMAIL manquant ou invalide).'
            : 'Erreur lors de la demande de magic link.',
      });
    }
  }

  async function handleLogout() {
    setAuthState('loading');

    try {
      await api.logoutAdmin();
    } finally {
      setSession((current) => ({
        ...current,
        authenticated: false,
        expiresAt: '',
      }));
      setDataroom(EMPTY_DATAROOM);
      setDataroomState('idle');
      setMutationState('idle');
      setActiveDeleteId(null);
      resetSignerEditor();
      setAuthState('unauthenticated');
      setAuthFeedback({ type: 'success', message: 'Vous êtes déconnecté du backoffice.' });
    }
  }

  function handleSignerFieldChange(field, value) {
    setSignerForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleToggleAiProfessionalConsent(checked) {
    setSignerForm((current) => ({
      ...current,
      aiProfessionalConsent: checked,
      professionalWebsite: checked ? current.professionalWebsite : '',
    }));
  }

  function handleEditSigner(signer) {
    setEditorMode('edit');
    setEditingSignerId(signer.id);
    setSignerForm(createSignerFormFromSigner(signer));
    setMutationFeedback({ type: 'idle', message: '' });
  }

  async function handleSaveSigner(event) {
    event.preventDefault();
    setMutationState('saving');
    setMutationFeedback({ type: 'idle', message: '' });

    try {
      const payload = buildSignerPayload(signerForm);

      if (editorMode === 'edit' && editingSignerId) {
        const result = await api.updateAdminSigner(editingSignerId, payload);
        const loaded = await loadDataroom();
        if (!loaded) {
          return;
        }

        if (result?.signer) {
          setSignerForm(createSignerFormFromSigner(result.signer));
        }

        setMutationFeedback({
          type: 'success',
          message: `Signataire #${editingSignerId} mis à jour.`,
        });
      } else {
        await api.createAdminSigner(payload);
        const loaded = await loadDataroom();
        if (!loaded) {
          return;
        }
        resetSignerEditor();
        setMutationFeedback({
          type: 'success',
          message: 'Nouveau signataire créé.',
        });
      }
    } catch (error) {
      if (error.code === 'ADMIN_UNAUTHORIZED') {
        applySessionExpiredState();
        return;
      }

      setMutationFeedback({
        type: 'error',
        message: `Enregistrement impossible${formatValidationDetails(error.details)}.`,
      });
    } finally {
      setMutationState('idle');
    }
  }

  async function handleDeleteSigner(signerId) {
    const confirmed = window.confirm(
      `Supprimer définitivement le signataire #${signerId} ? Cette action est irréversible.`,
    );

    if (!confirmed) {
      return;
    }

    setMutationState('deleting');
    setActiveDeleteId(signerId);
    setMutationFeedback({ type: 'idle', message: '' });

    try {
      await api.deleteAdminSigner(signerId);
      const loaded = await loadDataroom();
      if (!loaded) {
        return;
      }

      if (editorMode === 'edit' && editingSignerId === signerId) {
        resetSignerEditor();
      }

      setMutationFeedback({
        type: 'success',
        message: `Signataire #${signerId} supprimé.`,
      });
    } catch (error) {
      if (error.code === 'ADMIN_UNAUTHORIZED') {
        applySessionExpiredState();
        return;
      }

      setMutationFeedback({
        type: 'error',
        message: `Suppression impossible${formatValidationDetails(error.details)}.`,
      });
    } finally {
      setMutationState('idle');
      setActiveDeleteId(null);
    }
  }

  const filteredSigners = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();

    if (!query) {
      return dataroom.signers;
    }

    return dataroom.signers.filter((signer) =>
      [
        signer.id,
        signer.publicDisplayName,
        signer.profession,
        signer.department,
        signer.country,
        signer.locale,
        signer.status,
        signer.professionalWebsite,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [dataroom.signers, deferredSearchTerm]);

  const isMutating = mutationState === 'saving' || mutationState === 'deleting';

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="admin-kicker">Manifesto IA</p>
          <h1>Backoffice</h1>
        </div>
        <a href="/" className="admin-link-home">
          Retour au site public
        </a>
      </header>

      {authFeedback.type !== 'idle' && (
        <p className={`admin-feedback is-${authFeedback.type}`} role="status">
          {authFeedback.message}
        </p>
      )}

      {authState === 'loading' && (
        <p className="admin-status" role="status">
          Vérification de session en cours...
        </p>
      )}

      {authState === 'error' && (
        <p className="admin-status warning" role="status">
          Impossible de contacter le serveur.
        </p>
      )}

      {authState === 'unauthenticated' && (
        <section className="admin-login-card">
          <h2>Connexion sécurisée</h2>
          <p>
            Le backoffice fonctionne par magic link uniquement. Aucun mot de passe n’est requis.
          </p>
          {!session.enabled && (
            <p className="admin-status warning">
              Le backoffice est désactivé: configurez la variable d’environnement{' '}
              <code>ADMIN_EMAIL</code>.
            </p>
          )}
          <button
            type="button"
            className="admin-button"
            onClick={handleRequestMagicLink}
            disabled={requestState === 'sending' || session.enabled === false}
          >
            {requestState === 'sending' ? 'Envoi en cours...' : 'Recevoir le magic link'}
          </button>
        </section>
      )}

      {authState === 'authenticated' && (
        <main className="admin-main">
          <section className="admin-session-row">
            <p>
              Session active
              {session.expiresAt ? ` jusqu’au ${formatDateTime(session.expiresAt)}` : ''}.
            </p>
            <button type="button" className="admin-button ghost" onClick={handleLogout}>
              Déconnexion
            </button>
          </section>

          <section className="admin-editor-card">
            <div className="admin-editor-toolbar">
              <h2>
                {editorMode === 'edit' && editingSignerId
                  ? `Modifier le signataire #${editingSignerId}`
                  : 'Créer un signataire'}
              </h2>
              {editorMode === 'edit' && (
                <button
                  type="button"
                  className="admin-button ghost"
                  onClick={resetSignerEditor}
                  disabled={isMutating}
                >
                  Nouveau
                </button>
              )}
            </div>

            <form className="admin-form-grid" onSubmit={handleSaveSigner}>
              <label className="admin-field">
                Nom public
                <input
                  type="text"
                  required
                  minLength={3}
                  value={signerForm.publicDisplayName}
                  onChange={(event) =>
                    handleSignerFieldChange('publicDisplayName', event.target.value)
                  }
                />
              </label>

              <label className="admin-field">
                Métier
                <input
                  type="text"
                  required
                  minLength={2}
                  value={signerForm.profession}
                  onChange={(event) => handleSignerFieldChange('profession', event.target.value)}
                />
              </label>

              <label className="admin-field">
                Département
                <input
                  type="text"
                  required
                  pattern="(?:[0-9]{2,3}|2[AaBb])"
                  inputMode="text"
                  maxLength={3}
                  title="Format attendu: 2 chiffres, 3 chiffres, 2A ou 2B."
                  value={signerForm.department}
                  onChange={(event) =>
                    handleSignerFieldChange('department', event.target.value.toUpperCase())
                  }
                />
              </label>

              <label className="admin-field">
                Pays (ISO-2)
                <select
                  value={signerForm.country}
                  onChange={(event) => handleSignerFieldChange('country', event.target.value)}
                >
                  <option value="">-</option>
                  {countryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label} ({option.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                Locale
                <select
                  value={signerForm.locale}
                  onChange={(event) => handleSignerFieldChange('locale', event.target.value)}
                >
                  {SUPPORTED_LOCALES.map((localeCode) => (
                    <option key={localeCode} value={localeCode}>
                      {localeCode}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                Statut
                <select
                  value={signerForm.status}
                  onChange={(event) => handleSignerFieldChange('status', event.target.value)}
                >
                  <option value="pending">En attente</option>
                  <option value="verified">Vérifié</option>
                </select>
              </label>

              <label className="admin-field admin-field-wide">
                Site professionnel
                <input
                  type="url"
                  placeholder="https://"
                  value={signerForm.professionalWebsite}
                  disabled={!signerForm.aiProfessionalConsent}
                  onChange={(event) =>
                    handleSignerFieldChange('professionalWebsite', event.target.value)
                  }
                />
              </label>

              <div className="admin-checkbox-grid admin-field-wide">
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={signerForm.aiProfessionalConsent}
                    onChange={(event) => handleToggleAiProfessionalConsent(event.target.checked)}
                  />
                  IA professionnel
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={signerForm.diffusionConsent}
                    onChange={(event) =>
                      handleSignerFieldChange('diffusionConsent', event.target.checked)
                    }
                  />
                  Consentement diffusion
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={signerForm.privacyConsent}
                    onChange={(event) =>
                      handleSignerFieldChange('privacyConsent', event.target.checked)
                    }
                  />
                  Consentement privacy
                </label>
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={signerForm.charterConsent}
                    onChange={(event) =>
                      handleSignerFieldChange('charterConsent', event.target.checked)
                    }
                  />
                  Charte acceptée
                </label>
              </div>

              <div className="admin-editor-actions admin-field-wide">
                <button type="submit" className="admin-button" disabled={isMutating}>
                  {mutationState === 'saving'
                    ? 'Enregistrement...'
                    : editorMode === 'edit'
                      ? 'Mettre à jour'
                      : 'Créer'}
                </button>
                {editorMode === 'edit' && (
                  <button
                    type="button"
                    className="admin-button ghost"
                    onClick={resetSignerEditor}
                    disabled={isMutating}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>

            {mutationFeedback.type !== 'idle' && (
              <p className={`admin-inline-feedback is-${mutationFeedback.type}`} role="status">
                {mutationFeedback.message}
              </p>
            )}
          </section>

          <section className="admin-stats-grid">
            <article>
              <h3>Total</h3>
              <p>{dataroom.total}</p>
            </article>
            <article>
              <h3>En attente</h3>
              <p>{dataroom.pending}</p>
            </article>
            <article>
              <h3>Vérifiés</h3>
              <p>{dataroom.verified}</p>
            </article>
          </section>

          <section className="admin-table-card">
            <div className="admin-table-toolbar">
              <h2>Dataroom complète</h2>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher (nom, statut, métier, pays...)"
              />
            </div>

            {dataroomState === 'loading' && (
              <p className="admin-status" role="status">
                Chargement de la dataroom...
              </p>
            )}
            {dataroomState === 'error' && (
              <p className="admin-status warning" role="status">
                Erreur de chargement de la dataroom.
              </p>
            )}
            {dataroomState === 'ready' && filteredSigners.length === 0 && (
              <p className="admin-status" role="status">
                Aucun résultat pour cette recherche.
              </p>
            )}

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Statut</th>
                    <th>Nom public</th>
                    <th>Métier</th>
                    <th>Dépt.</th>
                    <th>Pays</th>
                    <th>Locale</th>
                    <th>IA pro</th>
                    <th>Site pro</th>
                    <th>Diffusion</th>
                    <th>Privacy</th>
                    <th>Charte</th>
                    <th>Créé le</th>
                    <th>Mail envoyé</th>
                    <th>Vérifié le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSigners.map((signer) => (
                    <tr key={signer.id}>
                      <td>{signer.id}</td>
                      <td>{formatStatus(signer.status)}</td>
                      <td>{signer.publicDisplayName ?? '-'}</td>
                      <td>{signer.profession ?? '-'}</td>
                      <td>{signer.department ?? '-'}</td>
                      <td>{signer.country || '-'}</td>
                      <td>{signer.locale || '-'}</td>
                      <td>{formatBoolean(signer.aiProfessionalConsent)}</td>
                      <td>
                        {signer.professionalWebsite ? (
                          <a href={signer.professionalWebsite} target="_blank" rel="noreferrer">
                            {signer.professionalWebsite}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{formatBoolean(signer.diffusionConsent)}</td>
                      <td>{formatBoolean(signer.privacyConsent)}</td>
                      <td>{formatBoolean(signer.charterConsent)}</td>
                      <td>{formatDateTime(signer.createdAt)}</td>
                      <td>{formatDateTime(signer.verificationSentAt)}</td>
                      <td>{formatDateTime(signer.verifiedAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-table-action"
                            onClick={() => handleEditSigner(signer)}
                            disabled={isMutating}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="admin-table-action danger"
                            onClick={() => handleDeleteSigner(signer.id)}
                            disabled={isMutating}
                          >
                            {mutationState === 'deleting' && activeDeleteId === signer.id
                              ? 'Suppression...'
                              : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default BackofficeApp;
