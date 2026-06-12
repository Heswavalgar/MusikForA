/* ============================================================
   playlist.js — Playlist CRUD, Library, Favorites, Add Songs
   MusikForAll
   ============================================================ */

// ── STATE ─────────────────────────────────────────────────────
let songs            = [];
let userPlaylists    = [];
let recommendedSongs = [];
let modalTargetSong  = null;
let totalSongsPlayed = 0;
let currentOpenPlaylistId = null;
let playlistAddTargetId   = null;

const FAVORITES_SYSTEM_ID = 'FAVORITES_SYSTEM';
const favoritedIds  = new Set();
const pendingFavOps = new Map();

// ── PLAYLIST KEY ─────────────────────────────────────────────
function _playlistKey() {
  const uid = localStorage.getItem('mfa_userid') || 'guest';
  return `mfa_playlists_${uid}`;
}

// ── LOAD / SAVE ───────────────────────────────────────────────
function loadPlaylists() {
  try { userPlaylists = JSON.parse(localStorage.getItem(_playlistKey()) || '[]'); } catch { userPlaylists = []; }
}
function savePlaylists() {
  localStorage.setItem(_playlistKey(), JSON.stringify(userPlaylists));
}
function createPlaylist(name) {
  const pl = { id: Date.now().toString(), name, songs: [] };
  userPlaylists.push(pl);
  savePlaylists();
  return pl;
}

// ── LOAD SONGS ────────────────────────────────────────────────
async function loadSongs() {
  showLoader();
  const albumGrid = document.getElementById('albumGrid');
  if (albumGrid) albumGrid.innerHTML = '';
  try {
    const { data, error } = await db.from('songs').select('id, title, artist, cover, audio');
    if (error || !data?.length) {
      if (albumGrid) albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Tidak ada lagu</p>';
      hideLoader();
      return;
    }
    songs = data;
    recommendedSongs = shuffle(songs).slice(0, 5);
    await loadFavorites();
    renderHome();
    renderSearchHistory();
  } catch (e) {
    console.error('loadSongs error:', e);
    if (albumGrid) albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Gagal memuat lagu.</p>';
  } finally {
    hideLoader();
  }
}

// ── FAVORITES ─────────────────────────────────────────────────
async function loadFavorites() {
  if (isGuest()) return;
  const userId = localStorage.getItem('mfa_userid');
  if (!userId) return;
  const { data, error } = await db.from('favorites').select('song_id').eq('user_id', userId);
  if (error) { console.error('loadFavorites error', error); return; }
  favoritedIds.clear();
  (data || []).forEach(row => favoritedIds.add(row.song_id));
}

async function toggleFavorite(songId) {
  if (isGuest()) { requireAccount(); return; }
  const userId = localStorage.getItem('mfa_userid');
  if (!userId || pendingFavOps.has(songId)) return;
  pendingFavOps.set(songId, true);

  const isLiked = favoritedIds.has(songId);
  if (isLiked) { favoritedIds.delete(songId); _updateHeartBtns(songId, false); showToast('💔 Dihapus dari Lagu Favorit'); }
  else          { favoritedIds.add(songId);    _updateHeartBtns(songId, true);  showToast('❤️ Ditambahkan ke Lagu Favorit'); }

  const libraryPage = document.getElementById('libraryPage');
  if (libraryPage?.classList.contains('active')) renderLibrary();

  try {
    if (isLiked) {
      const { error } = await db.from('favorites').delete().eq('user_id', userId).eq('song_id', songId);
      if (error) throw error;
    } else {
      const { error } = await db.from('favorites').upsert([{ user_id: userId, song_id: songId }], { onConflict: 'user_id,song_id', ignoreDuplicates: true });
      if (error) throw error;
    }
  } catch (err) {
    console.error('toggleFavorite sync error', err);
    if (isLiked) { favoritedIds.add(songId); _updateHeartBtns(songId, true); }
    else { favoritedIds.delete(songId); _updateHeartBtns(songId, false); }
    showToast('Gagal menyimpan favorit, coba lagi');
    if (libraryPage?.classList.contains('active')) renderLibrary();
  } finally {
    pendingFavOps.delete(songId);
  }
}

function _updateHeartBtns(songId, liked) {
  document.querySelectorAll(`.heart-btn[data-song-id="${songId}"]`).forEach(btn => {
    btn.classList.toggle('liked', liked);
    btn.setAttribute('aria-label', liked ? 'Hapus dari Favorit' : 'Tambah ke Favorit');
    btn.title = liked ? 'Hapus dari Lagu Favorit' : 'Tambah ke Lagu Favorit';
  });
}

function createHeartBtn(song) {
  const btn = document.createElement('button');
  btn.className = `heart-btn${favoritedIds.has(song.id) ? ' liked' : ''}`;
  btn.dataset.songId = song.id;
  btn.setAttribute('aria-label', favoritedIds.has(song.id) ? 'Hapus dari Favorit' : 'Tambah ke Favorit');
  btn.title = favoritedIds.has(song.id) ? 'Hapus dari Lagu Favorit' : 'Tambah ke Lagu Favorit';
  btn.innerHTML = `
    <svg class="heart-icon heart-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <svg class="heart-icon heart-filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  `;
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(song.id); });
  return btn;
}

function updateFpHeartBtn() {
  if (currentIndex === -1) return;
  const song = songs[currentIndex];
  if (!song) return;
  const existing = document.getElementById('fpHeartBtn');
  if (existing) existing.remove();
  const btn = createHeartBtn(song);
  btn.id = 'fpHeartBtn';
  btn.classList.add('fp-heart-btn');
  const fpActions = document.querySelector('.fp-actions');
  if (fpActions) fpActions.appendChild(btn);
}

function updateMiniHeartBtn() {
  if (currentIndex === -1) return;
  const song = songs[currentIndex];
  if (!song) return;
  const miniPlayer = document.getElementById('miniPlayer');
  const existing = document.getElementById('miniHeartBtn');
  const newBtn = createHeartBtn(song);
  newBtn.id = 'miniHeartBtn';
  newBtn.classList.add('mini-heart-btn');
  if (existing) {
    existing.replaceWith(newBtn);
  } else {
    const miniControls = miniPlayer?.querySelector('.mini-controls');
    if (miniControls) miniPlayer.insertBefore(newBtn, miniControls);
  }
}

// ── RENDER HOME ───────────────────────────────────────────────
function renderHome() {
  updateGuestBanner();
  const albumGrid = document.getElementById('albumGrid');
  const homeListLabel = document.getElementById('homeListLabel');
  if (albumGrid) albumGrid.innerHTML = '';
  if (homeListLabel) homeListLabel.textContent = 'Rekomendasi';
  if (recommendedSongs.length === 0) {
    if (albumGrid) albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Belum ada lagu.</p>';
    return;
  }
  if (albumGrid) renderList(albumGrid, recommendedSongs);
}

// ── RENDER LIST ───────────────────────────────────────────────
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

    const heartBtn = createHeartBtn(s);
    const playBtn = item.querySelector('.song-play-btn');
    item.insertBefore(heartBtn, playBtn);

    item.onclick = (e) => {
      if (e.target.closest('.song-play-btn') || e.target.closest('.song-add-btn') || e.target.closest('.song-remove-btn') || e.target.closest('.heart-btn')) return;
      if (globalIdx !== -1) { if (fromSearch) addToSearchHistory(s); playSong(globalIdx); }
    };
    item.querySelector('.song-play-btn').onclick = (e) => {
      e.stopPropagation();
      if (globalIdx !== -1) { if (fromSearch) addToSearchHistory(s); playSong(globalIdx); }
    };

    if (playlistId) {
      item.querySelector('.song-remove-btn').onclick = (e) => {
        e.stopPropagation();
        if (playlistId === FAVORITES_SYSTEM_ID) { toggleFavorite(s.id); return; }
        const pl = userPlaylists.find(p => p.id === playlistId);
        if (!pl) return;
        pl.songs = pl.songs.filter(id => id !== s.id);
        savePlaylists();
        showToast(`"${s.title}" dihapus dari playlist`);
        renderLibrary();
      };
    } else {
      item.querySelector('.song-add-btn').onclick = (e) => { e.stopPropagation(); openAddToPlaylistModal(s); };
    }

    container.appendChild(item);
  });
}

// ── ADD TO PLAYLIST MODAL ─────────────────────────────────────
function openAddToPlaylistModal(song) {
  modalTargetSong = song;
  document.getElementById('modalSongName').textContent = `${song.title} · ${song.artist}`;
  renderModalPlaylists();
  document.getElementById('addToPlaylistModal').classList.remove('hidden');
}

function renderModalPlaylists() {
  const list = document.getElementById('modalPlaylistList');
  list.innerHTML = '';
  if (userPlaylists.length === 0) {
    list.innerHTML = '<p style="color:#6b6b7a;font-size:13px;padding:10px 0">Belum ada playlist. Buat dulu di Library.</p>';
    return;
  }
  userPlaylists.forEach(pl => {
    const inList = pl.songs.includes(modalTargetSong?.id);
    const item = document.createElement('div');
    item.className = `modal-playlist-item${inList ? ' in-playlist' : ''}`;
    item.innerHTML = `<span>${inList ? '✔' : '🎵'}</span> ${pl.name} <span style="margin-left:auto;font-size:12px;color:#6b6b7a">${pl.songs.length} lagu</span>`;
    item.onclick = () => {
      if (!modalTargetSong?.id) return;
      if (inList) { pl.songs = pl.songs.filter(id => id !== modalTargetSong.id); showToast(`Dihapus dari "${pl.name}"`); }
      else { if (!pl.songs.includes(modalTargetSong.id)) pl.songs.push(modalTargetSong.id); showToast(`Ditambahkan ke "${pl.name}" ✔`); }
      savePlaylists();
      renderModalPlaylists();
    };
    list.appendChild(item);
  });
}

document.getElementById('modalClose')?.addEventListener('click', () => {
  document.getElementById('addToPlaylistModal').classList.add('hidden');
  modalTargetSong = null;
});
document.getElementById('addToPlaylistModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('addToPlaylistModal')) {
    document.getElementById('addToPlaylistModal').classList.add('hidden');
    modalTargetSong = null;
  }
});

// ── LIBRARY ───────────────────────────────────────────────────
function renderLibrary() {
  const libraryPage = document.getElementById('libraryPage');
  if (!libraryPage) return;
  libraryPage.innerHTML = '';
  const username = localStorage.getItem('mfa_username') || 'kamu';

  // Header
  const header = document.createElement('div');
  header.className = 'lib-header';
  const avatarEl = document.createElement('div');
  avatarEl.className = 'lib-header-avatar';
  avatarEl.style.cursor = 'pointer';
  avatarEl.onclick = () => showProfilePage && showProfilePage();
  if (profilePhotoUrl) {
    avatarEl.innerHTML = `<img src="${profilePhotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else { avatarEl.textContent = '👤'; }

  const titleEl = document.createElement('div');
  titleEl.className = 'lib-header-title';
  titleEl.textContent = 'Your Library';

  const actionsEl = document.createElement('div');
  actionsEl.className = 'lib-header-actions';
  const addBtn = document.createElement('button');
  addBtn.className = 'lib-icon-btn';
  addBtn.title = 'Buat Playlist Baru';
  addBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  addBtn.onclick = () => { if (isGuest()) { requireAccount(); return; } openCreatePlaylistModal(); };
  actionsEl.appendChild(addBtn);
  header.appendChild(avatarEl); header.appendChild(titleEl); header.appendChild(actionsEl);
  libraryPage.appendChild(header);

  // Filter chips
  const chips = document.createElement('div');
  chips.className = 'lib-chips';
  chips.innerHTML = `<button class="lib-chip active">Playlists</button><button class="lib-chip">Artists</button>`;
  libraryPage.appendChild(chips);

  // Favorites system card
  if (!isGuest()) {
    const favSection = document.createElement('div');
    favSection.className = 'lib-fav-section';
    favSection.appendChild(_buildFavoriteSystemCard());
    libraryPage.appendChild(favSection);
  }

  // Divider
  if (userPlaylists.length > 0) {
    const divider = document.createElement('div');
    divider.className = 'lib-section-divider';
    divider.innerHTML = `<span class="lib-section-label">Playlists Kamu</span>`;
    libraryPage.appendChild(divider);
  }

  // Grid
  const grid = document.createElement('div');
  grid.className = 'pl-grid';

  userPlaylists.forEach(pl => {
    const card = document.createElement('div');
    card.className = 'pl-card';
    const coverEl = document.createElement('div');
    coverEl.className = 'pl-card-cover';
    coverEl.innerHTML = buildPlaylistCoverHTML(pl);

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

    actionsOverlay.appendChild(addSongBtn); actionsOverlay.appendChild(delBtn);
    coverEl.appendChild(actionsOverlay);

    const infoEl = document.createElement('div');
    infoEl.className = 'pl-card-info';
    infoEl.innerHTML = `
      <div class="pl-card-name">${pl.name}</div>
      <div class="pl-card-count">${(pl.songs||[]).length} lagu</div>
      <div class="pl-card-creator">by @${username}</div>
    `;
    card.appendChild(coverEl); card.appendChild(infoEl);
    card.onclick = () => openPlaylistDetail(pl.id);
    grid.appendChild(card);
  });
  libraryPage.appendChild(grid);

  if (userPlaylists.length === 0 && isGuest()) {
    const empty = document.createElement('div');
    empty.className = 'lib-empty';
    empty.innerHTML = `
      <div class="lib-empty-icon">🎵</div>
      <div class="lib-empty-title">Belum ada playlist</div>
      <div class="lib-empty-desc">Buat playlist pertamamu untuk mulai menikmati musik</div>
      <button class="lib-empty-btn">Buat Playlist</button>
    `;
    empty.querySelector('.lib-empty-btn').onclick = () => { if (isGuest()) { requireAccount(); return; } openCreatePlaylistModal(); };
    libraryPage.appendChild(empty);
  }
}

// ── COVER BUILDERS ────────────────────────────────────────────
function buildPlaylistCoverHTML(pl) {
  if (pl.cover) return `<img src="${pl.cover}" style="width:100%;height:100%;object-fit:cover;">`;
  const plSongs = (pl.songs || []).map(sid => songs.find(s => s.id === sid)).filter(Boolean);
  const covers = plSongs.filter(s => s.cover).map(s => s.cover).slice(0, 4);
  if (covers.length >= 4) {
    return `<div class="pl-cover-quad">${covers.map(c => `<div class="pl-cover-quad-cell"><img src="${c}"></div>`).join('')}</div>`;
  }
  if (covers.length === 1) return `<img src="${covers[0]}" style="width:100%;height:100%;object-fit:cover;">`;
  return `<div class="pl-cover-single-placeholder">🎵</div>`;
}

function buildFavoriteCoverHTML() {
  const likedCovers = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(s => s?.cover).map(s => s.cover).slice(0, 4);
  if (likedCovers.length >= 4) {
    return `<div class="pl-cover-quad">${likedCovers.map(c => `<div class="pl-cover-quad-cell"><img src="${c}"></div>`).join('')}</div>`;
  }
  return '❤️';
}

// ── FAVORITE SYSTEM CARD ──────────────────────────────────────
function _buildFavoriteSystemCard() {
  const likedCount = favoritedIds.size;
  const card = document.createElement('div');
  card.className = 'fav-system-card';
  card.onclick = () => openFavoritesPlaylist();

  const coverEl = document.createElement('div');
  coverEl.className = 'fav-system-cover';
  coverEl.innerHTML = buildFavoriteCoverHTML();

  const infoEl = document.createElement('div');
  infoEl.className = 'fav-system-info';
  infoEl.innerHTML = `
    <div class="fav-system-name">❤️ Lagu Favorit</div>
    <div class="fav-system-meta">Playlist Sistem</div>
    <div class="fav-system-count">${likedCount} lagu</div>
  `;

  const actionsEl = document.createElement('div');
  actionsEl.className = 'fav-system-actions';

  const playBtn = document.createElement('button');
  playBtn.className = 'fav-system-play-btn';
  playBtn.innerHTML = '▶';
  playBtn.title = 'Putar Lagu Favorit';
  playBtn.onclick = (e) => {
    e.stopPropagation();
    const likedSongs = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(Boolean);
    if (!likedSongs.length) { showToast('Belum ada lagu favorit'); return; }
    const idx = songs.findIndex(s => s.id === likedSongs[0].id);
    if (idx !== -1) playSong(idx);
    showToast('▶ Memutar Lagu Favorit');
  };

  const shuffleBtn = document.createElement('button');
  shuffleBtn.className = 'fav-system-shuffle-btn';
  shuffleBtn.innerHTML = '🔀';
  shuffleBtn.title = 'Acak Lagu Favorit';
  shuffleBtn.onclick = (e) => {
    e.stopPropagation();
    const likedSongs = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(Boolean);
    if (!likedSongs.length) { showToast('Belum ada lagu favorit'); return; }
    shuffleMode = true;
    const fpShuffleBtn = document.getElementById('fpShuffle');
    if (fpShuffleBtn) fpShuffleBtn.classList.add('active');
    const randomSong = likedSongs[Math.floor(Math.random() * likedSongs.length)];
    const idx = songs.findIndex(s => s.id === randomSong.id);
    if (idx !== -1) { playSong(idx); buildShuffledQueue(); }
    showToast('🔀 Shuffle Lagu Favorit aktif');
  };

  actionsEl.appendChild(playBtn); actionsEl.appendChild(shuffleBtn);
  card.appendChild(coverEl); card.appendChild(infoEl); card.appendChild(actionsEl);
  return card;
}

// ── PLAYLIST DETAIL ───────────────────────────────────────────
function openPlaylistDetail(playlistId) {
  currentOpenPlaylistId = playlistId;
  renderPlaylistDetailPage();
  const page = document.getElementById('playlistDetailPage');
  if (page) page.classList.remove('hidden');
  lockBodyScroll();
  const editBtn = document.getElementById('playlistDetailEditBtn');
  if (editBtn) editBtn.style.display = '';
  _applyPlaylistDetailGradient(playlistId);
}

function closePlaylistDetail() {
  const page = document.getElementById('playlistDetailPage');
  if (page) page.classList.add('hidden');
  unlockBodyScroll();
  currentOpenPlaylistId = null;
  const gradEl = document.getElementById('playlistDetailGradient');
  if (gradEl) gradEl.remove();
  renderLibrary();
}

async function _applyPlaylistDetailGradient(playlistId) {
  let gradEl = document.getElementById('playlistDetailGradient');
  if (!gradEl) {
    gradEl = document.createElement('div');
    gradEl.id = 'playlistDetailGradient';
    gradEl.className = 'page-gradient-header';
    const body = document.querySelector('.pl-detail-body');
    if (body) body.insertBefore(gradEl, body.firstChild);
  }
  let coverUrl = null;
  if (playlistId === FAVORITES_SYSTEM_ID) {
    const firstFav = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(Boolean)[0];
    coverUrl = firstFav?.cover || null;
  } else {
    const pl = userPlaylists.find(p => p.id === playlistId);
    if (pl?.cover) {
      coverUrl = pl.cover;
    } else {
      const plSongs = (pl?.songs || []).map(sid => songs.find(s => s.id === sid)).filter(Boolean);
      coverUrl = plSongs.find(s => s.cover)?.cover || null;
    }
  }
  if (!coverUrl) return;
  try {
    const colors = await extractColors(coverUrl, playlistId + '_detail');
    gradEl.style.transition = 'background 500ms ease';
    gradEl.style.background = `linear-gradient(180deg, ${rgbToStr(colors.dominant, 0.8)} 0%, ${rgbToStr(colors.dominant, 0.4)} 60%, transparent 100%)`;
  } catch { /* ignore */ }
}

function renderPlaylistDetailPage() {
  if (currentOpenPlaylistId === FAVORITES_SYSTEM_ID) { renderFavoritesDetailPage(); return; }
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
    const heartBtn = createHeartBtn(s);
    item.insertBefore(heartBtn, item.querySelector('.song-play-btn'));
    item.onclick = (e) => { if (e.target.closest('.song-play-btn,.pl-detail-remove-btn,.heart-btn')) return; if (globalIdx !== -1) playSong(globalIdx); };
    item.querySelector('.song-play-btn').onclick = (e) => { e.stopPropagation(); if (globalIdx !== -1) playSong(globalIdx); };
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

function openFavoritesPlaylist() {
  currentOpenPlaylistId = FAVORITES_SYSTEM_ID;
  renderFavoritesDetailPage();
  const page = document.getElementById('playlistDetailPage');
  if (page) page.classList.remove('hidden');
  lockBodyScroll();
}

function renderFavoritesDetailPage() {
  const likedSongs = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(Boolean);
  const coverEl = document.getElementById('playlistDetailCover');
  if (coverEl) coverEl.innerHTML = buildFavoriteCoverHTML();
  const nameEl = document.getElementById('playlistDetailName');
  if (nameEl) nameEl.textContent = '❤️ Lagu Favorit';
  const metaEl = document.getElementById('playlistDetailMeta');
  if (metaEl) metaEl.textContent = 'Playlist Sistem • Otomatis';
  const countEl = document.getElementById('playlistDetailCount');
  if (countEl) countEl.textContent = `${likedSongs.length} lagu`;
  const editBtn = document.getElementById('playlistDetailEditBtn');
  if (editBtn) editBtn.style.display = 'none';

  const songsEl = document.getElementById('playlistDetailSongs');
  if (!songsEl) return;
  songsEl.innerHTML = '';
  if (likedSongs.length === 0) {
    songsEl.innerHTML = `<div class="pl-detail-empty">Belum ada lagu favorit.<br>Ketuk ❤️ di lagu mana saja untuk menambahkan.</div>`;
    return;
  }
  const searchWrap = document.createElement('div');
  searchWrap.className = 'fav-search-wrap';
  searchWrap.innerHTML = `<input type="text" class="search-input" id="favPlaylistSearch" placeholder="Cari di Lagu Favorit...">`;
  songsEl.appendChild(searchWrap);
  const listContainer = document.createElement('div');
  listContainer.id = 'favSongsList';
  songsEl.appendChild(listContainer);
  renderFavSongsList(likedSongs, listContainer);
  document.getElementById('favPlaylistSearch')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = q ? likedSongs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)) : likedSongs;
    renderFavSongsList(filtered, listContainer);
  });
}

function renderFavSongsList(list, container) {
  container.innerHTML = '';
  list.forEach(s => {
    const globalIdx = songs.findIndex(gs => gs.id === s.id);
    const item = document.createElement('div');
    item.className = 'song-item';
    if (currentIndex !== -1 && globalIdx === currentIndex) item.classList.add('active-song');
    item.innerHTML = `
      <img class="song-cover" src="${s.cover || ''}" onerror="this.style.opacity=0">
      <div class="song-info"><div class="song-title">${s.title}</div><div class="song-artist">${s.artist}</div></div>
      <button class="song-play-btn">▶</button>
    `;
    const heartBtn = createHeartBtn(s);
    item.insertBefore(heartBtn, item.querySelector('.song-play-btn'));
    item.onclick = (e) => { if (e.target.closest('.song-play-btn,.heart-btn')) return; if (globalIdx !== -1) playSong(globalIdx); };
    item.querySelector('.song-play-btn').onclick = (e) => { e.stopPropagation(); if (globalIdx !== -1) playSong(globalIdx); };
    container.appendChild(item);
  });
}

// ── PLAYLIST DETAIL EVENTS ────────────────────────────────────
document.getElementById('playlistDetailBack')?.addEventListener('click', closePlaylistDetail);
document.getElementById('playlistDetailPlayBtn')?.addEventListener('click', () => {
  if (!currentOpenPlaylistId) return;
  let plSongs;
  if (currentOpenPlaylistId === FAVORITES_SYSTEM_ID) {
    plSongs = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(Boolean);
  } else {
    const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
    plSongs = (pl?.songs || []).map(sid => songs.find(s => s.id === sid)).filter(Boolean);
  }
  if (!plSongs.length) { showToast('Playlist kosong'); return; }
  const idx = songs.findIndex(s => s.id === plSongs[0].id);
  if (idx !== -1) playSong(idx);
});

document.getElementById('playlistDetailShuffleBtn')?.addEventListener('click', () => {
  if (!currentOpenPlaylistId) return;
  let plSongs;
  if (currentOpenPlaylistId === FAVORITES_SYSTEM_ID) {
    plSongs = [...favoritedIds].map(id => songs.find(s => s.id === id)).filter(Boolean);
  } else {
    const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
    plSongs = (pl?.songs || []).map(sid => songs.find(s => s.id === sid)).filter(Boolean);
  }
  if (!plSongs.length) { showToast('Playlist kosong'); return; }
  shuffleMode = true;
  const fpShuffleBtn = document.getElementById('fpShuffle');
  if (fpShuffleBtn) fpShuffleBtn.classList.add('active');
  const randomSong = plSongs[Math.floor(Math.random() * plSongs.length)];
  const idx = songs.findIndex(s => s.id === randomSong.id);
  if (idx !== -1) { playSong(idx); buildShuffledQueue(); }
  showToast('🔀 Shuffle aktif');
});

document.getElementById('playlistDetailEditBtn')?.addEventListener('click', () => {
  if (!currentOpenPlaylistId || currentOpenPlaylistId === FAVORITES_SYSTEM_ID) return;
  const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
  if (pl) openEditPlaylistModal(pl);
});

// ── CREATE PLAYLIST MODAL ─────────────────────────────────────
function openCreatePlaylistModal() {
  const modal = document.getElementById('createPlaylistModal');
  const input = document.getElementById('createPlaylistInput');
  if (!modal || !input) return;
  input.value = '';
  modal.classList.remove('hidden');
  lockBodyScroll();
  setTimeout(() => input.focus(), 120);

  const cancelBtn  = document.getElementById('createPlaylistCancel');
  const confirmBtn = document.getElementById('createPlaylistConfirm');
  const newCancel  = cancelBtn.cloneNode(true);
  const newConfirm = confirmBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

  function closeModal() { modal.classList.add('hidden'); unlockBodyScroll(); }
  newCancel.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  newConfirm.onclick = () => {
    const name = input.value.trim();
    if (!name) { showToast('Nama playlist tidak boleh kosong'); return; }
    createPlaylist(name);
    closeModal();
    showToast(`Playlist "${name}" dibuat ✔`);
    renderLibrary();
  };
}

// ── DELETE PLAYLIST CONFIRM ───────────────────────────────────
function showDeletePlaylistConfirm(playlistId, playlistName) {
  const modal  = document.getElementById('deletePlaylistModal');
  const nameEl = document.getElementById('deletePlaylistName');
  if (!modal) return;
  if (nameEl) nameEl.textContent = `"${playlistName}"`;
  modal.classList.remove('hidden');

  const cancelBtn  = document.getElementById('deletePlaylistCancel');
  const confirmBtn = document.getElementById('deletePlaylistConfirm');
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

// ── EDIT PLAYLIST MODAL ───────────────────────────────────────
let _editPlaylistCoverFile = null;

function openEditPlaylistModal(pl) {
  const modal  = document.getElementById('editPlaylistModal');
  const nameInput = document.getElementById('editPlaylistNameInput');
  const coverPreview = document.getElementById('editPlaylistCoverPreview');
  if (!modal || !nameInput) return;
  _editPlaylistCoverFile = null;
  nameInput.value = pl.name || '';
  coverPreview.innerHTML = pl.cover ? `<img src="${pl.cover}">` : '🎵';
  modal.classList.remove('hidden');
  lockBodyScroll();
  setTimeout(() => nameInput.focus(), 120);
}

function closeEditPlaylistModal() {
  const modal = document.getElementById('editPlaylistModal');
  if (modal) modal.classList.add('hidden');
  unlockBodyScroll();
}

document.getElementById('editPlaylistCancel')?.addEventListener('click', closeEditPlaylistModal);
document.getElementById('editPlaylistCoverBtn')?.addEventListener('click', () => {
  document.getElementById('editPlaylistCoverInput')?.click();
});
document.getElementById('editPlaylistCoverInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  _editPlaylistCoverFile = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const coverPreview = document.getElementById('editPlaylistCoverPreview');
    if (coverPreview) coverPreview.innerHTML = `<img src="${ev.target.result}">`;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});
document.getElementById('editPlaylistSave')?.addEventListener('click', () => {
  const pl = userPlaylists.find(p => p.id === currentOpenPlaylistId);
  if (!pl) return;
  const name = document.getElementById('editPlaylistNameInput')?.value.trim();
  if (!name) { showToast('Nama tidak boleh kosong'); return; }
  pl.name = name;
  if (_editPlaylistCoverFile) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      pl.cover = ev.target.result;
      savePlaylists();
      closeEditPlaylistModal();
      renderPlaylistDetailPage();
      showToast('Playlist diperbarui ✔');
    };
    reader.readAsDataURL(_editPlaylistCoverFile);
  } else {
    savePlaylists();
    closeEditPlaylistModal();
    renderPlaylistDetailPage();
    showToast('Playlist diperbarui ✔');
  }
});

// ── PLAYLIST ADD PAGE ─────────────────────────────────────────
function openPlaylistAddPage(playlistId) {
  playlistAddTargetId = playlistId;
  const pl = userPlaylists.find(p => p.id === playlistId);
  const titleEl = document.getElementById('playlistAddTitle');
  if (titleEl) titleEl.textContent = `Tambah Lagu ke "${pl?.name || ''}"`;
  const searchEl = document.getElementById('playlistAddSearch');
  if (searchEl) searchEl.value = '';
  renderPlaylistAddResults('');
  const page = document.getElementById('playlistAddPage');
  if (page) page.classList.remove('hidden');
  lockBodyScroll();
}

function closePlaylistAddPage() {
  const page = document.getElementById('playlistAddPage');
  if (page) page.classList.add('hidden');
  unlockBodyScroll();
  playlistAddTargetId = null;
}

function renderPlaylistAddResults(query) {
  const container = document.getElementById('playlistAddResults');
  if (!container) return;
  const pl = userPlaylists.find(p => p.id === playlistAddTargetId);
  if (!pl) return;
  const list = query ? songs.filter(s => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)) : songs;
  container.innerHTML = '';
  if (list.length === 0) { container.innerHTML = '<p style="color:#6b6b7a;padding:16px 20px">Tidak ada hasil.</p>'; return; }
  list.forEach(s => {
    const inPlaylist = pl.songs.includes(s.id);
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 20px;cursor:default;width:100%;box-sizing:border-box;overflow:hidden;';
    item.innerHTML = `
      <img src="${s.cover || ''}" onerror="this.style.display='none'" style="width:44px;height:44px;border-radius:10px;object-fit:cover;background:#1c1c26;flex-shrink:0;">
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
        btn.textContent = '+'; btn.classList.remove('added');
        showToast(`Dihapus dari "${pl.name}"`);
      } else {
        pl.songs.push(s.id);
        btn.textContent = '✔'; btn.classList.add('added');
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
