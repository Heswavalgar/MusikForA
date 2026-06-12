/* ============================================================
   main.js — Entry Point & Global Initialization
   MusikForAll
   ============================================================ */

// ── THEME INIT (harus pertama, sebelum render apapun) ─────────
(function initThemeEarly() {
  const saved = localStorage.getItem(APP_CONFIG.themeKey) || APP_CONFIG.defaultTheme;
  // Migrate legacy theme values
  const migrated = saved === 'dark' ? 'cool-neon' : saved === 'light' ? 'sakura-soft' : saved;
  document.documentElement.dataset.theme = migrated;
})();

// ── STATS LOAD ────────────────────────────────────────────────
// totalSongsPlayed already loaded in loadHistory() called from showApp()
// Restore dari localStorage jika ada
(function restoreStats() {
  const played = parseInt(localStorage.getItem('mfa_songs_played') || '0');
  if (!isNaN(played)) totalSongsPlayed = played;
})();

// ── GLOBAL INISIALISASI SAAT DOM READY ───────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. Init ThemeManager (sync UI tombol tema di halaman pengaturan)
  ThemeManager.init();

  // 2. Tampilkan app loader
  //    hideLoader() dipanggil setelah session check selesai di auth.js

  // 3. Inisialisasi keyboard shortcut global
  document.addEventListener('keydown', (e) => {
    // Space = toggle play/pause (hanya jika tidak sedang focus di input)
    if (e.code === 'Space' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      if (typeof togglePlayPause === 'function') togglePlayPause();
    }
    // Escape = tutup full player / modal teratas
    if (e.code === 'Escape') {
      const fp = document.getElementById('fullPlayer');
      if (fp && !fp.classList.contains('hidden')) {
        fp.classList.add('hidden');
        if (typeof unlockBodyScroll === 'function') unlockBodyScroll();
        return;
      }
      const openModal = document.querySelector('.modal-overlay:not(.hidden)');
      if (openModal) { openModal.classList.add('hidden'); return; }
    }
    // ArrowLeft / ArrowRight = prev / next (full player terbuka)
    const fp = document.getElementById('fullPlayer');
    if (fp && !fp.classList.contains('hidden')) {
      if (e.code === 'ArrowLeft')  { e.preventDefault(); if (typeof playPrev === 'function') playPrev(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); if (typeof playNext === 'function') playNext(); }
    }
  });

  // 4. Inisialisasi PWA install prompt (opsional)
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  const installBtn = document.getElementById('installAppBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) { showToast('App sudah terinstall atau tidak didukung'); return; }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      showToast(outcome === 'accepted' ? 'App berhasil diinstall ✔' : 'Instalasi dibatalkan');
    });
  }

  // 5. Update tahun di footer (jika ada)
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 6. Ripple effect untuk tombol (opsional — UX enhancement)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || btn.disabled) return;
    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;border-radius:50%;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top  - size/2}px;
      background:rgba(255,255,255,0.25);
      transform:scale(0);animation:ripple-anim 0.45s linear;
      pointer-events:none;
    `;
    if (!ripple._added) {
      if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      ripple._added = true;
      ripple.addEventListener('animationend', () => ripple.remove());
    }
  });

});

// Ripple keyframe — injected dinamis agar tidak perlu file CSS tambahan
(function injectRippleKeyframe() {
  if (document.getElementById('rippleStyle')) return;
  const style = document.createElement('style');
  style.id = 'rippleStyle';
  style.textContent = `@keyframes ripple-anim { to { transform: scale(2.5); opacity: 0; } }`;
  document.head.appendChild(style);
})();
