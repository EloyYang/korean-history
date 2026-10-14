/*
 * 선지별 포인트에 덧붙이는 정보 (기출 풀기·오답 노트·문제 보기 창 공통)
 *   optExtra('79-1', 0) → 그 선지의 시기·나라·왕(OPTM) + 같은 내용을 묻는 선지가 나온 다른 회차(OPT_SAME)
 */
(function () {
  const NUMS = '①②③④⑤';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const keyOf = (r) => ((window.QUIZ_KEYS || {}).history || {})[r];
  const qmeta = (r, n) => ((window.QMETA || {})[r] || [])[n - 1] || '';

  function metaHtml(id, i) {
    const [r, n] = id.split('-').map(Number);
    let m = ((window.OPTM || {})[id] || [])[i]; if (!m) return '';
    if (m === '=') m = qmeta(r, n);
    const [when, state, king] = m.split('|');
    const cell = (k, v) => (v ? `<span><i>${k}</i>${esc(v)}</span>` : '');
    const h = cell('시기', when) + cell('나라', state) + cell('왕·정부', king);
    return h ? `<span class="ox-meta">${h}</span>` : '';
  }

  // 다른 회차에서는 어떤 문제의 정답/오답 선지로 나왔는지
  function sameHtml(id, i) {
    const refs = (((window.OPT_SAME || {})[id] || [])[i] || '').split(',').filter(Boolean);
    if (!refs.length) return '';
    const rows = refs.map((ref) => {
      const loose = ref.endsWith('~'); const [r, n, o] = ref.replace('~', '').split('-').map(Number);
      const k = keyOf(r); const isAns = k && k.ans[n - 1] === o;
      const row = ((window.EXAM || {})[r] || []).find((x) => x[0] === n);
      const [when, state] = qmeta(r, n).split('|');
      const about = [row ? row[2] : '', state || when || ''].filter(Boolean).join(' · ');
      return `<span class="ox-same-row"><button type="button" data-optq="${r}-${n}" title="이 문제 보기">${r}회 ${n}번 ${NUMS[o - 1]}</button><b class="${isAns ? 'a' : 'x'}">${isAns ? '정답 선지' : '오답 선지'}</b>${loose ? '<em class="lz" title="문장은 다르지만 같은 내용을 묻는 선지">표현 다름</em>' : ''}${about ? `<span>${esc(about)} 문제</span>` : ''}</span>`;
    }).join('');
    return `<span class="ox-same"><i>같은 내용이 다른 회차에도 나옴 ${refs.length}회</i>${rows}</span>`;
  }

  window.optExtra = (id, i) => metaHtml(id, i) + sameHtml(id, i);

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-optq]');
    if (!b || !window.QView) return;
    e.stopPropagation();
    window.QView.open([b.dataset.optq], { title: '같은 내용의 선지가 나온 문제', showAnswer: true });
  }, true);
})();
