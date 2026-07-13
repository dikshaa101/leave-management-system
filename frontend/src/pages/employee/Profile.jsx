import Layout from '../../components/Layout';
import { PageHeader, formatDate } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/holidays', label: 'Holidays' },
  { to: '/employee/profile', label: 'Profile' },
];

export function ProfileContent() {
  const { profile, user } = useAuth();

  if (!profile) {
    return <div className="loading-inline"><div className="spinner sm" /></div>;
  }

  const fields = [
    { label: 'Full Name', value: profile.fullName },
    { label: 'Username', value: user?.username },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone },
    { label: 'Department', value: profile.department },
    { label: 'Designation', value: profile.designation },
    { label: 'Joining Date', value: formatDate(profile.joiningDate) },
    { label: 'Leave Balance', value: `${profile.leaveBalance} days` },
  ];

  return (
    <>
      <PageHeader title="My Profile" subtitle="Your employee information" />
      <div className="card profile-card">
        <div className="profile-avatar">
          {profile.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="profile-details">
          {fields.map((field) => (
            <div key={field.label} className="profile-field">
              <span className="field-label">{field.label}</span>
              <span className="field-value">{field.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function EmployeeProfile() {
  return (
    <Layout links={employeeLinks}>
      <ProfileContent />
    </Layout>
  );
}
