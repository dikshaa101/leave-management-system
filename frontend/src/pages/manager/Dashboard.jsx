import { useCallback, useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, Alert } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { getPendingLeaves, approveLeave, rejectLeave } from '../../api/manager';
import { getAllLeaves } from '../../api/leave';
import { getTodayAvailability } from '../../api/team';
import { getAllEmployees } from '../../api/employee';

import DashboardStats from '../../components/dashboard/DashboardStats';
import TeamAvailabilityPanel from '../../components/dashboard/TeamAvailabilityPanel';
import ApprovalChart from '../../components/dashboard/ApprovalChart';
import LeaveTypeDemand from '../../components/dashboard/LeaveTypeDemand';
import LeaveTrend from '../../components/dashboard/LeaveTrend';
import LeaveBalanceDistribution from '../../components/dashboard/LeaveBalanceDistribution';
import PendingRequestsTable from '../../components/dashboard/PendingRequestsTable';
import RecentActivity, { buildActivityFeed } from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import { countBy, getMonthlyLeaveTrend, getBalanceBands, isToday } from '../../components/dashboard/dashboardUtils';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/profile', label: 'Profile' },
];

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const [pending, setPending] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    return Promise.all([
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
      .catch((err) => setError(err.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleApprove = async (id) => {
    setActionId(id);
    setError('');
    setSuccess('');
    try {
      await approveLeave(id);
      setSuccess('Leave approved successfully');
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Failed to approve leave');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    setError('');
    setSuccess('');
    try {
      await rejectLeave(id);
      setSuccess('Leave rejected');
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Failed to reject leave');
    } finally {
      setActionId(null);
    }
  };

  const approved = allLeaves.filter((l) => l.status === 'APPROVED').length;
  const rejected = allLeaves.filter((l) => l.status === 'REJECTED').length;
  const cancelled = allLeaves.filter((l) => l.status === 'CANCELLED').length;
  const employeeCount = employees.length;

  const approvedToday = allLeaves.filter(
    (l) => l.status === 'APPROVED' && isToday(l.actionDate)
  ).length;
  const onLeaveToday = availability?.employeesOnLeave ?? 0;

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
    ? Math.round(
        employees.reduce((sum, employee) => sum + Number(employee.leaveBalance || 0), 0) / employeeCount
      )
    : 0;

  const activityFeed = buildActivityFeed(allLeaves, employees);

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title={`Welcome, ${profile?.fullName?.split(' ')[0] || 'Manager'}`}
        subtitle="Manage team leave requests and availability"
      />

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <DashboardStats
        totalEmployees={employeeCount}
        pendingRequests={pending.length}
        onLeaveToday={onLeaveToday}
        approvedToday={approvedToday}
      />

      <TeamAvailabilityPanel availability={availability} />

      <div className="analytics-grid">
        <ApprovalChart statusData={statusData} totalRequests={allLeaves.length} />
        <LeaveTypeDemand typeData={typeData} />
        <LeaveTrend monthlyTrend={monthlyTrend} />
        <LeaveBalanceDistribution balanceBands={balanceBands} averageBalance={averageBalance} />
      </div>

      <PendingRequestsTable
        pending={pending}
        loading={loading}
        actionId={actionId}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <RecentActivity activity={activityFeed} />

      <QuickActions />
    </Layout>
  );
}
