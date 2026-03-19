function normalizeName(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function maskPublicName(fullName) {
  const parts = normalizeName(fullName);
  const firstInitial = parts[0]?.charAt(0).toUpperCase() ?? 'X';
  const lastName = (parts.at(-1) ?? '').replace(/[^A-Za-zÀ-ÿ'-]/g, '');
  const snippet = capitalize(lastName.slice(0, 4));

  return `${firstInitial}. ${snippet || 'Anon'}.`;
}

export function createPublicDisplayName({ fullName, profession, department }) {
  return `${maskPublicName(fullName)} (${profession.trim()})`;
}
