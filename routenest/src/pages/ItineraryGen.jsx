import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ListStart, Loader2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ItineraryGen() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState('');
  
  const [form, setForm] = useState({
    destination: '',
    days: 3,
    extraDetails: ''
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.destination) return;
    
    setLoading(true);
    setResult('');
    
    try {
      const token = await getToken();
      const res = await axios.post(`${API_URL}/api/itineraries/generate`, 
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      
      navigate('/dashboard');
    } catch (err) {
      alert("Failed to save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      {/* Left panel: Form */}
      <div className="lg:w-1/3">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-sky-50 sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-light rounded-lg text-brand-primary">
              <ListStart className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Plan a Trip</h1>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Where to?</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-slate-800"
                placeholder="Tokyo, Japan"
                value={form.destination}
                onChange={e => setForm({...form, destination: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">How many days?</label>
              <input 
                type="number" 
                min="1" max="14"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-slate-800"
                value={form.days}
                onChange={e => setForm({...form, days: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vibe / Extra Details</label>
              <textarea 
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-700 resize-none text-sm"
                placeholder="We want to eat a lot, avoid tourist traps, and wake up late."
                value={form.extraDetails}
                onChange={e => setForm({...form, extraDetails: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !form.destination}
              className="w-full bg-brand-primary hover:bg-sky-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Itinerary'}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Result */}
      <div className="lg:w-2/3">
        {result ? (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-8 border-b border-slate-100 pb-4">
              Your {form.days}-Day Itinerary for {form.destination}
            </h2>
            <div className="prose prose-slate prose-lg max-w-none prose-headings:text-brand-primary prose-a:text-brand-accent">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            
            <div className="mt-12 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-dark hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save to Dashboard</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-sky-100 rounded-3xl bg-white/40">
            <ListStart className="w-16 h-16 text-sky-200 mb-4" />
            <p className="text-lg font-medium">Your itinerary will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
