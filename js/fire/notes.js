/*
 * 소방 기출 '개념' 탭 — 과목별로 문제를 유형으로 묶어 출제 빈도 순으로 보여 주고, 유형별 기초 개념·자주 나오는 개념(★)과 그 유형 문제 풀기를 제공한다.
 *   데이터: js/fire/topics.js (FIRE_TOPICS 유형·개념 정리, FIRE_TAGS '시험/과목' → 문항별 유형 번호)
 *   app.js 가 window.FIRE_NOTES.render(ctx) 로 부른다.
 */
(function () {
  const TOP = window.FIRE_TOPICS || {}; const TAGS = window.FIRE_TAGS || {};
  const SKIP = { kor: 1, eng: 1, liveeng: 1, hist: 1 };
  let curSubj = null, starOnly = false, openId = null;

  // 문항의 유형 이름 (해설 아래에 붙이는 태그용)
  window.FIRE_TOPIC = {
    name(k) {
      const [e, s, n] = k.split('/'); const arr = TAGS[`${e}/${s}`]; const t = TOP[s];
      if (!arr || !t) return ''; const i = arr[+n - 1]; return i >= 0 && t[i] ? t[i].name : '';
    },
  };

  function stat(ctx) {
    // 과목 → 유형 → { n: 문항 수, years: {연도: 수}, keys: [...] }
    const out = {};
    ctx.D.exams.filter((e) => e.kind === ctx.curKind).forEach((e) => e.subjects.forEach((s) => {
      if (SKIP[s.id] || !TOP[s.id]) return; const arr = TAGS[`${e.id}/${s.id}`] || [];
      out[s.id] = out[s.id] || TOP[s.id].map(() => ({ n: 0, years: {}, keys: [] }));
      arr.forEach((ti, i) => { if (ti < 0) return; const o = out[s.id][ti]; o.n++; o.years[e.year] = (o.years[e.year] || 0) + 1; o.keys.push(`${e.id}/${s.id}/${i + 1}`); });
    }));
    return out;
  }

  function render(ctx) {
    const { root, esc, SUBN } = ctx; const st = stat(ctx); const subs = Object.keys(st);
    if (!curSubj || !st[curSubj]) curSubj = subs[0];
    const list = TOP[curSubj].map((t, i) => Object.assign({ i }, t, st[curSubj][i])).filter((t) => t.n > 0).sort((a, b) => b.n - a.n);
    const total = list.reduce((a, t) => a + t.n, 0); const maxN = list.length ? list[0].n : 1;
    const bullet = (x) => (x[0] === '★' ? `<li class="star"><span>자주 출제</span>${esc(x.replace(/^★\s*/, ''))}</li>` : `<li>${esc(x)}</li>`);
    const years = (t) => Object.keys(t.years).sort().map((y) => `${y} <b>${t.years[y]}</b>`).join(' · ');
    const card = (t) => {
      const notes = starOnly ? t.notes.filter((x) => x[0] === '★') : t.notes;
      if (starOnly && !notes.length) return '';
      const open = starOnly || openId === t.id;
      return `<article class="fn-card${open ? ' open' : ''}" data-id="${t.id}">
        <header data-toggle="${t.id}"><h3>${esc(t.name)}</h3><span class="fn-cnt"><b>${t.n}</b>문항 · ${Math.round((t.n / total) * 100)}%</span><i style="--w:${Math.round((t.n / maxN) * 100)}%"></i></header>
        <div class="fn-body"><p class="fn-years">연도별 출제: ${years(t)}</p><ul class="fn-notes">${notes.map(bullet).join('')}</ul>
        <div class="gt-bar"><button type="button" class="gt-btn main" data-prac="${t.id}">이 유형 문제 풀기 (${Math.min(t.n, 30)}문항)</button></div></div></article>`;
    };
    const warn = curSubj === 'law' ? '<p class="fn-warn">법령 수치는 시험 당시 기준이에요. 개정으로 달라질 수 있으니 최신 법령도 꼭 확인하세요.</p>' : (curSubj === 'admin' ? '<p class="fn-warn">판례·법령은 출제 시점 기준으로 정리했어요.</p>' : '');
    root.innerHTML = `
      <h2 class="r-h">개념 정리 <small>문제를 유형으로 묶고 출제 빈도 순으로 보여 줘요. 유형은 문제 내용의 키워드로 자동 분류해서 일부는 어긋날 수 있어요.</small></h2>
      <div class="fn-subs">${subs.map((s) => `<button type="button" class="fn-sub${s === curSubj ? ' on' : ''}" data-s="${s}">${esc(SUBN[s])}</button>`).join('')}</div>
      <label class="chip-check fn-star"><input type="checkbox" id="fn-star"${starOnly ? ' checked' : ''}> 자주 나오는 개념(★)만 모아 보기</label>
      ${warn}
      <div class="fn-list">${list.map(card).join('') || '<p class="gt-muted">이 과목은 아직 정리된 개념이 없어요.</p>'}</div>`;
    root.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { curSubj = b.dataset.s; openId = null; render(ctx); }));
    const sb = root.querySelector('#fn-star'); if (sb) sb.addEventListener('change', () => { starOnly = sb.checked; render(ctx); });
    root.querySelectorAll('[data-toggle]').forEach((h) => h.addEventListener('click', () => { openId = openId === h.dataset.toggle ? null : h.dataset.toggle; render(ctx); }));
    root.querySelectorAll('[data-prac]').forEach((b) => b.addEventListener('click', () => {
      const t = list.find((x) => x.id === b.dataset.prac); if (!t) return;
      if (ctx.hasDraft() && !confirm('풀던 시험이 있어요. 지우고 새로 시작할까요?')) return;
      ctx.start(`${SUBN[curSubj]} · ${t.name}`, ctx.rnd(t.keys).slice(0, 30));
    }));
  }
  window.FIRE_NOTES = { render };
})();
