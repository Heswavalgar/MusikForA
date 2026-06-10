/* ============================================================
   MusikForAll — app.js
   ============================================================ */

// ── SUPABASE ─────────────────────────────────────────────────
const { createClient } = window.supabase;
const db = createClient(
  'https://ddhuzpbhozmpsgkuduxl.supabase.co',
  'sb_publishable_iykqhLN18ql_aolcNcioQQ_y07ixpqL'
);

// ── DOM ───────────────────────────────────────────────────────
const loginPage    = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const app          = document.getElementById('app');
const usernameEl   = document.getElementById('username');
const passwordEl   = document.getElementById('password');
const loginBtn     = document.getElementById('loginBtn');
const goRegisterLink  = document.getElementById('goRegisterLink');
const goLoginLink     = document.getElementById('goLoginLink');
const guestBtn     = document.getElementById('guestBtn');

const regUsernameEl        = document.getElementById('regUsername');
const regEmailEl           = document.getElementById('regEmail');
const regPasswordEl        = document.getElementById('regPassword');
const regConfirmPasswordEl = document.getElementById('regConfirmPassword');
const regSubmitBtn         = document.getElementById('regSubmitBtn');

const heroTitle  = document.getElementById('heroTitle');
const heroArtist = document.getElementById('heroArtist');
const vinylDisc  = document.getElementById('vinylDisc');
const vinylCover = document.getElementById('vinylCover');
const albumGrid  = document.getElementById('albumGrid');

const audio         = document.getElementById('audio');
const miniPlayBtn   = document.getElementById('miniPlayBtn');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const miniCover     = document.getElementById('miniCover');
const currentSong   = document.getElementById('currentSong');
const currentArtist = document.getElementById('currentArtist');
const miniPlayer    = document.getElementById('miniPlayer');

const menuBtn     = document.getElementById('menuBtn');
const sidebar     = document.getElementById('sidebar');
const overlay     = document.getElementById('sidebarOverlay');
const sidebarUser = document.getElementById('sidebarUser');
const pageTitle   = document.getElementById('pageTitle');

const homePage    = document.getElementById('homePage');
const searchPage  = document.getElementById('searchPage');
const libraryPage = document.getElementById('libraryPage');
const homeTab     = document.getElementById('homeTab');
const searchTab   = document.getElementById('searchTab');
const libraryTab  = document.getElementById('libraryTab');
const inboxTab    = document.getElementById('inboxTab');
const searchInput         = document.getElementById('searchPageInput');
const searchResults       = document.getElementById('searchResults');
const searchHistorySection = document.getElementById('searchHistorySection');
const searchResultLabel   = document.getElementById('searchResultLabel');
const searchHistoryEl     = document.getElementById('searchHistory');
const homeListLabel       = document.getElementById('homeListLabel');

const fullPlayer   = document.getElementById('fullPlayer');
const fpBack       = document.getElementById('fpBack');
const fpVinyl      = document.getElementById('fpVinyl');
const fpVinylCover = document.getElementById('fpVinylCover');
const fpTitle      = document.getElementById('fpTitle');
const fpArtist     = document.getElementById('fpArtist');
const fpPlay       = document.getElementById('fpPlay');
const fpPrev       = document.getElementById('fpPrev');
const fpNext       = document.getElementById('fpNext');
const fpProgress   = document.getElementById('fpProgressBar');
const fpCurrent    = document.getElementById('fpCurrent');
const fpDuration   = document.getElementById('fpDuration');
const fpVolume     = document.getElementById('fpVolume');
const fpShuffle    = document.getElementById('fpShuffle');

const toastEl = document.getElementById('toast');

const addToPlaylistModal = document.getElementById('addToPlaylistModal');
const modalSongName      = document.getElementById('modalSongName');
const modalPlaylistList  = document.getElementById('modalPlaylistList');
const modalClose         = document.getElementById('modalClose');

const logoutModal      = document.getElementById('logoutModal');
const logoutCancel     = document.getElementById('logoutCancel');
const logoutConfirmBtn = document.getElementById('logoutConfirm');
const appLoader        = document.getElementById('appLoader');
const profilePage      = document.getElementById('profilePage');
const profileBack      = document.getElementById('profileBack');
const profileUploadBtn = document.getElementById('profileUploadBtn');
const profilePhotoInput  = document.getElementById('profilePhotoInput');
const profileAvatarImg   = document.getElementById('profileAvatarImg');
const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
const profileAvatarBig   = document.getElementById('profileAvatarBig');
const profileUsernameEl  = document.getElementById('profileUsername');
// sidebarLogoAvatar/Img/Emoji removed — sidebar logo is now a static element
const sidebarAvatarImg   = document.getElementById('sidebarAvatarImg');
const sidebarAvatarEmoji = document.getElementById('sidebarAvatarEmoji');
const fpSwipeContainer   = document.getElementById('fpSwipeContainer');
const fpQueueList        = document.getElementById('fpQueueList');
const fpLyricsContent    = document.getElementById('fpLyricsContent');

const guestModal       = document.getElementById('guestModal');
const guestStayBtn     = document.getElementById('guestStayBtn');
const guestRegisterBtn = document.getElementById('guestRegisterBtn');

// ── STATE ─────────────────────────────────────────────────────
let songs            = [];
let currentIndex     = -1;
let isPlaying        = false;
let playHistory      = [];
let userPlaylists    = [];
let shuffleMode      = false;
let shuffledQueue    = [];
let searchHistory    = [];
let totalSongsPlayed = 0;
let recommendedSongs = [];
let modalTargetSong  = null;
let profilePhotoUrl  = null;

// ── THEME MANAGER ─────────────────────────────────────────────
const ThemeManager = (() => {
  const KEY     = 'mfa_theme';
  const DEFAULT = 'cool-neon';

  const THEMES = [
    { value: 'cool-neon',    label: 'Cool Neon'   },
    { value: 'sakura-soft',  label: 'Sakura Soft' },
    { value: 'cloud-white',  label: 'Cloud White' },
  ];

  // Migrate legacy theme keys from old dark/light values
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
    // Update pill buttons
    document.querySelectorAll('.theme-btn[data-theme-value]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeValue === theme);
    });
    // Update legacy label if still present
    const label = document.getElementById('themeLabelText');
    if (label) {
      const found = THEMES.find(t => t.value === theme);
      if (found) label.textContent = found.label;
    }
  }

  function init() {
    const raw   = localStorage.getItem(KEY) || DEFAULT;
    const saved = migrate(raw);
    applyTheme(saved);

    // Wire up pill buttons (rendered in HTML)
    document.querySelectorAll('.theme-btn[data-theme-value]').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.themeValue));
    });
  }

  function getTheme() {
    return document.documentElement.dataset.theme || DEFAULT;
  }

  return { init, applyTheme, getTheme };
})();

// ── UTIL ──────────────────────────────────────────────────────
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

function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isGuest() {
  return localStorage.getItem('mfa_guest') === 'true';
}

function requireAccount() {
  guestModal.classList.remove('hidden');
}

// ── LOADING SPINNER ───────────────────────────────────────────
function showLoader() {
  if (appLoader) appLoader.classList.add('visible');
}

function hideLoader() {
  if (appLoader) {
    appLoader.classList.remove('visible');
    setTimeout(() => { appLoader.style.display = 'none'; }, 400);
  }
}

// ── OVERFLOW BODY MANAGER ────────────────────────────────────
// [FIX C2] Reference-counted body overflow lock agar scroll
// tidak terkunci permanen saat beberapa layer dibuka/tutup.
let _overflowLockCount = 0;

function lockBodyScroll() {
  _overflowLockCount++;
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  _overflowLockCount = Math.max(0, _overflowLockCount - 1);
  if (_overflowLockCount === 0) document.body.style.overflow = '';
}

// ── PROFILE PHOTO ─────────────────────────────────────────────
function loadProfilePhoto() {
  const username = localStorage.getItem('mfa_username');
  const key = `mfa_photo_${username}`;
  profilePhotoUrl = localStorage.getItem(key) || null;
  updateAvatarUI();
}

function saveProfilePhoto(dataUrl) {
  const username = localStorage.getItem('mfa_username');
  const key = `mfa_photo_${username}`;
  localStorage.setItem(key, dataUrl);
  profilePhotoUrl = dataUrl;
  updateAvatarUI();
}

function deleteProfilePhoto() {
  const username = localStorage.getItem('mfa_username');
  localStorage.removeItem(`mfa_photo_${username}`);
  profilePhotoUrl = null;
  updateAvatarUI();
}

// [REFACTOR F4] Helper agar updateAvatarUI lebih ringkas
function setAvatarEl(imgEl, emojiEl, hasPhoto, src) {
  if (imgEl) { imgEl.src = hasPhoto ? src : ''; imgEl.style.display = hasPhoto ? 'block' : 'none'; }
  if (emojiEl) emojiEl.style.display = hasPhoto ? 'none' : '';
}

function updateAvatarUI() {
  const has = !!profilePhotoUrl;
  const src = profilePhotoUrl || '';
  // Sidebar profile avatar (foto user)
  setAvatarEl(sidebarAvatarImg, sidebarAvatarEmoji, has, src);
  // Profile page avatar
  setAvatarEl(profileAvatarImg, profileAvatarEmoji, has, src);

  const delBtn = document.getElementById('profileDeleteBtn');
  if (delBtn) delBtn.classList.toggle('hidden', !has);

  // Top bar logo button (tetap tampilkan foto jika ada)
  const topLogo = document.getElementById('menuBtn');
  if (topLogo) {
    topLogo.innerHTML = has
      ? `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
      : '🎵';
  }
}

// ── CROP / FIT FOTO ────────────────────────────────────────────
// [FIX P5] Rename variable lokal agar tidak shadow overlay global
let cropState = { img: null, x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false, lastDist: 0 };

function openCropOverlay(file) {
  const cropOverlay = document.getElementById('profileAvatarOverlay'); // [FIX P5] renamed
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

  canvas.ontouchstart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      cropState.dragging = true;
      cropState.startX = e.touches[0].clientX - cropState.x;
      cropState.startY = e.touches[0].clientY - cropState.y;
    } else if (e.touches.length === 2) {
      cropState.lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };
  canvas.ontouchmove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && cropState.dragging) {
      cropState.x = e.touches[0].clientX - cropState.startX;
      cropState.y = e.touches[0].clientY - cropState.startY;
      drawCrop();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / (cropState.lastDist || dist);
      cropState.scale *= ratio;
      cropState.lastDist = dist;
      drawCrop();
    }
  };
  canvas.ontouchend = () => { cropState.dragging = false; };

  canvas.onmousedown = (e) => { cropState.dragging = true; cropState.startX = e.clientX - cropState.x; cropState.startY = e.clientY - cropState.y; };
  canvas.onmousemove = (e) => { if (!cropState.dragging) return; cropState.x = e.clientX - cropState.startX; cropState.y = e.clientY - cropState.startY; drawCrop(); };
  canvas.onmouseup = () => { cropState.dragging = false; };
  canvas.onwheel = (e) => { e.preventDefault(); cropState.scale *= e.deltaY < 0 ? 1.1 : 0.9; drawCrop(); };
}

function drawCrop() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas || !cropState.img) return;
  const ctx = canvas.getContext('2d');
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(cropState.img, cropState.x, cropState.y, cropState.img.width * cropState.scale, cropState.img.height * cropState.scale);
  ctx.restore();
}

function confirmCrop() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas) return;
  const out = document.createElement('canvas');
  out.width = 300; out.height = 300;
  const ctx = out.getContext('2d');
  ctx.beginPath();
  ctx.arc(150, 150, 150, 0, Math.PI * 2);
  ctx.clip();
  const ratio = 300 / canvas.width;
  ctx.drawImage(cropState.img, cropState.x * ratio, cropState.y * ratio, cropState.img.width * cropState.scale * ratio, cropState.img.height * cropState.scale * ratio);
  const dataUrl = out.toDataURL('image/jpeg', 0.85);
  saveProfilePhoto(dataUrl);
  document.getElementById('profileAvatarOverlay').style.display = 'none';
  showToast('Foto profil diperbarui ✔');
}

document.getElementById('cropConfirm')?.addEventListener('click', confirmCrop);
document.getElementById('cropCancel')?.addEventListener('click', () => {
  document.getElementById('profileAvatarOverlay').style.display = 'none';
});

// ── PROFILE PAGE ──────────────────────────────────────────────
function showProfilePage() {
  if (isGuest()) { requireAccount(); return; }
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  refreshProfileFields();
  updateAvatarUI();
  if (profilePage) profilePage.classList.remove('hidden');
}
window.showProfilePage = showProfilePage;

function refreshProfileFields() {
  const username = localStorage.getItem('mfa_username') || '-';
  if (profileUsernameEl) profileUsernameEl.textContent = '@' + username;
  const bio   = localStorage.getItem(`mfa_bio_${username}`) || '';
  const phone = localStorage.getItem(`mfa_phone_${username}`) || '';
  const bioEl   = document.getElementById('profileBio');
  const phoneEl = document.getElementById('profilePhone');
  if (bioEl)   { bioEl.textContent   = bio   || 'Belum ada bio'; bioEl.classList.toggle('muted', !bio); }
  if (phoneEl) { phoneEl.textContent = phone || 'Belum diisi';   phoneEl.classList.toggle('muted', !phone); }
}

if (profileBack) profileBack.onclick = () => profilePage.classList.add('hidden');
if (profileUploadBtn) profileUploadBtn.onclick = () => profilePhotoInput.click();

const profileDeleteBtn = document.getElementById('profileDeleteBtn');
if (profileDeleteBtn) {
  profileDeleteBtn.onclick = () => {
    if (confirm('Hapus foto profil?')) { deleteProfilePhoto(); showToast('Foto profil dihapus'); }
  };
}

if (profilePhotoInput) {
  profilePhotoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    profilePhotoInput.value = '';
    openCropOverlay(file);
  };
}

// ── SHARE PROFIL ──────────────────────────────────────────────
const profileShareBtn = document.getElementById('profileShareBtn');
if (profileShareBtn) {
  profileShareBtn.onclick = () => {
    const username = localStorage.getItem('mfa_username') || 'User';
    const text = `Hei, aku lagi dengerin musik di MusikForAll! Username-ku: @${username} 🎵`;
    if (navigator.share) {
      navigator.share({ title: 'MusikForAll', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => showToast('Link disalin ke clipboard ✔'));
    }
  };
}

// ── EDIT FIELD MODAL ──────────────────────────────────────────
const profileEditModal  = document.getElementById('profileEditModal');
const profileEditInput  = document.getElementById('profileEditInput');
const profileEditTitle  = document.getElementById('profileEditTitle');
const profileEditNote   = document.getElementById('profileEditNote');
const profileEditSave   = document.getElementById('profileEditSave');
const profileEditCancel = document.getElementById('profileEditCancel');
let currentEditField = null;

document.querySelectorAll('.profile-field-edit').forEach(btn => {
  btn.addEventListener('click', () => openEditField(btn.dataset.field));
});

function openEditField(field) {
  currentEditField = field;
  const username = localStorage.getItem('mfa_username') || '';
  const titles = { username: 'Ganti Username', bio: 'Edit Bio', phone: 'Nomor Telepon / Email' };
  const notes  = { username: 'Mengganti username akan memperbarui akun di database.', bio: '', phone: '' };
  const vals   = {
    username,
    bio:   localStorage.getItem(`mfa_bio_${username}`)   || '',
    phone: localStorage.getItem(`mfa_phone_${username}`) || '',
  };
  profileEditTitle.textContent     = titles[field] || 'Edit';
  profileEditInput.value           = vals[field]   || '';
  profileEditInput.placeholder     = titles[field] || '';
  if (notes[field]) { profileEditNote.textContent = notes[field]; profileEditNote.style.display = ''; }
  else profileEditNote.style.display = 'none';
  profileEditModal.classList.remove('hidden');
  setTimeout(() => profileEditInput.focus(), 100);
}

if (profileEditCancel) profileEditCancel.onclick = () => profileEditModal.classList.add('hidden');

if (profileEditSave) {
  profileEditSave.onclick = async () => {
    const val      = profileEditInput.value.trim();
    const username = localStorage.getItem('mfa_username') || '';
    if (!val) return showToast('Tidak boleh kosong');

    if (currentEditField === 'username') {
      // [FIX P4] Gunakan tabel 'profiles' konsisten (bukan 'users')
      const { data: existing } = await db.from('profiles').select('username').eq('username', val).single();
      if (existing && val !== username) return showToast('Username sudah dipakai');
      const { error } = await db.from('profiles').update({ username: val }).eq('username', username);
      if (error) return showToast('Gagal update username');
      localStorage.setItem('mfa_username', val);
      // pindahkan data lokal ke key baru
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

    profileEditModal.classList.add('hidden');
    refreshProfileFields();
  };
}

// ── GANTI SANDI ───────────────────────────────────────────────
// [FIX BUG #2] Gunakan Supabase Auth updateUser, bukan tabel plaintext
const changePasswordModal = document.getElementById('changePasswordModal');
const changePasswordBtn   = document.getElementById('changePasswordBtn');
const cpCancel = document.getElementById('cpCancel');
const cpSave   = document.getElementById('cpSave');

if (changePasswordBtn) changePasswordBtn.onclick = () => changePasswordModal.classList.remove('hidden');
if (cpCancel) cpCancel.onclick = () => changePasswordModal.classList.add('hidden');

if (cpSave) {
  cpSave.onclick = async () => {
    const oldPw = document.getElementById('cpOldPw').value;
    const newPw = document.getElementById('cpNewPw').value;
    const conPw = document.getElementById('cpConfirmPw').value;
    const email = localStorage.getItem('mfa_email') || '';

    if (!oldPw || !newPw || !conPw) return showToast('Isi semua kolom');
    if (newPw.length < 8) return showToast('Sandi baru min. 8 karakter');
    if (newPw !== conPw) return showToast('Konfirmasi sandi tidak cocok');

    showLoader();

    // Verifikasi sandi lama via Supabase Auth (bukan tabel plaintext)
    const { error: signInError } = await db.auth.signInWithPassword({ email, password: oldPw });
    if (signInError) {
      hideLoader();
      return showToast('Sandi lama salah');
    }

    // Update sandi via Supabase Auth
    const { error } = await db.auth.updateUser({ password: newPw });
    hideLoader();

    if (error) return showToast('Gagal ganti sandi');

    changePasswordModal.classList.add('hidden');
    document.getElementById('cpOldPw').value    = '';
    document.getElementById('cpNewPw').value    = '';
    document.getElementById('cpConfirmPw').value = '';
    showToast('Sandi berhasil diperbarui ✔');
  };
}

// [FIX D1] Eye toggle — satu querySelectorAll untuk semua .pw-eye,
// tidak di-register dua kali. Listener di #changePasswordModal
// sudah tercakup di sini karena selector lebih luas.
document.querySelectorAll('.pw-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
});

// ── LOGOUT ───────────────────────────────────────────────────
// [FIX BUG #3] Satu fungsi logout yang memanggil db.auth.signOut()
// dan membersihkan localStorage dengan benar (tidak hapus foto/playlist)
async function performLogout() {
  try { await db.auth.signOut(); } catch (e) { /* abaikan error logout */ }
  // Hapus hanya auth keys, bukan data user seperti foto & playlist
  localStorage.removeItem('mfa_loggedin');
  localStorage.removeItem('mfa_username');
  localStorage.removeItem('mfa_userid');
  localStorage.removeItem('mfa_email');
  localStorage.removeItem('mfa_guest');
  location.reload();
}

function showLogoutConfirm() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  if (logoutModal) logoutModal.classList.remove('hidden');
}
window.showLogoutConfirm = showLogoutConfirm;

if (logoutCancel)     logoutCancel.onclick     = () => logoutModal.classList.add('hidden');
if (logoutConfirmBtn) logoutConfirmBtn.onclick = () => performLogout();

// ── SWIPE FULL PLAYER ─────────────────────────────────────────
//  Layout 3 panel horizontal: [0: Queue] [1: Main] [2: Lyrics]

let currentPanel = 1;

function goToPanel(index, animate = true) {
  currentPanel = Math.max(0, Math.min(2, index));
  if (!fpSwipeContainer) return;
  fpSwipeContainer.style.transition = animate
    ? 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
    : 'none';
  fpSwipeContainer.style.transform = `translateX(calc(-${currentPanel} * 100vw))`;
  if (currentPanel === 0) renderQueuePanel();
  if (currentPanel === 2) renderLyricsPanel();
}

// ── SWIPE GESTURE ────────────────────────────────────────────
let _swipeStartX = 0;
let _swipeStartY = 0;
let _swipeActive = false;

if (fpSwipeContainer) {
  fpSwipeContainer.addEventListener('touchstart', (e) => {
    _swipeStartX = e.touches[0].clientX;
    _swipeStartY = e.touches[0].clientY;
    _swipeActive = false;
  }, { passive: true });

  fpSwipeContainer.addEventListener('touchmove', (e) => {
    const dx = Math.abs(e.touches[0].clientX - _swipeStartX);
    const dy = Math.abs(e.touches[0].clientY - _swipeStartY);
    if (!_swipeActive && (dx > 5 || dy > 5)) {
      _swipeActive = dx > dy;
    }
  }, { passive: true });

  fpSwipeContainer.addEventListener('touchend', (e) => {
    if (!_swipeActive) return;
    const dx = e.changedTouches[0].clientX - _swipeStartX;
    const dy = e.changedTouches[0].clientY - _swipeStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goToPanel(dx < 0 ? currentPanel + 1 : currentPanel - 1);
    }
    _swipeActive = false;
  }, { passive: true });
}

// ── QUEUE PANEL ───────────────────────────────────────────────
function buildShuffledQueue() {
  if (songs.length === 0) return;
  const rest = songs.filter((_, i) => i !== currentIndex);
  shuffledQueue = [songs[currentIndex], ...shuffle(rest)];
}

function renderQueuePanel() {
  if (!fpQueueList) return;
  fpQueueList.innerHTML = '';
  const queue = shuffleMode ? shuffledQueue : songs;
  if (!queue || queue.length === 0) {
    fpQueueList.innerHTML = '<p style="color:#6b6b7a;padding:16px;font-size:13px">Queue kosong</p>';
    return;
  }
  queue.forEach((s, idx) => {
    const realIdx = shuffleMode ? songs.findIndex(gs => gs.id === s.id) : idx;
    const isActive = shuffleMode
      ? (s.id === songs[currentIndex]?.id)
      : (realIdx === currentIndex);
    const item = document.createElement('div');
    item.className = `fp-queue-item${isActive ? ' active' : ''}`;
    item.innerHTML = `
      <img src="${s.cover || ''}" class="fp-queue-cover" onerror="this.style.display='none'">
      <div class="fp-queue-info">
        <div class="fp-queue-title">${s.title}</div>
        <div class="fp-queue-artist">${s.artist}</div>
      </div>
      ${isActive ? '<span class="fp-queue-playing">▶</span>' : ''}
    `;
    item.onclick = () => {
      playSong(realIdx !== -1 ? realIdx : currentIndex);
      goToPanel(1);
    };
    fpQueueList.appendChild(item);
  });
}

// ── LYRICS PANEL ──────────────────────────────────────────────
async function renderLyricsPanel() {
  if (!fpLyricsContent) return;
  if (currentIndex === -1) {
    fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Pilih lagu untuk melihat lirik</p>';
    return;
  }
  const song = songs[currentIndex];
  fpLyricsContent.innerHTML = '<p class="fp-lyrics-loading">⏳ Memuat lirik...</p>';
  try {
    const { data, error } = await db
      .from('lyrics')
      .select('content')
      .eq('song_id', song.id)
      .single();
    if (error || !data?.content) {
      fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Tidak ada lirik tersedia</p>';
    } else {
      const lines = data.content.split('\n')
        .map(l => `<div class="fp-lyric-line">${l || '&nbsp;'}</div>`)
        .join('');
      fpLyricsContent.innerHTML = lines;
    }
  } catch (e) {
    fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Tidak ada lirik tersedia</p>';
  }
}

// ── HISTORY ───────────────────────────────────────────────────
function loadHistory() {
  try { playHistory = JSON.parse(localStorage.getItem('mfa_history') || '[]'); } catch (e) { playHistory = []; }
  try { searchHistory = JSON.parse(localStorage.getItem('mfa_search_history') || '[]'); } catch (e) { searchHistory = []; }
  try { totalSongsPlayed = parseInt(localStorage.getItem('mfa_songs_played') || '0') || 0; } catch (e) { totalSongsPlayed = 0; }
}

function saveHistory() {
  localStorage.setItem('mfa_history', JSON.stringify(playHistory));
}

function addToHistory(song) {
  playHistory = playHistory.filter(s => s.title !== song.title || s.artist !== song.artist);
  playHistory.unshift(song);
  if (playHistory.length > 5) playHistory = playHistory.slice(0, 5);
  saveHistory();
  if (homePage.classList.contains('active')) renderHome();
}

// ── SEARCH HISTORY ────────────────────────────────────────────
function addToSearchHistory(song) {
  searchHistory = searchHistory.filter(s => s.title !== song.title || s.artist !== song.artist);
  searchHistory.unshift(song);
  if (searchHistory.length > 10) searchHistory = searchHistory.slice(0, 10);
  localStorage.setItem('mfa_search_history', JSON.stringify(searchHistory));
}

function renderSearchHistory() {
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
          : `<span class="search-history-icon">🕐</span>`
        }
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

// ── PLAYLISTS ─────────────────────────────────────────────────
function loadPlaylists() {
  try { userPlaylists = JSON.parse(localStorage.getItem('mfa_playlists') || '[]'); } catch (e) { userPlaylists = []; }
}

function savePlaylists() {
  localStorage.setItem('mfa_playlists', JSON.stringify(userPlaylists));
}

function createPlaylist(name) {
  const pl = { id: Date.now().toString(), name, songs: [] };
  userPlaylists.push(pl);
  savePlaylists();
  return pl;
}

// ── ADD TO PLAYLIST MODAL ─────────────────────────────────────
function openAddToPlaylistModal(song) {
  modalTargetSong = song;
  modalSongName.textContent = `${song.title} · ${song.artist}`;
  renderModalPlaylists();
  addToPlaylistModal.classList.remove('hidden');
}

function renderModalPlaylists() {
  modalPlaylistList.innerHTML = '';
  if (userPlaylists.length === 0) {
    modalPlaylistList.innerHTML = '<p style="color:#6b6b7a;font-size:13px;padding:10px 0">Belum ada playlist. Buat dulu di Library.</p>';
    return;
  }
  userPlaylists.forEach(pl => {
    const inList = pl.songs.includes(modalTargetSong?.id);
    const item = document.createElement('div');
    item.className = `modal-playlist-item${inList ? ' in-playlist' : ''}`;
    item.innerHTML = `<span>${inList ? '✔' : '🎵'}</span> ${pl.name} <span style="margin-left:auto;font-size:12px;color:#6b6b7a">${pl.songs.length} lagu</span>`;
    item.onclick = () => {
      if (!modalTargetSong?.id) return;
      if (inList) {
        pl.songs = pl.songs.filter(id => id !== modalTargetSong.id);
        showToast(`Dihapus dari "${pl.name}"`);
      } else {
        if (!pl.songs.includes(modalTargetSong.id)) pl.songs.push(modalTargetSong.id);
        showToast(`Ditambahkan ke "${pl.name}" ✔`);
      }
      savePlaylists();
      renderModalPlaylists();
    };
    modalPlaylistList.appendChild(item);
  });
}

modalClose.onclick = () => {
  addToPlaylistModal.classList.add('hidden');
  modalTargetSong = null;
};

addToPlaylistModal.onclick = (e) => {
  if (e.target === addToPlaylistModal) {
    addToPlaylistModal.classList.add('hidden');
    modalTargetSong = null;
  }
};

// ── AUTH ──────────────────────────────────────────────────────
function showApp() {
  loginPage.classList.add('hidden');
  registerPage.classList.add('hidden');
  app.classList.remove('hidden');

  const user = localStorage.getItem('mfa_username');
  if (user) sidebarUser.textContent = '@' + user;

  loadHistory();
  loadPlaylists();
  loadProfilePhoto();
  loadSongs(); // [NOTE BUG #4] async, dipanggil fire-and-forget secara sengaja agar UI tidak block
}

/* ─── LOGIN ──────────────────────────────────────────────────── */
loginBtn.onclick = async () => {
  const email    = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) return showToast('Isi email dan password');

  showLoader();

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    hideLoader();
    return showToast('Email atau password salah');
  }

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  hideLoader();

  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_userid', data.user.id);
  localStorage.setItem('mfa_email', email);
  localStorage.removeItem('mfa_guest'); // pastikan flag guest dihapus

  if (profile) {
    localStorage.setItem('mfa_username', profile.username);
  }

  showToast('Login berhasil 🎵');
  showApp();
};

/* ─── REGISTER ───────────────────────────────────────────────── */
// [FIX BUG #1] Handle kasus data.user null (email confirmation aktif)
regSubmitBtn.onclick = async () => {
  const username        = regUsernameEl.value.trim();
  const email           = regEmailEl.value.trim();
  const password        = regPasswordEl.value;
  const confirmPassword = regConfirmPasswordEl.value;

  if (!username)              return showToast('Username tidak boleh kosong');
  if (!email)                 return showToast('Email tidak boleh kosong');
  if (password.length < 8)   return showToast('Password minimal 8 karakter');
  if (password !== confirmPassword) return showToast('Konfirmasi password tidak cocok');

  showLoader();

  // Cek username sudah dipakai — handle error .single() dengan benar
  const { data: existing, error: checkError } = await db
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle(); // [FIX P1] maybeSingle() tidak throw jika tidak ada data

  if (checkError) {
    hideLoader();
    return showToast('Gagal memeriksa username');
  }

  if (existing) {
    hideLoader();
    return showToast('Username sudah digunakan');
  }

  // Buat akun di Supabase Auth
  const { data, error } = await db.auth.signUp({ email, password });

  if (error) {
    hideLoader();
    return showToast(error.message);
  }

  // [FIX BUG #1] Cek apakah user null (email confirmation belum dilakukan)
  if (!data.user) {
    hideLoader();
    showToast('Pendaftaran berhasil! Cek email untuk konfirmasi akun 📧');
    // Kembali ke login page agar user bisa login setelah konfirmasi
    registerPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    return;
  }

  // User langsung aktif (email confirmation dimatikan di Supabase)
  const { error: profileError } = await db
    .from('profiles')
    .insert([{ id: data.user.id, username }]);

  if (profileError) {
    hideLoader();
    return showToast('Gagal membuat profil');
  }

  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_username', username);
  localStorage.setItem('mfa_userid', data.user.id);
  localStorage.setItem('mfa_email', email);
  localStorage.removeItem('mfa_guest'); // pastikan flag guest dihapus

  hideLoader();
  showToast('Pendaftaran berhasil! Selamat datang 🎵');
  showApp();
};

/* ─── GUEST MODE ─────────────────────────────────────────────── */
guestBtn.onclick = () => {
  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_username', 'Guest');
  localStorage.setItem('mfa_userid', 'guest');
  localStorage.setItem('mfa_guest', 'true');
  showToast('Masuk sebagai tamu 🎵');
  showApp();
};

/* ─── NAVIGASI LOGIN ↔ REGISTER ──────────────────────────────── */
goRegisterLink.onclick = () => {
  loginPage.classList.add('hidden');
  registerPage.classList.remove('hidden');
  regUsernameEl.value = '';
  regPasswordEl.value = '';
  regConfirmPasswordEl.value = '';
};

goLoginLink.onclick = () => {
  registerPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
};

/* ─── SESSION CHECK SAAT STARTUP ─────────────────────────────── */
// [FIX P9] Verifikasi session Supabase, bukan hanya flag localStorage
(async () => {
  if (localStorage.getItem('mfa_loggedin') === 'true') {
    const isGuestMode = localStorage.getItem('mfa_guest') === 'true';
    if (isGuestMode) {
      showApp();
      return;
    }
    // Cek session aktif
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      showApp();
    } else {
      // Session expired — bersihkan flag dan tampilkan login
      localStorage.removeItem('mfa_loggedin');
      localStorage.removeItem('mfa_userid');
      localStorage.removeItem('mfa_email');
      localStorage.removeItem('mfa_guest');
      hideLoader();
    }
  } else {
    hideLoader();
  }
})();

// ── LOAD SONGS ────────────────────────────────────────────────
async function loadSongs() {
  showLoader();
  albumGrid.innerHTML = '';

  const { data, error } = await db
    .from('songs')
    .select('id, title, artist, cover, audio');

  hideLoader();

  if (error || !data?.length) {
    albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Tidak ada lagu</p>';
    return;
  }

  songs = data;
  recommendedSongs = shuffle(songs).slice(0, 5);
  renderHome();
  renderSearchHistory();
}

// ── RENDER HOME ───────────────────────────────────────────────
function renderHome() {
  albumGrid.innerHTML = '';
  homeListLabel.textContent = 'Rekomendasi';
  if (recommendedSongs.length === 0) {
    albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Belum ada lagu.</p>';
    return;
  }
  renderList(albumGrid, recommendedSongs);
}

// ── RENDER LIST ───────────────────────────────────────────────
// [FIX R4] Hapus parameter 'sourceList' yang tidak dipakai
function renderList(container, list, fromSearch, playlistId) {
  container.innerHTML = '';
  list.forEach((s) => {
    const globalIdx = songs.findIndex(gs => gs.title === s.title && gs.artist === s.artist);
    const item = document.createElement('div');
    item.className = 'song-item';
    if (currentIndex !== -1 && globalIdx === currentIndex) item.classList.add('active-song');

    const extraBtn = playlistId
      ? `<button class="song-remove-btn" title="Hapus dari playlist">🗑</button>`
      : `<button class="song-add-btn" title="Tambah ke Playlist">＋</button>`;

    item.innerHTML = `
      <img class="song-cover" src="${s.cover || ''}">
      <div class="song-info">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      ${extraBtn}
      <button class="song-play-btn">▶</button>
    `;

    item.onclick = (e) => {
      if (e.target.closest('.song-play-btn') || e.target.closest('.song-add-btn') || e.target.closest('.song-remove-btn')) return;
      if (globalIdx !== -1) {
        if (fromSearch) addToSearchHistory(s);
        playSong(globalIdx);
      }
    };
    item.querySelector('.song-play-btn').onclick = (e) => {
      e.stopPropagation();
      if (globalIdx !== -1) {
        if (fromSearch) addToSearchHistory(s);
        playSong(globalIdx);
      }
    };

    if (playlistId) {
      item.querySelector('.song-remove-btn').onclick = (e) => {
        e.stopPropagation();
        const pl = userPlaylists.find(p => p.id === playlistId);
        if (!pl) return;
        pl.songs = pl.songs.filter(id => id !== s.id);
        savePlaylists();
        showToast(`"${s.title}" dihapus dari playlist`);
        renderLibrary();
      };
    } else {
      item.querySelector('.song-add-btn').onclick = (e) => {
        e.stopPropagation();
        openAddToPlaylistModal(s);
      };
    }

    container.appendChild(item);
  });
}

// ── PLAYER CORE ───────────────────────────────────────────────
function playSong(i) {
  if (!songs[i]) return;
  const s = songs[i];
  currentIndex = i;

  audio.src = s.audio;
  audio.play().then(() => {
    isPlaying = true;
    vinylDisc.classList.add('playing');
    fpVinyl.classList.add('playing');
    miniPlayBtn.textContent = '⏸';
    fpPlay.textContent = '⏸';
  }).catch(() => {
    showPlayError();
  });

  heroTitle.textContent  = s.title;
  heroArtist.textContent = s.artist;
  vinylCover.innerHTML   = s.cover ? `<img src="${s.cover}">` : '🎧';

  currentSong.textContent   = s.title;
  currentArtist.textContent = s.artist;
  miniCover.src = s.cover || '';
  miniPlayer.classList.add('visible');

  fpTitle.textContent = s.title;
  fpArtist.textContent = s.artist;
  fpVinylCover.innerHTML = s.cover ? `<img src="${s.cover}">` : '🎧';

  goToPanel(1, false);

  if (shuffleMode) buildShuffledQueue();

  totalSongsPlayed++;
  localStorage.setItem('mfa_songs_played', totalSongsPlayed.toString());

  addToHistory(s);
}

// [FIX BUG #5] Fungsi playNext & playPrev terpisah agar audio.onended
// tidak bergantung pada referensi nextBtn.onclick
function playNext() {
  if (songs.length === 0) return;
  if (shuffleMode && shuffledQueue.length > 0) {
    const curIdx = shuffledQueue.findIndex(s => s.id === songs[currentIndex]?.id);
    const nextShuffled = shuffledQueue[(curIdx + 1) % shuffledQueue.length];
    const realIdx = songs.findIndex(s => s.id === nextShuffled.id);
    if (realIdx !== -1) playSong(realIdx);
  } else {
    playSong((currentIndex + 1) % songs.length);
  }
}

function playPrev() {
  if (songs.length === 0) return;
  if (shuffleMode && shuffledQueue.length > 0) {
    const curIdx = shuffledQueue.findIndex(s => s.id === songs[currentIndex]?.id);
    const prevShuffled = shuffledQueue[(curIdx - 1 + shuffledQueue.length) % shuffledQueue.length];
    const realIdx = songs.findIndex(s => s.id === prevShuffled.id);
    if (realIdx !== -1) playSong(realIdx);
  } else {
    playSong((currentIndex - 1 + songs.length) % songs.length);
  }
}

// ── PLAY ERROR POPUP ──────────────────────────────────────────
function showPlayError() {
  const popup = document.createElement('div');
  popup.className = 'play-error-popup';
  popup.innerHTML = `
    <div class="play-error-icon">⚠️</div>
    <div class="play-error-msg">Lagu tidak dapat diputar.<br>Periksa koneksi internetmu.</div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('show'), 10);
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 400);
  }, 3000);
}

// ── CONTROLS ──────────────────────────────────────────────────
miniPlayBtn.onclick = fpPlay.onclick = () => {
  if (currentIndex === -1) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    miniPlayBtn.textContent = fpPlay.textContent = '▶';
    vinylDisc.classList.remove('playing');
    fpVinyl.classList.remove('playing');
  } else {
    audio.play();
    isPlaying = true;
    miniPlayBtn.textContent = fpPlay.textContent = '⏸';
    vinylDisc.classList.add('playing');
    fpVinyl.classList.add('playing');
  }
};

// [FIX BUG #5] Pakai playNext/playPrev, bukan onclick button
nextBtn.onclick = fpNext.onclick = () => playNext();
prevBtn.onclick = fpPrev.onclick = () => playPrev();
audio.onended = () => playNext();

audio.onerror = () => {
  showPlayError();
  isPlaying = false;
  miniPlayBtn.textContent = '▶';
  fpPlay.textContent = '▶';
  vinylDisc.classList.remove('playing');
  fpVinyl.classList.remove('playing');
};

audio.ontimeupdate = () => {
  if (!audio.duration) return;
  fpProgress.value = (audio.currentTime / audio.duration) * 100;
  fpCurrent.textContent  = formatTime(audio.currentTime);
  fpDuration.textContent = formatTime(audio.duration);
};

fpProgress.oninput = () => { audio.currentTime = (fpProgress.value / 100) * audio.duration; };
fpVolume.oninput   = () => { audio.volume = fpVolume.value; };

// ── FULL PLAYER ───────────────────────────────────────────────
miniPlayer.onclick = e => {
  if (!e.target.closest('button')) {
    fullPlayer.classList.remove('hidden');
    lockBodyScroll(); // [FIX C2]
    goToPanel(1, false);
    renderQueuePanel();
  }
};

fpBack.onclick = () => {
  fullPlayer.classList.add('hidden');
  unlockBodyScroll(); // [FIX C2]
};

// ── NAV ───────────────────────────────────────────────────────
const sidebarPages = ['pengaturan', 'langganan', 'pusataktivitas'];
const allPages     = ['home', 'search', 'library', 'kotakmasuk', ...sidebarPages];

function showPage(p) {
  allPages.forEach(name => {
    const el = document.getElementById(name + 'Page');
    if (el) el.classList.remove('active');
  });
  [homeTab, searchTab, libraryTab, inboxTab].forEach(x => x && x.classList.remove('active'));

  const target = document.getElementById(p + 'Page');
  if (target) target.classList.add('active');

  if (p === 'home')        { homeTab.classList.add('active');    pageTitle.textContent = 'Beranda'; }
  else if (p === 'search') { searchTab.classList.add('active'); pageTitle.textContent = 'Search'; renderSearchHistory(); }
  else if (p === 'library'){ libraryTab.classList.add('active'); pageTitle.textContent = 'Library'; renderLibrary(); }
  else if (p === 'kotakmasuk') { inboxTab.classList.add('active'); pageTitle.textContent = 'Kotak Masuk'; }
  else                     { pageTitle.textContent = 'MusikForAll'; }
}

function showSidebarPage(p) {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  if (p === 'pusataktivitas') updateActivityStats();
  showPage(p);
  // Sync toggle state setiap kali halaman pengaturan dibuka
  if (p === 'pengaturan') {
    const toggle = document.getElementById('themeToggle');
    const label  = document.getElementById('themeLabelText');
    const theme  = ThemeManager.getTheme();
    if (toggle) toggle.checked = (theme === 'light');
    if (label)  label.textContent = (theme === 'light') ? 'Terang' : 'Gelap';
    // Pastikan listener tidak double-bind
    if (toggle && !toggle._themeBound) {
      toggle._themeBound = true;
      toggle.addEventListener('change', () => {
        ThemeManager.applyTheme(toggle.checked ? 'light' : 'dark');
      });
    }
  }
}
window.showSidebarPage = showSidebarPage;

homeTab.onclick    = () => showPage('home');
searchTab.onclick  = () => showPage('search');
libraryTab.onclick = () => showPage('library');
if (inboxTab) inboxTab.onclick = () => showPage('kotakmasuk');

// ── ACTIVITY STATS ────────────────────────────────────────────
function updateActivityStats() {
  const el1 = document.getElementById('statSongsPlayed');
  const el3 = document.getElementById('statPlaylistCount');
  if (el1) el1.textContent = totalSongsPlayed;
  if (el3) el3.textContent = userPlaylists.length;
}

// ── SEARCH ────────────────────────────────────────────────────
searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) {
    searchResults.innerHTML = '';
    searchResultLabel.style.display = 'none';
    renderSearchHistory();
    return;
  }
  searchHistorySection.style.display = 'none';
  searchResultLabel.style.display = '';

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    searchResults.innerHTML = '<p style="color:#6b6b7a;padding:10px">Tidak ada hasil.</p>';
    return;
  }
  renderList(searchResults, filtered, true);
};

// ── DELETE PLAYLIST CONFIRM ───────────────────────────────────
// [FIX P6] Gunakan fungsi bernama agar tidak menumpuk listener
function showDeletePlaylistConfirm(playlistId, playlistName) {
  const modal  = document.getElementById('deletePlaylistModal');
  const nameEl = document.getElementById('deletePlaylistName');
  if (!modal) return;
  if (nameEl) nameEl.textContent = `"${playlistName}"`;
  modal.classList.remove('hidden');

  const cancelBtn  = document.getElementById('deletePlaylistCancel');
  const confirmBtn = document.getElementById('deletePlaylistConfirm');

  // Clone & replace agar tidak ada listener lama menumpuk
  const newCancel  = cancelBtn.cloneNode(true);
  const newConfirm = confirmBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

  newCancel.onclick  = () => modal.classList.add('hidden');
  newConfirm.onclick = () => {
    userPlaylists = userPlaylists.filter(p => p.id !== playlistId);
    savePlaylists();
    modal.classList.add('hidden');
    showToast('Playlist dihapus');
    renderLibrary();
  };
}

// ── CREATE PLAYLIST MODAL ─────────────────────────────────────
function openCreatePlaylistModal() {
  const modal = document.getElementById('createPlaylistModal');
  const input = document.getElementById('createPlaylistInput');
  const cancelBtn  = document.getElementById('createPlaylistCancel');
  const confirmBtn = document.getElementById('createPlaylistConfirm');
  if (!modal || !input) return;

  input.value = '';
  modal.classList.remove('hidden');
  lockBodyScroll();
  setTimeout(() => input.focus(), 120);

  // Clone buttons to avoid listener accumulation
  const newCancel  = cancelBtn.cloneNode(true);
  const newConfirm = confirmBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

  function closeModal() {
    modal.classList.add('hidden');
    unlockBodyScroll();
  }

  newCancel.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  newConfirm.onclick = () => {
    const name = document.getElementById('createPlaylistInput').value.trim();
    if (!name) {
      document.getElementById('createPlaylistInput').focus();
      return;
    }
    createPlaylist(name);
    closeModal();
    showToast(`Playlist "${name}" dibuat ✔`);
    renderLibrary();
  };

  // Submit on Enter key
  input.onkeydown = (e) => {
    if (e.key === 'Enter') newConfirm.onclick();
  };
}

// ── PLAYLIST MODERN — HELPER AUTO COVER ──────────────────────
function buildPlaylistCoverHTML(pl) {
  if (pl.cover) {
    return `<img src="${pl.cover}" alt="${pl.name}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }
  const plSongs = (pl.songs || []).map(sid => songs.find(s => s.id === sid)).filter(Boolean);
  const covers  = plSongs.map(s => s.cover).filter(Boolean).slice(0, 4);

  if (covers.length === 0) {
    return `<div class="pl-cover-single-placeholder">🎵</div>`;
  }
  if (covers.length === 1) {
    return `<img src="${covers[0]}" alt="${pl.name}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }
  // 2-4 covers → quad grid
  const cells = Array.from({ length: 4 }, (_, i) => {
    if (covers[i]) {
      return `<div class="pl-cover-quad-cell"><img src="${covers[i]}" alt="" onerror="this.parentElement.innerHTML='<span class=pl-cover-placeholder>🎵</span>'"></div>`;
    }
    return `<div class="pl-cover-quad-cell"><span class="pl-cover-placeholder">🎵</span></div>`;
  }).join('');
  return `<div class="pl-cover-quad">${cells}</div>`;
}

// ── LIBRARY ───────────────────────────────────────────────────
function renderLibrary() {
  if (!libraryPage) return;
  libraryPage.innerHTML = '';
  const username = localStorage.getItem('mfa_username') || 'kamu';

  // ── Header ──────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'lib-header';

  const avatarEl = document.createElement('div');
  avatarEl.className = 'lib-header-avatar';
  avatarEl.style.cursor = 'pointer';
  avatarEl.onclick = () => showProfilePage && showProfilePage();
  if (profilePhotoUrl) {
    avatarEl.innerHTML = `<img src="${profilePhotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    avatarEl.textContent = '👤';
  }

  const titleEl = document.createElement('div');
  titleEl.className = 'lib-header-title';
  titleEl.textContent = 'Your Library';

  const actionsEl = document.createElement('div');
  actionsEl.className = 'lib-header-actions';

  const addBtn = document.createElement('button');
  addBtn.className = 'lib-icon-btn';
  addBtn.title = 'Buat Playlist Baru';
  addBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  addBtn.onclick = () => {
    if (isGuest()) { requireAccount(); return; }
    openCreatePlaylistModal();
  };

  actionsEl.appendChild(addBtn);
  header.appendChild(avatarEl);
  header.appendChild(titleEl);
  header.appendChild(actionsEl);
  libraryPage.appendChild(header);

  // ── Filter chips ────────────────────────────────────────────
  const chips = document.createElement('div');
  chips.className = 'lib-chips';
  chips.innerHTML = `
    <button class="lib-chip active">Playlists</button>
    <button class="lib-chip">Artists</button>
  `;
  libraryPage.appendChild(chips);

  // ── Empty state ─────────────────────────────────────────────
  if (userPlaylists.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'lib-empty';
    empty.innerHTML = `
      <div class="lib-empty-icon">🎵</div>
      <div class="lib-empty-title">Belum ada playlist</div>
      <div class="lib-empty-desc">Buat playlist pertamamu untuk mulai menikmati musik</div>
      <button class="lib-empty-btn">Buat Playlist</button>
    `;
    empty.querySelector('.lib-empty-btn').onclick = () => {
      if (isGuest()) { requireAccount(); return; }
      openCreatePlaylistModal();
    };
    libraryPage.appendChild(empty);
    return;
  }

  // ── Grid kartu playlist ──────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'pl-grid';

  userPlaylists.forEach(pl => {
    const card = document.createElement('div');
    card.className = 'pl-card';

    const coverEl = document.createElement('div');
    coverEl.className = 'pl-card-cover';
    coverEl.innerHTML = buildPlaylistCoverHTML(pl);

    // Tombol aksi overlay di atas cover
    const actionsOverlay = document.createElement('div');
    actionsOverlay.className = 'pl-card-actions';

    const addSongBtn = document.createElement('button');
    addSongBtn.className = 'pl-card-action-btn';
    addSongBtn.title = 'Tambah lagu';
    addSongBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    addSongBtn.onclick = (e) => { e.stopPropagation(); openPlaylistAddPage(pl.id); };

    const delBtn = document.createElement('button');
    delBtn.className = 'pl-card-action-btn';
    delBtn.title = 'Hapus playlist';
    delBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
    delBtn.onclick = (e) => { e.stopPropagation(); showDeletePlaylistConfirm(pl.id, pl.name); };

    actionsOverlay.appendChild(addSongBtn);
    actionsOverlay.appendChild(delBtn);
    coverEl.appendChild(actionsOverlay);

    const infoEl = document.createElement('div');
    infoEl.className = 'pl-card-info';
    infoEl.innerHTML = `
      <div class="pl-card-name">${pl.name}</div>
      <div class="pl-card-count">${(pl.songs || []).length} lagu</div>
      <div class="pl-card-creator">by @${username}</div>
    `;

    card.appendChild(coverEl);
    card.appendChild(infoEl);
    card.onclick = () => openPlaylistDetail(pl.id);
    grid.appendChild(card);
  });

  libraryPage.appendChild(grid);
}

// ── PLAYLIST DETAIL PAGE ──────────────────────────────────────
let currentOpenPlaylistId = null;

function openPlaylistDetail(playlistId) {
  currentOpenPlaylistId = playlistId;
  renderPlaylistDetailPage();
  const page = document.getElementById('playlistDetailPage');
  if (page) page.classList.remove('hidden');
  lockBodyScroll();
}

function closePlaylistDetail() {
  const page = document.getElementById('playlistDetailPage');
  if (page) page.classList.add('hidden');
  unlockBodyScroll();
  currentOpenPlaylistId = null;
  renderLibrary();
}

function renderPlaylistDetailPage() {
  const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
  if (!pl) return;
  const username = localStorage.getItem('mfa_username') || 'user';
  const plSongs  = (pl.songs || []).map(sid => songs.find(s => s.id === sid)).filter(Boolean);

  const coverEl = document.getElementById('playlistDetailCover');
  if (coverEl) coverEl.innerHTML = buildPlaylistCoverHTML(pl);

  const nameEl = document.getElementById('playlistDetailName');
  if (nameEl) nameEl.textContent = pl.name;

  const metaEl = document.getElementById('playlistDetailMeta');
  if (metaEl) metaEl.textContent = `Playlist • @${username}`;

  const countEl = document.getElementById('playlistDetailCount');
  if (countEl) countEl.textContent = `${plSongs.length} lagu`;

  const songsEl = document.getElementById('playlistDetailSongs');
  if (!songsEl) return;
  songsEl.innerHTML = '';

  if (plSongs.length === 0) {
    songsEl.innerHTML = `<div class="pl-detail-empty">Belum ada lagu di playlist ini.<br>Ketuk <strong>+</strong> untuk menambahkan lagu.</div>`;
    return;
  }

  plSongs.forEach(s => {
    const globalIdx = songs.findIndex(gs => gs.id === s.id);
    const item = document.createElement('div');
    item.className = 'song-item';
    if (currentIndex !== -1 && globalIdx === currentIndex) item.classList.add('active-song');

    item.innerHTML = `
      <img class="song-cover" src="${s.cover || ''}" onerror="this.style.opacity=0">
      <div class="song-info">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      <button class="pl-detail-remove-btn" title="Hapus dari playlist">🗑</button>
      <button class="song-play-btn">▶</button>
    `;

    item.onclick = (e) => {
      if (e.target.closest('.song-play-btn') || e.target.closest('.pl-detail-remove-btn')) return;
      if (globalIdx !== -1) playSong(globalIdx);
    };
    item.querySelector('.song-play-btn').onclick = (e) => {
      e.stopPropagation();
      if (globalIdx !== -1) playSong(globalIdx);
    };
    // BUG FIX: hanya refresh detail page, bukan renderLibrary()
    item.querySelector('.pl-detail-remove-btn').onclick = (e) => {
      e.stopPropagation();
      pl.songs = pl.songs.filter(id => id !== s.id);
      savePlaylists();
      showToast(`"${s.title}" dihapus`);
      renderPlaylistDetailPage();
    };
    songsEl.appendChild(item);
  });
}

document.getElementById('playlistDetailBack')?.addEventListener('click', closePlaylistDetail);

document.getElementById('playlistDetailPlayBtn')?.addEventListener('click', () => {
  const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
  if (!pl || !pl.songs || pl.songs.length === 0) { showToast('Playlist kosong'); return; }
  const firstSong = pl.songs.map(sid => songs.find(s => s.id === sid)).find(Boolean);
  if (!firstSong) return;
  const idx = songs.findIndex(s => s.id === firstSong.id);
  if (idx !== -1) playSong(idx);
  showToast(`▶ Memutar "${pl.name}"`);
});

document.getElementById('playlistDetailShuffleBtn')?.addEventListener('click', () => {
  const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
  if (!pl || !pl.songs || pl.songs.length === 0) { showToast('Playlist kosong'); return; }
  const plSongs = pl.songs.map(sid => songs.find(s => s.id === sid)).filter(Boolean);
  if (plSongs.length === 0) return;
  shuffleMode = true;
  const fpShuffleBtn = document.getElementById('fpShuffle');
  if (fpShuffleBtn) fpShuffleBtn.classList.add('active');
  const randomSong = plSongs[Math.floor(Math.random() * plSongs.length)];
  const idx = songs.findIndex(s => s.id === randomSong.id);
  if (idx !== -1) { playSong(idx); buildShuffledQueue(); }
  showToast('🔀 Shuffle aktif');
});

document.getElementById('playlistDetailEditBtn')?.addEventListener('click', () => {
  openEditPlaylistModal(currentOpenPlaylistId);
});

// ── EDIT PLAYLIST MODAL ───────────────────────────────────────
let editPlaylistTargetId = null;
let editPlaylistNewCover = null;

function openEditPlaylistModal(playlistId) {
  editPlaylistTargetId = playlistId;
  editPlaylistNewCover = null;
  const pl = userPlaylists.find(p => p.id === playlistId);
  if (!pl) return;
  const modal     = document.getElementById('editPlaylistModal');
  const nameInput = document.getElementById('editPlaylistNameInput');
  const preview   = document.getElementById('editPlaylistCoverPreview');
  if (!modal) return;
  if (nameInput) nameInput.value = pl.name;
  if (preview)   preview.innerHTML = pl.cover
    ? `<img src="${pl.cover}" alt="cover">`
    : buildPlaylistCoverHTML(pl);
  modal.classList.remove('hidden');
  lockBodyScroll();
  setTimeout(() => nameInput && nameInput.focus(), 120);
}

function closeEditPlaylistModal() {
  const modal = document.getElementById('editPlaylistModal');
  if (modal) modal.classList.add('hidden');
  unlockBodyScroll();
  editPlaylistTargetId = null;
  editPlaylistNewCover = null;
}

document.getElementById('editPlaylistCoverBtn')?.addEventListener('click', () => {
  document.getElementById('editPlaylistCoverInput')?.click();
});

document.getElementById('editPlaylistCoverInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';
  const reader = new FileReader();
  reader.onload = (ev) => {
    editPlaylistNewCover = ev.target.result;
    const preview = document.getElementById('editPlaylistCoverPreview');
    if (preview) preview.innerHTML = `<img src="${editPlaylistNewCover}" alt="cover">`;
    showToast('Cover baru dipilih ✔');
  };
  reader.readAsDataURL(file);
});

document.getElementById('editPlaylistCancel')?.addEventListener('click', closeEditPlaylistModal);

document.getElementById('editPlaylistModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('editPlaylistModal')) closeEditPlaylistModal();
});

document.getElementById('editPlaylistSave')?.addEventListener('click', () => {
  const pl = userPlaylists.find(p => p.id === editPlaylistTargetId);
  if (!pl) return;
  const nameInput = document.getElementById('editPlaylistNameInput');
  const newName   = nameInput ? nameInput.value.trim() : '';
  if (!newName) { if (nameInput) nameInput.focus(); showToast('Nama tidak boleh kosong'); return; }
  pl.name = newName;
  if (editPlaylistNewCover) pl.cover = editPlaylistNewCover;
  savePlaylists();
  closeEditPlaylistModal();
  showToast(`Playlist "${newName}" diperbarui ✔`);
  if (currentOpenPlaylistId === editPlaylistTargetId) renderPlaylistDetailPage();
});

document.getElementById('editPlaylistNameInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('editPlaylistSave')?.click();
});

// ── SIDEBAR ───────────────────────────────────────────────────
menuBtn.onclick = () => {
  sidebar.classList.add('open');
  overlay.classList.add('show');
};
overlay.onclick = () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
};

fpShuffle.onclick = () => {
  shuffleMode = !shuffleMode;
  fpShuffle.classList.toggle('active');
  if (shuffleMode) buildShuffledQueue();
  showToast(shuffleMode ? '🔀 Shuffle aktif' : 'Shuffle nonaktif');
};

// ── PLAYLIST ADD SONGS PAGE ───────────────────────────────────
let playlistAddTargetId = null;

function openPlaylistAddPage(playlistId) {
  playlistAddTargetId = playlistId;
  const pl      = userPlaylists.find(p => p.id === playlistId);
  const titleEl = document.getElementById('playlistAddTitle');
  if (titleEl && pl) titleEl.textContent = `Tambah ke "${pl.name}"`;
  const page = document.getElementById('playlistAddPage');
  if (page) page.classList.remove('hidden');
  lockBodyScroll(); // [FIX C2]
  const searchEl = document.getElementById('playlistAddSearch');
  if (searchEl) { searchEl.value = ''; searchEl.focus(); }
  renderPlaylistAddResults('');
}

function closePlaylistAddPage() {
  const page = document.getElementById('playlistAddPage');
  if (page) page.classList.add('hidden');
  unlockBodyScroll(); // [FIX C2]
  playlistAddTargetId = null;
  renderLibrary();
}

function renderPlaylistAddResults(query) {
  const container = document.getElementById('playlistAddResults');
  if (!container) return;
  const pl = userPlaylists.find(p => p.id === playlistAddTargetId);
  if (!pl) return;

  const list = query
    ? songs.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query)
      )
    : songs;

  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p style="color:#6b6b7a;padding:16px 20px">Tidak ada hasil.</p>';
    return;
  }

  list.forEach(s => {
    const inPlaylist = pl.songs.includes(s.id);
    const item = document.createElement('div');
    item.style.cssText = `
display:flex;
align-items:center;
gap:12px;
padding:10px 20px;
cursor:default;
width:100%;
box-sizing:border-box;
overflow:hidden;
`;
    item.innerHTML = `
      <img src="${s.cover || ''}" onerror="this.style.display='none'"
        style="width:44px;height:44px;border-radius:10px;object-fit:cover;background:#1c1c26;flex-shrink:0;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.title}</div>
        <div style="font-size:12px;color:#6b6b7a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.artist}</div>
      </div>
      <button class="playlist-add-song-btn ${inPlaylist ? 'added' : ''}">${inPlaylist ? '✔' : '+'}</button>
    `;
    const btn = item.querySelector('.playlist-add-song-btn');
    btn.onclick = () => {
      if (pl.songs.includes(s.id)) {
        pl.songs = pl.songs.filter(id => id !== s.id);
        btn.textContent = '+';
        btn.classList.remove('added');
        showToast(`Dihapus dari "${pl.name}"`);
      } else {
        pl.songs.push(s.id);
        btn.textContent = '✔';
        btn.classList.add('added');
        showToast(`Ditambahkan ke "${pl.name}" ✔`);
      }
      savePlaylists();
    };
    container.appendChild(item);
  });
}

document.getElementById('playlistAddBack')?.addEventListener('click', closePlaylistAddPage);
document.getElementById('playlistAddSearch')?.addEventListener('input', (e) => {
  renderPlaylistAddResults(e.target.value.toLowerCase().trim());
});

// ── HARDWARE BACK BUTTON ──────────────────────────────────────
let backPressedOnce = false;
let backPressTimer  = null;

window.addEventListener('popstate', handleBack);
history.pushState({ page: 'app' }, '');

function handleBack() {
  history.pushState({ page: 'app' }, '');

  // 0. Playlist detail page open
  const playlistDetailPageEl = document.getElementById('playlistDetailPage');
  if (playlistDetailPageEl && !playlistDetailPageEl.classList.contains('hidden')) {
    closePlaylistDetail();
    return;
  }

  // 0b. Edit playlist modal open
  const editModalEl = document.getElementById('editPlaylistModal');
  if (editModalEl && !editModalEl.classList.contains('hidden')) {
    closeEditPlaylistModal();
    return;
  }

  // 1. Full player open
  if (!fullPlayer.classList.contains('hidden')) {
    fullPlayer.classList.add('hidden');
    unlockBodyScroll();
    return;
  }

  // 2. Profile page open
  const profilePageEl = document.getElementById('profilePage');
  if (profilePageEl && !profilePageEl.classList.contains('hidden')) {
    profilePageEl.classList.add('hidden');
    return;
  }

  // 3. Inbox sub pages
  const inboxSubs = ['inboxFriendPage', 'inboxSistemPage', 'inboxAppPage', 'inboxUpdatePage'];
  const openInboxSub = inboxSubs.find(id => {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
  });
  if (openInboxSub) { closeInboxSubPage(openInboxSub); return; }

  // 4. Playlist add page open
  const playlistAddPageEl = document.getElementById('playlistAddPage');
  if (playlistAddPageEl && !playlistAddPageEl.classList.contains('hidden')) {
    closePlaylistAddPage();
    return;
  }

  // 5. Any modal open
  const openModal = document.querySelector('.modal-overlay:not(.hidden)');
  if (openModal) { openModal.classList.add('hidden'); return; }

  // 6. Sidebar open
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    return;
  }

  // 7. Sidebar pages → back to home
  const activeSidebarPage = sidebarPages.find(name => {
    const el = document.getElementById(name + 'Page');
    return el && el.classList.contains('active');
  });
  if (activeSidebarPage) { showPage('home'); return; }

  // [FIX P7] Kotakmasuk juga back to home
  const kotakmasukEl = document.getElementById('kotakmasukPage');
  if (kotakmasukEl && kotakmasukEl.classList.contains('active')) {
    showPage('home');
    return;
  }

  // 8. Search or Library → back to home
  const currentActivePage = ['search', 'library'].find(name => {
    const el = document.getElementById(name + 'Page');
    return el && el.classList.contains('active');
  });
  if (currentActivePage) { showPage('home'); return; }

  // 9. Already on home → confirm exit
  if (backPressedOnce) {
    clearTimeout(backPressTimer);
    history.go(-2);
    return;
  }
  backPressedOnce = true;
  showToast('Tekan sekali lagi untuk keluar');
  backPressTimer = setTimeout(() => { backPressedOnce = false; }, 2000);
}

// ── INBOX SUB PAGES ───────────────────────────────────────────
function openInboxSubPage(pageId) {
  const el = document.getElementById(pageId);
  if (el) el.classList.remove('hidden');
  lockBodyScroll(); // [FIX C2]
}

function closeInboxSubPage(pageId) {
  const el = document.getElementById(pageId);
  if (el) el.classList.add('hidden');
  unlockBodyScroll(); // [FIX C2]
}

document.getElementById('inboxFriendBtn')?.addEventListener('click',  () => openInboxSubPage('inboxFriendPage'));
document.getElementById('inboxSistemBtn')?.addEventListener('click',  () => openInboxSubPage('inboxSistemPage'));
document.getElementById('inboxAppBtn')?.addEventListener('click',     () => openInboxSubPage('inboxAppPage'));
document.getElementById('inboxUpdateBtn')?.addEventListener('click',  () => openInboxSubPage('inboxUpdatePage'));

document.getElementById('inboxFriendBack')?.addEventListener('click', () => closeInboxSubPage('inboxFriendPage'));
document.getElementById('inboxSistemBack')?.addEventListener('click', () => closeInboxSubPage('inboxSistemPage'));
document.getElementById('inboxAppBack')?.addEventListener('click',    () => closeInboxSubPage('inboxAppPage'));
document.getElementById('inboxUpdateBack')?.addEventListener('click', () => closeInboxSubPage('inboxUpdatePage'));

// ── GUEST MODAL ───────────────────────────────────────────────
guestStayBtn.onclick = () => {
  guestModal.classList.add('hidden');
};

// [FIX BUG #6] Sembunyikan app saat guest menekan "Daftar"
guestRegisterBtn.onclick = () => {
  guestModal.classList.add('hidden');
  app.classList.add('hidden');
  localStorage.removeItem('mfa_guest');    // hapus flag guest agar tidak ikut terbawa
  localStorage.removeItem('mfa_loggedin'); // belum login dengan akun asli
  loginPage.classList.add('hidden');
  registerPage.classList.remove('hidden');
};

// ── THEME INIT ────────────────────────────────────────────────
// Inisialisasi tema saat halaman pertama kali dimuat.
// Dipanggil di sini (bukan DOMContentLoaded) karena script diload
// secara defer/sync setelah DOM tersedia.
ThemeManager.init();
