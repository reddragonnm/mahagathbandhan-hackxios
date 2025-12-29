"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause } from "lucide-react";

const CPRMetronome = ({ isActive, onClose }) => {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const audioContextRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isActive && isRunning) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      interval = setInterval(() => {
        setCount((c) => c + 1);
        playBeep();
      }, 550);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isRunning]);

  const handleStart = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    audioContextRef.current.resume().then(() => {
      setIsRunning(true);
    });
  };

  const handleStop = () => {
    setIsRunning(false);
    setCount(0);
    onClose();
  };

  const playBeep = () => {
    if (!audioContextRef.current) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.3;
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-primary p-8 rounded-2xl text-center max-w-sm w-full card-elevated animate-fade-in relative">
        <button
          onClick={handleStop}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X size={20} className="text-text-secondary" />
        </button>

        <h2 className="text-3xl font-bold text-accent mb-2 tracking-tight">
          CPR ASSISTANT
        </h2>
        <p className="text-text-secondary text-sm mb-8">110 BPM Compressions</p>

        {!isRunning ? (
          <div className="py-12">
            <button
              onClick={handleStart}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-accent to-accent-dark hover:shadow-2xl hover:shadow-accent/50 text-white font-black text-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center flex-col gap-2 animate-glow-pulse"
            >
              <Play size={48} fill="currentColor" />
              <span>START</span>
            </button>
            <p className="mt-6 text-text-secondary font-medium text-sm">
              Be ready to provide CPR
            </p>
          </div>
        ) : (
          <>
            <div
              className={`w-56 h-56 bg-gradient-to-br from-accent to-accent-dark rounded-full flex flex-col items-center justify-center mx-auto mb-8 relative overflow-hidden transition-transform duration-100 shadow-lg ${
                count % 2 === 0
                  ? "scale-110 shadow-2xl shadow-accent/50"
                  : "scale-100"
              }`}
            >
              <span className="text-white text-5xl font-black tracking-widest">
                PUSH
              </span>
              <span className="text-white text-sm font-semibold mt-2 opacity-80">
                {count} compressions
              </span>
            </div>
            <div className="space-y-6">
              <button
                onClick={() => setIsRunning(false)}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
              >
                <Pause size={20} />
                Pause
              </button>
              <button
                onClick={handleStop}
                className="btn-primary w-full py-3 uppercase tracking-wide font-bold"
              >
                Stop CPR Guide
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CPRMetronome;
