/* 구독 관리 화면: 남은 기간 · 결제 수단 등록(신용카드·카카오페이·네이버페이) · 해지 */
(function () {
  const P = window.PAYWALL || {};
  const box = document.getElementById('sub');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let busy = '', msg = '';
  const price = () => window.Sub ? window.Sub.won(P.price || 5000) : `${P.price || 5000}원`;

  function render() {
    const A = window.Access || { state: 'off' };
    const S = window.Sub;
    if (A.state === 'off') {
      box.innerHTML = `<section class="sub-card"><h2>지금은 무료로 열려 있어요</h2><p>구독 기능이 아직 켜지지 않았어요. 모든 기능을 자유롭게 쓸 수 있어요.</p><a class="pw-go" href="index.html">처음 화면으로</a></section>`;
      return;
    }
    if (A.state === 'loading') { box.innerHTML = '<p class="qv-wait">구독 정보를 확인하는 중…</p>'; return; }
    if (A.state === 'signed-out') {
      box.innerHTML = `<section class="sub-card"><h2>구글 계정으로 로그인해 주세요</h2><p>처음 로그인하면 <b>${P.trialDays || 7}일 무료 체험</b>이 시작돼요. 체험 중에는 결제되지 않아요.</p><button type="button" class="pw-go" data-sub-login>Google 계정으로 시작하기</button></section>${plan()}`;
      return;
    }
    if (A.state === 'error') { box.innerHTML = `<section class="sub-card"><h2>구독 정보를 확인하지 못했어요</h2><p class="pw-err">${esc(A.error)}</p><button type="button" class="pw-go" data-sub-retry>다시 시도</button></section>`; return; }
    const trial = A.status === 'trial';
    const active = A.status === 'active';
    const head = A.state === 'expired'
      ? `<h2>${A.paidUntil ? '구독 기간이 끝났어요' : '무료 체험이 끝났어요'}</h2><p>결제 수단을 등록하면 바로 ${price()}이 결제되고 한 달 동안 이용할 수 있어요.</p>`
      : active
        ? `<h2>구독 중이에요</h2><p>${A.method ? `${esc(S.METHOD[A.method])}${A.cardLabel ? ` (${esc(A.cardLabel)})` : ''}로 ` : ''}<b>${S.md(A.nextChargeAt)}</b>에 ${price()}이 결제돼요. 이용 기간: ${S.md(A.until)}까지</p>`
        : trial
          ? `<h2>무료 체험 중 · ${A.daysLeft}일 남음</h2><p>${S.md(A.trialUntil)}까지 무료예요. 지금 결제 수단을 등록해 두면 체험이 끝나는 날 첫 결제(${price()})가 되고, 그 전에는 결제되지 않아요.</p>`
          : `<h2>해지했어요</h2><p>${S.md(A.until)}까지는 계속 이용할 수 있고, 이후에는 결제되지 않아요.</p>`;
    const methods = !active ? `<div class="sub-methods">
        <p class="sv-h">결제 수단 선택</p>
        ${['card', 'kakaopay', 'naverpay'].map((m) => `<button type="button" class="sub-m sub-${m}" data-sub-method="${m}" ${busy ? 'disabled' : ''}>${busy === m ? '처리 중…' : esc(S.METHOD[m])}</button>`).join('')}
        <small>매달 같은 날 자동으로 ${price()}이 결제돼요. 언제든 이 화면에서 해지할 수 있어요.</small></div>`
      : `<div class="sub-methods"><button type="button" data-sub-change ${busy ? 'disabled' : ''}>결제 수단 바꾸기</button><button type="button" class="danger" data-sub-cancel ${busy ? 'disabled' : ''}>${busy === 'cancel' ? '처리 중…' : '구독 해지'}</button></div>`;
    box.innerHTML = `<section class="sub-card">${head}${A.lastError ? `<p class="pw-err">최근 결제 실패: ${esc(A.lastError)} — 결제 수단을 다시 등록해 주세요.</p>` : ''}${msg ? `<p class="sub-msg">${esc(msg)}</p>` : ''}${methods}</section>${plan()}`;
  }
  const plan = () => `<section class="sub-plan"><h3>이용 안내</h3><ul>
      <li>첫 로그인한 구글 계정마다 ${P.trialDays || 7}일 무료 체험 (계정당 한 번)</li>
      <li>체험 이후 월 ${price()} · 매달 자동 결제 · 신용·체크카드, 카카오페이, 네이버페이</li>
      <li>해지하면 이미 결제한 기간이 끝날 때까지 이용하고, 다음 결제부터 멈춰요</li>
      <li>환불·문의: <span class="sub-todo">사업자 정보와 환불 정책을 PAYMENT.md 안내대로 채워 주세요</span></li></ul></section>`;

  async function run(key, fn) {
    busy = key; msg = ''; render();
    try { const r = await fn(); msg = r || ''; } catch (e) { msg = String((e && e.message) || e); }
    busy = ''; render();
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sub-login]')) { const b = document.querySelector('.auth-in'); if (b) b.click(); return; }
    if (e.target.closest('[data-sub-retry]')) { window.Sub.refresh(); return; }
    const m = e.target.closest('[data-sub-method]');
    if (m) { run(m.dataset.subMethod, async () => { const r = await window.Sub.register(m.dataset.subMethod); return r.charged ? '결제가 완료됐어요. 고마워요!' : '결제 수단을 등록했어요. 체험이 끝나는 날 첫 결제가 돼요.'; }); return; }
    if (e.target.closest('[data-sub-change]')) { window.Access.status = 'changing'; render(); return; }
    if (e.target.closest('[data-sub-cancel]')) {
      if (!confirm('구독을 해지할까요?\n이미 결제한 기간이 끝날 때까지는 계속 이용할 수 있어요.')) return;
      run('cancel', async () => { await window.Sub.cancel(); return '해지했어요.'; });
    }
  });
  // 모바일 결제창에서 돌아온 경우 (?bk=1&m=card&billingKey=…)
  const q = new URLSearchParams(location.search);
  if (q.get('bk')) {
    const finish = () => {
      history.replaceState(null, '', location.pathname);
      if (q.get('code')) { msg = q.get('message') || '결제 수단 등록을 취소했어요.'; render(); return; }
      if (q.get('billingKey')) run(q.get('m'), async () => { const r = await window.Sub.finish(q.get('billingKey'), q.get('m')); return r.charged ? '결제가 완료됐어요.' : '결제 수단을 등록했어요.'; });
    };
    window.Access && window.Access.ready.then(finish);
  }
  document.addEventListener('access', render);
  render();
})();
