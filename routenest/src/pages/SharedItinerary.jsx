import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Compass, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SharedItinerary() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/itineraries/${id}`);
        setItinerary(res.data);
      } catch (err) {
        setError('This itinerary is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-slate-500 text-lg font-medium">Loading itinerary...</div>;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-10">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Cannot Access Trip</h1>
          <p className="text-red-400 mb-8">{error}</p>
          <Link to="/" className="text-brand-primary font-bold shadow-md shadow-sky-100 bg-white px-6 py-3 rounded-full hover:bg-sky-50 transition-colors">
            Go to RouteNest
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tiny Banner */}
      <div className="bg-brand-primary text-white text-sm py-2 text-center font-medium shadow-sm">
        Viewing a shared itinerary created with <Link to="/" className="underline font-bold hover:text-sky-100">RouteNest</Link>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white p-8 md:p-14 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 border-t-8 border-t-brand-primary">
          <div className="flex flex-col items-center text-center mb-10 pb-8 border-b border-slate-100">
            <div className="p-4 bg-brand-light rounded-2xl text-brand-primary mb-6 shadow-sm">
              <Compass className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">{itinerary.destination}</h1>
            <div className="inline-flex items-center gap-2 text-slate-500 font-medium px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Calendar className="w-4 h-4" /> {itinerary.days} Days
            </div>
          </div>
          
          <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:text-brand-primary prose-a:text-brand-accent prose-li:marker:text-brand-accent">
            <ReactMarkdown>{itinerary.content}</ReactMarkdown>
          </div>
        </div>
        <p className="mt-8 text-center text-slate-400 text-sm font-medium">
          RouteNest AI Generation © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
