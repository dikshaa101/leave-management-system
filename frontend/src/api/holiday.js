import { apiRequest } from './client';

// Manager endpoints

export async function getManagerHolidays() {
  const res = await apiRequest('/manager/holidays');
  return res.data;
}

export async function addHoliday(data) {
  const res = await apiRequest('/manager/holidays', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateHoliday(id, data) {
  const res = await apiRequest(`/manager/holidays/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteHoliday(id) {
  return apiRequest(`/manager/holidays/${id}`, { method: 'DELETE' });
}

// Employee endpoint (read-only)

export async function getEmployeeHolidays() {
  const res = await apiRequest('/employee/holidays');
  return res.data;
}
