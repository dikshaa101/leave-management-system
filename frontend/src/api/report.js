import { API_BASE } from './client';

function getToken() {
  return localStorage.getItem('token');
}

function buildQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

function extractFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}

/**
 * Fetches a report export endpoint as a binary blob and triggers a
 * browser download. Throws with the server's error message if the
 * request fails (e.g. validation error on the date range filter).
 */
export async function downloadReport(path, filters, fallbackFilename) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}${buildQueryString(filters)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let message = 'Failed to generate report';
    if (contentType?.includes('application/json')) {
      const body = await response.json();
      message = body?.message || message;
    } else {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const filename = extractFilename(response.headers.get('content-disposition'), fallbackFilename);

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportLeavesCsv = (filters) =>
  downloadReport('/manager/reports/leaves/csv', filters, 'leave-requests-report.csv');

export const exportLeavesExcel = (filters) =>
  downloadReport('/manager/reports/leaves/excel', filters, 'leave-requests-report.xlsx');

export const exportLeavesPdf = (filters) =>
  downloadReport('/manager/reports/leaves/pdf', filters, 'leave-requests-report.pdf');

export const exportBalancesExcel = (filters) =>
  downloadReport('/manager/reports/balances/excel', filters, 'leave-balance-report.xlsx');

export const exportHolidaysPdf = () =>
  downloadReport('/manager/reports/holidays/pdf', {}, 'holiday-list.pdf');

export const exportPoliciesPdf = () =>
  downloadReport('/manager/reports/policies/pdf', {}, 'leave-policy-report.pdf');
