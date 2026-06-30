import { apiRequest } from './client';

export async function getTodayAvailability() {
  const res = await apiRequest('/team/availability/today');
  return res.data;
}

export async function getAvailabilityByDate(date) {
  const res = await apiRequest(`/team/availability/date?date=${date}`);
  return res.data;
}

export async function getDepartmentAvailability(department, date) {
  const res = await apiRequest(
    `/team/availability/department?department=${encodeURIComponent(department)}&date=${date}`
  );
  return res.data;
}
