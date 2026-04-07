import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { MapPin, Loader2, Save, Trash2, Link as LinkIcon, Share2, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../apiConfig';

export default function ItineraryGen() {
  const { getToken } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [activeView, setActiveView] = useState('new'); // 'new' or itinerary ID
  const [result, setResult] = useState(''); // Stores newly generated itinerary before saving
  
  const [form, setForm] = useState({
    destination: '',
    days: 7,
    travelers: '1 (Solo)',
    budget: 'moderate',
    startDate: '',
    interests: ''
  });

  useEffect(() => {
    fetchItineraries();
  }, [getToken]);

  const fetchItineraries = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/itineraries`, { headers: { Authorization: `Bearer ${token}` } });
      setItineraries(res.data);
    } catch (error) {
      console.error("Failed to fetch itineraries:", error);
    }
  };

  const deleteItinerary = async (id) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/itineraries/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItineraries(itineraries.filter(i => i.id !== id));
      if (activeView === id) setActiveView('new');
    } catch (e) {
      alert("Error deleting itinerary");
    }
  };

  const handleShareToggle = async (id) => {
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/api/itineraries/${id}/share`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchItineraries();
    } catch (e) {
      alert("Error toggling share status");
    }
  };


  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.destination) return;
    
    setLoading(true);
    setResult('');
    
    try {
      const token = await getToken();
      // Combine extra fields into extraDetails for the backend prompt compatibility
      const extraDetails = `Travelers: ${form.travelers}. Budget: ${form.budget}. Start Date: ${form.startDate}. User Interests/Vibe: ${form.interests}`;
      
      const payload = {
        destination: form.destination,
        days: form.days,
        extraDetails: extraDetails
      };

      const res = await axios.post(`${API_URL}/api/itineraries/generate`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data.itinerary);
    } catch (err) {
      alert("Failed to generate itinerary. Ensure backend Gemini API is working.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const token = await getToken();
      await axios.post(`${API_URL}/api/itineraries/save`, {
        destination: form.destination,
        days: form.days,
        content: result
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      await fetchItineraries();
      setResult('');
      setActiveView('new'); // go back to clean slate or stay on new
      setForm({
        destination: '', days: 7, travelers: '1 (Solo)', budget: 'moderate', startDate: '', interests: ''
      });
    } catch (err) {
      alert("Failed to save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  const selectedItinerary = itineraries.find(i => i.id === activeView);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F4F1E1] text-[#111] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-80 bg-white border-r-4 border-black flex flex-col shrink-0 z-10 shadow-[4px_0_0_rgba(0,0,0,1)]">
        <div className="bg-[#90EE90] border-b-4 border-black p-5">
          <h2 className="font-black tracking-widest uppercase text-lg leading-none">Saved Itineraries</h2>
          <p className="text-sm font-bold text-gray-700 mt-1">{itineraries.length} trips planned</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => { setActiveView('new'); setResult(''); }}
            className="w-full bg-[#FFD166] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] py-3 font-black uppercase text-sm mb-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
            + New Itinerary
          </button>

          <div className="space-y-4">
            {itineraries.map(i => {
              const isSelected = activeView === i.id;
              return (
                <div 
                  key={i.id} 
                  onClick={() => setActiveView(i.id)}
                  className={`border-4 border-black p-3 cursor-pointer transition-all ${isSelected ? 'shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px] bg-[#E2B4D6]' : 'shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white'}`}>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-black text-[13px] truncate">{i.destination}</h4>
                      <p className="font-bold text-[10px] text-gray-700 mt-0.5 truncate uppercase">{i.days} DAYS</p>
                      <div className="mt-2 flex gap-2">
                        <span className="inline-block bg-[#FFD166] border-2 border-black px-1.5 py-0.5 text-[9px] font-black shadow-[1px_1px_0_rgba(0,0,0,1)]">SAVED</span>
                        {i.is_public && <span className="inline-block bg-[#BAE1FF] border-2 border-black px-1.5 py-0.5 text-[9px] font-black shadow-[1px_1px_0_rgba(0,0,0,1)]">SHARED</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">

        {/* View Generated / Selected Itinerary State */}
        {activeView && activeView !== 'new' && selectedItinerary && (
          <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 md:p-8 bg-white flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black mb-2 uppercase">ITINERARY FOR {selectedItinerary.destination}</h1>
                <p className="font-bold text-gray-600">{selectedItinerary.days} days of adventure</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleShareToggle(selectedItinerary.id)}
                    className={`${selectedItinerary.is_public ? 'bg-[#BAE1FF]' : 'bg-gray-100 text-gray-500'} border-4 border-black font-black uppercase px-4 py-2 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-2 text-sm transition-all`}>
                    {selectedItinerary.is_public ? <><LinkIcon className="w-4 h-4" /> Public</> : <><Lock className="w-4 h-4" /> Private</>}
                  </button>
                  <button 
                    onClick={() => deleteItinerary(selectedItinerary.id)}
                    className="bg-[#FFB3BA] border-4 border-black font-black uppercase px-4 py-2 hover:bg-[#ff9aa3] shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-2 text-sm transition-all">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                {selectedItinerary.is_public && (
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={`${window.location.origin}/shared/itinerary/${selectedItinerary.id}`} className="border-2 border-black p-1 text-xs flex-1 bg-gray-50 uppercase font-bold" />
                    <button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared/itinerary/${selectedItinerary.id}`);
                      alert("Link Copied!");
                    }} className="bg-black text-white text-xs font-black uppercase px-2 py-1.5 border-2 border-black">Copy</button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8">
              <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#FF1493] font-medium leading-relaxed whitespace-pre-wrap">
                <ReactMarkdown>{selectedItinerary.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Generated Result Unsaved State */}
        {activeView === 'new' && result && (
          <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-12">
            <div className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 md:p-8 bg-[#E2B4D6] flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black uppercase">✨ Your Fresh Itinerary</h1>
                <p className="font-bold text-black mt-2">Generated for {form.destination}</p>
              </div>
              <button 
                onClick={() => setResult('')}
                className="bg-white border-4 border-black font-black uppercase px-4 py-2 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)] text-sm">
                Discard
              </button>
            </div>

            <div className="bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8">
              <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#FF1493] font-medium leading-relaxed whitespace-pre-wrap">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#90EE90] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] py-4 font-black uppercase text-xl hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex justify-center mt-6">
                {saving ? 'Saving...' : '💾 SAVE TO MY ITINERARIES'}
            </button>
          </div>
        )}

        {/* AI Itinerary Generator Form State */}
        {activeView === 'new' && !result && (
          <div className="bg-white border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,1)] w-full max-w-3xl p-6 md:p-10 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black uppercase mb-2 flex items-center gap-2">🤖 AI Itinerary Generator</h2>
            <p className="font-bold text-gray-500 mb-8 border-b-4 border-transparent pb-4">Powered by Gemini AI — describe your dream trip and get a full day-by-day plan</p>
            
            <form onSubmit={handleGenerate} className="space-y-6 font-bold text-sm">
              <div>
                <label className="block mb-2 uppercase tracking-wide">Destination *</label>
                <input required value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="e.g. Kyoto, Japan / Morocco / Patagonia..." className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#90EE90] transition-all bg-white placeholder-gray-400" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="block mb-2 uppercase tracking-wide">Duration</label>
                  <select value={form.days} onChange={e => setForm({...form, days: parseInt(e.target.value) || 7})} className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#90EE90] transition-all bg-white cursor-pointer appearance-none text-black">
                    {[1,2,3,4,5,6,7,10,14].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 uppercase tracking-wide">Travelers</label>
                  <select value={form.travelers} onChange={e => setForm({...form, travelers: e.target.value})} className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#90EE90] transition-all bg-white cursor-pointer appearance-none text-black">
                    <option value="1 (Solo)">1 (Solo)</option>
                    <option value="2 (Couple)">2 (Couple)</option>
                    <option value="Friends Group">Friends Group</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="block mb-2 uppercase tracking-wide">Budget</label>
                  <select value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#90EE90] transition-all bg-white cursor-pointer appearance-none text-black">
                    <option value="Backpacker">Backpacker / Cheap</option>
                    <option value="moderate">Moderate</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 uppercase tracking-wide">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#90EE90] transition-all bg-white text-black" />
                </div>
              </div>

              <div>
                <label className="block mb-2 uppercase tracking-wide">Interests & Vibe</label>
                <textarea rows={3} value={form.interests} onChange={e => setForm({...form, interests: e.target.value})} placeholder="e.g. hiking, street food, museums, nightlife, photography..." className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#90EE90] transition-all bg-white resize-none font-medium text-base placeholder-gray-400" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading || !form.destination.trim()} className="w-full bg-[#FFD166] border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] py-4 font-black uppercase text-lg text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : '✨ Generate Itinerary'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
