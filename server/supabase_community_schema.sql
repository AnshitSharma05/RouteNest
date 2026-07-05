-- Run this entire script in your Supabase SQL Editor
-- It will set up the necessary tables for the Community feature.

-- 1. Create Communities Table
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial communities
INSERT INTO communities (name, description, created_by) VALUES
('backpacking-europe', 'Tips, stories, and itineraries for budget travel across Europe.', 'system'),
('asia-backpackers', 'Exploring South East Asia, East Asia, and beyond.', 'system'),
('luxury-getaways', 'For those who love first-class travel and fine dining.', 'system'),
('solo-travelers', 'Connecting solo wanderers across the globe.', 'system')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'general', 
  location TEXT,
  pictures TEXT[] DEFAULT '{}',
  original_memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  original_itinerary_id UUID REFERENCES itineraries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_post_votes (
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
  PRIMARY KEY (post_id, user_id)
);
