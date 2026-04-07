import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Sparkles, MapPin, Camera, Link as LinkIcon, Eye } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#F4F1E1] text-[#111] overflow-hidden px-4 py-4 font-sans border-b-8 border-transparent">
      
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side: Text and CTA */}
        <div className="flex flex-col items-start z-10 w-full">
          
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 bg-[#FFB3BA] border-4 border-black px-3 py-1 font-bold text-xs uppercase tracking-wide shadow-[3px_3px_0px_rgba(0,0,0,1)] -rotate-2">
            <Sparkles className="w-3 h-3 fill-current" />
            Now with Gemini AI
          </div>

          {/* Heading */}
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-black">
            Your travels,
            <br />
            <span className="inline-block bg-[#FFD166] border-4 border-black px-3 py-1 mt-2 shadow-[6px_6px_0px_rgba(0,0,0,1)] -rotate-1">
              finally organised.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg font-medium text-black max-w-lg leading-relaxed">
            Write travel stories, generate AI itineraries, and discover where to go next — all in one place that actually looks good.
          </p>

          {/* CTA Buttons - Using only the start button as requested ("remove see a demo trip button") */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 px-6 py-3 text-lg font-black uppercase tracking-wider text-black bg-[#90EE90] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                Start for free
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Right Side: Graphic container */}
        <div className="relative w-full aspect-square max-w-[22rem] mx-auto z-0 scale-95 lg:scale-100">
          
          {/* Main Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] p-5 rotate-1">
            <div className="mb-4">
              <h3 className="text-2xl font-black">Morocco Magic</h3>
              <p className="font-bold text-gray-600 flex items-center gap-1.5 mt-1 text-sm">
                <MapPin className="w-3.5 h-3.5 text-pink-500 fill-current" /> MARRAKECH &rarr; SAHARA
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5 font-bold text-[11px]">
              <div className="bg-[#FFD166] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                SAHARA SUNRISE
              </div>
              <div className="bg-[#BAE1FF] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                FEZ MEDINA
              </div>
              <div className="bg-[#FFDFD3] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                CAMEL TREK
              </div>
            </div>

            {/* Itinerary Days */}
            <div className="flex flex-col gap-2.5 font-bold border-black">
              {[
                { day: "DAY 1", desc: "Arrival & Jemaa el-Fna", color: "bg-[#FFD166]" },
                { day: "DAY 2", desc: "Souks & Hammam", color: "bg-[#BAE1FF]" },
                { day: "DAY 3", desc: "Desert Drive via Atlas", color: "bg-[#FFB3BA]" },
              ].map((item, i) => (
                <div key={i} className={`${item.color} border-4 border-black px-3 py-2.5 flex justify-between items-center shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-default transition-all`}>
                  <span className="text-xs font-black">{item.day}</span>
                  <span className="text-sm">{item.desc}</span>
                  <span className="text-sm">&gt;</span>
                </div>
              ))}
            </div>

            {/* Card Buttons */}
            <div className="flex gap-3 mt-5">
              <button className="flex-1 bg-black text-white font-bold py-2 px-2 text-xs border-4 border-black flex items-center justify-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> SHARE TRIP
              </button>
              <button className="flex-1 bg-white text-black font-bold py-2 px-2 text-xs border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5">
                + ADD NOTE
              </button>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-[8%] right-[-10%] lg:right-[-15%] bg-[#FFB3BA] border-4 border-black p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] rotate-6 z-20 font-bold max-w-[120px] text-xs text-center leading-tight">
            AI itinerary generated in 2s
          </div>
          
          <div className="absolute bottom-[2%] left-[-10%] lg:left-[-15%] bg-[#BAE1FF] border-4 border-black p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-3 z-20 font-bold max-w-[160px] text-xs flex items-center gap-1.5 justify-center">
            <LinkIcon className="w-3.5 h-3.5 text-pink-500" /> Shared with 3 friends
          </div>

        </div>
      </div>
    </div>
  );
}
