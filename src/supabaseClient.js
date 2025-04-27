import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseAnonKey = 'SUA_CHAVE_ANONIMA_DO_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);