import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewDiary() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    dateOfTrip: '',
    story: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      let pictureUrls = [];
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach(file => {
          uploadData.append('images', file);
        });
        
        const uploadRes = await axios.post(`${API_URL}/api/upload`, uploadData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        pictureUrls = uploadRes.data.urls;
      }

      await axios.post(`${API_URL}/api/memories`, { ...formData, pictures: pictureUrls }, { headers });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-sky-50">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Pen a New Memory</h1>
        <p className="text-slate-500 mb-8">Record the little things that made your trip special.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title your Adventure</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium text-slate-800"
              placeholder="E.g. Sunrise in Kyoto"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input 
                type="text" 
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                placeholder="City, Country"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input 
                type="date" 
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-600"
                value={formData.dateOfTrip}
                onChange={e => setFormData({...formData, dateOfTrip: e.target.value})}
              />
            </div>
          </div>
        
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Photos (Max 5)</label>
            <input 
              type="file" 
              multiple
              accept="image/*"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-sky-100"
              onChange={e => {
                const files = Array.from(e.target.files).slice(0, 5);
                setImageFiles(files);
              }}
            />
            {imageFiles.length > 0 && (
              <p className="mt-2 text-sm text-brand-primary font-medium">{imageFiles.length} photo(s) selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">The Story</label>
            <textarea 
              required
              rows={6}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-slate-700 resize-none"
              placeholder="Tell us what happened..."
              value={formData.story}
              onChange={e => setFormData({...formData, story: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button disabled={saving} type="submit" className="bg-brand-primary hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-200 flex items-center justify-center min-w-[140px] disabled:opacity-70">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
