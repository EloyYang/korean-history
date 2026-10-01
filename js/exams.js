/*
 * 시험 목록 — 새 시험은 여기에 한 줄 추가하고, 문제 이미지·정답(QUIZ_KEYS[id])을 넣으면 된다.
 *   id     : 주소(?exam=id)·저장 키에 쓰는 이름
 *   img    : 문항 이미지 경로 ({r} = 회차, {n} = 두 자리 번호)
 *   round  : 회차 이름 형식
 *   pages  : 시험별 전용 페이지 (지도 노트처럼 따로 만든 것)
 *   ready  : false 면 '준비 중' 카드로만 보인다
 */
window.EXAMS = [
  {
    id: 'history',
    name: '한국사능력검정시험',
    level: '심화',
    mark: '史',
    color: '#8b2e1f',
    desc: '시대별 영토 지도와 판서 노트, 기출 70~79회 풀기와 오답 노트',
    img: 'quiz/{r}/{n}.webp',
    round: '제{r}회',
    pages: [{ href: 'history.html', label: '지도 노트', note: '시대별 영토·왕·판서·기출 포인트' }],
    ready: true,
  },
];

window.examById = function (id) {
  return window.EXAMS.find((e) => e.id === id) || window.EXAMS[0];
};
// 주소의 ?exam= 값 (없으면 한국사)
window.currentExam = function () {
  const id = new URLSearchParams(location.search).get('exam');
  return window.examById(id || 'history');
};

// 기출 풀기·오답 노트 상단: 시험 이름·표시·메뉴를 현재 시험에 맞춘다
window.setupExamHeader = function (page) {
  const ex = window.currentExam();
  const mark = document.querySelector('.brand-mark');
  if (mark) { mark.textContent = ex.mark; mark.style.background = ex.color; }
  const sub = document.querySelector('.brand-sub');
  if (sub) sub.textContent = ex.name + (ex.level ? ` (${ex.level})` : '') + (page === 'quiz' ? ' · 번호를 골라 답하고 채점하면 오답 노트에 저장돼요' : ' · 틀린 문제와 암기가 부족한 부분');
  const nav = document.querySelector('.top-links');
  if (nav) {
    const auth = document.getElementById('auth-box');
    const links = [page === 'quiz' ? { href: `review.html?exam=${ex.id}`, label: '오답 노트' } : { href: `quiz.html?exam=${ex.id}`, label: '기출 풀기' }]
      .concat(ex.pages || [])
      .concat([{ href: 'index.html', label: '시험 선택' }]);
    nav.innerHTML = links.map((l) => `<a class="top-link" href="${l.href}">${l.label}</a>`).join('');
    if (auth) nav.appendChild(auth);
  }
};
