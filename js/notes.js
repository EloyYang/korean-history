/*
 * 판서 노트 → 표 데이터
 *
 * 한 개의 note = 한 개의 표. 같은 주제(예: 선사 시대 생활)의 다음 판서가 오면
 * 새 표를 만드는 대신 cols 에 열을 하나 더 추가하면 된다. (예: 구석기 | 신석기 | 청동기)
 *
 *   era    : eras.js 의 시대 id
 *   head   : 표 머리글 행들  { label, cells: [열마다 하나] }
 *            셀을 { html: '…', span: 3 } 으로 쓰면 가로로 여러 칸을 합친다
 *            { html: '…', rowspan: 2 } 는 세로로 합치고, 다음 행에서는 그 칸을 빼고 적는다
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
    id: 'states-compare',
    era: 'states',
    title: '여러 나라의 성장 — 비교',
    images: ['notes/img/states-01-compare.webp'],
    head: [
      { label: '', cells: ['정치', '제천 행사', '결혼', '풍습', '경제'] },
    ],
    rows: [
      { label: '부여', cells: ['<u>사출도</u>(마 · 우 · 저 · 구가)', '<u>영고</u>', '형사취수제', '· 순장|· 1책 12법', '반농반목'] },
      { label: '고구려', cells: ['· 제가 회의|· 王 · 대가 ← 사자 · 조의 · 선인', '<u>동맹</u>', '· 형사취수제|· <u>서옥제</u>', '1책 12법', '약탈 경제'] },
      { label: '옥저', cells: [{ html: '군장: 읍군 · 삼로', rowspan: 2 }, '—', '민며느리제', '<u>가족 공동 묘</u>', '소금 · 해산물'] },
      { label: '동예', cells: ['<u>무천</u>', '족외혼', '· <u>책화</u>|· 집터: 여(呂)자형 · 철(凸)자형', '· 단궁|· 과하마|· 반어피'] },
      { label: '삼한', cells: ['<u>소도</u>(천군) · 군장: 신지 · 읍차|⇒ <b>제</b>사 ≠ <b>정</b>치 (제정 분리)', '<u>계절제</u>', '—', '—', '· 벼농사 → 두레, 저수지|· <em>철(변한)</em>'] },
    ],
  },
  {
    id: 'goguryeo-curve',
    era: ['c4', 'c5', 'c6', 'c7'],
    type: 'curve',
    title: '고구려의 성장과 멸망 (흥망 그래프)',
    images: ['notes/img/goguryeo-01-curve-a.webp', 'notes/img/goguryeo-02-curve-b.webp'],
    curve: {
      range: [-60, 700],
      // [연도, 국력(0~100)] — 판서 곡선 모양을 따라감
      points: [[-37, 8], [0, 16], [100, 28], [146, 36], [190, 56], [245, 46], [310, 64], [328, 70], [348, 44], [362, 16], [371, 10],
               [380, 22], [390, 50], [400, 82], [427, 88], [491, 88], [560, 82], [600, 70], [612, 62], [642, 40], [645, 34], [668, 0]],
      tickMarks: [0, 100, 200, 300, 400, 500, 600, 700],
      ticks: [{ at: 50, label: '1C' }, { at: 150, label: '2C' }, { at: 250, label: '3C' }, { at: 350, label: '4C' },
              { at: 450, label: '5C', circle: true }, { at: 550, label: '6C' }, { at: 630, label: '7C' }, { at: 672, label: '668' }],
      capitals: [['졸본', -37, 3], ['국내성', 3, 427], ['평양', 427, 668]],
    },
    annos: [
      { at: -37, box: [60, 392, 140, 64], title: '동명(성)왕', body: '주몽 ← 부여' },
      { at: 146, box: [200, 452, 140, 60], title: '태조왕', body: '<em>옥저 정복</em>' },
      { at: 190, box: [96, 186, 244, 112], title: '고국천왕', body: '· 왕위 부자 세습|· 부족 5부 → <em>행정 5부</em>|· <em>진대법</em>(을파소)' },
      { text: '동천왕', pos: [381, 398], anchor: 'middle' },
      { text: '위(관구검)', pos: [368, 292], anchor: 'middle', color: 'green', arrow: [[381, 298], [381, 352]] },
      { at: 310, box: [395, 196, 170, 82], title: '미천왕', body: '· {{낙랑군 축출|낙랑 · 대방 X}}|· {{서안평 점령}}' },
      { text: '전연', pos: [550, 320], arrow: [[546, 316], [492, 330]] },
      { text: '백제 근초고왕', pos: [425, 470], anchor: 'middle', color: 'orange', arrow: [[458, 476], [505, 498]] },
      { text: '고국원왕 X', pos: [514, 530], anchor: 'middle', color: 'small' },
      { at: 380, box: [578, 392, 184, 98], title: '소수림왕', body: '· <u>율령</u>(10여 관등)|· <u>불교</u> ← 전진|· <u>태학</u>' },
      { at: 400, box: [288, 2, 296, 178], title: '광개토 태왕', body: '· 연호: <u>영락</u> &nbsp;· {{광개토 대왕릉비|비}} ← 장수왕이 세움|· 후연 공격 → {{요동 확보|요동 장악}}|· <u>{{신라 구원(왜 격퇴)|신라 구원}}</u>(from 왜, 내물왕)|&nbsp;&nbsp;→ 금관가야↓|&nbsp;&nbsp;→ {{호우총(호우명 그릇)|호우명 그릇}}' },
      { at: 427, box: [600, 2, 336, 178], title: '장수왕', body: '· 균형 외교(남북조)|· 남하 정책(<u>{{국내성 → 평양 천도|평양 천도}}</u>)|&nbsp;&nbsp;→ <u>{{한성 함락|한성 X}}</u>(개로왕 X) ⇒ 웅진 천도|&nbsp;&nbsp;→ {{충주 고구려비}}|&nbsp;&nbsp;→ 나 · 제 동맹' },
      { text: '← 수: 살수 대첩(을지문덕)', pos: [764, 300], color: 'orange', at: 612, dot: true },
      { text: '⊓⊓⊓ 천리장성|642 김춘추 외교 = 연개소문 집권', pos: [790, 352], at: 642, dot: true },
      { text: '← 당: 안시성 싸움', pos: [792, 420], color: 'orange', at: 645, dot: true },
      { text: '← 나 · 당 연합군', pos: [836, 516], color: 'green' },
      { text: '668 멸망 → 부흥 운동 (검모잠, 안승)', pos: [826, 648], anchor: 'middle', color: 'green' },
    ],
    table: {
      title: '고대 국가 = 왕권↑ · 율령 · 불교',
      head: [{ label: '', cells: ['고대 국가 체제 정비', '전성기 (한강 차지)'] }],
      rows: [
        { label: '고구려', cells: ['2C', '5C'] },
        { label: '백제', cells: ['3C', '4C'] },
        { label: '신라', cells: ['4C', '6C'] },
        { label: '가야', cells: [{ html: '고대 국가 X', span: 2 }] },
      ],
    },
  },
  {
    id: 'baekje-curve',
    era: ['c4', 'c5', 'c6', 'c7'],
    type: 'curve',
    title: '백제의 성장과 멸망 (흥망 그래프)',
    caption: '〈백제〉 ← <b>온조</b>(고주몽 아들, 비류 — 미추홀)',
    images: ['notes/img/baekje-01.webp', 'notes/img/baekje-02.png', 'notes/img/baekje-03.webp', 'notes/img/baekje-04.webp'],
    curve: {
      range: [-60, 700], height: 780, base: 640, scale: 4.4,
      points: [[-18, 8], [100, 22], [250, 52], [300, 66], [360, 86], [384, 84], [430, 60], [455, 44], [475, 38], [492, 50], [505, 58], [523, 58],
               [560, 54], [600, 55], [630, 44], [660, 0]],
      tickMarks: [0, 100, 200, 300, 400, 500, 600, 700],
      ticks: [{ at: 50, label: '1C' }, { at: 150, label: '2C' }, { at: 250, label: '3C' }, { at: 350, label: '4C', circle: true },
              { at: 450, label: '5C' }, { at: 550, label: '6C' }, { at: 625, label: '7C' }, { at: 672, label: '660' }],
      capitals: [['한성', -18, 475], ['웅진', 475, 538], ['사비', 538, 660]],
    },
    annos: [
      { at: 360, box: [60, 8, 420, 128], title: '근초고왕', body: '· <b>마한 X</b> (남해안까지)|· 고구려 X ({{평양성 전투|고국원왕 X}})|· 바다 건너 <b>요서</b> 진출 · 규슈(<b>칠지도</b>)|<small class="memo">→ 4세기 지도에서 진출로 확인</small>' },
      { at: -18, box: [66, 420, 176, 80], title: '온조', body: '<i>한강</i> 유역|→ 백제 건국' },
      { text: '비류(미추홀)', pos: [150, 404], anchor: 'middle', color: 'orange' },
      { at: 250, box: [296, 500, 214, 86], title: '고이왕', body: '· 관등, 관복 ≒ 율령|· 마한 {{목지국}} X' },
      { at: 384, box: [424, 396, 138, 68], title: '침류왕', body: '<em>동진</em> → 불교 수용' },
      { text: '고구려(장수왕)', pos: [588, 40], anchor: 'middle', color: 'green' },
      { text: '평양 천도', pos: [528, 80], anchor: 'middle', color: 'green', arrow: [[532, 90], [578, 568]] },
      { text: '개로왕 X (북위)', pos: [642, 80], anchor: 'middle', color: 'green', arrow: [[636, 90], [640, 500]] },
      { text: '웅진(공주) 천도', pos: [640, 522], anchor: 'middle', color: 'green' },
      { text: '(공산성)', pos: [640, 544], anchor: 'middle', color: 'small' },
      { text: '나 = 제|눌지 · 비유 (공수)', pos: [574, 590], anchor: 'middle', color: 'green' },
      { text: '', pos: [0, 0], arrow: [[652, 552], [684, 574]] },
      { text: '나 = 제|소지 · 동성 (결혼)', pos: [700, 590], anchor: 'middle', color: 'green' },
      { at: 505, box: [700, 8, 290, 114], title: '무령왕', body: '· <b>22담로</b>(왕족)|· 중국 남조 · 일본과 교류|&nbsp;→ 무령왕릉(벽돌무덤)' },
      { at: 523, box: [700, 138, 212, 128], title: '성왕', body: '· 백제 부흥|· <u>{{사비(부여)|사비(부여)}} 천도</u>|· 남부여, 5부 5방|· {{관산성 전투}} X (진흥왕)' },
      { at: 600, box: [826, 280, 168, 86], title: '무왕', body: '<i>서동 + 선화 공주</i>|└ 익산 미륵사지' },
      { at: 650, box: [826, 386, 168, 90], title: '의자왕', body: '· {{대야성 함락|대야성 전투}}(642)|· 계백({{황산벌 전투}})' },
      { text: '← 나 · 당 연합군 (백제 X)', pos: [826, 604], color: 'green' },
      { text: '660 부흥 운동 ⇐ 日(백강 전투)|└ 흑치상지, 도침, 복신', pos: [800, 736], anchor: 'middle', color: 'green' },
    ],
  },
  {
    id: 'gaya',
    era: ['c4', 'c5', 'c6'],
    title: '가야',
    images: ['notes/img/gaya-01.png'],
    head: [
      { label: '', cells: [{ html: '<b>김수로</b>(구지가) · 덩이쇠 → <u>낙랑 · 왜 수출</u>(중계 무역)', span: 2 }] },
      { label: '', cells: ['전기 가야 연맹 (3C)', '후기 가야 연맹 (5C)'] },
    ],
    rows: [
      { label: '중심', cells: ['<b>금관가야</b>|({{김해 대성동 고분군|김해 대성동}})', '<b>대가야</b>|({{고령 지산동 고분군|고령 지산동}})'] },
      { label: '변화', cells: ['고구려 <i>광개토 태왕</i>의 {{신라 구원(왜 격퇴)|신라 구원}} → 금관가야 타격', '<small class="memo">금관가야 약화 이후 연맹 주도</small>'] },
      { label: '멸망', cells: ['6C <b>법흥왕</b> X ({{금관가야 병합|532}})', '6C <b>진흥왕</b> X ({{대가야 정복|562}})'] },
      { label: '기타', cells: [{ html: '<b>임나일본부 X</b> <small class="memo">(일본의 가야 지배설 → 근거 없음)</small>', span: 2 }] },
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
