import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, EmptyState, Alert } from '../../components/UI';
import { getMyLeaveBalances } from '../../api/leavePolicy';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/holidays', label: 'Holidays' },
  { to: '/employee/balances', label: 'Leave Balances' },
  { to: '/employee/profile', label: 'Profile' },
];

export default function LeaveBalances() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyLeaveBalances()
      .then(setBalances)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout links={employeeLinks}>
      <PageHeader
        title="Leave Balances"
        subtitle="Your remaining balance for each leave type"
      />

      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="card">
          <div className="loading-inline"><div className="spinner sm" /></div>
        </div>
      ) : balances.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No leave policies yet"
            description="Your company hasn't configured any leave policies."
          />
        </div>
      ) : (
        <div className="stats-grid">
          {balances.map((balance) => (
            <div key={balance.leaveType} className="stat-card highlight">
              <span className="stat-label">{balance.leaveType} Leave</span>
              <span className="stat-value">{balance.remainingBalance}</span>
              <span className="stat-hint">
                of {balance.totalAllocated} days · {balance.usedLeaves} used
              </span>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
