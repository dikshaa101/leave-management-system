import { apiRequest } from './client';

export async function applyLeave(data) {
  const res = await apiRequest('/leave/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getMyLeaves() {
  const res = await apiRequest('/leave/my-leaves');
  return res.data;
}

export async function getLeaveById(id) {
  const res = await apiRequest(`/leave/${id}`);
  return res.data;
}

export async function getAllLeaves() {
  const res = await apiRequest('/leave/all');
  return res.data;
}

export async function cancelLeave(id) {
  return apiRequest(`/leave/${id}`, { method: 'DELETE' });
}
