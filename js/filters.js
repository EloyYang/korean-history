/*
 * 공통 필터 UI — 큰 버튼(주로 고르는 것) + 한 줄 선택 상자(나머지 필터)
 *   FILTER.modes(attr, list, val[, 'wrap'])  list = [[값, 이름, 작은 글씨(선택), 비활성(선택)], …]
 *   FILTER.pick(attr, 이름, list, val)       list = [[값, 이름], …]  → <select>
 *   FILTER.multi(키, 이름, 요약, 안쪽HTML)    여러 개를 고르는 필터 — 접어 둔 목록(안쪽은 기존 버튼 그대로, 펼침 상태는 키별로 기억)
 *   FILTER.bind(root, attr, fn)              버튼 클릭 · 선택 상자 변경을 같은 콜백 fn(값)으로 받는다
 *   위임(closest) 방식 화면은 bind 없이도 된다 — 선택 상자가 바뀌면 같은 attr 를 가진 보이지 않는 버튼을 눌러 준다
 */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const openMap = {}; // 펼친 다중 선택 목록은 화면을 다시 그려도 펼친 채로 둔다
  document.addEventListener('toggle', (e) => { const d = e.target; if (d.classList && d.classList.contains('f-multi')) openMap[d.dataset.k] = d.open; }, true);
  window.FILTER = {
    modes(attr, list, val, cls) {
      return `<div class="f-modes${cls ? ' ' + cls : ''}">${list.map(([v, l, sub, off]) => `<button type="button" ${attr}="${esc(v)}" class="${String(val) === String(v) ? 'on' : ''}" aria-pressed="${String(val) === String(v)}"${off ? ' disabled' : ''}>${l}${sub != null && sub !== '' ? `<small>${sub}</small>` : ''}</button>`).join('')}</div>`;
    },
    pick(attr, label, list, val) {
      return `<label class="f-sel">${label ? `<span>${esc(label)}</span>` : ''}<select data-fsel="${attr}">${list.map(([v, l]) => `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${l}</option>`).join('')}</select></label>`;
    },
    multi(key, label, summary, inner) {
      return `<details class="f-multi" data-k="${key}"${openMap[key] ? ' open' : ''}><summary><span>${esc(label)}</span><b>${summary}</b></summary><div class="f-multi-list">${inner}</div></details>`;
    },
    bind(root, attr, fn) {
      root.querySelectorAll(`button[${attr}]`).forEach((b) => b.addEventListener('click', () => fn(b.getAttribute(attr))));
      root.querySelectorAll(`select[data-fsel="${attr}"]`).forEach((s) => { s.dataset.bound = '1'; s.addEventListener('change', () => fn(s.value)); });
    },
  };
  document.addEventListener('change', (e) => {
    const s = e.target.closest && e.target.closest('select[data-fsel]');
    if (!s || s.dataset.bound) return;
    const b = document.createElement('button'); b.type = 'button'; b.hidden = true; b.setAttribute(s.dataset.fsel, s.value);
    s.parentNode.appendChild(b); b.click(); b.remove();
  });
})();
