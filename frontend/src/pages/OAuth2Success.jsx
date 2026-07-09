import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2Success() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { loginWithToken } = useAuth();

  const token = params.get('token');
  const username = params.get('username');
  const role = params.get('role');

  useEffect(() => {
    async function authenticate() {
      if (!token || !username || !role) {
        navigate('/login');
        return;
      }

      try {
        await loginWithToken({
          token,
          username,
          role,
        });

        navigate(role === 'MANAGER' ? '/manager' : '/employee', {
          replace: true,
        });
      } catch (err) {
        navigate('/login');
      }
    }

    authenticate();
  }, [token, username, role, loginWithToken, navigate]);

  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}