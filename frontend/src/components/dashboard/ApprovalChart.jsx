import { DonutChart } from './charts';

const statusColors = {
  PENDING: '#d97706',
  APPROVED: '#059669',
  REJECTED: '#dc2626',
  CANCELLED: '#64748b',
};

export default function ApprovalChart({ statusData, totalRequests }) {
  return (
    <div className="card analytics-card">
      <div className="card-header">
        <h2>Approval Mix</h2>
        <span className="chart-kicker">{totalRequests} total requests</span>
      </div>
      <div className="donut-panel">
        <DonutChart data={statusData} colors={statusColors} centerLabel="Leaves" />
        <div className="chart-legend">
          {statusData.map((item) => (
            <div className="legend-item" key={item.label}>
              <span className="legend-dot" style={{ background: statusColors[item.label] }} />
              <span>{item.label.toLowerCase()}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
