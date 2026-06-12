/* ============================================================
   ui.js — Navigation, Search, History, Sidebar, Profile, Inbox
   MusikForAll
   ============================================================ */

// ── DOM REFS ──────────────────────────────────────────────────
const menuBtn   = document.getElementById('menuBtn');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('sidebarOverlay');
const sidebarUser = document.getElementById('sidebarUser');
const pageTitle   = document.getElementById('pageTitle');
const toastEl     = document.getElementById('toast');
const appLoader   = document.getElementById('appLoader');

// ── STATE ─────────────────────────────────────────────────────
let playHistory   = [];
let searchHistory = [];
let profilePhotoUrl = null;
let backPressedOnce = false;
let backPressTimer  = null;
let _overflowLockCount = 0;

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, duration = 2500) {
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  toastEl.classList.add('visible');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('visible');
    setTimeout(() => { toastEl.style.display = 'none'; }, 300);
  }, duration);
}

// ── LOADER ────────────────────────────────────────────────────
function showLoader() { if (appLoader) appLoader.classList.add('visible'); }
function hideLoader() {
  if (appLoader) {
    appLoader.classList.remove('visible');
    setTimeout(() => { appLoader.style.display = 'none'; }, 400);
  }
}

// ── BODY SCROLL LOCK ──────────────────────────────────────────
function lockBodyScroll() {
  _overflowLockCount++;
  document.body.style.overflow = 'hidden';
}
function unlockBodyScroll() {
  _overflowLockCount = Math.max(0, _overflowLockCount - 1);
  if (_overflowLockCount === 0) document.body.style.overflow = '';
}

// ── NAVIGATION ────────────────────────────────────────────────
const sidebarPages = ['pengaturan', 'langganan', 'pusataktivitas'];
const allPages     = ['home', 'search', 'library', 'kotakmasuk', ...sidebarPages];

function showPage(p) {
  allPages.forEach(name => {
    const el = document.getElementById(name + 'Page');
    if (el) el.classList.remove('active');
  });
  ['homeTab','searchTab','libraryTab','inboxTab'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });

  const target = document.getElementById(p + 'Page');
  if (target) target.classList.add('active');

  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTop = 0;
  if (target) { target.style.removeProperty('--grad-alpha'); delete target.dataset.gradAlpha; }
  document.querySelector('.vinyl-section')?.classList.remove('scrolled');

  if (p === 'home')        { document.getElementById('homeTab')?.classList.add('active');    pageTitle.textContent = 'Beranda'; }
  else if (p === 'search') { document.getElementById('searchTab')?.classList.add('active'); pageTitle.textContent = 'Search'; renderSearchHistory(); }
  else if (p === 'library'){ document.getElementById('libraryTab')?.classList.add('active'); pageTitle.textContent = 'Library'; renderLibrary(); }
  else if (p === 'kotakmasuk') { document.getElementById('inboxTab')?.classList.add('active'); pageTitle.textContent = 'Kotak Masuk'; }
  else { pageTitle.textContent = 'MusikForAll'; }
}

function showSidebarPage(p) {
  if (isGuest() && (p === 'langganan' || p === 'pusataktivitas')) {
    sidebar.classList.remove('open'); overlay.classList.remove('show');
    requireAccount(); return;
  }
  sidebar.classList.remove('open'); overlay.classList.remove('show');
  if (p === 'pusataktivitas') updateActivityStats();
  showPage(p);
  if (p === 'pengaturan') ThemeManager.init();
}
window.showSidebarPage = showSidebarPage;

// ── SIDEBAR OPEN/CLOSE ────────────────────────────────────────
menuBtn.onclick = () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show', sidebar.classList.contains('open'));
};
overlay.onclick = () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
};

// ── BOTTOM NAV ────────────────────────────────────────────────
document.getElementById('homeTab')?.addEventListener('click',    () => showPage('home'));
document.getElementById('searchTab')?.addEventListener('click',  () => showPage('search'));
document.getElementById('libraryTab')?.addEventListener('click', () => showPage('library'));
document.getElementById('inboxTab')?.addEventListener('click',   () => showPage('kotakmasuk'));

// ── THEME MANAGER ─────────────────────────────────────────────
const ThemeManager = (() => {
  const KEY = APP_CONFIG.themeKey;
  const DEFAULT = APP_CONFIG.defaultTheme;

  function migrate(saved) {
    if (saved === 'dark')  return 'cool-neon';
    if (saved === 'light') return 'sakura-soft';
    return saved;
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
    _syncUI(theme);
  }
  function _syncUI(theme) {
    document.querySelectorAll('.theme-btn[data-theme-value]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeValue === theme);
    });
  }
  function init() {
    const saved = migrate(localStorage.getItem(KEY) || DEFAULT);
    applyTheme(saved);
    document.querySelectorAll('.theme-btn[data-theme-value]').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.themeValue));
    });
  }
  function getTheme() { return document.documentElement.dataset.theme || DEFAULT; }
  return { init, applyTheme, getTheme };
})();

// ── PAGE GRADIENT SCROLL EFFECT ───────────────────────────────
(function initPageScrollEffects() {
  const mainEl = document.querySelector('.main');
  if (!mainEl) return;
  const vinylSection = document.querySelector('.vinyl-section');
  const pageGradMap = {
    'homePage': '--grad-page-home', 'searchPage': '--grad-page-search',
    'libraryPage': '--grad-page-library', 'kotakmasukPage': '--grad-page-inbox',
  };
  mainEl.addEventListener('scroll', () => {
    const scrollY = mainEl.scrollTop;
    if (vinylSection) vinylSection.classList.toggle('scrolled', scrollY > 20);
    const alpha = Math.max(0, 1 - Math.max(0, scrollY - 60) / 200);
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    const varName = pageGradMap[activePage.id];
    if (!varName) return;
    if (alpha >= 0.99) { activePage.dataset.gradAlpha = '1'; }
    else { activePage.dataset.gradAlpha = alpha.toFixed(3); }
    activePage.style.setProperty('--grad-alpha', alpha.toFixed(3));
  }, { passive: true });
})();

// ── ACTIVITY STATS ────────────────────────────────────────────
function updateActivityStats() {
  const el1 = document.getElementById('statSongsPlayed');
  const el3 = document.getElementById('statPlaylistCount');
  if (el1) el1.textContent = totalSongsPlayed;
  if (el3) el3.textContent = userPlaylists.length;
}

// ── SEARCH ────────────────────────────────────────────────────
document.getElementById('searchPageInput')?.addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  const searchResults = document.getElementById('searchResults');
  const searchResultLabel = document.getElementById('searchResultLabel');
  const searchHistorySection = document.getElementById('searchHistorySection');

  if (!q) {
    searchResults.innerHTML = '';
    searchResultLabel.style.display = 'none';
    renderSearchHistory();
    return;
  }
  searchHistorySection.style.display = 'none';
  searchResultLabel.style.display = '';
  const filtered = songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  if (filtered.length === 0) {
    searchResults.innerHTML = '<p style="color:#6b6b7a;padding:10px">Tidak ada hasil.</p>';
    return;
  }
  renderList(searchResults, filtered, true);
});

// ── HISTORY ───────────────────────────────────────────────────
function loadHistory() {
  try { playHistory = JSON.parse(localStorage.getItem('mfa_history') || '[]'); } catch { playHistory = []; }
  try { searchHistory = JSON.parse(localStorage.getItem('mfa_search_history') || '[]'); } catch { searchHistory = []; }
  try { totalSongsPlayed = parseInt(localStorage.getItem('mfa_songs_played') || '0') || 0; } catch { totalSongsPlayed = 0; }
  if (isGuest()) totalSongsPlayed = 0;
}
function saveHistory() { localStorage.setItem('mfa_history', JSON.stringify(playHistory)); }
function addToHistory(song) {
  playHistory = playHistory.filter(s => s.id !== song.id);
  playHistory.unshift(song);
  if (playHistory.length > APP_CONFIG.historyLimit) playHistory = playHistory.slice(0, APP_CONFIG.historyLimit);
  saveHistory();
  if (document.getElementById('homePage')?.classList.contains('active')) renderHome();
}
function addToSearchHistory(song) {
  searchHistory = searchHistory.filter(s => s.id !== song.id);
  searchHistory.unshift(song);
  if (searchHistory.length > APP_CONFIG.searchHistoryLimit) searchHistory = searchHistory.slice(0, APP_CONFIG.searchHistoryLimit);
  localStorage.setItem('mfa_search_history', JSON.stringify(searchHistory));
}
function renderSearchHistory() {
  const searchInput = document.getElementById('searchPageInput');
  const searchHistorySection = document.getElementById('searchHistorySection');
  const searchHistoryEl = document.getElementById('searchHistory');
  if (!searchInput.value.trim() && searchHistory.length > 0) {
    searchHistorySection.style.display = '';
    searchHistoryEl.innerHTML = '';
    searchHistory.forEach(s => {
      const globalIdx = songs.findIndex(gs => gs.title === s.title && gs.artist === s.artist);
      const item = document.createElement('div');
      item.className = 'search-history-item';
      item.innerHTML = `
        ${s.cover
          ? `<img src="${s.cover}" class="search-history-cover" onerror="this.outerHTML='<span class=\\'search-history-icon\\'>🕐</span>'">`
          : `<span class="search-history-icon">🕐</span>`}
        <div class="search-history-info">
          <div class="search-history-title">${s.title}</div>
          <div class="search-history-artist">${s.artist}</div>
        </div>
      `;
      item.onclick = () => { if (globalIdx !== -1) playSong(globalIdx); };
      searchHistoryEl.appendChild(item);
    });
  } else {
    searchHistorySection.style.display = 'none';
  }
}

// ── PROFILE ───────────────────────────────────────────────────
function loadProfilePhoto() {
  const username = localStorage.getItem('mfa_username');
  const key = `mfa_photo_${username}`;
  profilePhotoUrl = localStorage.getItem(key) || null;
  updateAvatarUI();
}
function saveProfilePhoto(dataUrl) {
  const username = localStorage.getItem('mfa_username');
  localStorage.setItem(`mfa_photo_${username}`, dataUrl);
  profilePhotoUrl = dataUrl;
  updateAvatarUI();
}
function deleteProfilePhoto() {
  const username = localStorage.getItem('mfa_username');
  localStorage.removeItem(`mfa_photo_${username}`);
  profilePhotoUrl = null;
  updateAvatarUI();
}
function updateAvatarUI() {
  const has = !!profilePhotoUrl;
  const src = profilePhotoUrl || '';
  const sidebarAvatarImg   = document.getElementById('sidebarAvatarImg');
  const sidebarAvatarEmoji = document.getElementById('sidebarAvatarEmoji');
  const profileAvatarImg   = document.getElementById('profileAvatarImg');
  const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
  if (sidebarAvatarImg)   { sidebarAvatarImg.src = has ? src : '';   sidebarAvatarImg.style.display   = has ? 'block' : 'none'; }
  if (sidebarAvatarEmoji)   sidebarAvatarEmoji.style.display = has ? 'none' : '';
  if (profileAvatarImg)   { profileAvatarImg.src = has ? src : '';   profileAvatarImg.style.display   = has ? 'block' : 'none'; }
  if (profileAvatarEmoji)   profileAvatarEmoji.style.display = has ? 'none' : '';
  const delBtn = document.getElementById('profileDeleteBtn');
  if (delBtn) delBtn.classList.toggle('hidden', !has);
  const topLogo = document.getElementById('menuBtn');
  if (topLogo) topLogo.innerHTML = has ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : '🎵';
}

function showProfilePage() {
  if (isGuest()) { requireAccount(); return; }
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  refreshProfileFields();
  updateAvatarUI();
  const profilePage = document.getElementById('profilePage');
  if (profilePage) { profilePage.classList.remove('hidden'); lockBodyScroll(); }
}
window.showProfilePage = showProfilePage;

function refreshProfileFields() {
  const username = localStorage.getItem('mfa_username') || '-';
  const profileUsernameEl = document.getElementById('profileUsername');
  if (profileUsernameEl) profileUsernameEl.textContent = '@' + username;
  const bio   = localStorage.getItem(`mfa_bio_${username}`) || '';
  const phone = localStorage.getItem(`mfa_phone_${username}`) || '';
  const bioEl   = document.getElementById('profileBio');
  const phoneEl = document.getElementById('profilePhone');
  if (bioEl)   { bioEl.textContent   = bio   || 'Belum ada bio'; bioEl.classList.toggle('muted', !bio); }
  if (phoneEl) { phoneEl.textContent = phone || 'Belum diisi';   phoneEl.classList.toggle('muted', !phone); }
}

document.getElementById('profileBack')?.addEventListener('click', () => {
  document.getElementById('profilePage').classList.add('hidden');
  unlockBodyScroll();
});

document.getElementById('profileUploadBtn')?.addEventListener('click', () => {
  document.getElementById('profilePhotoInput')?.click();
});
document.getElementById('profilePhotoInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) openCropOverlay(file);
  e.target.value = '';
});
document.getElementById('profileDeleteBtn')?.addEventListener('click', () => {
  deleteProfilePhoto();
  showToast('Foto profil dihapus');
});
document.getElementById('profileShareBtn')?.addEventListener('click', () => {
  const username = localStorage.getItem('mfa_username') || 'user';
  if (navigator.share) {
    navigator.share({ title: `@${username} di MusikForAll`, text: `Cek profil saya di MusikForAll!` });
  } else {
    showToast('Bagikan profil: @' + username);
  }
});

// ── PROFILE FIELD EDIT ────────────────────────────────────────
let currentEditField = null;

document.querySelectorAll('.profile-field-edit[data-field]').forEach(btn => {
  btn.onclick = () => {
    currentEditField = btn.dataset.field;
    const username = localStorage.getItem('mfa_username') || '';
    const titleEl = document.getElementById('profileEditTitle');
    const inputEl = document.getElementById('profileEditInput');
    const noteEl  = document.getElementById('profileEditNote');
    if (currentEditField === 'username') {
      if (titleEl) titleEl.textContent = 'Ganti Username';
      if (inputEl) inputEl.value = username;
      if (noteEl)  { noteEl.textContent = 'Username harus unik.'; noteEl.style.display = 'block'; }
    } else if (currentEditField === 'bio') {
      if (titleEl) titleEl.textContent = 'Edit Bio';
      if (inputEl) inputEl.value = localStorage.getItem(`mfa_bio_${username}`) || '';
      if (noteEl)  noteEl.style.display = 'none';
    } else if (currentEditField === 'phone') {
      if (titleEl) titleEl.textContent = 'Edit Nomor / Email';
      if (inputEl) inputEl.value = localStorage.getItem(`mfa_phone_${username}`) || '';
      if (noteEl)  noteEl.style.display = 'none';
    }
    document.getElementById('profileEditModal')?.classList.remove('hidden');
    setTimeout(() => inputEl && inputEl.focus(), 120);
  };
});
document.getElementById('profileEditCancel')?.addEventListener('click', () => {
  document.getElementById('profileEditModal')?.classList.add('hidden');
});
document.getElementById('profileEditSave')?.addEventListener('click', async () => {
  const val      = document.getElementById('profileEditInput')?.value.trim() || '';
  const username = localStorage.getItem('mfa_username') || '';
  if (!val) return showToast('Tidak boleh kosong');
  if (currentEditField === 'username') {
    const { data: existing, error: checkErr } = await db.from('profiles').select('username').eq('username', val).maybeSingle();
    if (checkErr) return showToast('Gagal memeriksa username');
    if (existing && val !== username) return showToast('Username sudah dipakai');
    const { error } = await db.from('profiles').update({ username: val }).eq('username', username);
    if (error) return showToast('Gagal update username');
    localStorage.setItem('mfa_username', val);
    ['mfa_photo_', 'mfa_bio_', 'mfa_phone_'].forEach(prefix => {
      const old = localStorage.getItem(prefix + username);
      if (old) { localStorage.setItem(prefix + val, old); localStorage.removeItem(prefix + username); }
    });
    if (sidebarUser) sidebarUser.textContent = '@' + val;
    showToast('Username diperbarui ✔');
  } else if (currentEditField === 'bio') {
    localStorage.setItem(`mfa_bio_${username}`, val);
    showToast('Bio diperbarui ✔');
  } else if (currentEditField === 'phone') {
    localStorage.setItem(`mfa_phone_${username}`, val);
    showToast('Info kontak diperbarui ✔');
  }
  document.getElementById('profileEditModal')?.classList.add('hidden');
  refreshProfileFields();
});

// ── CHANGE PASSWORD ───────────────────────────────────────────
document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
  document.getElementById('changePasswordModal')?.classList.remove('hidden');
});
document.getElementById('cpCancel')?.addEventListener('click', () => {
  document.getElementById('changePasswordModal')?.classList.add('hidden');
});
document.getElementById('cpSave')?.addEventListener('click', async () => {
  const oldPw = document.getElementById('cpOldPw').value;
  const newPw = document.getElementById('cpNewPw').value;
  const conPw = document.getElementById('cpConfirmPw').value;
  const email = localStorage.getItem('mfa_email') || '';
  if (!oldPw || !newPw || !conPw) return showToast('Isi semua kolom');
  if (newPw.length < 8) return showToast('Sandi baru min. 8 karakter');
  if (newPw !== conPw) return showToast('Konfirmasi sandi tidak cocok');
  showLoader();
  const { error: signInError } = await db.auth.signInWithPassword({ email, password: oldPw });
  if (signInError) { hideLoader(); return showToast('Sandi lama salah'); }
  const { error } = await db.auth.updateUser({ password: newPw });
  hideLoader();
  if (error) return showToast('Gagal ganti sandi');
  document.getElementById('changePasswordModal')?.classList.add('hidden');
  ['cpOldPw','cpNewPw','cpConfirmPw'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  showToast('Sandi berhasil diperbarui ✔');
});

// ── CROP OVERLAY ──────────────────────────────────────────────
let cropState = { img: null, x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false, lastDist: 0 };

function openCropOverlay(file) {
  const cropOverlay = document.getElementById('profileAvatarOverlay');
  const canvas = document.getElementById('cropCanvas');
  if (!cropOverlay || !canvas) return;
  const size = Math.min(window.innerWidth - 48, 280);
  canvas.width = size; canvas.height = size;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      cropState.img = img;
      const scale = Math.max(size / img.width, size / img.height);
      cropState.scale = scale;
      cropState.x = (size - img.width * scale) / 2;
      cropState.y = (size - img.height * scale) / 2;
      drawCrop();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  cropOverlay.style.display = 'flex';
  canvas.ontouchstart = (e) => { e.preventDefault(); if (e.touches.length===1) { cropState.dragging=true; cropState.startX=e.touches[0].clientX-cropState.x; cropState.startY=e.touches[0].clientY-cropState.y; } else if (e.touches.length===2) { cropState.lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); } };
  canvas.ontouchmove  = (e) => { e.preventDefault(); if (e.touches.length===1&&cropState.dragging) { cropState.x=e.touches[0].clientX-cropState.startX; cropState.y=e.touches[0].clientY-cropState.startY; drawCrop(); } else if (e.touches.length===2) { const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); cropState.scale*=dist/(cropState.lastDist||dist); cropState.lastDist=dist; drawCrop(); } };
  canvas.ontouchend   = () => { cropState.dragging = false; };
  canvas.onmousedown  = (e) => { cropState.dragging=true; cropState.startX=e.clientX-cropState.x; cropState.startY=e.clientY-cropState.y; };
  canvas.onmousemove  = (e) => { if (!cropState.dragging) return; cropState.x=e.clientX-cropState.startX; cropState.y=e.clientY-cropState.startY; drawCrop(); };
  canvas.onmouseup    = () => { cropState.dragging = false; };
  canvas.onwheel      = (e) => { e.preventDefault(); cropState.scale*=e.deltaY<0?1.1:0.9; drawCrop(); };
}
function drawCrop() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas || !cropState.img) return;
  const ctx = canvas.getContext('2d');
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  ctx.save(); ctx.beginPath(); ctx.arc(s/2,s/2,s/2,0,Math.PI*2); ctx.clip();
  ctx.drawImage(cropState.img, cropState.x, cropState.y, cropState.img.width*cropState.scale, cropState.img.height*cropState.scale);
  ctx.restore();
}
function confirmCrop() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas) return;
  const out = document.createElement('canvas');
  out.width = 300; out.height = 300;
  const ctx = out.getContext('2d');
  ctx.beginPath(); ctx.arc(150,150,150,0,Math.PI*2); ctx.clip();
  const ratio = 300/canvas.width;
  ctx.drawImage(cropState.img, cropState.x*ratio, cropState.y*ratio, cropState.img.width*cropState.scale*ratio, cropState.img.height*cropState.scale*ratio);
  saveProfilePhoto(out.toDataURL('image/jpeg', 0.85));
  document.getElementById('profileAvatarOverlay').style.display = 'none';
  showToast('Foto profil diperbarui ✔');
}
document.getElementById('cropConfirm')?.addEventListener('click', confirmCrop);
document.getElementById('cropCancel')?.addEventListener('click', () => {
  document.getElementById('profileAvatarOverlay').style.display = 'none';
});

// ── INBOX SUB PAGES ───────────────────────────────────────────
function openInboxSubPage(pageId) {
  const el = document.getElementById(pageId);
  if (el) el.classList.remove('hidden');
  lockBodyScroll();
}
function closeInboxSubPage(pageId) {
  const el = document.getElementById(pageId);
  if (el) el.classList.add('hidden');
  unlockBodyScroll();
}

document.getElementById('inboxFriendBtn')?.addEventListener('click', () => {
  if (isGuest()) { requireAccount(); return; }
  openInboxSubPage('inboxFriendPage');
  loadFriendPage();
});
document.getElementById('inboxSistemBtn')?.addEventListener('click',  () => openInboxSubPage('inboxSistemPage'));
document.getElementById('inboxAppBtn')?.addEventListener('click',     () => openInboxSubPage('inboxAppPage'));
document.getElementById('inboxUpdateBtn')?.addEventListener('click',  () => openInboxSubPage('inboxUpdatePage'));
document.getElementById('inboxFriendBack')?.addEventListener('click', () => closeInboxSubPage('inboxFriendPage'));
document.getElementById('inboxSistemBack')?.addEventListener('click', () => closeInboxSubPage('inboxSistemPage'));
document.getElementById('inboxAppBack')?.addEventListener('click',    () => closeInboxSubPage('inboxAppPage'));
document.getElementById('inboxUpdateBack')?.addEventListener('click', () => closeInboxSubPage('inboxUpdatePage'));

// ── HARDWARE BACK BUTTON ──────────────────────────────────────
window.addEventListener('popstate', handleBack);
history.pushState({ page: 'app' }, '');

function handleBack() {
  history.pushState({ page: 'app' }, '');

  const playlistDetailPage = document.getElementById('playlistDetailPage');
  if (playlistDetailPage && !playlistDetailPage.classList.contains('hidden')) { closePlaylistDetail(); return; }

  const editModal = document.getElementById('editPlaylistModal');
  if (editModal && !editModal.classList.contains('hidden')) { closeEditPlaylistModal(); return; }

  const fullPlayer = document.getElementById('fullPlayer');
  if (fullPlayer && !fullPlayer.classList.contains('hidden')) { fullPlayer.classList.add('hidden'); unlockBodyScroll(); return; }

  const profilePage = document.getElementById('profilePage');
  if (profilePage && !profilePage.classList.contains('hidden')) { profilePage.classList.add('hidden'); return; }

  const inboxSubs = ['inboxFriendPage','inboxSistemPage','inboxAppPage','inboxUpdatePage'];
  const openInboxSub = inboxSubs.find(id => { const el = document.getElementById(id); return el && !el.classList.contains('hidden'); });
  if (openInboxSub) { closeInboxSubPage(openInboxSub); return; }

  const playlistAddPage = document.getElementById('playlistAddPage');
  if (playlistAddPage && !playlistAddPage.classList.contains('hidden')) { closePlaylistAddPage(); return; }

  const openModal = document.querySelector('.modal-overlay:not(.hidden)');
  if (openModal) { openModal.classList.add('hidden'); return; }

  if (sidebar.classList.contains('open')) { sidebar.classList.remove('open'); overlay.classList.remove('show'); return; }

  const activeSidebarPage = sidebarPages.find(name => document.getElementById(name + 'Page')?.classList.contains('active'));
  if (activeSidebarPage) { showPage('home'); return; }

  if (document.getElementById('kotakmasukPage')?.classList.contains('active')) { showPage('home'); return; }

  const currentActivePage = ['search','library'].find(name => document.getElementById(name + 'Page')?.classList.contains('active'));
  if (currentActivePage) { showPage('home'); return; }

  if (backPressedOnce) { clearTimeout(backPressTimer); history.go(-2); return; }
  backPressedOnce = true;
  showToast('Tekan sekali lagi untuk keluar');
  backPressTimer = setTimeout(() => { backPressedOnce = false; }, 2000);
}
