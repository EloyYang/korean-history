(function () {
  const S = window.UserStore;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function stats(ex) {
    const A = window.ATTEMPTS_FOR(ex.id);
    const list = A.all();
    const keys = (window.QUIZ_KEYS || {})[ex.id] || {};
    const rounds = Object.keys(keys).length;
    const last = list.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0];
    const wrong = list.reduce((a, l) => a + l.wrong.length, 0);
    const done = (S.get(A.key('mastered'), []) || []).length;
    return { rounds, solved: list.length, last, wrong, done };
  }

  function render() {
    const u = S.user;
    const cards = window.EXAMS.map((ex) => {
      const s = stats(ex);
      return `
        <article class="h-card" style="--c:${ex.color}">
          <div class="h-head"><span class="h-mark">${esc(ex.mark)}</span><div><h2>${esc(ex.name)}${ex.level ? ` <small>${esc(ex.level)}</small>` : ''}</h2><p>${esc(ex.desc)}</p></div></div>
          <ul class="h-stats">
            <li><b>${s.solved}</b> / ${s.rounds}<span>푼 회차</span></li>
            <li><b>${s.last && s.last.score != null ? s.last.score + '점' : '-'}</b><span>${s.last ? `최근 ${esc(s.last.round)}회` : '최근 점수'}</span></li>
            <li><b>${s.wrong}</b><span>틀린 문항</span></li>
            <li><b>${s.done}</b><span>외운 문항</span></li>
          </ul>
          <div class="h-links">
            <a class="h-btn main" href="quiz.html?exam=${ex.id}">기출 풀기</a>
            <a class="h-btn" href="review.html?exam=${ex.id}">오답 노트</a>
            ${(ex.pages || []).map((p) => `<a class="h-btn" href="${p.href}" title="${esc(p.note || '')}">${esc(p.label)}</a>`).join('')}
          </div>
        </article>`;
    }).join('');

    document.getElementById('home').innerHTML = `
      <section class="h-hello">
        ${u ? `<p><b>${esc(u.name || u.email)}</b>님, 공부 기록이 계정에 저장되고 있어요.</p>`
          : S.configured ? '<p>구글로 로그인하면 풀이 기록·오답·외운 문항이 계정에 저장돼 휴대폰과 컴퓨터에서 이어 볼 수 있어요. 로그인하지 않으면 이 브라우저에만 저장돼요.</p>'
            : '<p>지금은 기록이 이 브라우저에만 저장돼요. (구글 로그인 준비 중)</p>'}
      </section>
      <h2 class="r-h">시험 선택</h2>
      <div class="h-grid">
        ${cards}
        <article class="h-card h-add">
          <div class="h-head"><span class="h-mark">＋</span><div><h2>다른 시험 추가</h2><p>준비 중인 시험의 기출 PDF(교재나 공식 문제지)를 Claude에게 주면, 문제를 잘라 기출 풀기·오답 노트를 바로 만들어 드려요.</p></div></div>
        </article>
      </div>`;
  }

  S.onChange(render);
  render();
})();
