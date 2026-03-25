import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { getToken } = useAuth();
  const [memories, setMemories] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        
        const [memRes, iteRes] = await Promise.all([
          axios.get(`${API_URL}/api/memories`, { headers }),
          axios.get(`${API_URL}/api/itineraries`, { headers })
        ]);

        setMemories(memRes.data);
        setItineraries(iteRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  const deleteMemory = async (id) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/memories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemories(memories.filter(m => m._id !== id));
    } catch (e) {
      alert("Error deleting memory");
    }
  };

  const deleteItinerary = async (id) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/itineraries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItineraries(itineraries.filter(i => i._id !== id));
    } catch (e) {
      alert("Error deleting itinerary");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading your journey...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Travel Dashboard</h1>
        <Link to="/diary/new" className="bg-brand-primary text-white flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md shadow-sky-200 hover:bg-sky-600 transition-colors">
          <Plus className="w-5 h-5" /> New Diary
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand-primary" /> Memory Diaries
        </h2>
        {memories.length === 0 ? (
          <div className="bg-white/50 border border-dashed border-sky-200 rounded-2xl p-10 text-center text-slate-500">
            No memories yet. Time to log an adventure!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map(m => (
              <div key={m._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all relative group">
                <button onClick={() => deleteMemory(m._id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{m.title}</h3>
                <div className="flex items-center gap-1 text-sm font-medium text-brand-primary mb-3">
                  <MapPin className="w-4 h-4" /> {m.location || 'Unknown'}
                </div>
                <p className="text-slate-600 line-clamp-3">{m.story}</p>
                {m.pictures?.length > 0 && <div className="mt-4 text-sm text-slate-400">Contains photos</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand-primary" /> Saved Itineraries
        </h2>
        {itineraries.length === 0 ? (
           <div className="bg-white/50 border border-dashed border-sky-200 rounded-2xl p-10 text-center text-slate-500">
             No saved itineraries. <Link to="/itinerary" className="text-brand-primary font-medium hover:underline">Generate one now.</Link>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {itineraries.map(i => (
              <div key={i._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative group">
                <button onClick={() => deleteItinerary(i._id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{i.destination}</h3>
                    <div className="text-sm font-medium text-brand-primary">{i.days} Days</div>
                  </div>
                </div>
                <div className="prose prose-sm prose-slate max-w-none line-clamp-4 h-32 overflow-hidden mask-image-bottom">
                   <p className="whitespace-pre-wrap text-slate-600">{i.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
