import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post('/api/signup', { 
                username: formData.username, 
                password: formData.password 
            });
            // Auto login or redirect to login
            alert("Account created! Please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-black mb-2 text-center">Create Account</h2>
                <p className="text-center text-gray-500 mb-8">Join Kiro Response</p>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50" required />
                    </div>
                    <button type="submit" className="w-full bg-black text-white p-4 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg">Sign Up</button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};
export default Signup;
