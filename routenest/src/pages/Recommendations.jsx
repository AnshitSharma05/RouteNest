import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Sparkles, Loader2, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Recommendations() {
  const { getToken } = useAuth();
  const [preferences, setPreferences] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!preferences.trim()) return;
    setLoading(true);
    setResult('');
    
    try {
      const token = await getToken();
      const res = await axios.post(`${API_URL}/api/recommendations`, 
        { preferences },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.recommendations);
    } catch (err) {
      alert("Failed to get recommendations. Ensure backend Gemini API is working.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-sky-100/50 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-brand-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800">Discover your next destination</h1>
        <p className="mt-3 text-lg text-slate-500">Tell our AI what you love, and we'll craft the perfect travel ideas.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-sky-50 mb-8">
        <textarea
          rows={3}
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="I have a week off and love indie bookstores, rainy weather, and strong coffee..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none transition-all"
        />
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={loading || !preferences}
            className="bg-brand-dark hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><MapPin className="w-5 h-5"/> Reveal Destinations</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-accent" /> Your Curated Matches
          </h2>
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-brand-primary prose-a:text-brand-accent">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
