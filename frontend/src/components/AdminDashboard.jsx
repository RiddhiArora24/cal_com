import React, { useState, useEffect } from 'react';
import { 
  fetchEventTypes, createEventType, deleteEventType,
  fetchBookings, cancelBooking,
  fetchAvailability, updateAvailability 
} from '../api';

export default function AdminDashboard({ openPublicProfile }) {
  const [activeTab, setActiveTab] = useState('events'); 
  const [eventTypes, setEventTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [dateOverrides, setDateOverrides] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [targetDate, setTargetDate] = useState('');
  const [overrideStart, setOverrideStart] = useState('09:00');
  const [overrideEnd, setOverrideEnd] = useState('17:00');

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(15);
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadEvents();
    loadBookings();
    loadAvailabilityData();
  }, []);

  const loadEvents = async () => {
    try { const res = await fetchEventTypes(); setEventTypes(res.data || []); } catch(e){}
  };

  const loadBookings = async () => {
    try { const res = await fetchBookings(); setBookings(res.data || []); } catch(e){}
  };

  const loadAvailabilityData = async () => {
    try {
      const res = await fetchAvailability();
      const allRecords = res.data || [];
      setWeeklySchedule(allRecords.filter(r => r.dayOfWeek !== null));
      setDateOverrides(allRecords.filter(r => r.date !== null));
    } catch (err) {
      console.error(err);
    }
  };

  const handleWeeklyChange = (id, field, value) => {
    setWeeklySchedule(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleOverrideChange = (id, field, value) => {
    setDateOverrides(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddDateOverride = (e) => {
    e.preventDefault();
    if (!targetDate) return alert("Please specify a target override date string.");
    if (dateOverrides.some(o => o.date === targetDate)) return alert("An override for this date model already exists.");

    const newOverride = {
      id: `temp-${Date.now()}`, 
      dayOfWeek: null,
      date: targetDate,
      startTime: overrideStart,
      endTime: overrideEnd,
      isActive: true
    };

    setDateOverrides(prev => [...prev, newOverride]);
    setTargetDate('');
  };

  const handleSaveAllAvailability = async () => {
    setIsSaving(true);
    try {
      const payload = [...weeklySchedule, ...dateOverrides];
      await updateAvailability(payload);
      alert("Master schedule configuration written onto live cloud database successfully! 🚀");
      loadAvailabilityData();
    } catch (err) {
      alert("Synchronization failure pipeline error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEventType({ title, description, duration, slug });
      loadEvents();
      setTitle(''); setSlug(''); setDescription('');
    } catch (err) { alert(err.response?.data?.error); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete event?")) return;
    try { await deleteEventType(id); loadEvents(); } catch (err) {}
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel slot?")) return;
    try { await cancelBooking(id); loadBookings(); } catch (err) {}
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-200 selection:bg-indigo-500/30 flex flex-col min-h-screen subpixel-antialiased pattern-bg">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1f1f2e]/60 pb-6 mb-10 gap-6 relative">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-0.5">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Cal.com</span>
            <span className="text-gray-700 font-light text-xl ml-2">/</span>
            <span className="text-gray-400 font-normal text-lg ml-2">Workspace</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Configure internal logic rules, operational slots, and incoming event flows.</p>
        </div>
        
        <div className="flex bg-[#07070c]/90 border border-[#1f1f2e] rounded-xl p-1 w-full sm:w-auto shadow-2xl backdrop-blur-md">
          {['events', 'availability', 'bookings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-300 relative cursor-pointer active:scale-95 ${
                activeTab === tab 
                  ? 'bg-gradient-to-b from-[#1e1e2f] to-[#12121f] text-white border border-[#31314d] shadow-lg shadow-black/50' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab === 'events' ? '📁 Event Types' : tab === 'availability' ? '⏳ Availability' : '📅 Bookings List'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow transition-all duration-500 transform ease-out animate-[fadeIn_0.4s_ease-out]">
        
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-4 bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-2xl p-6 shadow-xl shadow-black/50 hover:border-[#2d2d44] transition-all duration-300">
              <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center gap-2">
                Create New Event Schema
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
              </h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Title</label>
                  <input required type="text" placeholder="e.g., Technical Alignment Check" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#050508] border border-[#1f1f2e] focus:border-indigo-500/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all duration-300 shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Duration</label>
                    <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-[#050508] border border-[#1f1f2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/70 transition-all duration-300 cursor-pointer shadow-inner">
                      <option value={15}>15 Mins</option>
                      <option value={30}>30 Mins</option>
                      <option value={45}>45 Mins</option>
                      <option value={60}>60 Mins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">URL Slug</label>
                    <input required type="text" placeholder="tech-sync" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-[#050508] border border-[#1f1f2e] focus:border-indigo-500/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all duration-300 shadow-inner" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description Context</label>
                  <textarea rows="3" placeholder="Provide context briefing regarding this meeting design..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#050508] border border-[#1f1f2e] focus:border-indigo-500/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-700 focus:outline-none transition-all duration-300 resize-none shadow-inner"></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40 transform active:scale-95 cursor-pointer">
                  Add Event Module
                </button>
              </form>
            </div>

            <div className="lg:col-span-8">
              <div className="max-h-[520px] overflow-y-auto pr-2 py-2 px-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 card-container">
                {eventTypes.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-600 border border-dashed border-[#1f1f2e] rounded-2xl bg-[#0d0d15]/30">No active event layouts generated yet.</div>
                ) : (
                  eventTypes.map((event) => (
                    <div key={event.id} className="bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-2xl p-5 transition-all duration-300 flex items-center justify-between group shadow-xl hover:border-indigo-500/30 relative overflow-hidden pop-card">
                      
                      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="space-y-1.5 max-w-[70%]">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-indigo-300">{event.title}</h4>
                          <span className="text-[9px] font-extrabold tracking-wider text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 px-2 py-0.5 rounded-md shadow-inner">
                            {event.duration}m
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-400 transition-colors duration-300">{event.description || 'No descriptive notes.'}</p>
                        <p className="text-[10px] font-mono text-gray-600 bg-[#050508] w-fit px-2 py-0.5 rounded-md border border-[#1f1f2e]/50">/book/{event.slug}</p>
                      </div>
                      <div className="flex items-center gap-3 relative z-10">
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-xs font-semibold text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-950/20 transition-all duration-200 cursor-pointer active:scale-90">Delete</button>
                        <button onClick={() => openPublicProfile(event.slug)} className="text-xs font-bold bg-[#141423] border border-[#26263b] text-gray-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 px-4 py-2 rounded-xl transition-all duration-300 shadow-md transform active:scale-95 cursor-pointer">View Page</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-2xl p-5 flex justify-between items-center shadow-2xl relative overflow-hidden group hover:border-[#2d2d44] transition-all duration-300">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500"></div>
              <div>
                <h3 className="text-sm font-bold text-white">Prisma Cloud Synced Framework</h3>
                <p className="text-xs text-gray-500">Persist operations modifications permanently into Postgres layer.</p>
              </div>
              <button 
                onClick={handleSaveAllAvailability}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-800 disabled:to-purple-900 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/10 active:scale-95 cursor-pointer"
              >
                {isSaving ? 'Writing onto Host...' : '💾 Save Configurations'}
              </button>
            </div>

            <div className="bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-2xl p-6 shadow-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <span>Standard Weekly Framework</span>
                <span className="w-4 h-[1px] bg-indigo-500/40"></span>
              </h4>
              <div className="space-y-3">
                {weeklySchedule.map((item) => (
                  <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#050508]/60 border rounded-xl transition-all duration-300 transform hover:scale-[1.005] ${item.isActive ? 'border-[#1f1f2e] hover:border-indigo-500/20 hover:bg-[#080811]' : 'border-gray-900/40 opacity-30 shadow-none'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={item.isActive} onChange={(e) => handleWeeklyChange(item.id, 'isActive', e.target.checked)} className="w-4 h-4 rounded bg-[#0d0d15] border-gray-800 text-indigo-600 focus:ring-0 cursor-pointer transition-transform duration-200 active:scale-75" />
                      <span className="text-xs font-bold text-white w-24">{item.dayOfWeek}</span>
                    </div>
                    {item.isActive ? (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <input type="time" value={item.startTime} onChange={(e) => handleWeeklyChange(item.id, 'startTime', e.target.value)} className="bg-[#0d0d15] px-2.5 py-1 rounded-lg border border-[#1f1f2e] text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-inner" />
                        <span className="text-gray-600 font-sans">to</span>
                        <input type="time" value={item.endTime} onChange={(e) => handleWeeklyChange(item.id, 'endTime', e.target.value)} className="bg-[#0d0d15] px-2.5 py-1 rounded-lg border border-[#1f1f2e] text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-inner" />
                      </div>
                    ) : <span className="text-[11px] text-gray-600 italic font-mono bg-[#050508] px-3 py-1 rounded-lg border border-gray-900/50">Closed Workspace</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-2xl p-6 shadow-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <span>Specific Date Overrides Exception Engine</span>
                  <span className="w-4 h-[1px] bg-purple-500/40"></span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">Set independent custom schedule bounds for isolated single calendar dates.</p>
              </div>

              <form onSubmit={handleAddDateOverride} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#050508]/80 border border-[#1f1f2e] p-4 rounded-xl items-end shadow-inner animate-[fadeIn_0.3s_ease-out]">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5">Target Date</label>
                  <input required type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-[#0d0d15] border border-[#1f1f2e] focus:border-purple-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none cursor-pointer transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5">Start Hour</label>
                  <input required type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} className="w-full bg-[#0d0d15] border border-[#1f1f2e] focus:border-purple-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none cursor-pointer transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1.5">End Hour</label>
                  <input required type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} className="w-full bg-[#0d0d15] border border-[#1f1f2e] focus:border-purple-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none cursor-pointer transition-colors" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-b from-purple-900/50 to-purple-950/50 border border-purple-700/50 hover:from-purple-800/60 hover:to-purple-900/60 text-purple-300 font-bold text-xs py-2 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-black/20">➕ Add Override</button>
              </form>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
                {dateOverrides.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-600 font-mono italic bg-[#050508]/30 border border-dashed border-[#1f1f2e] rounded-xl">No isolated custom override parameters created.</div>
                ) : (
                  dateOverrides.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-3.5 bg-[#050508]/50 border rounded-xl transition-all duration-300 transform hover:scale-[1.005] ${item.isActive ? 'border-[#1f1f2e] hover:border-purple-500/30' : 'border-gray-900/40 opacity-30 shadow-none'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={item.isActive} onChange={(e) => handleOverrideChange(item.id, 'isActive', e.target.checked)} className="w-4 h-4 rounded bg-[#0d0d15] border-gray-800 text-purple-600 focus:ring-0 cursor-pointer transition-transform active:scale-75" />
                        <span className="text-xs font-mono font-extrabold text-purple-400 bg-purple-950/30 border border-purple-900/30 px-2.5 py-0.5 rounded-md shadow-md">{item.date}</span>
                      </div>
                      {item.isActive ? (
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <input type="time" value={item.startTime} onChange={(e) => handleOverrideChange(item.id, 'startTime', e.target.value)} className="bg-[#0d0d15] px-2 py-0.5 rounded-md border border-[#1f1f2e] text-white text-xs cursor-pointer focus:outline-none focus:border-purple-500" />
                          <span className="text-gray-600">to</span>
                          <input type="time" value={item.endTime} onChange={(e) => handleOverrideChange(item.id, 'endTime', e.target.value)} className="bg-[#0d0d15] px-2 py-0.5 rounded-md border border-[#1f1f2e] text-white text-xs cursor-pointer focus:outline-none focus:border-purple-500" />
                        </div>
                      ) : <span className="text-[10px] text-red-400/80 font-mono bg-red-950/20 px-2.5 py-0.5 border border-red-900/30 rounded-md italic font-semibold">Fully Out of Office</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-[#0d0d15]/90 border border-[#1f1f2e] rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-2xl">
            <div className="p-5 border-b border-[#1f1f2e] bg-[#09090f] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Confirmed Appointment Schedules Log</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="max-h-[460px] overflow-y-auto divide-y divide-[#1f1f2e]/40 scrollbar-thin scrollbar-thumb-gray-800">
              {bookings.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-600 font-mono italic">No reservation records locked into the cluster.</div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#121221]/50 transition-all duration-200 group relative overflow-hidden">
                    <div className="space-y-1.5 relative z-10">
                      <span className="text-[10px] font-mono font-extrabold text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 px-2.5 py-1 rounded-md shadow-md block w-fit">
                        📅 {b.date} &nbsp;•&nbsp; ⏳ {b.startTime} (Local)
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2 transition-colors duration-200 group-hover:text-indigo-300">{b.bookerName}</h4>
                      <p className="text-xs text-gray-500">{b.bookerEmail} — Linked Event: <span className="text-gray-300 font-semibold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">"{b.eventType?.title || 'System Base Slot'}"</span></p>
                    </div>
                    <button onClick={() => handleCancelBooking(b.id)} className="text-xs bg-red-950/30 text-red-400 hover:bg-red-600 hover:text-white border border-red-900/40 px-3.5 py-2 rounded-xl transition-all duration-300 font-bold self-end sm:self-center cursor-pointer shadow-md active:scale-90 relative z-10">
                      Cancel Slot
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-20 pt-8 border-t border-[#1f1f2e]/60 text-center relative overflow-hidden">
        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-6">Trusted globally by elite scale operations teams</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-25 grayscale contrast-200 group transition-all duration-500 hover:opacity-50">
          <span className="text-white font-bold text-xs tracking-tight hover:scale-105 transition-transform duration-200 cursor-default">Supabase</span>
          <span className="text-white font-serif text-sm italic font-semibold tracking-wide hover:scale-105 transition-transform duration-200 cursor-default">Rho</span>
          <span className="text-white font-sans text-xs font-black lowercase tracking-tighter hover:scale-105 transition-transform duration-200 cursor-default">deel.</span>
          <span className="text-white font-mono text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-200 cursor-default">Framer</span>
          <span className="text-white font-sans text-xs font-bold italic tracking-wide hover:scale-105 transition-transform duration-200 cursor-default">ramp ↗</span>
          <span className="text-white font-sans text-xs font-extrabold tracking-tight hover:scale-105 transition-transform duration-200 cursor-default">PlanetScale</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .pop-card {
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.25s ease-out;
        }
        .pop-card:hover {
          border-color: rgba(99, 102, 241, 0.45) !important;
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.8), 0 0 16px 1px rgba(99, 102, 241, 0.15) !important;
        }
        .pattern-bg {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0);
          background-size: 24px 24px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

    </div>
  );
}