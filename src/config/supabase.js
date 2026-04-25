const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is missing in .env');
}

// Menggunakan Service Role Key untuk operasi backend (bypass RLS jika perlu)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
