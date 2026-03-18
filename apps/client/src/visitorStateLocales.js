const EN_COPY = {
  pendingBadge: 'Verification pending',
  pendingTitle: 'Your signature is almost published.',
  pendingBody:
    'Please check your inbox and click the verification link to confirm your engagement.',
  pendingProof:
    'This email check is the proof of humanity for your public support.',
  verifiedBadge: 'Verified support',
  verifiedTitle: 'Big thank you for being part of this responsible change.',
  verifiedBody:
    'Your engagement is now visible in the public signers wall. You are helping restore responsible and sovereign AI practices.',
  verifiedPosition:
    'You currently appear at position #{{position}} in the verified signers list.',
  verifiedPositionUnknown:
    'Your signature is now highlighted in the verified signers list.',
  formLockedPending:
    'Your signature request is already submitted. Check your email to complete verification.',
  formLockedVerified:
    'Your signature is already verified. Thank you again for your public commitment.',
  cardHighlight: 'It is you',
};

const FR_COPY = {
  pendingBadge: 'Verification en attente',
  pendingTitle: 'Votre signature est presque publiee.',
  pendingBody:
    'Verifiez votre boite mail puis cliquez sur le lien de validation pour confirmer votre engagement.',
  pendingProof:
    "Cette verification email constitue la preuve d'humanite de votre soutien public.",
  verifiedBadge: 'Soutien verifie',
  verifiedTitle:
    'Un grand merci pour faire partie de ce changement responsable.',
  verifiedBody:
    'Votre engagement est maintenant visible dans le mur public des signataires. Vous contribuez a restaurer un usage responsable et souverain des IA.',
  verifiedPosition:
    'Vous apparaissez actuellement en position ndeg{{position}} dans la liste des signataires verifies.',
  verifiedPositionUnknown:
    'Votre signature est maintenant mise en evidence dans la liste des signataires verifies.',
  formLockedPending:
    'Votre demande de signature est deja envoyee. Verifiez votre email pour finaliser la validation.',
  formLockedVerified:
    'Votre signature est deja verifiee. Merci encore pour votre engagement public.',
  cardHighlight: "C'est vous",
};

const COPY_BY_LOCALE = {
  bg: EN_COPY,
  cs: EN_COPY,
  da: EN_COPY,
  de: EN_COPY,
  el: EN_COPY,
  en: EN_COPY,
  es: EN_COPY,
  et: EN_COPY,
  fi: EN_COPY,
  fr: FR_COPY,
  ga: EN_COPY,
  hr: EN_COPY,
  hu: EN_COPY,
  it: EN_COPY,
  lt: EN_COPY,
  lv: EN_COPY,
  mt: EN_COPY,
  nl: EN_COPY,
  pl: EN_COPY,
  pt: EN_COPY,
  ro: EN_COPY,
  sk: EN_COPY,
  sl: EN_COPY,
  sv: EN_COPY,
};

function getLanguageCode(locale) {
  return locale?.split('-')[0]?.toLowerCase() ?? 'fr';
}

export function getVisitorStateCopy(locale) {
  return COPY_BY_LOCALE[getLanguageCode(locale)] ?? FR_COPY;
}

export function interpolateTemplate(template, values) {
  if (typeof template !== 'string') {
    return '';
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(values?.[key] ?? '');
  });
}

