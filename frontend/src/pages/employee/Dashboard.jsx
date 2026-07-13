import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PageHeader, StatusBadge, formatDate, EmptyState } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { getMyLeaves } from '../../api/leave';
import { getMyLeaveBalances } from '../../api/leavePolicy';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/holidays', label: 'Holidays' },
  { to: '/employee/balances', label: 'Leave Balances' },
  { to: '/employee/profile', label: 'Profile' },
];

export default function EmployeeDashboard() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyLeaves().catch(() => []),
      getMyLeaveBalances().catch(() => []),
    ])
      .then(([leavesData, balancesData]) => {
        setLeaves(leavesData);
        setBalances(balancesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = leaves.filter((l) => l.status === 'PENDING').length;
  const approved = leaves.filter((l) => l.status === 'APPROVED').length;
  const recentLeaves = leaves.slice(0, 5);

  return (
    <Layout links={employeeLinks}>
      <PageHeader
        title={`Hello, ${profile?.fullName?.split(' ')[0] || 'there'}`}
        subtitle="Here's an overview of your leave status"
        action={
          <Link to="/employee/apply" className="btn btn-primary">
            Apply for leave
          </Link>
        }
      />

      <div className="stats-grid">
        {balances.map((balance) => (
          <div key={balance.leaveType} className="stat-card highlight">
            <span className="stat-label">{balance.leaveType} Leave</span>
            <span className="stat-value">{balance.remainingBalance}</span>
            <span className="stat-hint">of {balance.totalAllocated} days remaining</span>
          </div>
        ))}
        <div className="stat-card">
          <span className="stat-label">Pending Requests</span>
          <span className="stat-value">{pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved Leaves</span>
          <span className="stat-value">{approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Department</span>
          <span className="stat-value text-sm">{profile?.department || '—'}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Leave Requests</h2>
          <Link to="/employee/leaves" className="link">View all</Link>
        </div>

        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : recentLeaves.length === 0 ? (
          <EmptyState
            title="No leave requests yet"
            description="Apply for your first leave to see it here."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.leaveType}</td>
                    <td>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </td>
                    <td>{leave.totalDays}</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>{formatDate(leave.appliedOn)}</td>
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
