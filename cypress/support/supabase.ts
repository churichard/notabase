import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

export default supabase;
