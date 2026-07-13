import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PageHeader, Alert } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { applyLeave } from '../../api/leave';
import { getEmployeePolicies, getMyLeaveBalances } from '../../api/leavePolicy';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/holidays', label: 'Holidays' },
  { to: '/employee/balances', label: 'Leave Balances' },
  { to: '/employee/profile', label: 'Profile' },
];

export default function ApplyLeave() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getEmployeePolicies(), getMyLeaveBalances()])
      .then(([policyData, balanceData]) => {
        setPolicies(policyData);
        setBalances(balanceData);
        if (policyData.length > 0) {
          setForm((prev) => ({ ...prev, leaveType: policyData[0].leaveType }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPolicies(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await applyLeave(form);
      setSuccess('Leave request submitted successfully!');
      await refreshProfile();
      setTimeout(() => navigate('/employee/leaves'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBalance = balances.find((b) => b.leaveType === form.leaveType);

  return (
    <Layout links={employeeLinks}>
      <PageHeader
        title="Apply for Leave"
        subtitle={
          selectedBalance
            ? `You have ${selectedBalance.remainingBalance} ${form.leaveType} day(s) remaining`
            : 'Choose a leave type to see your remaining balance'
        }
      />

      <div className="card form-card">
        <Alert message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} />

        {!loadingPolicies && policies.length === 0 ? (
          <Alert
            type="error"
            message="Your company has not configured any leave policies yet. Please contact your manager."
          />
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="leaveType">Leave Type *</label>
              <select
                id="leaveType"
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                required
              >
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.leaveType}>
                    {policy.leaveType} ({policy.totalLeaves} days/year)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="reason">Reason</label>
              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Briefly describe the reason for your leave..."
              />
            </div>

            <div className="form-actions full-width">
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/employee')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
