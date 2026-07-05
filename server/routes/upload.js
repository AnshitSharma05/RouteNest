import express from 'express';
import { requireAuth } from '@clerk/express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', requireAuth(), upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const urls = [];
    for (const file of req.files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `routenest_diaries/${fileName}`;

      const { data, error } = await supabase.storage
        .from('memories')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }
      const { data: publicUrlData } = supabase.storage
        .from('memories')
        .getPublicUrl(filePath);

      urls.push(publicUrlData.publicUrl);
    }
    res.json({ urls });
  } catch (error) {
    console.error('Error uploading images to Supabase:', error);
    import('fs').then(fs => fs.writeFileSync('upload-error-debug.txt', String(error) + '\\n' + String(error.stack)));
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;
