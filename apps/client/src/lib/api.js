async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message ?? 'Request failed');
    error.code = data.code ?? 'REQUEST_FAILED';
    error.details = data.details ?? {};
    throw error;
  }

  return data;
}

export const api = {
  getVisitorCountry() {
    return request('/api/visitor/country');
  },
  getDirectory() {
    return request('/api/signers');
  },
  registerSigner(payload) {
    return request('/api/signers/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getVerificationStatus(token) {
    return request(`/api/signers/status?token=${encodeURIComponent(token)}`);
  },
  verifyToken(token) {
    return request(`/api/signers/verify?token=${encodeURIComponent(token)}`);
  },
};
