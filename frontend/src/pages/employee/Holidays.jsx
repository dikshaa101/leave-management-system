import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, formatDate, EmptyState, Alert } from '../../components/UI';
import { getEmployeeHolidays } from '../../api/holiday';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/holidays', label: 'Holidays' },
  { to: '/employee/profile', label: 'Profile' },
];

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmployeeHolidays()
      .then(setHolidays)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout links={employeeLinks}>
      <PageHeader
        title="Company Holidays"
        subtitle="Upcoming holidays observed by your company"
      />

      <Alert message={error} onClose={() => setError('')} />

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : holidays.length === 0 ? (
          <EmptyState title="No holidays" description="No holidays have been added yet." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td>{holiday.holidayName}</td>
                    <td>{formatDate(holiday.holidayDate)}</td>
                    <td className="truncate">{holiday.description || '—'}</td>
                    <td>
                      <span className={`badge ${holiday.optionalHoliday ? 'badge-pending' : 'badge-approved'}`}>
                        {holiday.optionalHoliday ? 'optional' : 'mandatory'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
