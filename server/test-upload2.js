import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './lib/supabase.js';

async function testUpload() {
  console.log("Uploading dummy file...");
  const dummyBuffer = Buffer.from('test image content', 'utf-8');
  const fileName = `test-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from('memories')
    .upload(fileName, dummyBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Upload Error:", error);
    return;
  }

  console.log("Upload Success! Data:", data);
}

testUpload();
