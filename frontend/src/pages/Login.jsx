"use client";

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/login", { username, password });
      localStorage.setItem("user_id", res.data.user_id);
      setUser(res.data.user_id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black mb-2 text-center">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">
          Access your SanjeevniAI dashboard
        </p>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white p-4 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
