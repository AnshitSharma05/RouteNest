import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// We use the Service Role Key since this is a backend server managing data securely.
// Ensure you set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ''
);
