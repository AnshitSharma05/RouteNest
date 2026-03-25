import express from 'express';
import { requireAuth } from '@clerk/express';
import { GoogleGenAI } from '@google/genai';
import Itinerary from '../models/Itinerary.js';
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

// Save an itinerary to DB
router.post('/save', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { destination, days, content } = req.body;

    if (!destination || !days || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newItinerary = new Itinerary({
      userId,
      destination,
      days,
      content
    });

    const savedItinerary = await newItinerary.save();
    res.status(201).json(savedItinerary);
  } catch (error) {
    console.error('Error saving itinerary:', error);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

// Get user's saved itineraries
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const itineraries = await Itinerary.find({ userId }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

// Delete an itinerary
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    await itinerary.deleteOne();
    res.json({ message: 'Itinerary deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
