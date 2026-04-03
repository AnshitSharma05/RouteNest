import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Trash2, MapPin, Calendar, Edit2, Upload, Compass, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CARD_COLORS = ['#BAE1FF', '#FFDFD3', '#FFB3BA', '#90EE90', '#FFD166', '#E2B4D6'];
const EMOJIS = ['✈️', '🗺️', '🏖️', '⛰️', '🌍', '🎒', '🚂', '⛵', '🌸', '🏛️'];

export default function Dashboard() {
  const { getToken } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(null); // null, 'new', or memory id
  
  // New Story State
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '', location: '', dateOfTrip: '', story: '', emoji: '✈️', color: '#FFDFD3'
  });

  useEffect(() => {
    fetchMemories();
  }, [getToken]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/memories`, { headers: { Authorization: `Bearer ${token}` } });
      setMemories(res.data);
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id) => {
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/api/memories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemories(memories.filter(m => m.id !== id));
      if (activeView === id) setActiveView(null);
    } catch (e) {
      alert("Error deleting memory");
    }
  };

  const handleSubmitNewStory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      let pictureUrls = [];
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach(file => uploadData.append('images', file));
        const uploadRes = await axios.post(`${API_URL}/api/upload`, uploadData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        pictureUrls = uploadRes.data.urls;
      }

      await axios.post(`${API_URL}/api/memories`, { ...formData, pictures: pictureUrls }, { headers });
      await fetchMemories();
      setActiveView(null);
      setFormData({ title: '', location: '', dateOfTrip: '', story: '', emoji: '✈️', color: '#FFDFD3' });
      setImageFiles([]);
    } catch (err) {
      console.error(err);
      alert('Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  const selectedMemory = memories.find(m => m.id === activeView);

  if (loading) return <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-[#F4F1E1] font-black text-2xl">LOADING...</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F4F1E1] text-[#111] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-80 bg-white border-r-4 border-black flex flex-col shrink-0 z-10 shadow-[4px_0_0_rgba(0,0,0,1)]">
        <div className="bg-[#FFD166] border-b-4 border-black p-5">
          <h2 className="font-black tracking-widest uppercase text-lg leading-none">My Travel Stories</h2>
          <p className="text-sm font-bold text-gray-700 mt-1">{memories.length} adventures saved</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <button 
            onClick={() => setActiveView('new')}
            className="w-full bg-[#90EE90] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] py-3 font-black uppercase text-sm mb-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
            + New Story
          </button>

          <div className="space-y-4">
            {memories.map(m => {
              const isSelected = activeView === m.id;
              // Hardcoding emoji and color for existing memories if missing
              const mColor = m.color || '#FFDFD3';
              const mEmoji = m.emoji || '🍜';
              
              return (
                <div 
                  key={m.id} 
                  onClick={() => setActiveView(m.id)}
                  className={`border-4 border-black p-3 cursor-pointer transition-all ${isSelected ? 'shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' : 'shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
                  style={{ backgroundColor: isSelected ? mColor : '#FFFFFF' }}>
                  <div className="flex gap-2 items-start">
                    <span className="text-xl">{mEmoji}</span>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-black text-[13px] truncate">{m.title}</h4>
                      <p className="font-bold text-[10px] text-gray-700 mt-0.5 truncate uppercase">{m.location}</p>
                      <p className="font-bold text-[10px] text-gray-500 mb-2 truncate">{m.dateOfTrip || 'Unknown Date'}</p>
                      <div className="inline-block bg-[#FFD166] border-2 border-black px-1.5 py-0.5 text-[9px] font-black shadow-[1px_1px_0_rgba(0,0,0,1)]">
                        📸 {m.pictures?.length || 0} PHOTOS
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
        
        {/* Empty State */}
        {!activeView && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto opacity-80">
            <div className="w-24 h-24 bg-[#FFD166] rounded-full border-4 border-black flex items-center justify-center shadow-[6px_6px_0_rgba(0,0,0,1)] mb-6 -rotate-6">
              <Compass className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-2">Select a Story</h2>
            <p className="font-bold text-gray-600">or click "NEW STORY" to start your next adventure</p>
          </div>
        )}

        {/* View Memory State */}
        {activeView && activeView !== 'new' && selectedMemory && (
          <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Header Box */}
            <div className="border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ backgroundColor: selectedMemory.color || '#FFDFD3' }}>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedMemory.emoji || '🍜'}</div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-3">{selectedMemory.title}</h1>
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                    <span className="bg-black text-white px-3 py-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {selectedMemory.location}</span>
                    <span className="bg-white border-2 border-black px-3 py-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {selectedMemory.dateOfTrip}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <button className="bg-white border-4 border-black font-black uppercase px-4 py-2 hover:bg-gray-100 transition-colors shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => deleteMemory(selectedMemory.id)}
                  className="bg-[#FFB3BA] border-4 border-black font-black uppercase px-4 py-2 hover:bg-[#ff9aa3] transition-colors shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>

            {/* Photos Box */}
            {selectedMemory.pictures?.length > 0 && (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                <h3 className="font-black uppercase mb-4 flex items-center gap-2 text-sm"><ImageIcon className="w-4 h-4" /> Travel Photos</h3>
                <div className="flex overflow-x-auto gap-4 pb-4">
                  {selectedMemory.pictures.map((pic, idx) => (
                    <div key={idx} className="shrink-0 border-4 border-black p-2 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col w-64 group cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all">
                      <img src={pic} className="w-full h-40 object-cover border-b-2 border-black" alt="Memory" />
                      <div className="p-2 text-[10px] font-black uppercase truncate mt-1">Photo {idx + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Box */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 md:p-8">
              <h3 className="font-black uppercase mb-6 flex items-center gap-2 text-sm">📝 Notes & Memories</h3>
              <div className="font-medium text-lg leading-relaxed whitespace-pre-wrap">
                {selectedMemory.story}
              </div>
            </div>

          </div>
        )}

        {/* New Story Form State */}
        {activeView === 'new' && (
          <div className="bg-white border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,1)] w-full max-w-3xl p-6 md:p-10 mb-10 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-2">✍️ New Travel Story</h2>
            
            <form onSubmit={handleSubmitNewStory} className="space-y-6 font-bold text-sm">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 uppercase tracking-wide">Story Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Lost in Marrakech..." className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#BAE1FF] transition-all bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block mb-2 uppercase tracking-wide">Destination *</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Marrakech, Morocco" className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#BAE1FF] transition-all bg-white placeholder-gray-400" />
                </div>
              </div>

              <div>
                <label className="block mb-2 uppercase tracking-wide">Travel Date</label>
                <input type="date" value={formData.dateOfTrip} onChange={e => setFormData({...formData, dateOfTrip: e.target.value})} className="w-full border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#BAE1FF] transition-all bg-white" />
              </div>

              <div>
                <label className="block mb-2 uppercase tracking-wide">Travel Notes & Memories</label>
                <textarea required rows={6} value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} placeholder="Write your story here... What did you see? What made you laugh?" className="w-full border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#BAE1FF] transition-all bg-white resize-none font-medium text-base" />
              </div>

              <div>
                <label className="block mb-2 uppercase tracking-wide">Photos</label>
                <div className="flex flex-col items-start gap-4">
                  <label className="bg-[#BAE1FF] border-4 border-black px-6 py-3 font-black uppercase cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4" /> Upload Photos
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImageFiles(Array.from(e.target.files).slice(0, 5))} />
                  </label>
                  {imageFiles.length > 0 && <p className="font-bold text-sm bg-black text-white px-3 py-1">{imageFiles.length} photo(s) ready</p>}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" disabled={saving} className="bg-[#90EE90] border-4 border-black px-8 py-3 font-black uppercase flex items-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  💾 {saving ? 'Saving...' : 'Save Story'}
                </button>
                <button type="button" onClick={() => setActiveView(null)} className="bg-[#FFB3BA] border-4 border-black px-8 py-3 font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
