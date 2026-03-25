import { useAuth, SignInButton } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, MapPin, Camera } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative overflow-hidden pt-16 pb-32 flex flex-col items-center text-center">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -translate-y-12 translate-x-1/3 right-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-40 -translate-x-1/2 left-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight leading-tight">
          Your Travels, <span className="text-brand-primary">Automagically</span> Organized
        </h1>
        
        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          RouteNest is your AI-powered memory diary and travel planner. Generate perfect itineraries, get stunning recommendations, and keep your memories forever.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <SignInButton mode="modal">
            <button className="px-8 py-4 text-lg font-semibold rounded-full text-white bg-brand-primary hover:bg-sky-600 shadow-xl shadow-sky-200 transition-all hover:-translate-y-1 duration-300">
              Start Your Journey
            </button>
          </SignInButton>
          <a href="#features" className="px-8 py-4 text-lg font-semibold rounded-full text-brand-primary bg-white border border-sky-100 shadow-sm hover:shadow-md transition-all duration-300">
            Learn More
          </a>
        </div>
      </div>

      <div id="features" className="mt-32 max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {[
          { icon: Camera, title: "Memory Diaries", desc: "Log your daily adventures with pictures and rich stories. Keep the magic alive." },
          { icon: Sparkles, title: "AI Itineraries", desc: "Ditch the spreadsheets. Our AI builds realistic, breezy daily plans tailored to you." },
          { icon: MapPin, title: "Smart Discovery", desc: "Not sure where to go? Tell us your vibe, and we'll suggest hidden gems worldwide." }
        ].map((feature, i) => (
          <div key={i} className="bg-white/60 backdrop-blur border border-sky-50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:-translate-y-2 transition-all duration-500 text-left cursor-default group">
            <div className="bg-brand-light w-14 h-14 rounded-2xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
