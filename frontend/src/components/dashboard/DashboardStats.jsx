import { FiUsers, FiClock, FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function DashboardStats({ totalEmployees, pendingRequests, onLeaveToday, approvedToday }) {
  const cards = [
    {
      key: 'total',
      icon: <FiUsers />,
      title: 'Total Employees',
      value: totalEmployees,
      subtitle: 'Active employees',
      accent: 'neutral',
    },
    {
      key: 'pending',
      icon: <FiClock />,
      title: 'Pending Requests',
      value: pendingRequests,
      subtitle: 'Needs approval',
      accent: 'warning',
    },
    {
      key: 'onLeave',
      icon: <FiCalendar />,
      title: 'Employees On Leave Today',
      value: onLeaveToday,
      subtitle: 'Currently unavailable',
      accent: 'success',
    },
    {
      key: 'approvedToday',
      icon: <FiCheckCircle />,
      title: 'Approved Today',
      value: approvedToday,
      subtitle: 'Approved today',
      accent: 'info',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div className={`kpi-card kpi-${card.accent}`} key={card.key}>
          <div className="kpi-icon">{card.icon}</div>
          <div className="kpi-body">
            <span className="kpi-title">{card.title}</span>
            <span className="kpi-value">{card.value}</span>
            <span className="kpi-subtitle">{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
