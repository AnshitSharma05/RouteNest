import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

router.get('/itineraries/:id', async (req, res) => {
  try {
    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    if (!itinerary.is_public) {
      return res.status(403).json({ error: 'This itinerary is completely private' });
    }

    res.json(itinerary);
  } catch (error) {
    console.error('Error fetching public itinerary:', error);
    res.status(500).json({ error: 'Server error retrieving itinerary' });
  }
});

export default router;
