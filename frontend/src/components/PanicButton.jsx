import React, { useState } from 'react';
import { AlertCircle, Navigation } from 'lucide-react';

const PanicButton = ({ onEmergencyStart }) => {
    const [step, setStep] = useState('idle'); // idle, phone, locating, confirmed
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState(null);

    const handlePanicClick = () => {
        setStep('phone');
    };

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        setStep('locating');
        
        if (!navigator.geolocation) {
             handleLocationFound({ lat: 0, lng: 0 });
             return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleLocationFound({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => {
                console.error(err);
                handleLocationFound({ lat: 0, lng: 0 }); // Fallback
            },
            { timeout: 10000 }
        );
    };

    const handleLocationFound = (loc) => {
        setLocation(loc);
        setStep('confirmed');
        setTimeout(() => {
            onEmergencyStart(loc); 
            setStep('idle');
        }, 3000);
    };

    if (step === 'idle') {
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl animate-fade-in">
                {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit}>
                        <h3 className="text-xl font-bold mb-4">Emergency Contact</h3>
                        <p className="text-sm text-gray-600 mb-4">Enter mobile number for updates (optional)</p>
                        <input 
                            type="tel" 
                            className="w-full border p-3 rounded mb-4 text-lg focus:ring-2 focus:ring-red-500 outline-none" 
                            placeholder="Mobile Number"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setStep('idle')} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors">Next</button>
                        </div>
                    </form>
                )}

                {step === 'locating' && (
                     <div className="text-center py-8">
                         <Navigation className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
                         <p className="font-bold text-lg">Acquiring GPS Location...</p>
                     </div>
                )}

                {step === 'confirmed' && location && (
                    <div className="text-center py-4">
                        <div className="text-green-600 mb-2 font-bold text-xl flex items-center justify-center gap-2">
                            <span>✓</span> HELP REQUESTED
                        </div>
                        <p className="mb-6 text-gray-700">
                            Emergency alert sent with location:<br/>
                            <span className="font-mono bg-gray-100 p-1 rounded inline-block mt-2">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                        </p>
                        <p className="text-sm text-gray-500 animate-pulse">Connecting to emergency guidance...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanicButton;
