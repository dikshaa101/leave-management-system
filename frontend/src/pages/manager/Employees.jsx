import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, formatDate, EmptyState, Alert } from '../../components/UI';
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../api/employee';

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

const emptyForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: '',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = () => {
    setLoading(true);
    getAllEmployees()
      .then(setEmployees)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (emp) => {
    setForm({
      username: '',
      password: '',
      fullName: emp.fullName || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      joiningDate: emp.joiningDate || '',
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await updateEmployee(editingId, form);
        setSuccess('Employee updated successfully');
      } else {
        await addEmployee(form);
        setSuccess('Employee added successfully');
      }
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee record?')) return;
    try {
      await deleteEmployee(id);
      setSuccess('Employee deleted');
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="Employees"
        subtitle="Manage employee records"
        action={
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Employee
          </button>
        }
      />

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <div className="card form-card">
          <h2>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            {!editingId && (
              <>
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input id="username" name="username" value={form.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input id="department" name="department" value={form.department} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="designation">Designation *</label>
              <input id="designation" name="designation" value={form.designation} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="joiningDate">Joining Date *</label>
              <input id="joiningDate" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} required />
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : employees.length === 0 ? (
          <EmptyState title="No employees" description="Add your first employee record." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Balance</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.fullName}</td>
                    <td>{emp.email || '—'}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td className="truncate">
                      {emp.leaveBalances?.length
                        ? emp.leaveBalances
                            .map((b) => `${b.leaveType}: ${b.remainingBalance}`)
                            .join(', ')
                        : '—'}
                    </td>
                    <td>{formatDate(emp.joiningDate)}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>
                        Delete
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
