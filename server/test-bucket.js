import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './lib/supabase.js';

async function testBucket() {
  console.log("Listing buckets...");
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("List Error:", listError);
    return;
  }

  const memoriesBucket = buckets.find(b => b.name === 'memories');
  if (!memoriesBucket) {
    console.log("Bucket not found, creating 'memories'...");
    const { data, error: createError } = await supabase.storage.createBucket('memories', { public: true });
    if (createError) {
      console.error("Create Error:", createError);
      return;
    }
    console.log("Bucket created successfully:", data);
  } else {
    console.log("Bucket already exists.");
  }
}

testBucket();
