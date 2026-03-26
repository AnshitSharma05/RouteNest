import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

// Layouts & Pages
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import NewDiary from './pages/NewDiary'
import Recommendations from './pages/Recommendations'
import ItineraryGen from './pages/ItineraryGen'
import SharedItinerary from './pages/SharedItinerary'

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shared/itinerary/:id" element={<SharedItinerary />} />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/diary/new" 
            element={<ProtectedRoute><NewDiary /></ProtectedRoute>} 
          />
          <Route 
            path="/recommendations" 
            element={<ProtectedRoute><Recommendations /></ProtectedRoute>} 
          />
          <Route 
            path="/itinerary" 
            element={<ProtectedRoute><ItineraryGen /></ProtectedRoute>} 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
