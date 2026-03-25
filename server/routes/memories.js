import express from 'express';
import { requireAuth } from '@clerk/express';
import Memory from '../models/Memory.js';

const router = express.Router();

// Get all memories for the authenticated user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 });
    res.json(memories);
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

    const newMemory = new Memory({
      userId,
      title,
      story,
      pictures: pictures || [],
      location,
      dateOfTrip
    });

    const savedMemory = await newMemory.save();
    res.status(201).json(savedMemory);
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
    
    const memory = await Memory.findOne({ _id: memoryId, userId });
    
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found or unauthorized' });
    }
    
    await memory.deleteOne();
    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;
