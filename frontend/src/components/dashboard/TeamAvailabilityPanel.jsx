import { FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi';

export default function TeamAvailabilityPanel({ availability }) {
  if (!availability) return null;

  const { availableEmployees = 0, employeesOnLeave = 0, totalEmployees = 0 } = availability;
  const availablePercent = totalEmployees > 0 ? Math.round((availableEmployees / totalEmployees) * 100) : 0;

  return (
    <div className="card availability-summary">
      <div className="card-header">
        <h2>Today&apos;s Team Availability</h2>
        <span className="chart-kicker">{availablePercent}% available</span>
      </div>

      <div className="availability-progress-track">
        <span className="availability-progress-fill" style={{ width: `${availablePercent}%` }} />
      </div>

      <div className="availability-stats">
        <div className="availability-stat">
          <span className="availability-stat-icon icon-success"><FiUserCheck /></span>
          <div>
            <span className="avail-num">{availableEmployees}</span>
            <span className="avail-label">Available</span>
          </div>
        </div>
        <div className="availability-stat">
          <span className="availability-stat-icon icon-warning"><FiUserX /></span>
          <div>
            <span className="avail-num">{employeesOnLeave}</span>
            <span className="avail-label">On Leave</span>
          </div>
        </div>
        <div className="availability-stat">
          <span className="availability-stat-icon icon-neutral"><FiUsers /></span>
          <div>
            <span className="avail-num">{totalEmployees}</span>
            <span className="avail-label">Total Employees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
