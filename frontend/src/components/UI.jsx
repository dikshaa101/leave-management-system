const STATUS_STYLES = {
  PENDING: 'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
  CANCELLED: 'badge-cancelled',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || ''}`}>
      {status?.toLowerCase()}
    </span>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function LeaveTypeOptions() {
  const types = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY'];
  return types.map((type) => (
    <option key={type} value={type}>
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </option>
  ));
}

export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
