import { apiRequest } from './client';

export async function getPendingLeaves() {
  const res = await apiRequest('/manager/leaves/pending');
  return res.data;
}

export async function approveLeave(id, remarks = '') {
  return apiRequest(`/manager/leaves/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ remarks }),
  });
}

export async function rejectLeave(id, remarks = '') {
  return apiRequest(`/manager/leaves/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ remarks }),
  });
}
