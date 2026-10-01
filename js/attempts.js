/*
 * 시험별 풀이 기록 (UserStore → 로그인하면 계정에 동기화)
 *   한국사는 예전 키(khmap.*)를 그대로 쓰고, 새 시험은 study.<시험id>.* 를 쓴다.
 *   같은 회차는 가장 최근 채점 하나만 남는다.
 *   mylog.js(Claude가 채팅으로 받아 적은 기록)는 자동으로 섞지 않고 '내 기록으로 가져오기'로만 들어온다.
 */
(function () {
  const S = window.UserStore;
  const keyOf = (exam, name) => (exam === 'history' ? 'khmap.' + name : `study.${exam}.${name}`);

  function make(exam) {
    const LOG = keyOf(exam, 'quizLog');
    const read = () => S.get(LOG, []) || [];
    const write = (list) => S.set(LOG, list);
    const imported = () => S.get(keyOf(exam, 'myLogImported'), []) || [];
    return {
      exam,
      key: (name) => keyOf(exam, name),
      local: read,
      save(entry) { write(read().filter((x) => x.round !== entry.round).concat([{ ...entry, src: entry.src || 'quiz' }])); },
      remove(round) { write(read().filter((x) => x.round !== round)); },
      all() { return read().slice().sort((a, b) => b.round - a.round); },
      // Claude 기록 가져오기 (한국사)
      pendingImport() {
        if (exam !== 'history') return [];
        const done = imported(); const mine = read();
        return (window.MY_LOG || []).filter((l) => !done.includes(l.round) && !mine.some((a) => a.round === l.round));
      },
      importMyLog() {
        const p = this.pendingImport(); if (!p.length) return;
        write(read().concat(p.map((l) => ({ ...l, src: 'claude' }))));
        S.set(keyOf(exam, 'myLogImported'), imported().concat(p.map((l) => l.round)));
      },
      dismissImport() { S.set(keyOf(exam, 'myLogImported'), imported().concat(this.pendingImport().map((l) => l.round))); },
    };
  }
  window.ATTEMPTS_FOR = make;
  window.ATTEMPTS = make(window.currentExam ? window.currentExam().id : 'history');
})();
