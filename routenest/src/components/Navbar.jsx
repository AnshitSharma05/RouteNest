import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Compass, BookHeart, Map, ListStart } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-brand-primary font-bold text-xl tracking-tight">
              <Compass className="w-6 h-6" />
              RouteNest
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <SignedIn>
              <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                <Link to="/dashboard" className="hover:text-brand-primary flex items-center gap-1 transition-colors">
                  <BookHeart className="w-4 h-4" /> Diaries
                </Link>
                <Link to="/recommendations" className="hover:text-brand-primary flex items-center gap-1 transition-colors">
                  <Map className="w-4 h-4" /> AI Trips
                </Link>
                <Link to="/itinerary" className="hover:text-brand-primary flex items-center gap-1 transition-colors">
                  <ListStart className="w-4 h-4" /> Itineraries
                </Link>
              </nav>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-brand-light" } }}/>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-brand-primary hover:bg-sky-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md shadow-sky-200">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
