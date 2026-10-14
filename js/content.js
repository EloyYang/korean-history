/*
 * 유료 콘텐츠 불러오기
 *   <script src="js/content.js" data-load="js/qmeta.js js/solve/79.js … js/review.js"></script>
 *   적힌 순서대로 스크립트를 불러온다. PAYWALL.contentFromStorage 가 true 면
 *   보호 대상(풀이·선지·문항 자료)은 Firebase Storage 의 content/… 에서 받아 온다 (구독자만 읽을 수 있음, storage.rules).
 *   문제 이미지(quiz/…)도 같은 방식으로 바꿔 끼운다.
 */
(function () {
  const P = window.PAYWALL || {};
  const remote = !!(P.enabled && P.contentFromStorage);
  const PROTECTED = /^js\/(exam|wrongq|qmeta|solve|opt-same|gichul-ex|ex-where)\.js$|^js\/(solve|optx|optm)\//;
  const IMG = /^quiz\/\d+\/\d+\.webp$/;
  const loaded = new Set();

  let stP = null;
  function storage() {
    if (stP) return stP;
    stP = new Promise((ok) => { if (window.FB) ok(); else document.addEventListener('fb-ready', ok, { once: true }); })
      .then(() => (window.Access ? window.Access.ready : null))
      .then((A) => { if (A && A.state !== 'ok') throw new Error('no-access'); })
      .then(() => import(`https://www.gstatic.com/firebasejs/${window.FB.V}/firebase-storage.js`))
      .then((S) => ({ S, st: S.getStorage(window.FB.app) }));
    return stP;
  }
  const blob = (path) => storage().then(({ S, st }) => S.getBlob(S.ref(st, 'content/' + path)));
  const isProtected = (src) => remote && PROTECTED.test(src);

  function inject(src, text) {
    return new Promise((ok) => {
      const s = document.createElement('script');
      if (text != null) { s.textContent = text + `\n//# sourceURL=${src}`; document.head.appendChild(s); ok(); return; }
      s.src = src; s.async = false; s.onload = ok; s.onerror = () => { console.warn('불러오지 못함', src); ok(); };
      document.head.appendChild(s);
    });
  }
  // 받아 오기는 한꺼번에, 실행은 적힌 순서대로
  async function load(list) {
    const todo = list.filter((s) => s && !loaded.has(s) && !document.querySelector(`script[src="${s}"]`));
    todo.forEach((s) => loaded.add(s));
    const texts = todo.map((src) => (isProtected(src) ? blob(src).then((b) => b.text()).catch((e) => { console.warn('콘텐츠 받기 실패', src, e && e.message); return ''; }) : null));
    for (let i = 0; i < todo.length; i++) await inject(todo[i], texts[i] ? await texts[i] : null);
  }

  // 보호된 이미지는 Storage 에서 받아 blob 주소로 바꿔 끼운다
  const cache = new Map();
  function fix(img) {
    const raw = img.getAttribute('src'); if (!raw || !IMG.test(raw)) return;
    img.dataset.csrc = raw; img.removeAttribute('src');
    if (!cache.has(raw)) cache.set(raw, blob(raw).then((b) => URL.createObjectURL(b)).catch(() => ''));
    cache.get(raw).then((u) => { if (u && img.dataset.csrc === raw) img.src = u; });
  }
  if (remote) {
    const scan = (root) => { if (root.tagName === 'IMG') fix(root); else if (root.querySelectorAll) root.querySelectorAll('img[src]').forEach(fix); };
    new MutationObserver((ms) => ms.forEach((m) => { if (m.type === 'attributes') fix(m.target); else m.addedNodes.forEach(scan); }))
      .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    document.addEventListener('DOMContentLoaded', () => scan(document.body));
  }

  window.Content = { load, remote };
  const me = document.currentScript;
  if (me && me.dataset.load) load(me.dataset.load.split(/\s+/)).then(() => document.dispatchEvent(new Event('content-ready')));
})();
