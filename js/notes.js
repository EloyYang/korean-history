/*
 * 판서 노트 → 표 데이터
 *
 * 한 개의 note = 한 개의 표. 같은 주제(예: 선사 시대 생활)의 다음 판서가 오면
 * 새 표를 만드는 대신 cols 에 열을 하나 더 추가하면 된다. (예: 구석기 | 신석기 | 청동기)
 *
 *   era    : eras.js 의 시대 id
 *   head   : 표 머리글 행들  { label, cells: [열마다 하나] }
 *   rows   : 본문 행들       { label, cells: [열마다 하나] }
 *   images : 원본 판서 이미지 경로
 *
 * 셀 안에서 쓸 수 있는 표기
 *   {{지명}}          → 지도 마커와 연결되는 링크 (클릭하면 지도 이동)
 *   {{지명|표시}}     → 마커는 '지명', 화면에는 '표시'(HTML 가능)로 보임
 *   <u>…</u>          → 판서의 파란 밑줄 (핵심)
 *   <i>…</i>          → 판서의 물결 밑줄
 *   <b>…</b>          → 강조(노란 분필)
 *   <em>…</em>        → 판서의 연두색 글씨 (도구·용어)
 *   <small class="memo">…</small> → 선생님이 옆에 적은 메모
 *   |                 → 셀 안 줄바꿈
 */

window.NOTES = [
  {
    id: 'prehistoric-life',
    era: 'prehistoric',
    title: '선사 시대의 생활',
    images: ['notes/img/prehistoric-01-paleolithic.webp'],
    head: [
      { label: '사회', cells: ['무리 사회'] },
      { label: '도구', cells: ['구석기'] },
    ],
    rows: [
      { label: '식', cells: ['채집 · 수렵'] },
      { label: '의', cells: ['가죽옷 <small class="memo">↖ 수렵으로 가죽을 얻음</small>'] },
      {
        label: '주',
        cells: [
          '<u>이동</u> → <i>동굴, 막집</i>' +
          '|⇒ {{연천 전곡리}}, {{공주 석장리}}, {{단양 수양개|<u>단양</u> 수양개}}, {{단양 금굴|<u>단양</u> 금굴}}, {{청원 두루봉 동굴}}(<i>흥수아이</i>)' +
          '|<small class="memo">공주 = 웅진(백제) · 명학소(망이·망소이의 난) · 우금치(동학 농민 운동)</small>' +
          '|<small class="memo">연천 전곡리 ↓ 주먹도끼 발견</small>',
        ],
      },
      {
        label: '도구',
        cells: [
          '<em>뗀석기</em> (<u>주먹도끼</u> → 슴베찌르개)' +
          '|<small class="memo">└ 기후↑, 작고 날랜 짐승 多 → 슴베찌르개(창)</small>',
        ],
      },
      { label: '사회', cells: ['<b>평등</b>'] },
    ],
  },
];
