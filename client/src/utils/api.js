const API_BASE = '/api';

const getHeaders = (additionalHeaders = {}) => {
  const headers = { ...additionalHeaders };
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  return headers;
};

const fetchWithAuth = (url, options = {}) => {
  options.headers = getHeaders(options.headers);
  return fetch(url, options);
};

export const fetchSchedule = async () => {
  const res = await fetchWithAuth(`${API_BASE}/schedule`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
};

export const fetchCurrentWeekend = async () => {
  const res = await fetchWithAuth(`${API_BASE}/schedule/current`);
  if (!res.ok) throw new Error('Failed to fetch current weekend');
  return res.json();
};

export const fetchCompletedTasks = async () => {
  const res = await fetchWithAuth(`${API_BASE}/tasks/completed`);
  if (!res.ok) throw new Error('Failed to fetch completed tasks');
  return res.json();
};

export const completeTask = async (sourceId) => {
  const res = await fetchWithAuth(`${API_BASE}/tasks/${sourceId}/complete`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to complete task');
  return res.json();
};

export const uncompleteTask = async (sourceId) => {
  const res = await fetchWithAuth(`${API_BASE}/tasks/${sourceId}/uncomplete`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to uncomplete task');
  return res.json();
};

export const fetchSettings = async () => {
  const res = await fetchWithAuth(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateStartDate = async (date) => {
  const res = await fetchWithAuth(`${API_BASE}/settings/start-date`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: date })
  });
  return res.json();
};

export const triggerPanic = async () => {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 7);
  const res = await fetchWithAuth(`${API_BASE}/settings/panic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    })
  });
  if (!res.ok) throw new Error('Failed to trigger panic');
  return res.json();
};

export const removePanic = async (index) => {
  const res = await fetchWithAuth(`${API_BASE}/settings/panic/${index}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove panic');
  return res.json();
};

export const fetchAllContent = async () => {
  const res = await fetchWithAuth(`${API_BASE}/schedule/content/all`);
  if (!res.ok) throw new Error('Failed to fetch all content');
  return res.json();
};
