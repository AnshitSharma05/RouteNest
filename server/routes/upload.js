import express from 'express';
import { requireAuth } from '@clerk/express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Use memory storage to process uploads directly via buffer rather than local disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', requireAuth(), upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    
    const urls = [];
    
    // Upload files immediately without pre-fetching bucket lists to bypass Anon 403 restricts
    for (const file of req.files) {
      // Create a unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `routenest_diaries/${fileName}`;

      // Upload directly to Supabase Storage
      const { data, error } = await supabase.storage
        .from('memories') // Your bucket name inside Supabase
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }
      
      // Get the Public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('memories')
        .getPublicUrl(filePath);

      urls.push(publicUrlData.publicUrl);
    }
    
    // Return all uploaded public URLs back to the frontend
    res.json({ urls });
  } catch (error) {
    console.error('Error uploading images to Supabase:', error);
    import('fs').then(fs => fs.writeFileSync('upload-error-debug.txt', String(error) + '\\n' + String(error.stack)));
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;
