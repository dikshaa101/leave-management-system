import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ links }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to={user?.role === 'MANAGER' ? '/manager' : '/employee'} className="brand">
          <span className="brand-mark">LF</span>
          <span className="brand-text">LeaveFlow</span>
        </NavLink>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={link.end}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{profile?.fullName || user?.username}</span>
            <span className="user-role">{user?.role?.toLowerCase()}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
