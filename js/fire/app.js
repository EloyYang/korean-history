/*
 * 소방공무원 필기 기출 풀기
 *   문제는 소방청이 공개한 시험지를 문항별 이미지로 자른 것(fire/img/<시험>/<과목>/<번호>.webp), 정답은 확정답안(js/fire/data.js)
 *   기록은 study.fire.* (UserStore → 로그인하면 계정에 동기화)
 *     q     : { '시험/과목/번호': { t: 푼 횟수, w: 틀린 횟수, ok: 마지막 결과, last: 마지막 답, m: 해결 표시 } }
 *     flags : { 키: 1 }  헷갈려요 표시
 *     log   : 푼 기록   draft: 풀던 시험   last: 방금 채점한 결과
 */
(function () {
  const S = window.UserStore; const D = window.FIRE_DATA; const K = (n) => 'study.fire.' + n;
  const MAIN = document.getElementById('fr'); let root = MAIN;
  const EX = Object.fromEntries(D.exams.map((e) => [e.id, e])); const SUBN = D.subjects;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (sel) => document.querySelector(sel);
  const NUM = ['①', '②', '③', '④'];
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const rnd = (a) => a.slice().sort(() => Math.random() - 0.5);

  // ── 문항 키 ──
  const keyOf = (e, s, n) => `${e}/${s}/${n}`;
  const parse = (k) => { const [e, s, n] = k.split('/'); return { e, s, n: +n }; };
  const subjOf = (k) => { const p = parse(k); return EX[p.e].subjects.find((x) => x.id === p.s); };
  const ansOf = (k) => subjOf(k).ans[parse(k).n - 1];
  const imgOf = (k) => { const p = parse(k); return `fire/img/${p.e}/${p.s}/${String(p.n).padStart(2, '0')}.webp`; };
  const labelOf = (k) => { const p = parse(k); return `${EX[p.e].short} ${SUBN[p.s]} ${p.n}번`; };
  const isOk = (k, pick) => ansOf(k) === 0 || (pick != null && pick === ansOf(k)); // 0 = 전원 정답 처리
  // 채용 구분: 공개경쟁(open) · 경력경쟁(car) 은 따로 준비하는 별개 시험 — 주소의 ?kind= 로 정한다 (없으면 공개경쟁)
  const KIND = { open: '공개경쟁채용', car: '경력경쟁채용' };
  const curKind = KIND[new URLSearchParams(location.search).get('kind')] ? new URLSearchParams(location.search).get('kind') : 'open';
  const kindOf = (k) => EX[parse(k).e].kind;
  const inKind = (k) => kindOf(k) === curKind;
  const kindChips = () => '';
  const ALL = D.exams.flatMap((e) => e.subjects.flatMap((s) => Array.from({ length: s.count }, (_, i) => keyOf(e.id, s.id, i + 1))));

  // ── 기록 ──
  const Q = () => S.get(K('q'), {}) || {};
  const FL = () => S.get(K('flags'), {}) || {};
  // 기록은 채용 구분별로 보여 준다 (구분이 없는 옛 기록은 제목의 공채·경채로 가른다)
  const logs = () => (S.get(K('log'), []) || []).filter((l) => (l.kind || (/경채|경력/.test(l.title) ? 'car' : 'open')) === curKind);
  const draftOf = () => S.get(K('draft.' + curKind), null);

  // ── 시작 ──
  function start(title, keys, extra) {
    const dr = Object.assign({ title, keys, picks: {}, idx: 0, used: 0, t0: Date.now(), instant: S.get(K('instant'), false) === true }, extra || {});
    S.set(K('draft.' + curKind), dr); location.hash = '#quiz';
  }

  // ── 화면 이동 ──
  const TABS = [['home', '풀기'], ['wrong', '오답'], ['stats', '기록']];
  let timer = null;
  const route = () => { const t = location.hash.replace(/^#/, '').split('/')[0]; return ['home', 'quiz', 'result', 'wrong', 'stats'].includes(t) ? t : 'home'; };
  function render() {
    clearInterval(timer); root = MAIN;
    const t = route();
    document.querySelectorAll('.gt-tabs a').forEach((a) => a.classList.toggle('on', a.dataset.t === (t === 'quiz' || t === 'result' ? 'home' : t)));
    ({ home, quiz, result, wrong, stats })[t]();
    window.scrollTo(0, 0);
  }
  // 머리말을 현재 채용 구분에 맞춘다
  document.title = `소방공무원 ${KIND[curKind]} 필기 기출`;
  document.querySelector('.brand h1').textContent = `소방공무원 ${KIND[curKind]}`;
  document.querySelector('.brand-sub').textContent = `2022~2026년 ${KIND[curKind]} 필기시험 문제와 정답 (소방청 공개 자료)`;
  document.querySelector('.gt-tabs').innerHTML = TABS.map(([t, l]) => `<a href="#${t}" data-t="${t}">${l}</a>`).join('');

  // ── 별(헷갈려요) ──
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fl]'); if (!b) return;
    const k = b.dataset.fl; const f = Object.assign({}, FL()); if (f[k]) delete f[k]; else f[k] = 1;
    S.set(K('flags'), f); const on = !!f[k];
    document.querySelectorAll(`[data-fl="${k}"]`).forEach((x) => { x.classList.toggle('on', on); x.textContent = on ? '★ 헷갈려요' : '☆ 헷갈려요'; });
    const g = document.querySelector(`.fr-gn[data-k="${k}"]`); if (g) g.classList.toggle('fl', on);
  });
  const flagBtn = (k) => `<button type="button" class="gt-flag${FL()[k] ? ' on' : ''}" data-fl="${k}">${FL()[k] ? '★ 헷갈려요' : '☆ 헷갈려요'}</button>`;

  // ───────── 풀기 (홈) ─────────
  let bSubj = 'law', bCount = 20, bSrc = 'rand';
  function stat(keys) {
    const q = Q(); let done = 0, ok = 0;
    keys.forEach((k) => { if (q[k] && q[k].t) { done++; if (q[k].ok) ok++; } });
    return { done, ok, n: keys.length };
  }
  function home() {
    const dr = draftOf(); const q = Q(); const fl = FL();
    const KA = ALL.filter(inKind);
    const all = stat(KA); const wrongN = KA.filter((k) => q[k] && q[k].ok === false && !q[k].m).length; const flagN = Object.keys(fl).filter((k) => ALL.includes(k) && inKind(k)).length;
    const card = (e) => `<article class="fr-exam"><h3>${e.label} <small>${e.date} 시행 · ${e.subjects.reduce((a, s) => a + s.count, 0)}문항</small></h3>
      <div class="fr-subs">${e.subjects.map((s) => {
        const keys = Array.from({ length: s.count }, (_, i) => keyOf(e.id, s.id, i + 1)); const st = stat(keys);
        return `<button type="button" class="fr-sub${st.done === s.count ? ' fin' : ''}" data-go="${e.id}/${s.id}"><b>${s.name}</b><small>${s.count}문항${st.done ? ` · ${st.ok}/${st.done} 정답` : ''}</small><i style="--w:${pct(st.done, s.count)}%"></i></button>`;
      }).join('')}<button type="button" class="fr-sub all" data-go="${e.id}/*"><b>전 과목 풀기</b><small>${e.subjects.length}과목 · 시험 순서대로</small></button></div></article>`;
    const subjects = Object.keys(SUBN).filter((s) => KA.some((k) => parse(k).s === s));
    if (!subjects.includes(bSubj)) bSubj = subjects[0];
    root.innerHTML = `
      ${kindChips('data-kind')}
      ${dr ? `<div class="gt-tip fr-resume"><b>풀던 시험이 있어요</b> ${esc(dr.title)} · ${Object.keys(dr.picks).length}/${dr.keys.length}문항 푼 상태 <div class="gt-bar"><button type="button" class="gt-btn main" id="fr-resume">이어서 풀기</button><button type="button" class="gt-btn" id="fr-drop">버리기</button></div></div>` : ''}
      <div class="fr-sum"><div><b>${all.done}</b><span>푼 문항 / ${KA.length}</span></div><div><b>${all.done ? pct(all.ok, all.done) + '%' : '-'}</b><span>정답률</span></div><div><b>${wrongN}</b><span>틀린 문항</span></div><div><b>${flagN}</b><span>★ 헷갈림</span></div></div>
      <h2 class="r-h">과목 모아 풀기 <small>${KIND[curKind]} 여러 해의 같은 과목에서 골라 풀어요</small></h2>
      <div class="gt-tip fr-build">
        <div class="f-filters">${FILTER.pick('data-bs', '과목', subjects.map((x) => [x, SUBN[x]]), bSubj)}${FILTER.pick('data-bc', '문항 수', [10, 20, 30, 50].map((n) => [n, n + '문항']), bCount)}${FILTER.pick('data-bm', '고르는 방식', [['rand', '무작위'], ['wrong', '틀린 문제 위주'], ['new', '안 푼 문제 위주'], ['flag', '★ 헷갈림']], bSrc)}</div>
        <div class="gt-bar"><button type="button" class="gt-btn main" id="fr-build">${SUBN[bSubj]} ${bCount}문제 풀기</button><span class="gt-muted" id="fr-bnote"></span></div>
      </div>
      <h2 class="r-h">시험별 풀기 <small>과목을 누르면 그 시험의 문제를 번호 순서대로 풀어요</small></h2>
      <div class="fr-exams">${D.exams.filter((e) => e.kind === curKind).map(card).join('')}</div>
      <div class="ad-slot" data-ad="list"></div>`;
    const dres = $('#fr-resume'); if (dres) dres.addEventListener('click', () => { location.hash = '#quiz'; });
    const ddrop = $('#fr-drop'); if (ddrop) ddrop.addEventListener('click', () => { if (confirm('풀던 시험을 지울까요?')) { S.set(K('draft.' + curKind), null); home(); } });
    root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      const [e, s] = b.dataset.go.split('/'); const ex = EX[e];
      const subs = s === '*' ? ex.subjects : ex.subjects.filter((x) => x.id === s);
      const keys = subs.flatMap((x) => Array.from({ length: x.count }, (_, i) => keyOf(e, x.id, i + 1)));
      if (dr && !confirm('풀던 시험이 있어요. 지우고 새로 시작할까요?')) return;
      start(`${ex.label} · ${s === '*' ? '전 과목' : SUBN[s]}`, keys);
    }));
    FILTER.bind(root, 'data-bs', (v) => { bSubj = v; home(); });
    FILTER.bind(root, 'data-bc', (v) => { bCount = +v; home(); });
    FILTER.bind(root, 'data-bm', (v) => { bSrc = v; home(); });
    $('#fr-build').addEventListener('click', () => {
      const pool = KA.filter((k) => parse(k).s === bSubj);
      let pick;
      if (bSrc === 'wrong') pick = rnd(pool.filter((k) => q[k] && q[k].ok === false && !q[k].m)).concat(rnd(pool.filter((k) => !(q[k] && q[k].ok === false && !q[k].m))));
      else if (bSrc === 'new') pick = rnd(pool.filter((k) => !(q[k] && q[k].t))).concat(rnd(pool.filter((k) => q[k] && q[k].t)));
      else if (bSrc === 'flag') pick = rnd(pool.filter((k) => fl[k]));
      else pick = rnd(pool);
      pick = pick.slice(0, bCount);
      if (!pick.length) { $('#fr-bnote').textContent = '해당하는 문제가 없어요.'; return; }
      if (dr && !confirm('풀던 시험이 있어요. 지우고 새로 시작할까요?')) return;
      start(`${KIND[curKind]} ${SUBN[bSubj]} 모아 풀기 ${pick.length}문제`, pick);
    });
  }
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  // ───────── 문제 풀기 ─────────
  function quiz() {
    const dr = draftOf(); if (!dr) { location.hash = '#home'; return; }
    const keys = dr.keys; const total = keys.length; let idx = Math.min(dr.idx || 0, total - 1);
    const t0 = Date.now(); const save = () => { dr.used = (dr.used || 0) + (Date.now() - (dr._t || t0)); dr._t = Date.now(); S.set(K('draft.' + curKind), dr); };
    dr._t = t0;
    const view = () => {
      const k = keys[idx]; const pick = dr.picks[k]; const locked = dr.instant && pick != null;
      const a = ansOf(k);
      root.innerHTML = `
        <div class="fr-head">
          <b>${esc(dr.title)}</b><span class="gt-time" id="fr-time">${fmt(dr.used + (Date.now() - dr._t))}</span>
          <label class="chip-check"><input type="checkbox" id="fr-inst"${dr.instant ? ' checked' : ''}> 바로 정답 확인</label>
          <button type="button" class="gt-btn main" id="fr-submit">채점하기 (${Object.keys(dr.picks).length}/${total})</button>
          <button type="button" class="gt-btn" id="fr-quit">그만두기</button>
        </div>
        <div class="fr-grid">${keys.map((x, i) => `<button type="button" class="fr-gn${i === idx ? ' cur' : ''}${dr.picks[x] != null ? ' done' : ''}${FL()[x] ? ' fl' : ''}" data-i="${i}" data-k="${x}">${i + 1}</button>`).join('')}</div>
        <div class="fr-q">
          <div class="fr-qlabel"><b>${i1(idx)} / ${total}</b> <span class="gt-muted">${esc(labelOf(k))}</span>${flagBtn(k)}</div>
          <img class="fr-img" src="${imgOf(k)}" alt="${esc(labelOf(k))} 문제" decoding="async">
          <div class="fr-ans">${NUM.map((n, i) => `<button type="button" data-p="${i + 1}" class="${pick === i + 1 ? 'pick' : ''}${locked ? (a === 0 || i + 1 === a ? ' right' : pick === i + 1 ? ' wrong' : '') : ''}"${locked ? ' disabled' : ''}>${n}</button>`).join('')}</div>
          ${locked ? `<div class="fr-fb ${isOk(k, pick) ? 'g' : 'r'}">${isOk(k, pick) ? '정답이에요!' : `틀렸어요. 정답은 ${NUM[a - 1]}`}${a === 0 ? ' · 이 문항은 전원 정답 처리됐어요' : ''}</div>` : ''}
          <div class="gt-bar center"><button type="button" class="gt-btn" id="fr-prev"${idx ? '' : ' disabled'}>← 이전</button><button type="button" class="gt-btn" id="fr-clear"${pick != null && !locked ? '' : ' disabled'}>선택 취소</button><button type="button" class="gt-btn main" id="fr-next">${idx < total - 1 ? '다음 →' : '마지막 문제'}</button></div>
        </div>`;
      const go = (i) => { idx = Math.max(0, Math.min(total - 1, i)); dr.idx = idx; save(); view(); window.scrollTo(0, 0); };
      root.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.i)));
      root.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
        dr.picks[k] = +b.dataset.p; save();
        if (dr.instant) view(); else { root.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('pick', x === b)); $('#fr-clear').disabled = false; refreshTop(); const g = document.querySelector(`.fr-gn[data-k="${k}"]`); if (g) g.classList.add('done'); }
      }));
      $('#fr-prev').addEventListener('click', () => go(idx - 1));
      $('#fr-next').addEventListener('click', () => go(idx + 1));
      $('#fr-clear').addEventListener('click', () => { delete dr.picks[k]; save(); view(); });
      $('#fr-inst').addEventListener('change', (e) => { dr.instant = e.target.checked; S.set(K('instant'), dr.instant); save(); view(); });
      $('#fr-quit').addEventListener('click', () => { if (!confirm('풀던 시험을 그만둘까요? (푼 답은 저장되지 않아요)')) return; S.set(K('draft.' + curKind), null); location.hash = '#home'; });
      $('#fr-submit').addEventListener('click', () => {
        const left = total - Object.keys(dr.picks).length;
        if (!confirm(left ? `${left}문항을 안 풀었어요. 채점할까요? (안 푼 문항은 틀린 것으로 셈해요)` : '채점할까요?')) return;
        save(); grade(dr);
      });
      const refreshTop = () => { const b = $('#fr-submit'); if (b) b.textContent = `채점하기 (${Object.keys(dr.picks).length}/${total})`; };
      clearInterval(timer); timer = setInterval(() => { const el = $('#fr-time'); if (!el) return clearInterval(timer); el.textContent = fmt(dr.used + (Date.now() - dr._t)); }, 1000);
    };
    const i1 = (i) => i + 1;
    view();
    window.onkeydown = (e) => {
      if (route() !== 'quiz' || /INPUT|TEXTAREA/.test((e.target.tagName || ''))) return;
      if (e.key >= '1' && e.key <= '4') { const b = document.querySelector(`[data-p="${e.key}"]:not([disabled])`); if (b) b.click(); }
      if (e.key === 'ArrowRight') $('#fr-next') && $('#fr-next').click();
      if (e.key === 'ArrowLeft') $('#fr-prev') && $('#fr-prev').click();
    };
  }

  // ── 채점 ──
  function grade(dr) {
    const q = Object.assign({}, Q()); const keys = dr.keys; let correct = 0;
    keys.forEach((k) => {
      const ok = isOk(k, dr.picks[k]); if (ok) correct++;
      const o = q[k] || { t: 0, w: 0 }; o.t++; if (!ok) o.w++; o.ok = ok; o.last = dr.picks[k] == null ? null : dr.picks[k]; o.d = today(); if (!ok) o.m = false; q[k] = o;
    });
    S.set(K('q'), q);
    const res = { title: dr.title, keys, picks: dr.picks, correct, total: keys.length, date: today(), min: Math.round(dr.used / 60000) };
    S.set(K('last.' + curKind), res);
    S.set(K('log'), S.get(K('log'), []).concat([{ kind: curKind, title: dr.title, date: res.date, correct, total: res.total, score: Math.round((correct / res.total) * 1000) / 10, min: res.min }]).slice(-80));
    S.set(K('draft.' + curKind), null); location.hash = '#result';
  }

  // ───────── 채점 결과 ─────────
  let resFilter = 'wrong';
  function result() {
    const r = S.get(K('last.' + curKind), null); if (!r) { location.hash = '#home'; return; }
    const score = Math.round((r.correct / r.total) * 1000) / 10;
    const bySub = {};
    r.keys.forEach((k) => { const s = parse(k).s; bySub[s] = bySub[s] || [0, 0]; bySub[s][1]++; if (isOk(k, r.picks[k])) bySub[s][0]++; });
    const wrongK = r.keys.filter((k) => !isOk(k, r.picks[k])); const flagK = r.keys.filter((k) => FL()[k]);
    const bothK = [...new Set(wrongK.concat(flagK))];
    const show = resFilter === 'wrong' ? wrongK : resFilter === 'flag' ? flagK : r.keys;
    root.innerHTML = `
      <h2 class="r-h">${esc(r.title)} 결과 <small>${esc(r.date)}${r.min ? ` · ${r.min}분` : ''}</small></h2>
      <div class="gt-result">
        <div class="gt-total"><b>${score}</b><span>점 (100점 만점 환산)</span></div>
        <div class="gt-secsc"><b>${r.correct}/${r.total}</b><span>정답 문항</span><i style="--w:${pct(r.correct, r.total)}%"></i></div>
        <div class="gt-secsc"><b>${r.total - r.correct}</b><span>틀린 문항</span></div>
        <div class="gt-secsc"><b>${flagK.length}</b><span>★ 헷갈림</span></div>
      </div>
      ${Object.keys(bySub).length > 1 ? `<div class="gt-tip"><h3>과목별</h3><div class="gt-types">${Object.entries(bySub).map(([s, v]) => `<span class="${v[0] < v[1] ? 'r' : 'g'}">${SUBN[s]} <b>${v[0]}/${v[1]}</b> (${pct(v[0], v[1])}점)</span>`).join('')}</div></div>` : ''}
      <div class="gt-bar"><button type="button" class="gt-btn main" id="rs-wrong"${wrongK.length ? '' : ' disabled'}>틀린 문제만 다시 풀기 (${wrongK.length})</button>
        <button type="button" class="gt-btn" id="rs-both"${bothK.length ? '' : ' disabled'}>틀린+★ 다시 풀기 (${bothK.length})</button><a class="gt-btn" href="#home">풀기 화면으로</a></div>
      ${FILTER.modes('data-rf', [['wrong', '틀린 문제', wrongK.length], ['flag', '★ 헷갈림', flagK.length], ['all', '전체', r.keys.length]], resFilter)}
      <div class="fr-grid">${r.keys.map((x, i) => `<a class="fr-gn ${isOk(x, r.picks[x]) ? 'ok' : 'no'}${FL()[x] ? ' fl' : ''}" href="#result" data-jump="${x}">${i + 1}</a>`).join('')}</div>
      <div class="fr-list">${show.length ? show.map((k) => itemHtml(k, r.picks[k])).join('') : '<p class="gt-muted">해당하는 문제가 없어요.</p>'}</div>
      <div class="ad-slot" data-ad="result"></div>`;
    FILTER.bind(root, 'data-rf', (v) => { resFilter = v; result(); });
    root.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); resFilter = 'all'; const k = a.dataset.jump; result(); const el = document.querySelector(`.fr-item[data-k="${k}"]`); if (el) el.scrollIntoView(); }));
    const redo = (keys, t) => { if (!keys.length) return; start(t, keys); };
    $('#rs-wrong').addEventListener('click', () => redo(wrongK, `${r.title} · 틀린 문제 다시 풀기`));
    $('#rs-both').addEventListener('click', () => redo(bothK, `${r.title} · 틀린+★ 다시 풀기`));
  }
  const itemHtml = (k, pick, extra) => {
    const a = ansOf(k); const ok = isOk(k, pick);
    return `<article class="fr-item ${ok ? 'ok' : 'no'}" data-k="${k}">
      <div class="fr-qlabel"><b>${esc(labelOf(k))}</b>${flagBtn(k)}${extra || ''}</div>
      <img class="fr-img" src="${imgOf(k)}" loading="lazy" alt="${esc(labelOf(k))} 문제">
      <div class="fr-fb ${ok ? 'g' : 'r'}">${pick == null ? '<b>안 풂</b>' : `내 답 <b>${NUM[pick - 1]}</b>`} · 정답 <b>${a === 0 ? '전원 정답 처리' : NUM[a - 1]}</b> ${ok ? '✓' : '✗'}</div></article>`;
  };

  // ───────── 오답 ─────────
  let wCat = 'all', wFlagOnly = false, wMore = 15;
  function wrong() {
    const q = Q(); const fl = FL();
    const wrongK = ALL.filter((k) => inKind(k) && q[k] && q[k].ok === false && !q[k].m);
    const flagK = [...new Set(Object.keys(fl).filter((k) => ALL.includes(k) && inKind(k)))];
    const pool = wFlagOnly ? flagK : wrongK;
    const subs = Object.keys(SUBN).filter((s) => pool.some((k) => parse(k).s === s));
    if (wCat !== 'all' && !subs.includes(wCat)) wCat = 'all';
    const list = pool.filter((k) => wCat === 'all' || parse(k).s === wCat).sort((a, b) => (EX[parse(b).e].year - EX[parse(a).e].year) || a.localeCompare(b, undefined, { numeric: true }));
    root.innerHTML = `
      <h2 class="r-h">오답 <small>틀린 문제와 ★ 헷갈림 표시한 문제를 과목별로</small></h2>
      ${kindChips('data-wk')}
      ${FILTER.modes('data-wm', [['0', '틀린 문제', wrongK.length], ['1', '★ 헷갈림', flagK.length]], wFlagOnly ? '1' : '0')}
      <div class="f-filters">${FILTER.pick('data-wc', '과목', [['all', `전체 (${pool.length})`]].concat(subs.map((x) => [x, `${SUBN[x]} (${pool.filter((k) => parse(k).s === x).length})`])), wCat)}</div>
      <div class="gt-bar"><button type="button" class="gt-btn main" id="w-redo"${list.length ? '' : ' disabled'}>이 목록 다시 풀기 (${Math.min(list.length, 60)}문제)</button><span class="gt-muted">다시 맞히면 오답에서 빠져요. 외웠으면 '해결 ✓'를 눌러 지울 수도 있어요.</span></div>
      <div class="fr-list">${list.length ? list.slice(0, wMore).map((k) => itemHtml(k, q[k] ? q[k].last : null, `<button type="button" class="gt-btn fr-solve" data-solve="${k}">해결 ✓</button>`)).join('') : '<p class="gt-muted">아직 틀린 문제가 없어요. 기출을 풀어 보세요.</p>'}</div>
      ${list.length > wMore ? `<div class="gt-bar center"><button type="button" class="gt-btn" id="w-more">더 보기 (${list.length - wMore}문항 남음)</button></div>` : ''}`;
    FILTER.bind(root, 'data-wm', (v) => { wFlagOnly = v === '1'; wMore = 15; wrong(); });
    FILTER.bind(root, 'data-wc', (v) => { wCat = v; wMore = 15; wrong(); });
    const mb = $('#w-more'); if (mb) mb.addEventListener('click', () => { wMore += 15; wrong(); });
    $('#w-redo').addEventListener('click', () => { if (!list.length) return; if (draftOf() && !confirm('풀던 시험이 있어요. 지우고 새로 시작할까요?')) return; start(`${wFlagOnly ? '★ 헷갈림' : '오답'} 다시 풀기${wCat === 'all' ? '' : ' · ' + SUBN[wCat]}`, rnd(list).slice(0, 60)); });
    root.querySelectorAll('[data-solve]').forEach((b) => b.addEventListener('click', () => { const qq = Object.assign({}, Q()); const k = b.dataset.solve; if (qq[k]) { qq[k].m = true; qq[k].ok = true; } S.set(K('q'), qq); wrong(); }));
  }

  // ───────── 기록 ─────────
  function stats() {
    const q = Q();
    const table = (kind) => {
      const rows = Object.keys(SUBN).map((sid) => {
        const ks = ALL.filter((k) => parse(k).s === sid && kindOf(k) === kind); if (!ks.length) return null;
        let t = 0, w = 0, done = 0; ks.forEach((k) => { if (q[k] && q[k].t) { done++; t += q[k].t; w += q[k].w; } });
        return { sid, n: ks.length, done, acc: t ? pct(t - w, t) : null };
      }).filter(Boolean);
      return `<h3 class="gt-sh">${KIND[kind]}</h3><table class="gt-tbl"><thead><tr><th>과목</th><th>전체 문항</th><th>푼 문항</th><th>정답률(누적)</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${SUBN[r.sid]}</td><td>${r.n}</td><td>${r.done} (${pct(r.done, r.n)}%)</td><td>${r.acc == null ? '-' : r.acc + '%'}</td></tr>`).join('')}</tbody></table>`;
    };
    const lg = logs().slice().reverse();
    root.innerHTML = `
      <h2 class="r-h">${KIND[curKind]} 기록 <small>푼 횟수와 정답률</small></h2>
      ${table(curKind)}
      <h3 class="gt-sh">최근 푼 기록 <small>${lg.length}건</small></h3>
      ${lg.length ? `<table class="gt-tbl"><thead><tr><th>날짜</th><th>시험·과목</th><th>정답</th><th>점수</th><th>시간</th></tr></thead><tbody>${lg.slice(0, 30).map((l) => `<tr><td>${esc(l.date)}</td><td>${esc(l.title)}</td><td>${l.correct}/${l.total}</td><td><b>${l.score}</b></td><td>${l.min ? l.min + '분' : '-'}</td></tr>`).join('')}</tbody></table>` : '<p class="gt-muted">아직 푼 기록이 없어요.</p>'}
      <div class="gt-bar"><button type="button" class="gt-btn" id="st-reset">${KIND[curKind]} 기록 모두 지우기</button></div>`;
    $('#st-reset').addEventListener('click', () => {
      if (!confirm(`${KIND[curKind]}의 푼 기록·오답·★ 표시를 모두 지울까요? 되돌릴 수 없어요.`)) return;
      const keep = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => !inKind(k)));
      S.set(K('q'), keep(Q())); S.set(K('flags'), keep(FL()));
      S.set(K('log'), (S.get(K('log'), []) || []).filter((l) => !logs().includes(l)));
      S.set(K('draft.' + curKind), null); S.set(K('last.' + curKind), null); stats();
    });
  }

  window.addEventListener('hashchange', render);
  S.onChange(() => { if (route() !== 'quiz') render(); });
  render();
})();
