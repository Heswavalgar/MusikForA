/* ============================================================
   auth.js — Login, Register, Guest Mode, Logout
   MusikForAll
   ============================================================ */

// ── DOM REFS ──────────────────────────────────────────────────
const loginPage    = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const appEl        = document.getElementById('app');
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

// ── HELPERS ───────────────────────────────────────────────────
function isGuest() {
  return localStorage.getItem('mfa_guest') === 'true';
}

function requireAccount() {
  document.getElementById('guestModal').classList.remove('hidden');
}

function showApp() {
  loginPage.classList.add('hidden');
  registerPage.classList.add('hidden');
  appEl.classList.remove('hidden');

  const user = localStorage.getItem('mfa_username');
  const sidebarUser = document.getElementById('sidebarUser');
  if (user && sidebarUser) sidebarUser.textContent = '@' + user;

  loadHistory();
  loadPlaylists();
  loadProfilePhoto();
  loadSongs();
}

async function performLogout() {
  try { await db.auth.signOut(); } catch (e) { /* ignore */ }
  localStorage.removeItem('mfa_loggedin');
  localStorage.removeItem('mfa_username');
  localStorage.removeItem('mfa_userid');
  localStorage.removeItem('mfa_email');
  localStorage.removeItem('mfa_guest');
  location.reload();
}

function showLogoutConfirm() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const logoutModal = document.getElementById('logoutModal');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  if (logoutModal) logoutModal.classList.remove('hidden');
}
window.showLogoutConfirm = showLogoutConfirm;

function handleLogout() {
  if (isGuest()) {
    performLogout();
  } else {
    showLogoutConfirm();
  }
}
window.handleLogout = handleLogout;

function _closeAllAndGoTo(page) {
  const sidebar         = document.getElementById('sidebar');
  const so              = document.getElementById('sidebarOverlay');
  const guestModal      = document.getElementById('guestModal');
  const fullPlayer      = document.getElementById('fullPlayer');
  const addToPlaylistModal   = document.getElementById('addToPlaylistModal');
  const logoutModal          = document.getElementById('logoutModal');
  const profileEditModal     = document.getElementById('profileEditModal');
  const changePasswordModal  = document.getElementById('changePasswordModal');

  if (guestModal) guestModal.classList.add('hidden');
  if (fullPlayer) fullPlayer.classList.add('hidden');
  if (addToPlaylistModal) addToPlaylistModal.classList.add('hidden');
  if (logoutModal) logoutModal.classList.add('hidden');
  if (profileEditModal) profileEditModal.classList.add('hidden');
  if (changePasswordModal) changePasswordModal.classList.add('hidden');
  if (sidebar) sidebar.classList.remove('open');
  if (so) { so.style.opacity = '0'; so.style.visibility = 'hidden'; }

  localStorage.removeItem('mfa_guest');
  localStorage.removeItem('mfa_loggedin');
  localStorage.removeItem('mfa_username');
  localStorage.removeItem('mfa_userid');

  appEl.classList.add('hidden');
  if (page === 'register') {
    loginPage.classList.add('hidden');
    registerPage.classList.remove('hidden');
  } else {
    registerPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
  }
}

// ── LOGIN ─────────────────────────────────────────────────────
loginBtn.onclick = async () => {
  const email    = usernameEl.value.trim();
  const password = passwordEl.value;
  if (!email || !password) return showToast('Isi email dan password');
  showLoader();

  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) { hideLoader(); return showToast('Email atau password salah'); }

  const { data: profile } = await db.from('profiles').select('*').eq('id', data.user.id).single();
  hideLoader();

  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_userid', data.user.id);
  localStorage.setItem('mfa_email', email);
  localStorage.removeItem('mfa_guest');
  if (profile) localStorage.setItem('mfa_username', profile.username);

  showToast('Login berhasil 🎵');
  showApp();
};

// ── REGISTER ──────────────────────────────────────────────────
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
  const { data: existing, error: checkError } = await db.from('profiles').select('username').eq('username', username).maybeSingle();
  if (checkError) { hideLoader(); return showToast('Gagal memeriksa username'); }
  if (existing)   { hideLoader(); return showToast('Username sudah digunakan'); }

  const { data, error } = await db.auth.signUp({ email, password });
  if (error) { hideLoader(); return showToast(error.message); }

  if (!data.user) {
    hideLoader();
    showToast('Pendaftaran berhasil! Cek email untuk konfirmasi akun 📧');
    registerPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    return;
  }

  const { error: profileError } = await db.from('profiles').insert([{ id: data.user.id, username }]);
  if (profileError) { hideLoader(); return showToast('Gagal membuat profil'); }

  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_username', username);
  localStorage.setItem('mfa_userid', data.user.id);
  localStorage.setItem('mfa_email', email);
  localStorage.removeItem('mfa_guest');

  hideLoader();
  showToast('Pendaftaran berhasil! Selamat datang 🎵');
  showApp();
};

// ── GUEST MODE ────────────────────────────────────────────────
guestBtn.onclick = () => {
  localStorage.setItem('mfa_loggedin', 'true');
  localStorage.setItem('mfa_username', 'Guest');
  localStorage.setItem('mfa_userid', 'guest');
  localStorage.setItem('mfa_guest', 'true');
  showToast('Masuk sebagai tamu 🎵');
  showApp();
};

// ── NAVIGASI LOGIN ↔ REGISTER ─────────────────────────────────
goRegisterLink.onclick = () => {
  loginPage.classList.add('hidden');
  registerPage.classList.remove('hidden');
  regUsernameEl.value = '';
  regEmailEl.value = '';
  regPasswordEl.value = '';
  regConfirmPasswordEl.value = '';
};
goLoginLink.onclick = () => {
  registerPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
};

// ── SESSION CHECK STARTUP ─────────────────────────────────────
(async () => {
  try {
    if (localStorage.getItem('mfa_loggedin') === 'true') {
      const isGuestMode = localStorage.getItem('mfa_guest') === 'true';
      if (isGuestMode) { showApp(); return; }
      const { data, error } = await db.auth.getSession();
      const session = data?.session;
      if (!error && session) {
        showApp();
      } else {
        ['mfa_loggedin','mfa_userid','mfa_email','mfa_guest'].forEach(k => localStorage.removeItem(k));
        hideLoader();
      }
    } else {
      hideLoader();
    }
  } catch (e) {
    console.error('Startup error:', e);
    ['mfa_loggedin','mfa_userid','mfa_email','mfa_guest'].forEach(k => localStorage.removeItem(k));
    hideLoader();
  }
})();

// ── LOGOUT MODAL EVENTS ───────────────────────────────────────
document.getElementById('logoutCancel')?.addEventListener('click', () => {
  document.getElementById('logoutModal').classList.add('hidden');
});
document.getElementById('logoutConfirm')?.addEventListener('click', () => performLogout());

// ── GUEST MODAL EVENTS ────────────────────────────────────────
document.getElementById('guestStayBtn')?.addEventListener('click', () => {
  document.getElementById('guestModal').classList.add('hidden');
});
document.getElementById('guestLoginBtn')?.addEventListener('click', () => _closeAllAndGoTo('login'));
document.getElementById('guestRegisterBtn')?.addEventListener('click', () => _closeAllAndGoTo('register'));

// ── GUEST BANNER ──────────────────────────────────────────────
function updateGuestBanner() {
  const guestBanner = document.getElementById('guestBanner');
  if (!guestBanner) return;
  guestBanner.classList.toggle('hidden', !isGuest());
}

document.getElementById('guestBannerLoginBtn')?.addEventListener('click', () => _closeAllAndGoTo('login'));
document.getElementById('guestBannerRegisterBtn')?.addEventListener('click', () => _closeAllAndGoTo('register'));

// ── PASSWORD EYE TOGGLE ───────────────────────────────────────
document.querySelectorAll('.pw-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
  });
});
