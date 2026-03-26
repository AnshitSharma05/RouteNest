import express from 'express';
import Itinerary from '../models/Itinerary.js';

const router = express.Router();

router.get('/itineraries/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    if (!itinerary.isPublic) {
      return res.status(403).json({ error: 'This itinerary is completely private' });
    }
    
    res.json(itinerary);
  } catch (error) {
    console.error('Error fetching public itinerary:', error);
    res.status(500).json({ error: 'Server error retrieving itinerary' });
  }
});

export default router;
