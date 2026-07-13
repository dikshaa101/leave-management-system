import { FiFileText, FiCheckCircle, FiXCircle, FiSlash, FiUserPlus } from 'react-icons/fi';
import { EmptyState } from '../UI';

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function buildActivityFeed(leaves = [], employees = []) {
  const events = [];

  leaves.forEach((leave) => {
    if (leave.appliedOn) {
      events.push({
        id: `applied-${leave.id}`,
        date: leave.appliedOn,
        name: leave.employeeName,
        text: `applied for ${leave.leaveType?.toLowerCase() || ''} leave`,
        type: 'applied',
      });
    }
    if (leave.status === 'APPROVED' && leave.actionDate) {
      events.push({
        id: `approved-${leave.id}`,
        date: leave.actionDate,
        name: leave.employeeName,
        text: 'leave request was approved',
        type: 'approved',
      });
    }
    if (leave.status === 'REJECTED' && leave.actionDate) {
      events.push({
        id: `rejected-${leave.id}`,
        date: leave.actionDate,
        name: leave.employeeName,
        text: 'leave request was rejected',
        type: 'rejected',
      });
    }
    if (leave.status === 'CANCELLED') {
      events.push({
        id: `cancelled-${leave.id}`,
        date: leave.actionDate || leave.appliedOn,
        name: leave.employeeName,
        text: 'cancelled a leave request',
        type: 'cancelled',
      });
    }
  });

  employees.forEach((employee) => {
    if (employee.joiningDate) {
      events.push({
        id: `joined-${employee.id}`,
        date: employee.joiningDate,
        name: employee.fullName,
        text: 'joined the company',
        type: 'joined',
      });
    }
  });

  return events
    .filter((event) => event.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
}

const ACTIVITY_META = {
  applied: { icon: <FiFileText />, className: 'icon-info' },
  approved: { icon: <FiCheckCircle />, className: 'icon-success' },
  rejected: { icon: <FiXCircle />, className: 'icon-danger' },
  cancelled: { icon: <FiSlash />, className: 'icon-neutral' },
  joined: { icon: <FiUserPlus />, className: 'icon-accent' },
};

export default function RecentActivity({ activity }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Recent Activity</h2>
      </div>

      {activity.length === 0 ? (
        <EmptyState title="No recent activity" description="Team activity will show up here as it happens." />
      ) : (
        <ul className="activity-list">
          {activity.map((event) => {
            const meta = ACTIVITY_META[event.type] || ACTIVITY_META.applied;
            return (
              <li className="activity-item" key={event.id}>
                <span className="activity-avatar">{initials(event.name)}</span>
                <div className="activity-body">
                  <p>
                    <strong>{event.name}</strong> {event.text}
                  </p>
                  <span className="activity-time">{timeAgo(event.date)}</span>
                </div>
                <span className={`activity-icon ${meta.className}`}>{meta.icon}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
