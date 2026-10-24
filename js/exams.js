/*
 * 시험 목록 — 새 시험은 여기에 한 줄 추가하고, 문제 이미지·정답(QUIZ_KEYS[id])을 넣으면 된다.
 *   id     : 주소(?exam=id)·저장 키에 쓰는 이름
 *   img    : 문항 이미지 경로 ({r} = 회차, {n} = 두 자리 번호)
 *   round  : 회차 이름 형식
 *   pages  : 시험별 전용 페이지 (지도 노트처럼 따로 만든 것)
 *   ready  : false 면 '준비 중' 카드로만 보인다
 *   links  : 기출 풀기·오답 노트 대신 쓰는 바로가기 (전용 화면만 있는 시험)
 *   stats  : 처음 화면 카드에 보일 숫자 [[값, 이름], …] (UserStore 를 받아 계산)
 */
window.EXAMS = [
  {
    id: 'history',
    name: '한국사능력검정시험',
    level: '심화',
    mark: '史',
    color: '#8b2e1f',
    desc: '시대별 영토 지도와 기출 포인트, 기출 70~79회 풀기와 오답 노트',
    img: 'quiz/{r}/{n}.webp',
    round: '제{r}회',
    pages: [{ href: 'history.html', label: '지도 노트', note: '시대별 영토·왕·기출 포인트' }, { href: 'typing.html', label: '타자 연습', note: '유물 사진 → 시대, 사건 → 왕을 쳐서 외우기' }],
    ready: true,
  },
  {
    id: 'gtelp',
    name: '지텔프',
    level: 'Level 2',
    mark: 'G',
    color: '#1f5f8b',
    desc: '문법 유형 공식과 연습 130문항, 독해·청취(원어민 음성) 각 30세트, 필수 단어·헷갈리는 단어, 90분 실전 모의고사 10회',
    links: [
      { href: 'gtelp.html#plan', label: '10일 플랜', main: true },
      { href: 'gtelp.html#mock', label: '모의고사' },
      { href: 'gtelp.html#grammar', label: '문법' },
      { href: 'gtelp.html#reading', label: '독해' },
      { href: 'gtelp.html#listening', label: '청취' },
      { href: 'gtelp.html#vocab', label: '필수 단어' },
      { href: 'gtelp.html#wrong', label: '오답' },
    ],
    stats(S) {
      const k = (n) => 'study.gtelp.' + n;
      const log = (S.get(k('quizLog'), []) || []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      const g = S.get(k('grammar'), {}) || {};
      const v = S.get(k('vocab'), {}) || {};
      return [[log.length, '본 모의고사'], [log[0] ? log[0].score + '점' : '-', '최근 점수'], [Object.keys(g).length, '푼 문법'], [(v.known || []).length, '외운 단어']];
    },
    ready: true,
  },
  // 소방공무원은 공개경쟁채용·경력경쟁채용을 따로 준비하는 별개 시험으로 둔다 (같은 fire.html, ?kind= 로 구분)
  ...[['open', '공개경쟁채용', '#b3261e', '2022~2026년 공개경쟁채용 필기 기출'], ['car', '경력경쟁채용', '#8e3a2f', '2022~2026년 경력경쟁채용 필기 기출']].map(([kind, name, color, desc]) => ({
    id: 'fire-' + kind,
    name: '소방공무원 ' + name,
    level: '필기',
    mark: '消',
    color,
    desc: desc + ': 문제 풀기·해설, 유형별 개념 정리, 오답·★ 헷갈림 다시 풀기',
    links: [
      { href: `fire.html?kind=${kind}`, label: '기출 풀기', main: true },
      { href: `fire.html?kind=${kind}#notes`, label: '개념' },
      { href: `fire.html?kind=${kind}#wrong`, label: '오답' },
      { href: `fire.html?kind=${kind}#stats`, label: '기록' },
    ],
    stats(S) {
      const mine = (k) => k.split('/')[0].endsWith('_' + kind);
      const q = S.get('study.fire.q', {}) || {}; const ks = Object.keys(q).filter(mine);
      const done = ks.filter((k) => q[k].t).length; const ok = ks.filter((k) => q[k].t && q[k].ok).length;
      return [[done, '푼 문항'], [done ? Math.round((ok / done) * 100) + '%' : '-', '최근 정답률'], [ks.filter((k) => q[k].ok === false && !q[k].m).length, '틀린 문항'], [Object.keys(S.get('study.fire.flags', {}) || {}).filter(mine).length, '★ 헷갈림']];
    },
    ready: true,
  })),
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
