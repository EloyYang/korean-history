(function () {
  const KEY = window.QUIZ_KEY || {};
  const NUMS = '①②③④⑤';
  const rounds = Object.keys(KEY).map(Number).sort((a, b) => b - a);
  const box = document.getElementById('quiz');
  const bar = document.getElementById('quiz-bar');
  const draftKey = (r) => 'khmap.quizDraft.' + r;
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 무시 */ } };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const mmss = (s) => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + ':' + String(x).padStart(2, '0'); };
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);

  // view: list | solve | result
  const state = { round: null, answers: {}, times: {}, cur: 1, graded: false, view: 'list', onlyWrong: false, showGrid: false };
  let timer = null;

  const lastAttempt = (r) => window.ATTEMPTS.all().find((a) => a.round === r);
  function score(r, answers) {
    const k = KEY[r]; let s = 0; const wrong = [];
    for (let n = 1; n <= 50; n++) { if (answers[n] === k.ans[n - 1]) s += k.pt[n - 1]; else wrong.push(n); }
    return { score: s, wrong };
  }
  const saveDraft = () => { if (!state.graded) save(draftKey(state.round), { answers: state.answers, times: state.times, cur: state.cur }); };

  // ── 시간 재기: 문제 화면이 보이는 동안 그 문제의 시간을 1초씩 더한다
  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (state.view !== 'solve' || state.graded || document.visibilityState !== 'visible') return;
      state.times[state.cur] = (state.times[state.cur] || 0) + 1;
      const t = document.getElementById('q-time');
      if (t) t.innerHTML = `이 문제 <b>${mmss(state.times[state.cur])}</b> · 총 <b>${mmss(sum(state.times))}</b>`;
      if (sum(state.times) % 5 === 0) saveDraft();
    }, 1000);
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }

  // ── 회차 목록
  function renderList() {
    stopTimer(); bar.hidden = true; state.view = 'list';
    box.innerHTML = `
      <h2 class="r-h">회차 선택 <small>한국사능력검정시험 심화 · 50문항 · 100점</small></h2>
      <ul class="q-rounds">${rounds.map((r) => {
        const a = lastAttempt(r); const dr = load(draftKey(r), null); const dn = dr ? Object.keys(dr.answers || {}).length : 0;
        return `<li><a href="#${r}"><b>제${r}회</b>
          <span>${a ? `최근 ${a.score != null ? `<em>${a.score}점</em> · ` : ''}틀림 ${a.wrong.length}${a.total ? ` · ${mmss(a.total)}` : ''}${a.date ? ` · ${a.date}` : ''}` : '아직 안 풀었어요'}</span>
          ${dn ? `<span class="q-draft">이어 풀기 ${dn}/50 · ${mmss(sum(dr.times))}</span>` : ''}</a></li>`;
      }).join('')}</ul>
      <p class="r-note">문제 이미지의 ①~⑤를 누르면 답이 선택되고 다음 문제로 넘어가요. 문제마다 머문 시간과 총 소요 시간이 기록돼요. 키보드 1~5 · ← → 도 쓸 수 있어요.<br>채점 기록은 이 브라우저에 저장되고 오답 노트에 바로 반영돼요. 문항 사진 등의 저작권은 원저작자에게 있어요.</p>`;
  }

  // ── 한 문제 화면
  function solveHtml() {
    const r = state.round, n = state.cur, k = KEY[r];
    const a = state.answers[n], right = k.ans[n - 1];
    const hot = (k.hot && k.hot[n - 1]) || [];
    const res = state.graded ? (a === right ? 'right' : 'wrong') : '';
    const spots = [0, 1, 2, 3, 4].map((i) => {
      const h = hot[i]; if (!h) return '';
      let c = a === i + 1 ? ' pick' : '';
      if (state.graded) c += i + 1 === right ? ' ans' : a === i + 1 ? ' miss' : '';
      return `<button type="button" class="q-spot${c}" data-i="${i + 1}" style="left:${h[0] * 100}%;top:${h[1] * 100}%;width:${h[2] * 100}%;height:${h[3] * 100}%" aria-label="${NUMS[i]} 선택" ${state.graded ? 'disabled' : ''}></button>`;
    }).join('');
    const missing = hot.filter(Boolean).length < 5;
    return `
      <div class="q-one ${res}">
        <div class="q-head">
          <b>${n}번</b><span>${k.pt[n - 1]}점</span>
          ${state.graded ? `<span class="q-res">${a === right ? '정답' : a ? `오답 (고른 답 ${NUMS[a - 1]})` : '안 품'} · 정답 ${NUMS[right - 1]}</span><span class="q-tm">머문 시간 ${mmss(state.times[n])}</span>`
            : `<span id="q-time" class="q-tm">이 문제 <b>${mmss(state.times[n])}</b> · 총 <b>${mmss(sum(state.times))}</b></span>`}
        </div>
        <div class="q-imgwrap">
          <img src="quiz/${r}/${String(n).padStart(2, '0')}.webp" alt="${r}회 ${n}번 문제">
          ${spots}
        </div>
        ${missing ? `<div class="q-opts">${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="q-spot-btn${a === i ? ' pick' : ''}" data-i="${i}" ${state.graded ? 'disabled' : ''}>${NUMS[i - 1]}</button>`).join('')}</div>` : ''}
      </div>`;
  }

  function navList() {
    if (state.graded && state.onlyWrong) return score(state.round, state.answers).wrong;
    return Array.from({ length: 50 }, (_, i) => i + 1);
  }

  function renderSolve() {
    state.view = 'solve';
    const r = state.round, list = navList(), pos = list.indexOf(state.cur);
    const s = state.graded ? score(r, state.answers) : null;
    box.innerHTML = `
      <div class="q-top">
        <a href="#" class="top-link">← 회차 목록</a>
        <h2>제${r}회 심화 <small>${state.cur} / 50</small></h2>
        ${state.graded ? `<button type="button" class="top-link q-to-result">결과 보기</button>` : ''}
      </div>
      ${solveHtml()}
      <div class="q-nav">
        <button type="button" class="q-prev" ${pos <= 0 ? 'disabled' : ''}>◀ 이전</button>
        <button type="button" class="q-gridbtn">${state.graded ? (state.onlyWrong ? '틀린 문제만 보는 중' : '문항 목록') : `답한 문항 ${Object.keys(state.answers).length}/50`}</button>
        ${pos < list.length - 1 ? `<button type="button" class="q-next">다음 ▶</button>` : state.graded ? '<button type="button" class="q-to-result">결과 보기</button>' : '<button type="button" class="q-grade">채점하기</button>'}
      </div>
      <div class="q-grid"${state.showGrid ? '' : ' hidden'}>${Array.from({ length: 50 }, (_, i) => {
        const n = i + 1; const a = state.answers[n];
        const c = state.graded ? (a === KEY[r].ans[i] ? 'ok' : 'ng') : a ? 'on' : '';
        return `<button type="button" data-go="${n}" class="${c}${n === state.cur ? ' cur' : ''}">${n}</button>`;
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
    const avg = total / 50;
    const rows = Array.from({ length: 50 }, (_, i) => {
      const n = i + 1, a = state.answers[n], ok = a === k.ans[i], t = state.times[n] || 0;
      return `<button type="button" data-go="${n}" class="q-trow ${ok ? 'ok' : 'ng'}${t > avg * 1.8 && t > 60 ? ' slow' : ''}">
        <b>${n}</b><span>${ok ? '○' : '✕'}</span><span class="t">${mmss(t)}</span><span class="bar" style="width:${Math.min(100, (t / Math.max(1, ...Object.values(state.times))) * 100)}%"></span></button>`;
    }).join('');
    box.innerHTML = `
      <div class="q-top"><a href="#" class="top-link">← 회차 목록</a><h2>제${r}회 결과</h2></div>
      <div class="q-result">
        <b>${s.score}점</b>
        <span>맞음 ${50 - s.wrong.length} · 틀림 ${s.wrong.length}</span>
        <span>총 소요 시간 <b class="tt">${mmss(total)}</b> · 문제당 평균 ${mmss(avg)}</span>
        <span class="q-saved">오답 노트에 저장했어요</span>
      </div>
      <div class="q-actions">
        <button type="button" class="q-review-wrong" ${s.wrong.length ? '' : 'disabled'}>틀린 문제 다시 보기</button>
        <button type="button" class="q-review-all">전체 문제 보기</button>
        <a class="q-btn" href="review.html">오답 노트</a>
        <button type="button" class="q-retry">다시 풀기</button>
      </div>
      <h3 class="r-h">문제별 머문 시간 <small>○ 정답 · ✕ 오답 · 주황 = 평균보다 오래 걸린 문제</small></h3>
      <div class="q-times">${rows}</div>`;
    bar.hidden = true;
    window.scrollTo(0, 0);
  }

  function go(n) {
    state.cur = Math.max(1, Math.min(50, n));
    saveDraft(); renderSolve(); window.scrollTo(0, 0);
  }
  function step(d) {
    const list = navList(); const pos = list.indexOf(state.cur);
    const nx = list[pos + d] != null ? list[pos + d] : (pos < 0 ? list[0] : null);
    if (nx != null) go(nx);
  }

  function pick(i) {
    if (state.graded || state.view !== 'solve') return;
    const n = state.cur;
    state.answers[n] = i;
    saveDraft();
    box.querySelectorAll('.q-spot, .q-spot-btn').forEach((b) => b.classList.toggle('pick', +b.dataset.i === i));
    // 다음 문제로 (마지막 문제면 채점 안내)
    setTimeout(() => {
      if (state.cur !== n || state.view !== 'solve') return;
      if (n < 50) go(n + 1);
      else { state.showGrid = true; renderSolve(); }
    }, 350);
  }

  function grade() {
    const left = 50 - Object.keys(state.answers).length;
    if (left && !confirm(`아직 ${left}문항을 고르지 않았어요. 고르지 않은 문항은 틀린 것으로 채점할까요?`)) return;
    const s = score(state.round, state.answers);
    window.ATTEMPTS.save({ round: state.round, date: today(), wrong: s.wrong, answers: state.answers, score: s.score, times: state.times, total: sum(state.times) });
    try { localStorage.removeItem(draftKey(state.round)); } catch (e) { /* 무시 */ }
    state.graded = true; state.showGrid = false;
    renderResult();
  }

  function open(r) {
    state.round = r; state.onlyWrong = false; state.showGrid = false;
    const draft = load(draftKey(r), null);
    const a = lastAttempt(r);
    if (draft && Object.keys(draft.answers || {}).length + sum(draft.times) > 0) {
      state.answers = draft.answers || {}; state.times = draft.times || {}; state.cur = draft.cur || 1; state.graded = false; renderSolve();
    } else if (a && a.answers) {
      state.answers = a.answers; state.times = a.times || {}; state.cur = 1; state.graded = true; renderResult();
    } else {
      state.answers = {}; state.times = {}; state.cur = 1; state.graded = false; renderSolve();
    }
    window.scrollTo(0, 0);
  }

  function route() {
    const r = Number(location.hash.slice(1));
    if (KEY[r]) open(r); else { state.round = null; renderList(); }
  }

  document.addEventListener('click', (e) => {
    const sp = e.target.closest('.q-spot, .q-spot-btn');
    if (sp) { pick(+sp.dataset.i); return; }
    if (e.target.closest('.q-prev')) { step(-1); return; }
    if (e.target.closest('.q-next')) { step(1); return; }
    const g = e.target.closest('[data-go]');
    if (g) { state.showGrid = false; if (state.view === 'result') state.onlyWrong = false; go(+g.dataset.go); return; }
    if (e.target.closest('.q-gridbtn')) { state.showGrid = !state.showGrid; box.querySelector('.q-grid').hidden = !state.showGrid; return; }
    if (e.target.closest('.q-grade')) { grade(); return; }
    if (e.target.closest('.q-to-result')) { renderResult(); return; }
    if (e.target.closest('.q-review-wrong')) { state.onlyWrong = true; go(score(state.round, state.answers).wrong[0]); return; }
    if (e.target.closest('.q-review-all')) { state.onlyWrong = false; go(1); return; }
    if (e.target.closest('.q-retry')) {
      if (!confirm('답과 시간을 모두 지우고 처음부터 다시 풀까요? (오답 노트 기록은 다시 채점할 때 바뀌어요)')) return;
      state.answers = {}; state.times = {}; state.cur = 1; state.graded = false; state.onlyWrong = false; renderSolve(); window.scrollTo(0, 0);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (state.view !== 'solve' || e.target.closest('input, textarea')) return;
    if (/^[1-5]$/.test(e.key)) pick(+e.key);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveDraft(); });
  window.addEventListener('hashchange', route);
  route();
})();
