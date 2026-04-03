import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Sparkles, MapPin, Camera, Link as LinkIcon, Eye } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#F4F1E1] text-[#111] overflow-hidden px-4 py-12 font-sans">
      
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Text and CTA */}
        <div className="flex flex-col items-start z-10">
          
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 bg-[#FFB3BA] border-4 border-black px-4 py-1 font-bold text-sm uppercase tracking-wide shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2">
            <Sparkles className="w-4 h-4 fill-current" />
            Now with Gemini AI
          </div>

          {/* Heading */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] text-black">
            Your travels,
            <br />
            <span className="inline-block bg-[#FFD166] border-4 border-black px-4 py-2 mt-2 shadow-[8px_8px_0px_rgba(0,0,0,1)] -rotate-1">
              finally organised.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-10 text-xl md:text-2xl font-medium text-black max-w-xl leading-relaxed">
            Write travel stories, generate AI itineraries, and discover where to go next — all in one place that actually looks good.
          </p>

          {/* CTA Buttons - Using only the start button as requested ("remove see a demo trip button") */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 px-8 py-4 text-xl font-black uppercase tracking-wider text-black bg-[#90EE90] border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all">
                <span className="mr-2 text-2xl">🚀</span> Start for free
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Right Side: Graphic container */}
        <div className="relative w-full aspect-square max-w-2xl mx-auto lg:mx-0 mt-12 lg:mt-0 z-0">
          
          {/* Main Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border-4 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] p-6 rotate-1">
            <div className="mb-6">
              <h3 className="text-3xl font-black">Morocco Magic</h3>
              <p className="font-bold text-gray-600 flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-pink-500 fill-current" /> MARRAKECH &rarr; SAHARA
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-6 font-bold text-sm">
              <div className="bg-[#FFD166] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🌅 SAHARA SUNRISE
              </div>
              <div className="bg-[#BAE1FF] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🗺️ FEZ MEDINA
              </div>
              <div className="bg-[#FFDFD3] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🐫 CAMEL TREK
              </div>
            </div>

            {/* Itinerary Days */}
            <div className="flex flex-col gap-3 font-bold border-black">
              {[
                { day: "DAY 1", desc: "Arrival & Jemaa el-Fna", color: "bg-[#FFD166]" },
                { day: "DAY 2", desc: "Souks & Hammam", color: "bg-[#BAE1FF]" },
                { day: "DAY 3", desc: "Desert Drive via Atlas", color: "bg-[#FFB3BA]" },
              ].map((item, i) => (
                <div key={i} className={`${item.color} border-4 border-black p-4 flex justify-between items-center shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all`}>
                  <span className="text-sm font-black">{item.day}</span>
                  <span>{item.desc}</span>
                  <span>&gt;</span>
                </div>
              ))}
            </div>

            {/* Card Buttons */}
            <div className="flex gap-4 mt-6">
              <button className="flex-1 bg-black text-white font-bold py-3 px-4 border-4 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <LinkIcon className="w-4 h-4" /> SHARE TRIP
              </button>
              <button className="flex-1 bg-white text-black font-bold py-3 px-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                + ADD NOTE
              </button>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-[10%] right-[-5%] lg:right-[-10%] bg-[#FFB3BA] border-4 border-black p-3 shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-6 z-20 font-bold max-w-[150px] text-center">
            ✨ AI itinerary generated in 2s
          </div>
          
          <div className="absolute bottom-[5%] left-[-5%] lg:left-[-10%] md:bottom-[-5%] bg-[#BAE1FF] border-4 border-black p-3 shadow-[6px_6px_0px_rgba(0,0,0,1)] -rotate-3 z-20 font-bold max-w-[200px] flex items-center gap-2 justify-center">
            <LinkIcon className="w-4 h-4 text-pink-500" /> Shared with 3 friends
          </div>

        </div>
      </div>
    </div>
  );
}
