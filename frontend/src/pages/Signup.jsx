import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    blood_type: "",
    allergies: "",
    conditions: "",
    medications: "",
  });
  const [error, setError] = useState("");
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
      await axios.post("https://reddragonnm.pythonanywhere.com/api/signup", {
        username: formData.username,
        password: formData.password,
        blood_type: formData.blood_type,
        allergies: formData.allergies,
        conditions: formData.conditions,
        medications: formData.medications,
      });
      // Auto login or redirect to login
      alert("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-primary p-8 rounded-2xl shadow-2xl w-full max-w-md my-8 animate-fade-in">
        <h2 className="text-3xl font-black mb-2 text-center text-gray-900 dark:text-white">
          Create Account
        </h2>
        <p className="text-center text-gray-500 dark:text-slate-400 mb-8">
          Join SanjeevniAI Response
        </p>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm font-medium text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-base w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-base w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-base w-full"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-4">
              Medical Profile (Optional)
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleChange}
                    placeholder="e.g. O+"
                    className="input-base w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Peanuts"
                    className="input-base w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Conditions
                </label>
                <input
                  type="text"
                  name="conditions"
                  value={formData.conditions}
                  onChange={handleChange}
                  placeholder="e.g. Asthma, Diabetes"
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Medications
                </label>
                <input
                  type="text"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                  placeholder="e.g. Insulin"
                  className="input-base w-full"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full shadow-lg shadow-red-900/20 mt-6"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-400 font-bold hover:text-red-300 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signup;
