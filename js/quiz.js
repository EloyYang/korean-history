(function () {
  const EX = window.currentExam();
  window.setupExamHeader(document.getElementById("quiz") ? "quiz" : "review");
  const KEY = (window.QUIZ_KEYS || {})[EX.id] || {};
  const S = window.UserStore;
  const N = (r) => (KEY[r] ? KEY[r].ans.length : 50);
  const TOTAL = (r) => (KEY[r] ? KEY[r].pt.reduce((a, b) => a + b, 0) : 100);
  // 시대별 풀기·랜덤 모의고사는 '세트'로 만든다: 세트 id(문자열) → 실제 [회차, 번호] 목록
  const SETS_KEY = window.ATTEMPTS.key('quizSets');
  const SETLOG_KEY = window.ATTEMPTS.key('setLog');
  const SETS = {};
  const isSet = (r) => typeof r === 'string' && !!SETS[r];
  const real = (r, n) => (isSet(r) ? SETS[r].items[n - 1] : [r, n]);
  function registerSet(id, set) {
    SETS[id] = set;
    const ans = [], pt = [], hot = [];
    set.items.forEach(([r, n]) => { const k = KEY[r]; ans.push(k ? k.ans[n - 1] : 0); pt.push(k ? k.pt[n - 1] : 0); hot.push(k && k.hot ? k.hot[n - 1] : null); });
    KEY[id] = { ans, pt, hot };
  }
  const rname = (r) => (isSet(r) ? SETS[r].title : EX.round.replace('{r}', r));
  const imgOf = (r, n) => { const [rr, nn] = real(r, n); return EX.img.replace('{r}', rr).replace('{n}', String(nn).padStart(2, '0')); };
  const NUMS = '①②③④⑤';
  const rounds = Object.keys(KEY).map(Number).sort((a, b) => b - a);
  Object.entries(S.get(SETS_KEY, {}) || {}).forEach(([id, st]) => { if (st && st.items) registerSet(id, st); });
  const box = document.getElementById('quiz');
  const bar = document.getElementById('quiz-bar');
  const draftKey = (r) => window.ATTEMPTS.key('quizDraft.' + r);
  const load = (k, d) => S.get(k, d);
  const save = (k, v) => S.set(k, v);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const mmss = (s) => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + ':' + String(x).padStart(2, '0'); };
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);

  // view: list | solve | result
  const state = { round: null, answers: {}, times: {}, cur: 1, graded: false, view: 'list', onlyWrong: false, onlyFlag: false, showGrid: false, paused: false };
  // 헷갈리는 문제 표시: 회차별 번호 목록 — 채점과 상관없이 남고, 오답 노트에서 모아 본다
  const flagKey = (r) => window.ATTEMPTS.key('flag.' + r);
  const rawFlags = (r) => S.get(flagKey(r), []) || [];
  const isFlag = (r, n) => { const [rr, nn] = real(r, n); return rawFlags(rr).includes(nn); };
  const flags = (r) => (isSet(r) ? SETS[r].items.map((_, i) => i + 1).filter((n) => isFlag(r, n)) : rawFlags(r));
  function toggleFlag() {
    const [r, n] = real(state.round, state.cur); const f = rawFlags(r);
    S.set(flagKey(r), f.includes(n) ? f.filter((x) => x !== n) : [...f, n].sort((a, b) => a - b));
    const on = isFlag(state.round, state.cur); const n2 = state.cur;
    document.querySelectorAll('.q-flag').forEach((b) => { b.setAttribute('aria-pressed', on); b.innerHTML = on ? '🚩 헷갈림 표시됨' : '🏳 헷갈림 표시'; });
    const g = box.querySelector(`.q-grid [data-go="${n2}"]`); if (g) g.classList.toggle('flag', on);
  }
  // 일시정지: 시간이 멈추고 문제가 가려진다
  function setPause(on) {
    if (state.graded || state.view !== 'solve') return;
    state.paused = on; saveDraft();
    const one = box.querySelector('.q-one'); if (one) one.classList.toggle('paused', on);
    const b = box.querySelector('.q-pause'); if (b) { b.setAttribute('aria-pressed', on); b.textContent = on ? '▶ 다시 시작' : '⏸ 일시정지'; }
  }
  let timer = null;

  const setLog = () => S.get(SETLOG_KEY, []) || [];
  const lastAttempt = (r) => (isSet(r) ? setLog().find((a) => a.id === r) : window.ATTEMPTS.all().find((a) => a.round === r));
  document.title = `기출 풀기 · ${EX.name}`;
  function score(r, answers) {
    const k = KEY[r]; let s = 0; const wrong = [];
    for (let n = 1; n <= k.ans.length; n++) { if (answers[n] === k.ans[n - 1]) s += k.pt[n - 1]; else wrong.push(n); }
    return { score: s, wrong };
  }
  const saveDraft = () => { if (!state.graded) save(draftKey(state.round), { answers: state.answers, times: state.times, cur: state.cur, paused: state.paused }); };

  // ── 시간 재기: 문제 화면이 보이는 동안 그 문제의 시간을 1초씩 더한다
  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (state.view !== 'solve' || state.graded || state.paused || document.visibilityState !== 'visible') return;
      state.times[state.cur] = (state.times[state.cur] || 0) + 1;
      const t = document.getElementById('q-time');
      if (t) t.innerHTML = `이 문제 <b>${mmss(state.times[state.cur])}</b> · 총 <b>${mmss(sum(state.times))}</b>`;
      if (sum(state.times) % 5 === 0) saveDraft();
    }, 1000);
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }

  // ── 시대 구분 (오답 노트와 같은 묶음)
  const PERIODS = [
    ['선사 시대', ['prehistoric']], ['고조선', ['gojoseon']], ['여러 나라', ['states']],
    ['삼국', ['c4', 'c5', 'c6', 'c7']], ['통일신라·발해', ['nambuk']], ['후삼국', ['husamguk']],
    ['고려 전기', ['goryeo1']], ['고려 후기', ['goryeo2']], ['조선 전기', ['joseon1', 'imjin']],
    ['조선 후기·개항기', ['horan', 'gaehang']], ['일제 강점기', ['colonial']], ['광복 이후', ['modern']],
  ];
  const EXAMQ = window.EXAM || {};
  // 문항 시대는 QERA(문제가 묻는 시대 — 문항 내용으로 확인한 표)를 쓴다
  const qEra = (r, n) => { const e = (window.QERA || {})[`${r}-${n}`]; if (e != null) return e; const row = (EXAMQ[r] || []).find((x) => x[0] === n); return row ? (row[7] >= 0 ? row[6] : row[1]) : ''; };
  const periodOfQ = (r, n) => { const e = qEra(r, n); if (!e) return -1; return PERIODS.findIndex((p) => p[1].includes(e)); };
  const pname = (i) => (PERIODS[i] ? PERIODS[i][0] : '기타 (통합)');
  const pref = { get: (k, d) => { try { const v = localStorage.getItem('khmap.quizUi.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem('khmap.quizUi.' + k, JSON.stringify(v)); } catch (e) { /* 무시 */ } } };
  const ui = { tab: pref.get('tab', 'round'), periods: pref.get('periods', []), rounds: pref.get('rounds', []), order: pref.get('order', 'round'), count: pref.get('count', 20), mockRounds: pref.get('mockRounds', []), mockMode: pref.get('mockMode', 'even'), scope: pref.get('scope', 'all') };
  const pool = (sel) => (sel.length ? rounds.filter((r) => sel.includes(r)) : rounds);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newId = (p) => p + Date.now().toString(36);
  function saveSet(id, set) {
    registerSet(id, set);
    const all = S.get(SETS_KEY, {}) || {}; all[id] = set;
    // 오래된 세트는 정리 (풀던 중인 것과 기록이 남은 것은 남긴다)
    const ids = Object.keys(all).sort((a, b) => (all[b].t || 0) - (all[a].t || 0));
    ids.slice(40).forEach((x) => { if (!load(draftKey(x), null)) delete all[x]; });
    S.set(SETS_KEY, all);
  }
  // 시대 순서: 시대 묶음 → 그 안의 세부 시대(4세기→5세기…) 순
  const eraIdx = (r, n) => { const e = qEra(r, n); if (!e) return 999; const i = (window.ERAS || []).findIndex((x) => x.id === e); return i < 0 ? 999 : i; };
  const chrono = (a, b) => ((periodOfQ(...a) + 100) % 100) - ((periodOfQ(...b) + 100) % 100) || eraIdx(...a) - eraIdx(...b);
  // 범위를 정한 랜덤: 고른 시대·회차 안에서 무작위로 뽑되, 문제는 시대 순서대로 놓는다
  function makePeriodSet() {
    const ps = ui.periods.map(Number);
    let items = [];
    pool(ui.rounds).forEach((r) => { for (let n = 1; n <= N(r); n++) if (!ps.length || ps.includes(periodOfQ(r, n))) items.push([r, n]); });
    if (!items.length) { alert('고른 시대·회차에 해당하는 문제가 없어요.'); return; }
    const W = ui.mockMode === 'even' ? new Map() : weakMap();
    const pri = ([r, n]) => W.get(`${r}-${n}`) || 0;
    items = shuffle(items).sort((a, b) => pri(b) - pri(a));
    if (ui.count) items = items.slice(0, ui.count);
    const weakN = items.filter((x) => pri(x) > 0).length;
    items.sort(chrono);
    const scope = `${ps.length ? ps.sort((a, b) => a - b).map(pname).join('·') : '전체 시대'}${ui.rounds.length ? ` · ${pool(ui.rounds).map((r) => r + '회').join('·')}` : ''}`;
    const title = `${scope} ${items.length}문항${ui.mockMode !== 'even' && weakN ? ` · ${ui.mockMode === 'weakflag' ? '틀림·헷갈림' : '틀린 문제'} ${weakN}문항 포함` : ''}`;
    const id = newId('P'); saveSet(id, { title, kind: 'period', items, weak: weakN, t: Date.now() }); location.hash = id;
  }
  // 랜덤 모의고사: 기준 회차 하나의 시대 배치·배점을 그대로 두고, 자리마다 같은 시대·같은 배점 문제를 다른 회차에서 무작위로
  // 내가 틀렸던 문제·헷갈린 문제 (외웠어요 표시한 문제는 뺀다) → 우선순위 2·1
  function weakMap() {
    const w = new Map(); const add = (r, n, v) => { const k = `${r}-${n}`; w.set(k, Math.max(w.get(k) || 0, v)); };
    window.ATTEMPTS.all().forEach((l) => l.wrong.forEach((n) => add(l.round, n, 2)));
    setLog().forEach((l) => (l.wrong || []).forEach((p) => { const it = (l.items || [])[p - 1]; if (it) add(it[0], it[1], 2); }));
    Object.entries(S.get(window.ATTEMPTS.key('retry'), {}) || {}).forEach(([k, x]) => { if (x && x.last === 'no') { const [r, n] = k.split('-').map(Number); add(r, n, 2); } });
    if (ui.mockMode === 'weakflag') rounds.forEach((r) => rawFlags(r).forEach((n) => add(r, n, 1)));
    (S.get(window.ATTEMPTS.key('mastered'), []) || []).forEach((k) => w.delete(k));
    return w;
  }
  function makeMockSet() {
    const P = rounds;
    if (!P.length) return;
    const W = ui.mockMode === 'even' ? new Map() : weakMap();
    const pri = ([r, n]) => W.get(`${r}-${n}`) || 0;
    const base = P[Math.floor(Math.random() * P.length)];
    const used = new Set(); const items = [];
    const cand = {};
    P.forEach((r) => { for (let n = 1; n <= N(r); n++) { const key = `${periodOfQ(r, n)}|${KEY[r].pt[n - 1]}`; (cand[key] = cand[key] || []).push([r, n]); } });
    for (let n = 1; n <= N(base); n++) {
      const key = `${periodOfQ(base, n)}|${KEY[base].pt[n - 1]}`;
      // 틀린 문제 위주: 같은 시대·배점 후보 중 틀렸던(헷갈린) 문제를 먼저, 없으면 나머지에서 무작위
      const opts = shuffle(cand[key] || []).filter(([r, m]) => !used.has(`${r}-${m}`)).sort((a, b) => pri(b) - pri(a));
      const pick = opts[0] || [base, n];
      used.add(`${pick[0]}-${pick[1]}`); items.push(pick);
    }
    const no = setLog().filter((x) => x.kind === 'mock').length + Object.values(SETS).filter((x) => x.kind === 'mock').length + 1;
    const weakN = items.filter((x) => pri(x) > 0).length;
    if (ui.mockMode !== 'even' && !weakN) { alert('아직 틀렸거나 헷갈린 문제 기록이 없어서 골고루 섞어 만들었어요.'); }
    const title = `랜덤 모의고사 ${no}${ui.mockMode !== 'even' && weakN ? ` · ${ui.mockMode === 'weakflag' ? '틀림·헷갈림' : '틀린 문제'} ${weakN}문항 포함` : ''}`;
    const id = newId('M'); saveSet(id, { title, kind: 'mock', base, items, weak: weakN, t: Date.now() }); location.hash = id;
  }

  // ── 출제 경향표: 번호(자리)마다 회차별로 어떤 시기·주제가 나왔는지 + 다음 회차 예측
  const GICHUL_ = window.GICHUL || {};
  const stripH = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
  const rowOf = (r, n) => (EXAMQ[r] || []).find((x) => x[0] === n);
  const grpOfEra = (e) => PERIODS.findIndex((p) => p[1].includes(e));
  // 문항에 연결된 기출 포인트 — 문항이 묻는 시대와 같은 시대의 포인트만 (답 선지 쪽 시대 포인트는 표·예측에 쓰지 않는다)
  const ptKey = (r, n) => { const row = rowOf(r, n); if (!row || row[7] < 0) return null; return grpOfEra(row[6]) === periodOfQ(r, n) ? `${row[6]}#${row[7]}` : null; };
  const ptLabel = (key) => { if (!key) return ''; if (key.startsWith('Q:')) { const [r, n] = key.slice(2).split('-').map(Number); return `${cellLabel(r, n)} (${r}회)`; } const [e, i] = key.split('#'); const p = (GICHUL_[e] || {}).pts; const t = p && p[+i] ? stripH(p[+i][1]) : ''; // '부여: …' 처럼 제목이 있으면 제목, 없으면(고조선 '범금 8조로 …' 등) 첫 구절을 쓴다
    const h = (/[:：]/.test(t) ? t.split(/[:：]/)[0] : t.split(/\s*(?:←|→|\/|,|·\s)\s*/)[0]).trim();
    if (!h || /헷갈|주의|비교|구분|정리|참고/.test(h)) return '';
    return h.length > 16 ? h.slice(0, 15) + '…' : h; };
  const short = (t) => String(t || '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  function cellLabel(r, n) {
    const fromPt = ptLabel(ptKey(r, n)); if (fromPt) return fromPt.length > 16 ? fromPt.slice(0, 15) + '…' : fromPt;
    const m = ((window.QMETA || {})[r] || [])[n - 1] || ''; const [when, st, king] = m.split('|').map(short);
    const row = rowOf(r, n); const theme = row ? row[2] : '';
    if (king && st) return `${st.split(/[ /·]/)[0]} ${king}`.slice(0, 16);
    if (!st && when) return when.split(/[ ,]/)[0];
    return theme || st || when || '';
  }
  const PCOL = ['#8d6e63', '#a1887f', '#9575cd', '#5c6bc0', '#26a69a', '#66bb6a', '#d4a017', '#f39c12', '#e57373', '#ec407a', '#8e44ad', '#546e7a'];
  let TREND = null;
  function buildTrend() {
    if (TREND) return TREND;
    const R = rounds.slice(); const next = Math.max(...R) + 1; const latest = R[0];
    const freq = {}; const lastSeen = {};
    R.forEach((r) => { for (let n = 1; n <= N(r); n++) { const k = ptKey(r, n); if (!k) continue; freq[k] = (freq[k] || 0) + 1; lastSeen[k] = Math.max(lastSeen[k] || 0, r); } });
    const used = new Set(); const rows = [];
    for (let n = 1; n <= 50; n++) {
      const pc = {}; R.forEach((r) => { const p = periodOfQ(r, n); pc[p] = (pc[p] || 0) + 1; });
      const [topP, topC] = Object.entries(pc).sort((a, b) => b[1] - a[1])[0];
      // 이 자리 근처(±1)에 나왔던 같은 시대 포인트 중, 자주 나오고 최근에 안 나온 것
      const cand = {};
      R.forEach((r) => [n - 1, n, n + 1].forEach((m) => { if (m < 1 || m > N(r)) return; const k = ptKey(r, m); if (!k || String(periodOfQ(r, m)) !== topP) return; cand[k] = (cand[k] || 0) + (m === n ? 3 : 1); }));
      const stars = (k) => { const [e, i] = k.split('#'); const p = (GICHUL_[e] || {}).pts; return p && p[+i] ? Math.min(p[+i][0], 3) : 0; };
      const score = (k) => cand[k] + (freq[k] || 0) + stars(k) - (lastSeen[k] === latest ? 5 : lastSeen[k] === latest - 1 ? 2 : 0);
      let picks = Object.keys(cand).filter((k) => ptLabel(k)).sort((a, b) => score(b) - score(a)).filter((k) => !used.has(k)).slice(0, 3);
      // 같은 시대 기출 포인트가 없는 자리는 그 자리에 나왔던 같은 시대 문제를 대신 보여 준다 (Q:회차-번호)
      if (!picks.length) picks = R.filter((r) => String(periodOfQ(r, n)) === topP).slice(0, 3).map((r) => `Q:${r}-${n}`);
      if (picks[0]) used.add(picks[0]);
      rows.push({ n, period: +topP, pct: Math.round((topC / R.length) * 100), picks, recent: lastSeen });
    }
    TREND = { R, next, latest, rows };
    return TREND;
  }
  // 예상 주제를 실제로 물었던 문제 (같은 번호 근처 → 최근 회차 순으로)
  function qsOfPoint(k, n) {
    if (k.startsWith('Q:')) return [k.slice(2).split('-').map(Number)];
    const out = [];
    rounds.forEach((r) => { for (let m = 1; m <= N(r); m++) if (ptKey(r, m) === k) out.push([r, m]); });
    return out.sort((a, b) => Math.abs(a[1] - n) - Math.abs(b[1] - n) || b[0] - a[0]);
  }
  // 80회 예상 모의고사: 자리마다 예상 주제를 물었던 문제를 넣고, 배점 합이 100점이 되게 맞춘다
  function makePredictSet() {
    const T = buildTrend(); const used = new Set(); const slots = [];
    T.rows.forEach((x) => {
      const ptc = {}; T.R.forEach((r) => { const p = KEY[r].pt[x.n - 1]; ptc[p] = (ptc[p] || 0) + 1; });
      const modal = +Object.entries(ptc).sort((a, b) => b[1] - a[1])[0][0];
      let cands = x.picks.flatMap((k) => qsOfPoint(k, x.n));
      if (!cands.length) T.R.forEach((r) => { if (periodOfQ(r, x.n) === x.period) cands.push([r, x.n]); });
      cands = cands.filter((c) => !used.has(c.join('-')));
      const pick = cands.find((c) => KEY[c[0]].pt[c[1] - 1] === modal) || cands[0] || [T.R[0], x.n];
      used.add(pick.join('-')); slots.push({ n: x.n, pick, cands });
    });
    // 총점 100점 맞추기: 다른 후보로 바꿔 합을 조정
    const pt = ([r, n]) => KEY[r].pt[n - 1];
    let total = slots.reduce((a, s0) => a + pt(s0.pick), 0);
    for (let guard = 0; guard < 200 && total !== 100; guard++) {
      const need = 100 - total; let done = false;
      for (const s0 of shuffle(slots)) {
        const alt = s0.cands.find((c) => !used.has(c.join('-')) && pt(c) - pt(s0.pick) !== 0 && Math.abs(need - (pt(c) - pt(s0.pick))) < Math.abs(need));
        if (alt) { used.delete(s0.pick.join('-')); used.add(alt.join('-')); total += pt(alt) - pt(s0.pick); s0.pick = alt; done = true; break; }
      }
      if (!done) break;
    }
    const items = slots.map((s0) => s0.pick);
    const id = newId('X'); saveSet(id, { title: `${T.next}회 예상 모의고사`, kind: 'predict', items, t: Date.now() }); location.hash = id;
  }
  function trendHtml() {
    const T = buildTrend();
    const pcell = (p) => `<span class="tr-per" style="--c:${PCOL[p] || '#777'}">${escH(pname(p))}</span>`;
    return `<p class="q-desc">번호(자리)마다 ${T.R[T.R.length - 1]}~${T.R[0]}회에 어떤 시기·주제가 나왔는지 모았어요. <b>${T.next}회 예상</b>은 그 자리에 가장 자주 나온 시대와, 그 근처 자리에서 자주 나왔지만 최근 회차(${T.latest}·${T.latest - 1}회)에는 덜 나온 기출 포인트를 골라 계산한 참고용 예측이에요. 칸을 누르면 그 문제가 열려요.</p>
      <div class="q-row tr-go"><button type="button" class="q-make" data-qmake="predict">▶ ${T.next}회 예상 문제로 모의고사 풀기</button><small>번호마다 예상 1순위 주제를 실제로 물었던 기출 문제를 넣어 50문항·100점으로 만들어요 · 예상 칸의 주제를 누르면 그 주제 문제만 바로 볼 수 있어요</small></div>
      <div class="tr-wrap"><table class="tr-table">
        <thead><tr><th class="tr-n">번호</th><th class="tr-pred">${T.next}회 예상</th>${T.R.map((r) => `<th>${r}회</th>`).join('')}</tr></thead>
        <tbody>${T.rows.map((x) => `<tr><th class="tr-n">${x.n}</th>
          <td class="tr-pred">${pcell(x.period)} <small>${x.pct}%</small>${x.picks.length ? `<ol>${x.picks.map((k) => `<li><button type="button" class="tr-topic" data-trpt="${k}" data-trn="${x.n}" title="이 주제를 물었던 문제 보기">${escH(ptLabel(k))}</button>${x.recent[k] ? ` <small>최근 ${x.recent[k]}회</small>` : ''}</li>`).join('')}</ol>` : ''}</td>
          ${T.R.map((r) => { const p = periodOfQ(r, x.n); return `<td class="tr-c" style="--c:${PCOL[p] || '#777'}" data-trq="${r}-${x.n}" title="${escH(pname(p))} · ${r}회 ${x.n}번">${escH(cellLabel(r, x.n))}</td>`; }).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <p class="r-note">예측은 지난 ${T.R.length}개 회차의 출제 위치와 빈도만으로 계산한 참고 자료예요. 실제 출제와 다를 수 있어요.</p>`;
  }

  // ── 회차 목록 · 시대별 · 랜덤 모의고사
  function setsHtml() {
    const ids = Object.keys(SETS).sort((a, b) => (SETS[b].t || 0) - (SETS[a].t || 0));
    if (!ids.length) return '';
    return `<h3 class="r-h">내가 만든 모의고사 <small>누르면 이어 풀거나 결과를 볼 수 있어요</small></h3>
      <ul class="q-rounds">${ids.map((id) => {
        const a = lastAttempt(id); const dr = load(draftKey(id), null); const dn = dr ? Object.keys(dr.answers || {}).length : 0;
        return `<li><a href="#${id}"><b>${escH(SETS[id].title)}</b>
          <span>${a ? `최근 <em>${a.score}점</em>/${a.max || TOTAL(id)} · 틀림 ${a.wrong.length}${a.date ? ` · ${a.date}` : ''}` : `${N(id)}문항 · 아직 안 풀었어요`}</span>
          ${dn ? `<span class="q-draft">이어 풀기 ${dn}/${N(id)} · ${mmss(sum(dr.times))}</span>` : ''}</a><button type="button" class="q-setdel" data-setdel="${id}" title="이 세트 지우기">✕</button></li>`;
      }).join('')}</ul>`;
  }
  function weakCount(mode, P) { const m0 = ui.mockMode; ui.mockMode = mode; const W = weakMap(); ui.mockMode = m0; return [...W.keys()].filter((k) => P.includes(+k.split('-')[0])).length; }
  const chip = (attr, v, on, label, extra) => `<button type="button" ${attr}="${v}" aria-pressed="${on}">${label}${extra != null ? ` <small>${extra}</small>` : ''}</button>`;
  function renderList() {
    stopTimer(); bar.hidden = true; state.view = 'list';
    const tabs = [['round', '회차별'], ['mock', '랜덤 모의고사'], ['trend', '출제 경향·예측']];
    if (ui.tab === 'period') ui.tab = 'mock';
    const head = `<h2 class="r-h">${EX.name}${EX.level ? ` (${EX.level})` : ''} · 기출 풀기</h2>
      <div class="q-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-qtab="${k}" aria-selected="${ui.tab === k}">${l}</button>`).join('')}</div>`;
    let body = '';
    if (ui.tab === 'trend') {
      body = trendHtml() + setsHtml();
    } else if (ui.tab === 'mock') {
      const scoped = ui.scope === 'scope';
      const P = scoped ? pool(ui.rounds) : rounds; const cnt = {};
      P.forEach((r) => { for (let n = 1; n <= N(r); n++) { const p = periodOfQ(r, n); cnt[p] = (cnt[p] || 0) + 1; } });
      const ps = ui.periods.map(Number); const total = ps.length ? ps.reduce((a, p) => a + (cnt[p] || 0), 0) : Object.values(cnt).reduce((a, b) => a + b, 0);
      const modeRow = `<div class="q-row"><span class="q-lab">문제 구성</span><span class="r-chips">${[['even', '골고루 랜덤'], ['weak', '틀린 문제 위주'], ['weakflag', '틀림 + 헷갈림 위주']].map(([k, l]) => chip('data-qmmode', k, ui.mockMode === k, l, k === 'even' ? null : weakCount(k, P))).join('')}</span></div>`;
      body = `<div class="q-builder">
        <div class="q-row"><span class="q-lab">범위</span><span class="r-chips">${chip('data-qscope', 'all', !scoped, '전체 랜덤 (실전형 50문항·100점)')}${chip('data-qscope', 'scope', scoped, '시대·회차를 골라서')}</span></div>
        ${scoped ? `
        <div class="q-row"><span class="q-lab">시대</span><span class="r-chips">${chip('data-qper', 'all', !ps.length, '모든 시대')}${[...PERIODS.keys(), -1].filter((i) => cnt[i]).map((i) => chip('data-qper', i, ps.includes(i), pname(i), cnt[i])).join('')}</span></div>
        <div class="q-row"><span class="q-lab">회차</span><span class="r-chips">${chip('data-qround', 'all', !ui.rounds.length, '전체 회차')}${rounds.map((r) => chip('data-qround', r, ui.rounds.includes(r), r + '회')).join('')}</span></div>
        <div class="q-row"><span class="q-lab">문항 수</span><span class="r-chips">${[10, 20, 30, 50, 0].map((c) => chip('data-qcount', c, ui.count === c, c ? `${c}문항` : '전부')).join('')}</span></div>
        ${modeRow}
        <p class="q-desc">고른 범위 안에서 무작위로 뽑고, 문제는 <b>시대 순서대로</b>(선사 → 광복 이후) 놓아요.</p>
        <div class="q-row"><button type="button" class="q-make" data-qmake="period" ${total ? '' : 'disabled'}>▶ ${total ? `${ui.count ? Math.min(ui.count, total) : total}문항 만들기` : '고른 범위에 문제가 없어요'}</button></div>`
        : `
        <p class="q-desc">10개 회차 전체에서 섞어 <b>50문항 · 100점</b> 시험을 만들어요. 실제 시험 한 회차의 <b>시대 배치와 배점을 그대로</b> 두고, 자리마다 같은 시대·같은 배점의 문제를 다른 회차에서 무작위로 가져와요. 그래서 문제가 시대 순서대로 나와요.</p>
        ${modeRow}
        ${ui.mockMode !== 'even' ? `<p class="q-desc">자리마다 <b>내가 틀렸던 문제${ui.mockMode === 'weakflag' ? '·헷갈림 표시한 문제' : ''}</b>를 먼저 넣어요. 그런 문제가 없는 자리는 다른 문제로 채워요. ‘외웠어요’ 표시한 문제는 빼요.</p>` : ''}
        <div class="q-row"><button type="button" class="q-make" data-qmake="mock">▶ 랜덤 모의고사 만들기</button></div>`}
      </div>${setsHtml()}`;
    } else {
      body = `<ul class="q-rounds">${rounds.map((r) => {
        const a = lastAttempt(r); const dr = load(draftKey(r), null); const dn = dr ? Object.keys(dr.answers || {}).length : 0;
        return `<li><a href="#${r}"><b>${rname(r)}</b>
          <span>${a ? `최근 ${a.score != null ? `<em>${a.score}점</em> · ` : ''}틀림 ${a.wrong.length}${a.total ? ` · ${mmss(a.total)}` : ''}${a.date ? ` · ${a.date}` : ''}` : '아직 안 풀었어요'}</span>
          ${dn ? `<span class="q-draft">이어 풀기 ${dn}/${N(r)} · ${mmss(sum(dr.times))}</span>` : ''}</a></li>`;
      }).join('')}</ul>`;
    }
    box.innerHTML = head + body + `
      <p class="r-note">문제 이미지의 ①~⑤를 누르면 답이 선택되고 다음 문제로 넘어가요. 문제마다 머문 시간과 총 소요 시간이 기록돼요. 키보드 1~5 · ← → 도 쓸 수 있어요. 헷갈리는 문제는 🏳 헷갈림 표시(F), 잠깐 쉴 땐 ⏸ 일시정지(P).<br>회차별 채점 기록은 오답 노트에 바로 반영돼요. 랜덤 모의고사 기록은 그 탭의 ‘내가 만든 모의고사’에 남고, 메모는 모의고사마다 따로, 헷갈림 표시는 원래 회차 문제에 저장돼요. 문항 사진 등의 저작권은 원저작자에게 있어요.</p>`;
  }
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  document.addEventListener('click', (e) => {
    if (state.view !== 'list') return;
    const tq = e.target.closest('[data-trq]'); if (tq && window.QView) { const [r, n] = tq.dataset.trq.split('-').map(Number); const T = buildTrend(); window.QView.open(T.R.map((x) => `${x}-${n}`), { start: T.R.indexOf(r), title: `${n}번 자리 문제 (회차별)`, showAnswer: false }); return; }
    const t = e.target.closest('[data-qtab]'); if (t) { ui.tab = t.dataset.qtab; pref.set('tab', ui.tab); renderList(); return; }
    const sc = e.target.closest('[data-qscope]'); if (sc) { ui.scope = sc.dataset.qscope; pref.set('scope', ui.scope); renderList(); return; }
    const pe = e.target.closest('[data-qper]'); if (pe) { ui.periods = pe.dataset.qper === 'all' ? [] : toggleIn(ui.periods.map(Number), +pe.dataset.qper); pref.set('periods', ui.periods); renderList(); return; }
    const ro = e.target.closest('[data-qround]'); if (ro) { ui.rounds = ro.dataset.qround === 'all' ? [] : toggleIn(ui.rounds, +ro.dataset.qround); pref.set('rounds', ui.rounds); renderList(); return; }
    const mm = e.target.closest('[data-qmmode]'); if (mm) { ui.mockMode = mm.dataset.qmmode; pref.set('mockMode', ui.mockMode); renderList(); return; }
    const ct = e.target.closest('[data-qcount]'); if (ct) { ui.count = +ct.dataset.qcount; pref.set('count', ui.count); renderList(); return; }
    const mk = e.target.closest('[data-qmake]'); if (mk) { const k = mk.dataset.qmake; if (k === 'period') makePeriodSet(); else if (k === 'predict') makePredictSet(); else makeMockSet(); return; }
    const tp = e.target.closest('[data-trpt]'); if (tp && window.QView) { const qs = qsOfPoint(tp.dataset.trpt, +tp.dataset.trn); window.QView.open(qs.map((x) => x.join('-')), { title: `예상 주제: ${ptLabel(tp.dataset.trpt)}`, note: `이 주제를 물었던 기출 ${qs.length}문항`, showAnswer: false }); return; }
    const del = e.target.closest('[data-setdel]');
    if (del) {
      const id = del.dataset.setdel; if (!confirm(`'${SETS[id].title}'을(를) 지울까요?\n(이 세트의 풀이 기록과 메모도 지워져요. 헷갈림 표시는 원래 회차에 남아요)`)) return;
      const all = S.get(SETS_KEY, {}) || {}; delete all[id]; S.set(SETS_KEY, all); delete SETS[id]; delete KEY[id];
      S.set(SETLOG_KEY, setLog().filter((x) => x.id !== id)); S.set(memoKey(id), {}); S.set(oldKey(id), []); try { localStorage.removeItem(draftKey(id)); } catch (err) { /* 무시 */ }
      renderList();
    }
  });

  // ── 한 문제 화면
  function solveHtml() {
    const r = state.round, n = state.cur, k = KEY[r];
    const a = state.answers[n], right = k.ans[n - 1];
    const hot = (k.hot && k.hot[n - 1]) || [];
    const sh = state.graded && state.shownSolve;
    const res = sh ? (a === right ? 'right' : 'wrong') : '';
    const spots = [0, 1, 2, 3, 4].map((i) => {
      const h = hot[i]; if (!h) return '';
      let c = a === i + 1 ? ' pick' : '';
      if (sh) c += i + 1 === right ? ' ans' : a === i + 1 ? ' miss' : '';
      return `<button type="button" class="q-spot${c}" data-i="${i + 1}" style="left:${h[0] * 100}%;top:${h[1] * 100}%;width:${h[2] * 100}%;height:${h[3] * 100}%" aria-label="${NUMS[i]} 선택" ${state.graded ? 'disabled' : ''}></button>`;
    }).join('');
    const missing = hot.filter(Boolean).length < 5;
    return `
      <div class="q-one ${res}${state.paused && !state.graded ? ' paused' : ''}">
        <div class="q-head">
          <b>${n}번</b>${isSet(r) ? `<span class="q-src">${real(r, n)[0]}회 ${real(r, n)[1]}번</span>` : ''}<span>${k.pt[n - 1]}점</span>
          ${state.graded ? `${sh ? `<span class="q-res">${a === right ? '정답' : a ? `오답 (고른 답 ${NUMS[a - 1]})` : '안 품'} · 정답 ${NUMS[right - 1]}</span>` : `<span class="q-res mine">내가 고른 답 ${a ? NUMS[a - 1] : '없음'}</span>`}<span class="q-tm">머문 시간 ${mmss(state.times[n])}</span>`
            : `<span id="q-time" class="q-tm">이 문제 <b>${mmss(state.times[n])}</b> · 총 <b>${mmss(sum(state.times))}</b></span><button type="button" class="q-pause" aria-pressed="${state.paused}" title="일시정지 (P)">${state.paused ? '▶ 다시 시작' : '⏸ 일시정지'}</button>`}
          <button type="button" class="q-flag" aria-pressed="${isFlag(r, n)}" title="헷갈리는 문제로 표시 (F) — 오답 노트에 모여요">${isFlag(r, n) ? '🚩 헷갈림 표시됨' : '🏳 헷갈림 표시'}</button>
        </div>
        ${state.graded ? '' : `<div class="q-pausecover"><p>일시정지 중 <small>시간이 멈췄어요</small></p><button type="button" class="q-resume">▶ 다시 시작</button></div>`}
        <div class="q-body">
          <div class="q-imgwrap">
            <img src="${imgOf(r, n)}" alt="${real(r, n)[0]}회 ${real(r, n)[1]}번 문제">
            ${spots}
          </div>
          ${memoHtml(r, n)}
        </div>
        ${oldMemoHtml(r, n)}
        ${missing ? `<div class="q-opts">${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="q-spot-btn${a === i ? ' pick' : ''}" data-i="${i}" ${state.graded ? 'disabled' : ''}>${NUMS[i - 1]}</button>`).join('')}</div>` : ''}
        ${state.graded ? `<button type="button" class="q-solve-toggle" aria-expanded="${sh}">${sh ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾'}</button>${sh ? solvePanel(r, n) : ''}` : ''}
      </div>`;
  }

  // ── 메모: 문제(지문)와 선지 ①~⑤ 각각 — 회차별로 저장, 로그인하면 계정에 동기화
  const memoKey = (r) => window.ATTEMPTS.key('memo.' + r);
  // 모의고사(세트)는 세트마다 메모를 따로 둔다 — 원래 회차의 메모와 섞이지 않게
  const memoOf = (r, n) => (S.get(memoKey(r), {}) || {})[n] || { q: '', o: ['', '', '', '', ''] };
  // 다시 풀면 지금까지의 메모는 '이전 풀이 메모'로 따로 보관하고, 새 풀이는 빈 메모로 시작한다
  const oldKey = (r) => window.ATTEMPTS.key('memoOld.' + r);
  const oldMemos = (r) => S.get(oldKey(r), []) || [];
  function archiveMemo(r) {
    const cur = S.get(memoKey(r), {}) || {};
    if (!Object.keys(cur).length) return;
    const a = lastAttempt(r);
    S.set(oldKey(r), [...oldMemos(r), { t: Date.now(), date: (a && a.date) || today(), score: a && a.score != null ? a.score : null, memos: cur }]);
    S.set(memoKey(r), {});
  }
  function oldMemoHtml(r, n) {
    const list = oldMemos(r).filter((x) => x.memos && x.memos[n]).reverse();
    if (!list.length) return '';
    return `<details class="q-oldmemo"><summary>이전 풀이 메모 ${list.length}개 보기</summary>${list.map((x) => { const m = x.memos[n]; return `<div class="q-oldmemo-item"><p class="d">${escH(x.date || '')}${x.score != null ? ` · ${x.score}점 때` : ''}</p>${m.q ? `<p class="m-q">${escH(m.q)}</p>` : ''}${(m.o || []).some(Boolean) ? `<ul>${m.o.map((t, i) => (t ? `<li><b>${NUMS[i]}</b> ${escH(t)}</li>` : '')).join('')}</ul>` : ''}</div>`; }).join('')}</details>`;
  }
  function memoHtml(r, n) {
    const m = memoOf(r, n);
    const has = m.q || m.o.some(Boolean);
    const hot = ((KEY[r].hot || [])[n - 1]) || [];
    const aligned = hot.filter(Boolean).length === 5;
    // 선지 위치(이미지 기준 세로 비율)에 맞춰 메모 칸을 둔다. 같은 줄에 선지가 둘이면 칸을 나눈다
    const pos = [0, 1, 2, 3, 4].map((i) => {
      const h = hot[i]; if (!h) return '';
      const row = hot.map((x, j) => [x, j]).filter(([x]) => x && Math.abs(x[1] - h[1]) < 0.012).map(([, j]) => j);
      const k = row.indexOf(i), cnt = row.length;
      return `--t:${(h[1] + h[3] / 2) * 100}%;--l:${(k / cnt) * 100}%;--w:${100 / cnt}%`;
    });
    const firstY = aligned ? Math.min(...hot.map((h) => h[1])) : 0;
    return `
      <aside class="q-memo${has ? ' has' : ''}${aligned ? ' aligned' : ''}" style="--qh:${firstY * 100}%">
        <p class="q-memo-h">메모 <small>자동 저장</small></p>
        <label class="q-memo-q"><span>문제·지문</span><textarea data-memo="q" rows="3" placeholder="단서, 떠오른 사건·인물…">${escH(m.q)}</textarea></label>
        ${[0, 1, 2, 3, 4].map((i) => `<label class="q-memo-o" style="${pos[i]}"><span>${NUMS[i]}</span><input data-memo="${i}" value="${escH(m.o[i] || '')}" placeholder="${NUMS[i]} 메모"></label>`).join('')}
      </aside>`;
  }
  let memoTimer = null;
  function saveMemo() {
    const box2 = document.querySelector('.q-memo'); if (!box2) return;
    const r = state.round, n = state.cur;
    const all = S.get(memoKey(r), {}) || {};
    const m = { q: box2.querySelector('[data-memo="q"]').value.trim(), o: [0, 1, 2, 3, 4].map((i) => box2.querySelector(`[data-memo="${i}"]`).value.trim()) };
    if (m.q || m.o.some(Boolean)) all[n] = m; else delete all[n];
    S.set(memoKey(r), all);
    box2.classList.toggle('has', !!(m.q || m.o.some(Boolean)));
  }
  const escH = (t) => String(t || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ── 채점 후: 정답·도출 포인트
  const SOLVES = (window.SOLVES || {})[EX.id] || (EX.id === 'history' ? window.SOLVE || {} : {});
  // 선지별 포인트: 자세한 설명(OPTX)이 있으면 그걸, 없으면 짧은 정리(sv.opts)
  const OPTX = window.OPTX || {};
  function optList(id, sv, right, picked) {
    const ox = OPTX[id]; const E = escH;
    // 내가 고른 답: 틀렸으면 무엇을 골랐고 왜 아닌지 먼저 보여 준다
    const pickBox = () => {
      if (picked == null) return '';
      if (!picked) return `<div class="sv-pick none"><p><b>내가 고른 답</b> 고르지 않음 <span>→ 정답 ${NUMS[right - 1]}</span></p></div>`;
      if (picked === right) return `<div class="sv-pick ok"><p><b>내가 고른 답</b> ${NUMS[picked - 1]} <span>정답을 골랐어요</span></p></div>`;
      const mine = ox ? ox[picked - 1].split('|') : null, ans = ox ? ox[right - 1].split('|') : null;
      return `<div class="sv-pick"><p><b>내가 고른 답</b> ${NUMS[picked - 1]}${mine ? ' ' + E(mine[0]) : ''} <span>→ 정답 ${NUMS[right - 1]}${ans ? ' ' + E(ans[0]) : ''}</span></p>${mine ? `<p class="why"><b>왜 아닌가</b> ${E(mine[1] || '')}</p>` : ''}</div>`;
    };
    const cls = (i) => (i + 1 === right ? 'ans' : '') + (picked && i + 1 === picked && picked !== right ? ' mine' : '');
    const tag = (i) => (i + 1 === right ? ' <em>정답</em>' : '') + (picked && i + 1 === picked && picked !== right ? ' <em class="mine">내가 고름</em>' : '');
    if (ox) return `${pickBox()}<p class="sv-h">선지별 포인트</p><ol class="sv-opts ox">${ox.map((o, i) => { const [t, e] = o.split('|'); return `<li class="${cls(i)}"><span class="n">${NUMS[i]}</span><span><b>${E(t)}</b>${tag(i)}<small>${E(e || '')}</small>${window.optExtra ? window.optExtra(id, i) : ''}</span></li>`; }).join('')}</ol>`;
    return pickBox() + (sv.opts ? `<p class="sv-h">선지별 정리</p><ol class="sv-opts">${sv.opts.map((o, i) => `<li class="${cls(i)}"><span class="n">${NUMS[i]}</span><span>${o}${tag(i)}</span></li>`).join('')}</ol>` : '');
  }
  // 시기·나라·왕(정부) 한 줄 요약
  const QMETA = window.QMETA || {};
  function metaHtml(r0, n0) {
    const [r, n] = real(r0, n0);
    const m = (QMETA[r] || [])[n - 1]; if (!m) return '';
    const [when, state, king] = m.split('|');
    const cell = (k, v) => (v ? `<div><dt>${k}</dt><dd>${escH(v)}</dd></div>` : '');
    return `<dl class="sv-meta">${cell('시기', when)}${cell('나라', state)}${cell('왕·정부', king)}</dl>`;
  }
  function solvePanel(r, n) {
    const [rr, nn] = real(r, n); const sv = SOLVES[`${rr}-${nn}`];
    if (!sv) return `<div class="q-solve">${metaHtml(r, n)}<p class="sv-h">정답·도출 포인트</p><p class="sv-how">아직 정리 전이에요.</p></div>`;
    const right = KEY[r].ans[n - 1];
    return `
      <div class="q-solve">
        ${metaHtml(r, n)}
        <p class="sv-h">지문에서 잡을 단서</p>
        <p class="sv-clue">${sv.clue.map((c) => `<mark class="clue">${escH(c)}</mark>`).join(' ')}</p>
        <p class="sv-h">정답까지 생각의 순서</p>
        <p class="sv-how">${sv.how}</p>
        ${optList(`${rr}-${nn}`, sv, right, state.graded ? (state.answers[n] || 0) : null)}
      </div>`;
  }

  function navList() {
    if (state.graded && state.onlyWrong) return score(state.round, state.answers).wrong;
    if (state.onlyFlag && flags(state.round).length) return flags(state.round);
    return Array.from({ length: N(state.round) }, (_, i) => i + 1);
  }

  function renderSolve() {
    state.view = 'solve';
    const r = state.round, list = navList(), pos = list.indexOf(state.cur);
    const s = state.graded ? score(r, state.answers) : null;
    box.innerHTML = `
      <div class="q-top">
        <a href="#" class="top-link">← 목록</a>
        <h2>${rname(r)} <small>${state.cur} / ${N(r)}</small></h2>
        ${state.graded ? `<button type="button" class="top-link q-to-result">결과 보기</button>` : ''}
      </div>
      ${solveHtml()}
      <div class="q-nav">
        <button type="button" class="q-prev" ${pos <= 0 ? 'disabled' : ''}>◀ 이전</button>
        <button type="button" class="q-gridbtn">${state.onlyFlag ? '헷갈린 문제만 보는 중' : state.graded ? (state.onlyWrong ? '틀린 문제만 보는 중' : '문항 목록') : `답한 문항 ${Object.keys(state.answers).length}/${N(r)}`}</button>
        ${pos < list.length - 1 ? `<button type="button" class="q-next">다음 ▶</button>` : state.graded ? '<button type="button" class="q-to-result">결과 보기</button>' : '<button type="button" class="q-grade">채점하기</button>'}
      </div>
      <div class="q-grid"${state.showGrid ? '' : ' hidden'}>${Array.from({ length: N(r) }, (_, i) => {
        const n = i + 1; const a = state.answers[n];
        const c = state.graded ? (a === KEY[r].ans[i] ? 'ok' : 'ng') : a ? 'on' : '';
        return `<button type="button" data-go="${n}" class="${c}${n === state.cur ? ' cur' : ''}${isFlag(r, n) ? ' flag' : ''}">${n}</button>`;
      }).join('')}
        ${state.graded ? '' : `<button type="button" class="q-grade wide">채점하기</button>`}
      </div>`;
    bar.hidden = true;
    if (!state.graded) startTimer(); else stopTimer();
    if (s) { /* 채점 후 보기 */ }
  }

  // ── 결과 화면: 점수 · 총 시간 · 문제별 시간
  function renderResult() {
    stopTimer(); state.view = 'result';
    const r = state.round, k = KEY[r], s = score(r, state.answers);
    const total = sum(state.times);
    const avg = total / N(r);
    const rows = Array.from({ length: N(r) }, (_, i) => {
      const n = i + 1, a = state.answers[n], ok = a === k.ans[i], t = state.times[n] || 0;
      return `<button type="button" data-go="${n}" class="q-trow ${ok ? 'ok' : 'ng'}${t > avg * 1.8 && t > 60 ? ' slow' : ''}">
        <b>${n}</b><span>${ok ? '○' : '✕'}</span>${isFlag(r, n) ? '<span class="fl" title="헷갈림">🚩</span>' : ''}<span class="t">${mmss(t)}</span><span class="bar" style="width:${Math.min(100, (t / Math.max(1, ...Object.values(state.times))) * 100)}%"></span></button>`;
    }).join('');
    box.innerHTML = `
      <div class="q-top"><a href="#" class="top-link">← 목록</a><h2>${rname(r)} 결과</h2></div>
      <div class="q-result">
        <b>${s.score}점</b><small>/ ${TOTAL(r)}</small>
        <span>맞음 ${N(r) - s.wrong.length} · 틀림 ${s.wrong.length}</span>
        <span>총 소요 시간 <b class="tt">${mmss(total)}</b> · 문제당 평균 ${mmss(avg)}</span>
        ${flags(r).length ? `<span>헷갈림 표시 ${flags(r).length}문항 · 그중 맞힘 ${flags(r).filter((n) => state.answers[n] === k.ans[n - 1]).length}</span>` : ''}
        <span class="q-saved">${isSet(r) ? '풀이 기록에 저장했어요 (기출 풀기 › 랜덤 모의고사 탭)' : '오답 노트에 저장했어요'}</span>
      </div>
      <div class="q-actions">
        <button type="button" class="q-review-wrong" ${s.wrong.length ? '' : 'disabled'}>틀린 문제 다시 보기</button>
        <button type="button" class="q-review-flag" ${flags(r).length ? '' : 'disabled'}>🚩 헷갈린 문제 다시 보기 (${flags(r).length})</button>
        <button type="button" class="q-review-all">전체 문제 보기</button>
        <a class="q-btn" href="review.html?exam=${EX.id}">오답 노트</a>
        <button type="button" class="q-retry">다시 풀기</button>
      </div>
      <h3 class="r-h">문제별 머문 시간 <small>○ 정답 · ✕ 오답 · 🚩 헷갈림 · 주황 = 평균보다 오래 걸린 문제</small></h3>
      <div class="q-times">${rows}</div>`;
    bar.hidden = true;
    window.scrollTo(0, 0);
  }

  function go(n) {
    if (document.querySelector('.q-memo')) { clearTimeout(memoTimer); saveMemo(); }
    state.cur = Math.max(1, Math.min(N(state.round), n)); state.shownSolve = false;
    saveDraft(); renderSolve(); window.scrollTo(0, 0);
  }
  function step(d) {
    const list = navList(); const pos = list.indexOf(state.cur);
    const nx = list[pos + d] != null ? list[pos + d] : (pos < 0 ? list[0] : null);
    if (nx != null) go(nx);
  }

  function pick(i) {
    if (state.graded || state.view !== 'solve' || state.paused) return;
    const n = state.cur;
    state.answers[n] = i;
    saveDraft();
    box.querySelectorAll('.q-spot, .q-spot-btn').forEach((b) => b.classList.toggle('pick', +b.dataset.i === i));
    // 다음 문제로 (마지막 문제면 채점 안내)
    setTimeout(() => {
      if (state.cur !== n || state.view !== 'solve') return;
      if (n < N(state.round)) go(n + 1);
      else { state.showGrid = true; renderSolve(); }
    }, 350);
  }

  function grade() {
    const left = N(state.round) - Object.keys(state.answers).length;
    if (left && !confirm(`아직 ${left}문항을 고르지 않았어요. 고르지 않은 문항은 틀린 것으로 채점할까요?`)) return;
    const s = score(state.round, state.answers);
    if (isSet(state.round)) {
      const st = SETS[state.round];
      S.set(SETLOG_KEY, [{ id: state.round, title: st.title, kind: st.kind, items: st.items, date: today(), wrong: s.wrong, answers: state.answers, score: s.score, max: TOTAL(state.round), times: state.times, total: sum(state.times) }, ...setLog().filter((x) => x.id !== state.round)].slice(0, 30));
    } else window.ATTEMPTS.save({ round: state.round, date: today(), wrong: s.wrong, answers: state.answers, score: s.score, times: state.times, total: sum(state.times) });
    try { localStorage.removeItem(draftKey(state.round)); } catch (e) { /* 무시 */ }
    state.graded = true; state.showGrid = false; state.paused = false; state.onlyFlag = false;
    renderResult();
  }

  function open(r) {
    state.round = r; state.onlyWrong = false; state.onlyFlag = false; state.showGrid = false; state.paused = false;
    const draft = load(draftKey(r), null);
    const a = lastAttempt(r);
    if (draft && Object.keys(draft.answers || {}).length + sum(draft.times) > 0) {
      state.answers = draft.answers || {}; state.times = draft.times || {}; state.cur = draft.cur || 1; state.graded = false; state.paused = !!draft.paused; renderSolve();
    } else if (a && a.answers) {
      state.answers = a.answers; state.times = a.times || {}; state.cur = 1; state.graded = true; renderResult();
    } else {
      if (a) archiveMemo(r); // 채팅으로 기록만 넣어 둔 회차를 처음 푸는 경우
      state.answers = {}; state.times = {}; state.cur = 1; state.graded = false; renderSolve();
    }
    window.scrollTo(0, 0);
  }

  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const r = isSet(h) ? h : Number(h);
    if (KEY[r] && (isSet(r) || rounds.includes(r))) open(r); else { state.round = null; renderList(); }
  }

  document.addEventListener('click', (e) => {
    const sp = e.target.closest('.q-spot, .q-spot-btn');
    if (sp) { pick(+sp.dataset.i); return; }
    if (e.target.closest('.q-prev')) { step(-1); return; }
    if (e.target.closest('.q-next')) { step(1); return; }
    const g = e.target.closest('[data-go]');
    if (g) { state.showGrid = false; if (state.view === 'result') { state.onlyWrong = false; state.onlyFlag = false; } go(+g.dataset.go); return; }
    if (e.target.closest('.q-gridbtn')) { state.showGrid = !state.showGrid; box.querySelector('.q-grid').hidden = !state.showGrid; return; }
    if (e.target.closest('.q-grade')) { grade(); return; }
    if (e.target.closest('.q-to-result')) { renderResult(); return; }
    if (e.target.closest('.q-solve-toggle')) { state.shownSolve = !state.shownSolve; const y = window.scrollY; renderSolve(); window.scrollTo(0, y); return; }
    if (e.target.closest('.q-flag')) { toggleFlag(); return; }
    if (e.target.closest('.q-pause')) { setPause(!state.paused); return; }
    if (e.target.closest('.q-resume')) { setPause(false); return; }
    if (e.target.closest('.q-review-flag')) { state.onlyWrong = false; state.onlyFlag = true; go(flags(state.round)[0]); return; }
    if (e.target.closest('.q-review-wrong')) { state.onlyFlag = false; state.onlyWrong = true; go(score(state.round, state.answers).wrong[0]); return; }
    if (e.target.closest('.q-review-all')) { state.onlyWrong = false; state.onlyFlag = false; go(1); return; }
    if (e.target.closest('.q-retry')) {
      if (!confirm('답과 시간을 모두 지우고 처음부터 다시 풀까요?\n(오답 노트 기록은 다시 채점할 때 바뀌어요. 지금까지 쓴 메모는 ‘이전 풀이 메모’로 따로 보관되고, 새 메모는 빈칸에서 시작해요)')) return;
      archiveMemo(state.round);
      state.answers = {}; state.times = {}; state.cur = 1; state.graded = false; state.onlyWrong = false; state.onlyFlag = false; state.paused = false; renderSolve(); window.scrollTo(0, 0);
    }
  });
  document.addEventListener('input', (e) => {
    if (!e.target.closest('.q-memo')) return;
    clearTimeout(memoTimer); memoTimer = setTimeout(saveMemo, 400);
  });
  document.addEventListener('focusout', (e) => { if (e.target.closest('.q-memo')) { clearTimeout(memoTimer); saveMemo(); } });
  document.addEventListener('keydown', (e) => {
    if (state.view !== 'solve' || e.target.closest('input, textarea')) return;
    if (e.key === 'p' || e.key === 'P' || e.key === 'ㅔ') { setPause(!state.paused); return; }
    if (e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') { toggleFlag(); return; }
    if (state.paused) return;
    if (/^[1-5]$/.test(e.key)) pick(+e.key);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveDraft(); });
  window.addEventListener('hashchange', route);
  S.onChange((t) => { if (t === 'sync' && state.view !== 'solve') route(); });
  route();
})();
