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
 *            행의 label 을 null 로 두면 왼쪽 제목 칸 없이 그린다
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
    id: 'silla-curve',
    era: ['c4', 'c5', 'c6', 'c7'],
    type: 'curve',
    title: '신라의 성장과 삼국 통일 (그래프)',
    caption: '〈신라〉',
    images: ['notes/img/silla-01.webp', 'notes/img/silla-02.webp', 'notes/img/silla-03.png'],
    curve: {
      range: [-80, 720], right: 760, height: 700, base: 640, scale: 4.4,
      points: [[-57, 6], [100, 18], [250, 36], [356, 50], [400, 50], [420, 46], [450, 49], [475, 46], [500, 55], [514, 64],
               [540, 72], [600, 80], [654, 85], [676, 88], [700, 92]],
      tickMarks: [0, 100, 200, 300, 400, 500, 600, 700],
      ticks: [{ at: 50, label: '1C' }, { at: 150, label: '2C' }, { at: 250, label: '3C' }, { at: 350, label: '4C' },
              { at: 450, label: '5C' }, { at: 550, label: '6C', circle: true }, { at: 650, label: '7C' }],
      capitals: [],
    },
    annos: [
      { at: -57, box: [60, 440, 180, 74], title: '박혁거세', body: '<i>사로국</i> 건국' },
      { at: 400, box: [60, 268, 330, 122], title: '내물 마립간', body: '· <u>고구려 구원</u>(from 왜)|&nbsp;&nbsp;└ 광개토 태왕|· 왕위 <b>김씨</b> 세습' },
      { text: '박 → 석 → 김|혁거세 · 탈해 · 알지|거서간 → 차차웅 → 이사금', pos: [322, 574], anchor: 'middle' },
      { text: '왜', pos: [498, 360], anchor: 'middle', color: 'green', arrow: [[498, 368], [498, 432]] },
      { text: '고구려|(장수왕)', pos: [546, 292], anchor: 'middle', color: 'green', arrow: [[546, 322], [546, 430]] },
      { text: '나 · 제 동맹|눌지, 소지', pos: [528, 478], anchor: 'middle' },
      { at: 500, box: [590, 440, 182, 132], title: '지증왕', body: '· <u>왕, 신라</u>|· {{우산국 복속|우산국}}(이사부)|· 우경, 동시(전)|· 순장 X' },
      { at: 514, box: [784, 440, 212, 152], title: '법흥왕', body: '· 건원, <em>율령</em>(17관등), <em>병부</em>|· 골품제 O ⇝ 상대등 O|· <u>불교 공인</u>(이차돈)|· {{금관가야 병합|금관가야 X}}' },
      { at: 540, box: [410, 8, 580, 128], title: '진흥왕', body: '· {{관산성 전투}}(성왕 X), <b>한강 O</b> ⇒ {{당항성}}|· {{단양 적성비}}, <u>순수비</u>({{북한산 순수비|북한산}} ⇒ 김정희)|· <i>화랑도 개편</i>, 국사 편찬(거칠부)|· {{대가야 정복|대가야 X}}' },
      { at: 654, box: [770, 178, 226, 196], title: '김춘추(무열왕)', body: '<b>나 · 당 연합</b> ⇒ 백제 X, 고구려 X|↓|나 · 당 전쟁: {{매소성 전투|매소성}}, {{기벌포 전투|기벌포}}|↓|<b>삼국 통일</b>' },
      { text: '문무왕(용 → 호국)', pos: [700, 414], anchor: 'middle', color: 'green', at: 676, dot: true, arrow: [[716, 398], [722, 264]] },
      { text: '', pos: [0, 0], color: 'blue', arrow: [[724, 240], [764, 228]] },
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
    id: 'silla-early',
    era: 'nambuk',
    title: '통일 신라 전기 (왕권↑)',
    images: ['notes/img/nambuk-01-silla-early.webp'],
    head: [
      { label: null, cells: [{ html: '통일 신라, 발해 → <b>남북국</b> 시대 <small class="memo">└ 〈발해고〉 by 유득공</small>', span: 3 }] },
      { label: null, cells: ['왕', '분야', '내용'] },
    ],
    rows: [
      { label: null, cells: ['<i>태종 무열왕</i>|<small class="memo">김춘추</small>', { html: '· 최초 <b>진골</b> 출신 왕 <small class="memo">(성골 X)</small>|· <i>나 · 당 연합</i>, 백제 X (with 김유신)', span: 2 }] },
      { label: null, cells: ['<b>문무왕</b>', { html: '· 고구려 X, 나 · 당 전쟁 O ({{매소성 전투|매}} · {{기벌포 전투|기}}), 삼국 <b>통일</b>|· <i>상수리</i>(인질) <small class="memo">→ 고려 기인</small>, 외사정|· 동해 용 → 문무 대왕암', span: 2 }] },
      { label: null, cells: [{ html: '<em>신문왕</em>', rowspan: 4 }, '정치', '· 김흠돌 난, 상대등(<u>화백 회의</u>)↓|&nbsp;&nbsp;└ 정사암(백), 제가 회의(고)|· <b>집사부 시중↑</b>, 6두품 O (설총 – 화왕계)'] },
      { label: null, cells: ['경제', '<u>관료전 O</u> (노동력 X), <u>녹읍 X</u>'] },
      { label: null, cells: ['사회', '· 9주 <b>5소경</b> ⇒ 수도 편재성 극복|&nbsp;&nbsp;├ {{중원경(충주)}}: 고구려비|&nbsp;&nbsp;└ {{서원경(청주)}}: <em>민정 문서</em>, 〈직지심체요절〉|· <em>9서당</em>(중앙, <em>민족 융합</em>) 10정(지방)'] },
      { label: null, cells: ['문화', '<u>국학</u>, 감은사 – (만파식적) <small class="memo">→ 문무 대왕암</small>'] },
      { label: null, cells: [{ html: '<small class="memo">진덕 여왕 ‖ 무열왕 ~ 혜공왕 : 전기(왕권↑) → 선덕왕 ~ 경순왕 : 후기(왕권↓)</small>', span: 3 }] },
    ],
  },
  {
    id: 'silla-late',
    era: ['nambuk', 'husamguk'],
    title: '통일 신라 후기 (왕권↓) → 후삼국',
    images: ['notes/img/nambuk-02-silla-late.webp'],
    head: [
      { label: '', cells: ['후기 (왕↓) · 선덕왕 ~ 경순왕'] },
    ],
    rows: [
      { label: '정치', cells: ['{{김헌창의 난|김헌창 난}} ⇒ 진골 귀족 간 왕위 다툼'] },
      { label: '경제', cells: ['~ 녹읍 O'] },
      {
        label: '사회',
        cells: [
          '<u>호족</u>(장군 · 성주)' +
          '|┬ 1세대 – <u>장보고</u>(법화원, {{청해진}} – 완도)' +
          '|└ 2세대 – <b>견훤</b>: 후백제({{완산주(전주)|완산주}}) → 후당 · 오월에 사신 파견' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>궁예</b>: 후고구려({{송악(개성)|송악}}) → 마진, 태봉({{철원}}), 광평성 설치' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>왕건</em>: 고려(송악) ⇒ <u>후삼국 통일</u>' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;· {{공산 전투}}(<b>견훤</b> vs 왕건): 신숭겸 X' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;· {{고창 전투}}(견훤 vs <b>왕건</b>): 안동 차전놀이' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓' +
          '|&nbsp;&nbsp;&nbsp;&nbsp;· {{일리천 전투}}(신검 vs <b>왕건 + 견훤</b>) <small class="memo">└ 견훤: {{금산사}} 유폐 후 귀순 · 마의 태자 ↗</small>' +
          '|<b>民↓</b>: <em>{{원종·애노의 난}}</em> (진성 여왕)',
        ],
      },
      { label: '문화', cells: ['<u>선종↑</u> (9산 선문) · <u>풍수지리설</u> <small class="memo">← 호족의 사상적 기반</small>'] },
    ],
  },
  {
    id: 'balhae-curve',
    era: 'nambuk',
    type: 'curve',
    title: '발해 (흥망 그래프)',
    caption: '〈발해〉',
    images: ['notes/img/nambuk-03-balhae.webp'],
    curve: {
      range: [690, 940], right: 900, height: 590, base: 540, scale: 4.4,
      points: [[698, 0], [720, 28], [745, 55], [770, 75], [800, 88], [818, 92], [835, 90], [860, 76], [885, 52], [905, 28], [926, 0]],
      tickMarks: [698, 926],
      ticks: [{ at: 698, label: '698' }, { at: 926, label: '926' }],
      capitals: [],
    },
    annos: [
      { at: 698, box: [70, 244, 110, 96], title: '대조영', body: '{{동모산}}|건국' },
      { at: 720, box: [220, 412, 480, 86], title: '무왕(인안)', body: '<i>반당</i> ┬ 대문예 → 흑수 말갈 공격|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>장문휴</em> → 산둥반도({{등주 공격|등주}}) 공격' },
      { at: 760, box: [330, 282, 330, 86], title: '문왕(대흥)', body: '· 친당: <u>3성 6부</u>, 신라도|· 중경 → {{상경 용천부|상경}} 천도' },
      { at: 818, box: [250, 12, 330, 92], title: '선왕(건흥)', body: '· 5경 15부 62주 ⇒ 요동|· <u>해동성국</u>' },
      { text: '거란', pos: [884, 478], anchor: 'middle', color: 'green', arrow: [[878, 486], [858, 530]] },
    ],
    table: {
      title: '고구려 계승 ↓ 발해 ↑ 당 영향',
      head: [{ label: '', cells: ['내용'] }],
      rows: [
        { label: '고구려 계승', cells: ['· 왕: "나 고려왕은~" → 日 (일본에 보낸 국서)|· 지배층: 고구려인|· <em>온돌, 이불병좌상, 돌사자상, 석등</em>'] },
        { label: '당 영향', cells: ['· <b>3성 · 6부 · 중정대 · 주자감</b> ← 당 제도 수용|· 중정대: 감찰 기구 · 주자감: 교육 기관|· {{상경 용천부}} <u>주작대로</u>'] },
        { label: '독자성', cells: ['· 3성: <b>정당성</b>(대내상) 중심, 중대성, 선조성|· 6부: <em>충 · 인 · 의 · 지 · 예 · 신</em> (유교식 명칭)'] },
      ],
    },
  },
  {
    id: 'nambuk-economy',
    era: 'nambuk',
    title: '남북국의 경제',
    images: ['notes/img/nambuk-04-economy-a.webp', 'notes/img/nambuk-05-economy-b.webp'],
    head: [{ label: '', cells: ['〈경제〉'] }],
    rows: [
      { label: '조세', cells: ['· 조세(토지세) · 공납(특산물) · 역(노동력) → <u>민정 문서</u>'] },
      { label: '민정 문서', cells: ['· 조세 수취 ⇒ 고려 · 조선 (人: 호적, 土: 양안)|· 日에서 발견|· {{서원경(청주)}} <small class="memo">⇝ 〈직지〉도 청주</small>|· 촌주가 3년마다 작성'] },
      {
        label: '토지',
        cells: [
          '관리 ⇒ <b>수조권</b>: <u>관료전</u>(노동력 X) · <u>녹읍</u>(노동력 O)' +
          '|民 ⇒ <b>소유권</b>: <i>정전</i>(성덕왕) → 고려 · 조선: 민전' +
          '|<i>녹읍 → 관료전 → 녹읍 X</i> └ 신문왕 → <i>정전</i> └ 성덕왕 → <i>녹읍 O</i> └ 경덕왕',
        ],
      },
      { label: '활동', cells: ['<i>동시(전)</i> └ 지증왕 → <i>서시 · 남시</i> └ 통일 신라'] },
      {
        label: '무역',
        cells: [
          '· 신라 ↔ 中: {{당항성}}(진흥왕) · 산둥반도 {{신라방 · 신라소 · 신라원|신라방 · 소 · 원}}' +
          '|· <u>장보고</u>: {{청해진}}(완도) ↔ {{법화원}}' +
          '|· {{울산항}} ← 아라비아 (유리, 원성왕릉 무인상)' +
          '|· 발해: {{발해관}}(by 당), {{솔빈부}}(말) · 당 · 거란 · 일본 · 신라와 교류' +
          '|<small class="memo">→ 지도에서 무역로 보기 (점선 화살표)</small>',
        ],
      },
    ],
  },
  {
    id: 'ancient-society',
    era: ['c6', 'c7', 'nambuk'],
    title: '고대의 사회',
    images: ['notes/img/ancient-society-01.webp', 'notes/img/ancient-society-02.png', 'notes/img/ancient-society-03.png', 'notes/img/ancient-society-04.png'],
    head: [{ label: '', cells: [{ html: '〈사회〉 — <b>씨족 사회 전통</b> → 화랑도 · 귀족 회의', span: 4 }] }],
    rows: [
      {
        label: '화랑도',
        cells: [{
          html: '화(랑) = 귀족 · 도 = 귀족 + 일반 → <b>계급 갈등 완화</b>' +
            '|· 진흥왕: 국가 조직으로 개편' +
            '|· 신채호: <em>낭가</em>',
          span: 4,
        }],
      },
      { label: '귀족 회의', cells: ['<b>신라</b>', '<b>고구려</b>', '<b>백제</b>', '<b>발해</b>'] },
      { label: '', cells: ['<u>화백 회의</u>', '제가 회의', '정사암', '정당성'] },
      { label: '', cells: ['김씨, <b>만장일치</b>', '고씨', '부여씨 + 8성', '대씨'] },
      {
        label: '골품제',
        cells: [{
          html: '폐쇄적, 삶 모습 규정' +
            '|· <b>골</b> ┬ 성골: ~ 진덕 여왕' +
            '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 진골: 태종 무열왕(김춘추)' +
            '|· <b>품</b> ─ 6두품: <em>"아찬"까지</em> <small class="memo">(관등 승진 제한)</small>' +
            '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 설계두 <small class="memo">(신분 제약 → 당으로 건너감)</small>',
          span: 4,
        }],
      },
      {
        label: '6두품',
        cells: [{
          html: '설계두 → <i>설총</i>(원효 子, 신문왕) → <i>최치원</i>' +
            '|&nbsp;&nbsp;&nbsp;&nbsp;┌ <em>빈공과</em>, <em>토황소격문</em>' +
            '|&nbsp;&nbsp;&nbsp;&nbsp;└ 시무 10여 조 X, 〈계원필경〉',
          span: 4,
        }],
      },
    ],
  },
  {
    id: 'ancient-culture-1',
    era: ['c6', 'c7', 'nambuk'],
    title: '고대의 문화 ① 유교 · 역사 · 도교',
    images: ['notes/img/ancient-culture-01.webp', 'notes/img/ancient-culture-02.webp', 'notes/img/ancient-culture-03.webp'],
    head: [{ label: '', cells: ['유교', '역사', '도교'] }],
    rows: [
      { label: '고구려', cells: [
        '· 중앙: <u>태학</u>(소수림왕)|· 지방: <em>경당</em>(장수왕, 평양 천도 이후)|&nbsp;&nbsp;= 문 + 무',
        '〈유기〉 → <i>〈신집〉 5권</i>|영양왕, 이문진',
        '<b>도교</b>: 신선, 무위자연|⇒ <u>사신도</u>',
      ] },
      { label: '백제', cells: [
        '· 박사(오경 · 의 · 역박사)|· 왕인(논어, 천자문 → 日)|· 사택지적비(부여)',
        '<i>〈서기〉</i> └ 근초고왕, 고흥',
        '· <u>산수무늬 벽돌</u>|· <u>금동 대향로</u>(부여)',
      ] },
      { label: '신라', cells: [
        '· <em>임신서기석</em>|· 화랑도의 세속 오계(by 원광)',
        '<i>〈국사〉</i> └ 진흥왕, 거칠부',
        '화랑도 ⇒ <i>낭가 사상</i> └ 신채호',
      ] },
      { label: '통일 신라', cells: [
        '· <em>국학</em>(신문왕)|· <i>설총</i>(신문왕 ← 화왕계): 이두 정리|· 강수: 외교 문서, 〈<i>청방인문표</i>〉|· 김대문: 〈화랑세기〉, 〈고승전〉, 〈한산기〉|&nbsp;&nbsp;⇒ <em>자주적, 주체적</em>',
        '—', '—',
      ] },
      { label: '통일 신라 말', cells: [
        '· 독서삼품과(원성왕) △|· <u>최치원</u>: 빈공과, 토황소격문, 〈계원필경〉',
        '—', '—',
      ] },
      { label: '발해', cells: ['주자감', '—', '—'] },
    ],
  },
  {
    id: 'ancient-culture-2',
    era: ['c6', 'c7', 'nambuk'],
    title: '고대의 문화 ② 불교 · 불상 · 불탑',
    images: ['notes/img/ancient-culture-04.webp', 'notes/img/ancient-culture-05.webp', 'notes/img/ancient-culture-06.webp', 'notes/img/ancient-culture-07.png', 'notes/img/ancient-culture-08.webp', 'notes/img/ancient-culture-09.webp'],
    head: [{ label: '', cells: ['불교(人) ⇒ 왕실, 업, <em>호국</em>', { html: '불상', span: 2 }, '불탑'] }],
    rows: [
      { label: '고구려', cells: [
        '<u>소수림왕</u> ← 전진',
        { html: '<b>금동 미륵보살 반가 사유상</b>', rowspan: 3 },
        '금동 연가 7년명 여래 입상',
        '—',
      ] },
      { label: '백제', cells: [
        '침류왕 ← 동진',
        '<i>서산 용현리 마애 여래 삼존상</i>|└ 백제의 미소',
        '· <u>익산 미륵사지 석탑</u>(무왕 – 서동, 선화): 목탑 → 석탑|· <u>부여 정림사지 5층 석탑</u>(= 평제탑)',
      ] },
      { label: '신라', cells: [
        '<b>법</b>흥왕(이차돈)|→ 불교식 이름(법흥왕 ~ 진덕 여왕)',
        '경주 배동 석조 여래 삼존 입상',
        '· 경주 분황사 석탑(모전탑)|· 황룡사 9층 목탑(선덕 여왕 ← 자장): 고려 몽골 X',
      ] },
      { label: '통일 신라', cells: [
        '<u>불교 대중화</u>' +
        '|· <u>원효</u> ┬ 무애가, 일심 사상, <em>아미타 신앙(정토종)</em>' +
        '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 화쟁 사상 ⇝ 원융회통' +
        '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 〈십문화쟁론〉, 〈대승기신론소〉' +
        '|· 의상 ┬ <em>관음 신앙</em>' +
        '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 화엄종(일즉다 다즉일), 〈화엄일승법계도〉' +
        '|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>부석사</em> 창건' +
        '|· 혜초: 〈왕오천축국전〉 저술',
        { html: '<em>석굴암 본존불</em>', span: 2 },
        '· <u>경주 불국사 3층 석탑</u>(= 석가탑, 무영탑)|&nbsp;&nbsp;└ 무구정광대다라니경 [현존 세계 최고(最古) 목판 인쇄물]|· 경주 불국사 다보탑|· 경주 감은사지 3층 석탑(신문왕 → 문무왕)',
      ] },
      { label: '통일 신라 말', cells: [
        '<u>선종 유행</u> ⇒ <u>9산 선문</u>(<i>호족 후원</i>)|&nbsp;&nbsp;└ 풍수지리설(도선)',
        { html: '—', span: 2 },
        '· 양양 진전사지 3층 석탑(조각)|· <em>승탑 유행</em>: 화순 쌍봉사 철감선사 승탑',
      ] },
      { label: '발해', cells: ['—', { html: '<em>이불병좌상</em>', span: 2 }, '영광탑'] },
    ],
  },
  {
    id: 'ancient-culture-3',
    era: ['c6', 'c7', 'nambuk'],
    title: '고대의 문화 ③ 과학',
    images: ['notes/img/ancient-culture-10.webp', 'notes/img/ancient-culture-11.webp'],
    head: [{ label: '', cells: ['과학'] }],
    rows: [
      { label: '고구려', cells: ['<i>천문도</i> → 천상열차분야지도(조선 태조)|&nbsp;&nbsp;└ 왕↑, 농업'] },
      { label: '백제', cells: ['칠지도(왜, 근초고왕)'] },
      { label: '신라', cells: ['· 금관|· <em>첨성대</em>(<i>선덕 여왕</i>)|&nbsp;&nbsp;└ 분황사, 황룡사 9층 목탑'] },
      { label: '가야', cells: ['<em>덩이쇠</em>(철판 갑옷, 금동관)|⇒ {{김해 대성동 고분군|대성동 고분}}(금관가야), {{고령 지산동 고분군|지산동 고분}}(대가야)'] },
      { label: '통일 신라', cells: ['· 상원사 동종(성덕왕): <em>현존 최고(最古) 동종</em>|· 성덕 대왕 신종(<i>경덕왕</i> ~ 혜공왕): <em>에밀레종</em>|&nbsp;&nbsp;<small class="memo">경덕왕 ─ 녹읍 O, 불국사</small>|· <u>무구정광대다라니경</u>(<em>현존 세계 최고 목판 인쇄물</em>) ⇒'] },
      { label: '발해', cells: ['—'] },
    ],
  },
  {
    id: 'ancient-culture-4',
    era: ['c6', 'c7', 'nambuk'],
    title: '고대의 문화 ④ 건축 · 고분',
    images: ['notes/img/ancient-culture-12.webp', 'notes/img/ancient-culture-13.webp', 'notes/img/ancient-culture-14.webp'],
    head: [{ label: '', cells: ['건축', '고분'] }],
    rows: [
      { label: '고구려', cells: [
        '안학궁(평양)|&nbsp;&nbsp;└→ 장수왕, 남하 정책',
        '<u>돌무지무덤</u> (장군총)|&nbsp;&nbsp;↓|굴식 돌방무덤 <small class="memo">(모줄임 천장)</small>|⇒ 입구 O, 벽화 O, 도굴 O',
      ] },
      { label: '백제', cells: [
        '<i>미륵사(익산), 왕궁리</i>|&nbsp;&nbsp;└→ 무왕',
        '돌무지무덤 (석촌동 고분) <small class="memo">← 고구려 계통</small>|&nbsp;&nbsp;↓|굴식 돌방무덤 + 벽돌무덤(<i>무령왕릉</i>)|&nbsp;&nbsp;└→ 중국 남조(양) 교류',
      ] },
      { label: '신라', cells: [
        '황룡사|&nbsp;&nbsp;└→ 진흥왕',
        '<u>돌무지덧널무덤</u>(<em>껴묻거리 多</em>)|(<i>천마총</i>, 황남 대총) └ <em>천마도</em>(말안장)|⇒ 입구 X, 벽화 X, 도굴 X',
      ] },
      { label: '가야', cells: ['—', '{{김해 대성동 고분군|김해 대성동}} · {{고령 지산동 고분군|고령 지산동}} 고분'] },
      { label: '통일 신라', cells: [
        '· <u>불국사, 석굴암</u>|· 동궁과 월지(안압지)|⇒ · 불국사 3층 석탑(석가탑)',
        '· 굴식 돌방무덤(김유신 묘)|&nbsp;&nbsp;└ <em>12지 신상</em>(호석)',
      ] },
      { label: '발해', cells: [
        '상경 용천부, <u>주작대로</u>|&nbsp;&nbsp;└ 당',
        '· 정혜 공주(문왕 2) 묘: 굴식 돌방무덤, 돌사자상 ⇒ <em>고구려</em>|· 정효 공주(문왕 4) 묘: 벽돌무덤 ⇒ <em>중국</em>',
      ] },
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
  '왕궁리': { src: 'notes/img/artifacts/wanggungri.webp', caption: '익산 왕궁리 유적 — 백제 무왕 때 궁궐 터 (왕궁리 5층 석탑)' },
  '불국사': { src: 'notes/img/artifacts/bulguksa.webp', caption: '경주 불국사 (3층 석탑 · 다보탑) — 통일 신라' },
  '석굴암': { src: 'notes/img/artifacts/seokguram.webp', caption: '석굴암 본존불 — 통일 신라' },
  '상경 용천부': { src: 'notes/img/artifacts/sanggyeong-plan.webp', caption: '발해 상경성 용천부 — 당 장안성을 본뜬 도시 구조, 주작대로' },
  '주작대로': { src: 'notes/img/artifacts/sanggyeong-plan.webp', caption: '상경성 용천부의 주작대로 — 당 장안성의 영향' },
  '장군총': { src: 'notes/img/artifacts/janggunchong.webp', caption: '장군총 — 고구려 돌무지무덤 (집안)' },
  '무령왕릉': { src: 'notes/img/artifacts/muryeong-tomb.webp', caption: '무령왕릉 내부 — 백제 벽돌무덤, 중국 남조(양)의 영향' },
  '돌무지덧널무덤': { src: 'notes/img/artifacts/dolmuji-deotneol.webp', caption: '돌무지 덧널무덤 구조 — 나무덧널 위에 돌을 쌓고 흙으로 덮음 → 도굴이 어려워 껴묻거리가 많음' },
  '천마도': { src: 'notes/img/artifacts/cheonmado.webp', caption: '천마도 — 천마총에서 출토된 말다래(말안장 장식) 그림' },
  '김유신 묘': { src: 'notes/img/artifacts/kimyusin-tomb.webp', caption: '김유신 묘 — 통일 신라 굴식 돌방무덤, 둘레에 12지 신상 호석' },
  '천상열차분야지도': { src: 'notes/img/artifacts/cheonsang-yeolcha.webp', caption: '천상열차분야지도 — 조선 태조 때 고구려 천문도를 바탕으로 돌에 새긴 천문도' },
  '칠지도': { src: 'notes/img/artifacts/chiljido.png', caption: '칠지도 — 백제 근초고왕 때 왜왕에게 보낸 칼 (일본 이소노카미 신궁 소장)' },
  '금관': { src: 'notes/img/artifacts/geumgwan.webp', caption: '신라 금관 — 나뭇가지·사슴뿔 모양 세움 장식' },
  '첨성대': { src: 'notes/img/artifacts/cheomseongdae.png', caption: '첨성대 — 신라 선덕 여왕 때 세운 천문 관측대' },
  '덩이쇠': { src: 'notes/img/artifacts/deongisoe.png', caption: '덩이쇠 — 가야의 철 생산 · 화폐처럼 쓰이고 낙랑 · 왜에 수출' },
  '상원사 동종': { src: 'notes/img/artifacts/sangwonsa-bell.webp', caption: '상원사 동종 — 성덕왕, 현존 최고(最古)의 동종' },
  '성덕 대왕 신종': { src: 'notes/img/artifacts/seongdeok-bell.webp', caption: '성덕 대왕 신종(에밀레종) — 경덕왕 때 시작, 혜공왕 때 완성' },
  '분황사': { src: 'notes/img/artifacts/bunhwangsa-tap.webp', caption: '경주 분황사 모전 석탑 — 신라 선덕 여왕' },
  '사택지적비': { src: 'notes/img/artifacts/sataek-jijeokbi.webp', caption: '사택지적비 — 백제 귀족 사택지적이 인생의 무상함을 새긴 비 (부여, 도교·불교 영향)' },
  '사신도': { src: 'notes/img/artifacts/sasindo.webp', caption: '사신도 — 현무·청룡·백호·주작 (고구려 고분 벽화, 도교의 방위신)' },
  '산수무늬 벽돌': { src: 'notes/img/artifacts/sansu-byeokdol.webp', caption: '산수무늬 벽돌 — 백제, 도교의 이상 세계(신선 사상) 표현' },
  '금동 대향로': { src: 'notes/img/artifacts/geumdong-daehyangno.webp', caption: '백제 금동 대향로 — 부여 능산리 출토, 도교·불교 사상이 함께 표현됨' },
  '금동 미륵보살 반가 사유상': { src: ['notes/img/artifacts/bangasayusang-1.webp', 'notes/img/artifacts/bangasayusang-2.webp'], caption: '금동 미륵보살 반가 사유상 — 삼국 시대 (일본 고류사 목조 반가 사유상에 영향)' },
  '금동 연가 7년명 여래 입상': { src: ['notes/img/artifacts/yeonga-7-front.webp', 'notes/img/artifacts/yeonga-7-back.webp'], caption: '금동 연가 7년명 여래 입상 (앞면 · 뒷면) — 고구려, 경남 의령에서 발견' },
  '서산 용현리 마애 여래 삼존상': { src: 'notes/img/artifacts/yonghyeonri-samjonsang.webp', caption: '서산 용현리 마애 여래 삼존상 — 백제의 미소' },
  '경주 배동 석조 여래 삼존 입상': { src: 'notes/img/artifacts/baedong-samjon.webp', caption: '경주 배동 석조 여래 삼존 입상 — 신라' },
  '석굴암 본존불': { src: 'notes/img/artifacts/seokguram.webp', caption: '석굴암 본존불상 — 통일 신라' },
  '이불병좌상': { src: 'notes/img/artifacts/ibulbyeongjwasang.webp', caption: '이불병좌상 — 발해 (고구려 양식 계승)' },
  '익산 미륵사지 석탑': { src: 'notes/img/artifacts/mireuksaji-tap.webp', caption: '익산 미륵사지 동탑(복원) — 백제 무왕, 목탑 양식의 석탑' },
  '부여 정림사지 5층 석탑': { src: 'notes/img/artifacts/jeongnimsaji-tap.webp', caption: '부여 정림사지 5층 석탑 (= 평제탑) — 백제' },
  '경주 분황사 석탑': { src: 'notes/img/artifacts/bunhwangsa-tap.webp', caption: '경주 분황사 모전 석탑 — 신라 선덕 여왕, 벽돌 모양으로 돌을 다듬어 쌓음' },
  '황룡사 9층 목탑': { src: 'notes/img/artifacts/hwangnyongsa-tap.webp', caption: '황룡사 9층 목탑 복원 예측도 — 선덕 여왕(자장 건의), 고려 때 몽골 침입으로 소실' },
  '경주 불국사 3층 석탑': { src: 'notes/img/artifacts/seokgatap.webp', caption: '경주 불국사 3층 석탑 (= 석가탑, 무영탑) — 통일 신라' },
  '무구정광대다라니경': { src: 'notes/img/artifacts/mugujeonggwang.webp', caption: '무구정광대다라니경 — 석가탑에서 발견, 현존 세계 최고(最古) 목판 인쇄물' },
  '경주 불국사 다보탑': { src: 'notes/img/artifacts/dabotap.webp', caption: '불국사 다보탑 — 통일 신라' },
  '경주 감은사지 3층 석탑': { src: 'notes/img/artifacts/gameunsaji-tap.webp', caption: '감은사지 3층 석탑 — 통일 신라 (신문왕이 문무왕을 위해 완성한 감은사)' },
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
