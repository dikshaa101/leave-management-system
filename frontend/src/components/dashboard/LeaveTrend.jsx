import { TrendBarChart } from './charts';

export default function LeaveTrend({ monthlyTrend }) {
  return (
    <div className="card analytics-card">
      <div className="card-header">
        <h2>Six Month Trend</h2>
        <span className="chart-kicker">Requests submitted</span>
      </div>
      <TrendBarChart data={monthlyTrend} />
    </div>
  );
}
