/*
 * 구독 상태 확인 · 잠금 화면 · 결제 수단 등록 (PortOne V2 빌링키)
 *   PAYWALL.enabled 가 false 면 아무것도 막지 않는다.
 *   <body data-paid> 인 페이지는 이용 기간(무료 체험·구독)이 없으면 잠금 화면을 띄운다.
 *   이용 기간은 서버가 쓰는 access/{uid} 를 읽기만 한다 — 실제 콘텐츠 보호는 Storage 보안 규칙이 한다.
 */
(function () {
  const P = window.PAYWALL || {};
  const on = !!(P.enabled && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const won = (n) => Number(n || 0).toLocaleString('ko-KR') + '원';
  const md = (t) => { if (!t) return ''; const d = new Date(t); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`; };
  const METHOD = { card: '신용·체크카드', kakaopay: '카카오페이', naverpay: '네이버페이' };

  let resolveReady; const ready = new Promise((r) => { resolveReady = r; });
  const A = { state: on ? 'loading' : 'off', ready };
  window.Access = A;
  const emit = () => { document.dispatchEvent(new Event('access')); paint(); };
  const set = (st, extra) => { Object.assign(A, { state: st }, extra || {}); if (st !== 'loading') resolveReady(A); emit(); };
  if (!on) { resolveReady(A); return; }

  let fns = null; // { call(name, data) }
  async function functions() {
    if (fns) return fns;
    const FB = window.FB;
    const Fn = await import(`https://www.gstatic.com/firebasejs/${FB.V}/firebase-functions.js`);
    const f = Fn.getFunctions(FB.app, P.region || 'asia-northeast3');
    fns = { call: (name, data) => Fn.httpsCallable(f, name)(data || {}).then((r) => r.data) };
    return fns;
  }
  async function readAccess(uid) {
    const { F, db } = window.FB;
    const s = await F.getDoc(F.doc(db, 'access', uid));
    return s.exists() ? s.data() : null;
  }
  const toMs = (t) => (t && t.toMillis ? t.toMillis() : t ? +t : 0);

  async function refresh() {
    const u = window.UserStore.user;
    if (!u) { set('signed-out'); return; }
    try {
      let a = await readAccess(u.uid);
      if (!a) { await (await functions()).call('startTrial'); a = await readAccess(u.uid); } // 첫 로그인 → 무료 체험 시작
      if (!a) { set('error', { error: '이용 정보를 만들지 못했어요.' }); return; }
      const until = toMs(a.until); const now = Date.now();
      const info = { until, trialUntil: toMs(a.trialUntil), paidUntil: toMs(a.paidUntil), status: a.status, method: a.method, cardLabel: a.cardLabel, nextChargeAt: toMs(a.nextChargeAt), lastError: a.lastError };
      info.daysLeft = Math.max(0, Math.ceil((until - now) / 864e5));
      set(until > now ? 'ok' : 'expired', info);
    } catch (e) {
      console.warn('구독 정보 확인 실패', e);
      set('error', { error: String((e && e.message) || e).slice(0, 200) });
    }
  }
  window.UserStore.onChange((t) => { if (t === 'auth' && window.FB) refresh(); });

  /* ── 잠금 화면 ── */
  const paid = () => document.body && document.body.hasAttribute('data-paid');
  function paint() {
    badge();
    if (!paid()) return;
    let g = document.getElementById('paywall');
    const need = ['signed-out', 'expired', 'error'].includes(A.state);
    if (!need) { if (g) g.remove(); document.body.classList.remove('pw-on'); return; }
    if (!g) { g = document.createElement('div'); g.id = 'paywall'; g.className = 'pw'; document.body.appendChild(g); }
    document.body.classList.add('pw-on');
    const price = `월 ${won(P.price || 5000)}`;
    g.innerHTML = `<div class="pw-box" role="dialog" aria-modal="true">
      <p class="pw-mark">史</p>
      ${A.state === 'signed-out' ? `<h2>구글 계정으로 로그인해 주세요</h2>
        <p>처음 로그인하면 <b>${P.trialDays || 7}일 동안 무료</b>로 모든 기능을 쓸 수 있어요.<br>체험이 끝나면 ${price}으로 이용할 수 있어요.</p>
        <button type="button" class="pw-go" data-pw-login>Google 계정으로 시작하기</button>`
      : A.state === 'expired' ? `<h2>${A.paidUntil ? '구독 기간이 끝났어요' : '무료 체험이 끝났어요'}</h2>
        <p>${price}으로 기출 풀기·오답 노트·지도 노트를 계속 이용할 수 있어요.${A.lastError ? `<br><small class="pw-err">최근 결제 실패: ${esc(A.lastError)}</small>` : ''}</p>
        <a class="pw-go" href="subscribe.html">구독하기</a>`
      : `<h2>이용 정보를 확인하지 못했어요</h2><p><small class="pw-err">${esc(A.error)}</small></p><button type="button" class="pw-go" data-pw-retry>다시 시도</button>`}
      <a class="pw-home" href="index.html">처음 화면으로</a></div>`;
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-pw-login]')) { const b = document.querySelector('.auth-in'); if (b) b.click(); }
    if (e.target.closest('[data-pw-retry]')) { set('loading'); refresh(); }
  });

  /* ── 상단의 남은 기간 표시 ── */
  function badge() {
    const nav = document.querySelector('.top-links'); if (!nav) return;
    let b = document.getElementById('sub-badge');
    if (!['ok', 'expired'].includes(A.state)) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('a'); b.id = 'sub-badge'; b.className = 'top-link sub-badge'; b.href = 'subscribe.html'; nav.insertBefore(b, document.getElementById('auth-box')); }
    const trial = A.status === 'trial' || (!A.paidUntil && A.trialUntil);
    b.classList.toggle('warn', A.state === 'expired' || (trial && A.daysLeft <= 2));
    b.textContent = A.state === 'expired' ? '구독하기' : A.status === 'active' && !trial ? '구독 중' : trial ? `무료 체험 ${A.daysLeft}일 남음` : `이용 ${A.daysLeft}일 남음`;
  }

  /* ── 결제 수단 등록 · 해지 (subscribe.html) ── */
  async function loadSdk() {
    if (window.PortOne) return window.PortOne;
    await new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.portone.io/v2/browser-sdk.js'; s.onload = ok; s.onerror = () => no(new Error('결제 모듈을 불러오지 못했어요.')); document.head.appendChild(s); });
    return window.PortOne;
  }
  async function register(method) {
    const u = window.UserStore.user; if (!u) throw new Error('먼저 로그인해 주세요.');
    const channelKey = (P.channels || {})[method]; if (!P.storeId || !channelKey) throw new Error(`${METHOD[method]} 결제 채널이 아직 설정되지 않았어요.`);
    const PortOne = await loadSdk();
    const back = new URL(location.href); back.search = `?bk=1&m=${method}`;
    const r = await PortOne.requestIssueBillingKey({
      storeId: P.storeId, channelKey,
      billingKeyMethod: method === 'card' ? 'CARD' : 'EASY_PAY',
      issueId: `bk-${u.uid.slice(0, 10)}-${Date.now()}`,
      issueName: `시험 공부 노트 월 구독 (${won(P.price || 5000)})`,
      customer: { customerId: u.uid, email: u.email || undefined, fullName: u.name || undefined },
      redirectUrl: back.toString(), // 모바일은 결제창에서 이 주소로 돌아온다
    });
    if (!r || r.code != null) throw new Error((r && r.message) || '결제 수단 등록을 취소했어요.');
    return finish(r.billingKey, method);
  }
  async function finish(billingKey, method) {
    const res = await (await functions()).call('subscribe', { billingKey, method });
    await refresh();
    return res;
  }
  async function cancelSub() { await (await functions()).call('cancel'); await refresh(); }
  window.Sub = { register, finish, cancel: cancelSub, refresh, METHOD, won, md };
})();
