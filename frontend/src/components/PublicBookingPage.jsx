import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PublicBookingPage({ eventSlug, navigateBack }) {
  const [eventData, setEventData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-05-25'); 
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [dynamicTimeSlots, setDynamicTimeSlots] = useState([]);
  const [takenSlots, setTakenSlots] = useState([]);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    axios.get(`${API_URL}/event-types`)
      .then(res => {
        const targetedMatch = res.data.find(e => e.slug === eventSlug);
        setEventData(targetedMatch || null);
      })
      .catch(err => console.error("Error matching slug context:", err));
  }, [eventSlug]);

  useEffect(() => {
    if (!eventData) return;
    setIsLoadingSlots(true);

    const fetchTargetTimelineRules = async () => {
      try {
        const bookingsRes = await axios.get(`${API_URL}/bookings`);
        const structuralFiltering = bookingsRes.data
          .filter(b => b.date === selectedDate)
          .map(b => b.startTime);
        setTakenSlots(structuralFiltering);

        const availabilityRes = await axios.get(`${API_URL}/availability`);
        const allAvailability = availabilityRes.data || [];

        const dateObj = new Date(selectedDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDayName = days[dateObj.getDay()];

        let activeRule = allAvailability.find(a => a.date === selectedDate && a.isActive);
        if (!activeRule) {
          activeRule = allAvailability.find(a => a.dayOfWeek === targetDayName && !a.date && a.isActive);
        }

        if (activeRule) {
          const parseTimeToMinutes = (t) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };

          const startMinutes = parseTimeToMinutes(activeRule.startTime);
          const endMinutes = parseTimeToMinutes(activeRule.endTime);
          const step = eventData.duration || 30;

          const generatedSlots = [];
          for (let minutes = startMinutes; minutes + step <= endMinutes; minutes += step) {
            const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
            const mm = String(minutes % 60).padStart(2, '0');
            generatedSlots.push(`${hh}:${mm}`);
          }
          setDynamicTimeSlots(generatedSlots);
        } else {
          setDynamicTimeSlots([]);
        }
      } catch (err) {
        console.error("Error computing adaptive slots grid maps:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchTargetTimelineRules();
  }, [eventData, selectedDate, isConfirmed]);

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!eventData || !selectedTime) return;

    try {
      await axios.post(`${API_URL}/bookings`, {
        eventTypeId: eventData.id,
        bookerName: name,
        bookerEmail: email,
        date: selectedDate,
        startTime: selectedTime
      });
      setIsConfirmed(true);
    } catch (err) {
      alert(err.response?.data?.error || "This slot was locked concurrently by another request session.");
      setSelectedTime(null);
    }
  };

  if (!eventData) return <div className="text-center p-12 text-xs text-gray-500 font-mono tracking-wider animate-pulse">Syncing interface profiles layout clusters...</div>;

  if (isConfirmed) {
    return (
      <div className="max-w-md mx-auto bg-[#0d0d15]/95 border border-[#1f1f2e] rounded-2xl p-8 text-center shadow-2xl mt-24 animate-[scaleUp_0.4s_ease-out] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-transparent"></div>
        <div className="w-14 h-14 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-5 shadow-lg shadow-emerald-500/10 animate-bounce">✓</div>
        <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">Reservation Verified</h2>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">Your custom timestamp parameter parameters have been successfully written onto the PostgreSQL cloud instance.</p>
        
        <div className="bg-[#050508] border border-[#1f1f2e] rounded-xl p-4 text-left text-xs space-y-3 font-mono shadow-inner mb-6 transform group-hover:scale-[1.01] transition-transform duration-300">
          <div className="text-gray-400 flex justify-between"><span className="text-gray-600 font-bold uppercase tracking-wider text-[10px]">Event Module:</span> {eventData.title}</div>
          <div className="text-gray-400 flex justify-between"><span className="text-gray-600 font-bold uppercase tracking-wider text-[10px]">Allocated Window:</span> <span className="text-indigo-400 font-bold">{selectedDate} @ {selectedTime} (IST)</span></div>
        </div>
        
        <button onClick={navigateBack} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-all cursor-pointer bg-indigo-950/20 border border-indigo-900/40 px-4 py-2 rounded-xl hover:bg-indigo-900/30 active:scale-95">
          ← Back to Control Board
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-3 mt-16 perspective-1000 subpixel-antialiased pattern-matrix animate-[slideUp_0.4s_ease-out]">
      
      <div className="p-8 border-b md:border-b-0 md:border-r border-[#1f1f2e]/60 bg-[#050508]/40 flex flex-col justify-between group relative">
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div>
          <button onClick={navigateBack} className="text-xs font-semibold text-gray-500 hover:text-gray-300 mb-8 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95">
            ← Cancel Route
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-black text-sm mb-4 shadow-lg shadow-indigo-500/20 transform group-hover:rotate-12 transition-transform duration-300">C</div>
          <span className="text-[9px] font-extrabold tracking-widest text-indigo-400 uppercase bg-indigo-950/30 border border-indigo-900/30 px-2 py-0.5 rounded-md">Cal.ai Matrix</span>
          <h2 className="text-xl font-bold text-white mt-3 mb-2 tracking-tight group-hover:text-indigo-300 transition-colors duration-200">{eventData.title}</h2>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold mb-4 bg-[#050508] border border-[#1f1f2e] w-fit px-2.5 py-1 rounded-lg shadow-inner">
            <span className="animate-pulse">⏳</span> {eventData.duration} Mins Operational Slot
          </div>
          <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">{eventData.description || 'No descriptive prompt notes mapped onto this module layer.'}</p>
        </div>
        <div className="text-[10px] font-mono text-gray-600 mt-8 md:mt-0 pt-4 border-t border-[#1f1f2e]/40">
          Secure Core Tunnel Enabled v1.0
        </div>
      </div>

      <div className="p-8 border-b md:border-b-0 md:border-r border-[#1f1f2e]/60 transition-all duration-300 hover:bg-[#080811]/20">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
          <span>Pick Allocation Date</span>
          <span className="w-2 h-[1px] bg-gray-700"></span>
        </h3>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} 
          className="w-full bg-[#050508] border border-[#1f1f2e] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none transition-all cursor-pointer shadow-inner shadow-black" 
        />
        <div className="mt-6 p-4 bg-[#050508]/50 border border-[#1f1f2e] rounded-xl text-[10px] text-gray-500 leading-normal font-mono shadow-inner">
          <span className="text-indigo-400 font-bold">System Status:</span> Dynamic intervals process client constraints live using Neon table indexes logic layers.
        </div>
      </div>

      <div className="p-8 bg-[#050508]/10 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <span>Slots Allocation</span>
            <span className="w-2 h-[1px] bg-gray-700"></span>
          </h3>
          
          {isLoadingSlots ? (
            <div className="text-center py-12 text-xs font-mono text-gray-600 animate-pulse">Computing intervals matrix...</div>
          ) : !selectedTime ? (
            <div className="space-y-2 overflow-y-auto max-h-[290px] pr-1 scrollbar-thin scrollbar-thumb-gray-800 animate-[fadeIn_0.3s_ease-out]">
              {dynamicTimeSlots.length === 0 ? (
                <div className="text-center py-12 text-[11px] font-mono text-red-400/80 bg-red-950/10 border border-red-900/30 p-4 rounded-xl italic">
                  🔒 Host is Out of Office / Closed on this specific target index date.
                </div>
              ) : (
                dynamicTimeSlots.map((slot) => {
                  const isTaken = takenSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      disabled={isTaken}
                      onClick={() => setSelectedTime(slot)}
                      className={`w-full py-2.5 text-xs font-mono font-bold rounded-xl border transition-all duration-200 flex justify-center items-center cursor-pointer transform hover:scale-[1.01] active:scale-95 ${
                        isTaken 
                          ? 'bg-[#050508]/80 border-gray-900/60 text-gray-700 cursor-not-allowed line-through shadow-none' 
                          : 'bg-[#050508] border-[#1f1f2e] text-indigo-400 hover:border-indigo-500 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-indigo-600/10'
                      }`}
                    >
                      {slot} {isTaken && ' (Booked)'}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleConfirmReservation} className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-indigo-950/30 border border-indigo-900/40 p-3 rounded-xl flex justify-between items-center shadow-inner">
                <span className="text-xs font-mono text-indigo-300 font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>{selectedTime} (IST)</span>
                <button type="button" onClick={() => setSelectedTime(null)} className="text-[9px] uppercase tracking-widest font-extrabold text-gray-500 hover:text-white transition-colors cursor-pointer bg-[#050508] px-2 py-0.5 rounded border border-[#1f1f2e]">Reset</button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                <input required type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#050508] border border-[#1f1f2e] focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-700 focus:outline-none transition-colors shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <input required type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#050508] border border-[#1f1f2e] focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-700 focus:outline-none transition-colors shadow-inner" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 transform active:scale-95 cursor-pointer">
                Confirm Slot Appointment
              </button>
            </form>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .pattern-matrix {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0);
          background-size: 20px 20px;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

    </div>
  );
}