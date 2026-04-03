-- Run this entire script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  location TEXT,
  date_of_trip DATE,
  pictures TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  days INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Since we are querying via a trusted backend Express server acting as an admin, 
-- we do not necessarily need Row Level Security (RLS) policies here, 
-- but it's good practice to secure them anyway if you ever expose the Anon Key to the frontend.
