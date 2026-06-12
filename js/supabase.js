/* ============================================================
   supabase.js — Supabase Client Initialization
   MusikForAll
   ============================================================ */

// Inisialisasi Supabase client (requires @supabase/supabase-js CDN loaded first)
const { createClient } = window.supabase;

const db = createClient(
  APP_CONFIG.supabaseUrl,
  APP_CONFIG.supabaseKey
);
