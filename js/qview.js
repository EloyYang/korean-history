/*
 * 문제 바로 보기 창 — 어느 페이지에서든 QView.open(['79-3', '77-5'], { title, note }) 로 문제 이미지와
 * 정답·도출 포인트를 띄운다. 풀이 자료(정답표·풀이·선지 포인트)는 처음 열 때 한 번만 불러온다.
 */
(function () {
  const NUMS = '①②③④⑤';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EX = window.examById ? window.examById('history') : { img: 'quiz/{r}/{n}.webp' };
  const imgOf = (r, n) => EX.img.replace('{r}', r).replace('{n}', String(n).padStart(2, '0'));
  const ROUNDS = [79, 78, 77, 76, 75, 74, 73, 72, 71, 70];
  const NEED = ['js/quiz-key.js', 'js/qmeta.js', 'js/solve.js'].concat(ROUNDS.map((r) => `js/solve/${r}.js`), ROUNDS.map((r) => `js/optx/${r}.js`));

  let loading = null;
  function loadAll() {
    if (window.QUIZ_KEYS && window.SOLVE && window.OPTX && window.QMETA) return Promise.resolve();
    if (!loading) {
      loading = NEED.reduce((p, src) => p.then(() => new Promise((ok) => {
        if (document.querySelector(`script[src="${src}"]`)) return ok();
        const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ok; document.head.appendChild(s);
      })), Promise.resolve());
    }
    return loading;
  }

  const st = { ids: [], i: 0, title: '', note: '', open: false };
  const log = () => (window.ATTEMPTS ? window.ATTEMPTS.all() : []);

  function solveHtml(r, n) {
    const id = `${r}-${n}`;
    const key = ((window.QUIZ_KEYS || {}).history || {})[r];
    const right = key ? key.ans[n - 1] : 0;
    const sv = (window.SOLVE || {})[id]; const ox = (window.OPTX || {})[id];
    const meta = ((window.QMETA || {})[r] || [])[n - 1];
    const l = log().find((x) => x.round === r);
    const picked = l && l.answers ? (l.answers[n] || 0) : null;
    const cell = (k, v) => (v ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '');
    const metaHtml = meta ? (() => { const [w, s, k] = meta.split('|'); return `<dl class="sv-meta">${cell('시기', w)}${cell('나라', s)}${cell('왕·정부', k)}</dl>`; })() : '';
    let pick = '';
    if (picked != null && right) {
      if (!picked) pick = `<div class="sv-pick none"><p><b>내가 고른 답</b> 고르지 않음 <span>→ 정답 ${NUMS[right - 1]}</span></p></div>`;
      else if (picked === right) pick = `<div class="sv-pick ok"><p><b>내가 고른 답</b> ${NUMS[picked - 1]} <span>정답을 골랐어요</span></p></div>`;
      else {
        const mine = ox ? ox[picked - 1].split('|') : null, ans = ox ? ox[right - 1].split('|') : null;
        pick = `<div class="sv-pick"><p><b>내가 고른 답</b> ${NUMS[picked - 1]}${mine ? ' ' + esc(mine[0]) : ''} <span>→ 정답 ${NUMS[right - 1]}${ans ? ' ' + esc(ans[0]) : ''}</span></p>${mine ? `<p class="why"><b>왜 아닌가</b> ${esc(mine[1] || '')}</p>` : ''}</div>`;
      }
    }
    const opts = ox ? `<p class="sv-h">선지별 포인트</p><ol class="sv-opts ox">${ox.map((o, i) => {
      const [t, e] = o.split('|'); const mineWrong = picked && i + 1 === picked && picked !== right;
      return `<li class="${i + 1 === right ? 'ans' : ''}${mineWrong ? ' mine' : ''}"><span class="n">${NUMS[i]}</span><span><b>${esc(t)}</b>${i + 1 === right ? ' <em>정답</em>' : ''}${mineWrong ? ' <em class="mine">내가 고름</em>' : ''}<small>${esc(e || '')}</small></span></li>`;
    }).join('')}</ol>` : '';
    return `${metaHtml}
      ${right ? `<p class="sv-h">정답</p><p class="sv-how"><b>${NUMS[right - 1]}</b></p>` : ''}
      ${sv ? `<p class="sv-h">지문에서 잡을 단서</p><p class="sv-clue">${sv.clue.map((c) => `<mark class="clue">${esc(c)}</mark>`).join(' ')}</p>
      <p class="sv-h">정답까지 생각의 순서</p><p class="sv-how">${sv.how}</p>` : ''}
      ${pick}${opts}`;
  }

  function render() {
    const box = document.getElementById('qview'); if (!box) return;
    const id = st.ids[st.i]; const [r, n] = id.split('-').map(Number);
    const l = log().find((x) => x.round === r);
    const wrong = l && l.wrong.includes(n);
    const many = st.ids.length > 1;
    box.innerHTML = `<div class="qv-box" role="dialog" aria-modal="true" aria-label="문제 보기">
      <div class="qv-top">
        <div class="qv-ttl"><b>${esc(st.title || '기출 문제')}</b>${st.note ? `<span>${st.note}</span>` : ''}</div>
        <button type="button" class="qv-x" aria-label="닫기">✕</button>
      </div>
      ${many ? `<div class="qv-nav"><button type="button" data-qv-step="-1" ${st.i === 0 ? 'disabled' : ''}>◀ 이전</button>
        <span class="qv-tabs">${st.ids.map((x, i) => { const [rr, nn] = x.split('-'); return `<button type="button" data-qv-go="${i}" aria-pressed="${i === st.i}">${rr}회 ${nn}번</button>`; }).join('')}</span>
        <button type="button" data-qv-step="1" ${st.i === st.ids.length - 1 ? 'disabled' : ''}>다음 ▶</button></div>` : ''}
      <div class="rq${st.shown ? ' open' : ''}">
        <div class="rq-head"><span class="rq-no">${r}회 ${n}번</span>${wrong ? '<span class="qv-wrong">내가 틀린 문제</span>' : l ? '<span class="qv-right">푼 회차 · 맞힘</span>' : ''}
          <a class="qv-solve" href="quiz.html?exam=history#${r}">이 회차 풀러 가기</a></div>
        <img class="rq-img" src="${imgOf(r, n)}" alt="${r}회 ${n}번 문제">
        <div class="rq-solve"><button type="button" class="rq-toggle" data-qv-toggle>${st.shown ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾'}</button>
          <div class="rq-solve-body">${solveHtml(r, n)}</div></div>
      </div></div>`;
    box.scrollTop = 0;
  }

  function open(ids, opt) {
    ids = (ids || []).filter(Boolean); if (!ids.length) return;
    opt = opt || {};
    Object.assign(st, { ids, i: Math.max(0, Math.min(ids.length - 1, opt.start || 0)), title: opt.title || '', note: opt.note || '', shown: !!opt.showAnswer, open: true });
    let box = document.getElementById('qview');
    if (!box) { box = document.createElement('div'); box.id = 'qview'; box.className = 'qv'; document.body.appendChild(box); }
    box.hidden = false; document.body.classList.add('qv-on');
    box.innerHTML = '<div class="qv-box"><p class="qv-wait">문제를 불러오는 중…</p></div>';
    loadAll().then(() => { if (st.open) render(); });
  }
  function close() { st.open = false; const b = document.getElementById('qview'); if (b) b.hidden = true; document.body.classList.remove('qv-on'); }

  document.addEventListener('click', (e) => {
    if (!st.open) return;
    const box = document.getElementById('qview'); if (!box || box.hidden) return;
    if (e.target === box || e.target.closest('.qv-x')) { close(); return; }
    const sp = e.target.closest('[data-qv-step]');
    if (sp) { st.i = Math.max(0, Math.min(st.ids.length - 1, st.i + +sp.dataset.qvStep)); render(); return; }
    const go = e.target.closest('[data-qv-go]');
    if (go) { st.i = +go.dataset.qvGo; render(); return; }
    if (e.target.closest('[data-qv-toggle]')) { st.shown = !st.shown; const y = box.scrollTop; render(); box.scrollTop = y; }
  });
  document.addEventListener('keydown', (e) => {
    if (!st.open) return;
    if (e.key === 'Escape') { close(); e.stopPropagation(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.stopPropagation(); const d = e.key === 'ArrowRight' ? 1 : -1;
      if (st.i + d >= 0 && st.i + d < st.ids.length) { st.i += d; render(); }
    }
  }, true);

  window.QView = { open, close };
})();
