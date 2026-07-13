import { Link } from 'react-router-dom';
import { FiCheckSquare, FiUsers, FiBarChart2, FiGift } from 'react-icons/fi';

const actions = [
  { to: '/manager/pending', label: 'Approve Leaves', icon: <FiCheckSquare /> },
  { to: '/manager/employees', label: 'Manage Employees', icon: <FiUsers /> },
  { to: '/manager/leaves', label: 'View Reports', icon: <FiBarChart2 /> },
];

export default function QuickActions() {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Quick Actions</h2>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <Link to={action.to} className="quick-action" key={action.to}>
            <span className="quick-action-icon">{action.icon}</span>
            <span>{action.label}</span>
          </Link>
        ))}
        <button type="button" className="quick-action quick-action-disabled" disabled title="Coming soon">
          <span className="quick-action-icon"><FiGift /></span>
          <span>Holiday Management</span>
          <span className="quick-action-tag">Soon</span>
        </button>
      </div>
    </div>
  );
}
