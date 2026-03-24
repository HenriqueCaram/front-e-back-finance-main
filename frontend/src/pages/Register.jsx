import { useState } from 'react';
import { api } from '../services/api';

const Register = ({ setUser, setShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password too short (min 8)';
    if (pwd.includes(' ')) return 'No spaces allowed';
    if (!/\d/.test(pwd)) return 'Must contain number';
    if (!/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'Must contain special char';
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    try {
      const response = await api.post('/register', { user: username, password });
      setSuccess('User created! Please login.');
      setError('');
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">Create account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              name="username"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center p-3 bg-red-900/30 rounded">{error}</div>}
          {success && <div className="text-green-400 text-sm text-center p-3 bg-green-900/30 rounded">{success}</div>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
            >
              Create Account
            </button>
          </div>
          <div className="text-center">
            <a href="#" onClick={() => setShowRegister(false)} className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Already have account? Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

