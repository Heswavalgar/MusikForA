/* ============================================================
   config.js — App Configuration & Constants
   MusikForAll
   ============================================================ */

const APP_CONFIG = {
  name: 'MusikForAll',
  version: '1.7',
  supabaseUrl: 'https://ddhuzpbhozmpsgkuduxl.supabase.co',
  supabaseKey: 'sb_publishable_iykqhLN18ql_aolcNcioQQ_y07ixpqL',
  themeKey: 'mfa_theme',
  defaultTheme: 'cool-neon',
  themes: [
    { value: 'cool-neon',   label: 'Cool Neon'   },
    { value: 'sakura-soft', label: 'Sakura Soft' },
    { value: 'cloud-white', label: 'Cloud White' },
  ],
  historyLimit: 5,
  searchHistoryLimit: 10,
};
