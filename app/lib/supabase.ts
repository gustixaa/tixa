import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validasi proteksi dini agar project tidak crash tanpa kejelasan di production
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Env Variables: Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah terisi di file .env.local kamu!"
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)