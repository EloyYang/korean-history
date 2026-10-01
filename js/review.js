(function () {
  // 복습 대상 기준: 출제빈도 ★★ 이상 + 난이도 하·중
  const MIN_STARS = 2;
  const EASY = ['하', '중'];

  const ERAS = window.ERAS || [];
  const GICHUL = window.GICHUL || {};
  const EXAM = window.EXAM || {};
  const LOG = window.ATTEMPTS ? window.ATTEMPTS.all() : (window.MY_LOG || []).slice().sort((a, b) => b.round - a.round);
  const QKEY = window.QUIZ_KEY || {};
  const eraName = (id) => (ERAS.find((e) => e.id === id) || { name: id || '기타' }).name;
  const eraOrder = (id) => { const i = ERAS.findIndex((e) => e.id === id); return i < 0 ? 99 : i; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('khmap.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('khmap.' + k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
  };
  const state = { scope: store.get('reviewScope', 'target'), hideDone: store.get('reviewHideDone', false), openAll: store.get('reviewOpenAll', false) };
  const openSet = new Set();
  const mastered = new Set(store.get('mastered', []));

  // 문항 정보 → 객체
  const Q = (round, num) => {
    const row = (EXAM[round] || []).find((x) => x[0] === num);
    if (!row) return { round, num, id: `${round}-${num}`, era: '', theme: '분류 정보 없음', stars: 0, diff: '-', ans: '', pEra: '', pIdx: -1, ex: '', pt: QKEY[round] ? QKEY[round].pt[num - 1] : 0, target: true, unknown: true };
    const [, era, theme, stars, diff, ans, pEra, pIdx, ex, pt] = row;
    return { round, num, era, theme, stars, diff, ans, pEra, pIdx, ex, pt, id: `${round}-${num}`,
      target: stars >= MIN_STARS && EASY.includes(diff) };
  };
  const wrongs = LOG.flatMap((l) => l.wrong.map((n) => Q(l.round, n))).filter((q) => !q.missing);
  const targets = wrongs.filter((q) => q.target);

  const starTxt = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
  const why = (q) => [q.stars < MIN_STARS ? `빈도 ${'★'.repeat(q.stars)}` : '', !EASY.includes(q.diff) ? `난이도 ${q.diff}` : ''].filter(Boolean).join(' · ');

  const FULL = window.WRONG_Q || {};
  const SOLVE = window.SOLVE || {};
  const NUMS = '①②③④⑤';
  // 지문 속 단서에 형광펜
  const markClues = (html, clues) => (clues || []).reduce((h, c) => h.split(esc(c)).join(`<mark class="clue">${esc(c)}</mark>`), html);

  function qCard(q) {
    const done = mastered.has(q.id);
    const f = FULL[q.id];
    const sv = SOLVE[q.id];
    const img = QKEY[q.round] ? `<img class="rq-img" src="quiz/${q.round}/${String(q.num).padStart(2, '0')}.webp" alt="${q.round}회 ${q.num}번 문제" loading="lazy">` : '';
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
        ${q.target ? '' : `<p class="rq-why">복습 대상 제외 — ${why(q)}</p>`}
      </li>`;
  }

  function render() {
    const list = state.scope === 'all' ? wrongs : targets;
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
        <td>${l.score != null ? `<b>${l.score}</b>점` : `${unknown ? '약 ' : ''}<b>${100 - lost}</b>점`}${l.src === 'local' ? ' <small class="src">기출 풀기</small>' : ''}</td>
        <td class="nums">${l.wrong.map((n) => `<span class="${tg.includes(n) ? 'on' : ''}">${n}</span>`).join('')}</td>
      </tr>`;
    }).join('');

    // 시대별 약점
    const byEra = new Map();
    wrongs.forEach((q) => {
      const e = q.pEra && q.pIdx >= 0 ? q.pEra : q.era;
      if (!byEra.has(e)) byEra.set(e, { all: 0, tg: 0 });
      byEra.get(e).all++; if (q.target) byEra.get(e).tg++;
    });
    const maxAll = Math.max(1, ...[...byEra.values()].map((v) => v.all));
    const bars = [...byEra.entries()].sort((a, b) => eraOrder(a[0]) - eraOrder(b[0])).map(([e, v]) => `
      <li><span class="bar-name" title="${esc(eraName(e))}">${esc(eraName(e).split(" · ")[0])}</span>
        <span class="bar-track"><span class="bar-all" style="width:${(v.all / maxAll) * 100}%"></span><span class="bar-tg" style="width:${(v.tg / maxAll) * 100}%"></span></span>
        <span class="bar-n"><b>${v.tg}</b> / ${v.all}</span></li>`).join('');

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
          <h3><a href="index.html#${esc(e)}">${esc(eraName(e))}</a> <small>${n}문항</small></h3>
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

    document.getElementById('review').innerHTML = `
      <section class="r-summary">
        <div><b>${LOG.length}</b><span>푼 회차</span></div>
        <div><b>${wrongs.length}</b><span>틀린 문항</span></div>
        <div class="hl"><b>${targets.length}</b><span>복습 대상<br><small>★★ 이상 · 난이도 하·중</small></span></div>
        <div><b>${doneN} / ${targets.length}</b><span>외운 문항</span></div>
      </section>

      <h2 class="r-h">회차별 기록</h2>
      <div class="r-table-wrap"><table class="r-table">
        <thead><tr><th>회차</th><th>푼 날짜</th><th>틀림</th><th>점수</th><th>틀린 번호 <small>(<span class="on-sample">색칠</span> = 복습 대상)</small></th></tr></thead>
        <tbody>${rounds || '<tr><td colspan="5">아직 기록이 없어요</td></tr>'}</tbody>
      </table></div>

      <h2 class="r-h">시대별 약점 <small>진한 막대 = 복습 대상, 연한 막대 = 틀린 문항 전체</small></h2>
      <ul class="r-bars">${bars}</ul>

      <h2 class="r-h">암기가 부족한 기출 포인트</h2>
      <div class="r-tools">
        <span class="seg"><button data-scope="target" aria-pressed="${state.scope === 'target'}">복습 대상만 (${targets.length})</button><button data-scope="all" aria-pressed="${state.scope === 'all'}">틀린 문제 전체 (${wrongs.length})</button></span>
        <label class="chip-check"><input type="checkbox" id="hide-done" ${state.hideDone ? 'checked' : ''}> 외운 문항 숨기기</label>
        <label class="chip-check"><input type="checkbox" id="open-all" ${state.openAll ? 'checked' : ''}> 정답 도출 포인트 모두 펼치기</label>
      </div>
      ${pointsHtml || '<p class="r-empty">모두 외웠어요! 🎉</p>'}
      <p class="r-note">정답 선지·지문은 국사편찬위원회 한국사능력검정시험 심화 문항에서 발췌했어요. 새 회차를 풀면 Claude에게 회차와 틀린 번호를 알려 주세요. ‘외웠어요’ 표시는 이 브라우저에만 저장돼요.</p>`;
  }

  document.addEventListener('click', (e) => {
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
      store.set('mastered', [...mastered]);
      const y = window.scrollY; render(); window.scrollTo(0, y);
    }
  });
  render();
})();
