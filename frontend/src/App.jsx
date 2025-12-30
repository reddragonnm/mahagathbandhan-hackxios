"use client";

import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-text-primary">
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
