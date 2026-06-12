/* ============================================================
   player.js — Audio Player, Controls, Full Player, Queue, Lyrics
   MusikForAll
   ============================================================ */

// ── DOM REFS ──────────────────────────────────────────────────
const audio         = document.getElementById('audio');
const miniPlayBtn   = document.getElementById('miniPlayBtn');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const miniCover     = document.getElementById('miniCover');
const currentSong   = document.getElementById('currentSong');
const currentArtist = document.getElementById('currentArtist');
const miniPlayer    = document.getElementById('miniPlayer');
const heroTitle     = document.getElementById('heroTitle');
const heroArtist    = document.getElementById('heroArtist');
const vinylDisc     = document.getElementById('vinylDisc');
const vinylCover    = document.getElementById('vinylCover');
const fullPlayer    = document.getElementById('fullPlayer');
const fpBack        = document.getElementById('fpBack');
const fpVinyl       = document.getElementById('fpVinyl');
const fpVinylCover  = document.getElementById('fpVinylCover');
const fpTitle       = document.getElementById('fpTitle');
const fpArtist      = document.getElementById('fpArtist');
const fpPlay        = document.getElementById('fpPlay');
const fpPrev        = document.getElementById('fpPrev');
const fpNext        = document.getElementById('fpNext');
const fpProgress    = document.getElementById('fpProgressBar');
const fpCurrent     = document.getElementById('fpCurrent');
const fpDuration    = document.getElementById('fpDuration');
const fpVolume      = document.getElementById('fpVolume');
const fpShuffle     = document.getElementById('fpShuffle');
const fpSwipeContainer = document.getElementById('fpSwipeContainer');
const fpQueueList      = document.getElementById('fpQueueList');
const fpLyricsContent  = document.getElementById('fpLyricsContent');

// ── STATE ─────────────────────────────────────────────────────
let currentIndex  = -1;
let isPlaying     = false;
let shuffleMode   = false;
let shuffledQueue = [];
let currentPanel  = 1;

// ── UTILS ─────────────────────────────────────────────────────
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

// ── PLAY ERROR ────────────────────────────────────────────────
function showPlayError() {
  const popup = document.createElement('div');
  popup.className = 'play-error-popup';
  popup.innerHTML = `
    <div class="play-error-icon">⚠️</div>
    <div class="play-error-msg">Lagu tidak dapat diputar.<br>Periksa koneksi internetmu.</div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('show'), 10);
  setTimeout(() => { popup.classList.remove('show'); setTimeout(() => popup.remove(), 400); }, 3000);
}

// ── PLAY SONG ─────────────────────────────────────────────────
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
  }).catch(() => showPlayError());

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
  if (!isGuest()) localStorage.setItem('mfa_songs_played', totalSongsPlayed.toString());
  addToHistory(s);

  updateFpHeartBtn();
  updateMiniHeartBtn();

  if (!fullPlayer.classList.contains('hidden')) {
    applyNowPlayingBackground(s);
  }

  document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active-song'));
}

// ── PLAY / PAUSE TOGGLE ───────────────────────────────────────
function togglePlayPause() {
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
}

miniPlayBtn.onclick = fpPlay.onclick = togglePlayPause;

// ── NEXT / PREV ───────────────────────────────────────────────
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

nextBtn.onclick = fpNext.onclick = () => playNext();
prevBtn.onclick = fpPrev.onclick = () => playPrev();

// ── AUDIO EVENTS ─────────────────────────────────────────────
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

// ── FULL PLAYER OPEN/CLOSE ────────────────────────────────────
miniPlayer.onclick = e => {
  if (!e.target.closest('button')) {
    fullPlayer.classList.remove('hidden');
    lockBodyScroll();
    goToPanel(1, false);
    renderQueuePanel();
    if (currentIndex !== -1) applyNowPlayingBackground(songs[currentIndex]);
  }
};

fpBack.onclick = () => {
  fullPlayer.classList.add('hidden');
  unlockBodyScroll();
};

// ── SHUFFLE ───────────────────────────────────────────────────
if (fpShuffle) {
  fpShuffle.onclick = () => {
    shuffleMode = !shuffleMode;
    fpShuffle.classList.toggle('active', shuffleMode);
    if (shuffleMode) buildShuffledQueue();
    showToast(shuffleMode ? '🔀 Shuffle aktif' : 'Shuffle nonaktif');
  };
}

// ── SWIPE PANELS ─────────────────────────────────────────────
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

let _swipeStartX = 0, _swipeStartY = 0, _swipeActive = false;

if (fpSwipeContainer) {
  fpSwipeContainer.addEventListener('touchstart', (e) => {
    _swipeStartX = e.touches[0].clientX;
    _swipeStartY = e.touches[0].clientY;
    _swipeActive = false;
  }, { passive: true });

  fpSwipeContainer.addEventListener('touchmove', (e) => {
    const dx = Math.abs(e.touches[0].clientX - _swipeStartX);
    const dy = Math.abs(e.touches[0].clientY - _swipeStartY);
    if (!_swipeActive && (dx > 5 || dy > 5)) _swipeActive = dx > dy;
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
    item.onclick = () => { playSong(realIdx !== -1 ? realIdx : currentIndex); goToPanel(1); };
    fpQueueList.appendChild(item);
  });
}

// ── LYRICS PANEL ─────────────────────────────────────────────
async function renderLyricsPanel() {
  if (!fpLyricsContent) return;
  if (currentIndex === -1) {
    fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Pilih lagu untuk melihat lirik</p>';
    return;
  }
  const song = songs[currentIndex];
  fpLyricsContent.innerHTML = '<p class="fp-lyrics-loading">⏳ Memuat lirik...</p>';
  try {
    const { data, error } = await db.from('lyrics').select('content').eq('song_id', song.id).single();
    if (error || !data?.content) {
      fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Tidak ada lirik tersedia</p>';
    } else {
      fpLyricsContent.innerHTML = data.content.split('\n')
        .map(l => `<div class="fp-lyric-line">${l || '&nbsp;'}</div>`)
        .join('');
    }
  } catch (e) {
    fpLyricsContent.innerHTML = '<p class="fp-lyrics-empty">Tidak ada lirik tersedia</p>';
  }
}

// ── COLOR EXTRACTION & DYNAMIC GRADIENTS ─────────────────────
const colorCache = new Map();
let _fpBgTransitionTimer = null;

function colorDist([r1,g1,b1], [r2,g2,b2]) {
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}
function colorMean(arr) {
  const n = arr.length;
  return [
    Math.round(arr.reduce((s,c) => s + c[0], 0) / n),
    Math.round(arr.reduce((s,c) => s + c[1], 0) / n),
    Math.round(arr.reduce((s,c) => s + c[2], 0) / n),
  ];
}
function adjustColorBrightness([r,g,b]) {
  const brightness = (r + g + b) / 3;
  if (brightness > 180) return [Math.round(r*.6), Math.round(g*.6), Math.round(b*.6)];
  if (brightness < 40)  return [Math.min(255,Math.round(r*1.5)), Math.min(255,Math.round(g*1.5)), Math.min(255,Math.round(b*1.5))];
  return [r, g, b];
}
function rgbToStr([r,g,b], alpha = 1) {
  return alpha === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}

function extractColors(imageUrl, songId) {
  return new Promise((resolve) => {
    if (songId !== undefined && colorCache.has(songId)) return resolve(colorCache.get(songId));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        const colors = [];
        for (let i = 0; i < data.length; i += 4) {
          const [r,g,b,a] = [data[i],data[i+1],data[i+2],data[i+3]];
          if (a < 128) continue;
          const brightness = (r+g+b)/3;
          if (brightness < 15 || brightness > 240) continue;
          colors.push([r,g,b]);
        }
        const fallback = { dominant: [30,30,40], secondary: [50,50,70] };
        if (colors.length === 0) { if (songId !== undefined) colorCache.set(songId, fallback); return resolve(fallback); }
        let c1 = colors[0], c2 = colors[Math.floor(colors.length / 2)];
        for (let iter = 0; iter < 5; iter++) {
          const g1 = [], g2 = [];
          colors.forEach(c => (colorDist(c,c1) < colorDist(c,c2) ? g1 : g2).push(c));
          if (g1.length) c1 = colorMean(g1);
          if (g2.length) c2 = colorMean(g2);
        }
        const result = { dominant: adjustColorBrightness(c1), secondary: adjustColorBrightness(c2) };
        if (songId !== undefined) colorCache.set(songId, result);
        resolve(result);
      } catch {
        const fb = { dominant: [30,30,40], secondary: [50,50,70] };
        if (songId !== undefined) colorCache.set(songId, fb);
        resolve(fb);
      }
    };
    img.onerror = () => {
      const fb = { dominant: [30,30,40], secondary: [50,50,70] };
      if (songId !== undefined) colorCache.set(songId, fb);
      resolve(fb);
    };
    img.src = imageUrl;
  });
}

function applyGradientToElement(el, colors) {
  if (!el) return;
  const { dominant } = colors;
  el.style.transition = 'background 500ms ease';
  el.style.background = `linear-gradient(180deg, ${rgbToStr(dominant, 0.85)} 0%, ${rgbToStr(dominant, 0.5)} 40%, transparent 100%)`;
}

async function applyNowPlayingBackground(song) {
  const fpEl = document.getElementById('fullPlayer');
  if (!fpEl) return;

  let bgLayer = document.getElementById('fpDynamicBg');
  if (!bgLayer) {
    bgLayer = document.createElement('div');
    bgLayer.id = 'fpDynamicBg';
    bgLayer.className = 'fp-dynamic-bg';
    fpEl.insertBefore(bgLayer, fpEl.firstChild);
  }

  let glowEl = document.getElementById('fpCoverGlow');
  if (!glowEl) {
    glowEl = document.createElement('div');
    glowEl.id = 'fpCoverGlow';
    glowEl.className = 'fp-cover-glow';
    const coverWrap = fpEl.querySelector('.fp-cover-wrap');
    if (coverWrap) coverWrap.appendChild(glowEl);
  }

  if (!song?.cover) {
    bgLayer.style.transition = 'opacity 400ms ease';
    bgLayer.style.opacity = '0';
    glowEl.style.opacity = '0';
    return;
  }

  try {
    const colors = await extractColors(song.cover, song.id);
    const { dominant, secondary } = colors;
    if (_fpBgTransitionTimer) clearTimeout(_fpBgTransitionTimer);
    bgLayer.style.transition = 'opacity 150ms ease';
    bgLayer.style.opacity = '0';
    _fpBgTransitionTimer = setTimeout(() => {
      bgLayer.style.background = `
        radial-gradient(ellipse at 50% 0%, ${rgbToStr(dominant, 0.9)} 0%, transparent 70%),
        radial-gradient(ellipse at 80% 80%, ${rgbToStr(secondary, 0.5)} 0%, transparent 60%),
        linear-gradient(180deg, ${rgbToStr(dominant, 0.95)} 0%, ${rgbToStr(dominant, 0.7)} 30%, ${rgbToStr(secondary, 0.4)} 65%, transparent 100%)
      `;
      glowEl.style.transition = 'box-shadow 500ms ease, opacity 300ms ease';
      glowEl.style.opacity = '1';
      glowEl.style.boxShadow = `0 0 80px 30px ${rgbToStr(dominant, 0.6)}, 0 0 160px 60px ${rgbToStr(dominant, 0.3)}`;
      bgLayer.style.transition = 'opacity 400ms ease';
      bgLayer.style.opacity = '1';
    }, 160);
  } catch { bgLayer.style.opacity = '0'; }
}
