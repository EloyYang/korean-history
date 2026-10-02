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
  const state = { scope: store.get('reviewScope', 'target'), hideDone: store.get('reviewHideDone', false), openAll: store.get('reviewOpenAll', false), eraRound: store.get('reviewEraRound', 'all') };
  const openSet = new Set();
  const MKEY = window.ATTEMPTS.key('mastered');
  const mastered = new Set(window.UserStore.get(MKEY, []));

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
    if (!m || !(m.q || m.o.some(Boolean))) return '';
    return `<div class="rq-memo"><p class="sv-h">내 메모</p>${m.q ? `<p class="m-q">${esc(m.q)}</p>` : ''}${m.o.some(Boolean) ? `<ul>${m.o.map((t, i) => (t ? `<li><b>${NUMS[i]}</b> ${esc(t)}</li>` : '')).join('')}</ul>` : ''}</div>`;
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
          ${q.time ? `<span class="rq-time">풀이 ${mmss(q.time)}</span>` : ''}
          <label class="rq-done"><input type="checkbox" ${done ? 'checked' : ''}> 외웠어요</label>
        </div>
        ${img || `${f && f.stem ? `<p class="rq-stem">${esc(f.stem)}</p>` : ''}<div class="rq-body">${body}</div>`}
        ${opts || (!img && q.ans ? `<p class="rq-ans"><span>정답</span><q>${esc(q.ans)}</q></p>` : '')}
        ${img && !sv ? `<div class="rq-solve"><button class="rq-toggle" type="button">${open ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾'}</button><div class="rq-solve-body">${QKEY[q.round] ? `<p class="sv-h">정답</p><p class="sv-how"><b>${NUMS[QKEY[q.round].ans[q.num - 1] - 1]}</b> ${q.ans ? esc(q.ans) : ''}</p>` : ''}<p class="sv-h">정답 도출 포인트</p><p class="sv-how">아직 정리 전이에요 — Claude에게 이 문항의 풀이 포인트를 요청해 주세요.</p></div></div>` : ''}
        ${sv ? `<div class="rq-solve">
          <button class="rq-toggle" type="button">${open ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾'}</button>
          <div class="rq-solve-body">
            <p class="sv-h">지문에서 잡을 단서</p>
            <p class="sv-clue">${sv.clue.map((c) => `<mark class="clue">${esc(c)}</mark>`).join(' ')}</p>
            <p class="sv-h">정답까지 생각의 순서</p>
            <p class="sv-how">${sv.how}</p>
            ${img && f ? `<p class="sv-h">선지별 정리</p><ol class="sv-opts">${f.opts.map((o, i) => `<li class="${i === f.ans ? 'ans' : ''}"><span class="n">${NUMS[i]}</span><span>${esc(o)}<small>${sv.opts ? sv.opts[i] : ''}</small></span></li>`).join('')}</ol>` : ''}
          </div></div>` : ''}
        ${memoView(q)}
        ${q.target ? '' : `<p class="rq-why">복습 대상 제외 — ${why(q)}</p>`}
      </li>`;
  }

  function render() {
    const others = wrongs.filter((q) => !q.target);
    const list = state.scope === 'all' ? wrongs : state.scope === 'other' ? others : targets;
    const shown = state.hideDone ? list.filter((q) => !mastered.has(q.id)) : list;
    const doneN = targets.filter((q) => mastered.has(q.id)).length;

    // 회차 기록
    const rounds = LOG.map((l) => {
      const qs = l.wrong.map((n) => Q(l.round, n));
      const lost = qs.reduce((a, q) => a + (q.pt || (QKEY[l.round] ? QKEY[l.round].pt[q.num - 1] : 0)), 0);
      const unknown = qs.some((q) => !q.pt);
      const tg = qs.filter((q) => q.target).map((q) => q.num);
      return `<tr>
        <th>${l.round}회</th><td>${esc(l.date || '')}</td>
        <td><b>${l.wrong.length}</b> / 50</td>
        <td>${l.score != null ? `<b>${l.score}</b>점` : `${unknown ? '약 ' : ''}<b>${100 - lost}</b>점`}${l.src === 'claude' ? ' <small class="src">Claude 기록</small>' : l.answers ? ' <small class="src">기출 풀기</small>' : ''}</td>
        <td>${l.total ? mmss(l.total) : '-'}</td>
        <td class="nums">${l.wrong.map((n) => `<span class="${tg.includes(n) ? 'on' : ''}">${n}</span>`).join('')}</td>
        <td><button type="button" class="r-del" data-del="${l.round}" title="${l.round}회 기록 삭제">삭제</button></td>
      </tr>`;
    }).join('');

    // 시대별 약점: 푼 회차의 전체 문항을 시대별로 → 출제 수 · 틀린 수
    const eraRounds = LOG.map((l) => l.round).sort((a, b) => b - a);
    if (state.eraRound !== 'all' && !eraRounds.includes(+state.eraRound)) state.eraRound = 'all';
    const byEra = new Map();
    LOG.filter((l) => state.eraRound === 'all' || l.round === +state.eraRound).forEach((l) => {
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
      <li class="${v.all >= 2 && v.wr / v.all >= 0.5 ? 'weak' : ''}"><span class="bar-name" title="${esc(periodTip(e))}">${esc(periodName(e))}</span>
        <span class="bar-track"><span class="bar-all" style="width:${(v.all / maxAll) * 100}%"></span><span class="bar-wr" style="width:${(v.wr / maxAll) * 100}%"></span><span class="bar-tg" style="width:${(v.tg / maxAll) * 100}%"></span></span>
        <span class="bar-n">출제 ${v.all} · 틀림 <b>${v.wr}</b> <i>${pct(v.wr, v.all)}%</i></span></li>`).join('');
    const eraSeg = eraRounds.length ? `<div class="r-tools"><span class="seg">${['all', ...eraRounds].map((r) => `<button data-era-round="${r}" aria-pressed="${String(state.eraRound) === String(r)}">${r === 'all' ? `전체 회차 (${eraRounds.length})` : `${r}회`}</button>`).join('')}</span>
      <p class="r-scope-note">${state.eraRound === 'all' ? `푼 ${eraRounds.length}개 회차` : `${state.eraRound}회`} 전체 ${sumAll}문항 중 <b>${sumWr}</b>문항 틀림 (오답률 ${pct(sumWr, sumAll)}%)</p></div>` : '';

    // 내가 약한 개념: 같은 기출 포인트(없으면 주제)끼리 묶어 출제 수 대비 틀린 수
    const byPt = new Map();
    LOG.filter((l) => state.eraRound === 'all' || l.round === +state.eraRound).forEach((l) => {
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
    const weakHtml = weak.map((v) => {
      const { q } = v; const p = q.pIdx >= 0 && GICHUL[q.pEra] ? GICHUL[q.pEra].pts[q.pIdx] : null;
      const per = periodName(periodOf(q.pIdx >= 0 ? q.pEra : q.era));
      return `<li class="wk${v.done ? ' done' : ''}">
        <span class="wk-era">${esc(per)}</span>
        <span class="wk-t">${p ? `<span class="rp-freq">${starTxt(Math.min(p[0], 3))}</span>${p[1]}` : `${esc(q.theme)} <small class="rp-none">기출 포인트 외</small>`}</span>
        <span class="wk-n">틀림 <b>${v.wrongs.length}</b> / 출제 ${v.all}${v.done ? ' · ✓ 외움' : ''}</span>
        <span class="wk-qs">${v.wrongs.map((w) => `<button type="button" data-goto="${w.id}" class="${mastered.has(w.id) ? 'm' : ''}${w.target ? '' : ' off'}">${w.round}회 ${w.num}번</button>`).join('')}</span></li>`;
    }).join('');

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
                  <span class="rp-cnt">오답 ${qs.length}</span></div>
                <ol class="rq-list">${qs.map(qCard).join('')}</ol>
              </div>`;
          }).join('')}
        </section>`;
    }).join('');

    const pend = window.ATTEMPTS.pendingImport();
    const banner = pend.length ? `<div class="r-import"><span>채팅으로 Claude에게 알려 준 기록(${pend.map((l) => l.round + '회').join(', ')})이 있어요. 내 기록으로 가져올까요?${window.UserStore.user ? '' : ' <small>(로그인하면 계정에 저장돼요)</small>'}</span><button type="button" data-import="yes">가져오기</button><button type="button" data-import="no">내 기록 아님</button></div>` : '';
    document.getElementById('review').innerHTML = banner + `
      <section class="r-summary">
        <div><b>${LOG.length}</b><span>푼 회차</span></div>
        <div><b>${wrongs.length}</b><span>틀린 문항</span></div>
        <div class="hl"><b>${targets.length}</b><span>복습 대상<br><small>★★ 이상 · 난이도 하·중</small></span></div>
        <div><b>${others.length}</b><span>어렵거나 빈도 낮음<br><small>★ 또는 난이도 중상 이상</small></span></div>
        <div><b>${doneN} / ${targets.length}</b><span>외운 문항</span></div>
      </section>

      <h2 class="r-h">회차별 기록</h2>
      <div class="r-table-wrap"><table class="r-table">
        <thead><tr><th>회차</th><th>푼 날짜</th><th>틀림</th><th>점수</th><th>소요 시간</th><th>틀린 번호 <small>(<span class="on-sample">색칠</span> = 복습 대상)</small></th><th></th></tr></thead>
        <tbody>${rounds || '<tr><td colspan="7">아직 기록이 없어요</td></tr>'}</tbody>
      </table></div>

      <h2 class="r-h">시대별 약점 <small>연한 막대 = 출제 문항, 중간 = 틀린 문항, 진한 막대 = 그중 복습 대상</small></h2>
      ${eraSeg}
      <ul class="r-bars">${bars || '<li class="r-empty">아직 푼 회차가 없어요</li>'}</ul>

      <h2 class="r-h">내가 약한 개념 <small>${state.eraRound === 'all' ? '푼 회차 전체' : state.eraRound + '회'} 기준 · 많이 틀린 순 · 번호를 누르면 문제로 이동</small></h2>
      <ol class="r-weak">${weakHtml || '<li class="r-empty">틀린 개념이 없어요 🎉</li>'}</ol>

      <h2 class="r-h">암기가 부족한 기출 포인트</h2>
      <div class="r-tools">
        <span class="seg"><button data-scope="target" aria-pressed="${state.scope === 'target'}">복습 대상만 (${targets.length})</button><button data-scope="other" aria-pressed="${state.scope === 'other'}" title="출제빈도 ★ 또는 난이도 중상·상·특">어렵거나 빈도 낮은 문제 (${others.length})</button><button data-scope="all" aria-pressed="${state.scope === 'all'}">틀린 문제 전체 (${wrongs.length})</button></span>
        ${state.scope === 'other' ? `<p class="r-scope-note">복습 대상(★★ 이상·난이도 하·중)에서 빠진 문제예요. 난이도가 높은 문제 ${others.filter((q) => !EASY.includes(q.diff)).length}개, 출제빈도가 낮은 문제(★) ${others.filter((q) => q.stars < MIN_STARS).length}개 (겹치는 문제 포함)</p>` : ''}
        <label class="chip-check"><input type="checkbox" id="hide-done" ${state.hideDone ? 'checked' : ''}> 외운 문항 숨기기</label>
        <label class="chip-check"><input type="checkbox" id="open-all" ${state.openAll ? 'checked' : ''}> 정답 도출 포인트 모두 펼치기</label>
      </div>
      ${pointsHtml || '<p class="r-empty">모두 외웠어요! 🎉</p>'}
      <p class="r-note">정답 선지·지문은 국사편찬위원회 한국사능력검정시험 심화 문항에서 발췌했어요. 새 회차를 풀면 Claude에게 회차와 틀린 번호를 알려 주세요. ‘외웠어요’ 표시는 이 브라우저에만 저장돼요.</p>`;
  }

  document.addEventListener('click', (e) => {
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
    if (er) { state.eraRound = er.dataset.eraRound; store.set('reviewEraRound', state.eraRound); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const go = e.target.closest('button[data-goto]');
    if (go) {
      const sel = `.rq[data-id="${go.dataset.goto}"]`;
      if (!document.querySelector(sel)) { state.scope = 'all'; state.hideDone = false; store.set('reviewScope', 'all'); store.set('reviewHideDone', false); render(); }
      const li = document.querySelector(sel); if (!li) return;
      li.classList.add('open', 'flash'); openSet.add(li.dataset.id);
      const tg = li.querySelector('.rq-toggle'); if (tg) tg.textContent = '정답·도출 포인트 접기 ▴';
      li.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => li.classList.remove('flash'), 1600);
      return;
    }
    const s = e.target.closest('button[data-scope]');
    if (s) { state.scope = s.dataset.scope; store.set('reviewScope', state.scope); render(); return; }
    const t = e.target.closest('.rq-toggle');
    if (t) {
      const li = t.closest('.rq'); const on = !li.classList.contains('open');
      li.classList.toggle('open', on); if (on) openSet.add(li.dataset.id); else openSet.delete(li.dataset.id);
      t.textContent = on ? '정답·도출 포인트 접기 ▴' : '정답·도출 포인트 보기 ▾';
    }
  });
  document.addEventListener('change', (e) => {
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
