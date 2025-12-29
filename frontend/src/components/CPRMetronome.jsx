import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';

const CPRMetronome = ({ isActive, onClose }) => {
    const [count, setCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Initialize Audio on mount
    useEffect(() => {
        try {
            const audio = new Audio('/metronome.mp3');
            audio.preload = 'auto';
            audioRef.current = audio;
        } catch (e) {
            console.error("Failed to initialize audio", e);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    // Handle Timer & Playback
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCount(c => c + 1);
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(err => console.warn("Audio play error:", err));
                }
            }, 550); // ~110 BPM
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleClose = () => {
        setIsPlaying(false);
        setCount(0);
        onClose();
    };

    const handleStop = () => {
        setIsPlaying(false);
        setCount(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    // Component is only mounted when isActive is true, so we can just render
    return (
        <div className="w-full bg-white p-6 rounded-3xl shadow-xl border-2 border-red-500 animate-fade-in relative mb-6">
             <div className="flex justify-between items-start mb-4">
                 <h2 className="text-2xl font-black text-red-600 tracking-tight">CPR ASSIST</h2>
                 <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full">
                    <X size={20} />
                 </button>
             </div>
             
             {!isPlaying && count === 0 ? (
                 <div className="py-4 flex flex-col items-center">
                     <button 
                        onClick={() => setIsPlaying(true)}
                        className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 flex items-center justify-center animate-pulse text-center leading-tight"
                     >
                        TAP TO<br/>START
                     </button>
                     <p className="mt-4 text-gray-500 font-medium text-sm">Get Ready</p>
                 </div>
             ) : (
                 <div className="flex flex-col items-center">
                     {/* Visual CPR Indicator */}
                     <div className={`w-32 h-32 bg-red-600 rounded-full flex flex-col items-center justify-center mb-6 relative overflow-hidden transition-transform duration-100 ${count % 2 === 0 && isPlaying ? 'scale-110 shadow-[0_0_40px_rgba(220,38,38,0.6)]' : 'scale-100 shadow-none'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-16 h-16 mb-1">
                            <path d="M12 21.5c-4 0-7-3-7-7v-2h14v2c0 4-3 7-7 7z"/>
                            <path d="M12 21.5V12"/>
                            <path d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5"/>
                        </svg>
                        <span className="text-white text-2xl font-black tracking-widest">
                            {isPlaying ? (count % 2 === 0 ? 'PUSH' : 'PUSH') : 'PAUSED'}
                        </span>
                     </div>
                     
                     <div className="w-full">
                         <button 
                            onClick={handleStop}
                            className="w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider bg-gray-900 hover:bg-black text-white transition-colors flex items-center justify-center gap-2"
                            title="Reset Metronome"
                         >
                            <X size={20} /> STOP GUIDANCE
                         </button>
                     </div>
                     
                     <p className="mt-3 text-gray-500 font-medium text-xs">100-120 Compressions/min</p>
                 </div>
             )}
        </div>
    );
};
export default CPRMetronome;