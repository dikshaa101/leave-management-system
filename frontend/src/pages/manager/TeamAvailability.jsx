import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, Alert } from '../../components/UI';
import {
  getTodayAvailability,
  getAvailabilityByDate,
  getDepartmentAvailability,
} from '../../api/team';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/holidays', label: 'Holidays' },
  { to: '/manager/leave-policies', label: 'Leave Policies' },
  { to: '/manager/profile', label: 'Profile' },
];

function AvailabilityCard({ data, title }) {
  if (!data) return null;

  return (
    <div className="card availability-card">
      <h2>{title}</h2>
      <div className="availability-stats">
        <div>
          <span className="avail-num">{data.availableEmployees}</span>
          <span className="avail-label">Available</span>
        </div>
        <div>
          <span className="avail-num">{data.employeesOnLeave}</span>
          <span className="avail-label">On Leave</span>
        </div>
        <div>
          <span className="avail-num">{data.totalEmployees}</span>
          <span className="avail-label">Total</span>
        </div>
      </div>

      <div className="availability-lists">
        <div>
          <h4>Available</h4>
          {data.availableEmployeeNames?.length ? (
            <ul>
              {data.availableEmployeeNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">None</p>
          )}
        </div>
        <div>
          <h4>On Leave</h4>
          {data.employeesOnLeaveNames?.length ? (
            <ul>
              {data.employeesOnLeaveNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">None</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamAvailability() {
  const [todayData, setTodayData] = useState(null);
  const [dateData, setDateData] = useState(null);
  const [deptData, setDeptData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodayAvailability()
      .then(setTodayData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchByDate = async () => {
    setError('');
    try {
      const data = await getAvailabilityByDate(date);
      setDateData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchByDepartment = async () => {
    if (!department.trim()) {
      setError('Please enter a department name');
      return;
    }
    setError('');
    try {
      const data = await getDepartmentAvailability(department, date);
      setDeptData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="Team Availability"
        subtitle="See who is available and who is on leave"
      />

      <Alert message={error} onClose={() => setError('')} />

      {loading ? (
        <div className="loading-inline"><div className="spinner sm" /></div>
      ) : (
        <AvailabilityCard data={todayData} title="Today's Availability" />
      )}

      <div className="card form-card">
        <h2>Check by Date</h2>
        <div className="inline-form">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchByDate}>
            Check
          </button>
        </div>
        {dateData && <AvailabilityCard data={dateData} title={`Availability on ${date}`} />}
      </div>

      <div className="card form-card">
        <h2>Check by Department</h2>
        <div className="inline-form">
          <input
            type="text"
            placeholder="Department name"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchByDepartment}>
            Check
          </button>
        </div>
        {deptData && (
          <AvailabilityCard
            data={deptData}
            title={`${department} — ${date}`}
          />
        )}
      </div>
    </Layout>
  );
}
