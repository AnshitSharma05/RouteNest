import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Copy, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../apiConfig';

export default function SharedItinerary() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-[#F4F1E1]">
      <div className="border-4 border-black bg-[#FFD166] shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 font-black text-xl uppercase animate-pulse">
        Loading Itinerary...
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-[#F4F1E1] p-4">
        <div className="border-4 border-black bg-[#FFB3BA] shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 md:p-12 text-center max-w-xl">
          <h1 className="text-3xl font-black mb-4 uppercase">Cannot Access Trip</h1>
          <p className="font-bold mb-8">{error}</p>
          <Link to="/" className="inline-block bg-white border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] font-black uppercase px-6 py-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all">
            CREATE YOUR OWN ROUTE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F1E1] text-[#111] font-sans overflow-x-hidden pb-16">
      {/* Read-Only Banner */}
      <div className="bg-[#BAE1FF] border-b-4 border-black px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-20">
        <div className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
          <span>👁️</span> READ-ONLY VIEW — THIS ITINERARY WAS SHARED PUBLICLY. YOU CAN VIEW BUT NOT EDIT IT.
        </div>
        <Link to="/" className="bg-[#90EE90] border-2 border-black font-black uppercase text-xs px-4 py-2 hover:bg-[#7ce27c] shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center gap-2 flex-shrink-0">
          ✨ CREATE YOUR OWN FREE
        </Link>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 mt-10">
        
        {/* Header Hero Box */}
        <div className="bg-[#90EE90] border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,1)] p-6 md:p-10 mb-10 flex flex-col md:flex-row justify-between items-start gap-8">
          
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight leading-none bg-white inline-block border-4 border-black px-4 py-2 shadow-[4px_4px_0_rgba(0,0,0,1)]">
              {itinerary.destination}
            </h1>
            
            <div className="flex flex-wrap gap-3 mb-6 font-black uppercase text-xs tracking-wide">
              <span className="bg-[#FFB3BA] border-4 border-black px-3 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center gap-2">
                📍 {itinerary.destination}
              </span>
              <span className="bg-white border-4 border-black px-3 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center gap-2">
                🗓️ {itinerary.days} DAYS
              </span>
              <span className="bg-[#FFD166] border-4 border-black px-3 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center gap-2">
                👤 SHARED ROUTE
              </span>
            </div>

            <p className="font-bold text-gray-800 border-l-4 border-black pl-4">
              An AI-generated itinerary mapping out the entire timeline. Custom tailored for {itinerary.days} days of adventure.
            </p>
          </div>

          {/* Share Box Component */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-5 md:p-6 w-full md:w-[320px] shrink-0 font-bold">
            <div className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
              🔗 SHARE THIS TRIP
            </div>
            <div className="bg-[#F4F1E1] border-4 border-black p-3 text-xs text-black truncate mb-4 select-all shadow-[inset_2px_2px_0_rgba(0,0,0,0.2)]">
              {window.location.href}
            </div>
            <button 
              onClick={copyToClipboard}
              className={`w-full border-4 border-black py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px] ${copied ? 'bg-black text-white shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-[#FFD166] text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]'}`}>
              {copied ? <><CheckCircle2 className="w-5 h-5" /> COPIED!</> : <><Copy className="w-5 h-5" /> COPY LINK</>}
            </button>
          </div>

        </div>

        {/* Content Box */}
        <div className="border-4 border-black shadow-[16px_16px_0_rgba(0,0,0,1)] bg-white overflow-hidden mb-12">
          <div className="bg-white border-b-4 border-black p-4 md:px-10 md:py-6 flex items-center gap-3">
             <span className="text-2xl">📅</span>
             <h2 className="text-xl font-black uppercase tracking-widest text-[#111]">DAY BY DAY PLAN</h2>
          </div>
          
          <div className="p-6 md:p-12 bg-[#FFD166]">
            {/* Neo-brutalist styling for markdown inside yellow box */}
            <div className="prose prose-slate prose-xl max-w-none text-black 
              prose-headings:font-black prose-headings:uppercase prose-headings:text-black 
              prose-p:font-bold prose-p:leading-relaxed 
              prose-strong:bg-white prose-strong:border-4 prose-strong:border-black prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:shadow-[4px_4px_0_rgba(0,0,0,1)] prose-strong:whitespace-nowrap
              prose-ul:font-bold prose-li:marker:text-black 
              prose-a:bg-black prose-a:text-white prose-a:px-1 prose-a:no-underline
              whitespace-pre-wrap">
              <ReactMarkdown>{itinerary.content}</ReactMarkdown>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
