const EN_COPY = {
  declarationLabel:
    'I declare that I am an AI professional and I commit to sharing this message during my trainings. In return, I receive the right to promote my services in the signers wall.',
  websiteLabel: 'Professional website',
  websitePlaceholder: 'https://your-site.com',
  websiteHint:
    'This website is shown publicly only for AI professionals who check the declaration above.',
  proBadge: 'AI Pro',
};

const FR_COPY = {
  declarationLabel:
    "Je declare etre un professionnel de l'IA et je m'engage a diffuser ce message lors de mes formations. En echange, je recois le droit de promouvoir mes services dans le mur des signataires.",
  websiteLabel: 'Site web professionnel',
  websitePlaceholder: 'https://votre-site.fr',
  websiteHint:
    "Ce site est affiche publiquement uniquement pour les professionnels de l'IA ayant coche la declaration ci-dessus.",
  proBadge: 'Pro IA',
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

export function getAiProfessionalCopy(locale) {
  return COPY_BY_LOCALE[getLanguageCode(locale)] ?? FR_COPY;
}

