/*
 * 풀이 기록 합치기: mylog.js(Claude가 기록) + 기출 풀기 페이지에서 채점한 기록(이 브라우저)
 * 같은 회차는 가장 최근 풀이 하나만 쓴다.
 */
(function () {
  const KEY = 'khmap.quizLog';
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  window.ATTEMPTS = {
    local: readLocal,
    save(entry) { // {round, date, wrong, answers, score}
      const list = readLocal().filter((x) => x.round !== entry.round);
      list.push(entry);
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 무시 */ }
    },
    remove(round) {
      try { localStorage.setItem(KEY, JSON.stringify(readLocal().filter((x) => x.round !== round))); } catch (e) { /* 무시 */ }
    },
    all() {
      const by = new Map();
      (window.MY_LOG || []).forEach((l) => by.set(l.round, { ...l, src: 'file' }));
      readLocal().forEach((l) => {
        const prev = by.get(l.round);
        if (!prev || String(l.date) >= String(prev.date)) by.set(l.round, { ...l, src: 'local' });
      });
      return [...by.values()].sort((a, b) => b.round - a.round);
    },
  };
})();
