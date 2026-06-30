import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, StatusBadge, formatDate, EmptyState, Alert } from '../../components/UI';
import { getMyLeaves, cancelLeave } from '../../api/leave';
import { useAuth } from '../../context/AuthContext';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/profile', label: 'Profile' },
];

export default function MyLeaves() {
  const { refreshProfile } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadLeaves = () => {
    setLoading(true);
    getMyLeaves()
      .then(setLeaves)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    setActionId(id);
    try {
      await cancelLeave(id);
      await refreshProfile();
      loadLeaves();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout links={employeeLinks}>
      <PageHeader
        title="My Leave Requests"
        subtitle="Track and manage your leave applications"
      />

      <Alert message={error} onClose={() => setError('')} />

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No leave requests"
            description="You haven't applied for any leave yet."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Remarks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>{leave.totalDays}</td>
                    <td className="truncate">{leave.reason || '—'}</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>{formatDate(leave.appliedOn)}</td>
                    <td className="truncate">{leave.managerRemarks || '—'}</td>
                    <td>
                      {leave.status === 'PENDING' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={actionId === leave.id}
                          onClick={() => handleCancel(leave.id)}
                        >
                          {actionId === leave.id ? '...' : 'Cancel'}
                        </button>
                      )}
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
