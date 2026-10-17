/*
 * 광고 (Google 애드센스) — 설정은 js/firebase-config.js 의 window.ADS, 방법은 ADS.md
 *   페이지 곳곳의 <div class="ad-slot" data-ad="자리"> 에 광고를 넣는다.
 *   ADS.enabled 가 false 이거나 게시자 ID가 없으면 아무것도 불러오지 않고 자리도 보이지 않는다.
 *   문제를 푸는 화면에는 광고 자리를 두지 않는다.
 */
(function () {
  const A = window.ADS || {};
  const on = !!(A.enabled && /^ca-pub-\d{10,}$/.test(A.client || ''));
  if (!on) return;
  let loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    const s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${A.client}`;
    document.head.appendChild(s);
  }
  function fill(el) {
    if (el.dataset.adDone) return;
    const slot = (A.slots || {})[el.dataset.ad] || A.slots && A.slots.default;
    el.dataset.adDone = '1';
    load();
    el.classList.add('on');
    el.innerHTML = `<small class="ad-label">광고</small><ins class="adsbygoogle" style="display:block" data-ad-client="${A.client}"${slot ? ` data-ad-slot="${slot}"` : ''} data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* 무시 */ }
  }
  const scan = () => document.querySelectorAll('.ad-slot:not([data-ad-done])').forEach(fill);
  // 화면이 다시 그려질 때마다 새로 생긴 광고 자리를 채운다
  new MutationObserver(() => scan()).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', scan);
})();
