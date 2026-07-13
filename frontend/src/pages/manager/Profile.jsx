import Layout from '../../components/Layout';
import { ProfileContent } from '../employee/Profile';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/holidays', label: 'Holidays' },
  { to: '/manager/profile', label: 'Profile' },
];

export default function ManagerProfile() {
  return (
    <Layout links={managerLinks}>
      <ProfileContent />
    </Layout>
  );
}
