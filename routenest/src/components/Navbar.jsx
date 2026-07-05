import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Briefcase } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const getLinkClass = (matchStr, activeBg) => {
    if (path.startsWith(matchStr)) {
      return `${activeBg} text-black flex items-center gap-2 px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all`;
    }
    return `bg-[#2D2D2D] text-gray-200 flex items-center gap-2 px-4 py-2 border-2 border-gray-600 hover:text-white hover:border-gray-500 transition-colors`;
  };

  return (
    <nav className="bg-[#18181b] text-white sticky top-0 z-50 border-b-4 border-black">
      <div className="w-full px-6 flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="RouteNest Logo" className="h-12 w-auto group-hover:-translate-y-1 transition-transform" />
              <div className="flex flex-col">
                <span className="text-[#FFD166] font-black text-2xl tracking-tighter uppercase leading-none">
                  RouteNest
                </span>
                <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                  Your Travel Memory Vault
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <SignedIn>
              <nav className="hidden md:flex gap-4 text-xs font-black tracking-widest uppercase">
                <Link to="/dashboard" className={getLinkClass('/dashboard', 'bg-[#FFD166]')}>
                   STORIES
                </Link>
                <Link to="/itinerary" className={getLinkClass('/itinerary', 'bg-[#90EE90]')}>
                   ITINERARY
                </Link>
                <Link to="/recommendations" className={getLinkClass('/recommendations', 'bg-[#BAE1FF]')}>
                   DISCOVER
                </Link>
                <Link to="/community" className={getLinkClass('/community', 'bg-[#FFB3BA]')}>
                   COMMUNITY
                </Link>
              </nav>
              <div className="border-2 border-[#FFD166] rounded-full p-0.5 shadow-[2px_2px_0px_rgba(255,209,102,0.5)]">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }}/>
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-[#FFD166] hover:bg-[#FFC033] text-black px-6 py-2.5 font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                  Get Started Free
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
    </nav>
  );
}
