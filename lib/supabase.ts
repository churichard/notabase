import { createClient } from '@supabase/supabase-js';
import { Database } from 'types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ''
);

export default supabase;
