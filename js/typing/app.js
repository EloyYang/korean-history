/*
 * 한국사 타자 연습
 *   #art : 유물 사진을 보고 시대(또는 유물 이름)를 친다 — 사진·설명은 notes.js ARTIFACTS, 시대는 js/typing/data.js TY_ART
 *   #ev  : 기출 문장('기출 문장 모아 보기'의 선택지 70~79회)을 보고 그때의 왕(대통령) 또는 나라·시대를 친다
 *          문장↔왕·나라 연결은 js/typing/kings.js (TY_SENT, tools/typing_kings.js 로 생성), 문장이 나온 문항은 ex-where.js
 *          '기출 오답' 범위 = 기출 풀기에서 틀린 문항(khmap.quizLog·setLog, '외웠어요' 표시한 것 제외)에 나온 문장만
 *   방식 : 맞히기(답을 가리고 Enter 로 채점, 틀리면 정답을 한 번 따라 쳐야 넘어감) · 보고 치기(정답이 보이고 다 치면 끝)
 *   화면 키보드는 두벌식 자판 — 보고 치기에서는 다음에 누를 키를 밝혀 준다
 *   기록은 study.typing.* (UserStore → 로그인하면 계정에 동기화)
 *     rec  : { 문제 id: { t: 푼 횟수, w: 틀린 횟수, ok: 마지막 결과 } }
 *     opt  : 화면 선택 (탭별 방식·범위 등)
 *     best : { cpm: 최고 타수 }
 */
(function () {
  const S = window.UserStore; const K = (n) => 'study.typing.' + n;
  const ART = window.ARTIFACTS || {}; const R = window.RULERS || {}; const E = window.TY_ERAS;
  const MAIN = document.getElementById('ty');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rnd = (a) => a.slice().sort(() => Math.random() - 0.5);
  const norm = (s) => String(s || '').replace(/[\s·.,()]/g, '');
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // ── 한글 → 두벌식 키 ──
  // 키 하나 = 소문자(그냥) · 대문자(Shift) · 숫자 · ' '(스페이스) · 그 밖의 글자(화면 키보드에 없음)
  const KEY = { ㅂ: 'q', ㅈ: 'w', ㄷ: 'e', ㄱ: 'r', ㅅ: 't', ㅛ: 'y', ㅕ: 'u', ㅑ: 'i', ㅐ: 'o', ㅔ: 'p', ㅁ: 'a', ㄴ: 's', ㅇ: 'd', ㄹ: 'f', ㅎ: 'g', ㅗ: 'h', ㅓ: 'j', ㅏ: 'k', ㅣ: 'l', ㅋ: 'z', ㅌ: 'x', ㅊ: 'c', ㅍ: 'v', ㅠ: 'b', ㅜ: 'n', ㅡ: 'm', ㅃ: 'Q', ㅉ: 'W', ㄸ: 'E', ㄲ: 'R', ㅆ: 'T', ㅒ: 'O', ㅖ: 'P' };
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const SPLIT = { ㅘ: 'ㅗㅏ', ㅙ: 'ㅗㅐ', ㅚ: 'ㅗㅣ', ㅝ: 'ㅜㅓ', ㅞ: 'ㅜㅔ', ㅟ: 'ㅜㅣ', ㅢ: 'ㅡㅣ', ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ', ㄽ: 'ㄹㅅ', ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ' };
  const jamoKeys = (j) => (SPLIT[j] || j).split('').map((x) => KEY[x] || x);
  function charKeys(c) {
    const n = c.charCodeAt(0) - 0xac00;
    if (n >= 0 && n < 11172) return [CHO[Math.floor(n / 588)], JUNG[Math.floor((n % 588) / 28)], JONG[n % 28]].filter(Boolean).flatMap(jamoKeys);
    if (KEY[c] || SPLIT[c]) return jamoKeys(c);
    return [c];
  }
  const keysOf = (s) => Array.from(s).flatMap(charKeys);
  const chosung = (s) => Array.from(s).map((c) => { const n = c.charCodeAt(0) - 0xac00; return n >= 0 && n < 11172 ? CHO[Math.floor(n / 588)] : c; }).join('');

  // ── 문제 만들기 ──
  const artSrc = (k) => { const a = ART[k]; return a ? [].concat(a.src)[0] : null; };
  function artItems(target) {
    return (window.TY_ART || []).filter((x) => artSrc(x.k)).map((x) => {
      const name = x.name || x.k; const cap = ART[x.k].caption || '';
      if (target === 'name') return { id: 'n:' + x.k, img: artSrc(x.k), badge: x.era, prompt: '', answer: name, accepts: [name, x.k], html: esc(cap) };
      const hide = [x.era].concat(x.alt || []).sort((a, b) => b.length - a.length);
      const shown = hide.reduce((s, w) => s.replace(new RegExp(reEsc(w), 'g'), '○○'), name);
      return { id: 'a:' + x.k, img: artSrc(x.k), badge: '', prompt: shown, answer: x.era, accepts: [x.era].concat(x.alt || []), html: esc(cap) };
    });
  }
  // 왕 이름에서 답으로 받아 줄 이름들 — 앞의 것이 '정답'으로 보인다
  const EXTRA = { '태조 왕건': ['왕건', '태조'], '장면 내각': ['장면'], '흥선 대원군': ['대원군'], '태종 무열왕': ['무열왕'] };
  const SKIP_PAREN = /통일 과정|집권자|섭정|무신 집권기|복위|^\d+대$|대통령/;
  function aliases(name) {
    const base = name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
    const paren = (name.match(/\((.*?)\)/g) || []).map((p) => p.slice(1, -1)).filter((p) => !SKIP_PAREN.test(p));
    const out = [base].concat(EXTRA[base] || [], paren);
    out.slice().forEach((a) => { if (/\s대왕$/.test(a)) out.push(a.replace(/\s대왕$/, '왕')); }); // 광개토 대왕 → 광개토왕
    return [...new Set(out)];
  }
  const maskRe = (words) => words.filter((a) => a.length >= 2).sort((a, b) => b.length - a.length).map((a) => new RegExp(Array.from(a.replace(/\s/g, '')).map(reEsc).join('\\s*'), 'g'));
  const maskWith = (text, words) => maskRe(words).reduce((s, re) => s.replace(re, '○○'), text);
  const rulerOf = (name, era) => (R[era] || []).find((r) => r.name === name);

  // 기출 풀기에서 틀린 문항 ('회차-번호') — 오답 노트와 같은 기준 (외웠어요 표시한 것은 뺀다)
  function wrongSet() {
    const set = new Set();
    const A = window.ATTEMPTS_FOR ? window.ATTEMPTS_FOR('history').all() : [];
    A.forEach((l) => (l.wrong || []).forEach((n) => set.add(`${l.round}-${n}`)));
    (S.get('khmap.setLog', []) || []).forEach((l) => (l.wrong || []).forEach((p) => { const it = (l.items || [])[p - 1]; if (it) set.add(`${it[0]}-${it[1]}`); }));
    (S.get('khmap.mastered', []) || []).forEach((id) => set.delete(id));
    return set;
  }
  const qLabel = (id) => { const [r, n] = id.split('-'); return `${r}회 ${n}번`; };

  function evItems(group, ans) {
    const g = E.groups.find((x) => x[0] === group); const eras = g ? g[2] : E.groups.flatMap((x) => x[2]);
    const where = window.EX_WHERE || {}; const wr = wrongSet();
    const out = [];
    (window.TY_SENT || []).forEach((x, i) => {
      if (!eras.includes(x.e) || (ans === 'king' ? !x.k : !x.n)) return;
      const qids = where[x.s] || []; const mine = qids.filter((id) => wr.has(id));
      const rounds = [...new Set(qids.map((id) => id.split('-')[0]))].sort((a, b) => b - a);
      const meta = `<span class="ty-meta">기출 <b>${x.c}회</b> 출제${rounds.length ? ' · ' + rounds.map((r) => r + '회').join(' ') : ''}${mine.length ? ` · <em>내가 틀린 문제 ${mine.map(qLabel).join(', ')}</em>` : ''}</span>`;
      const r = x.k ? rulerOf(x.k, x.ke) : null;
      const base = { id: `${ans === 'king' ? 'k' : 'n'}:${i}`, wrongQ: mine.length > 0 };
      if (ans === 'king') {
        const al = aliases(x.k);
        out.push(Object.assign(base, { badge: E.names[x.e] || x.e, prompt: maskWith(x.s, al), answer: al[0], accepts: al, html: `<b>${esc(x.k.replace(/\s*\(.*?\)/, ''))}</b>${r ? ` (${esc(r.reign)})${r.key ? ' — ' + esc(r.key) : ''}` : ''}<br>${meta}` }));
      } else {
        const al = [x.n].concat(x.na);
        out.push(Object.assign(base, { badge: '', prompt: maskWith(x.s, al), answer: x.n, accepts: al, html: `<b>${esc(x.n)}</b>${r ? ` · ${esc(x.k.replace(/\s*\(.*?\)/, ''))} (${esc(r.reign)})` : ''}<br>${meta}` }));
      }
    });
    return out;
  }

  // ── 설정 ──
  const TABS = [['art', '유물 사진 → 시대'], ['ev', '기출 문장 → 왕·나라']];
  const tab = () => (location.hash === '#ev' ? 'ev' : 'art');
  const OPT0 = { art: { target: 'era', mode: 'quiz', scope: 'all' }, ev: { group: 'all', ans: 'king', mode: 'quiz', scope: 'all' } };
  const opt = () => Object.assign({}, OPT0[tab()], (S.get(K('opt'), {}) || {})[tab()]);
  const setOpt = (k, v) => { const o = S.get(K('opt'), {}) || {}; o[tab()] = Object.assign(opt(), { [k]: v }); S.set(K('opt'), o); };
  const rec = () => S.get(K('rec'), {}) || {};
  const ROUND = 20;

  // ── 진행 상태 ──
  let st = null; // { items, i, phase: 'type'|'retype'|'done', ok, wrong:[], keys, ms, t0, typed, back, hint }
  function newRound() {
    const o = opt(); const R0 = rec();
    let items = tab() === 'art' ? artItems(o.target) : evItems(o.group, o.ans);
    if (o.scope === 'wrong') items = items.filter((x) => R0[x.id] && R0[x.id].ok === false);
    else if (o.scope === 'ki') items = items.filter((x) => x.wrongQ);
    st = { items: rnd(items).slice(0, ROUND), i: 0, phase: 'type', ok: 0, wrong: [], keys: 0, ms: 0, t0: 0, typed: 0, back: 0, hint: false, total: items.length };
    render();
  }
  const cur = () => st.items[st.i];
  const showTarget = () => opt().mode === 'copy' || st.phase === 'retype';

  // ── 화면 ──
  function chips(name, list, val) {
    return `<div class="gt-chips">${list.map(([v, l]) => `<button type="button" class="chip${val === v ? ' on' : ''}" data-o="${name}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  }
  function render() {
    document.querySelectorAll('.gt-tabs a').forEach((a) => a.classList.toggle('on', a.dataset.t === tab()));
    const o = opt();
    const bar = `<section class="ty-bar">
      ${tab() === 'art' ? chips('target', [['era', '시대 치기'], ['name', '유물 이름 치기']], o.target)
        : chips('group', [['all', '전체']].concat(E.groups.map((g) => [g[0], g[1]])), o.group) + chips('ans', [['king', '왕(지도자) 치기'], ['nation', '나라·시대 치기']], o.ans)}
      ${chips('mode', [['quiz', '맞히기'], ['copy', '보고 치기']], o.mode)}
      ${chips('scope', [['all', '전체 문제'], ['wrong', '타자에서 틀린 것']].concat(tab() === 'ev' ? [['ki', '기출 오답']] : []), o.scope)}
    </section>`;
    if (!st.items.length) {
      MAIN.innerHTML = bar + `<div class="ty-stage ty-empty"><p>${o.scope === 'ki' ? '기출 풀기에서 틀린 문제에 나온 문장이 없어요. (오답 노트에서 ‘외웠어요’로 표시한 문제는 빼요. 로그인하면 다른 기기의 기록도 불러와요.)' : o.scope === 'wrong' ? '아직 타자에서 틀린 문제가 없어요. 전체 문제로 먼저 풀어 보세요.' : '문제가 없어요.'}</p></div>`;
      return;
    }
    if (st.i >= st.items.length) { MAIN.innerHTML = bar + summary(); return; }
    MAIN.innerHTML = bar + stage() + keyboard();
    paint();
    const inp = document.getElementById('ty-in'); if (inp && matchMedia('(hover: hover)').matches) inp.focus();
  }

  function stage() {
    const it = cur(); const done = st.phase === 'done';
    const side = (j) => { const x = st.items[j]; return x && x.img ? `<img src="${esc(x.img)}" alt="">` : ''; };
    const media = it.img
      ? `<div class="ty-media"><div class="ty-side">${side(st.i - 1)}</div><img class="ty-main" src="${esc(it.img)}" alt="문제 사진"><div class="ty-side">${side(st.i + 1)}</div></div>`
      : `<div class="ty-event">${it.badge ? `<span class="ty-badge">${esc(it.badge)}</span>` : ''}<p>${esc(it.prompt)}</p></div>`;
    const q = it.img ? (tab() === 'art' && opt().target === 'era' ? `<p class="ty-q">${esc(it.prompt)} <small>· 어느 시대?</small></p>` : `<p class="ty-q"><small>${done ? esc(it.badge) + ' · ' : ''}이 유물의 이름은?</small></p>`)
      : `<p class="ty-q"><small>${opt().ans === 'nation' ? '어느 나라(시대)의 일일까요?' : '이 일이 있었던 때의 왕(지도자)은?'}</small></p>`;
    const msg = st.phase === 'retype' ? '<p class="ty-msg r">틀렸어요 — 정답을 한 번 따라 쳐 보세요</p>'
      : done ? `<p class="ty-msg ${st.lastOk ? 'g' : 'r'}">${st.lastOk ? '정답!' : '오답'} <span>${st.lastOk ? '' : `내 답: ${esc(st.lastIn || '(모름)')}`}</span></p>` : '';
    return `<section class="ty-stage">
      <div class="ty-top"><span><b id="ty-cpm">${cpm()}</b> 타</span><span><b id="ty-acc">${acc()}</b>%</span><span><b>${st.i + 1}</b> / ${st.items.length}</span></div>
      ${media}
      ${q}
      <div class="ty-line" id="ty-line"></div>
      <input id="ty-in" class="ty-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${showTarget() ? '위 글자를 따라 치세요' : '답을 치고 Enter'}" ${done ? 'readonly' : ''}>
      ${msg}
      ${done ? `<div class="ty-info">${it.html}</div>` : ''}
      <div class="ty-acts">
        ${done ? '<button type="button" class="gt-btn main" data-a="next">다음 (Enter)</button>'
          : `${!showTarget() ? `<button type="button" class="gt-btn" data-a="hint">초성 힌트</button><button type="button" class="gt-btn" data-a="skip">모르겠어요</button>` : ''}`}
        <button type="button" class="gt-link" data-a="restart">처음부터</button>
      </div>
    </section>`;
  }

  // 큰 글씨 줄: 보고 칠 때는 정답(친 만큼 밝게), 맞힐 때는 친 글자(+초성 힌트), 끝나면 정답
  function paint() {
    const it = cur(); const line = document.getElementById('ty-line'); const inp = document.getElementById('ty-in');
    if (!line || !inp) return;
    const nextKey = (k) => document.querySelectorAll('.ty-kb [data-k]').forEach((el) => {
      const on = k != null && (el.dataset.k === k.toLowerCase() || (el.dataset.k === 'shift' && k !== k.toLowerCase()));
      el.classList.toggle('next', on);
    });
    if (st.phase === 'done') { line.innerHTML = `<span class="done">${esc(it.answer)}</span>`; nextKey(null); return; }
    if (!showTarget()) {
      line.innerHTML = st.hint ? `<span class="hint">${esc(chosung(it.answer))}</span>` : '<span class="hint">?</span>';
      nextKey(null); return;
    }
    const tk = keysOf(it.answer); const ik = keysOf(inp.value);
    let m = 0; while (m < ik.length && m < tk.length && ik[m] === tk[m]) m++;
    const bad = ik.length > m;
    let end = 0;
    line.innerHTML = Array.from(it.answer).map((c) => {
      const start = end; end += charKeys(c).length;
      const cls = m >= end ? 'done' : bad && m >= start && m < end ? 'bad' : m > start ? 'part' : '';
      return `<span class="${cls}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`;
    }).join('');
    line.classList.toggle('err', bad);
    nextKey(bad ? null : tk[m]);
  }

  function keyboard() {
    const L = 'qwertyuiop|asdfghjkl|zxcvbnm'.split('|');
    const inv = Object.fromEntries(Object.entries(KEY).map(([j, k]) => [k, j]));
    const key = (k) => `<span class="k" data-k="${k}"><b>${inv[k] || ''}</b><i>${inv[k.toUpperCase()] ? inv[k.toUpperCase()] : ''}</i><small>${k.toUpperCase()}</small></span>`;
    const num = '1234567890'.split('').map((d) => `<span class="k" data-k="${d}"><b>${d}</b></span>`).join('');
    return `<section class="ty-kb" aria-hidden="true">
      <div><span class="k w" data-k="\`"><small>\`</small></span>${num}<span class="k" data-k="-"><b>-</b></span><span class="k" data-k="="><b>=</b></span><span class="k w2" data-k="backspace"><small>⌫</small></span></div>
      <div><span class="k w" data-k="tab"><small>Tab</small></span>${L[0].split('').map(key).join('')}<span class="k" data-k="["><b>[</b></span><span class="k" data-k="]"><b>]</b></span><span class="k w" data-k="\\"><b>\\</b></span></div>
      <div><span class="k w2" data-k="caps"><small>Caps</small></span>${L[1].split('').map(key).join('')}<span class="k" data-k=";"><b>;</b></span><span class="k" data-k="'"><b>'</b></span><span class="k w2" data-k="enter"><small>Enter</small></span></div>
      <div><span class="k w3" data-k="shift"><small>Shift</small></span>${L[2].split('').map(key).join('')}<span class="k" data-k=","><b>,</b></span><span class="k" data-k="."><b>.</b></span><span class="k" data-k="/"><b>/</b></span><span class="k w3" data-k="shift"><small>Shift</small></span></div>
      <div><span class="k w2" data-k="lang"><small>한/영</small></span><span class="k sp" data-k=" "></span></div>
    </section>`;
  }

  function summary() {
    const n = st.items.length; const pct = Math.round((st.ok / n) * 100);
    return `<section class="ty-stage ty-sum">
      <h2>한 판 끝!</h2>
      <ul class="ty-nums"><li><b>${st.ok}</b> / ${n}<span>정답</span></li><li><b>${pct}</b>%<span>정답률</span></li><li><b>${cpm()}</b><span>평균 타수</span></li><li><b>${acc()}</b>%<span>정확도</span></li></ul>
      ${st.wrong.length ? `<h3>틀린 문제</h3><ul class="ty-wrong">${st.wrong.map((x) => `<li>${x.img ? `<img src="${esc(x.img)}" alt="">` : ''}<div><b>${esc(x.answer)}</b><p>${esc(x.prompt || x.badge)}</p></div></li>`).join('')}</ul>` : '<p class="ty-msg g">모두 맞혔어요!</p>'}
      <div class="ty-acts"><button type="button" class="gt-btn main" data-a="restart">한 판 더 (Enter)</button>${st.wrong.length ? '<button type="button" class="gt-btn" data-a="wrongonly">틀린 문제만 다시</button>' : ''}</div>
    </section>`;
  }

  // ── 타수·정확도 ──
  const cpm = () => (st && st.ms > 0 ? Math.round((st.keys / st.ms) * 60000) : 0);
  const acc = () => (st && st.typed ? Math.max(0, Math.round(((st.typed - st.back) / st.typed) * 100)) : 100);
  function stamp(it) { // 한 문제를 다 친 시간·키 수를 더한다
    if (st.t0) { st.ms += Date.now() - st.t0; st.keys += keysOf(it.answer).length; }
    st.t0 = 0;
    const b = S.get(K('best'), {}) || {}; const c = cpm();
    if (st.keys >= 30 && c > (b.cpm || 0)) S.set(K('best'), { cpm: c });
  }
  function save(it, ok) {
    const r = rec(); const x = r[it.id] || { t: 0, w: 0 };
    x.t++; if (!ok) x.w++; x.ok = ok; r[it.id] = x; S.set(K('rec'), r);
  }

  // ── 입력 ──
  const isOk = (it, v) => it.accepts.some((a) => norm(a) === norm(v));
  function finish(ok, val) {
    const it = cur();
    if (st.phase === 'type') {
      st.lastOk = ok; st.lastIn = val; save(it, ok);
      if (ok) st.ok++; else st.wrong.push(it);
      if (!ok) { st.phase = 'retype'; st.t0 = 0; render(); return; }
    }
    stamp(it); st.phase = 'done'; render();
  }
  function submit() {
    const inp = document.getElementById('ty-in'); if (!inp) return;
    if (st.phase === 'done') { next(); return; }
    const v = inp.value.trim(); if (!v) return;
    if (showTarget()) { if (norm(v) === norm(cur().answer)) finish(true, v); return; }
    finish(isOk(cur(), v), v);
  }
  function next() { st.i++; st.phase = 'type'; st.hint = false; st.t0 = 0; render(); }

  let lastEnter = 0;
  MAIN.addEventListener('keydown', (e) => {
    if (e.target.id !== 'ty-in') return;
    flash(e.code);
    if (e.key === 'Enter' || e.code === 'Enter') {
      e.preventDefault();
      // 한글 조합 중 Enter 는 브라우저마다 두 번 오기도 해서, 조합이 끝난 뒤 한 번만 처리한다
      if (Date.now() - lastEnter < 150) return; lastEnter = Date.now();
      setTimeout(submit, 0); return;
    }
    if (st.phase === 'done') return;
    if (e.code === 'Backspace') st.back++;
    else if (/^(Key|Digit|Space)/.test(e.code)) { st.typed++; if (!st.t0) st.t0 = Date.now(); }
  });
  MAIN.addEventListener('input', (e) => {
    if (e.target.id !== 'ty-in') return;
    paint();
    // 보고 치기: 다 치면 바로 끝 (마지막 글자 조합은 blur 로 마무리)
    if (showTarget() && norm(e.target.value) === norm(cur().answer)) { e.target.blur(); finish(true, e.target.value); }
  });
  function flash(code) {
    const k = code === 'Space' ? ' ' : /^Key/.test(code) ? code.slice(3).toLowerCase() : /^Digit/.test(code) ? code.slice(5) : /^Shift/.test(code) ? 'shift' : code === 'Backspace' ? 'backspace' : code === 'Enter' ? 'enter' : null;
    if (k == null) return;
    document.querySelectorAll(`.ty-kb [data-k="${CSS.escape(k)}"]`).forEach((el) => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); });
  }
  // 끝난 화면(입력칸 없음)에서도 Enter 로 넘어가기
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || (e.target && e.target.id === 'ty-in')) return;
    if (st && st.i >= st.items.length && st.items.length) { e.preventDefault(); newRound(); }
  });

  MAIN.addEventListener('click', (e) => {
    const c = e.target.closest('[data-o]');
    if (c) { setOpt(c.dataset.o, c.dataset.v); newRound(); return; }
    const a = e.target.closest('[data-a]'); if (!a) return;
    const act = a.dataset.a;
    if (act === 'next') next();
    else if (act === 'restart') newRound();
    else if (act === 'wrongonly') { setOpt('scope', 'wrong'); newRound(); }
    else if (act === 'hint') { st.hint = true; paint(); document.getElementById('ty-in').focus(); }
    else if (act === 'skip') finish(false, '');
  });
  // 빈 곳을 눌러도 입력칸으로
  MAIN.addEventListener('mouseup', (e) => {
    if (e.target.closest('button, a, input') || window.getSelection().toString()) return;
    const inp = document.getElementById('ty-in'); if (inp && !inp.readOnly) inp.focus();
  });

  document.querySelector('.gt-tabs').innerHTML = TABS.map(([t, l]) => `<a href="#${t}" data-t="${t}">${l}</a>`).join('');
  window.addEventListener('hashchange', newRound);
  newRound();
})();
