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
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error('Request failed');
      }
      return null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}

// Auth API
export const api = {
  // Auth
  register: (email, password, role = 'candidate', companyName = null) =>
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

  // Jobs
  listJobs: () => request('/jobs'),

  getJob: (id) => request(`/jobs/${id}`),

  // Interviews
  startInterview: () =>
    request('/interviews/start', { method: 'POST' }),

  applyToJob: (jobId) =>
    request(`/interviews/apply/${jobId}`, { method: 'POST' }),

  getInterview: (id) =>
    request(`/interviews/${id}`),

  listInterviews: () =>
    request('/interviews'),

  submitAnswer: (interviewId, questionId, transcript, skipped = false) =>
    request(`/interviews/${interviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, transcript, skipped }),
    }),

  completeInterview: (id) =>
    request(`/interviews/${id}/complete`, { method: 'POST' }),

  getReport: (id) =>
    request(`/interviews/${id}/report`),

  // User Stats
  getMyStats: () =>
    request('/users/me/stats'),

  // Company-specific APIs
  listCompanyJobs: () =>
    request('/jobs/company/my-jobs'),

  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    }),

  deleteJob: (id) =>
    request(`/jobs/${id}`, { method: 'DELETE' }),

  publishJob: (id) =>
    request(`/jobs/${id}/publish`, { method: 'POST' }),

  generateJobQuestions: (id) =>
    request(`/jobs/${id}/generate-questions`, { method: 'POST' }),

  getCompanyApplications: (jobId = null) => {
    const url = jobId
      ? `/interviews/company/applications?jobId=${jobId}`
      : '/interviews/company/applications';
    return request(url);
  },

  updateCompanyNotes: (interviewId, notes, status) =>
    request(`/interviews/${interviewId}/company-notes`, {
      method: 'PATCH',
      body: JSON.stringify({ companyNotes: notes, companyStatus: status }),
    }),
};

export default api;
