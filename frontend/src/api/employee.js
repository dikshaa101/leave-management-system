import { apiRequest } from './client';

export async function getProfile() {
  const res = await apiRequest('/employee/profile');
  return res.data;
}

export async function getAllEmployees() {
  const res = await apiRequest('/employee');
  return res.data;
}

export async function getEmployeeById(id) {
  const res = await apiRequest(`/employee/${id}`);
  return res.data;
}

export async function addEmployee(data) {
  const res = await apiRequest('/employee', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateEmployee(id, data) {
  const res = await apiRequest(`/employee/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteEmployee(id) {
  return apiRequest(`/employee/${id}`, { method: 'DELETE' });
}

export async function getEmployeesPage(page = 0, size = 10, sortBy = 'fullName') {
  const res = await apiRequest(
    `/employee/page?page=${page}&size=${size}&sortBy=${sortBy}`
  );
  return res.data;
}

export async function searchByDepartment(department, page = 0, size = 10) {
  const res = await apiRequest(
    `/employee/search?department=${encodeURIComponent(department)}&page=${page}&size=${size}`
  );
  return res.data;
}
