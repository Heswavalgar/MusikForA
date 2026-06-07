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
const loginPage   = document.getElementById('loginPage');
const registerPage= document.getElementById('registerPage');
const app         = document.getElementById('app');
const usernameEl  = document.getElementById('username');
const passwordEl  = document.getElementById('password');
const loginBtn    = document.getElementById('loginBtn');
const goRegisterLink = document.getElementById('goRegisterLink');
const goLoginLink    = document.getElementById('goLoginLink');

const regUsernameEl      = document.getElementById('regUsername');
const regPasswordEl      = document.getElementById('regPassword');
const regConfirmPasswordEl = document.getElementById('regConfirmPassword');
const regSubmitBtn       = document.getElementById('regSubmitBtn');

const heroTitle  = document.getElementById('heroTitle');
const heroArtist = document.getElementById('heroArtist');
const vinylDisc  = document.getElementById('vinylDisc');
const vinylCover = document.getElementById('vinylCover');
const albumGrid  = document.getElementById('albumGrid');

const audio        = document.getElementById('audio');
const miniPlayBtn  = document.getElementById('miniPlayBtn');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');
const miniCover    = document.getElementById('miniCover');
const currentSong  = document.getElementById('currentSong');
const currentArtist= document.getElementById('currentArtist');
const miniPlayer   = document.getElementById('miniPlayer');

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
const searchInput = document.getElementById('searchPageInput');
const searchResults = document.getElementById('searchResults');
const searchHistorySection = document.getElementById('searchHistorySection');
const searchResultLabel = document.getElementById('searchResultLabel');
const searchHistoryEl = document.getElementById('searchHistory');
const homeListLabel = document.getElementById('homeListLabel');

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
const fpFav        = document.getElementById('fpFav');
const fpShuffle    = document.getElementById('fpShuffle');

const toastEl = document.getElementById('toast');

const addToPlaylistModal = document.getElementById('addToPlaylistModal');
const modalSongName = document.getElementById('modalSongName');
const modalPlaylistList = document.getElementById('modalPlaylistList');
const modalClose = document.getElementById('modalClose');

// NEW DOM REFS
const logoutModal = document.getElementById('logoutModal');
const logoutCancel = document.getElementById('logoutCancel');
const logoutConfirmBtn = document.getElementById('logoutConfirm');
const appLoader = document.getElementById('appLoader');
const profilePage = document.getElementById('profilePage');
const profileBack = document.getElementById('profileBack');
const profileUploadBtn = document.getElementById('profileUploadBtn');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const profileAvatarImg = document.getElementById('profileAvatarImg');
const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
const profileAvatarBig = document.getElementById('profileAvatarBig');
const profileUsernameEl = document.getElementById('profileUsername');
const sidebarLogoAvatar = document.getElementById('sidebarLogoAvatar');
const sidebarLogoImg = document.getElementById('sidebarLogoImg');
const sidebarLogoEmoji = document.getElementById('sidebarLogoEmoji');
const sidebarAvatarImg = document.getElementById('sidebarAvatarImg');
const sidebarAvatarEmoji = document.getElementById('sidebarAvatarEmoji');
const fpSwipeContainer = document.getElementById('fpSwipeContainer');
const fpQueueList = document.getElementById('fpQueueList');
const fpLyricsContent = document.getElementById('fpLyricsContent');

// ── STATE ─────────────────────────────────────────────────────
let songs = [];
let currentIndex = -1;
let isPlaying = false;
let favorites = [];
let playHistory = [];
let userPlaylists = [];
let shuffleMode = false;
let shuffledQueue = []; // queue acak untuk shuffle
let searchHistory = []; // lagu yg diklik saat search
let totalSongsPlayed = 0;
let recommendedSongs = []; // 5 lagu acak
let modalTargetSong = null;
let profilePhotoUrl = null; // base64 foto profil

// ── UTIL ──────────────────────────────────────────────────────
function showToast(msg, duration = 2500) {
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  toastEl.classList.add('visible');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('visible');
    setTimeout(() => toastEl.style.display = 'none', 300);
  }, duration);
}

function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function isFavoriteSong(songId) {
  return favorites.some(f => f.song_id === songId);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── LOADING SPINNER ───────────────────────────────────────────
function showLoader() {
  if (appLoader) appLoader.classList.add('visible');
}
function hideLoader() {
  if (appLoader) {
    appLoader.classList.remove('visible');
    setTimeout(() => appLoader.style.display = 'none', 400);
  }
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

function updateAvatarUI() {
  const hasPhoto = !!profilePhotoUrl;
  // sidebar avatar
  if (sidebarAvatarImg) { sidebarAvatarImg.src = hasPhoto ? profilePhotoUrl : ''; sidebarAvatarImg.style.display = hasPhoto ? 'block' : 'none'; }
  if (sidebarAvatarEmoji) sidebarAvatarEmoji.style.display = hasPhoto ? 'none' : '';
  // logo sidebar
  if (sidebarLogoImg) { sidebarLogoImg.src = hasPhoto ? profilePhotoUrl : ''; sidebarLogoImg.style.display = hasPhoto ? 'block' : 'none'; }
  if (sidebarLogoEmoji) sidebarLogoEmoji.style.display = hasPhoto ? 'none' : '';
  // profile page avatar
  if (profileAvatarImg) { profileAvatarImg.src = hasPhoto ? profilePhotoUrl : ''; profileAvatarImg.style.display = hasPhoto ? 'block' : 'none'; }
  if (profileAvatarEmoji) profileAvatarEmoji.style.display = hasPhoto ? 'none' : '';
  // delete btn
  const delBtn = document.getElementById('profileDeleteBtn');
  if (delBtn) delBtn.classList.toggle('hidden', !hasPhoto);
  // top bar menu btn
  const topLogo = document.getElementById('menuBtn');
  if (topLogo) {
    if (hasPhoto) {
      topLogo.innerHTML = `<img src="${profilePhotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
    } else {
      topLogo.textContent = '🎵';
    }
  }
}

// ── CROP / FIT FOTO ────────────────────────────────────────────
let cropState = { img: null, x: 0, y: 0, scale: 1, startX: 0, startY: 0, dragging: false, lastDist: 0 };

function openCropOverlay(file) {
  const overlay = document.getElementById('profileAvatarOverlay');
  const canvas = document.getElementById('cropCanvas');
  if (!overlay || !canvas) return;

  const size = Math.min(window.innerWidth - 48, 280);
  canvas.width = size; canvas.height = size;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      cropState.img = img;
      // scale agar gambar memenuhi canvas
      const scale = Math.max(size / img.width, size / img.height);
      cropState.scale = scale;
      cropState.x = (size - img.width * scale) / 2;
      cropState.y = (size - img.height * scale) / 2;
      drawCrop();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);

  overlay.style.display = 'flex';

  // Touch events
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

  // Mouse (desktop)
  canvas.onmousedown = (e) => { cropState.dragging = true; cropState.startX = e.clientX - cropState.x; cropState.startY = e.clientY - cropState.y; };
  canvas.onmousemove = (e) => { if (!cropState.dragging) return; cropState.x = e.clientX - cropState.startX; cropState.y = e.clientY - cropState.startY; drawCrop(); };
  canvas.onmouseup = () => cropState.dragging = false;
  canvas.onwheel = (e) => { e.preventDefault(); cropState.scale *= e.deltaY < 0 ? 1.1 : 0.9; drawCrop(); };
}

function drawCrop() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas || !cropState.img) return;
  const ctx = canvas.getContext('2d');
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  // clip circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(s/2, s/2, s/2, 0, Math.PI*2);
  ctx.clip();
  ctx.drawImage(cropState.img, cropState.x, cropState.y, cropState.img.width * cropState.scale, cropState.img.height * cropState.scale);
  ctx.restore();
}

function confirmCrop() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas) return;
  // output 300x300
  const out = document.createElement('canvas');
  out.width = 300; out.height = 300;
  const ctx = out.getContext('2d');
  ctx.beginPath();
  ctx.arc(150, 150, 150, 0, Math.PI*2);
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
  const bio = localStorage.getItem(`mfa_bio_${username}`) || '';
  const phone = localStorage.getItem(`mfa_phone_${username}`) || '';
  const el = document.getElementById('profileBio');
  const el2 = document.getElementById('profilePhone');
  if (el) { el.textContent = bio || 'Belum ada bio'; el.classList.toggle('muted', !bio); }
  if (el2) { el2.textContent = phone || 'Belum diisi'; el2.classList.toggle('muted', !phone); }
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
const profileEditModal = document.getElementById('profileEditModal');
const profileEditInput = document.getElementById('profileEditInput');
const profileEditTitle = document.getElementById('profileEditTitle');
const profileEditNote  = document.getElementById('profileEditNote');
const profileEditSave  = document.getElementById('profileEditSave');
const profileEditCancel= document.getElementById('profileEditCancel');
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
    bio: localStorage.getItem(`mfa_bio_${username}`) || '',
    phone: localStorage.getItem(`mfa_phone_${username}`) || '',
  };
  profileEditTitle.textContent = titles[field] || 'Edit';
  profileEditInput.value = vals[field] || '';
  profileEditInput.placeholder = titles[field] || '';
  if (notes[field]) { profileEditNote.textContent = notes[field]; profileEditNote.style.display = ''; }
  else profileEditNote.style.display = 'none';
  profileEditModal.classList.remove('hidden');
  setTimeout(() => profileEditInput.focus(), 100);
}

if (profileEditCancel) profileEditCancel.onclick = () => profileEditModal.classList.add('hidden');

if (profileEditSave) {
  profileEditSave.onclick = async () => {
    const val = profileEditInput.value.trim();
    const username = localStorage.getItem('mfa_username') || '';
    if (!val) return showToast('Tidak boleh kosong');
    if (currentEditField === 'username') {
      // cek di DB
      const { data: existing } = await db.from('users').select('username').eq('username', val).single();
      if (existing && val !== username) return showToast('Username sudah dipakai');
      const { error } = await db.from('users').update({ username: val }).eq('username', username);
      if (error) return showToast('Gagal update username');
      // update DB favorites & dll juga pakai username lama — perlu update localStorage
      localStorage.setItem('mfa_username', val);
      // pindahkan photo & bio ke key baru
      const photo = localStorage.getItem(`mfa_photo_${username}`);
      const bio   = localStorage.getItem(`mfa_bio_${username}`);
      const phone = localStorage.getItem(`mfa_phone_${username}`);
      if (photo)  { localStorage.setItem(`mfa_photo_${val}`, photo);  localStorage.removeItem(`mfa_photo_${username}`); }
      if (bio)    { localStorage.setItem(`mfa_bio_${val}`, bio);      localStorage.removeItem(`mfa_bio_${username}`); }
      if (phone)  { localStorage.setItem(`mfa_phone_${val}`, phone);  localStorage.removeItem(`mfa_phone_${username}`); }
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
    const username = localStorage.getItem('mfa_username');
    if (!oldPw || !newPw || !conPw) return showToast('Isi semua kolom');
    if (newPw.length < 8) return showToast('Sandi baru min. 8 karakter');
    if (newPw !== conPw) return showToast('Konfirmasi sandi tidak cocok');
    // cek sandi lama
    const { data } = await db.from('users').select('password').eq('username', username).single();
    if (!data || data.password !== oldPw) return showToast('Sandi lama salah');
    const { error } = await db.from('users').update({ password: newPw }).eq('username', username);
    if (error) return showToast('Gagal ganti sandi');
    changePasswordModal.classList.add('hidden');
    document.getElementById('cpOldPw').value = '';
    document.getElementById('cpNewPw').value = '';
    document.getElementById('cpConfirmPw').value = '';
    showToast('Sandi berhasil diperbarui ✔');
  };
}

// Eye toggle untuk modal ganti sandi
document.querySelectorAll('#changePasswordModal .pw-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
});

// ── LOGOUT CONFIRM ────────────────────────────────────────────
function showLogoutConfirm() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  if (logoutModal) logoutModal.classList.remove('hidden');
}
window.showLogoutConfirm = showLogoutConfirm;

if (logoutCancel) logoutCancel.onclick = () => logoutModal.classList.add('hidden');
if (logoutConfirmBtn) logoutConfirmBtn.onclick = () => {
  localStorage.removeItem('mfa_loggedin');
  localStorage.removeItem('mfa_username');
  location.reload();
};

// ── SWIPE FULL PLAYER ─────────────────────────────────────────
let swipeStartX = 0;
let swipeStartY = 0;
let currentPanel = 1; // 0=queue, 1=main, 2=lyrics

function setFpPanel(idx, animate = true) {
  currentPanel = Math.max(0, Math.min(2, idx));
  if (!fpSwipeContainer) return;
  if (!animate) {
    // Disable transition first, then set transform in next frame to avoid flash
    fpSwipeContainer.style.transition = 'none';
    requestAnimationFrame(() => {
      fpSwipeContainer.style.transform = `translateX(calc(-${currentPanel} * 100vw))`;
    });
  } else {
    fpSwipeContainer.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
    fpSwipeContainer.style.transform = `translateX(calc(-${currentPanel} * 100vw))`;
  }
  if (currentPanel === 0) renderQueuePanel();
  if (currentPanel === 2) renderLyricsPanel();
}

if (fpSwipeContainer) {
  fpSwipeContainer.addEventListener('touchstart', (e) => {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });

  fpSwipeContainer.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) setFpPanel(currentPanel + 1);
      else setFpPanel(currentPanel - 1);
    }
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
    const realIdx = shuffleMode ? idx : songs.findIndex(gs => gs.id === s.id);
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
      setFpPanel(1);
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
      const lines = data.content.split('\n').map(l => `<div class="fp-lyric-line">${l || '&nbsp;'}</div>`).join('');
      fpLyricsContent.innerHTML = lines;
    }
  } catch(e) {
    fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Tidak ada lirik tersedia</p>';
  }
}

// ── SEARCH HISTORY RENDER with cover ──────────────────────────

function loadHistory() {
  const saved = localStorage.getItem('mfa_history');
  if (saved) {
    try { playHistory = JSON.parse(saved); } catch(e) { playHistory = []; }
  }
  const saved2 = localStorage.getItem('mfa_search_history');
  if (saved2) {
    try { searchHistory = JSON.parse(saved2); } catch(e) { searchHistory = []; }
  }
  const saved3 = localStorage.getItem('mfa_songs_played');
  if (saved3) {
    try { totalSongsPlayed = parseInt(saved3) || 0; } catch(e) { totalSongsPlayed = 0; }
  }
}

function saveHistory() {
  localStorage.setItem('mfa_history', JSON.stringify(playHistory));
}

function addToHistory(song) {
  playHistory = playHistory.filter(s => s.title !== song.title || s.artist !== song.artist);
  playHistory.unshift(song);
  if (playHistory.length > 5) playHistory = playHistory.slice(0, 5);
  saveHistory();
  // update home only if home is active
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
      item.onclick = () => {
        if (globalIdx !== -1) playSong(globalIdx);
      };
      searchHistoryEl.appendChild(item);
    });
  } else {
    searchHistorySection.style.display = 'none';
  }
}

// ── PLAYLISTS ─────────────────────────────────────────────────
function loadPlaylists() {
  const saved = localStorage.getItem('mfa_playlists');
  if (saved) {
    try { userPlaylists = JSON.parse(saved); } catch(e) { userPlaylists = []; }
  }
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
      if (!modalTargetSong || !modalTargetSong.id) return;
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
  loadSongs();
}

/*Login*/
if (!data) return showToast('Username atau password salah');

localStorage.setItem('mfa_loggedin', 'true');
localStorage.setItem('mfa_username', data.username);
localStorage.setItem('mfa_userid', data.id);

showToast('Login berhasil 🎵');
showApp();

// Navigasi ke halaman daftar
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

// Daftar
regSubmitBtn.onclick = async () => {
  const u = regUsernameEl.value.trim();
  const p = regPasswordEl.value;
  const cp = regConfirmPasswordEl.value;

  if (!u) return showToast('Username tidak boleh kosong');
  if (p.length < 8) return showToast('Password minimal 8 karakter');
  if (p !== cp) return showToast('Konfirmasi password tidak cocok');

  // cek username sudah ada
  const { data: existing } = await db
    .from('users')
    .select('username')
    .eq('username', u)
    .single();

  if (existing) return showToast('Username sudah digunakan');

  const { error } = await db.from('users').insert([{ username: u, password: p }]);
  if (error) return showToast('Gagal mendaftar, coba lagi');

  // langsung login dan masuk ke beranda
  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_username', u);
  showToast('Pendaftaran berhasil! Selamat datang 🎵');
  showApp();
};

window.logout = () => {
  localStorage.clear();
  location.reload();
};

// ── EYE TOGGLE PASSWORD ───────────────────────────────────────
document.querySelectorAll('.pw-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
});

if (localStorage.getItem('mfa_loggedin') === 'true') showApp();
else hideLoader(); // hide loader on login page too

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

  // load favorites
  const username = localStorage.getItem('mfa_username');
  if (username) {
    const { data: favData } = await db
      .from('favorites')
      .select('song_id')
      .eq('username', username);
    favorites = favData || [];
  }

  // buat 5 rekomendasi acak
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
  renderList(albumGrid, recommendedSongs, songs);
}

// ── RENDER LIST ───────────────────────────────────────────────
function renderList(container, list, sourceList, fromSearch) {
  container.innerHTML = '';
  list.forEach((s) => {
    const globalIdx = songs.findIndex(gs => gs.title === s.title && gs.artist === s.artist);
    const item = document.createElement('div');
    item.className = 'song-item';
    if (currentIndex !== -1 && globalIdx === currentIndex) item.classList.add('active-song');
    item.innerHTML = `
      <img class="song-cover" src="${s.cover || ''}">
      <div class="song-info">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      <button class="song-fav-btn ${isFavoriteSong(s.id) ? 'active' : ''}" data-id="${s.id}" title="Favorit">♥</button>
      <button class="song-add-btn" title="Tambah ke Playlist">＋</button>
      <button class="song-play-btn">▶</button>
    `;

    item.onclick = (e) => {
      if (e.target.closest('.song-fav-btn') || e.target.closest('.song-play-btn') || e.target.closest('.song-add-btn')) return;
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
    item.querySelector('.song-fav-btn').onclick = async (e) => {
      e.stopPropagation();
      await toggleFavoriteSong(s, item.querySelector('.song-fav-btn'));
    };
    item.querySelector('.song-add-btn').onclick = (e) => {
      e.stopPropagation();
      openAddToPlaylistModal(s);
    };

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

  heroTitle.textContent = s.title;
  heroArtist.textContent = s.artist;
  vinylCover.innerHTML = s.cover ? `<img src="${s.cover}">` : '🎧';

  currentSong.textContent = s.title;
  currentArtist.textContent = s.artist;
  miniCover.src = s.cover || '';
  miniPlayer.classList.add('visible');

  fpTitle.textContent = s.title;
  fpArtist.textContent = s.artist;
  fpVinylCover.innerHTML = s.cover ? `<img src="${s.cover}">` : '🎧';

  if (isFavoriteSong(s.id)) {
    fpFav.classList.add('active');
  } else {
    fpFav.classList.remove('active');
  }

  // Reset panel ke tengah
  setFpPanel(1, false);

  // Rebuild shuffle queue saat lagu baru
  if (shuffleMode) buildShuffledQueue();

  // statistik
  totalSongsPlayed++;
  localStorage.setItem('mfa_songs_played', totalSongsPlayed.toString());

  addToHistory(s);
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


nextBtn.onclick = fpNext.onclick = () => {
  if (shuffleMode && shuffledQueue.length > 0) {
    const curIdx = shuffledQueue.findIndex(s => s.id === songs[currentIndex]?.id);
    const nextShuffled = shuffledQueue[(curIdx + 1) % shuffledQueue.length];
    const realIdx = songs.findIndex(s => s.id === nextShuffled.id);
    if (realIdx !== -1) playSong(realIdx);
  } else {
    playSong((currentIndex + 1) % songs.length);
  }
};

prevBtn.onclick = fpPrev.onclick = () => {
  if (shuffleMode && shuffledQueue.length > 0) {
    const curIdx = shuffledQueue.findIndex(s => s.id === songs[currentIndex]?.id);
    const prevShuffled = shuffledQueue[(curIdx - 1 + shuffledQueue.length) % shuffledQueue.length];
    const realIdx = songs.findIndex(s => s.id === prevShuffled.id);
    if (realIdx !== -1) playSong(realIdx);
  } else {
    playSong((currentIndex - 1 + songs.length) % songs.length);
  }
};

audio.onended = () => nextBtn.onclick();

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
  fpCurrent.textContent = formatTime(audio.currentTime);
  fpDuration.textContent = formatTime(audio.duration);
};

fpProgress.oninput = () =>
  audio.currentTime = (fpProgress.value / 100) * audio.duration;

fpVolume.oninput = () => audio.volume = fpVolume.value;

// ── FULL PLAYER ───────────────────────────────────────────────
miniPlayer.onclick = e => {
  if (!e.target.closest('button')) {
    fullPlayer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setFpPanel(1, false); // center panel (piringan), no animation
    renderQueuePanel();   // pre-render queue so it's ready
  }
};

fpBack.onclick = () => {
  fullPlayer.classList.add('hidden');
  document.body.style.overflow = '';
};

// ── FAVORITE ─────────────────────────────────────────────────
async function toggleFavoriteCurrentSong() {
  if (currentIndex === -1) return;
  const song = songs[currentIndex];
  await toggleFavoriteSong(song, fpFav);
}

async function toggleFavoriteSong(song, btnEl) {
  const username = localStorage.getItem('mfa_username');
  if (!song || !song.id) return;

  const exist = favorites.find(f => f.song_id === song.id);

  if (exist) {
    const { data, error } = await db
  .from('favorites')
  .insert([{ username, song_id: song.id }]);

console.log('INSERT FAVORITE');
console.log('username:', username);
console.log('song_id:', song.id);
console.log('data:', data);
console.log('error:', error);

    if (!error) {
      favorites = favorites.filter(f => f.song_id !== song.id);
      if (btnEl) btnEl.classList.remove('active');
      if (songs[currentIndex]?.id === song.id) fpFav.classList.remove('active');
      showToast('Dihapus dari favorit');
      renderLibrary();
    }
  } else {
    const { error } = await db
      .from('favorites')
      .insert([{ username, song_id: song.id }]);

    if (!error) {
      favorites.push({ song_id: song.id });
      if (btnEl) btnEl.classList.add('active');
      if (songs[currentIndex]?.id === song.id) fpFav.classList.add('active');
      showToast('Ditambahkan ke favorit ♥');
      renderLibrary();
    }
  }
}

fpFav.onclick = (e) => {
  e.stopPropagation();
  toggleFavoriteCurrentSong();
};

// ── NAV ───────────────────────────────────────────────────────
const sidebarPages = ['pengaturan','kotakmasuk','langganan','pusataktivitas'];
const allPages = ['home','search','library', ...sidebarPages];

function showPage(p) {
  allPages.forEach(name => {
    const el = document.getElementById(name + 'Page');
    if (el) el.classList.remove('active');
  });
  [homeTab, searchTab, libraryTab].forEach(x => x.classList.remove('active'));

  const target = document.getElementById(p + 'Page');
  if (target) target.classList.add('active');

  if (p === 'home') { homeTab.classList.add('active'); pageTitle.textContent = 'Beranda'; }
  else if (p === 'search') { searchTab.classList.add('active'); pageTitle.textContent = 'Search'; renderSearchHistory(); }
  else if (p === 'library') { libraryTab.classList.add('active'); pageTitle.textContent = 'Library'; renderLibrary(); }
  else {
  pageTitle.textContent = 'MusikForAll';
}
}

function showSidebarPage(p) {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');

  if (p === 'pusataktivitas') updateActivityStats();

  showPage(p);
}

window.showSidebarPage = showSidebarPage;

homeTab.onclick = () => showPage('home');
searchTab.onclick = () => showPage('search');
libraryTab.onclick = () => showPage('library');

// ── ACTIVITY STATS ────────────────────────────────────────────
function updateActivityStats() {
  const el1 = document.getElementById('statSongsPlayed');
  const el2 = document.getElementById('statFavCount');
  const el3 = document.getElementById('statPlaylistCount');
  if (el1) el1.textContent = totalSongsPlayed;
  if (el2) el2.textContent = favorites.length;
  if (el3) el3.textContent = userPlaylists.length;
}

// ── SEARCH (filter berisi kata kunci di mana saja) ────────────
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
  renderList(searchResults, filtered, songs, true);
};

// ── LIBRARY ───────────────────────────────────────────────────
function renderLibrary() {
  libraryPage.innerHTML = '';

  // === FAVORIT ===
  const favSongs = songs.filter(s => isFavoriteSong(s.id));

  const favSection = document.createElement('div');
  favSection.className = 'library-section';
  favSection.innerHTML = `
    <div class="library-playlist-header" id="favPlaylistHeader">
      <span class="library-playlist-icon">♥</span>
      <span class="library-playlist-name">Favorit</span>
      <span class="library-playlist-count">${favSongs.length} lagu</span>
      <span class="library-chevron">▾</span>
    </div>
    <div class="library-playlist-songs" id="favPlaylistSongs" style="display:none"></div>
  `;
  libraryPage.appendChild(favSection);

  const favContainer = favSection.querySelector('#favPlaylistSongs');
  if (favSongs.length === 0) {
    favContainer.innerHTML = '<p style="color:#6b6b7a;padding:10px 16px;font-size:13px">Belum ada lagu favorit.</p>';
  } else {
    renderList(favContainer, favSongs, songs);
  }

  favSection.querySelector('#favPlaylistHeader').onclick = () => {
    const open = favContainer.style.display !== 'none';
    favContainer.style.display = open ? 'none' : 'block';
    favSection.querySelector('.library-chevron').textContent = open ? '▾' : '▴';
  };

  // === USER PLAYLISTS ===
  userPlaylists.forEach(pl => {
    const sec = document.createElement('div');
    sec.className = 'library-section';
    const plSongs = pl.songs.map(sid => songs.find(s => s.id === sid)).filter(Boolean);
    sec.innerHTML = `
      <div class="library-playlist-header">
        <span class="library-playlist-icon">🎵</span>
        <span class="library-playlist-name">${pl.name}</span>
        <span class="library-playlist-count">${plSongs.length} lagu</span>
        <button class="library-playlist-del" data-id="${pl.id}" title="Hapus Ruang">✕</button>
        <span class="library-chevron">▾</span>
      </div>
      <div class="library-playlist-songs" style="display:none"></div>
    `;
    libraryPage.appendChild(sec);

    const container = sec.querySelector('.library-playlist-songs');
    if (plSongs.length === 0) {
      container.innerHTML = '<p style="color:#6b6b7a;padding:10px 16px;font-size:13px">Belum ada lagu.</p>';
    } else {
      renderList(container, plSongs, songs);
    }

    sec.querySelector('.library-playlist-header').onclick = (e) => {
      if (e.target.closest('.library-playlist-del')) return;
      const open = container.style.display !== 'none';
      container.style.display = open ? 'none' : 'block';
      sec.querySelector('.library-chevron').textContent = open ? '▾' : '▴';
    };

    sec.querySelector('.library-playlist-del').onclick = (e) => {
      e.stopPropagation();
      userPlaylists = userPlaylists.filter(p => p.id !== pl.id);
      savePlaylists();
      renderLibrary();
    };
  });

  // === TAMBAH PLAYLIST ===
  const addBtn = document.createElement('div');
  addBtn.className = 'library-add-btn';
  addBtn.innerHTML = `<span>＋</span> Buat Ruang Baru`;
  addBtn.onclick = () => {
    const name = prompt('Nama ruang baru:');
    if (!name || !name.trim()) return;
    createPlaylist(name.trim());
    renderLibrary();
  };
  libraryPage.appendChild(addBtn);
}

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