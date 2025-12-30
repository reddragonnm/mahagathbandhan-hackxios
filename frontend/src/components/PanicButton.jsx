"use client";

import { useState } from "react";
import { AlertCircle, Navigation, CheckCircle } from "lucide-react";

const PanicButton = ({ onEmergencyStart }) => {
  const [step, setStep] = useState("idle");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(null);

  const handlePanicClick = () => {
    setStep("phone");
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setStep("locating");

    if (!navigator.geolocation) {
      handleLocationFound({ lat: 0, lng: 0 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationFound({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        handleLocationFound({ lat: 0, lng: 0 });
      },
      { timeout: 10000 }
    );
  };

  const handleLocationFound = (loc) => {
    setLocation(loc);
    setStep("confirmed");
    setTimeout(() => {
      onEmergencyStart(loc);
      setStep("idle");
    }, 3000);
  };

  if (step === "idle") {
    return (
      <button
        onClick={handlePanicClick}
        className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:bg-red-700 hover:shadow-[0_0_60px_rgba(239,68,68,0.7)] hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center text-white z-10"
      >
        <AlertCircle size={48} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-primary p-8 rounded-2xl max-w-sm w-full card-elevated animate-fade-in">
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Emergency Alert
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter mobile number for emergency updates (optional)
            </p>
            <input
              type="tel"
              className="input-base w-full text-lg"
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep("idle")}
                className="btn-secondary px-6 py-2 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6 py-2 text-sm">
                Next
              </button>
            </div>
          </form>
        )}

        {step === "locating" && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <Navigation
                className="animate-spin text-accent"
                size={48}
                strokeWidth={1.5}
              />
            </div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              Acquiring Location...
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              Sending emergency alert
            </p>
          </div>
        )}

        {step === "confirmed" && location && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={56}
                strokeWidth={1.5}
              />
            </div>
            <p className="font-bold text-lg text-green-600 dark:text-green-400 mb-4">
              Help Requested
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Emergency alert sent to responders
              <br />
              <span className="font-mono text-gray-900 dark:text-white text-xs mt-3 block bg-slate-900/50 p-3 rounded-lg">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xs animate-pulse">
              Connecting to emergency guidance...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanicButton;
