const API_BASE_URL = '/api';

let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

async function refreshAccessToken() {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth header if we have a token
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Debug logging
  console.log(`[API] ${options.method || 'GET'} ${endpoint}`, { hasToken: !!accessToken });

  let response = await fetch(url, config);

  // If 401, try to refresh and retry once
  if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    try {
      await refreshAccessToken();
      // Retry with new token
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      response = await fetch(url, config);
    } catch {
      // Refresh failed, clear token
      clearAccessToken();
      throw new Error('Session expired');
    }
  }

  // Handle empty responses
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const api = {
  // Auth
  register: (email, password, role = 'candidate', companyName = '') =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, companyName }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  refresh: () => refreshAccessToken(),

  me: () => request('/auth/me'),

  protected: () => request('/protected'),

  // Interviews
  startInterview: () =>
    request('/interviews/start', { method: 'POST' }),

  getInterview: (interviewId) =>
    request(`/interviews/${interviewId}`),

  submitAnswer: (interviewId, questionId, transcript, skipped = false) =>
    request(`/interviews/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, transcript, skipped }),
    }),

  completeInterview: (interviewId) =>
    request(`/interviews/${interviewId}/complete`, { method: 'POST' }),

  getReport: (interviewId) =>
    request(`/interviews/${interviewId}/report`),

  listInterviews: () =>
    request('/interviews'),

  // Jobs
  listJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/jobs${queryString ? `?${queryString}` : ''}`);
  },

  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  updateJob: (jobId, jobData) =>
    request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),

  deleteJob: (jobId) =>
    request(`/jobs/${jobId}`, {
      method: 'DELETE',
    }),

  getJob: (jobId) =>
    request(`/jobs/${jobId}`),

  // Users
  getMyStats: () =>
    request('/users/me/stats'),
};

export default api;

