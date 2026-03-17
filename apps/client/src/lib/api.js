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
  getDirectory() {
    return request('/api/signers');
  },
  registerSigner(payload) {
    return request('/api/signers/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  resendVerification(email) {
    return request('/api/signers/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  verifyToken(token) {
    return request(`/api/signers/verify?token=${encodeURIComponent(token)}`);
  },
};
