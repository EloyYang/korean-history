(function () {
  // 복습 대상 기준: 출제빈도 ★★ 이상 + 난이도 하·중
  const MIN_STARS = 2;
  const EASY = ['하', '중'];

  const ERAS = window.ERAS || [];
  const GICHUL = window.GICHUL || {};
  const EXAM = window.EXAM || {};
  const EX = window.currentExam();
  window.setupExamHeader(document.getElementById("quiz") ? "quiz" : "review");
  const LOG = window.ATTEMPTS.all();
  const QKEY = (window.QUIZ_KEYS || {})[EX.id] || {};
  const imgOf = (r, n) => EX.img.replace('{r}', r).replace('{n}', String(n).padStart(2, '0'));
  document.title = `오답 노트 · ${EX.name}`;
  const eraName = (id) => (ERAS.find((e) => e.id === id) || { name: id || '기타' }).name;
  const eraOrder = (id) => { const i = ERAS.findIndex((e) => e.id === id); return i < 0 ? 99 : i; };
  // 시대별 약점은 교과서식 시대 구분으로 묶어서 보여 준다 (4~7세기 → 삼국 등)
  const PERIODS = [
    ['선사 시대', ['prehistoric']], ['고조선', ['gojoseon']], ['여러 나라', ['states']],
    ['삼국', ['c4', 'c5', 'c6', 'c7']], ['통일신라·발해', ['nambuk']], ['후삼국', ['husamguk']],
    ['고려 전기', ['goryeo1']], ['고려 후기', ['goryeo2']], ['조선 전기', ['joseon1', 'imjin']],
    ['조선 후기·개항기', ['horan', 'gaehang']], ['일제 강점기', ['colonial']], ['광복 이후', ['modern']],
  ];
  const periodOf = (id) => { const i = PERIODS.findIndex((p) => p[1].includes(id)); return i < 0 ? PERIODS.length : i; };
  const periodName = (i) => (PERIODS[i] ? PERIODS[i][0] : '기타');
  const periodTip = (i) => (PERIODS[i] ? PERIODS[i][1].map(eraName).join(', ') : '분류 정보 없음');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('khmap.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('khmap.' + k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
  };
  const state = { scope: store.get('reviewScope', 'target'), hideDone: store.get('reviewHideDone', false), openAll: store.get('reviewOpenAll', false), eraRound: store.get('reviewEraRound', 'all'), period: store.get('reviewPeriod', 'all'), weakAll: false };
  // 필터는 모두 여러 개 선택 가능 (누르면 선택, 다시 누르면 해제 / 아무것도 없으면 전체)
  const asSet = (v, legacyAll) => new Set(Array.isArray(v) ? v.map(String) : v == null || v === legacyAll ? [] : [String(v)]);
  state.views = asSet(store.get('reviewViews', store.get('reviewEraRound', 'all')), 'all');
  state.periods = asSet(store.get('reviewPeriods', store.get('reviewPeriod', 'all')), 'all');
  state.scopes = asSet(store.get('reviewScopes', (() => { const o = store.get('reviewScope', 'target'); return o === 'all' ? ['target', 'other'] : o; })()), null);
  const toggle = (set, v) => { v = String(v); if (set.has(v)) set.delete(v); else set.add(v); };
  const saveFilters = () => { store.set('reviewViews', [...state.views]); store.set('reviewPeriods', [...state.periods]); store.set('reviewScopes', [...state.scopes]); };
  const WEAK_TOP = 10;
  const openSet = new Set();
  const MKEY = window.ATTEMPTS.key('mastered');
  const mastered = new Set(window.UserStore.get(MKEY, []));
  // 내가 직접 추가한 약한 개념 [{id, era, text, memo, ref, done, t}]
  const WKEY = window.ATTEMPTS.key('myWeak');
  const myWeak = () => window.UserStore.get(WKEY, []) || [];
  const saveWeak = (list) => window.UserStore.set(WKEY, list);
  let weakForm = null; // null = 닫힘, '' = 새로 추가, id = 수정 중
  // 직접 추가 검색용: 모든 기출 포인트
  const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const PT_INDEX = Object.entries(GICHUL).flatMap(([e, g]) => (g.pts || []).map((p, i) => ({
    key: `${e}#${i}`, e, i, html: p[1], plain: strip(p[1]), stars: Math.min(p[0], 3), era: eraName(e),
  })));
  const ptOf = (key) => PT_INDEX.find((x) => x.key === key);
  // 기출 문장(정답 선지·주제)도 검색되게: 해당 포인트에 붙여 둔다
  Object.values(EXAM).forEach((rows) => rows.forEach((r) => {
    if (!(r[7] >= 0)) return; const x = ptOf(`${r[6]}#${r[7]}`); if (x) x.extra = (x.extra || '') + ' ' + r[2] + ' ' + (r[8] || '') + ' ' + (r[5] || '');
  }));
  const norm = (t) => t.toLowerCase().replace(/[\s·.,()〈〉<>'"‘’“”\-–—:/]/g, '');
  function searchPts(q) {
    const toks = q.trim().split(/\s+/).map(norm).filter(Boolean);
    if (!toks.length) return [];
    return PT_INDEX.map((x) => {
      const main = norm(x.plain + x.era + periodName(periodOf(x.e)));
      const hay = main + norm(x.extra || '');
      if (!toks.every((t) => hay.includes(t))) return null;
      const inMain = toks.filter((t) => main.includes(t)).length;
      return { x, sub: inMain < toks.length, score: inMain * 100 + x.stars * 10 };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12).map((r) => ({ ...r.x, sub: r.sub }));
  }
  // 관련 문제 검색용: 모든 회차 문항 (주제·정답 선지·풀이 단서)
  const SOLVE_ALL = window.SOLVE || {};
  const myWrong = new Set(LOG.flatMap((l) => l.wrong.map((n) => `${l.round}-${n}`)));
  const Q_INDEX = Object.entries(EXAM).flatMap(([r, rows]) => rows.map((row) => {
    const id = `${r}-${row[0]}`; const sv = SOLVE_ALL[id];
    return { id, round: +r, num: row[0], theme: row[2], ans: row[5] || '', pt: row[7] >= 0 ? `${row[6]}#${row[7]}` : '',
      hay: norm([row[2], row[5], row[8], sv ? sv.clue.join(' ') + strip(sv.how) : ''].join(' ')), head: norm(row[2] + (row[5] || '')) };
  }));
  function searchQs(q) {
    const m = q.trim().match(/^(\d{2})\s*회?\s*(\d{1,2})?\s*번?$/);
    if (m) return Q_INDEX.filter((x) => x.round === +m[1] && (!m[2] || x.num === +m[2])).slice(0, 50);
    const toks = q.trim().split(/\s+/).map(norm).filter(Boolean);
    if (!toks.length) return [];
    return Q_INDEX.filter((x) => toks.every((t) => x.hay.includes(t)))
      .map((x) => ({ x, score: toks.filter((t) => x.head.includes(t)).length * 100 + (myWrong.has(x.id) ? 50 : 0) + x.round }))
      .sort((a, b) => b.score - a.score).slice(0, 15).map((r) => r.x);
  }
  const qLabel = (id) => { const [r, n] = id.split('-'); return `${r}회 ${n}번`; };
  const WMKEY = window.ATTEMPTS.key('weakMemo');
  const weakMemo = () => window.UserStore.get(WMKEY, {}) || {};
  let memoOpen = null; // 메모 편집 중인 틀린 개념 key
  const hlTok = (html, q) => q.trim().split(/\s+/).filter(Boolean).reduce((h, t) => h.split(/(<[^>]+>)/).map((seg) => (seg.startsWith('<') ? seg : seg.split(t).join(`<u>${t}</u>`))).join(''), html);

  // 문항 정보 → 객체
  const Q = (round, num) => {
    const row = (EXAM[round] || []).find((x) => x[0] === num);
    if (!row) return { round, num, id: `${round}-${num}`, era: '', theme: '분류 정보 없음', stars: 0, diff: '-', ans: '', pEra: '', pIdx: -1, ex: '', pt: QKEY[round] ? QKEY[round].pt[num - 1] : 0, target: true, unknown: true };
    const [, era, theme, stars, diff, ans, pEra, pIdx, ex, pt] = row;
    return { round, num, era, theme, stars, diff, ans, pEra, pIdx, ex, pt, id: `${round}-${num}`,
      target: stars >= MIN_STARS && EASY.includes(diff) };
  };
  const wrongs = LOG.flatMap((l) => l.wrong.map((n) => ({ ...Q(l.round, n), time: (l.times || {})[n] }))).filter((q) => !q.missing);
  const mmss = (s) => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + ':' + String(x).padStart(2, '0'); };
  const targets = wrongs.filter((q) => q.target);
  // 기출 풀기에서 '헷갈림' 표시한 문제
  const flagKey = (r) => window.ATTEMPTS.key('flag.' + r);
  const flagRounds = () => Object.keys(QKEY).map(Number);
  const flagSet = () => new Set(flagRounds().flatMap((r) => (window.UserStore.get(flagKey(r), []) || []).map((n) => `${r}-${n}`)));
  const flagged = () => flagRounds().sort((a, b) => b - a).flatMap((r) => (window.UserStore.get(flagKey(r), []) || []).map((n) => {
    const l = LOG.find((x) => x.round === r);
    const st = !l ? 'none' : l.wrong.includes(n) ? 'wrong' : 'right';
    return { ...Q(r, n), time: l && (l.times || {})[n], flagSt: st, flagOnly: st !== 'wrong' };
  }));

  const starTxt = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
  const why = (q) => [q.stars < MIN_STARS ? `빈도 ${'★'.repeat(q.stars)}` : '', !EASY.includes(q.diff) ? `난이도 ${q.diff}` : ''].filter(Boolean).join(' · ');

  const FULL = window.WRONG_Q || {};
  const SOLVE = window.SOLVE || {};
  const NUMS = '①②③④⑤';
  // 지문 속 단서에 형광펜
  const markClues = (html, clues) => (clues || []).reduce((h, c) => h.split(esc(c)).join(`<mark class="clue">${esc(c)}</mark>`), html);

  // 기출 풀기에서 남긴 메모
  function memoView(q) {
    const m = (window.UserStore.get(window.ATTEMPTS.key('memo.' + q.round), {}) || {})[q.num];
    const block = (m2) => `${m2.q ? `<p class="m-q">${esc(m2.q)}</p>` : ''}${(m2.o || []).some(Boolean) ? `<ul>${m2.o.map((t, i) => (t ? `<li><b>${NUMS[i]}</b> ${esc(t)}</li>` : '')).join('')}</ul>` : ''}`;
    const has = (m2) => m2 && (m2.q || (m2.o || []).some(Boolean));
    const olds = (window.UserStore.get(window.ATTEMPTS.key('memoOld.' + q.round), []) || []).filter((x) => x.memos && has(x.memos[q.num])).reverse();
    if (!has(m) && !olds.length) return '';
    return `<div class="rq-memo">${has(m) ? `<p class="sv-h">내 메모 <small>최근 풀이</small></p>${block(m)}` : ''}${olds.length ? `<details class="rq-oldmemo"${has(m) ? '' : ' open'}><summary>이전 풀이 메모 ${olds.length}개</summary>${olds.map((x) => `<div class="q-oldmemo-item"><p class="d">${esc(x.date || '')}${x.score != null ? ` · ${x.score}점 때` : ''}</p>${block(x.memos[q.num])}</div>`).join('')}</details>` : ''}</div>`;
  }

  // 내가 고른 번호: 기출 풀기로 채점한 기록에만 있다 (null = 기록 없음, 0 = 고르지 않음)
  const pickedOf = (r, n) => { const l = LOG.find((x) => x.round === r); return l && l.answers ? (l.answers[n] || 0) : null; };
  // 선지별 포인트: 자세한 설명(OPTX) 우선, 없으면 예전 짧은 정리
  const OPTX = window.OPTX || {};
  function optList(q, sv, f, img, now) {
    const ox = OPTX[q.id]; const E = esc; const right = QKEY[q.round] ? QKEY[q.round].ans[q.num - 1] : f ? f.ans + 1 : 0;
    const picked = now !== undefined ? now : pickedOf(q.round, q.num);
    const PL = now !== undefined ? '이번에 고른 답' : '내가 고른 답', NONE = now !== undefined ? '모르겠어요' : '고르지 않음';
    // 내가 고른 답: 틀렸으면 무엇을 골랐고 왜 아닌지 먼저 보여 준다
    const pickBox = () => {
      if (picked == null) return '';
      if (!picked) return `<div class="sv-pick none"><p><b>${PL}</b> ${NONE} <span>→ 정답 ${NUMS[right - 1]}</span></p></div>`;
      if (picked === right) return `<div class="sv-pick ok"><p><b>${PL}</b> ${NUMS[picked - 1]} <span>정답을 골랐어요</span></p></div>`;
      const mine = ox ? ox[picked - 1].split('|') : null, ans = ox ? ox[right - 1].split('|') : null;
      return `<div class="sv-pick"><p><b>${PL}</b> ${NUMS[picked - 1]}${mine ? ' ' + E(mine[0]) : ''} <span>→ 정답 ${NUMS[right - 1]}${ans ? ' ' + E(ans[0]) : ''}</span></p>${mine ? `<p class="why"><b>왜 아닌가</b> ${E(mine[1] || '')}</p>` : ''}</div>`;
    };
    const cls = (i) => (i + 1 === right ? 'ans' : '') + (picked && i + 1 === picked && picked !== right ? ' mine' : '');
    const tag = (i) => (i + 1 === right ? ' <em>정답</em>' : '') + (picked && i + 1 === picked && picked !== right ? ' <em class="mine">내가 고름</em>' : '');
    if (ox) return `${pickBox()}<p class="sv-h">선지별 포인트</p><ol class="sv-opts ox">${ox.map((o, i) => { const [t, e] = o.split('|'); return `<li class="${cls(i)}"><span class="n">${NUMS[i]}</span><span><b>${E(t)}</b>${tag(i)}<small>${E(e || '')}</small></span></li>`; }).join('')}</ol>`;
    if (img && f) return `${pickBox()}<p class="sv-h">선지별 정리</p><ol class="sv-opts">${f.opts.map((o, i) => `<li class="${cls(i)}"><span class="n">${NUMS[i]}</span><span>${esc(o)}${tag(i)}<small>${sv.opts ? sv.opts[i] : ''}</small></span></li>`).join('')}</ol>`;
    return img && sv.opts ? `${pickBox()}<p class="sv-h">선지별 정리</p><ol class="sv-opts">${sv.opts.map((o, i) => `<li class="${cls(i)}"><span class="n">${NUMS[i]}</span><span>${o}${tag(i)}</span></li>`).join('')}</ol>` : pickBox();
  }
  // 시기·나라·왕(정부) 한 줄 요약
  const QMETA = window.QMETA || {};
  function metaHtml(r, n) {
    const m = (QMETA[r] || [])[n - 1]; if (!m) return '';
    const [when, state, king] = m.split('|');
    const cell = (k, v) => (v ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '');
    return `<dl class="sv-meta">${cell('시기', when)}${cell('나라', state)}${cell('왕·정부', king)}</dl>`;
  }
  // ── 다시 풀기: 정답을 가린 채 한 문제씩 풀고 바로 채점. 결과는 {id: {ok, no, last, t}} 로 남긴다
  const RKEY = window.ATTEMPTS.key('retry');
  const retryLog = () => window.UserStore.get(RKEY, {}) || {};
  const retryBadge = (id) => { const x = retryLog()[id]; return x ? `<span class="rq-retry ${x.last}" title="다시 풀기 기록 — 마지막에는 ${x.last === 'ok' ? '맞힘' : '틀림'}">다시 풀기 ✓${x.ok || 0} ✗${x.no || 0}</span>` : ''; };
  let rt = null; // { ids, i, picks: {id: 고른 번호(0 = 모르겠어요)}, title, end }
  let lastShown = [];
  const rtRight = (id) => { const [r, n] = id.split('-').map(Number); return QKEY[r] ? QKEY[r].ans[n - 1] : 0; };
  function startRetry(ids, title, shuffle) {
    ids = [...new Set(ids)].filter(rtRight); if (!ids.length) return;
    if (shuffle) for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    closeQView();
    rt = { ids, i: 0, picks: {}, title: title || '', end: false };
    let box = document.getElementById('rt');
    if (!box) { box = document.createElement('div'); box.id = 'rt'; box.className = 'qv rt'; document.body.appendChild(box); }
    box.hidden = false; document.body.classList.add('qv-on'); renderRetry(); box.scrollTop = 0;
  }
  function closeRetry() { rt = null; const b = document.getElementById('rt'); if (b) { b.hidden = true; b.innerHTML = ''; } document.body.classList.remove('qv-on'); rerender(); }
  function rtPick(n) {
    const id = rt.ids[rt.i]; if (id in rt.picks) return;
    rt.picks[id] = n; const ok = n === rtRight(id);
    const L = retryLog(); const o = L[id] || { ok: 0, no: 0 };
    if (ok) o.ok = (o.ok || 0) + 1; else o.no = (o.no || 0) + 1;
    o.last = ok ? 'ok' : 'no'; o.t = Date.now(); L[id] = o; window.UserStore.set(RKEY, L);
    renderRetry(); document.querySelector('#rt .rt-res')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function rtNext() {
    if (!(rt.ids[rt.i] in rt.picks)) return;
    if (rt.i < rt.ids.length - 1) rt.i++; else rt.end = true;
    renderRetry(); document.getElementById('rt').scrollTop = 0;
  }
  function renderRetry() {
    const box = document.getElementById('rt'); if (!box || !rt) return;
    const okIds = rt.ids.filter((id) => id in rt.picks && rt.picks[id] === rtRight(id));
    const noIds = rt.ids.filter((id) => id in rt.picks && rt.picks[id] !== rtRight(id));
    const top = (sub) => `<div class="qv-top"><div class="qv-ttl"><b>다시 풀기${rt.title ? ' · ' + esc(rt.title) : ''}</b><span>${sub}</span></div><button type="button" class="qv-x" data-rt-close aria-label="닫기">✕</button></div>`;
    if (rt.end) {
      const row = (id) => { const q = Q(...id.split('-').map(Number)); return `<li><button type="button" data-rt-goto="${id}">${qLabel(id)}</button> ${esc(q.theme)}</li>`; };
      box.innerHTML = `<div class="qv-box rt-box">${top(`${rt.ids.length}문항을 모두 풀었어요`)}
        <div class="rt-score"><b>${okIds.length}</b> / ${rt.ids.length} <span>맞힘 · 정답률 ${Math.round((okIds.length / rt.ids.length) * 100)}%</span></div>
        ${noIds.length ? `<p class="sv-h">또 틀린 문제 ${noIds.length}개 <small>— 번호를 누르면 오답 노트의 그 문제로 가요</small></p><ul class="rt-list no">${noIds.map(row).join('')}</ul>` : '<p class="rt-all">전부 맞혔어요 🎉</p>'}
        ${okIds.length ? `<p class="sv-h">이번에 맞힌 문제 ${okIds.length}개</p><ul class="rt-list">${okIds.map(row).join('')}</ul>` : ''}
        <div class="rt-btns">${noIds.length ? `<button type="button" class="rt-go" data-rt-again>↻ 또 틀린 ${noIds.length}문항만 다시</button>` : ''}
          ${okIds.some((id) => !mastered.has(id)) ? `<button type="button" data-rt-master>맞힌 ${okIds.length}문항 ‘외웠어요’로 표시</button>` : ''}
          <button type="button" data-rt-close>닫기</button></div></div>`;
      return;
    }
    const id = rt.ids[rt.i]; const [r, n] = id.split('-').map(Number); const q = Q(r, n);
    const right = rtRight(id); const answered = id in rt.picks; const pk = rt.picks[id];
    const sv = SOLVE[id]; const prev = retryLog()[id]; const first = pickedOf(r, n);
    const optBtn = (i) => `<button type="button" data-rt-pick="${i}" ${answered ? 'disabled' : ''} class="${answered && i === right ? 'ans' : ''}${answered && i === pk && pk !== right ? ' mine' : ''}">${NUMS[i - 1]}</button>`;
    box.innerHTML = `<div class="qv-box rt-box">${top(`${rt.i + 1} / ${rt.ids.length} · 맞힘 ${okIds.length} · 틀림 ${noIds.length}`)}
      <div class="rt-bar"><span style="width:${((rt.i + (answered ? 1 : 0)) / rt.ids.length) * 100}%"></span></div>
      <div class="rq open">
        <div class="rq-head"><span class="rq-no">${r}회 ${n}번</span>${q.pt ? `<span class="rq-pt">${q.pt}점</span>` : ''}${answered ? `<span class="rq-tag">${esc(q.theme)}</span>` : ''}${!answered && prev ? retryBadge(id) : ''}</div>
        <img class="rq-img" src="${imgOf(r, n)}" alt="${r}회 ${n}번 문제">
        <div class="rt-opts">${[1, 2, 3, 4, 5].map(optBtn).join('')}<button type="button" class="dk" data-rt-pick="0" ${answered ? 'disabled' : ''}>모르겠어요</button></div>
        ${answered ? `<div class="rt-res ${pk === right ? 'ok' : 'no'}"><b>${pk === right ? '정답이에요 ✓' : pk ? '틀렸어요 ✗' : '정답 확인'}</b> 정답 ${NUMS[right - 1]}${q.ans ? ' ' + esc(q.ans) : ''}${first != null && first !== right ? ` <small>· 처음 풀 때 고른 답 ${first ? NUMS[first - 1] : '없음'}</small>` : ''}
            <button type="button" class="rt-go" data-rt-next>${rt.i < rt.ids.length - 1 ? '다음 문제 ▶' : '결과 보기 ▶'}</button></div>
          <div class="rq-solve"><div class="rq-solve-body">${metaHtml(r, n)}
            ${sv ? `<p class="sv-h">지문에서 잡을 단서</p><p class="sv-clue">${sv.clue.map((c) => `<mark class="clue">${esc(c)}</mark>`).join(' ')}</p><p class="sv-h">정답까지 생각의 순서</p><p class="sv-how">${sv.how}</p>${optList(q, sv, FULL[id], true, pk)}` : ''}</div></div>
          ${memoView(q)}` : `<p class="rt-hint">번호를 누르면 바로 채점돼요 · 키보드 1~5, 모르겠으면 0</p>`}
      </div></div>`;
  }

  function qCard(q) {
    const done = mastered.has(q.id);
    const f = FULL[q.id];
    const sv = SOLVE[q.id];
    const img = QKEY[q.round] ? `<img class="rq-img" src="${imgOf(q.round, q.num)}" alt="${q.round}회 ${q.num}번 문제" loading="lazy">` : '';
    const body = img ? '' : f ? f.body.map(([k, t]) => {
      const h = markClues(esc(t), sv && sv.clue);
      return k === 'cap' ? `<p class="rq-cap">${h}</p>` : k === 'say' ? `<p class="rq-say">${h}</p>` : `<p>${h}</p>`;
    }).join('') : (q.ex ? `<p>${esc(q.ex)}</p>` : '');
    const opts = img ? '' : f ? `<ol class="rq-opts">${f.opts.map((o, i) => `
      <li class="${i === f.ans ? 'ans' : ''}"><span class="n">${NUMS[i]}</span><span class="t">${esc(o)}</span>${sv && sv.opts ? `<span class="why">${sv.opts[i]}</span>` : ''}</li>`).join('')}</ol>` : '';
    const open = state.openAll || openSet.has(q.id);
    return `
      <li class="rq${done ? ' done' : ''}${q.target ? '' : ' off'}${open ? ' open' : ''}" data-id="${q.id}">
        <div class="rq-head">
          <span class="rq-no">${q.round}회 ${q.num}번</span>
          <span class="rq-tag">${esc(q.theme)}</span>
          <span class="rq-star" title="출제빈도">${starTxt(q.stars)}</span>
          <span class="rq-diff d-${esc(q.diff)}">난이도 ${esc(q.diff)}</span>
          ${q.pt ? `<span class="rq-pt">${q.pt}점</span>` : ''}
          ${q.time ? `<span class="rq-time${q.slowSt ? ' slow' : ''}">${q.slowSt ? '⏱ ' : '풀이 '}${mmss(q.time)}${q.slowSt && q.avg ? ` <small>(평균 ${mmss(q.avg)}의 ${(q.time / q.avg).toFixed(1)}배${q.slowSt === 'right' ? ' · 맞힘' : ' · 틀림'})</small>` : ''}</span>` : ''}
          ${FLAGS.has(q.id) ? `<button type="button" class="rq-flag" data-unflag="${q.id}" title="헷갈림 표시 지우기">🚩 헷갈림${q.flagSt === 'right' ? ' · 맞힘' : q.flagSt === 'none' ? ' · 채점 전' : ''} ✕</button>` : ''}
          ${retryBadge(q.id)}
          ${QKEY[q.round] ? `<button type="button" class="rq-again" data-retry="${q.id}" title="정답을 가리고 이 문제만 다시 풀기">↻ 다시 풀기</button>` : ''}
          <label class="rq-done"><input type="checkbox" ${done ? 'checked' : ''}> 외웠어요</label>
        </div>
        ${img || `${f && f.stem ? `<p class="rq-stem">${esc(f.stem)}</p>` : ''}<div class="rq-body">${body}</div>`}
        ${opts || (!img && q.ans ? `<p class="rq-ans"><span>정답</span><q>${esc(q.ans)}</q></p>` : '')}
        ${img && !sv ? `<div class="rq-solve"><button class="rq-toggle" type="button">${open ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾'}</button><div class="rq-solve-body">${QKEY[q.round] ? `<p class="sv-h">정답</p><p class="sv-how"><b>${NUMS[QKEY[q.round].ans[q.num - 1] - 1]}</b> ${q.ans ? esc(q.ans) : ''}</p>` : ''}<p class="sv-h">정답 도출 포인트</p><p class="sv-how">아직 정리 전이에요 — Claude에게 이 문항의 풀이 포인트를 요청해 주세요.</p></div></div>` : ''}
        ${sv ? `<div class="rq-solve">
          <button class="rq-toggle" type="button">${open ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾'}</button>
          <div class="rq-solve-body">
            ${metaHtml(q.round, q.num)}
            <p class="sv-h">지문에서 잡을 단서</p>
            <p class="sv-clue">${sv.clue.map((c) => `<mark class="clue">${esc(c)}</mark>`).join(' ')}</p>
            <p class="sv-h">정답까지 생각의 순서</p>
            <p class="sv-how">${sv.how}</p>
            ${optList(q, sv, f, img)}
          </div></div>` : ''}
        ${memoView(q)}
        ${q.target || q.flagOnly ? '' : `<p class="rq-why">복습 대상 제외 — ${why(q)}</p>`}
      </li>`;
  }

  // 고민 시간이 길었던 문제: 그 회차 평균의 1.8배 이상이면서 1분 넘게, 또는 3분 이상
  const SLOW_X = 1.8, SLOW_MIN = 60, SLOW_ABS = 180;
  const slowOf = (logs) => logs.filter((l) => l.times && Object.keys(l.times).length).flatMap((l) => {
    const n = (QKEY[l.round] ? QKEY[l.round].ans.length : 50); const avg = Object.values(l.times).reduce((a, b) => a + b, 0) / n;
    return Object.entries(l.times).filter(([, t]) => (t > avg * SLOW_X && t > SLOW_MIN) || t >= SLOW_ABS).map(([k, t]) => {
      const num = +k; const st = l.wrong.includes(num) ? 'wrong' : 'right';
      return { ...Q(l.round, num), time: t, avg, slowSt: st, flagOnly: st !== 'wrong', flagSt: st };
    });
  }).sort((a, b) => b.time - a.time);
  let FLAGS = new Set();
  function render() {
    FLAGS = flagSet();
    // 보기 범위: 전체 / 날짜별(d:YYYY-MM-DD) / 회차별(79)
    const dates = [...new Set(LOG.map((l) => l.date).filter(Boolean))].sort().reverse();
    const eraRounds = LOG.map((l) => l.round).sort((a, b) => b - a);
    [...state.views].forEach((v) => { if (!(v.startsWith('d:') ? dates.includes(v.slice(2)) : eraRounds.includes(+v))) state.views.delete(v); });
    const anyView = state.views.size > 0;
    const inView = (l) => !anyView || state.views.has('d:' + l.date) || state.views.has(String(l.round));
    const FLOG = LOG.filter(inView);
    const shortDate = (d) => d.replace(/^\d{4}-/, '').replace('-', '/');
    const viewName = !anyView ? '전체 기록' : [...dates.filter((d) => state.views.has('d:' + d)).map(shortDate), ...eraRounds.filter((r) => state.views.has(String(r))).map((r) => r + '회')].join(' + ');
    const vWrongs = wrongs.filter((q) => FLOG.some((l) => l.round === q.round));
    const vTargets = vWrongs.filter((q) => q.target);
    const others = vWrongs.filter((q) => !q.target);
    const allFlags = flagged();
    const vSlow = slowOf(FLOG);
    const timedN = FLOG.filter((l) => l.times && Object.keys(l.times).length).length;
    const vFlags = !anyView ? allFlags : allFlags.filter((q) => FLOG.some((l) => l.round === q.round));
    // 시기 필터 (약한 개념·문제 목록에 적용)
    const perOfQ = (q) => periodOf(q.pIdx >= 0 ? q.pEra : q.era);
    const perOfW = (w) => (w.pt && ptOf(w.pt) ? periodOf(ptOf(w.pt).e) : PERIODS.findIndex((p) => p[0] === w.era));
    const inP = (i) => !state.periods.size || state.periods.has(String(i));
    const pq = (arr) => arr.filter((q) => inP(perOfQ(q)));
    const perCnt = new Map();
    [...vWrongs, ...vFlags.filter((q) => q.flagOnly)].forEach((q) => { const i = perOfQ(q); perCnt.set(i, (perCnt.get(i) || 0) + 1); });
    myWeak().forEach((w) => { const i = perOfW(w); if (i >= 0 && !perCnt.has(i)) perCnt.set(i, 0); });
    [...state.periods].forEach((v) => { if (!perCnt.has(+v)) state.periods.delete(v); });
    const pBtn = (v, label, n) => `<button data-period="${v}" aria-pressed="${v === 'all' ? !state.periods.size : state.periods.has(String(v))}">${label}${n != null ? ` <small>${n}</small>` : ''}</button>`;
    const perRow = perCnt.size ? `<div class="r-view-row"><span class="r-view-lab">시기별</span><span class="r-chips">${pBtn('all', '모든 시기')}${[...perCnt.entries()].sort((a, b) => a[0] - b[0]).map(([i, n]) => pBtn(i, periodName(i), n || null)).join('')}</span></div>` : '';
    const perName = !state.periods.size ? '' : ` · ${[...state.periods].map(Number).sort((a, b) => a - b).map(periodName).join(' + ')}`;
    const pTargets = pq(vTargets), pOthers = pq(others), pWrongs = pq(vWrongs), pFlags = pq(vFlags), pSlow = pq(vSlow);
    // 문제 종류: 고른 것들의 합집합 (같은 문제는 한 번만)
    const SC = state.scopes; const has = (k) => !SC.size || SC.has(k);
    const onlySlow = SC.size === 1 && SC.has('slow');
    const merged = new Map();
    const put = (arr) => arr.forEach((q) => { const o = merged.get(q.id); merged.set(q.id, o ? { ...q, ...o, time: o.time || q.time, avg: o.avg || q.avg, slowSt: o.slowSt || q.slowSt, flagSt: o.flagSt || q.flagSt, flagOnly: !!(o.flagOnly && q.flagOnly) } : q); });
    if (has('target')) put(pTargets); if (has('other')) put(pOthers); if (has('flag')) put(pFlags); if (has('slow')) put(pSlow);
    const list = onlySlow ? pSlow : [...merged.values()];
    const shown = state.hideDone ? list.filter((q) => !mastered.has(q.id)) : list;
    lastShown = shown.filter((q) => QKEY[q.round]).map((q) => q.id);
    const RL = retryLog(); const againIds = lastShown.filter((id) => RL[id] && RL[id].last === 'no');
    const doneN = targets.filter((q) => mastered.has(q.id)).length;
    const othersAll = wrongs.filter((q) => !q.target);

    // 회차 기록
    const rounds = LOG.map((l) => {
      const qs = l.wrong.map((n) => Q(l.round, n));
      const lost = qs.reduce((a, q) => a + (q.pt || (QKEY[l.round] ? QKEY[l.round].pt[q.num - 1] : 0)), 0);
      const unknown = qs.some((q) => !q.pt);
      const tg = qs.filter((q) => q.target).map((q) => q.num);
      return `<tr class="${inView(l) && anyView ? 'in-view' : ''}">
        <th><button type="button" class="r-link" data-era-round="${l.round}" title="${l.round}회 선택/해제">${l.round}회</button></th><td>${l.date ? `<button type="button" class="r-link" data-era-round="d:${esc(l.date)}" title="이 날 푼 기록 선택/해제">${esc(l.date)}</button>` : ''}</td>
        <td><b>${l.wrong.length}</b> / 50</td>
        <td>${l.score != null ? `<b>${l.score}</b>점` : `${unknown ? '약 ' : ''}<b>${100 - lost}</b>점`}${l.src === 'claude' ? ' <small class="src">Claude 기록</small>' : l.answers ? ' <small class="src">기출 풀기</small>' : ''}</td>
        <td>${l.total ? mmss(l.total) : '-'}</td>
        <td class="nums">${l.wrong.map((n) => `<span class="${tg.includes(n) ? 'on' : ''}">${n}</span>`).join('')}</td>
        <td><button type="button" class="r-del" data-del="${l.round}" title="${l.round}회 기록 삭제">삭제</button></td>
      </tr>`;
    }).join('');

    // 시대별 약점: 푼 회차의 전체 문항을 시대별로 → 출제 수 · 틀린 수
    const byEra = new Map();
    FLOG.forEach((l) => {
      const wr = new Set(l.wrong);
      const rows = EXAM[l.round] || (QKEY[l.round] ? QKEY[l.round].ans.map((_, i) => [i + 1, '']) : []);
      rows.forEach((row) => {
        const e = periodOf(row[7] >= 0 ? row[6] : row[1]);
        if (!byEra.has(e)) byEra.set(e, { all: 0, wr: 0, tg: 0 });
        const v = byEra.get(e); v.all++;
        if (wr.has(row[0])) { v.wr++; if (Q(l.round, row[0]).target) v.tg++; }
      });
    });
    const maxAll = Math.max(1, ...[...byEra.values()].map((v) => v.all));
    const sumAll = [...byEra.values()].reduce((a, v) => a + v.all, 0);
    const sumWr = [...byEra.values()].reduce((a, v) => a + v.wr, 0);
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    const bars = [...byEra.entries()].sort((a, b) => a[0] - b[0]).map(([e, v]) => `
      <li class="${v.all >= 2 && v.wr / v.all >= 0.5 ? 'weak' : ''}"><button type="button" class="bar-name r-link" data-period="${e}" title="${esc(periodTip(e))} — 눌러서 이 시기 선택/해제">${esc(periodName(e))}</button>
        <span class="bar-track"><span class="bar-all" style="width:${(v.all / maxAll) * 100}%"></span><span class="bar-wr" style="width:${(v.wr / maxAll) * 100}%"></span><span class="bar-tg" style="width:${(v.tg / maxAll) * 100}%"></span></span>
        <span class="bar-n">출제 ${v.all} · 틀림 <b>${v.wr}</b> <i>${pct(v.wr, v.all)}%</i></span></li>`).join('');
    const btn = (v, label, n) => `<button data-era-round="${esc(v)}" aria-pressed="${v === 'all' ? !anyView : state.views.has(v)}">${label}${n ? ` <small>${n}</small>` : ''}</button>`;
    const eraSeg = eraRounds.length ? `<section class="r-view">
      <div class="r-view-row"><span class="r-view-lab">전체</span><span class="r-chips">${btn('all', `전체 기록`, `${eraRounds.length}회차`)}</span></div>
      ${dates.length ? `<div class="r-view-row"><span class="r-view-lab">날짜별</span><span class="r-chips">${dates.map((d) => { const ls = LOG.filter((l) => l.date === d); return btn('d:' + d, d.replace(/^\d{4}-/, '').replace('-', '/'), `${ls.map((l) => l.round + '회').join('·')} · 틀림 ${ls.reduce((a, l) => a + l.wrong.length, 0)}`); }).join('')}</span></div>` : ''}
      <div class="r-view-row"><span class="r-view-lab">회차별</span><span class="r-chips">${eraRounds.map((r) => btn(String(r), `${r}회`)).join('')}</span></div>
      ${perRow}
      <p class="r-view-sum"><b>${esc(viewName)}</b> — ${FLOG.length}개 회차 ${sumAll}문항 중 <b>${sumWr}</b>문항 틀림 (오답률 ${pct(sumWr, sumAll)}%) · 복습 대상 ${vTargets.length} · 어렵거나 빈도 낮음 ${others.length} · 헷갈림 ${vFlags.length} · 오래 고민 ${vSlow.length}</p>
    </section>` : '';

    // 내가 약한 개념: 같은 기출 포인트(없으면 주제)끼리 묶어 출제 수 대비 틀린 수
    const byPt = new Map();
    FLOG.forEach((l) => {
      const wr = new Set(l.wrong);
      (EXAM[l.round] || []).forEach((row) => {
        const q = Q(l.round, row[0]);
        const k = q.pIdx >= 0 ? `${q.pEra}#${q.pIdx}` : `t#${q.theme}`;
        if (!byPt.has(k)) byPt.set(k, { q, all: 0, wrongs: [] });
        const v = byPt.get(k); v.all++;
        if (wr.has(q.num)) v.wrongs.push(q);
      });
    });
    const weak = [...byPt.values()].filter((v) => v.wrongs.length)
      .map((v) => ({ ...v, done: v.wrongs.every((q) => mastered.has(q.id)) }))
      .filter((v) => !(state.hideDone && v.done))
      .sort((a, b) => b.wrongs.length - a.wrongs.length || b.wrongs.length / b.all - a.wrongs.length / a.all || (b.q.stars || 0) - (a.q.stars || 0));
    const mine = myWeak().filter((w) => !(state.hideDone && w.done) && inP(perOfW(w)));
    const editing = weakForm ? myWeak().find((w) => w.id === weakForm) || {} : {};
    const formHtml = weakForm == null ? '' : `<form class="wk-form" id="wk-form">
        <label>시대<select name="era"><option value="">선택 안 함</option>${PERIODS.map(([n]) => `<option${editing.era === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}<option${editing.era === '기타' ? ' selected' : ''}>기타</option></select></label>
        <label class="wide wk-search">약한 개념 <small>— 키워드로 기출 포인트 검색 (예: 신민회, 별무반, 독립 협회 · 띄어쓰기 상관없음)</small><input name="text" required maxlength="200" autocomplete="off" placeholder="키워드를 입력하면 기출 포인트를 찾아 줘요" value="${esc(editing.text || '')}"><input type="hidden" name="pt" value="${esc(editing.pt || '')}"><span class="wk-linked"${editing.pt ? '' : ' hidden'}>✓ 기출 포인트와 연결됨</span><ul class="wk-sug" hidden></ul></label>
        <label class="wide">메모 <small>(헷갈리는 점, 외우는 요령 등)</small><textarea name="memo" rows="2" maxlength="500" placeholder="예) 신간회(1927)와 헷갈림 — 신민회는 1907년 비밀 결사">${esc(editing.memo || '')}</textarea></label>
        <div class="wide wk-search wk-refs"><span class="wk-lab">관련 문제 <small>— 키워드나 회차로 검색 (예: 신민회, 79회, 79 37)</small></span>
          <span class="wk-chips">${(editing.refs || []).map((id) => `<button type="button" class="wk-chip" data-ref-del="${id}">${qLabel(id)} ✕</button>`).join('')}</span>
          <input name="qsearch" autocomplete="off" placeholder="문제 검색 — 골라서 여러 개 넣을 수 있어요"><input type="hidden" name="refs" value="${esc((editing.refs || []).join(','))}">
          <span class="wk-ptqs"></span>
          <ul class="wk-sug wk-qsug" hidden></ul>${editing.ref ? `<small class="wk-old">예전 메모: ${esc(editing.ref)}</small>` : ''}</div>
        <div class="wk-form-btns"><button type="submit" class="primary">${weakForm ? '수정 저장' : '추가'}</button><button type="button" data-wk="cancel">취소</button></div>
      </form>`;
    const mineItems = mine.map((w) => `<li class="wk mine${w.done ? ' done' : ''}">
        <span class="wk-era">${esc(w.era || '직접 추가')}</span>
        <span class="wk-t">${w.pt && ptOf(w.pt) ? `<span class="rp-freq">${starTxt(ptOf(w.pt).stars)}</span>${ptOf(w.pt).html}` : esc(w.text)}${w.memo ? `<span class="wk-memo has-del">${esc(w.memo)}<button type="button" class="wk-memo-x" data-wk-memo-del="${w.id}" title="메모 삭제" aria-label="메모 삭제">✕</button></span>` : ''}</span>
        <span class="wk-n"><span class="wk-mine">내가 추가</span>${w.ref && !(w.refs || []).length ? ` · ${esc(w.ref)}` : ''}${w.pt && byPt.has(w.pt) ? ` · 출제 ${byPt.get(w.pt).all} · 틀림 <b>${byPt.get(w.pt).wrongs.length}</b>` : ''}</span>
        ${(w.refs || []).length ? `<span class="wk-qs">${w.refs.map((id) => `<button type="button" data-qview="${id}" class="${myWrong.has(id) ? 'wr' : ''}${mastered.has(id) ? ' m' : ''}" title="${myWrong.has(id) ? '내가 틀린 문제' : '문제 보기'}">${qLabel(id)}${myWrong.has(id) ? ' ✗' : ''}</button>`).join('')}</span>` : ''}
        <span class="wk-qs wk-act"><label class="chip-check"><input type="checkbox" data-wk-done="${w.id}" ${w.done ? 'checked' : ''}> 외웠어요</label><button type="button" data-wk-edit="${w.id}">수정</button><button type="button" data-wk-del="${w.id}">삭제</button></span></li>`);
    const weakItems = weak.filter((v) => inP(perOfQ(v.q))).map((v) => {
      const { q } = v; const p = q.pIdx >= 0 && GICHUL[q.pEra] ? GICHUL[q.pEra].pts[q.pIdx] : null;
      const per = periodName(periodOf(q.pIdx >= 0 ? q.pEra : q.era));
      const ck = q.pIdx >= 0 ? `${q.pEra}#${q.pIdx}` : `t#${q.theme}`;
      const memo = weakMemo()[ck] || '';
      const memoUi = memoOpen === ck
        ? `<span class="wk-memo-edit"><textarea data-wm-text="${esc(ck)}" rows="2" maxlength="500" placeholder="헷갈리는 점, 외우는 요령 등">${esc(memo)}</textarea><span>${memo ? `<button type="button" class="danger" data-wm-del="${esc(ck)}">메모 삭제</button>` : ''}<button type="button" class="primary" data-wm-save="${esc(ck)}">저장</button><button type="button" data-wm-cancel>취소</button></span></span>`
        : memo ? `<span class="wk-memo has-del">${esc(memo)}<button type="button" class="wk-memo-x" data-wm-del="${esc(ck)}" title="메모 삭제" aria-label="메모 삭제">✕</button></span>` : '';
      return `<li class="wk${v.done ? ' done' : ''}">
        <span class="wk-era">${esc(per)}</span>
        <span class="wk-t">${p ? `<span class="rp-freq">${starTxt(Math.min(p[0], 3))}</span>${p[1]}` : `${esc(q.theme)} <small class="rp-none">기출 포인트 외</small>`}</span>
        <span class="wk-n">틀림 <b>${v.wrongs.length}</b> / 출제 ${v.all}${v.done ? ' · ✓ 외움' : ''}</span>
        ${memoUi ? `<span class="wk-memo-row">${memoUi}</span>` : ''}
        <span class="wk-qs">${v.wrongs.map((w) => `<button type="button" data-goto="${w.id}" class="${mastered.has(w.id) ? 'm' : ''}${w.target ? '' : ' off'}">${w.round}회 ${w.num}번${FLAGS.has(w.id) ? ' 🚩' : ''}</button>`).join('')}${memoOpen === ck ? '' : `<button type="button" class="wk-memo-btn" data-wm-open="${esc(ck)}">${memo ? '✎ 메모 수정' : '＋ 메모'}</button>`}<button type="button" class="wk-memo-btn" data-retry="${v.wrongs.map((w) => w.id).join(',')}" title="이 개념에서 틀린 문제만 다시 풀기">↻ 다시 풀기</button></span></li>`;
    });
    // 상위 10개만, 나머지는 펼치기
    const weakAllItems = [...mineItems, ...weakItems];
    const weakShown = state.weakAll ? weakAllItems : weakAllItems.slice(0, WEAK_TOP);
    const weakMore = weakAllItems.length > WEAK_TOP ? `<button type="button" class="wk-more" data-weak-more>${state.weakAll ? '접기 ▴ (상위 10개만 보기)' : `나머지 ${weakAllItems.length - WEAK_TOP}개 더 보기 ▾`}</button>` : '';

    // 암기 부족 포인트: 시대 → 기출 포인트 → 틀린 문항
    const groups = new Map();
    shown.forEach((q) => {
      const e = q.pIdx >= 0 ? q.pEra : q.era;
      if (!groups.has(e)) groups.set(e, new Map());
      const g = groups.get(e); const k = q.pIdx >= 0 ? q.pIdx : -1;
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(q);
    });
    const pointsHtml = [...groups.entries()].sort((a, b) => eraOrder(a[0]) - eraOrder(b[0])).map(([e, g]) => {
      const pts = [...g.entries()].sort((a, b) => (a[0] < 0) - (b[0] < 0) || b[1].length - a[1].length);
      const n = pts.reduce((a, [, qs]) => a + qs.length, 0);
      return `
        <section class="rp-era">
          <h3><a href="history.html#${esc(e)}">${esc(eraName(e))}</a> <small>${n}문항</small></h3>
          ${pts.map(([pi, qs]) => {
            const p = pi >= 0 && GICHUL[e] ? GICHUL[e].pts[pi] : null;
            return `
              <div class="rp-point">
                <div class="rp-title">${p ? `<span class="rp-freq">${starTxt(Math.min(p[0], 3))}</span>${p[1]}` : '<span class="rp-none">기출 포인트에 아직 없는 내용</span>'}
                  <span class="rp-cnt">${SC.size === 1 && SC.has('flag') ? '헷갈림' : SC.size && !SC.has('flag') && !SC.has('slow') ? '오답' : '문항'} ${qs.length}</span></div>
                <ol class="rq-list">${qs.map(qCard).join('')}</ol>
              </div>`;
          }).join('')}
        </section>`;
    }).join('');

    // 오래 고민한 문제는 시기로 묶지 않고 오래 걸린 순으로
    const slowHtml = onlySlow && shown.length ? `<ol class="rq-list rq-slow">${shown.map((q) => {
      const p = q.pIdx >= 0 && GICHUL[q.pEra] ? GICHUL[q.pEra].pts[q.pIdx] : null;
      return `<li class="rq-slow-pt"><span class="wk-era">${esc(periodName(perOfQ(q)))}</span> ${p ? `<span class="rp-freq">${starTxt(Math.min(p[0], 3))}</span>${p[1]}` : esc(q.theme)}</li>${qCard(q)}`;
    }).join('')}</ol>` : '';
    const pend = window.ATTEMPTS.pendingImport();
    const banner = pend.length ? `<div class="r-import"><span>채팅으로 Claude에게 알려 준 기록(${pend.map((l) => l.round + '회').join(', ')})이 있어요. 내 기록으로 가져올까요?${window.UserStore.user ? '' : ' <small>(로그인하면 계정에 저장돼요)</small>'}</span><button type="button" data-import="yes">가져오기</button><button type="button" data-import="no">내 기록 아님</button></div>` : '';
    document.getElementById('review').innerHTML = banner + `
      <section class="r-summary">
        <div><b>${LOG.length}</b><span>푼 회차</span></div>
        <div><b>${wrongs.length}</b><span>틀린 문항</span></div>
        <div class="hl"><b>${targets.length}</b><span>복습 대상<br><small>★★ 이상 · 난이도 하·중</small></span></div>
        <div><b>${othersAll.length}</b><span>어렵거나 빈도 낮음<br><small>★ 또는 난이도 중상 이상</small></span></div>
        <div><b>${doneN} / ${targets.length}</b><span>외운 문항</span></div>
        <div class="fl"><b>${allFlags.length}</b><span>헷갈린 문항<br><small>그중 맞힘 ${allFlags.filter((q) => q.flagSt === 'right').length}</small></span></div>
      </section>

      <h2 class="r-h">회차별 기록</h2>
      <div class="r-table-wrap"><table class="r-table">
        <thead><tr><th>회차</th><th>푼 날짜</th><th>틀림</th><th>점수</th><th>소요 시간</th><th>틀린 번호 <small>(<span class="on-sample">색칠</span> = 복습 대상)</small></th><th></th></tr></thead>
        <tbody>${rounds || '<tr><td colspan="7">아직 기록이 없어요</td></tr>'}</tbody>
      </table></div>

      <h2 class="r-h">보기 범위 <small>여러 개를 함께 고를 수 있어요 (누르면 선택, 다시 누르면 해제) · 날짜·회차는 아래 전체에, 시기는 약한 개념·문제 목록에 적용돼요</small></h2>
      ${eraSeg}

      <h2 class="r-h">시대별 약점 <small>${esc(viewName)} · 연한 막대 = 출제 문항, 중간 = 틀린 문항, 진한 막대 = 그중 복습 대상</small></h2>
      <ul class="r-bars">${bars || '<li class="r-empty">아직 푼 회차가 없어요</li>'}</ul>

      <h2 class="r-h" id="weak-h">내가 약한 개념 <small>${esc(viewName + perName)} 기준 · 많이 틀린 순 · 번호를 누르면 문제로 이동</small></h2>
      <div class="r-tools"><button type="button" class="wk-add" data-wk="add">＋ 약한 개념 직접 추가</button>${myWeak().length ? `<small class="r-scope-note">직접 추가 ${mineItems.length}개 · 기출 문제에서 찾은 개념 ${weakItems.length}개</small>` : ''}</div>
      ${formHtml}
      <ol class="r-weak">${weakShown.join('') || '<li class="r-empty">틀린 개념이 없어요 🎉</li>'}</ol>
      ${weakMore}

      <h2 class="r-h">암기가 부족한 기출 포인트 <small>${esc(viewName + perName)}</small></h2>
      <div class="r-tools">
        <span class="seg">${[['target', '복습 대상', pTargets.length, '★★ 이상 · 난이도 하·중인 틀린 문제'], ['other', '어렵거나 빈도 낮은 문제', pOthers.length, '출제빈도 ★ 또는 난이도 중상·상·특인 틀린 문제'], ['flag', '🚩 헷갈린 문제', pFlags.length, '기출 풀기에서 헷갈림 표시한 문제 (맞힌 문제 포함)'], ['slow', '⏱ 오래 고민한 문제', pSlow.length, `회차 평균의 ${SLOW_X}배 이상(1분 초과) 또는 3분 이상 걸린 문제`]].map(([k, label, n, tip]) => `<button data-scope="${k}" aria-pressed="${SC.has(k)}" title="${tip}">${label} (${n})</button>`).join('')}</span>
        <p class="r-scope-note">여러 개를 함께 고를 수 있어요 (다시 누르면 해제). ${SC.size ? `지금 <b>${shown.length}</b>문항` : `아무것도 고르지 않아 전부 보여요 — <b>${shown.length}</b>문항`}${SC.has('target') && SC.has('other') ? ' · 복습 대상 + 어렵거나 빈도 낮은 문제 = 틀린 문제 전체' : ''}</p>
        ${SC.has('slow') ? `<p class="r-scope-note">${timedN ? `기출 풀기로 시간을 잰 ${timedN}개 회차에서 그 회차 평균의 ${SLOW_X}배 이상(1분 초과) 또는 3분 이상 걸린 문제예요. 오래 걸린 순 — 맞힘 ${pSlow.filter((q) => q.slowSt === 'right').length} · 틀림 ${pSlow.filter((q) => q.slowSt === 'wrong').length}` : '시간 기록이 있는 회차가 없어요. 기출 풀기에서 풀면 문제별 시간이 기록돼요 (채팅으로 알려 준 기록은 시간이 없어요).'}</p>` : ''}
        ${SC.has('flag') ? `<p class="r-scope-note">기출 풀기에서 헷갈림 표시한 문제예요. 맞혔어도 확실히 알지 못한 문제라 같이 복습하면 좋아요 — 맞힘 ${pFlags.filter((q) => q.flagSt === 'right').length} · 틀림 ${pFlags.filter((q) => q.flagSt === 'wrong').length} · 채점 전 ${pFlags.filter((q) => q.flagSt === 'none').length}</p>` : ''}
        ${SC.has('other') ? `<p class="r-scope-note">복습 대상(★★ 이상·난이도 하·중)에서 빠진 문제예요. 난이도가 높은 문제 ${pOthers.filter((q) => !EASY.includes(q.diff)).length}개, 출제빈도가 낮은 문제(★) ${pOthers.filter((q) => q.stars < MIN_STARS).length}개 (겹치는 문제 포함)</p>` : ''}
        <div class="rt-launch"><button type="button" class="rt-go" data-retry-list="shown" ${lastShown.length ? '' : 'disabled'}>▶ 지금 보이는 ${lastShown.length}문항 다시 풀기</button>
          ${againIds.length ? `<button type="button" data-retry-list="again">↻ 다시 풀어 또 틀린 ${againIds.length}문항만</button>` : ''}
          <label class="chip-check"><input type="checkbox" id="rt-shuffle" ${store.get('retryShuffle', true) ? 'checked' : ''}> 순서 섞기</label>
          <small>정답을 가린 채 한 문제씩 다시 풀고 바로 채점해요 · 위에서 고른 범위·시기·문제 종류가 그대로 적용돼요</small></div>
        <label class="chip-check"><input type="checkbox" id="hide-done" ${state.hideDone ? 'checked' : ''}> 외운 문항 숨기기</label>
        <label class="chip-check"><input type="checkbox" id="open-all" ${state.openAll ? 'checked' : ''}> 정답 도출 포인트 모두 펼치기</label>
      </div>
      ${(onlySlow ? slowHtml : pointsHtml) || `<p class="r-empty">${onlySlow ? '오래 고민한 문제가 없어요' : list.length ? '모두 외웠어요! 🎉' : '고른 조건에 맞는 문제가 없어요'}</p>`}
      <p class="r-note">정답 선지·지문은 국사편찬위원회 한국사능력검정시험 심화 문항에서 발췌했어요. 새 회차를 풀면 Claude에게 회차와 틀린 번호를 알려 주세요. 로그인하면 풀이 기록·메모·‘외웠어요’ 표시가 계정에 저장돼요.</p>`;
  }

  document.addEventListener('click', (e) => {
    if (rt && e.target.closest('#rt')) {
      const pk = e.target.closest('[data-rt-pick]');
      if (pk) { rtPick(+pk.dataset.rtPick); return; }
      if (e.target.closest('[data-rt-next]')) { rtNext(); return; }
      if (e.target.closest('[data-rt-again]')) { const ids = rt.ids.filter((id) => rt.picks[id] !== rtRight(id)); startRetry(ids, rt.title, store.get('retryShuffle', true)); return; }
      if (e.target.closest('[data-rt-master]')) {
        rt.ids.filter((id) => rt.picks[id] === rtRight(id)).forEach((id) => mastered.add(id));
        window.UserStore.set(MKEY, [...mastered]); renderRetry(); return;
      }
      const g = e.target.closest('[data-rt-goto]');
      if (g) { const id = g.dataset.rtGoto; closeRetry(); const b = document.createElement('button'); b.dataset.goto = id; b.hidden = true; document.body.appendChild(b); b.click(); b.remove(); return; }
      if (e.target.closest('[data-rt-close]')) {
        const left = rt.end ? 0 : rt.ids.length - Object.keys(rt.picks).length;
        if (left && Object.keys(rt.picks).length && !confirm(`아직 ${left}문항이 남았어요. 그만 풀까요?\n(지금까지 푼 문제의 결과는 남아요)`)) return;
        closeRetry();
      }
      return;
    }
    const rl = e.target.closest('[data-retry-list]');
    if (rl) {
      const RL = retryLog(); const again = rl.dataset.retryList === 'again';
      startRetry(again ? lastShown.filter((id) => RL[id] && RL[id].last === 'no') : lastShown, again ? '또 틀린 문제' : '', store.get('retryShuffle', true)); return;
    }
    const ry = e.target.closest('[data-retry]');
    if (ry) { const ids = ry.dataset.retry.split(','); startRetry(ids, ids.length > 1 ? '이 개념에서 틀린 문제' : '', false); return; }
    const del = e.target.closest('[data-del]');
    if (del) {
      const r = +del.dataset.del;
      if (!confirm(`${r}회 풀이 기록을 삭제할까요?\n(점수·틀린 문항·풀이 시간이 지워지고, 메모와 '외웠어요' 표시는 남아요)`)) return;
      window.ATTEMPTS.remove(r);
      location.reload();
      return;
    }
    const im = e.target.closest('[data-import]');
    if (im) { if (im.dataset.import === 'yes') window.ATTEMPTS.importMyLog(); else window.ATTEMPTS.dismissImport(); location.reload(); return; }
    const er = e.target.closest('button[data-era-round]');
    if (er) {
      const fromTable = !!er.closest('.r-table');
      if (er.dataset.eraRound === 'all') state.views.clear(); else toggle(state.views, er.dataset.eraRound);
      saveFilters(); rerender();
      if (fromTable) document.querySelector('.r-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const wk = e.target.closest('[data-wk], [data-wk-edit], [data-wk-del]');
    if (wk) {
      if (wk.dataset.wk === 'add') weakForm = '';
      else if (wk.dataset.wk === 'cancel') weakForm = null;
      else if (wk.dataset.wkEdit) weakForm = wk.dataset.wkEdit;
      else if (wk.dataset.wkDel) {
        const w = myWeak().find((x) => x.id === wk.dataset.wkDel);
        if (!w || !confirm(`'${w.text}' 개념을 삭제할까요?`)) return;
        saveWeak(myWeak().filter((x) => x.id !== w.id)); if (weakForm === w.id) weakForm = null;
      }
      const y = window.scrollY; render(); window.scrollTo(0, y);
      const f = document.querySelector('#wk-form [name="text"]'); if (f) { showPtQs(f.form); f.focus({ preventScroll: true }); }
      return;
    }
    const pd = e.target.closest('[data-period]');
    if (pd) {
      const fromBar = !!pd.closest('.r-bars');
      if (pd.dataset.period === 'all') state.periods.clear(); else toggle(state.periods, pd.dataset.period);
      state.weakAll = false; saveFilters(); rerender();
      if (fromBar) document.getElementById('weak-h')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (e.target.closest('[data-weak-more]')) {
      const top = document.querySelector('.r-weak'); state.weakAll = !state.weakAll; rerender();
      if (!state.weakAll && top) document.querySelector('.r-weak').scrollIntoView({ block: 'nearest' });
      return;
    }
    const uf = e.target.closest('[data-unflag]');
    if (uf) {
      const [r, n] = uf.dataset.unflag.split('-').map(Number);
      window.UserStore.set(flagKey(r), (window.UserStore.get(flagKey(r), []) || []).filter((x) => x !== n));
      rerender(); return;
    }
    const qv = e.target.closest('[data-qview]');
    if (qv) { openQView(qv.dataset.qview); return; }
    if (e.target.closest('.qv-x') || e.target.classList.contains('qv')) { closeQView(); return; }
    const wo = e.target.closest('[data-wm-open]');
    if (wo) { memoOpen = wo.dataset.wmOpen; rerender(); const t = document.querySelector('[data-wm-text]'); if (t) t.focus(); return; }
    const ws = e.target.closest('[data-wm-save]');
    if (ws) {
      const k = ws.dataset.wmSave; const t = document.querySelector('[data-wm-text]').value.trim();
      const m = weakMemo(); if (t) m[k] = t; else delete m[k]; window.UserStore.set(WMKEY, m);
      memoOpen = null; rerender(); return;
    }
    if (e.target.closest('[data-wm-cancel]')) { memoOpen = null; rerender(); return; }
    const wd = e.target.closest('[data-wm-del]');
    if (wd) {
      if (!confirm('이 개념의 메모를 삭제할까요?')) return;
      const m = weakMemo(); delete m[wd.dataset.wmDel]; window.UserStore.set(WMKEY, m);
      memoOpen = null; rerender(); return;
    }
    const md = e.target.closest('[data-wk-memo-del]');
    if (md) {
      if (!confirm('이 개념의 메모를 삭제할까요?')) return;
      saveWeak(myWeak().map((w) => (w.id === md.dataset.wkMemoDel ? { ...w, memo: '' } : w))); rerender(); return;
    }
    const rd = e.target.closest('[data-ref-del]');
    if (rd) { setRefs(rd.closest('form'), getRefs(rd.closest('form')).filter((x) => x !== rd.dataset.refDel)); return; }
    const ra = e.target.closest('[data-ref-add]');
    if (ra) { const f = ra.closest('form'); setRefs(f, [...new Set([...getRefs(f), ra.dataset.refAdd])]); return; }
    const go = e.target.closest('button[data-goto]');
    if (go) {
      const sel = `.rq[data-id="${go.dataset.goto}"]`;
      if (!document.querySelector(sel)) { state.scopes.clear(); state.hideDone = false; store.set('reviewHideDone', false); saveFilters(); render(); }
      if (!document.querySelector(sel)) { state.periods.clear(); state.views.clear(); saveFilters(); render(); }
      const li = document.querySelector(sel); if (!li) return;
      li.classList.add('open', 'flash'); openSet.add(li.dataset.id);
      const tg = li.querySelector('.rq-toggle'); if (tg) tg.textContent = '정답·도출 포인트 접기 ▴';
      li.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => li.classList.remove('flash'), 1600);
      return;
    }
    const s = e.target.closest('button[data-scope]');
    if (s) { toggle(state.scopes, s.dataset.scope); saveFilters(); rerender(); return; }
    const t = e.target.closest('.rq-toggle');
    if (t) {
      const li = t.closest('.rq'); const on = !li.classList.contains('open');
      li.classList.toggle('open', on); if (on) openSet.add(li.dataset.id); else openSet.delete(li.dataset.id);
      t.textContent = on ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾';
    }
  });
  const rerender = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  // 문제 미리보기 창
  function openQView(id) {
    const [r, n] = id.split('-').map(Number);
    let box = document.getElementById('qv');
    if (!box) { box = document.createElement('div'); box.id = 'qv'; box.className = 'qv'; document.body.appendChild(box); }
    openSet.add(id);
    box.innerHTML = `<div class="qv-box"><button type="button" class="qv-x" aria-label="닫기">✕</button>${myWrong.has(id) ? '<p class="qv-tag">내가 틀린 문제</p>' : ''}<ol class="rq-list">${qCard({ ...Q(r, n), target: true })}</ol></div>`;
    box.hidden = false; document.body.classList.add('qv-on');
  }
  function closeQView() { const b = document.getElementById('qv'); if (b) b.hidden = true; document.body.classList.remove('qv-on'); }
  document.addEventListener('keydown', (e) => {
    if (rt) {
      if (e.key === 'Escape') document.querySelector('#rt [data-rt-close]')?.click();
      else if (rt.end) return;
      else if (/^[0-5]$/.test(e.key)) rtPick(+e.key);
      else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); rtNext(); }
      return;
    }
    if (e.key === 'Escape' && !document.getElementById('qv')?.hidden) closeQView();
  });
  // 관련 문제 선택
  const getRefs = (f) => String(f.refs.value || '').split(',').filter(Boolean);
  function setRefs(f, ids) {
    f.refs.value = ids.join(',');
    f.querySelector('.wk-chips').innerHTML = ids.map((id) => `<button type="button" class="wk-chip" data-ref-del="${id}">${qLabel(id)} ✕</button>`).join('');
    showPtQs(f);
    if (f.qsearch.value.trim()) showQSug(f.qsearch);
  }
  // 연결된 기출 포인트가 나온 문제를 바로 넣을 수 있게
  function showPtQs(f) {
    const pt = f.pt.value; const have = new Set(getRefs(f));
    const qs = pt ? Q_INDEX.filter((x) => x.pt === pt && !have.has(x.id)).sort((a, b) => b.round - a.round) : [];
    f.querySelector('.wk-ptqs').innerHTML = qs.length ? `<small>이 기출 포인트가 나온 문제:</small> ${qs.map((x) => `<button type="button" class="wk-chip add${myWrong.has(x.id) ? ' wr' : ''}" data-ref-add="${x.id}">＋ ${qLabel(x.id)}${myWrong.has(x.id) ? ' ✗' : ''}</button>`).join('')}` : '';
  }
  function showQSug(inp) {
    const f = inp.form; const ul = f.querySelector('.wk-qsug'); const have = new Set(getRefs(f));
    const res = searchQs(inp.value); sugIdx = -1;
    ul.innerHTML = res.length ? res.map((x) => `<li data-q="${x.id}"><span class="wk-sug-era">${qLabel(x.id)}</span>${hlTok(esc(x.theme), inp.value)}${x.ans ? ` <small class="wk-have">· ${hlTok(esc(x.ans), inp.value)}</small>` : ''}${myWrong.has(x.id) ? ' <small class="wk-wr">✗ 내가 틀림</small>' : ''}${have.has(x.id) ? ' <small class="wk-have">· 추가됨</small>' : ''}</li>`).join('')
      : inp.value.trim() ? '<li class="none">찾는 문제가 없어요</li>' : '';
    ul.hidden = !ul.innerHTML;
  }
  // 약한 개념 검색 자동완성
  let sugIdx = -1;
  function showSug(inp) {
    const form = inp.form; const ul = form.querySelector('.wk-sug');
    const res = searchPts(inp.value); sugIdx = -1;
    const have = new Set(myWeak().filter((w) => w.id !== weakForm).map((w) => w.pt).filter(Boolean));
    ul.innerHTML = res.length ? res.map((x) => `<li data-pt="${x.key}"><span class="wk-sug-era">${esc(periodName(periodOf(x.e)))}</span><span class="rp-freq">${starTxt(x.stars)}</span>${hlTok(x.html, inp.value)}${x.sub ? ' <small class="wk-have">· 기출 문장에서 찾음</small>' : ''}${have.has(x.key) ? ' <small class="wk-have">이미 추가됨</small>' : ''}</li>`).join('')
      : inp.value.trim() ? '<li class="none">일치하는 기출 포인트가 없어요 — 입력한 내용 그대로 추가돼요</li>' : '';
    ul.hidden = !ul.innerHTML;
  }
  function pickSug(form, key) {
    const x = ptOf(key); if (!x) return;
    form.text.value = x.plain; form.pt.value = key; form.era.value = periodName(periodOf(x.e));
    form.querySelector('.wk-linked').hidden = false; form.querySelector('.wk-sug').hidden = true; showPtQs(form);
    form.memo.focus();
  }
  document.addEventListener('input', (e) => {
    if (e.target.name === 'qsearch' && e.target.closest('#wk-form')) { showQSug(e.target); return; }
    if (e.target.name !== 'text' || !e.target.closest('#wk-form')) return;
    const f = e.target.form; f.pt.value = ''; f.querySelector('.wk-linked').hidden = true; showSug(e.target);
  });
  document.addEventListener('keydown', (e) => {
    const isQ = e.target.name === 'qsearch';
    if (!(e.target.name === 'text' || isQ) || !e.target.closest('#wk-form')) return;
    const ul = e.target.form.querySelector(isQ ? '.wk-qsug' : '.wk-sug'); const items = [...ul.querySelectorAll(isQ ? 'li[data-q]' : 'li[data-pt]')];
    if (isQ && e.key === 'Enter') e.preventDefault();
    if (ul.hidden || !items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((li, i) => li.classList.toggle('on', i === sugIdx)); items[sugIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault(); const it = items[Math.max(0, sugIdx)];
      if (isQ) { const f = e.target.form; setRefs(f, [...new Set([...getRefs(f), it.dataset.q])]); } else pickSug(e.target.form, it.dataset.pt);
    }
    else if (e.key === 'Escape') ul.hidden = true;
  });
  document.addEventListener('mousedown', (e) => {
    const lq = e.target.closest('.wk-qsug li[data-q]');
    if (lq) { e.preventDefault(); const f = lq.closest('form'); setRefs(f, [...new Set([...getRefs(f), lq.dataset.q])]); return; }
    const li = e.target.closest('.wk-sug li[data-pt]');
    if (li) { e.preventDefault(); pickSug(li.closest('form'), li.dataset.pt); return; }
    document.querySelectorAll('.wk-sug').forEach((ul) => { if (e.target.closest('.wk-search') !== ul.closest('.wk-search')) ul.hidden = true; });
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'wk-form') return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const v = { era: fd.get('era'), text: String(fd.get('text')).trim(), memo: String(fd.get('memo')).trim(), pt: fd.get('pt') || '', refs: String(fd.get('refs') || '').split(',').filter(Boolean) };
    if (v.refs.length) v.ref = '';
    if (!v.text) return;
    const list = myWeak();
    if (weakForm) saveWeak(list.map((w) => (w.id === weakForm ? { ...w, ...v } : w)));
    else saveWeak([{ id: 'w' + Date.now().toString(36), ...v, done: false, t: Date.now() }, ...list]);
    weakForm = null;
    const y = window.scrollY; render(); window.scrollTo(0, y);
  });
  document.addEventListener('change', (e) => {
    if (e.target.dataset.wkDone) {
      saveWeak(myWeak().map((w) => (w.id === e.target.dataset.wkDone ? { ...w, done: e.target.checked } : w)));
      const y = window.scrollY; render(); window.scrollTo(0, y); return;
    }
    if (e.target.id === 'rt-shuffle') { store.set('retryShuffle', e.target.checked); return; }
    if (e.target.id === 'open-all') { state.openAll = e.target.checked; store.set('reviewOpenAll', state.openAll); openSet.clear(); render(); return; }
    if (e.target.id === 'hide-done') { state.hideDone = e.target.checked; store.set('reviewHideDone', state.hideDone); render(); return; }
    const li = e.target.closest('.rq');
    if (li && e.target.type === 'checkbox') {
      if (e.target.checked) mastered.add(li.dataset.id); else mastered.delete(li.dataset.id);
      window.UserStore.set(MKEY, [...mastered]);
      const y = window.scrollY; render(); window.scrollTo(0, y);
    }
  });
  window.UserStore.onChange((t) => { if (t === 'auth' || t === 'sync') render(); });
  render();
})();
