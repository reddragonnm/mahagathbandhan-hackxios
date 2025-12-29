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
        className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-accent to-accent-dark shadow-lg hover:shadow-2xl hover:shadow-accent/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white z-10 animate-glow-pulse font-bold"
      >
        <AlertCircle size={72} className="mb-4" strokeWidth={1.5} />
        <span className="text-3xl md:text-4xl tracking-wider">PANIC</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-primary p-8 rounded-2xl max-w-sm w-full card-elevated animate-fade-in">
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <h3 className="text-2xl font-bold text-text-primary">
              Emergency Alert
            </h3>
            <p className="text-sm text-text-secondary">
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
            <p className="font-bold text-lg text-text-primary">
              Acquiring Location...
            </p>
            <p className="text-text-secondary text-sm mt-2">
              Sending emergency alert
            </p>
          </div>
        )}

        {step === "confirmed" && location && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <CheckCircle
                className="text-success"
                size={56}
                strokeWidth={1.5}
              />
            </div>
            <p className="font-bold text-lg text-success mb-4">
              Help Requested
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Emergency alert sent to responders
              <br />
              <span className="font-mono text-text-primary text-xs mt-3 block bg-slate-900/50 p-3 rounded-lg">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </p>
            <p className="text-text-secondary text-xs animate-pulse">
              Connecting to emergency guidance...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanicButton;
