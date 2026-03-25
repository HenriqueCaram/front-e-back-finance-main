import { useState } from 'react';
import { api } from '../services/api';

const Register = ({ setUser, setShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg className={`h-5 w-5 ${showPassword ? 'text-gray-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878m4.242 4.242a3 3 0 11-4.242-4.242 3 3 0 014.242 4.242zM15.97 5.677a9.97 9.97 0 011.236 3.833M15.97 5.677a13.134 13.134 0 016.679 6.679M7.323 4.021a13.134 13.134 0 01-3.69 6.689m0 0a9.97 9.97 0 001.563 3.029m0 0a10.05 10.05 0 013.682 3.682" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 16.943 7.523 19 12 19c4.478 0 8.268-2.943 9.543-7a9.97 9.97 0 00-2.3-3.833m-4.75-2.679A13.134 13.134 0 0112 6c-4.478 0-8.268 2.943-9.543 7a9.97 9.97 0 002.3 3.833" />
                  </svg>
              </button>
            </div>
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

