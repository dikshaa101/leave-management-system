export const chartColors = ['#0f766e', '#1e3a5f', '#7c3aed', '#d97706', '#dc2626'];

export function DonutChart({ data, colors, centerLabel = 'Leaves' }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;

  if (total === 0) {
    return (
      <div className="donut-empty">
        <span>0</span>
      </div>
    );
  }

  return (
    <div className="donut-wrap" aria-label="Leave status distribution">
      <svg viewBox="0 0 42 42" className="donut-chart" role="img">
        <circle cx="21" cy="21" r="15.915" className="donut-ring" />
        {data.map((item, index) => {
          const size = (item.value / total) * 100;
          const strokeDasharray = `${size} ${100 - size}`;
          const strokeDashoffset = offset;
          offset -= size;
          return (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              className="donut-segment"
              stroke={colors?.[item.label] || chartColors[index % chartColors.length]}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
      <div className="donut-center">
        <strong>{total}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

export function BarChart({ data, showPercent = false }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bar-chart" aria-label="Bar chart">
      {data.map((item, index) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div className="bar-row" key={item.label}>
            <span className="bar-label">{item.label.replaceAll('_', ' ')}</span>
            <div className="bar-track">
              <span
                className="bar-fill"
                style={{
                  width: `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)}%`,
                  background: chartColors[index % chartColors.length],
                }}
              />
            </div>
            <span className="bar-value">
              {item.value}
              {showPercent && <span className="bar-percent">{percent}%</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function TrendBarChart({ data }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="trend-chart" aria-label="Monthly leave trend">
      {data.map((item) => (
        <div className="trend-item" key={item.label}>
          <span className="trend-count">{item.count}</span>
          <div className="trend-bar-wrap">
            <span
              className="trend-bar"
              style={{ height: `${Math.max((item.count / max) * 100, item.count > 0 ? 12 : 4)}%` }}
            />
          </div>
          <span className="trend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
