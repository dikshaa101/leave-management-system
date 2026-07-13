import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, EmptyState, Alert } from '../../components/UI';
import {
  getManagerPolicies,
  createPolicy,
  updatePolicy,
  updatePolicyStatus,
  deletePolicy,
} from '../../api/leavePolicy';

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

const emptyForm = {
  leaveType: 'ANNUAL',
  totalLeaves: 0,
  description: '',
};

export default function LeavePolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadPolicies = () => {
    setLoading(true);
    getManagerPolicies()
      .then(setPolicies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const usedTypes = policies.map((p) => p.leaveType);
  const availableTypesForNew = LEAVE_TYPES.filter((t) => !usedTypes.includes(t));

  const openAdd = () => {
    setForm({ ...emptyForm, leaveType: availableTypesForNew[0] || LEAVE_TYPES[0] });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (policy) => {
    setForm({
      leaveType: policy.leaveType,
      totalLeaves: policy.totalLeaves,
      description: policy.description || '',
    });
    setEditingId(policy.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'totalLeaves' ? value : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        totalLeaves: Number(form.totalLeaves),
      };
      if (editingId) {
        await updatePolicy(editingId, payload);
        setSuccess('Leave policy updated successfully');
      } else {
        await createPolicy(payload);
        setSuccess('Leave policy created successfully');
      }
      setShowForm(false);
      loadPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (policy) => {
    setBusyId(policy.id);
    setError('');
    setSuccess('');
    try {
      await updatePolicyStatus(policy.id, !policy.active);
      setSuccess(`Policy ${policy.active ? 'deactivated' : 'activated'}`);
      loadPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (policy) => {
    if (!window.confirm(`Delete the ${policy.leaveType} policy? This cannot be undone.`)) return;
    setBusyId(policy.id);
    setError('');
    setSuccess('');
    try {
      await deletePolicy(policy.id);
      setSuccess('Leave policy deleted');
      loadPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="Leave Policy Management"
        subtitle="Configure how many days of each leave type your company grants"
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAdd}
            disabled={availableTypesForNew.length === 0 && !editingId}
          >
            Add Policy
          </button>
        }
      />

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <div className="card form-card">
          <h2>{editingId ? 'Edit Leave Policy' : 'Add Leave Policy'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="leaveType">Leave Type *</label>
              <select
                id="leaveType"
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                disabled={!!editingId}
                required
              >
                {(editingId ? LEAVE_TYPES : availableTypesForNew).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="totalLeaves">Total Leaves (days) *</label>
              <input
                id="totalLeaves"
                name="totalLeaves"
                type="number"
                min="0"
                value={form.totalLeaves}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : policies.length === 0 ? (
          <EmptyState title="No leave policies" description="Add your company's first leave policy." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Total Leaves</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>{policy.leaveType}</td>
                    <td>{policy.totalLeaves} days</td>
                    <td className="truncate">{policy.description || '—'}</td>
                    <td>
                      <span className={`badge ${policy.active ? 'badge-approved' : 'badge-rejected'}`}>
                        {policy.active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(policy)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={busyId === policy.id}
                        onClick={() => handleToggleStatus(policy)}
                      >
                        {busyId === policy.id ? '...' : policy.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busyId === policy.id}
                        onClick={() => handleDelete(policy)}
                      >
                        {busyId === policy.id ? '...' : 'Delete'}
                      </button>
                    </td>
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
