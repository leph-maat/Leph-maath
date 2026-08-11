import { createClient } from '@supabase/supabase-js';

// El anon/publishable key es público por diseño (protegido por RLS del lado del server).
// Fallback embebido para no depender de configurar env vars en cada hosting.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kjvuhgmkpiewtuqzyjjl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CazhM7rudqWeJoNpOcWWpQ_DnAM44WA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
