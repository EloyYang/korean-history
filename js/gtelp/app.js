/*
 * 지텔프 Level 2 — 홈 · 문법 · 독해 · 청취 · 필수 단어 · 모의고사 · 오답
 *   기록은 study.gtelp.* (UserStore → 로그인하면 계정에 동기화)
 *   모의고사 결과는 ATTEMPTS_FOR('gtelp') 의 quizLog (round = 모의고사 번호)
 *   보기 순서는 문항마다 고정된 순서로 섞는다 (정답이 한쪽에 몰리지 않게). 저장은 원래 보기 번호로.
 */
(function () {
  const S = window.UserStore;
  const K = (n) => 'study.gtelp.' + n;
  const A = window.ATTEMPTS_FOR('gtelp');
  const G = window.GT_GRAMMAR, R = window.GT_READING, L = window.GT_LISTENING, V = window.GT_VOCAB, M = window.GT_MOCKS || [];
  const KO = window.GT_KO || {}, NOTE = window.GT_VOCAB_NOTE || {}, CONF = window.GT_CONFUSE || [];
  const koOf = (p) => p.ko || KO[p.id] || null;            // 지문·대본 해석 (문단·대사별)
  const gKo = (x, key) => x[5] || KO[key] || '';             // 문법 문장 해석
  // 채점 뒤 해석을 펼쳐 둘지 (이 브라우저에만 기억)
  let showKo = true;
  try { showKo = localStorage.getItem('gtelp.showKo') !== '0'; } catch (e) { /* 무시 */ }
  const setShowKo = (v) => { showKo = v; try { localStorage.setItem('gtelp.showKo', v ? '1' : '0'); } catch (e) { /* 무시 */ } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ABC = 'abcd';
  const $ = (sel) => document.querySelector(sel);
  const root = $('#gt');
  const TYPE = Object.fromEntries(G.types.map((t) => [t.id, t]));
  const MOCK_MIN = 90;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }; // 이 기기 날짜

  // 문항 키마다 고정된 보기 순서
  function perm(key) {
    let h = 2166136261;
    for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const p = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) { h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0; const j = h % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    return p;
  }
  const letter = (key, o) => ABC[perm(key).indexOf(o)];

  // 문항 하나: 보기 버튼(원래 번호 data-o) · 채점 뒤 정답/오답 색 · 해설
  function qHtml(key, num, q, opts, a, ex, pick, graded, ko) {
    const p = perm(key);
    const ok = pick === a;
    return `<div class="gt-q${graded ? (ok ? ' ok' : ' no') : ''}" data-k="${key}">
      <div class="gt-qt"><b>${num}.</b> ${q}</div>
      <ol class="gt-opts">${p.map((o, i) => {
        const cls = [pick === o ? 'pick' : '', graded && o === a ? 'ans' : '', graded && pick === o && o !== a ? 'miss' : ''].filter(Boolean).join(' ');
        return `<li><button type="button" class="${cls}" data-o="${o}"${graded ? ' disabled' : ''}><i>(${ABC[i]})</i> ${opts[o]}</button></li>`;
      }).join('')}</ol>
      ${graded ? `<div class="gt-ex">${ok ? '<b class="g">정답</b>' : pick == null ? `<b class="r">안 풂</b> 정답 (${ABC[p.indexOf(a)]})` : `<b class="r">오답</b> 내 답 (${ABC[p.indexOf(pick)]}) · 정답 (${ABC[p.indexOf(a)]})`} — ${ex}${ko ? `<div class="gt-qko">해석 ${ko}</div>` : ''}</div>` : ''}
    </div>`;
  }
  const blank = (s) => esc(s).replace(/_{3,}/, '<span class="gt-blank">______</span>');

  // ───────── 음성 (브라우저 TTS) ─────────
  const TTS = {
    ok: 'speechSynthesis' in window, voices: [], tok: 0,
    init() {
      if (!this.ok) return;
      const load = () => { this.voices = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang)); };
      load(); speechSynthesis.onvoiceschanged = load;
    },
    // 사람 목소리만 (macOS 의 효과음 목소리는 뺀다), 앞에 있는 이름일수록 자연스러운 목소리
    voice(sp) {
      if (this._v && this._v.n === this.voices.length) return this._v[sp];
      const JUNK = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|junior|organ|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|deranged|hysterical|pipe|princess/i;
      const vs = this.voices.filter((v) => !JUNK.test(v.name));
      const FEM = ['google us english', 'aria', 'jenny', 'samantha', 'ava', 'allison', 'susan', 'zira', 'shelley', 'sandy', 'flo', 'karen', 'moira', 'tessa', 'serena', 'victoria', 'fiona', 'kathy', 'female'];
      const MAL = ['google uk english male', 'guy', 'davis', 'aaron', 'reed', 'eddy', 'rocko', 'alex', 'daniel', 'david', 'mark', 'tom', 'arthur', 'rishi', 'fred', 'ralph', 'male'];
      const find = (names) => {
        for (const nm of names) {
          const hit = vs.filter((v) => v.name.toLowerCase().includes(nm) && !(nm === 'male' && /female/i.test(v.name)));
          const best = hit.find((v) => /en[-_]US/i.test(v.lang)) || hit[0];
          if (best) return best;
        }
        return null;
      };
      const f = find(FEM), m = find(MAL);
      this._v = { n: this.voices.length, F: f || vs[0], M: m || vs.find((v) => v !== f) || vs[0], N: f || m || vs[0] };
      return this._v[sp];
    },
    play(lines, rate, onLine, onEnd) {
      this.stop(); const t = ++this.tok; let i = 0;
      const next = () => {
        if (t !== this.tok) return;
        if (i >= lines.length) { this.tok++; onEnd && onEnd(); return; }
        const [sp, text] = lines[i];
        const u = new SpeechSynthesisUtterance(text);
        const v = this.voice(sp); if (v) u.voice = v;
        u.lang = (v && v.lang) || 'en-US'; u.rate = rate;
        // 같은 목소리밖에 없을 때 남녀를 높낮이로 구분
        u.pitch = sp === 'F' ? 1.15 : sp === 'M' ? 0.8 : 1;
        u.onend = () => { i++; setTimeout(next, 380); };
        u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') u.onend(); };
        onLine && onLine(i);
        speechSynthesis.speak(u);
      };
      next();
    },
    stop() { this.tok++; if (this.ok) speechSynthesis.cancel(); },
    playing() { return this.ok && (speechSynthesis.speaking || speechSynthesis.pending); },
  };
  TTS.init();
  const rate = () => S.get(K('rate'), 0.95);

  function playerHtml(id, lines, opt) {
    opt = opt || {};
    return `<div class="gt-player" data-pl="${id}">
      ${TTS.ok ? `<button type="button" class="gt-btn main" data-act="play">▶ 듣기</button><button type="button" class="gt-btn" data-act="stop">■ 멈춤</button>
      <label class="gt-rate">속도 <select data-act="rate">${[0.8, 0.9, 0.95, 1, 1.1].map((r) => `<option value="${r}"${r === rate() ? ' selected' : ''}>${r}×</option>`).join('')}</select></label>
      ${opt.count != null ? `<span class="gt-muted">들은 횟수 ${opt.count}${opt.limit ? ` / 실제 시험은 ${opt.limit}번` : ''}</span>` : ''}`
        : '<span class="gt-muted">이 브라우저는 음성 읽기를 지원하지 않아요. 스크립트를 펼쳐 읽어 보세요.</span>'}
      <span class="gt-now gt-muted"></span>
    </div>`;
  }
  function scriptHtml(lines, show, ko) {
    const who = { M: '남', F: '여', N: '' };
    return `<div class="gt-script${show ? '' : ' hide'}">${lines.map(([sp, t], i) => `<p data-li="${i}">${who[sp] ? `<b class="sp-${sp}">${who[sp]}</b> ` : ''}${esc(t)}</p>${ko && ko[i] ? `<p class="gt-ko">${ko[i]}</p>` : ''}`).join('')}</div>`;
  }
  // 독해 지문 (채점 뒤 ko 를 주면 문단마다 해석)
  const parasHtml = (paras, ko) => paras.map((t, i) => `<p>${t}</p>${ko && ko[i] ? `<p class="gt-ko">${ko[i]}</p>` : ''}`).join('');
  // 채점 뒤 '전체 해설' 켜고 끄기
  const koBar = () => `<div class="gt-kobar"><button type="button" class="gt-btn${showKo ? ' main' : ''}" data-ko>${showKo ? '📖 전체 해설·해석 켜짐' : '📖 전체 해설·해석 보기'}</button><span class="gt-muted">지문·대본·문장 해석과 문항별 근거를 함께 보여 줘요</span></div>`;
  function bindKo(again) { root.querySelectorAll('[data-ko]').forEach((b) => b.addEventListener('click', () => { setShowKo(!showKo); again(); })); }
  function bindPlayer(box, lines, onPlay) {
    box.querySelectorAll('[data-pl]').forEach((pl) => {
      const now = pl.querySelector('.gt-now');
      pl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        if (b.dataset.act === 'play') {
          onPlay && onPlay();
          TTS.play(lines, rate(), (i) => {
            now.textContent = `재생 중 ${i + 1} / ${lines.length}`;
            box.querySelectorAll('.gt-script p').forEach((p) => p.classList.toggle('cur', +p.dataset.li === i));
          }, () => { now.textContent = '끝'; box.querySelectorAll('.gt-script p.cur').forEach((p) => p.classList.remove('cur')); });
        }
        if (b.dataset.act === 'stop') { TTS.stop(); now.textContent = '멈춤'; }
      });
      const sel = pl.querySelector('select[data-act="rate"]');
      if (sel) sel.addEventListener('change', () => S.set(K('rate'), +sel.value));
    });
  }

  // ───────── 라우팅 ─────────
  const TABS = [['home', '홈'], ['plan', '10일 플랜'], ['grammar', '문법'], ['reading', '독해'], ['listening', '청취'], ['vocab', '필수 단어'], ['mock', '모의고사'], ['wrong', '오답']];
  const route = () => { const [t, a] = location.hash.replace(/^#/, '').split('/'); return { tab: TABS.some((x) => x[0] === t) ? t : 'home', arg: a ? decodeURIComponent(a) : '' }; };
  let timer = null;
  function render() {
    TTS.stop(); clearInterval(timer);
    const { tab, arg } = route();
    // 10일 플랜에서 온 링크(#grammar/day3, #vocab/day3)는 그날 범위로 열고 주소는 탭 이름만 남긴다
    const day = /^day(\d+)$/.exec(arg);
    if (day && (tab === 'grammar' || tab === 'vocab')) {
      if (tab === 'grammar') { gDay = +day[1]; gOnlyWrong = false; } else { vDay = +day[1]; vMode = 'card'; vUnknown = false; vIdx = 0; vFlip = false; vq = null; }
      history.replaceState(null, '', '#' + tab);
    }
    document.querySelectorAll('.gt-tabs a').forEach((a) => a.classList.toggle('on', a.dataset.t === tab));
    const f = { home, plan, grammar, reading: () => setPage('reading', arg), listening: () => setPage('listening', arg), vocab, mock: () => mock(arg), wrong }[tab];
    f();
  }
  function nav() {
    const n = document.querySelector('.gt-tabs');
    n.innerHTML = TABS.map(([t, l]) => `<a href="#${t}" data-t="${t}">${l}</a>`).join('');
  }

  // ───────── 기록 ─────────
  const gLog = () => S.get(K('grammar'), {}) || {};              // { 'g-번호': 원래 보기 번호 }
  const sLog = (kind) => S.get(K(kind), {}) || {};               // { 지문id: {picks:[..], score, date} }
  const vLog = () => Object.assign({ known: [], miss: {} }, S.get(K('vocab'), {}) || {});
  const mocks = () => A.all();
  const gKey = (i) => 'g-' + i;

  // ───────── 홈 ─────────
  function home() {
    const gl = gLog(); const gDone = Object.keys(gl).length; const gOk = Object.entries(gl).filter(([k, v]) => G.items[+k.slice(2)] && G.items[+k.slice(2)][3] === v).length;
    const rl = sLog('reading'), ll = sLog('listening'); const vl = vLog(); const ms = mocks();
    const last = ms.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const draft = S.get(K('mockDraft'), null);
    const card = (href, t, big, small, note) => `<a class="gt-card" href="${href}"><h3>${t}</h3><b>${big}</b><span>${small}</span>${note ? `<small>${note}</small>` : ''}</a>`;
    root.innerHTML = `
      <section class="gt-hero">
        <h2>G-TELP Level 2</h2>
        <p>문법 26 · 청취 26 · 독해 28 = <b>80문항</b>, 약 90분. 영역마다 100점으로 바꾼 뒤 <b>세 영역 평균</b>이 총점이에요.</p>
        <table class="gt-tbl"><thead><tr><th>영역</th><th>문항</th><th>구성</th></tr></thead><tbody>
          <tr><td>문법</td><td>1–26</td><td>시제 6 · 가정법 6 · 준동사 6 · 조동사 2 · 당위성 2 · 연결어 2 · 관계사 2</td></tr>
          <tr><td>청취</td><td>27–52</td><td>Part 1 일상 대화 7 · Part 2 발표 6 · Part 3 결정 대화 6 · Part 4 설명 7 (한 번만 들려줘요)</td></tr>
          <tr><td>독해</td><td>53–80</td><td>Part 1 인물 · 2 기사 · 3 백과사전 · 4 비즈니스 편지, 지문마다 7문항 (어휘 2)</td></tr>
        </tbody></table>
      </section>
      ${planCard()}
      <div class="gt-cards">
        ${card('#grammar', '문법', `${gDone} / ${G.items.length}`, '풀어 본 문항', gDone ? `정답률 ${pct(gOk, gDone)}%` : '유형별 공식부터')}
        ${card('#reading', '독해', `${Object.keys(rl).length} / ${R.length}`, '푼 지문', Object.keys(rl).length ? `평균 ${Math.round(Object.values(rl).reduce((a, x) => a + x.score, 0) / Object.keys(rl).length)}점` : 'Part 1~4')}
        ${card('#listening', '청취', `${Object.keys(ll).length} / ${L.length}`, '들은 대본', TTS.ok ? '원어민 음성(브라우저)으로 듣기' : '스크립트로 읽기')}
        ${card('#vocab', '필수 단어', `${vl.known.length} / ${V.length}`, '외운 단어', '동의어까지 함께')}
        ${card('#mock', '모의고사', last ? `${last.score}점` : '-', last ? `최근 ${esc(last.title || '')}` : `${M.length}회분`, draft ? '<em>풀던 시험 이어 풀기</em>' : '90분 실전')}
      </div>
      <div class="ad-slot" data-ad="list"></div>`;
  }

  // ───────── 10일 플랜 ─────────
  // 하루: 문법 8문항(유형 섞음) + 단어 Day n, 독해·청취 한 세트씩, 4·8·10일째는 실전 모의고사
  // 문법은 유형마다 10일에 고르게 나눈다 (그 유형이 가장 적은 날 → 하루 문항 수가 적은 날 순서)
  const G_DAY = (() => {
    const day = [], total = Array(10).fill(0);
    G.types.forEach((t) => {
      const per = Array(10).fill(0);
      G.items.forEach((x, i) => {
        if (x[0] !== t.id) return;
        let best = 0;
        for (let d = 1; d < 10; d++) if (per[d] < per[best] || (per[d] === per[best] && total[d] < total[best])) best = d;
        day[i] = best; per[best]++; total[best]++;
      });
    });
    return day;
  })();
  const gDayItems = (d) => G.items.map((x, i) => i).filter((i) => G_DAY[i] === d - 1);
  const vDayWords = (d) => V.slice((d - 1) * DAY, d * DAY).map((w) => w[0]);
  const PLAN = (() => {
    const setDays = [1, 2, 3, 5, 6, 7, 9, 9]; // 독해·청취 세트 i 를 푸는 날
    const mockDays = [4, 8, 10];
    return Array.from({ length: 10 }, (_, k) => {
      const d = k + 1; const t = [{ k: 'g' }, { k: 'v' }];
      setDays.forEach((sd, i) => { if (sd === d) { if (R[i]) t.push({ k: 'r', id: R[i].id }); if (L[i]) t.push({ k: 'l', id: L[i].id }); } });
      mockDays.forEach((md, i) => { if (md === d && M[i]) t.push({ k: 'm', id: M[i].id }); });
      if (d === 10) t.push({ k: 'w' });
      return t;
    });
  })();
  const MIN = { g: 15, v: 20, r: 15, l: 15, m: 90, w: 30 };
  function taskInfo(t, d) {
    if (t.k === 'g') { const ids = gDayItems(d); const gl = gLog(); const n = ids.filter((i) => gl[gKey(i)] != null).length; const ok = ids.filter((i) => gl[gKey(i)] === G.items[i][3]).length; return { label: `문법 ${ids.length}문항`, sub: '여러 유형 섞어서', href: `#grammar/day${d}`, done: n === ids.length, prog: `${n}/${ids.length}${n ? ` · ${ok}개 정답` : ''}` }; }
    if (t.k === 'v') { const ws = vDayWords(d); const kn = vLog().known; const n = ws.filter((w) => kn.includes(w)).length; return { label: `단어 Day ${d}`, sub: `${ws.length}개 · 카드로 외우고 '알아요' 표시`, href: `#vocab/day${d}`, done: n === ws.length, prog: `${n}/${ws.length} 외움` }; }
    if (t.k === 'r' || t.k === 'l') { const kind = t.k === 'r' ? 'reading' : 'listening'; const s = (t.k === 'r' ? R : L).find((x) => x.id === t.id); const lg = sLog(kind)[t.id]; return { label: `${t.k === 'r' ? '독해' : '청취'} Part ${s.part}`, sub: s.title, href: `#${kind}/${t.id}`, done: !!lg, prog: lg ? `${lg.score}점` : '' }; }
    if (t.k === 'm') { const m = M.find((x) => x.id === t.id); const r = mocks().find((x) => x.mock === t.id); return { label: m.title, sub: '90분 실전 · 문법→청취→독해', href: r ? `#mock/res-${t.id}` : '#mock', done: !!r, prog: r ? `${r.score}점` : '', main: true }; }
    return { label: '오답 총정리', sub: '연습·모의고사에서 틀린 문제와 헷갈린 단어 다시 보기', href: '#wrong', done: null, prog: '' };
  }
  const planState = () => S.get(K('plan'), null);
  // 시작한 날부터 오늘이 며칠째인지 (10일이 넘으면 10)
  function todayDay() {
    const p = planState(); if (!p || !p.start) return 0;
    const diff = Math.floor((new Date(today()) - new Date(p.start)) / 86400000);
    return Math.max(1, Math.min(10, diff + 1));
  }
  function dayStat(d) {
    const ts = PLAN[d - 1].map((t) => taskInfo(t, d)).filter((x) => x.done !== null);
    return { done: ts.filter((x) => x.done).length, n: ts.length };
  }
  function planCard() {
    const td = todayDay();
    if (!td) return `<a class="gt-plancard" href="#plan"><b>10일 완성 플랜</b><span>하루 분량으로 나눈 문법·단어·독해·청취·모의고사를 10일 동안 차례로 풀어요</span><em>시작하기 →</em></a>`;
    const st = dayStat(td);
    return `<a class="gt-plancard" href="#plan"><b>오늘은 Day ${td}</b><span>${PLAN[td - 1].map((t) => taskInfo(t, td).label).join(' · ')}</span><em>${st.done}/${st.n} 완료 →</em></a>`;
  }
  let planOpen = 0;
  function plan() {
    const td = todayDay();
    const open = planOpen || td || 1;
    const days = PLAN.map((ts, k) => {
      const d = k + 1; const st = dayStat(d); const info = ts.map((t) => taskInfo(t, d));
      const min = ts.reduce((a, t) => a + MIN[t.k], 0);
      const cls = [st.done === st.n ? 'done' : '', d === td ? 'today' : '', d === open ? 'open' : ''].filter(Boolean).join(' ');
      return `<section class="gt-day ${cls}" data-day="${d}">
        <button type="button" class="gt-dayhead" data-open="${d}"><b>Day ${d}</b>${d === td ? '<em>오늘</em>' : ''}<span>${info.map((x) => x.label).join(' · ')}</span><i>${st.done === st.n ? '✓ 완료' : `${st.done}/${st.n}`} · 약 ${Math.round(min / 10) * 10}분</i></button>
        <ul class="gt-tasks">${info.map((x) => `<li class="${x.done ? 'ok' : ''}${x.main ? ' main' : ''}"><a href="${x.href}"><span class="gt-chk">${x.done ? '✓' : x.done === null ? '•' : ''}</span><b>${esc(x.label)}</b><small>${esc(x.sub)}</small>${x.prog ? `<em>${x.prog}</em>` : ''}</a></li>`).join('')}</ul>
      </section>`;
    }).join('');
    const all = PLAN.reduce((a, _, k) => { const s = dayStat(k + 1); return [a[0] + s.done, a[1] + s.n]; }, [0, 0]);
    root.innerHTML = `
      <h2 class="r-h">10일 완성 플랜 <small>하루 분량만 따라가면 연습 문제·단어·모의고사 3회를 모두 끝내요</small></h2>
      <div class="gt-tip">
        ${td ? `<b>${esc(planState().start)}</b>에 시작했어요. 오늘은 <b>Day ${td}</b>예요. 전체 ${all[1]}개 할 일 중 <b>${all[0]}개</b> 완료.` : '시작하기를 누르면 오늘이 Day 1이 되고, 날짜에 맞춰 그날 할 일을 보여 줘요. 밀리면 지난 Day를 펼쳐서 이어서 하면 돼요.'}
        <ul><li>매일: 문법 8문항(여러 유형 섞음) + 필수 단어 하루치(${DAY}개)</li><li>독해·청취: Part 1~4 연습 세트를 하루 한 세트씩 (Day 9는 두 세트)</li><li>Day 4·8·10: 90분 실전 모의고사 1·2·3회, Day 10은 오답 총정리까지</li></ul>
        <div class="gt-bar">${td ? '<button type="button" class="gt-btn" id="pl-reset">시작일 다시 정하기</button>' : '<button type="button" class="gt-btn main" id="pl-start">오늘부터 시작하기</button>'}</div>
      </div>
      <div class="gt-days">${days}</div>`;
    root.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => { const d = +b.dataset.open; planOpen = open === d ? -1 : d; plan(); }));
    const st = $('#pl-start'); if (st) st.addEventListener('click', () => { S.set(K('plan'), { start: today() }); planOpen = 0; plan(); });
    const rs = $('#pl-reset'); if (rs) rs.addEventListener('click', () => {
      if (!confirm('오늘을 Day 1로 다시 정할까요? (푼 기록은 그대로 남아요)')) return;
      S.set(K('plan'), { start: today() }); planOpen = 0; plan();
    });
  }

  // ───────── 문법 ─────────
  let gType = 'all', gOnlyWrong = false, gDay = 0;
  function grammar() {
    const gl = gLog();
    const stat = (t) => { const ids = G.items.map((x, i) => [x, i]).filter(([x]) => t === 'all' || x[0] === t); const d = ids.filter(([, i]) => gl[gKey(i)] != null); return { n: ids.length, d: d.length, ok: d.filter(([x, i]) => gl[gKey(i)] === x[3]).length }; };
    const inScope = (x, i) => (gDay ? gDayItems(gDay).includes(i) : gType === 'all' || x[0] === gType);
    const list = G.items.map((x, i) => [x, i]).filter(([x, i]) => inScope(x, i) && (!gOnlyWrong || (gl[gKey(i)] != null && gl[gKey(i)] !== x[3])));
    const t = gDay ? null : TYPE[gType];
    root.innerHTML = `
      <h2 class="r-h">문법 <small>보기를 고르면 바로 채점하고 해설이 보여요</small></h2>
      ${gDay ? `<div class="gt-dayban"><b>Day ${gDay} 문법</b> ${gDayItems(gDay).length}문항 · 여러 유형이 섞여 있어요 <a href="#plan">← 10일 플랜</a></div>` : ''}
      <div class="gt-chips">${['all'].concat(G.types.map((x) => x.id)).map((id) => { const s = stat(id); return `<button type="button" class="chip${!gDay && gType === id ? ' on' : ''}" data-ty="${id}">${id === 'all' ? '전체' : TYPE[id].name}<small>${s.d}/${s.n}${s.d ? ` · ${pct(s.ok, s.d)}%` : ''}</small></button>`; }).join('')}</div>
      ${gDay ? '' : t ? `<div class="gt-tip"><h3>${t.name} <small>실제 시험 ${t.n}문항</small></h3>${t.tip}</div>` : '<div class="gt-tip"><h3>문법 26문항 공략</h3>지텔프 문법은 <b>유형이 정해져 있어요</b>. 위에서 유형을 고르면 정답 찾는 공식이 보여요. 시제·가정법·준동사 18문항만 확실히 잡아도 문법 점수가 크게 올라요.</div>'}
      <div class="gt-bar"><label class="chip-check"><input type="checkbox" id="g-wrong"${gOnlyWrong ? ' checked' : ''}> 틀린 문제만</label>
        <button type="button" class="gt-btn" id="g-reset">${gDay ? `Day ${gDay}` : gType === 'all' ? '전체' : TYPE[gType].name} 기록 지우고 다시 풀기</button></div>
      <div class="gt-qs">${list.length ? list.map(([x, i], k) => qHtml(gKey(i), k + 1, `<span class="gt-tag">${TYPE[x[0]].name.split(' ')[0]}</span> ${blank(x[1])}`, x[2].map(esc), x[3], x[4], gl[gKey(i)], gl[gKey(i)] != null, gKo(x, gKey(i)))).join('') : '<p class="gt-muted">해당하는 문제가 없어요.</p>'}</div>`;
    root.querySelectorAll('[data-ty]').forEach((b) => b.addEventListener('click', () => { gType = b.dataset.ty; gDay = 0; grammar(); }));
    $('#g-wrong').addEventListener('change', (e) => { gOnlyWrong = e.target.checked; grammar(); });
    $('#g-reset').addEventListener('click', () => {
      if (!confirm('이 유형의 풀이 기록을 지우고 처음부터 다시 풀까요?')) return;
      const l = gLog(); G.items.forEach((x, i) => { if (inScope(x, i)) delete l[gKey(i)]; }); S.set(K('grammar'), l); grammar();
    });
    root.querySelector('.gt-qs').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-o]'); if (!b || b.disabled) return;
      const q = b.closest('.gt-q'); const i = +q.dataset.k.slice(2); const x = G.items[i];
      const l = gLog(); l[q.dataset.k] = +b.dataset.o; S.set(K('grammar'), l);
      const num = q.querySelector('.gt-qt b').textContent.replace('.', '');
      q.outerHTML = qHtml(q.dataset.k, num, `<span class="gt-tag">${TYPE[x[0]].name.split(' ')[0]}</span> ${blank(x[1])}`, x[2].map(esc), x[3], x[4], +b.dataset.o, true, gKo(x, q.dataset.k));
    });
  }

  // ───────── 독해 · 청취 (연습 지문) ─────────
  const draftOf = {}; // 채점 전 고른 답 (화면 안에서만)
  function setPage(kind, id) {
    const sets = kind === 'reading' ? R : L; const log = sLog(kind);
    const cur = sets.find((s) => s.id === id);
    const list = `<div class="gt-sets">${sets.map((s) => `<a class="gt-set${cur && cur.id === s.id ? ' on' : ''}" href="#${kind}/${s.id}"><small>Part ${s.part} · ${s.kind}</small><b>${esc(s.title)}</b>${log[s.id] ? `<em>${log[s.id].score}점</em>` : ''}</a>`).join('')}</div>`;
    const head = kind === 'reading'
      ? '<h2 class="r-h">독해 <small>지문마다 7문항 · 마지막 두 문항은 문맥상 같은 뜻 고르기</small></h2>'
      : '<h2 class="r-h">청취 <small>▶ 듣기로 대화·발표를 듣고 문제를 풀어요 · 채점 뒤 스크립트 확인</small></h2>';
    if (!cur) { root.innerHTML = head + list + '<p class="gt-muted">위에서 지문을 고르세요.</p><div class="ad-slot" data-ad="list"></div>'; return; }
    const done = log[cur.id]; const picks = done ? done.picks : (draftOf[cur.id] = draftOf[cur.id] || []);
    const showScript = !!done || !!draftOf['s-' + cur.id];
    const ko = done && showKo ? koOf(cur) : null;
    const body = kind === 'reading'
      ? `<article class="gt-passage"><h3>${esc(cur.title)}</h3>${parasHtml(cur.paras, ko)}</article>`
      : `<article class="gt-passage">${playerHtml(cur.id, cur.lines)}
          <button type="button" class="gt-link" id="s-tog">${showScript ? '스크립트 접기' : '스크립트 보기'}</button>${scriptHtml(cur.lines, showScript, ko)}</article>`;
    root.innerHTML = head + list + (done ? koBar() : '') + `
      <div class="gt-work ${kind}">
        ${body}
        <div class="gt-side">
          <div class="gt-qs${done && showKo ? '' : ' no-ex'}">${cur.qs.map((q, i) => qHtml(`${cur.id}-${i}`, i + 1, q[0], q[1].map(esc), q[2], q[3], picks[i], !!done)).join('')}</div>
          <div class="gt-bar">${done ? `<b class="gt-score">${done.score}점</b> <span class="gt-muted">${cur.qs.length}문항 중 ${done.picks.filter((p, i) => p === cur.qs[i][2]).length}개 정답</span> <button type="button" class="gt-btn" id="s-redo">다시 풀기</button>`
            : '<button type="button" class="gt-btn main" id="s-grade">채점하기</button>'}</div>
        </div>
      </div>`;
    if (kind === 'listening') {
      bindPlayer(root, cur.lines);
      $('#s-tog').addEventListener('click', () => { if (done) { root.querySelector('.gt-script').classList.toggle('hide'); return; } draftOf['s-' + cur.id] = !draftOf['s-' + cur.id]; setPage(kind, id); });
    }
    if (done) bindKo(() => setPage(kind, id));
    if (!done) {
      root.querySelector('.gt-qs').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-o]'); if (!b) return;
        const i = +b.closest('.gt-q').dataset.k.split('-').pop(); picks[i] = +b.dataset.o;
        b.closest('.gt-opts').querySelectorAll('button').forEach((x) => x.classList.toggle('pick', x === b));
      });
      $('#s-grade').addEventListener('click', () => {
        const n = cur.qs.filter((q, i) => picks[i] != null).length;
        if (n < cur.qs.length && !confirm(`${cur.qs.length - n}문항을 안 풀었어요. 채점할까요?`)) return;
        const ok = cur.qs.filter((q, i) => picks[i] === q[2]).length;
        const l = sLog(kind); l[cur.id] = { picks: cur.qs.map((q, i) => (picks[i] == null ? null : picks[i])), score: pct(ok, cur.qs.length), date: today() }; S.set(K(kind), l);
        delete draftOf[cur.id]; setPage(kind, id);
      });
    } else {
      $('#s-redo').addEventListener('click', () => { const l = sLog(kind); delete l[cur.id]; S.set(K(kind), l); delete draftOf['s-' + cur.id]; setPage(kind, id); });
    }
  }

  // ───────── 필수 단어 ─────────
  const DAY = Math.ceil(V.length / 10); // 필수 단어를 10일로 나눈 하루 분량
  let vMode = 'card', vDay = 0, vUnknown = false, vIdx = 0, vFlip = false, vq = null, vSearch = '';
  function vPool() {
    const vl = vLog();
    let list = V.map((w, i) => i);
    if (vDay > 0) list = list.slice((vDay - 1) * DAY, vDay * DAY);
    if (vUnknown) list = list.filter((i) => !vl.known.includes(V[i][0]));
    return list;
  }
  function vocab() {
    const vl = vLog(); const days = Math.ceil(V.length / DAY); const pool = vPool();
    const knownIn = (d) => V.slice((d - 1) * DAY, d * DAY).filter((w) => vl.known.includes(w[0])).length;
    let body = '';
    if (vMode === 'card') {
      if (vIdx >= pool.length) vIdx = 0;
      const i = pool[vIdx]; const w = V[i];
      body = !pool.length ? '<p class="gt-muted">이 범위의 단어를 모두 외웠어요! 👏 범위를 바꾸거나 \'모르는 단어만\'을 끄세요.</p>' : `
        <div class="gt-flash${vFlip ? ' flip' : ''}" id="v-card">
          <div class="gt-word">${esc(w[0])}${vl.known.includes(w[0]) ? ' <small class="g">외움</small>' : ''}</div>
          ${vFlip ? `<div class="gt-mean">${esc(w[1])}</div><div class="gt-syn">동의어 <b>${esc(w[2])}</b></div><div class="gt-exs">${esc(w[3])}</div>${NOTE[w[0]] ? `<div class="gt-note">⚠ ${NOTE[w[0]]}</div>` : ''}` : `<div class="gt-muted">눌러서 뜻 보기${NOTE[w[0]] ? ' · <b class="r">헷갈리기 쉬운 단어</b>' : ''}</div>`}
        </div>
        <div class="gt-bar center"><span class="gt-muted">${vIdx + 1} / ${pool.length}</span>
          <button type="button" class="gt-btn" id="v-prev">← 이전</button>
          <button type="button" class="gt-btn" id="v-no">다시 볼래요</button>
          <button type="button" class="gt-btn main" id="v-yes">알아요 ✓</button>
          ${TTS.ok ? '<button type="button" class="gt-btn" id="v-say">🔊 발음</button>' : ''}</div>`;
    } else if (vMode === 'quiz') {
      if (!vq) {
        const src = pool.length >= 4 ? pool : V.map((w, i) => i);
        const ids = src.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(10, src.length));
        vq = { ids, k: 0, ok: 0, picks: [], qs: ids.map((i) => { const wrong = V.map((w, j) => j).filter((j) => j !== i).sort(() => Math.random() - 0.5).slice(0, 3); return [i].concat(wrong).sort(() => Math.random() - 0.5); }) };
      }
      if (vq.k >= vq.ids.length) {
        body = `<div class="gt-tip"><h3>${vq.ids.length}문제 중 ${vq.ok}개 정답</h3>${vq.ids.map((i, k) => `<div class="gt-vres ${vq.picks[k] === i ? 'g' : 'r'}"><b>${esc(V[i][0])}</b> ${esc(V[i][1])} <small>${esc(V[i][2])}</small></div>`).join('')}</div>
          <div class="gt-bar center"><button type="button" class="gt-btn main" id="v-again">새 문제 10개</button></div>`;
      } else {
        const i = vq.ids[vq.k]; const ch = vq.qs[vq.k]; const pk = vq.picks[vq.k];
        body = `<div class="gt-flash"><div class="gt-muted">${vq.k + 1} / ${vq.ids.length}</div><div class="gt-word">${esc(V[i][0])}</div>
          <ol class="gt-opts vq">${ch.map((j, n) => `<li><button type="button" data-v="${j}" class="${pk != null ? (j === i ? 'ans' : j === pk ? 'miss' : '') : ''}"${pk != null ? ' disabled' : ''}><i>(${ABC[n]})</i> ${esc(V[j][1])}</button></li>`).join('')}</ol>
          ${pk != null ? `<div class="gt-syn">동의어 <b>${esc(V[i][2])}</b></div><div class="gt-exs">${esc(V[i][3])}</div>${NOTE[V[i][0]] ? `<div class="gt-note">⚠ ${NOTE[V[i][0]]}</div>` : ''}` : ''}</div>
          ${pk != null ? '<div class="gt-bar center"><button type="button" class="gt-btn main" id="v-next">다음 →</button></div>' : ''}`;
      }
    } else if (vMode === 'confuse') {
      body = `<div class="gt-tip">모양이나 뜻이 비슷해서 독해 어휘 문제·연결어 문제에서 자주 틀리는 단어 묶음이에요. 필수 단어 중 헷갈리기 쉬운 ${Object.keys(NOTE).length}개는 카드와 목록에 ⚠ 설명이 붙어 있어요.</div>
        <div class="gt-confs">${CONF.map(([ws, how, exs]) => `<div class="gt-conf"><h3>${ws.map(esc).join(' <small>vs</small> ')}</h3><p>${how}</p><ul>${exs.map(([e, k]) => `<li>${e}<span>${k}</span></li>`).join('')}</ul></div>`).join('')}</div>`;
    } else {
      const q = vSearch.trim().toLowerCase();
      const rows = pool.filter((i) => !q || V[i].slice(0, 3).join(' ').toLowerCase().includes(q));
      body = `<input class="gt-search" id="v-search" placeholder="단어·뜻·동의어 찾기" value="${esc(vSearch)}">
        <table class="gt-tbl gt-vtbl"><thead><tr><th>외움</th><th>단어</th><th>뜻</th><th>동의어</th></tr></thead><tbody>
        ${rows.map((i) => `<tr><td><input type="checkbox" data-w="${esc(V[i][0])}"${vl.known.includes(V[i][0]) ? ' checked' : ''}></td><td><b>${esc(V[i][0])}</b>${vl.miss[V[i][0]] ? ` <small class="r">틀림 ${vl.miss[V[i][0]]}</small>` : ''}</td><td>${esc(V[i][1])}${NOTE[V[i][0]] ? `<div class="gt-note sm">⚠ ${NOTE[V[i][0]]}</div>` : ''}</td><td>${esc(V[i][2])}</td></tr>`).join('')}
        </tbody></table>`;
    }
    root.innerHTML = `
      <h2 class="r-h">필수 단어 <small>${V.length}개 · 외운 단어 ${vl.known.length}개 · 독해 어휘 문제는 동의어를 물어요</small></h2>
      <div class="gt-chips">${[['card', '카드 외우기'], ['quiz', '뜻 맞히기'], ['list', '단어 목록'], ['confuse', '헷갈리는 단어']].map(([m, l]) => `<button type="button" class="chip${vMode === m ? ' on' : ''}" data-vm="${m}">${l}</button>`).join('')}</div>
      <div class="gt-chips small"${vMode === 'confuse' ? ' hidden' : ''}><button type="button" class="chip${vDay === 0 ? ' on' : ''}" data-day="0">전체</button>${Array.from({ length: days }, (_, d) => `<button type="button" class="chip${vDay === d + 1 ? ' on' : ''}" data-day="${d + 1}">Day ${d + 1}<small>${knownIn(d + 1)}/${Math.min(DAY, V.length - d * DAY)}</small></button>`).join('')}
        <label class="chip-check"><input type="checkbox" id="v-unk"${vUnknown ? ' checked' : ''}> 모르는 단어만</label></div>
      ${body}`;
    root.querySelectorAll('[data-vm]').forEach((b) => b.addEventListener('click', () => { vMode = b.dataset.vm; vq = null; vIdx = 0; vFlip = false; vocab(); }));
    root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { vDay = +b.dataset.day; vq = null; vIdx = 0; vFlip = false; vocab(); }));
    $('#v-unk').addEventListener('change', (e) => { vUnknown = e.target.checked; vq = null; vIdx = 0; vFlip = false; vocab(); });
    const mark = (w, known) => { const l = vLog(); l.known = l.known.filter((x) => x !== w); if (known) l.known.push(w); S.set(K('vocab'), l); };
    if (vMode === 'card' && pool.length) {
      const w = V[pool[vIdx]][0];
      $('#v-card').addEventListener('click', () => { vFlip = !vFlip; vocab(); });
      $('#v-prev').addEventListener('click', () => { vIdx = (vIdx - 1 + pool.length) % pool.length; vFlip = false; vocab(); });
      $('#v-no').addEventListener('click', () => { mark(w, false); vIdx = (vIdx + 1) % pool.length; vFlip = false; vocab(); });
      $('#v-yes').addEventListener('click', () => { mark(w, true); if (!vUnknown) vIdx = (vIdx + 1) % pool.length; vFlip = false; vocab(); });
      const say = $('#v-say'); if (say) say.addEventListener('click', () => TTS.play([['N', w]], 0.9));
    }
    if (vMode === 'quiz') {
      root.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
        const i = vq.ids[vq.k]; const j = +b.dataset.v; vq.picks[vq.k] = j;
        const l = vLog(); const w = V[i][0];
        if (j === i) vq.ok++; else { l.miss[w] = (l.miss[w] || 0) + 1; l.known = l.known.filter((x) => x !== w); S.set(K('vocab'), l); }
        vocab();
      }));
      const nx = $('#v-next'); if (nx) nx.addEventListener('click', () => { vq.k++; vocab(); });
      const ag = $('#v-again'); if (ag) ag.addEventListener('click', () => { vq = null; vocab(); });
    }
    if (vMode === 'list') {
      const s = $('#v-search');
      s.addEventListener('input', () => { vSearch = s.value; const pos = s.selectionStart; vocab(); const n = $('#v-search'); n.focus(); n.setSelectionRange(pos, pos); });
      root.querySelectorAll('input[data-w]').forEach((c) => c.addEventListener('change', () => mark(c.dataset.w, c.checked)));
    }
  }

  // ───────── 모의고사 ─────────
  // 문항 번호: 문법 1–26, 청취 27–52, 독해 53–80
  function mockItems(m) {
    const out = [];
    m.grammar.forEach((x, i) => out.push({ sec: 'g', key: `${m.id}-g${i}`, n: out.length + 1, q: blank(x[1]), opts: x[2].map(esc), a: x[3], ex: `<span class="gt-tag">${TYPE[x[0]].name.split(' ')[0]}</span> ${x[4]}`, type: x[0], ko: gKo(x, `${m.id}-g${i}`) }));
    m.listening.forEach((p) => p.qs.forEach((x, i) => out.push({ sec: 'l', key: `${p.id}-${i}`, n: out.length + 1, q: x[0], opts: x[1].map(esc), a: x[2], ex: x[3], part: p.id })));
    m.reading.forEach((p) => p.qs.forEach((x, i) => out.push({ sec: 'r', key: `${p.id}-${i}`, n: out.length + 1, q: x[0], opts: x[1].map(esc), a: x[2], ex: x[3], part: p.id })));
    return out;
  }
  const SEC = { g: '문법', l: '청취', r: '독해' };
  function score(m, picks) {
    const its = mockItems(m); const sec = {};
    for (const s of 'glr') { const xs = its.filter((x) => x.sec === s); sec[s] = pct(xs.filter((x) => picks[x.n] === x.a).length, xs.length); }
    return { sec, total: Math.round((sec.g + sec.l + sec.r) / 3), wrong: its.filter((x) => picks[x.n] !== x.a).map((x) => x.n) };
  }
  const fmt = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  function mock(arg) {
    const draft = S.get(K('mockDraft'), null);
    if (draft && (!arg || arg === 'go')) return mockRun(draft);
    if (arg && arg.startsWith('res-')) return mockResult(arg.slice(4));
    const done = mocks();
    root.innerHTML = `
      <h2 class="r-h">실전 모의고사 <small>문법 26 → 청취 26 → 독해 28 · 제한 시간 ${MOCK_MIN}분</small></h2>
      <div class="gt-tip">실제 시험처럼 <b>문법 → 청취 → 독해</b> 순서로 풀어요. 청취는 대본마다 <b>▶ 듣기</b>를 누르면 남녀 원어민 음성으로 읽어 주고, 실제 시험은 한 번만 들려주니 한 번에 듣는 연습을 해 보세요. 중간에 나가도 이어서 풀 수 있어요.</div>
      <div class="gt-mocks">${M.map((m, i) => { const r = done.find((x) => x.mock === m.id); return `<div class="gt-mock">
        <div><b>${esc(m.title)}</b><small>80문항 · ${MOCK_MIN}분</small></div>
        ${r ? `<div class="gt-sc"><b>${r.score}점</b><span>문법 ${r.sec.g} · 청취 ${r.sec.l} · 독해 ${r.sec.r}</span><small>${esc(r.date)}</small></div>` : ''}
        <div class="gt-bar">${r ? `<a class="gt-btn" href="#mock/res-${m.id}">결과·해설 보기</a>` : ''}<button type="button" class="gt-btn main" data-start="${i}">${r ? '다시 보기' : '시작하기'}</button></div>
      </div>`; }).join('')}</div>
      <p class="gt-muted">모의고사·연습 문제는 모두 실제 기출이 아니라 지텔프 Level 2 출제 유형에 맞춰 직접 만든 문제예요.</p>
      <div class="ad-slot" data-ad="list"></div>`;
    root.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => {
      const m = M[+b.dataset.start];
      S.set(K('mockDraft'), { id: m.id, start: Date.now(), used: 0, sec: 'g', picks: {}, plays: {} });
      location.hash = '#mock/go'; render();
    }));
  }

  function mockRun(d) {
    const m = M.find((x) => x.id === d.id); if (!m) { S.remove ? S.remove(K('mockDraft')) : S.set(K('mockDraft'), null); return mock(''); }
    const its = mockItems(m);
    const t0 = Date.now(); // 이번에 화면을 연 시각 (나가 있던 시간은 빼고 잰다)
    const save = () => { d.used = (d.used || 0) + (Date.now() - (d._t || t0)); d._t = Date.now(); S.set(K('mockDraft'), d); };
    d._t = t0;
    const left = () => MOCK_MIN * 60000 - (d.used + (Date.now() - d._t));
    const cnt = (s) => its.filter((x) => x.sec === s && d.picks[x.n] != null).length;
    const tot = (s) => its.filter((x) => x.sec === s).length;
    let body = '';
    if (d.sec === 'g') body = `<div class="gt-qs">${its.filter((x) => x.sec === 'g').map((x) => qHtml(x.key, x.n, x.q, x.opts, x.a, '', d.picks[x.n], false)).join('')}</div>`;
    else {
      const parts = d.sec === 'l' ? m.listening : m.reading;
      body = parts.map((p) => {
        const qs = its.filter((x) => x.part === p.id);
        const left_ = d.sec === 'l'
          ? `<article class="gt-passage"><h3>Part ${p.part} <small>${p.kind}</small></h3>${playerHtml(p.id, p.lines, { count: d.plays[p.id] || 0, limit: 1 })}<p class="gt-muted">문제 ${qs[0].n}–${qs[qs.length - 1].n} · 스크립트는 채점 뒤에 볼 수 있어요</p></article>`
          : `<article class="gt-passage"><h3><small>Part ${p.part} · ${p.kind}</small><br>${esc(p.title)}</h3>${p.paras.map((t) => `<p>${t}</p>`).join('')}</article>`;
        return `<div class="gt-work ${d.sec === 'l' ? 'listening' : 'reading'}" data-part="${p.id}">${left_}<div class="gt-side"><div class="gt-qs">${qs.map((x) => qHtml(x.key, x.n, x.q, x.opts, x.a, '', d.picks[x.n], false)).join('')}</div></div></div>`;
      }).join('');
    }
    root.innerHTML = `
      <div class="gt-mbar">
        <b>${esc(m.title)}</b>
        <span class="gt-time" id="mk-time">${fmt(left())}</span>
        <div class="gt-chips">${'glr'.split('').map((s) => `<button type="button" class="chip${d.sec === s ? ' on' : ''}" data-sec="${s}">${SEC[s]}<small>${cnt(s)}/${tot(s)}</small></button>`).join('')}</div>
        <button type="button" class="gt-btn main" id="mk-submit">제출·채점</button>
        <button type="button" class="gt-btn" id="mk-quit">그만두기</button>
      </div>
      ${body}
      <div class="gt-bar center">${d.sec !== 'r' ? `<button type="button" class="gt-btn main" id="mk-next">다음: ${SEC[d.sec === 'g' ? 'l' : 'r']} →</button>` : '<button type="button" class="gt-btn main" id="mk-submit2">제출·채점</button>'}</div>`;
    const tick = () => { const el = $('#mk-time'); if (!el) return clearInterval(timer); const l = left(); el.textContent = l > 0 ? fmt(l) : '시간 끝 ' + fmt(-l); el.classList.toggle('over', l <= 0); el.classList.toggle('warn', l > 0 && l < 10 * 60000); };
    timer = setInterval(tick, 1000); tick();
    window.onbeforeunload = () => { if (S.get(K('mockDraft'), null)) save(); };
    root.querySelectorAll('.gt-qs').forEach((box) => box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-o]'); if (!b) return;
      const n = +b.closest('.gt-q').querySelector('.gt-qt b').textContent.replace('.', '');
      d.picks[n] = +b.dataset.o; b.closest('.gt-opts').querySelectorAll('button').forEach((x) => x.classList.toggle('pick', x === b));
      save(); const c = root.querySelector(`[data-sec="${d.sec}"] small`); if (c) c.textContent = `${cnt(d.sec)}/${tot(d.sec)}`;
    }));
    if (d.sec === 'l') m.listening.forEach((p) => bindPlayer(root.querySelector(`[data-part="${p.id}"]`), p.lines, () => { d.plays[p.id] = (d.plays[p.id] || 0) + 1; save(); const s = root.querySelector(`[data-part="${p.id}"] .gt-player > .gt-muted`); if (s) s.textContent = `들은 횟수 ${d.plays[p.id]} / 실제 시험은 1번`; }));
    const go = (s) => { save(); d.sec = s; S.set(K('mockDraft'), d); clearInterval(timer); TTS.stop(); mockRun(d); window.scrollTo(0, 0); };
    root.querySelectorAll('[data-sec]').forEach((b) => b.addEventListener('click', () => go(b.dataset.sec)));
    const nx = $('#mk-next'); if (nx) nx.addEventListener('click', () => go(d.sec === 'g' ? 'l' : 'r'));
    const submit = () => {
      const miss = its.length - Object.keys(d.picks).length;
      if (!confirm(miss ? `${miss}문항을 안 풀었어요. 제출하고 채점할까요?` : '제출하고 채점할까요?')) return;
      save(); const sc = score(m, d.picks);
      A.save({ round: M.indexOf(m) + 1, mock: m.id, title: m.title, score: sc.total, sec: sc.sec, picks: d.picks, wrong: sc.wrong, date: today(), time: Math.round(d.used / 60000) });
      S.set(K('mockDraft'), null); window.onbeforeunload = null; TTS.stop(); clearInterval(timer);
      location.hash = '#mock/res-' + m.id;
    };
    $('#mk-submit').addEventListener('click', submit);
    const s2 = $('#mk-submit2'); if (s2) s2.addEventListener('click', submit);
    $('#mk-quit').addEventListener('click', () => {
      if (!confirm('풀던 모의고사를 지울까요? (답안은 저장되지 않아요)')) return;
      S.set(K('mockDraft'), null); window.onbeforeunload = null; location.hash = '#mock'; render();
    });
  }

  let resSec = 'all', resWrong = false;
  function mockResult(id) {
    const m = M.find((x) => x.id === id); const r = mocks().find((x) => x.mock === id);
    if (!m || !r) { location.hash = '#mock'; return; }
    const its = mockItems(m); const picks = r.picks || {};
    const ty = {}; its.filter((x) => x.sec === 'g').forEach((x) => { ty[x.type] = ty[x.type] || [0, 0]; ty[x.type][1]++; if (picks[x.n] === x.a) ty[x.type][0]++; });
    const show = (x) => (resSec === 'all' || x.sec === resSec) && (!resWrong || picks[x.n] !== x.a);
    const blocks = [];
    const exCls = showKo ? '' : ' no-ex';
    if (resSec === 'all' || resSec === 'g') blocks.push(`<h3 class="gt-sh">문법</h3><div class="gt-qs${exCls}">${its.filter((x) => x.sec === 'g' && show(x)).map((x) => qHtml(x.key, x.n, x.q, x.opts, x.a, x.ex, picks[x.n], true, x.ko)).join('')}</div>`);
    ['l', 'r'].forEach((s) => {
      if (resSec !== 'all' && resSec !== s) return;
      blocks.push(`<h3 class="gt-sh">${SEC[s]}</h3>`);
      (s === 'l' ? m.listening : m.reading).forEach((p) => {
        const qs = its.filter((x) => x.part === p.id && show(x)); if (!qs.length) return;
        const ko = showKo ? koOf(p) : null;
        const left_ = s === 'l' ? `<article class="gt-passage"><h3>Part ${p.part} <small>${p.kind}</small></h3>${playerHtml(p.id, p.lines)}${scriptHtml(p.lines, true, ko)}</article>`
          : `<article class="gt-passage"><h3><small>Part ${p.part} · ${p.kind}</small><br>${esc(p.title)}</h3>${parasHtml(p.paras, ko)}</article>`;
        blocks.push(`<div class="gt-work ${s === 'l' ? 'listening' : 'reading'}" data-part="${p.id}">${left_}<div class="gt-side"><div class="gt-qs${exCls}">${qs.map((x) => qHtml(x.key, x.n, x.q, x.opts, x.a, x.ex, picks[x.n], true)).join('')}</div></div></div>`);
      });
    });
    const cor = (s) => its.filter((x) => x.sec === s && picks[x.n] === x.a).length;
    root.innerHTML = `
      <h2 class="r-h">${esc(m.title)} 결과 <small>${esc(r.date)}${r.time ? ` · ${r.time}분 걸림` : ''}</small></h2>
      <div class="gt-result">
        <div class="gt-total"><b>${r.score}</b><span>총점 (세 영역 평균)</span></div>
        ${'glr'.split('').map((s) => `<div class="gt-secsc"><b>${r.sec[s]}</b><span>${SEC[s]} ${cor(s)}/${its.filter((x) => x.sec === s).length}</span><i style="--w:${r.sec[s]}%"></i></div>`).join('')}
      </div>
      <div class="gt-tip"><h3>문법 유형별</h3><div class="gt-types">${G.types.map((t) => ty[t.id] ? `<span class="${ty[t.id][0] < ty[t.id][1] ? 'r' : 'g'}">${t.name.split(' ')[0]} <b>${ty[t.id][0]}/${ty[t.id][1]}</b></span>` : '').join('')}</div>
        ${Object.entries(ty).filter(([, v]) => v[0] < v[1]).length ? `<p class="gt-muted">틀린 유형은 <a href="#grammar">문법</a>에서 공식을 다시 보고 연습 문제로 채워 보세요.</p>` : ''}</div>
      <div class="ad-slot" data-ad="result"></div>
      <div class="gt-bar"><div class="gt-chips">${[['all', '전체'], ['g', '문법'], ['l', '청취'], ['r', '독해']].map(([s, l]) => `<button type="button" class="chip${resSec === s ? ' on' : ''}" data-rs="${s}">${l}</button>`).join('')}</div>
        <label class="chip-check"><input type="checkbox" id="rs-wrong"${resWrong ? ' checked' : ''}> 틀린 문제만</label>
        <a class="gt-btn" href="#mock">모의고사 목록</a></div>
      ${koBar()}
      ${blocks.join('')}`;
    bindKo(() => mockResult(id));
    root.querySelectorAll('[data-rs]').forEach((b) => b.addEventListener('click', () => { resSec = b.dataset.rs; mockResult(id); }));
    $('#rs-wrong').addEventListener('change', (e) => { resWrong = e.target.checked; mockResult(id); });
    m.listening.forEach((p) => { const box = root.querySelector(`[data-part="${p.id}"]`); if (box) bindPlayer(box, p.lines); });
  }

  // ───────── 오답 (연습 + 모의고사) ─────────
  function wrong() {
    const gl = gLog(); const out = [];
    const gw = G.items.map((x, i) => [x, i]).filter(([x, i]) => gl[gKey(i)] != null && gl[gKey(i)] !== x[3]);
    if (gw.length) out.push(`<h3 class="gt-sh">문법 연습 <small>${gw.length}문항 · 다시 풀려면 문법 › 틀린 문제만</small></h3><div class="gt-qs">${gw.map(([x, i], k) => qHtml(gKey(i), k + 1, `<span class="gt-tag">${TYPE[x[0]].name.split(' ')[0]}</span> ${blank(x[1])}`, x[2].map(esc), x[3], x[4], gl[gKey(i)], true, gKo(x, gKey(i)))).join('')}</div>`);
    [['reading', R, '독해 연습'], ['listening', L, '청취 연습']].forEach(([kind, sets, label]) => {
      const log = sLog(kind); const rows = [];
      sets.forEach((s) => { const d = log[s.id]; if (!d) return; s.qs.forEach((q, i) => { if (d.picks[i] !== q[2]) rows.push(qHtml(`${s.id}-${i}`, i + 1, `<a class="gt-src" href="#${kind}/${s.id}">${esc(s.title)}</a> ${q[0]}`, q[1].map(esc), q[2], q[3], d.picks[i], true)); }); });
      if (rows.length) out.push(`<h3 class="gt-sh">${label} <small>${rows.length}문항</small></h3><div class="gt-qs">${rows.join('')}</div>`);
    });
    mocks().forEach((r) => {
      const m = M.find((x) => x.id === r.mock); if (!m) return;
      const its = mockItems(m).filter((x) => r.picks[x.n] !== x.a);
      if (!its.length) return;
      out.push(`<h3 class="gt-sh">${esc(m.title)} <small>${its.length}문항 · ${r.score}점 · <a href="#mock/res-${m.id}">지문·스크립트와 함께 보기</a></small></h3><div class="gt-qs">${its.map((x) => qHtml(x.key, x.n, `<span class="gt-tag">${SEC[x.sec]}</span> ${x.q}`, x.opts, x.a, x.ex, r.picks[x.n], true, x.ko)).join('')}</div>`);
    });
    const vl = vLog(); const vm = Object.entries(vl.miss).filter(([w]) => !vl.known.includes(w)).sort((a, b) => b[1] - a[1]);
    if (vm.length) out.push(`<h3 class="gt-sh">헷갈린 단어 <small>${vm.length}개 · 뜻 맞히기에서 틀린 단어</small></h3><table class="gt-tbl gt-vtbl"><tbody>${vm.map(([w, c]) => { const v = V.find((x) => x[0] === w); return v ? `<tr><td><b>${esc(w)}</b> <small class="r">${c}번</small></td><td>${esc(v[1])}</td><td>${esc(v[2])}</td></tr>` : ''; }).join('')}</tbody></table>`);
    root.innerHTML = `<h2 class="r-h">오답 <small>연습·모의고사에서 틀린 문제를 한곳에</small></h2>${out.join('') || '<p class="gt-muted">아직 틀린 문제가 없어요. 문법·독해·청취 연습이나 모의고사를 풀어 보세요.</p>'}<div class="ad-slot" data-ad="review"></div>`;
  }

  nav();
  window.addEventListener('hashchange', render);
  // 로그인해서 기록을 받아오면 다시 그린다 (모의고사를 푸는 중에는 화면을 그대로 둔다)
  S.onChange(() => { const { tab, arg } = route(); if (!(tab === 'mock' && (arg === 'go' || (!arg && S.get(K('mockDraft'), null))))) render(); });
  render();
})();
