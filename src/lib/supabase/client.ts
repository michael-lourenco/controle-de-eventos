import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// Validação das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente para uso no cliente (browser) - usa anon key
// Só inicializa se as variáveis estiverem configuradas
export const supabase: SupabaseClient<Database> | null = 
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

// Cliente para uso no servidor - usa service role key (acesso total)
// Só inicializa se as variáveis estiverem configuradas
export const supabaseAdmin: SupabaseClient<Database> | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Helper para obter cliente baseado no contexto
export function getSupabaseClient(useAdmin: boolean = false): SupabaseClient<Database> {
  if (useAdmin) {
    if (!supabaseAdmin) {
      throw new Error('Supabase Admin não configurado. Verifique SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.');
    }
    return supabaseAdmin;
  }
  
  if (!supabase) {
    throw new Error('Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variáveis de ambiente.');
  }
  
  return supabase;
}

// Verificar se Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

