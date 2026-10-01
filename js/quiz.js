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
  const state = { round: null, answers: {}, graded: false, onlyWrong: false };

  const lastAttempt = (r) => window.ATTEMPTS.all().find((a) => a.round === r);

  function score(r, answers) {
    const k = KEY[r]; let s = 0; const wrong = [];
    for (let n = 1; n <= 50; n++) {
      if (answers[n] === k.ans[n - 1]) s += k.pt[n - 1]; else wrong.push(n);
    }
    return { score: s, wrong };
  }

  function renderList() {
    bar.hidden = true;
    box.innerHTML = `
      <h2 class="r-h">회차 선택 <small>국사편찬위원회 공식 문제지 · 50문항 · 100점</small></h2>
      <ul class="q-rounds">${rounds.map((r) => {
        const a = lastAttempt(r); const dr = Object.keys(load(draftKey(r), {})).length;
        return `<li><a href="#${r}"><b>제${r}회</b>
          <span>${a ? `최근 ${a.score != null ? `<em>${a.score}점</em> · ` : ''}틀림 ${a.wrong.length}${a.date ? ` · ${a.date}` : ''}` : '아직 안 풀었어요'}</span>
          ${dr ? `<span class="q-draft">이어 풀기 ${dr}/50</span>` : ''}</a></li>`;
      }).join('')}</ul>
      <p class="r-note">문항 이미지 출처: 국사편찬위원회 한국사능력검정시험 시험 자료실(공식 문제지·정답표). 문항에 쓰인 사진 등의 저작권은 원저작자에게 있어요. 채점 기록은 이 브라우저에 저장되고 오답 노트에 바로 반영돼요.</p>`;
  }

  function qHtml(n) {
    const k = KEY[state.round]; const a = state.answers[n]; const right = k.ans[n - 1];
    const res = state.graded ? (a === right ? ' right' : ' wrong') : '';
    if (state.graded && state.onlyWrong && a === right) return '';
    return `
      <li class="q-card${res}" id="q${n}">
        <div class="q-head"><b>${n}번</b><span>${k.pt[n - 1]}점</span>${state.graded ? `<span class="q-res">${a === right ? '정답' : a ? '오답' : '안 품'}</span>` : ''}</div>
        <img src="quiz/${state.round}/${String(n).padStart(2, '0')}.webp" alt="${state.round}회 ${n}번 문제" loading="lazy">
        <div class="q-opts">${[1, 2, 3, 4, 5].map((i) => {
          let c = a === i ? ' pick' : '';
          if (state.graded) c += i === right ? ' ans' : a === i ? ' miss' : '';
          return `<button type="button" data-n="${n}" data-i="${i}" class="${c.trim()}" ${state.graded ? 'disabled' : ''}>${NUMS[i - 1]}</button>`;
        }).join('')}</div>
      </li>`;
  }

  function renderBar() {
    const done = Object.keys(state.answers).length;
    bar.hidden = false;
    if (!state.graded) {
      bar.innerHTML = `<span>제${state.round}회 · 답한 문항 <b>${done}</b> / 50</span>
        <span class="q-jump">${Array.from({ length: 50 }, (_, i) => `<a href="#q${i + 1}" class="${state.answers[i + 1] ? 'on' : ''}" title="${i + 1}번">${i + 1}</a>`).join('')}</span>
        <button type="button" class="q-grade">채점하기</button>`;
    } else {
      const s = score(state.round, state.answers);
      bar.innerHTML = `<span>제${state.round}회 · <b>${s.score}점</b> · 틀림 ${s.wrong.length}문항</span>
        <label class="chip-check"><input type="checkbox" id="only-wrong" ${state.onlyWrong ? 'checked' : ''}> 틀린 문제만</label>
        <a class="q-btn" href="review.html">오답 노트 보기</a>
        <button type="button" class="q-retry">다시 풀기</button>`;
    }
  }

  function renderRound() {
    const r = state.round;
    box.innerHTML = `
      <div class="q-top"><a href="#" class="top-link">← 회차 목록</a><h2>제${r}회 한국사능력검정시험 (심화)</h2></div>
      ${state.graded ? (() => { const s = score(r, state.answers); return `<div class="q-result"><b>${s.score}점</b><span>맞음 ${50 - s.wrong.length} · 틀림 ${s.wrong.length}</span><span class="nums">${s.wrong.map((n) => `<a href="#q${n}">${n}</a>`).join('')}</span><span class="q-saved">오답 노트에 저장했어요</span></div>`; })() : ''}
      <ol class="q-list">${Array.from({ length: 50 }, (_, i) => qHtml(i + 1)).join('')}</ol>`;
    renderBar();
  }

  function open(r) {
    state.round = r; state.onlyWrong = false;
    const draft = load(draftKey(r), null);
    const a = lastAttempt(r);
    if (draft && Object.keys(draft).length) { state.answers = draft; state.graded = false; }
    else if (a && a.answers) { state.answers = a.answers; state.graded = true; }
    else { state.answers = {}; state.graded = false; }
    renderRound();
    window.scrollTo(0, 0);
  }

  function route() {
    const r = Number(location.hash.slice(1));
    if (KEY[r]) open(r); else { state.round = null; renderList(); }
  }

  document.addEventListener('click', (e) => {
    const j = e.target.closest('a[href^="#q"]');
    if (j) { e.preventDefault(); const t = document.getElementById(j.getAttribute('href').slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const b = e.target.closest('.q-opts button');
    if (b && !state.graded) {
      const n = +b.dataset.n, i = +b.dataset.i;
      if (state.answers[n] === i) delete state.answers[n]; else state.answers[n] = i;
      save(draftKey(state.round), state.answers);
      b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('pick', state.answers[n] === +x.dataset.i));
      renderBar();
      return;
    }
    if (e.target.closest('.q-grade')) {
      const left = 50 - Object.keys(state.answers).length;
      if (left && !confirm(`아직 ${left}문항을 고르지 않았어요. 고르지 않은 문항은 틀린 것으로 채점할까요?`)) return;
      const s = score(state.round, state.answers);
      window.ATTEMPTS.save({ round: state.round, date: today(), wrong: s.wrong, answers: state.answers, score: s.score });
      try { localStorage.removeItem(draftKey(state.round)); } catch (err) { /* 무시 */ }
      state.graded = true; renderRound(); window.scrollTo(0, 0);
      return;
    }
    if (e.target.closest('.q-retry')) {
      if (!confirm('답을 모두 지우고 다시 풀까요? (오답 노트 기록은 다시 채점할 때 바뀌어요)')) return;
      state.answers = {}; state.graded = false; renderRound(); window.scrollTo(0, 0);
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'only-wrong') { state.onlyWrong = e.target.checked; renderRound(); }
  });
  window.addEventListener('hashchange', () => { if (!/^#q\d+$/.test(location.hash)) route(); });
  route();
})();
