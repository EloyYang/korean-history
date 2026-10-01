/*
 * 사용자 학습 기록 저장소
 *   - 항상 이 브라우저(localStorage)에 저장하고,
 *   - 구글로 로그인하면 Firebase(Firestore users/{uid}/data/{키})에도 저장해 기기 간에 맞춘다.
 *   - 화면 설정(탭·배치 등)은 동기화하지 않고, 아래 SYNC 에 맞는 학습 기록만 동기화한다.
 */
(function () {
  const SYNC = [/^khmap\.quizLog$/, /^khmap\.quizDraft\.\d+$/, /^khmap\.mastered$/, /^khmap\.memo\.\d+$/, /^khmap\.myLogImported$/, /^study\./];
  const META = 'userstore.meta'; // { 키: 마지막 수정 시각(ms) }
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

  function push(k) {
    const S = window.UserStore;
    if (!S.cloud || !isSynced(k)) return;
    clearTimeout(timers[k]);
    // 이어 풀기처럼 자주 바뀌는 값은 잠깐 모았다가 한 번에 올린다
    timers[k] = setTimeout(() => S.cloud.push(k, ls.get(k), meta()[k] || Date.now()), 2000);
  }

  window.UserStore = {
    user: null, // { uid, name, email, photo }
    cloud: null, // auth.js 가 로그인 후 채운다: { push(key, value|null, t), signIn(), signOut() }
    configured: false,
    isSynced,
    syncedKeys() {
      const out = [];
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (isSynced(k)) out.push(k); } } catch (e) { /* 무시 */ }
      return out;
    },
    meta,
    // localStorage 와 같은 모양
    getItem(k) { return ls.get(k); },
    setItem(k, v) { ls.set(k, v); if (isSynced(k)) { touch(k, Date.now()); push(k); } },
    removeItem(k) { ls.del(k); if (isSynced(k)) { touch(k, Date.now()); push(k); } },
    // JSON 편의
    get(k, d) { const v = ls.get(k); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { this.setItem(k, JSON.stringify(v)); },
    // 클라우드에서 받은 값 반영 (auth.js 전용)
    _applyRemote(k, v, t) { if (v == null) ls.del(k); else ls.set(k, v); touch(k, t); },
    _forgetLocal() { this.syncedKeys().forEach((k) => ls.del(k)); ls.del(META); },
    onChange(fn) { listeners.push(fn); },
    _emit(type) { listeners.forEach((fn) => { try { fn(type); } catch (e) { /* 무시 */ } }); },
  };
})();
