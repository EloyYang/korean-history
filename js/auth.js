/*
 * 구글 로그인 + 학습 기록 동기화 (Firebase Auth · Firestore)
 *   설정값은 js/firebase-config.js 의 window.FIREBASE_CONFIG. 비어 있으면 로그인 없이 이 브라우저에만 저장한다.
 *   저장 위치: users/{uid}/data/{키}  →  { k: 키, v: 값(문자열|null=삭제), t: 수정 시각 }
 */
const S = window.UserStore;
const cfg = window.FIREBASE_CONFIG;
const V = '10.12.2';

function slot() {
  let nav = document.querySelector('.top-links');
  if (!nav) {
    nav = document.createElement('nav'); nav.className = 'top-links';
    const bar = document.querySelector('.topbar'); if (bar) bar.appendChild(nav);
  }
  let el = document.getElementById('auth-box');
  if (!el) { el = document.createElement('div'); el.id = 'auth-box'; el.className = 'auth-box'; nav.appendChild(el); }
  return el;
}
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderBox(state) {
  const el = slot();
  if (state === 'off') { el.innerHTML = ''; el.hidden = true; return; }
  el.hidden = false;
  if (state === 'loading') { el.innerHTML = '<span class="auth-wait">로그인 확인 중…</span>'; return; }
  const u = S.user;
  if (!u) {
    el.innerHTML = `<button type="button" class="auth-in"><svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Google 로그인</button>`;
    return;
  }
  const initial = esc((u.name || u.email || '?').trim()[0]);
  el.innerHTML = `
    <button type="button" class="auth-me" aria-haspopup="true" title="${esc(u.email)}">
      ${u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="auth-ini">${initial}</span>`}
      <span class="auth-name">${esc(u.name || u.email)}</span><span class="auth-sync" title="동기화됨">☁︎</span>
    </button>
    <div class="auth-menu" hidden>
      <p>${esc(u.email)}</p>
      <p class="auth-note">풀이 기록·오답·외운 문항이 이 계정에 저장돼요.</p>
      <button type="button" class="auth-out">로그아웃</button>
    </div>`;
}

if (!cfg || !cfg.apiKey) {
  S.configured = false;
  renderBox('off');
} else {
  S.configured = true;
  renderBox('loading');
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const docId = (k) => k.replace(/\//g, '_');

  document.addEventListener('click', async (e) => {
    if (e.target.closest('.auth-in')) {
      try { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); }
      catch (err) { if (err && err.code !== 'auth/popup-closed-by-user') alert('로그인하지 못했어요: ' + (err.message || err)); }
      return;
    }
    if (e.target.closest('.auth-me')) { const m = document.querySelector('.auth-menu'); m.hidden = !m.hidden; return; }
    if (e.target.closest('.auth-out')) {
      await A.signOut(auth);
      S._forgetLocal(); // 계정 기록은 서버에 있으니 이 브라우저에서는 지운다
      try { localStorage.removeItem('userstore.uid'); } catch (err) { /* 무시 */ }
      location.reload();
      return;
    }
    if (!e.target.closest('.auth-box')) { const m = document.querySelector('.auth-menu'); if (m) m.hidden = true; }
  });

  A.onAuthStateChanged(auth, async (u) => {
    if (!u) { S.user = null; S.cloud = null; renderBox('ready'); S._emit('auth'); return; }
    S.user = { uid: u.uid, name: u.displayName, email: u.email, photo: u.photoURL };
    // 다른 계정이 쓰던 브라우저면 이전 기록을 섞지 않는다
    const prevUid = localStorage.getItem('userstore.uid');
    if (prevUid && prevUid !== u.uid) S._forgetLocal();
    localStorage.setItem('userstore.uid', u.uid);

    const col = F.collection(db, 'users', u.uid, 'data');
    const push = (k, v, t) => F.setDoc(F.doc(col, docId(k)), { k, v: v == null ? null : v, t }).catch((err) => console.warn('동기화 실패', k, err));
    S.cloud = { push };
    renderBox('ready');

    // 처음 맞추기: 더 최근 쪽을 남긴다
    let changed = false;
    try {
      const snap = await F.getDocs(col);
      const remote = {};
      snap.forEach((d) => { const x = d.data(); if (x && x.k) remote[x.k] = x; });
      const m = S.meta();
      Object.values(remote).forEach((r) => {
        if (!m[r.k] || r.t > m[r.k]) {
          if (S.getItem(r.k) !== r.v) changed = true;
          S._applyRemote(r.k, r.v, r.t);
        }
      });
      const m2 = S.meta();
      const keys = new Set([...S.syncedKeys(), ...Object.keys(m2).filter(S.isSynced)]);
      keys.forEach((k) => { const r = remote[k]; if (!r || (m2[k] || 0) > r.t) push(k, S.getItem(k), m2[k] || Date.now()); });
    } catch (err) {
      console.warn('기록을 불러오지 못했어요', err);
    }
    S._emit('sync');
    // 서버 기록으로 바뀐 게 있으면 화면을 한 번 새로 그린다
    const flag = 'userstore.reloaded.' + u.uid;
    if (changed && !sessionStorage.getItem(flag)) { sessionStorage.setItem(flag, '1'); location.reload(); }
  });
}
