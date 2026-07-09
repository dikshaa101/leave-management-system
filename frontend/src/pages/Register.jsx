import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { Alert } from '../components/UI';

const initialForm = {
  username: '',
  password: '',
  role: 'EMPLOYEE',
  companyCode: '',
  companyName: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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

    const payload = {
      ...form,
      joiningDate: form.joiningDate || null,
    };

    try {
      await register(payload);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-panel auth-panel-left">
        <div className="auth-branding">
          <span className="brand-mark lg">LF</span>
          <h1>Join LeaveFlow</h1>
          <p className="tagline">Create your account and start managing leave effortlessly</p>
        </div>
      </div>

      <div className="auth-panel auth-panel-right scrollable">
        <div className="auth-form-container wide">
          <h2>Create account</h2>
          <p className="auth-subtitle">Fill in your details to get started</p>

          <Alert message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select id="role" name="role" value={form.role} onChange={handleChange}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyCode">Company Code *</label>
                <input
                  id="companyCode"
                  name="companyCode"
                  value={form.companyCode}
                  onChange={handleChange}
                  required
                />
              </div>
              {form.role === 'MANAGER' ? (
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <div className="form-group" />
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation *</label>
                <input
                  id="designation"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="joiningDate">Joining Date *</label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
