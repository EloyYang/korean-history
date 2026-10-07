/*
 * 사용자 학습 기록 저장소
 *   - 항상 이 브라우저(localStorage)에 저장하고,
 *   - 구글로 로그인하면 Firebase(Firestore users/{uid}/data/{키})에도 저장해 기기 간에 맞춘다.
 *   - 화면 설정(탭·배치 등)은 동기화하지 않고, 아래 SYNC 에 맞는 학습 기록만 동기화한다.
 */
(function () {
  const SYNC = [/^khmap\.quizLog$/, /^khmap\.quizDraft\.\d+$/, /^khmap\.mastered$/, /^khmap\.memo\.\d+$/, /^khmap\.memoOld\.\d+$/, /^khmap\.myLogImported$/, /^khmap\.myWeak$/, /^khmap\.weakMemo$/, /^khmap\.flag\.\d+$/, /^khmap\.retry$/, /^study\./];
  const META = 'userstore.meta'; // { 키: 마지막 수정 시각(ms) }
  const BASE = 'userstore.base'; // { 키: 마지막으로 서버와 맞춘 시각 } — 양쪽이 모두 바뀌었는지 판단용
  const listeners = [];
  const timers = {};

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 무시 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* 무시 */ } },
  };
  const meta = () => { try { return JSON.parse(ls.get(META)) || {}; } catch (e) { return {}; } };
  const touch = (k, t) => { const m = meta(); m[k] = t; ls.set(META, JSON.stringify(m)); };
  const isSynced = (k) => SYNC.some((re) => re.test(k));
  const base = () => { try { return JSON.parse(ls.get(BASE)) || {}; } catch (e) { return {}; } };
  const setBase = (k, t) => { const b = base(); b[k] = t; ls.set(BASE, JSON.stringify(b)); };

  // 두 기기에서 따로 바뀐 기록 합치기 (newer = 더 최근에 바뀐 쪽 값)
  function merge(k, newer, older) {
    let a, b; try { a = JSON.parse(newer); b = JSON.parse(older); } catch (e) { return newer; }
    if (a == null) return older; if (b == null) return newer;
    const name = k.replace(/^(khmap|study\.[^.]+)\./, '');
    if (name === 'quizLog' && Array.isArray(a) && Array.isArray(b)) {
      const out = [...a]; b.forEach((x) => { if (!out.some((y) => y.round === x.round)) out.push(x); });
      return JSON.stringify(out);
    }
    if (/^memoOld\./.test(name) && Array.isArray(a) && Array.isArray(b)) {
      const out = [...a]; b.forEach((x) => { if (!out.some((y) => y.t === x.t)) out.push(x); });
      return JSON.stringify(out.sort((x, y) => x.t - y.t));
    }
    if (name === 'myWeak' && Array.isArray(a) && Array.isArray(b)) {
      const out = [...a]; b.forEach((x) => { if (!out.some((y) => y.id === x.id)) out.push(x); });
      return JSON.stringify(out);
    }
    if (Array.isArray(a) && Array.isArray(b)) return JSON.stringify([...new Set([...b, ...a])].sort((x, y) => (x > y ? 1 : x < y ? -1 : 0)));
    if (/^quizDraft/.test(name)) return newer;
    if (typeof a === 'object' && typeof b === 'object') return JSON.stringify({ ...b, ...a });
    return newer;
  }

  function push(k) {
    const S = window.UserStore;
    if (!S.cloud || !isSynced(k)) return;
    clearTimeout(timers[k]);
    // 이어 풀기처럼 자주 바뀌는 값은 잠깐 모았다가 한 번에 올린다
    timers[k] = setTimeout(() => { const t = meta()[k] || Date.now(); S.cloud.push(k, ls.get(k), t); }, 2000);
  }

  // 페이지를 떠날 때 기다리던 업로드를 바로 보낸다
  window.addEventListener('pagehide', () => {
    const S = window.UserStore; if (!S.cloud) return;
    Object.keys(timers).forEach((k) => { if (timers[k]) { clearTimeout(timers[k]); timers[k] = null; S.cloud.push(k, ls.get(k), meta()[k] || Date.now()); } });
  });

  window.UserStore = {
    syncError: null, // 마지막 동기화 오류 (화면 표시용)
    user: null, // { uid, name, email, photo }
    cloud: null, // auth.js 가 로그인 후 채운다: { push(key, value|null, t), signIn(), signOut() }
    configured: false,
    isSynced,
    syncedKeys() {
      const out = [];
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (isSynced(k)) out.push(k); } } catch (e) { /* 무시 */ }
      return out;
    },
    meta, base, setBase, merge,
    // localStorage 와 같은 모양
    getItem(k) { return ls.get(k); },
    setItem(k, v) { ls.set(k, v); if (isSynced(k)) { touch(k, Date.now()); push(k); } },
    removeItem(k) { ls.del(k); if (isSynced(k)) { touch(k, Date.now()); push(k); } },
    // JSON 편의
    get(k, d) { const v = ls.get(k); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { this.setItem(k, JSON.stringify(v)); },
    // 클라우드에서 받은 값 반영 (auth.js 전용)
    _applyRemote(k, v, t) { if (v == null) ls.del(k); else ls.set(k, v); touch(k, t); },
    _forgetLocal() { this.syncedKeys().forEach((k) => ls.del(k)); ls.del(META); ls.del(BASE); },
    onChange(fn) { listeners.push(fn); },
    _emit(type) { listeners.forEach((fn) => { try { fn(type); } catch (e) { /* 무시 */ } }); },
  };
})();
