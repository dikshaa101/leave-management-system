import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PageHeader, Alert, LeaveTypeOptions } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { applyLeave } from '../../api/leave';

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/apply', label: 'Apply Leave' },
  { to: '/employee/leaves', label: 'My Leaves' },
  { to: '/employee/holidays', label: 'Holidays' },
  { to: '/employee/profile', label: 'Profile' },
];

export default function ApplyLeave() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'CASUAL',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <Layout links={employeeLinks}>
      <PageHeader
        title="Apply for Leave"
        subtitle={`You have ${profile?.leaveBalance ?? 0} days remaining in your balance`}
      />

      <div className="card form-card">
        <Alert message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} />

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
              <LeaveTypeOptions />
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
      </div>
    </Layout>
  );
}
