import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/login', { username, password });
            localStorage.setItem('user_id', res.data.user_id);
            setUser(res.data.user_id);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-primary p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
                <h2 className="text-3xl font-black mb-2 text-center text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="text-center text-gray-500 dark:text-slate-400 mb-8">Access your SanjeevniAI dashboard</p>
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm font-medium text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Username</label>
                        <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="input-base w-full" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Password</label>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input-base w-full" required />
                    </div>
                    <button type="submit" className="btn-primary w-full shadow-lg shadow-red-900/20">Sign In</button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account? <Link to="/signup" className="text-red-400 font-bold hover:text-red-300 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};
export default Login;
