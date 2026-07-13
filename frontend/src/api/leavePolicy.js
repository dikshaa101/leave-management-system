import { apiRequest } from './client';

// Manager endpoints

export async function getManagerPolicies() {
  const res = await apiRequest('/manager/leave-policies');
  return res.data;
}

export async function createPolicy(data) {
  const res = await apiRequest('/manager/leave-policies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updatePolicy(id, data) {
  const res = await apiRequest(`/manager/leave-policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updatePolicyStatus(id, active) {
  const res = await apiRequest(`/manager/leave-policies/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
  return res.data;
}

export async function deletePolicy(id) {
  return apiRequest(`/manager/leave-policies/${id}`, { method: 'DELETE' });
}

// Employee endpoints (read-only)

export async function getEmployeePolicies() {
  const res = await apiRequest('/employee/leave-policies');
  return res.data;
}

export async function getMyLeaveBalances() {
  const res = await apiRequest('/employee/leave-balances');
  return res.data;
}
