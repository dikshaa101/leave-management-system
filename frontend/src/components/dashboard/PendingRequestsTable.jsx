import { Link } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { StatusBadge, formatDate, EmptyState } from '../UI';

export default function PendingRequestsTable({ pending, loading, actionId, onApprove, onReject }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Pending Requests</h2>
        <Link to="/manager/pending" className="link">View all</Link>
      </div>

      {loading ? (
        <div className="loading-inline"><div className="spinner sm" /></div>
      ) : pending.length === 0 ? (
        <EmptyState title="All caught up" description="No pending leave requests at the moment." />
      ) : (
        <div className="table-wrap dashboard-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.slice(0, 5).map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.employeeName}</td>
                  <td className="capitalize">{leave.leaveType?.toLowerCase()}</td>
                  <td>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td>{leave.totalDays}</td>
                  <td><StatusBadge status={leave.status} /></td>
                  <td>
                    <div className="actions-cell">
                      <button
                        type="button"
                        className="icon-btn icon-btn-success"
                        title="Approve"
                        disabled={actionId === leave.id}
                        onClick={() => onApprove(leave.id)}
                      >
                        <FiCheck />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Reject"
                        disabled={actionId === leave.id}
                        onClick={() => onReject(leave.id)}
                      >
                        <FiX />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
