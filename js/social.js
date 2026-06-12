/* ============================================================
   social.js — Friends & Chat
   MusikForAll
   ============================================================ */

// ── STATE ─────────────────────────────────────────────────────
let friendsList       = [];
let friendRequests    = [];
let friendSearchTimer = null;

function getMyUUID() {
  return localStorage.getItem('mfa_userid') || null;
}

// ── LOAD FRIEND PAGE ──────────────────────────────────────────
async function loadFriendPage() {
  const myId = getMyUUID();
  if (!myId) return;

  _renderFriendShell('<div style="padding:24px;text-align:center;color:var(--subtext);font-size:13px">Memuat...</div>');

  try {
    const { data: f1 } = await db.from('friends')
      .select('id, user1, user2, created_at')
      .or(`user1.eq.${myId},user2.eq.${myId}`)
      .order('created_at', { ascending: false });

    const friendIds = (f1 || []).map(r => r.user1 === myId ? r.user2 : r.user1);
    let profiles = [];
    if (friendIds.length > 0) {
      const { data: p } = await db.from('profiles').select('id, username').in('id', friendIds);
      profiles = p || [];
    }
    friendsList = profiles;

    const { data: reqs } = await db.from('friend_requests')
      .select('id, sender_id, created_at')
      .eq('receiver_id', myId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const reqIds = (reqs || []).map(r => r.sender_id);
    let reqProfiles = [];
    if (reqIds.length > 0) {
      const { data: rp } = await db.from('profiles').select('id, username').in('id', reqIds);
      reqProfiles = rp || [];
    }
    friendRequests = (reqs || []).map(r => ({
      ...r,
      username: (reqProfiles.find(p => p.id === r.sender_id) || {}).username || '?'
    }));

    _renderFriendContent();
  } catch (e) {
    _renderFriendShell('<div style="padding:24px;text-align:center;color:var(--subtext);font-size:13px">Gagal memuat. Coba lagi.</div>');
  }
}

function _renderFriendShell(innerHtml) {
  const body = document.querySelector('.inbox-friend-body');
  if (!body) return;
  body.innerHTML = `
    <div class="inbox-search-wrap">
      <input type="text" class="search-input" placeholder="Cari username teman..." id="friendSearchInput">
    </div>
    <div id="friendSearchResults"></div>
    ${innerHtml}
  `;
  _attachFriendSearch();
}

function _renderFriendContent() {
  const body = document.querySelector('.inbox-friend-body');
  if (!body) return;

  let content = '';

  if (friendRequests.length > 0) {
    content += `<div class="friend-section-label">Permintaan Masuk (${friendRequests.length})</div>`;
    friendRequests.forEach(req => {
      content += `
        <div class="friend-item" id="req-${req.id}">
          <div class="friend-avatar">👤</div>
          <div class="friend-info">
            <div class="friend-name">@${req.username}</div>
            <div class="friend-meta">Ingin berteman</div>
          </div>
          <div class="friend-req-actions">
            <button class="friend-accept-btn" data-id="${req.id}" data-sender="${req.sender_id}">✔ Terima</button>
            <button class="friend-reject-btn" data-id="${req.id}">✕</button>
          </div>
        </div>
      `;
    });
  }

  if (friendsList.length > 0) {
    content += `<div class="friend-section-label">Teman (${friendsList.length})</div>`;
    friendsList.forEach(f => {
      content += `
        <div class="friend-item">
          <div class="friend-avatar">👤</div>
          <div class="friend-info">
            <div class="friend-name clickable-username" data-uid="${f.id}">@${f.username}</div>
            <div class="friend-meta">Teman</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="friend-chat-btn" data-friendid="${f.id}" data-username="${f.username}" title="Chat">💬</button>
            <button class="friend-remove-btn" data-friendid="${f.id}" title="Hapus teman">✕</button>
          </div>
        </div>
      `;
    });
  }

  if (friendsList.length === 0 && friendRequests.length === 0) {
    content += `<div class="inbox-friend-empty">
      <div style="font-size:48px;margin-bottom:12px">👥</div>
      <div style="font-weight:700;font-size:16px;margin-bottom:6px">Belum ada teman</div>
      <div style="color:var(--subtext);font-size:13px">Cari username untuk menambah teman</div>
    </div>`;
  }

  body.innerHTML = `
    <div class="inbox-search-wrap">
      <input type="text" class="search-input" placeholder="Cari username teman..." id="friendSearchInput">
    </div>
    <div id="friendSearchResults"></div>
    ${content}
  `;
  _attachFriendSearch();
  _attachFriendActions();
  body.querySelectorAll('.friend-chat-btn').forEach(btn => {
    btn.onclick = () => openChat(btn.dataset.friendid, btn.dataset.username);
  });
}

// ── FRIEND SEARCH ─────────────────────────────────────────────
function _attachFriendSearch() {
  const input = document.getElementById('friendSearchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(friendSearchTimer);
    const q = input.value.trim();
    const resultsEl = document.getElementById('friendSearchResults');
    if (!resultsEl) return;
    if (!q) { resultsEl.innerHTML = ''; return; }
    resultsEl.innerHTML = '<div style="padding:8px 20px;font-size:13px;color:var(--subtext)">Mencari...</div>';
    friendSearchTimer = setTimeout(() => _doFriendSearch(q), 400);
  });
}

async function _doFriendSearch(q) {
  const resultsEl = document.getElementById('friendSearchResults');
  if (!resultsEl) return;
  const myId = getMyUUID();

  try {
    const { data, error } = await db
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${q}%`)
      .limit(10);

    if (error || !data?.length) {
      resultsEl.innerHTML = '<div style="padding:8px 20px;font-size:13px;color:var(--subtext)">Tidak ada hasil.</div>';
      return;
    }

    const filtered = data.filter(u => u.id !== myId);
    if (!filtered.length) {
      resultsEl.innerHTML = '<div style="padding:8px 20px;font-size:13px;color:var(--subtext)">Tidak ada hasil.</div>';
      return;
    }

    // Cek status friend / request untuk setiap user
    const ids = filtered.map(u => u.id);
    const { data: existing } = await db.from('friends')
      .select('user1, user2')
      .or(`user1.eq.${myId},user2.eq.${myId}`);
    const friendSet = new Set((existing || []).map(r => r.user1 === myId ? r.user2 : r.user1));

    const { data: pendingOut } = await db.from('friend_requests')
      .select('receiver_id')
      .eq('sender_id', myId)
      .eq('status', 'pending');
    const pendingSet = new Set((pendingOut || []).map(r => r.receiver_id));

    resultsEl.innerHTML = filtered.map(u => {
      const isFriend  = friendSet.has(u.id);
      const isPending = pendingSet.has(u.id);
      let btn = '';
      if (isFriend)       btn = `<span class="friend-status-badge">✔ Teman</span>`;
      else if (isPending) btn = `<span class="friend-status-badge pending">Menunggu</span>`;
      else                btn = `<button class="friend-add-btn" data-uid="${u.id}">+ Tambah</button>`;
      return `
        <div class="friend-item">
          <div class="friend-avatar">👤</div>
          <div class="friend-info">
            <div class="friend-name">@${u.username}</div>
          </div>
          ${btn}
        </div>
      `;
    }).join('');

    resultsEl.querySelectorAll('.friend-add-btn').forEach(btn => {
      btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = '...';
        const targetId = btn.dataset.uid;
        const { error } = await db.from('friend_requests').insert([{
          sender_id: myId, receiver_id: targetId, status: 'pending'
        }]);
        if (error) { btn.disabled = false; btn.textContent = '+ Tambah'; showToast('Gagal kirim permintaan'); return; }
        btn.replaceWith(Object.assign(document.createElement('span'), {
          className: 'friend-status-badge pending', textContent: 'Menunggu'
        }));
        showToast('Permintaan pertemanan terkirim ✔');
      };
    });

  } catch (e) {
    if (resultsEl) resultsEl.innerHTML = '<div style="padding:8px 20px;font-size:13px;color:var(--subtext)">Gagal mencari.</div>';
  }
}

// ── FRIEND ACTIONS (accept / reject / remove) ─────────────────
function _attachFriendActions() {
  const body = document.querySelector('.inbox-friend-body');
  if (!body) return;
  const myId = getMyUUID();

  body.querySelectorAll('.friend-accept-btn').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      const reqId    = btn.dataset.id;
      const senderId = btn.dataset.sender;
      try {
        await db.from('friend_requests').update({ status: 'accepted' }).eq('id', reqId);
        await db.from('friends').insert([{ user1: myId, user2: senderId }]);
        showToast('Permintaan diterima ✔');
        loadFriendPage();
      } catch { btn.disabled = false; showToast('Gagal menerima permintaan'); }
    };
  });

  body.querySelectorAll('.friend-reject-btn').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        await db.from('friend_requests').update({ status: 'rejected' }).eq('id', btn.dataset.id);
        showToast('Permintaan ditolak');
        loadFriendPage();
      } catch { btn.disabled = false; showToast('Gagal menolak permintaan'); }
    };
  });

  body.querySelectorAll('.friend-remove-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Hapus teman ini?')) return;
      const friendId = btn.dataset.friendid;
      try {
        await db.from('friends').delete()
          .or(`and(user1.eq.${myId},user2.eq.${friendId}),and(user1.eq.${friendId},user2.eq.${myId})`);
        showToast('Teman dihapus');
        loadFriendPage();
      } catch { showToast('Gagal hapus teman'); }
    };
  });
}

// ══════════════════════════════════════════════════════════════
//  CHAT
// ══════════════════════════════════════════════════════════════

let chatFriendId   = null;
let chatFriendName = null;
let chatMessages   = [];
let chatSub        = null;
let chatImgFile    = null;
let chatSongPick   = null;
let chatAttachOpen = false;

async function openChat(friendId, friendName) {
  chatFriendId   = friendId;
  chatFriendName = friendName;
  chatMessages   = [];
  chatImgFile    = null;
  chatSongPick   = null;
  chatAttachOpen = false;

  const chatPage = document.getElementById('chatPage');
  if (!chatPage) return;
  chatPage.classList.remove('hidden');
  lockBodyScroll();

  const nameEl = document.getElementById('chatHeaderName');
  if (nameEl) nameEl.textContent = '@' + friendName;
  const inputEl = document.getElementById('chatInput');
  if (inputEl) { inputEl.value = ''; inputEl.disabled = false; }
  const attachMenu = document.getElementById('chatAttachMenu');
  if (attachMenu) attachMenu.style.display = 'none';
  const previewEl = document.getElementById('chatPreview');
  if (previewEl) previewEl.innerHTML = '';
  document.getElementById('chatMessages').innerHTML = '<div class="chat-loading">Memuat pesan...</div>';

  await _loadMessages();
  _subscribeChatMessages();
}

document.getElementById('chatBack')?.addEventListener('click', () => {
  chatSub?.unsubscribe?.();
  chatSub = null;
  document.getElementById('chatPage')?.classList.add('hidden');
  unlockBodyScroll();
});

async function _loadMessages() {
  const myId = getMyUUID();
  if (!myId || !chatFriendId) return;
  try {
    const { data, error } = await db.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${chatFriendId}),and(sender_id.eq.${chatFriendId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) throw error;
    chatMessages = data || [];
    _renderMessages();
  } catch (e) {
    document.getElementById('chatMessages').innerHTML = '<div class="chat-loading">Gagal memuat pesan.</div>';
  }
}

function _subscribeChatMessages() {
  const myId = getMyUUID();
  if (chatSub) chatSub.unsubscribe();
  chatSub = db.channel('chat-' + myId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `receiver_id=eq.${myId}`
    }, payload => {
      if (payload.new?.sender_id === chatFriendId) {
        chatMessages.push(payload.new);
        _renderMessages();
        _markRead(payload.new.id);
      }
    })
    .subscribe();
}

function _renderMessages() {
  const myId = getMyUUID();
  const container = document.getElementById('chatMessages');
  if (!container) return;

  if (chatMessages.length === 0) {
    container.innerHTML = '<div class="chat-loading">Belum ada pesan. Mulai percakapan!</div>';
    return;
  }

  container.innerHTML = chatMessages.map(msg => {
    const isMine = msg.sender_id === myId;
    const cls    = isMine ? 'mine' : 'theirs';
    const time   = new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const readIcon = isMine ? (msg.read_at ? '<span class="chat-read">✔✔</span>' : '<span class="chat-unread">✔</span>') : '';

    if (msg.type === 'image') {
      return `<div class="chat-msg-wrap ${cls}">
        <div class="chat-bubble ${cls} chat-bubble-img">
          <img src="${msg.content}" class="chat-img" onclick="window.open(this.src)">
          <div class="chat-meta">${time} ${readIcon}</div>
        </div>
      </div>`;
    }
    if (msg.type === 'song') {
      let song = null;
      try { song = JSON.parse(msg.content); } catch {}
      return `<div class="chat-msg-wrap ${cls}">
        <div class="chat-bubble ${cls} chat-bubble-song" onclick="_playChatSong(${JSON.stringify(song?.id)})">
          ${song?.cover
            ? `<img src="${song.cover}" class="chat-song-cover">`
            : `<div class="chat-song-cover-placeholder">🎵</div>`}
          <div class="chat-song-info">
            <div class="chat-song-title">${song?.title || '?'}</div>
            <div class="chat-song-artist">${song?.artist || ''}</div>
            <div class="chat-song-play">▶ Tap untuk putar</div>
          </div>
          <div class="chat-meta">${time} ${readIcon}</div>
        </div>
      </div>`;
    }
    return `<div class="chat-msg-wrap ${cls}">
      <div class="chat-bubble ${cls}">
        <div class="chat-text">${_escapeHtml(msg.content)}</div>
        <div class="chat-meta">${time} ${readIcon}</div>
      </div>
    </div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function _playChatSong(songId) {
  if (!songId) return;
  const idx = songs.findIndex(s => s.id === songId);
  if (idx !== -1) playSong(idx);
  else showToast('Lagu tidak tersedia');
}
window._playChatSong = _playChatSong;

function _escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function _markRead(msgId) {
  await db.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msgId).is('read_at', null);
}

// ── SEND MESSAGE ──────────────────────────────────────────────
document.getElementById('chatSendBtn')?.addEventListener('click', _sendMessage);
document.getElementById('chatInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _sendMessage(); }
});

async function _sendMessage() {
  const myId    = getMyUUID();
  const inputEl = document.getElementById('chatInput');
  const text    = inputEl?.value.trim() || '';

  if (!myId || !chatFriendId) return;

  // Send image
  if (chatImgFile) {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const { error } = await db.from('messages').insert([{
        sender_id: myId, receiver_id: chatFriendId,
        type: 'image', content: ev.target.result
      }]);
      if (!error) {
        await _loadMessages();
        chatImgFile = null;
        const previewEl = document.getElementById('chatPreview');
        if (previewEl) previewEl.innerHTML = '';
      } else { showToast('Gagal kirim gambar'); }
    };
    reader.readAsDataURL(chatImgFile);
    return;
  }

  // Send song
  if (chatSongPick) {
    const { error } = await db.from('messages').insert([{
      sender_id: myId, receiver_id: chatFriendId,
      type: 'song', content: JSON.stringify({ id: chatSongPick.id, title: chatSongPick.title, artist: chatSongPick.artist, cover: chatSongPick.cover })
    }]);
    if (!error) {
      await _loadMessages();
      chatSongPick = null;
      const previewEl = document.getElementById('chatPreview');
      if (previewEl) previewEl.innerHTML = '';
    } else { showToast('Gagal kirim lagu'); }
    return;
  }

  if (!text) return;
  if (inputEl) inputEl.value = '';

  const { error } = await db.from('messages').insert([{
    sender_id: myId, receiver_id: chatFriendId,
    type: 'text', content: text
  }]);
  if (!error) { await _loadMessages(); }
  else { showToast('Gagal kirim pesan'); if (inputEl) inputEl.value = text; }
}

// ── ATTACH (Image & Song) ─────────────────────────────────────
document.getElementById('chatAttachBtn')?.addEventListener('click', () => {
  const menu = document.getElementById('chatAttachMenu');
  if (!menu) return;
  chatAttachOpen = !chatAttachOpen;
  menu.style.display = chatAttachOpen ? 'flex' : 'none';
});

document.getElementById('chatAttachImage')?.addEventListener('click', () => {
  document.getElementById('chatImageInput')?.click();
  const menu = document.getElementById('chatAttachMenu');
  if (menu) menu.style.display = 'none';
  chatAttachOpen = false;
});

document.getElementById('chatImageInput')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  chatImgFile = file;
  chatSongPick = null;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const previewEl = document.getElementById('chatPreview');
    if (previewEl) previewEl.innerHTML = `
      <div class="chat-img-preview">
        <img src="${ev.target.result}">
        <button class="chat-img-preview-cancel" id="chatImgCancel">✕</button>
      </div>
    `;
    document.getElementById('chatImgCancel')?.addEventListener('click', () => {
      chatImgFile = null;
      if (previewEl) previewEl.innerHTML = '';
    });
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

document.getElementById('chatAttachSong')?.addEventListener('click', () => {
  _openSongPicker();
  const menu = document.getElementById('chatAttachMenu');
  if (menu) menu.style.display = 'none';
  chatAttachOpen = false;
});

function _openSongPicker() {
  const modal = document.getElementById('chatSongPickModal');
  if (!modal) return;
  const list = document.getElementById('chatSongPickList');
  if (!list) return;
  list.innerHTML = '';
  songs.forEach(s => {
    const item = document.createElement('div');
    item.className = 'chat-song-pick-item';
    item.innerHTML = `
      ${s.cover ? `<img src="${s.cover}" class="chat-song-pick-cover">` : `<div class="chat-song-pick-cover-ph">🎵</div>`}
      <div>
        <div class="chat-song-pick-title">${s.title}</div>
        <div class="chat-song-pick-artist">${s.artist}</div>
      </div>
    `;
    item.onclick = () => {
      chatSongPick = s;
      chatImgFile  = null;
      const previewEl = document.getElementById('chatPreview');
      if (previewEl) previewEl.innerHTML = `
        <div class="chat-song-preview">
          <span class="chat-song-preview-icon">🎵</span>
          <span class="chat-song-preview-title">${s.title} · ${s.artist}</span>
          <button id="chatSongCancel" style="background:none;border:none;cursor:pointer;color:var(--subtext);font-size:16px;flex-shrink:0;">✕</button>
        </div>
      `;
      document.getElementById('chatSongCancel')?.addEventListener('click', () => {
        chatSongPick = null;
        if (previewEl) previewEl.innerHTML = '';
      });
      modal.classList.add('hidden');
    };
    list.appendChild(item);
  });
  modal.classList.remove('hidden');
}

document.getElementById('chatSongPickClose')?.addEventListener('click', () => {
  document.getElementById('chatSongPickModal')?.classList.add('hidden');
});
