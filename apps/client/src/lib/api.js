async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'same-origin',
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
  requestAdminMagicLink() {
    return request('/api/admin/auth/request', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
  verifyAdminMagicLink(token) {
    return request(`/api/admin/auth/verify?token=${encodeURIComponent(token)}`);
  },
  getAdminSession() {
    return request('/api/admin/auth/me');
  },
  logoutAdmin() {
    return request('/api/admin/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
  getAdminDataroom() {
    return request('/api/admin/dataroom');
  },
  createAdminSigner(payload) {
    return request('/api/admin/signers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updateAdminSigner(id, payload) {
    return request(`/api/admin/signers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  deleteAdminSigner(id) {
    return request(`/api/admin/signers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  },
};
