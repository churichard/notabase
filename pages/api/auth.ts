import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from 'lib/supabase';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  supabase.auth.api.setAuthCookie(req, res);
}
