import express from 'express';
import { requireAuth } from '@clerk/express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all memories for the authenticated user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Create a new memory
router.post('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { title, story, pictures, location, dateOfTrip } = req.body;
    
    if (!title || !story) {
      return res.status(400).json({ error: 'Title and story are required' });
    }

    const { data, error } = await supabase
      .from('memories')
      .insert([
        {
          user_id: userId,
          title,
          story,
          pictures: pictures || [],
          location,
          date_of_trip: dateOfTrip || null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Delete a memory
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const memoryId = req.params.id;
    
    const { data, error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ error: 'Memory not found or unauthorized' });
    }
    
    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;
