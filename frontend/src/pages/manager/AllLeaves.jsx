import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, StatusBadge, formatDate, EmptyState, Alert } from '../../components/UI';
import { getAllLeaves } from '../../api/leave';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/holidays', label: 'Holidays' },
  { to: '/manager/leave-policies', label: 'Leave Policies' },
  { to: '/manager/profile', label: 'Profile' },
];

export default function AllLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getAllLeaves()
      .then(setLeaves)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'ALL' ? leaves : leaves.filter((l) => l.status === filter);

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="All Leave Requests"
        subtitle="Complete history of team leave applications"
        action={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      />

      <Alert message={error} onClose={() => setError('')} />

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No leave records" description="No leave requests match your filter." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.employeeName}</td>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>{leave.totalDays}</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>{formatDate(leave.appliedOn)}</td>
                    <td className="truncate">{leave.managerRemarks || '—'}</td>
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
