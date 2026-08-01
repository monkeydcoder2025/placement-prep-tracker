const API_BASE = '/api';

export const fetchSchedule = async () => {
  const res = await fetch(`${API_BASE}/schedule`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
};

export const fetchCurrentWeekend = async () => {
  const res = await fetch(`${API_BASE}/schedule/current`);
  if (!res.ok) throw new Error('Failed to fetch current weekend');
  return res.json();
};

export const fetchCompletedTasks = async () => {
  const res = await fetch(`${API_BASE}/tasks/completed`);
  if (!res.ok) throw new Error('Failed to fetch completed tasks');
  return res.json();
};

export const completeTask = async (sourceId) => {
  const res = await fetch(`${API_BASE}/tasks/${sourceId}/complete`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to complete task');
  return res.json();
};

export const uncompleteTask = async (sourceId) => {
  const res = await fetch(`${API_BASE}/tasks/${sourceId}/uncomplete`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to uncomplete task');
  return res.json();
};

export const fetchSettings = async () => {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateStartDate = async (date) => {
  const res = await fetch(`${API_BASE}/settings/start-date`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate: date })
  });
  return res.json();
};

export const triggerPanic = async () => {
  const res = await fetch(`${API_BASE}/settings/panic`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger panic');
  return res.json();
};

export const removePanic = async (index) => {
  const res = await fetch(`${API_BASE}/settings/panic/${index}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove panic');
  return res.json();
};
