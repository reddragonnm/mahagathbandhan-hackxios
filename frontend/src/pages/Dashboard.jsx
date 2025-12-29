"use client";

import { useState, useEffect } from "react";
import PanicButton from "../components/PanicButton";
import ChatWindow from "../components/ChatWindow";
import CPRMetronome from "../components/CPRMetronome";
import axios from "axios";
import { LogOut, Heart, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [mode, setMode] = useState("general");
  const [cprActive, setCprActive] = useState(false);
  const [history, setHistory] = useState(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (userId) {
      axios
        .get(`/api/medical-history?user_id=${userId}`)
        .then((res) => setHistory(res.data))
        .catch((err) => console.error(err));
    }
  }, [userId]);

  const handleEmergencyStart = (location) => {
    setMode("emergency");
  };

  const handleAction = (action) => {
    if (action === "start_metronome") {
      setCprActive(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-border backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                Sanjeevni
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors duration-200 font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Panic Button & Medical Info */}
          <div className="lg:col-span-2 space-y-6 animate-slide-left">
            {/* Emergency Trigger */}
            <div className="glass-primary p-8 rounded-2xl card-elevated flex flex-col items-center justify-center min-h-[450px]">
              <div className="mb-8 text-center">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
                  Emergency Trigger
                </h2>
                <p className="text-xs text-text-secondary/70">
                  Press the button below in case of emergency
                </p>
              </div>
              <PanicButton onEmergencyStart={handleEmergencyStart} />
              <p className="text-xs text-text-secondary mt-8 text-center max-w-xs">
                Your GPS location will be shared with emergency responders and
                saved to your profile.
              </p>
            </div>

            {/* Medical Summary Card */}
            <div className="glass-primary p-6 rounded-2xl card-elevated">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-accent" />
                  <h3 className="font-bold text-text-primary">Medical ID</h3>
                </div>
                <button className="text-accent hover:text-accent-dark text-xs font-bold uppercase transition-colors">
                  Edit
                </button>
              </div>
              {history ? (
                <div className="space-y-4 text-sm">
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-text-secondary text-xs uppercase tracking-wide block mb-1">
                      Blood Type
                    </span>
                    <span className="font-mono font-bold text-accent">
                      {history.blood_type || "Not Set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-xs uppercase tracking-wide block mb-1">
                      Allergies
                    </span>
                    <span className="text-text-primary">
                      {history.allergies || "None recorded"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary text-xs uppercase tracking-wide block mb-1">
                      Conditions
                    </span>
                    <span className="text-text-primary">
                      {history.conditions || "None recorded"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary text-sm italic animate-pulse">
                  Loading medical info...
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Chat Interface */}
          <div className="lg:col-span-3 h-full min-h-[600px] animate-slide-right">
            <ChatWindow mode={mode} setMode={setMode} onAction={handleAction} />
          </div>
        </div>
      </main>

      <CPRMetronome isActive={cprActive} onClose={() => setCprActive(false)} />
    </div>
  );
};
export default Dashboard;
