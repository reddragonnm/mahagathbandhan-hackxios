import React, { useState, useEffect, useRef } from 'react';

const CPRMetronome = ({ isActive, onClose }) => {
    const [count, setCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const audioContextRef = useRef(null);

    useEffect(() => {
        let interval;
        if (isActive && isRunning) {
            // Ensure context is running
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            interval = setInterval(() => {
                setCount(c => c + 1);
                playBeep();
            }, 550); // ~110 BPM
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, isRunning]);

    const handleStart = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
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
        oscillator.type = 'square';
        oscillator.frequency.value = 800; // High pitch for clarity
        gainNode.gain.value = 0.5;
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
    };

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl text-center max-w-sm w-full mx-4 shadow-2xl border-4 border-red-500 relative">
                 <h2 className="text-3xl font-black text-red-600 mb-6 tracking-tight">CPR ASSIST</h2>
                 
                 {!isRunning ? (
                     <div className="py-8">
                         <button 
                            onClick={handleStart}
                            className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] transition-all hover:scale-105 flex items-center justify-center animate-pulse"
                         >
                            TAP TO<br/>START
                         </button>
                         <p className="mt-6 text-gray-500 font-medium">Get Ready</p>
                     </div>
                 ) : (
                     <>
                         {/* Visual CPR Indicator */}
                         <div className={`w-48 h-48 bg-red-600 rounded-full flex flex-col items-center justify-center mx-auto mb-8 relative overflow-hidden transition-transform duration-100 ${count % 2 === 0 ? 'scale-110 shadow-[0_0_60px_rgba(220,38,38,0.8)]' : 'scale-100 shadow-none'}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-24 h-24 mb-2">
                                <path d="M12 21.5c-4 0-7-3-7-7v-2h14v2c0 4-3 7-7 7z"/>
                                <path d="M12 21.5V12"/>
                                <path d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5"/>
                            </svg>
                            <span className="text-white text-4xl font-black tracking-widest">PUSH</span>
                         </div>
                         <p className="text-2xl mb-8 font-bold text-gray-800">110 BPM</p>
                     </>
                 )}

                 <button onClick={handleStop} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold w-full transition-colors text-lg uppercase tracking-wider">
                    Stop CPR Guide
                 </button>
            </div>
        </div>
    );
};
export default CPRMetronome;
