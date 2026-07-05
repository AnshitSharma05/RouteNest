import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function test() {
  console.log("Testing Supabase Insert...");
  const { data, error } = await supabase
    .from('itineraries')
    .insert([
      {
        user_id: 'test_user_id',
        destination: 'Test Dest',
        days: 7,
        content: 'Test content',
        is_public: false
      }
    ])
    .select();

  console.log('Result:', JSON.stringify({ data, error }, null, 2));

  if (data) {
    await supabase.from('itineraries').delete().eq('user_id', 'test_user_id');
    console.log("Cleanup complete.");
  }
}

test();
