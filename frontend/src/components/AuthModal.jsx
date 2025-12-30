import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [medicalInfo, setMedicalInfo] = useState({
    allergies: '',
    conditions: '',
    blood_type: '',
    medications: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleMedicalInfoChange = (e) => {
    const { name, value } = e.target;
    setMedicalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post('/api/login', { username, password });
        localStorage.setItem('user_id', response.data.user_id);
        onLoginSuccess();
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await axios.post('/api/signup', {
          username,
          password,
          ...medicalInfo, // Include medical info in signup
        });
        // After signup, automatically try to log in the user
        const response = await axios.post('/api/login', { username, password });
        localStorage.setItem('user_id', response.data.user_id);
        onLoginSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow */}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-bold mb-4">Medical Information (Optional)</p>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="allergies">
                  Allergies
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={medicalInfo.allergies}
                  onChange={handleMedicalInfoChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="conditions">
                  Conditions
                </label>
                <input
                  type="text"
                  id="conditions"
                  name="conditions"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={medicalInfo.conditions}
                  onChange={handleMedicalInfoChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="blood_type">
                  Blood Type
                </label>
                <input
                  type="text"
                  id="blood_type"
                  name="blood_type"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={medicalInfo.blood_type}
                  onChange={handleMedicalInfoChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="medications">
                  Medications
                </label>
                <input
                  type="text"
                  id="medications"
                  name="medications"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={medicalInfo.medications}
                  onChange={handleMedicalInfoChange}
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(''); // Clear error when switching forms
              }}
              className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;