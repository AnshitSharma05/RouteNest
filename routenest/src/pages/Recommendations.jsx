import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../apiConfig';

export default function Recommendations() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  const [form, setForm] = useState({
    style: 'culture & food',
    budget: 'moderate',
    length: '7-10 days',
    travelingAs: 'couple',
    skip: '',
    region: 'India'
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    
    try {
      const preferences = `Region: ${form.region}. Travel Style: ${form.style}. Budget: ${form.budget}. Trip Length: ${form.length}. Traveling As: ${form.travelingAs}. Places to Skip: ${form.skip}.`;
      
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-[#F4F1E1] text-[#111] overflow-hidden font-sans">
      {/* Sidebar Form */}
      <div className="w-full md:w-80 bg-white border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col shrink-0 z-10 shadow-[4px_0_0_rgba(0,0,0,1)] overflow-y-auto">
        <div className="bg-[#BAE1FF] border-b-4 border-black p-5">
          <h2 className="font-black tracking-widest uppercase text-lg leading-none flex items-center gap-2">AI DISCOVER</h2>
          <p className="text-sm font-bold text-gray-700 mt-1">Personalized trip ideas just for you</p>
        </div>
        
        <form onSubmit={handleGenerate} className="p-5 space-y-5 font-bold text-sm bg-white">
          <div>
            <label className="block mb-2 uppercase tracking-wide">Travel Style</label>
            <select value={form.style} onChange={e => setForm({...form, style: e.target.value})} className="w-full border-4 border-black p-2.5 focus:outline-none focus:ring-4 focus:ring-[#FFD166] transition-all bg-white cursor-pointer appearance-none">
              <option value="culture & food">culture & food</option>
              <option value="adventure & nature">adventure & nature</option>
              <option value="relaxation & beaches">relaxation & beaches</option>
              <option value="party & nightlife">party & nightlife</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 uppercase tracking-wide">Budget</label>
            <select value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="w-full border-4 border-black p-2.5 focus:outline-none focus:ring-4 focus:ring-[#FFD166] transition-all bg-white cursor-pointer appearance-none">
              <option value="budget">budget / backpacker</option>
              <option value="moderate">moderate</option>
              <option value="luxury">luxury</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 uppercase tracking-wide">Trip Length</label>
            <select value={form.length} onChange={e => setForm({...form, length: e.target.value})} className="w-full border-4 border-black p-2.5 focus:outline-none focus:ring-4 focus:ring-[#FFD166] transition-all bg-white cursor-pointer appearance-none">
              <option value="weekend">weekend (2-3 days)</option>
              <option value="7-10 days">7-10 days</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month+">1 month+</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 uppercase tracking-wide">Traveling As</label>
            <select value={form.travelingAs} onChange={e => setForm({...form, travelingAs: e.target.value})} className="w-full border-4 border-black p-2.5 focus:outline-none focus:ring-4 focus:ring-[#FFD166] transition-all bg-white cursor-pointer appearance-none">
              <option value="solo">solo</option>
              <option value="couple">couple</option>
              <option value="friends">friends</option>
              <option value="family">family</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 uppercase tracking-wide">Places to Skip</label>
            <input value={form.skip} onChange={e => setForm({...form, skip: e.target.value})} placeholder="e.g. USA, Bali (optional)" className="w-full border-4 border-black p-2.5 focus:outline-none focus:ring-4 focus:ring-[#FFD166] transition-all bg-white placeholder-gray-400" />
          </div>

          <div>
            <label className="block mb-2 uppercase tracking-wide">Region</label>
            <select value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="w-full border-4 border-black p-2.5 focus:outline-none focus:ring-4 focus:ring-[#FFD166] transition-all bg-white cursor-pointer appearance-none">
              <option value="India">India</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Africa">Africa</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#111] text-[#FFD166] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] py-3 font-black uppercase text-sm mt-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-75 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : 'GET RECOMMENDATIONS'}
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
            <h2 className="text-3xl font-black uppercase mb-4">DISCOVER YOUR NEXT ADVENTURE</h2>
            <p className="font-bold text-gray-600 text-lg">
              Our AI analyzes your travel history and preferences to recommend destinations you'll genuinely love — not just tourist traps.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
             <h2 className="text-2xl font-black uppercase">Finding the perfect spots...</h2>
          </div>
        )}

        {result && !loading && (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300 pb-12">
            <div className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 md:p-8 bg-[#FFD166] mb-6">
              <h1 className="text-3xl font-black uppercase">Your Personalized Matches</h1>
              <p className="font-bold text-black mt-1">Based on what you told us.</p>
            </div>

            <div className="bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8">
              <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#FF1493] font-medium leading-relaxed whitespace-pre-wrap text-[#111]">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
