"use client";

import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user_id"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(localStorage.getItem("user_id"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-text-primary transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;
