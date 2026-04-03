import express from 'express';
import { requireAuth } from '@clerk/express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Generate new itinerary via Gemini
router.post('/generate', requireAuth(), async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API is not configured.' });
    }

    const { destination, days, extraDetails } = req.body;
    
    if (!destination || !days) {
      return res.status(400).json({ error: 'Destination and days are required' });
    }

    const prompt = `Create a realistic, relaxed travel itinerary for ${days} days in ${destination}. 
Do not make it overly packed. Provide a sensible pace for a human traveler, factoring in transit times and rest. 
Additional details from traveler: "${extraDetails || 'None'}". 
Format the itinerary clearly in Markdown, day by day. Please make it sound like it was written by an experienced human travel planner.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    res.json({ itinerary: response.text });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// Save an itinerary to Supabase
router.post('/save', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { destination, days, content } = req.body;

    if (!destination || !days || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('itineraries')
      .insert([
        {
          user_id: userId,
          destination,
          days,
          content,
          is_public: false
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving itinerary:', error);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

// Get user's saved itineraries
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

// Delete an itinerary
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { data, error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    res.json({ message: 'Itinerary deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Toggle public status
router.patch('/:id/share', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { data: itinerary, error: fetchErr } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    
    if (fetchErr || !itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    const { data, error: updateErr } = await supabase
      .from('itineraries')
      .update({ is_public: !itinerary.is_public })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateErr) throw updateErr;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update visibility' });
  }
});

export default router;
