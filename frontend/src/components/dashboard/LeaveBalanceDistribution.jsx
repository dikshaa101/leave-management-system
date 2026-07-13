import { BarChart } from './charts';

export default function LeaveBalanceDistribution({ balanceBands, averageBalance }) {
  return (
    <div className="card analytics-card">
      <div className="card-header">
        <h2>Leave Balance Distribution</h2>
        <span className="chart-kicker">Avg {averageBalance} days</span>
      </div>
      <BarChart data={balanceBands} />
    </div>
  );
}
