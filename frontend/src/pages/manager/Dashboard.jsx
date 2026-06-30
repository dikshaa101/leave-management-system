import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PageHeader, StatusBadge, formatDate, EmptyState } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { getPendingLeaves } from '../../api/manager';
import { getAllLeaves } from '../../api/leave';
import { getTodayAvailability } from '../../api/team';
import { getAllEmployees } from '../../api/employee';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/profile', label: 'Profile' },
];

const statusColors = {
  PENDING: '#d97706',
  APPROVED: '#059669',
  REJECTED: '#dc2626',
  CANCELLED: '#64748b',
};

const chartColors = ['#0f766e', '#1e3a5f', '#7c3aed', '#d97706', '#dc2626'];

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'UNKNOWN';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function getMonthlyLeaveTrend(leaves) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
      count: 0,
    };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));

  leaves.forEach((leave) => {
    const rawDate = leave.appliedOn || leave.startDate;
    if (!rawDate) return;
    const date = new Date(rawDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthMap.has(key)) monthMap.get(key).count += 1;
  });

  return months;
}

function getBalanceBands(employees) {
  const bands = [
    { label: '0-5', min: 0, max: 5, count: 0 },
    { label: '6-10', min: 6, max: 10, count: 0 },
    { label: '11-15', min: 11, max: 15, count: 0 },
    { label: '16+', min: 16, max: Infinity, count: 0 },
  ];

  employees.forEach((employee) => {
    const balance = Number(employee.leaveBalance || 0);
    const band = bands.find((item) => balance >= item.min && balance <= item.max);
    if (band) band.count += 1;
  });

  return bands;
}

function DonutChart({ data, colors }) {
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
              stroke={colors[item.label] || chartColors[index % chartColors.length]}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
      <div className="donut-center">
        <strong>{total}</strong>
        <span>Leaves</span>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="bar-chart" aria-label="Bar chart">
      {data.map((item, index) => (
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
          <span className="bar-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function MiniTrend({ data }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="trend-chart" aria-label="Monthly leave trend">
      {data.map((item) => (
        <div className="trend-item" key={item.label}>
          <div className="trend-bar-wrap">
            <span
              className="trend-bar"
              style={{ height: `${Math.max((item.count / max) * 100, item.count > 0 ? 12 : 4)}%` }}
            />
          </div>
          <span className="trend-count">{item.count}</span>
          <span className="trend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const [pending, setPending] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPendingLeaves(),
      getAllLeaves(),
      getTodayAvailability(),
      getAllEmployees(),
    ])
      .then(([pendingData, leavesData, availData, employeeData]) => {
        setPending(pendingData);
        setAllLeaves(leavesData);
        setAvailability(availData);
        setEmployees(employeeData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = allLeaves.filter((l) => l.status === 'APPROVED').length;
  const rejected = allLeaves.filter((l) => l.status === 'REJECTED').length;
  const cancelled = allLeaves.filter((l) => l.status === 'CANCELLED').length;
  const employeeCount = employees.length;
  const statusData = [
    { label: 'PENDING', value: pending.length },
    { label: 'APPROVED', value: approved },
    { label: 'REJECTED', value: rejected },
    { label: 'CANCELLED', value: cancelled },
  ];
  const typeData = Object.entries(countBy(allLeaves, 'leaveType'))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const monthlyTrend = getMonthlyLeaveTrend(allLeaves);
  const balanceBands = getBalanceBands(employees).map((band) => ({
    label: band.label,
    value: band.count,
  }));
  const averageBalance = employeeCount
    ? Math.round(employees.reduce((sum, employee) => sum + Number(employee.leaveBalance || 0), 0) / employeeCount)
    : 0;

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title={`Welcome, ${profile?.fullName?.split(' ')[0] || 'Manager'}`}
        subtitle="Manage team leave requests and availability"
        action={
          pending.length > 0 && (
            <Link to="/manager/pending" className="btn btn-primary">
              Review {pending.length} pending
            </Link>
          )
        }
      />

      <div className="stats-grid">
        <div className="stat-card highlight">
          <span className="stat-label">Pending Approvals</span>
          <span className="stat-value">{pending.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{employeeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved Leaves</span>
          <span className="stat-value">{approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected Leaves</span>
          <span className="stat-value">{rejected}</span>
        </div>
      </div>

      {availability && (
        <div className="card availability-summary">
          <h2>Today&apos;s Team Availability</h2>
          <div className="availability-stats">
            <div>
              <span className="avail-num">{availability.availableEmployees}</span>
              <span className="avail-label">Available</span>
            </div>
            <div>
              <span className="avail-num">{availability.employeesOnLeave}</span>
              <span className="avail-label">On Leave</span>
            </div>
            <div>
              <span className="avail-num">{availability.totalEmployees}</span>
              <span className="avail-label">Total</span>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-grid">
        <div className="card analytics-card">
          <div className="card-header">
            <h2>Approval Mix</h2>
            <span className="chart-kicker">{allLeaves.length} total requests</span>
          </div>
          <div className="donut-panel">
            <DonutChart data={statusData} colors={statusColors} />
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

        <div className="card analytics-card">
          <div className="card-header">
            <h2>Leave Type Demand</h2>
            <span className="chart-kicker">By request count</span>
          </div>
          {typeData.length === 0 ? (
            <EmptyState title="No leave data yet" description="Leave type analytics will appear after requests are submitted." />
          ) : (
            <BarChart data={typeData} />
          )}
        </div>

        <div className="card analytics-card">
          <div className="card-header">
            <h2>Six Month Trend</h2>
            <span className="chart-kicker">Requests submitted</span>
          </div>
          <MiniTrend data={monthlyTrend} />
        </div>

        <div className="card analytics-card">
          <div className="card-header">
            <h2>Leave Balance Spread</h2>
            <span className="chart-kicker">Avg {averageBalance} days</span>
          </div>
          <BarChart data={balanceBands} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Pending Requests</h2>
          <Link to="/manager/pending" className="link">View all</Link>
        </div>

        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : pending.length === 0 ? (
          <EmptyState
            title="All caught up"
            description="No pending leave requests at the moment."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 5).map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.employeeName}</td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td>{leave.totalDays}</td>
                    <td><StatusBadge status={leave.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
