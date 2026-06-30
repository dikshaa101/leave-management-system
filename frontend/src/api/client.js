const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token');
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let body;

  if (contentType?.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof body === 'string'
        ? body
        : body?.message || 'Something went wrong';
    throw new Error(message);
  }

  return body;
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

export { API_BASE };
