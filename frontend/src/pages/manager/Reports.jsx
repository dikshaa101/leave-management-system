import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, Alert } from '../../components/UI';
import { getAllEmployees } from '../../api/employee';
import {
  exportLeavesCsv,
  exportLeavesExcel,
  exportLeavesPdf,
  exportBalancesExcel,
  exportHolidaysPdf,
  exportPoliciesPdf,
} from '../../api/report';

const managerLinks = [
  { to: '/manager', label: 'Dashboard', end: true },
  { to: '/manager/pending', label: 'Pending Approvals' },
  { to: '/manager/leaves', label: 'All Leaves' },
  { to: '/manager/employees', label: 'Employees' },
  { to: '/manager/availability', label: 'Team Availability' },
  { to: '/manager/holidays', label: 'Holidays' },
  { to: '/manager/leave-policies', label: 'Leave Policies' },
  { to: '/manager/reports', label: 'Reports' },
  { to: '/manager/profile', label: 'Profile' },
];

const LEAVE_TYPES = ['ANNUAL', 'CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY'];
const LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const REPORT_TYPES = [
  {
    value: 'LEAVES',
    label: 'Leave Requests',
    formats: [
      { value: 'csv', label: 'CSV' },
      { value: 'excel', label: 'Excel (.xlsx)' },
      { value: 'pdf', label: 'PDF' },
    ],
    showFilters: true,
  },
  {
    value: 'BALANCES',
    label: 'Employee Leave Balance Report',
    formats: [{ value: 'excel', label: 'Excel (.xlsx)' }],
    showFilters: true,
    hideStatusAndDates: true,
  },
  {
    value: 'HOLIDAYS',
    label: 'Holiday List',
    formats: [{ value: 'pdf', label: 'PDF' }],
    showFilters: false,
  },
  {
    value: 'POLICIES',
    label: 'Leave Policy Report',
    formats: [{ value: 'pdf', label: 'PDF' }],
    showFilters: false,
  },
];

const emptyFilters = {
  employeeId: '',
  department: '',
  leaveType: '',
  status: '',
  startDate: '',
  endDate: '',
};

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [reportType, setReportType] = useState('LEAVES');
  const [format, setFormat] = useState('csv');
  const [filters, setFilters] = useState(emptyFilters);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(() => setEmployees([]));
  }, []);

  const currentReportConfig = useMemo(
    () => REPORT_TYPES.find((r) => r.value === reportType),
    [reportType]
  );

  const departments = useMemo(() => {
    const unique = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(unique).sort();
  }, [employees]);

  const handleReportTypeChange = (e) => {
    const nextType = e.target.value;
    const config = REPORT_TYPES.find((r) => r.value === nextType);
    setReportType(nextType);
    setFormat(config.formats[0].value);
    setFilters(emptyFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setSuccess('');
    try {
      const activeFilters = {
        employeeId: filters.employeeId || undefined,
        department: filters.department || undefined,
        leaveType: filters.leaveType || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      if (reportType === 'LEAVES') {
        if (format === 'csv') await exportLeavesCsv(activeFilters);
        else if (format === 'excel') await exportLeavesExcel(activeFilters);
        else await exportLeavesPdf(activeFilters);
      } else if (reportType === 'BALANCES') {
        await exportBalancesExcel(activeFilters);
      } else if (reportType === 'HOLIDAYS') {
        await exportHolidaysPdf();
      } else if (reportType === 'POLICIES') {
        await exportPoliciesPdf();
      }

      setSuccess('Report downloaded successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="Report Export"
        subtitle="Generate and download leave-related reports for your company"
      />

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card form-card">
        <h2>Generate Report</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="reportType">Report Type</label>
            <select id="reportType" value={reportType} onChange={handleReportTypeChange}>
              {REPORT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="format">Export Format</label>
            <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
              {currentReportConfig.formats.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {currentReportConfig.showFilters && (
            <>
              <div className="form-group">
                <label htmlFor="employeeId">Employee</label>
                <select id="employeeId" name="employeeId" value={filters.employeeId} onChange={handleFilterChange}>
                  <option value="">All employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select id="department" name="department" value={filters.department} onChange={handleFilterChange}>
                  <option value="">All departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="leaveType">Leave Type</label>
                <select id="leaveType" name="leaveType" value={filters.leaveType} onChange={handleFilterChange}>
                  <option value="">All leave types</option>
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {!currentReportConfig.hideStatusAndDates && (
                <>
                  <div className="form-group">
                    <label htmlFor="status">Leave Status</label>
                    <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="">All statuses</option>
                      {LEAVE_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
