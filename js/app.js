/* ============================================================
   MusikForAll — app.js (FIXED)
   ============================================================ */

// ── SUPABASE ─────────────────────────────────────────────────
const { createClient } = window.supabase;
const db = createClient(
  'https://ddhuzpbhozmpsgkuduxl.supabase.co',
  'sb_publishable_iykqhLN18ql_aolcNcioQQ_y07ixpqL'
);

// ── DOM ───────────────────────────────────────────────────────
const loginPage   = document.getElementById('loginPage');
const app         = document.getElementById('app');
const usernameEl  = document.getElementById('username');
const passwordEl  = document.getElementById('password');
const loginBtn    = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

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

const toastEl = document.getElementById('toast');

const fpShuffle = document.getElementById('fpShuffle');

// ── STATE ─────────────────────────────────────────────────────
let songs = [];
let currentIndex = -1;
let isPlaying = false;
let favorites = []; // { song_id }
let playHistory = []; // array of song objects (max 5, latest first)
let userPlaylists = []; // { id, name, songs: [] }
let shuffleMode = false;

// ── UTIL ──────────────────────────────────────────────────────
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  setTimeout(() => toastEl.style.display = 'none', 2500);
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

// ── HISTORY ───────────────────────────────────────────────────
function loadHistory() {
  const saved = localStorage.getItem('mfa_history');
  if (saved) {
    try { playHistory = JSON.parse(saved); } catch(e) { playHistory = []; }
  }
}

function saveHistory() {
  localStorage.setItem('mfa_history', JSON.stringify(playHistory));
}

function addToHistory(song) {
  // remove if already exists
  playHistory = playHistory.filter(s => s.title !== song.title || s.artist !== song.artist);
  // add to front
  playHistory.unshift(song);
  // keep max 5
  if (playHistory.length > 5) playHistory = playHistory.slice(0, 5);
  saveHistory();
  renderHome();
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

// ── AUTH ──────────────────────────────────────────────────────
function showApp() {
  loginPage.classList.add('hidden');
  app.classList.remove('hidden');

  const user = localStorage.getItem('mfa_username');
  if (user) sidebarUser.textContent = '@' + user;

  loadHistory();
  loadPlaylists();
  loadSongs();
}

loginBtn.onclick = async () => {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  if (!u || !p) return showToast('Isi username & password');

  const { data } = await db
    .from('users')
    .select('*')
    .eq('username', u)
    .eq('password', p)
    .single();

  if (!data) return showToast('Username atau password salah');

  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_username', u);
  showToast('Login berhasil 🎵');
  showApp();
};

registerBtn.onclick = async () => {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  if (!u || p.length < 6) return showToast('Password min 6 karakter');

  const { error } = await db.from('users').insert([{ username: u, password: p }]);
  if (error) return showToast('Username sudah dipakai');

  showToast('Registrasi berhasil');
};

window.logout = () => {
  localStorage.clear();
  location.reload();
};

if (localStorage.getItem('mfa_loggedin') === 'true') showApp();

// ── LOAD SONGS ────────────────────────────────────────────────
async function loadSongs() {
  albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Memuat lagu...</p>';

  const { data, error } = await db
    .from('songs')
    .select('id, title, artist, cover, audio');

  if (error || !data?.length) {
    albumGrid.innerHTML = '<p style="padding:10px">Tidak ada lagu</p>';
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

  renderHome();
}

// ── RENDER HOME (5 history lagu) ──────────────────────────────
function renderHome() {
  albumGrid.innerHTML = '';
  if (playHistory.length === 0) {
    albumGrid.innerHTML = '<p style="padding:10px;color:#6b6b7a">Belum ada riwayat lagu.</p>';
    return;
  }
  // tampilkan max 5 dari history, cocokkan dengan data songs agar ada id
  const histSongs = playHistory.map(h => {
    const match = songs.find(s => s.title === h.title && s.artist === h.artist);
    return match || h;
  });
  renderList(albumGrid, histSongs, songs);
}

// ── RENDER LIST ───────────────────────────────────────────────
function renderList(container, list, sourceList) {
  container.innerHTML = '';
  list.forEach((s) => {
    // cari index di songs global
    const globalIdx = songs.findIndex(gs => gs.title === s.title && gs.artist === s.artist);
    const item = document.createElement('div');
    item.className = 'song-item';
    item.innerHTML = `
      <img class="song-cover" src="${s.cover || ''}">
      <div class="song-info">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      <button class="song-fav-btn ${isFavoriteSong(s.id) ? 'active' : ''}" data-id="${s.id}" title="Favorit">♥</button>
      <button class="song-play-btn">▶</button>
    `;
    // play on item click (except buttons)
    item.onclick = (e) => {
      if (e.target.closest('.song-fav-btn') || e.target.closest('.song-play-btn')) return;
      if (globalIdx !== -1) playSong(globalIdx);
    };
    // play button
    item.querySelector('.song-play-btn').onclick = (e) => {
      e.stopPropagation();
      if (globalIdx !== -1) playSong(globalIdx);
    };
    // fav button in list
    item.querySelector('.song-fav-btn').onclick = async (e) => {
      e.stopPropagation();
      await toggleFavoriteSong(s, item.querySelector('.song-fav-btn'));
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

  // update fav icon
  if (isFavoriteSong(s.id)) {
    fpFav.classList.add('active');
  } else {
    fpFav.classList.remove('active');
  }

  // tambah ke history
  addToHistory(s);
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

prevBtn.onclick = fpPrev.onclick = () =>
  playSong((currentIndex - 1 + songs.length) % songs.length);

nextBtn.onclick = fpNext.onclick = () =>
  playSong((currentIndex + 1) % songs.length);

audio.onended = () => {

  if(shuffleMode){
    playSong(
      Math.floor(Math.random() * songs.length)
    );
    return;
  }

  nextBtn.onclick();
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
    const { error } = await db
      .from('favorites')
      .delete()
      .eq('username', username)
      .eq('song_id', song.id);

    if (!error) {
      favorites = favorites.filter(f => f.song_id !== song.id);
      if (btnEl) btnEl.classList.remove('active');
      // update fp fav if this is the current song
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
      // update fp fav if this is the current song
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
function showPage(p) {
  [homePage, searchPage, libraryPage].forEach(x => x.classList.remove('active'));
  [homeTab, searchTab, libraryTab].forEach(x => x.classList.remove('active'));
  document.getElementById(p + 'Page').classList.add('active');
  document.getElementById(p + 'Tab').classList.add('active');
  pageTitle.textContent = p[0].toUpperCase() + p.slice(1);
  if (p === 'library') renderLibrary();
}

homeTab.onclick = () => showPage('home');
searchTab.onclick = () => showPage('search');
libraryTab.onclick = () => showPage('library');

// ── SEARCH (by huruf depan) ────────────────────────────────────
searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) {
    searchResults.innerHTML = '<p style="color:#6b6b7a;padding:10px 10px">Ketik untuk mencari lagu.</p>';
    return;
  }
  const filtered = songs.filter(s =>
    s.title.toLowerCase().startsWith(q) ||
    s.artist.toLowerCase().startsWith(q)
  );
  if (filtered.length === 0) {
    searchResults.innerHTML = '<p style="color:#6b6b7a;padding:10px">Tidak ada hasil.</p>';
    return;
  }
  renderList(searchResults, filtered, songs);
};

// ── LIBRARY ───────────────────────────────────────────────────
function renderLibrary() {
  libraryPage.innerHTML = '';

  // === FAVORIT PLAYLIST ===
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

  // isi lagu favorit
  const favContainer = favSection.querySelector('#favPlaylistSongs');
  if (favSongs.length === 0) {
    favContainer.innerHTML = '<p style="color:#6b6b7a;padding:10px 16px;font-size:13px">Belum ada lagu favorit.</p>';
  } else {
    renderList(favContainer, favSongs, songs);
  }

  // toggle expand favorit
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

  // === TOMBOL BUAT RUANG BARU ===
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

  showToast(
    shuffleMode
      ? 'Shuffle aktif'
      : 'Shuffle nonaktif'
  );
};
