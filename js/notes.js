/*
 * 판서 노트 → 표 데이터
 *
 * 한 개의 note = 한 개의 표. 같은 주제(예: 선사 시대 생활)의 다음 판서가 오면
 * 새 표를 만드는 대신 cols 에 열을 하나 더 추가하면 된다. (예: 구석기 | 신석기 | 청동기)
 *
 *   era    : eras.js 의 시대 id
 *   head   : 표 머리글 행들  { label, cells: [열마다 하나] }
 *            셀을 { html: '…', span: 3 } 으로 쓰면 가로로 여러 칸을 합친다
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
    images: ['notes/img/prehistoric-01-paleolithic.webp', 'notes/img/prehistoric-02-neolithic.png', 'notes/img/prehistoric-03-bronze.webp', 'notes/img/prehistoric-04-iron.png'],
    head: [
      { label: '사회', cells: ['무리 사회', '씨족(부족) 사회|<small class="memo">↑ 농경 ⇒ 혁명 (신석기 혁명)</small>', '군장 국가|<small class="memo">↑ <u>계급</u> 발생</small>', '연맹 왕국'] },
      { label: '도구', cells: ['구석기', '신석기', '청동기', '철기|<small class="memo">▨ 청동기와 겹치는 시기</small>'] },
    ],
    rows: [
      { label: '식', cells: ['채집 · 수렵', '+ <u>농사</u>(밭) <small class="memo">채집·수렵에 농경이 더해짐</small>', '<em>벼농사</em> → 생산력↑ → 잉여 생산물 O → 전쟁↑|<small class="memo">→ 사유 재산·계급 발생</small>', '—'] },
      { label: '의', cells: ['가죽옷 <small class="memo">↖ 수렵으로 가죽을 얻음</small>', '<u>가락바퀴</u>, 뼈바늘', '—', '—'] },
      {
        label: '주',
        cells: [
          '<u>이동</u> → <i>동굴, 막집</i>' +
          '|⇒ {{연천 전곡리}}, {{공주 석장리}}, {{단양 수양개|<u>단양</u> 수양개}}, {{단양 금굴|<u>단양</u> 금굴}}, {{청원 두루봉 동굴}}(<i>흥수아이</i>)' +
          '|<small class="memo">공주 = 웅진(백제) · 명학소(망이·망소이의 난) · 우금치(동학 농민 운동)</small>' +
          '|<small class="memo">연천 전곡리 ↓ 주먹도끼 발견</small>',
          '<u>정착</u> → 움집' +
          '|<small class="memo">움집: 바닥을 파고 지은 반지하 집, 둥근 바닥 가운데 화덕 · 강가·바닷가 → 패총(조개더미)</small>' +
          '|⇒ {{서울 암사동}}, {{부산 동삼동}}(패총)',
          '움집 → <em>지상 가옥화</em>' +
          '|<small class="memo">평지 → 구릉으로 이동, 직사각형 집, 화덕이 가운데 → 한쪽 벽으로</small>' +
          '|구릉 (배산임수 → <b>풍수지리 X</b>)' +
          '|⇒ {{여주 흔암리}}, {{부여 송국리}}',
          '—',
        ],
      },
      {
        label: '도구',
        cells: [
          '<em>뗀석기</em> (<u>주먹도끼</u> → 슴베찌르개)' +
          '|<small class="memo">└ 기후↑, 작고 날랜 짐승 多 → 슴베찌르개(창)</small>',
          '<em>간석기</em>(갈돌 · 갈판)' +
          '|이른 민무늬 토기, <u>빗살무늬 토기</u>',
          '<u>반달 돌칼</u>' +
          '|민무늬 토기(<u>미송리식 토기</u>)',
          '철제 농기구',
        ],
      },
      { label: '사회', cells: ['<b>평등</b>', '○ <em>애니미즘</em>(태양), 토테미즘, 샤머니즘|<small class="memo">평등 사회 유지 · 원시 신앙 등장</small>', '<b>고인돌</b>, 돌널무덤|<b>비파형 동검</b>, 거친무늬 거울|<small class="memo">↳ 고조선 (고인돌·비파형 동검 = 고조선 세력 범위의 증거)</small>|⇒ {{강화 고인돌|강화}} · {{고창 고인돌|고창}} · {{화순 고인돌|화순}} 고인돌', '덧널무덤, 독무덤|<u>세형 동검</u>, 잔무늬 거울, 거푸집|<small class="memo">└ 한반도 내 독자적 청동기 문화</small>|<u>명도전 · 오수전, 붓</u>|<small class="memo">└ 중국과의 교류</small>'] },
    ],
  },
  {
    id: 'gojoseon-timeline',
    era: 'gojoseon',
    title: '고조선 (최초의 국가)',
    images: ['notes/img/gojoseon-01-gojoseon-a.png', 'notes/img/gojoseon-02-gojoseon-b.png'],
    head: [
      { label: '사회', cells: ['군장 국가', { html: '연맹 왕국 → <small class="memo">(B.C. 5C 이후)</small>', span: 3 }] },
      { label: '도구', cells: ['<i>청동기</i> ↓ 고조선 = 최초의 국가', { html: '철기', span: 3 }] },
      { label: '시기', cells: ['B.C. 2333 · <b>단군 조선</b>', 'B.C. 4C ~ 3C', 'B.C. 2C · <b>위만 조선</b>', 'B.C. 108 · 멸망'] },
    ],
    rows: [
      {
        label: '건국',
        cells: [
          '① 단군 이야기' +
          '|환인 — 환웅(+3,000) + 곰, 호' +
          '|<small class="memo">선민 사상 · 계급, 농경, 토템</small>' +
          '|⇒ <i>단군왕검</i>: <b>제</b>사 = <b>정</b>치 (제정일치)',
          '—', '—', '—',
        ],
      },
      {
        label: '정치',
        cells: [
          '—',
          '王 — <b>부왕</b> → <b>준왕</b> (왕위 <u>세습</u>)|관직: 상, 대부, 장군',
          '준왕 X → 위만 집권|· <u>본격적인 철기 수용</u>',
          '{{왕검성}} X (우거왕)',
        ],
      },
      {
        label: '대외',
        cells: [
          '—',
          '<b>연</b>과 대립(4C) → 연의 공격({{연 진개의 침입|진개}}, 3C)',
          '· <u>중계 무역</u> <small class="memo">(한 ↔ 남쪽 진국)</small>',
          '{{한 무제의 침입|한(무제)}}의 공격 → <b>한 군현</b> 설치',
        ],
      },
      {
        label: '유물·법',
        cells: [
          '② <u>비파형 동검, 고인돌</u> <small class="memo">↗ 세계 유산</small>' +
          '|<small class="memo">분포 → 요서·요동 ~ 한반도 서북부 = 고조선 세력 범위</small>' +
          '|③ <b>8조법</b> (人 X → 死)',
          '—', '—', '—',
        ],
      },
    ],
  },
];

/*
 * 유물 사진
 * 여기에 등록된 이름은 판서 노트 · 왕·대통령 · 지도 해설 본문에서 자동으로 클릭 가능한 글씨가 되고,
 * 누르면 사진이 크게 열린다. (사진 파일은 notes/img/artifacts/ 에 저장)
 * 이름이 지도 마커 이름과 같으면 지도 팝업에도 사진이 함께 나온다.
 */
window.ARTIFACTS = {
  '뗀석기': { src: 'notes/img/artifacts/tteonseokgi.jpg', caption: '뗀석기 — 돌을 깨뜨리거나 떼어 내어 만든 구석기 시대의 도구' },
  '주먹도끼': { src: 'notes/img/artifacts/jumeokdokki.jpg', caption: '주먹도끼 — 하나의 도구로 찍고, 자르고, 긁는 등 여러 용도로 사용 (연천 전곡리 → 모비우스 학설 반박)' },
  '슴베찌르개': { src: 'notes/img/artifacts/seumbe-jjireugae.jpg', caption: '슴베찌르개 — 슴베(자루에 꽂는 부분)를 만들어 창처럼 사용한 구석기 후기의 도구' },
  '가락바퀴': { src: 'notes/img/artifacts/garakbakwi.jpg', caption: '가락바퀴 — 가운데 구멍에 막대를 끼우고 돌려 실을 뽑는 도구 (신석기, 뼈바늘과 함께 옷·그물 제작)' },
  '뼈바늘': { src: 'notes/img/artifacts/ppyeobaneul.jpg', caption: '뼈바늘 — 짐승 뼈를 갈아 만든 바늘, 가락바퀴로 뽑은 실로 옷·그물을 지음 (신석기)' },
  '움집': { src: 'notes/img/artifacts/umjip.jpg', caption: '움집 — 땅을 파고 기둥을 세워 지붕을 덮은 신석기 시대 집 (복원)' },
  '막집': { src: 'notes/img/artifacts/makjip.jpg', caption: '막집 — 구석기 시대 사람들이 나뭇가지·풀 등으로 지은 임시 거처 (복원)' },
  '흥수아이': { src: 'notes/img/artifacts/heungsu-ai.jpg', caption: '흥수아이 복원상 — 청원 두루봉 동굴에서 발견된 어린아이 뼈를 바탕으로 복원' },
  '단양 금굴': { src: 'notes/img/artifacts/danyang-geumgul.jpg', caption: '단양 금굴 유적 — 가장 오래된 구석기 유적 중 하나 (동굴 유적)' },
};
