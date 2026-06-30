import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';

export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'MANAGER' ? '/manager' : '/employee'} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await login(form);
      navigate(response.role === 'MANAGER' ? '/manager' : '/employee');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel-left">
        <div className="auth-branding">
          <span className="brand-mark lg">LF</span>
          <h1>LeaveFlow</h1>
          <p className="tagline">Streamlined leave management for modern teams</p>
          <ul className="feature-list">
            <li>Apply and track leave requests</li>
            <li>Manager approvals in one place</li>
            <li>Real-time team availability</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel auth-panel-right">
        <div className="auth-form-container">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
