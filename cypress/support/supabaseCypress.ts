import { createClient } from '@supabase/supabase-js';
import { Database } from 'types/supabase';

const supabase = createClient<Database>(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

export default supabase;
