import React, { useState, useEffect } from 'react';
import PanicButton from '../components/PanicButton';
import ChatWindow from '../components/ChatWindow';
import CPRMetronome from '../components/CPRMetronome';
import axios from 'axios';

const Dashboard = () => {
    const [mode, setMode] = useState('general');
    const [cprActive, setCprActive] = useState(false);
    const [history, setHistory] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        blood_type: '',
        allergies: '',
        conditions: '',
        medications: ''
    });
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        // Fetch basic history for display
        if (userId) {
            axios.get(`/api/medical-history?user_id=${userId}`)
                .then(res => {
                    setHistory(res.data);
                    setEditForm(res.data);
                })
                .catch(err => console.error(err));
        }
    }, [userId]);

    const handleEmergencyStart = (location) => {
        setMode('emergency');
    };

    const handleAction = (action) => {
        if (action === 'start_metronome') {
            setCprActive(true);
        }
    };

    const handleSaveHistory = async () => {
        try {
            await axios.post('/api/medical-history', {
                user_id: userId,
                ...editForm
            });
            setHistory(editForm);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save history", err);
            alert("Failed to save changes");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">SanjeevniAI<span className="text-red-600">.</span></h1>
                <button 
                    onClick={() => { localStorage.removeItem('user_id'); window.dispatchEvent(new Event('storage')); window.location.href = '/login'; }}
                    className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                    Log Out
                </button>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Panic Button & Status */}
                <div className="lg:col-span-5 space-y-6">
                    {cprActive && <CPRMetronome isActive={cprActive} onClose={() => setCprActive(false)} />}
                    
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                         <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-8">Emergency Trigger</h2>
                         <PanicButton onEmergencyStart={handleEmergencyStart} />
                         <p className="text-gray-400 text-xs mt-8">GPS Location will be shared with responders.</p>
                         
                         {/* Persistent CPR Button */}
                         <button 
                            onClick={() => setCprActive(true)}
                            className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.5c-4 0-7-3-7-7v-2h14v2c0 4-3 7-7 7z"/><path d="M12 21.5V12"/><path d="M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5"/></svg>
                            Open CPR Metronome
                         </button>
                    </div>
                    
                    {/* Medical Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Medical ID</h3>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-gray-400 text-xs font-bold uppercase hover:text-gray-600">Cancel</button>
                                    <button onClick={handleSaveHistory} className="text-green-600 text-xs font-bold uppercase hover:text-green-700">Save</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="text-blue-600 text-xs font-bold uppercase hover:text-blue-800">Edit</button>
                            )}
                        </div>
                        
                        {history ? (
                            isEditing ? (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold block mb-1">Blood Type</label>
                                        <input 
                                            value={editForm.blood_type} 
                                            onChange={e => setEditForm({...editForm, blood_type: e.target.value})}
                                            className="w-full border p-2 rounded bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold block mb-1">Allergies</label>
                                        <input 
                                            value={editForm.allergies} 
                                            onChange={e => setEditForm({...editForm, allergies: e.target.value})}
                                            className="w-full border p-2 rounded bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold block mb-1">Conditions</label>
                                        <input 
                                            value={editForm.conditions} 
                                            onChange={e => setEditForm({...editForm, conditions: e.target.value})}
                                            className="w-full border p-2 rounded bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Blood Type</span> 
                                        <span className="font-mono font-bold bg-gray-100 px-2 rounded">{history.blood_type || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-1">Allergies</span> 
                                        <span className="font-medium text-gray-800">{history.allergies || 'None recorded'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-1">Conditions</span> 
                                        <span className="font-medium text-gray-800">{history.conditions || 'None recorded'}</span>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-gray-400 text-sm italic">Loading info...</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Chat Interface */}
                <div className="lg:col-span-7 h-full min-h-[500px]">
                    <ChatWindow mode={mode} setMode={setMode} onAction={handleAction} />
                </div>
            </main>
        </div>
    );
};
export default Dashboard;
