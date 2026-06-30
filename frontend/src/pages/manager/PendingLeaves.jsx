import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, StatusBadge, formatDate, EmptyState, Alert } from '../../components/UI';
import { getPendingLeaves, approveLeave, rejectLeave } from '../../api/manager';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/profile', label: 'Profile' },
];

export default function PendingLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState(null);
  const [remarks, setRemarks] = useState({});

  const loadPending = () => {
    setLoading(true);
    getPendingLeaves()
      .then(setLeaves)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleAction = async (id, action) => {
    setActionId(id);
    setError('');
    setSuccess('');
    try {
      const remark = remarks[id] || '';
      if (action === 'approve') {
        await approveLeave(id, remark);
        setSuccess('Leave approved successfully');
      } else {
        await rejectLeave(id, remark);
        setSuccess('Leave rejected');
      }
      setRemarks((prev) => ({ ...prev, [id]: '' }));
      loadPending();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="Pending Approvals"
        subtitle="Review and action leave requests from your team"
      />

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="All leave requests have been processed."
          />
        ) : (
          <div className="approval-list">
            {leaves.map((leave) => (
              <div key={leave.id} className="approval-item">
                <div className="approval-header">
                  <div>
                    <h3>{leave.employeeName}</h3>
                    <p className="text-muted">
                      {leave.leaveType} · {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>

                <div className="approval-details">
                  <div>
                    <span className="detail-label">Duration</span>
                    <span>{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</span>
                  </div>
                  <div>
                    <span className="detail-label">Applied</span>
                    <span>{formatDate(leave.appliedOn)}</span>
                  </div>
                  <div className="full-width">
                    <span className="detail-label">Reason</span>
                    <span>{leave.reason || 'No reason provided'}</span>
                  </div>
                </div>

                <div className="approval-actions">
                  <input
                    type="text"
                    placeholder="Optional remarks..."
                    value={remarks[leave.id] || ''}
                    onChange={(e) =>
                      setRemarks((prev) => ({ ...prev, [leave.id]: e.target.value }))
                    }
                    className="remarks-input"
                  />
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={actionId === leave.id}
                    onClick={() => handleAction(leave.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={actionId === leave.id}
                    onClick={() => handleAction(leave.id, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
