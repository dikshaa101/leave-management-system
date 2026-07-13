import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageHeader, formatDate, EmptyState, Alert } from '../../components/UI';
import {
  getManagerHolidays,
  addHoliday,
  updateHoliday,
  deleteHoliday,
} from '../../api/holiday';

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

const emptyForm = {
  holidayName: '',
  holidayDate: '',
  description: '',
  optionalHoliday: false,
};

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadHolidays = () => {
    setLoading(true);
    getManagerHolidays()
      .then(setHolidays)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (holiday) => {
    setForm({
      holidayName: holiday.holidayName || '',
      holidayDate: holiday.holidayDate || '',
      description: holiday.description || '',
      optionalHoliday: !!holiday.optionalHoliday,
    });
    setEditingId(holiday.id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await updateHoliday(editingId, form);
        setSuccess('Holiday updated successfully');
      } else {
        await addHoliday(form);
        setSuccess('Holiday added successfully');
      }
      setShowForm(false);
      loadHolidays();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteHoliday(id);
      setSuccess('Holiday deleted');
      loadHolidays();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout links={managerLinks}>
      <PageHeader
        title="Holiday Management"
        subtitle="Manage your company's holiday calendar"
        action={
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Holiday
          </button>
        }
      />

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <div className="card form-card">
          <h2>{editingId ? 'Edit Holiday' : 'Add Holiday'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="holidayName">Holiday Name *</label>
              <input
                id="holidayName"
                name="holidayName"
                value={form.holidayName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="holidayDate">Date *</label>
              <input
                id="holidayDate"
                name="holidayDate"
                type="date"
                value={form.holidayDate}
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
            <div className="form-group">
              <label htmlFor="optionalHoliday">
                <input
                  id="optionalHoliday"
                  name="optionalHoliday"
                  type="checkbox"
                  checked={form.optionalHoliday}
                  onChange={handleChange}
                />
                Optional holiday
              </label>
            </div>
            <div className="form-actions full-width">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Holiday'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-inline"><div className="spinner sm" /></div>
        ) : holidays.length === 0 ? (
          <EmptyState title="No holidays" description="Add your company's first holiday." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.id}>
                    <td>{holiday.holidayName}</td>
                    <td>{formatDate(holiday.holidayDate)}</td>
                    <td className="truncate">{holiday.description || '—'}</td>
                    <td>
                      <span className={`badge ${holiday.optionalHoliday ? 'badge-pending' : 'badge-approved'}`}>
                        {holiday.optionalHoliday ? 'optional' : 'mandatory'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(holiday)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === holiday.id}
                        onClick={() => handleDelete(holiday.id)}
                      >
                        {deletingId === holiday.id ? '...' : 'Delete'}
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
