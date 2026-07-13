import { BarChart } from './charts';
import { EmptyState } from '../UI';

export default function LeaveTypeDemand({ typeData }) {
  return (
    <div className="card analytics-card">
      <div className="card-header">
        <h2>Leave Type Demand</h2>
        <span className="chart-kicker">By request count</span>
      </div>
      {typeData.length === 0 ? (
        <EmptyState title="No leave data yet" description="Leave type analytics will appear after requests are submitted." />
      ) : (
        <BarChart data={typeData} showPercent />
      )}
    </div>
  );
}
