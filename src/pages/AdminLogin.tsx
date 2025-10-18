import React from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Refresh token and check admin claim
      const currentAuth = getAuth();
      await currentAuth.currentUser?.getIdToken(true);
      const res = await currentAuth.currentUser?.getIdTokenResult();

      if (res?.claims?.admin) {
        // Set local redirect hint for development
        if (process.env.NODE_ENV !== 'production') {
          localStorage.setItem('admin_authenticated', 'true');
        }
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('This account does not have admin privileges.');
        // Sign out if not admin
        await currentAuth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to access admin panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to App
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
