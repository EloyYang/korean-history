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
 *   <span class="no-art">…</span> → 유물 사진 자동 링크를 걸지 않음 (이름이 같은 다른 유물일 때)
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
    id: 'ancient-culture-5',
    era: ['c6', 'c7', 'nambuk'],
    title: '고대의 문화 ⑤ 日 교류 · 外 교류',
    images: ['notes/img/ancient-culture-15.webp', 'notes/img/ancient-culture-16.png', 'notes/img/ancient-culture-17.png'],
    head: [{ label: '', cells: [{ html: '日 교류', span: 2 }, '外 교류'] }],
    rows: [
      { label: '고구려', cells: [
        { html: '<em>아스카 문화</em>|금동 미륵보살 반가 사유상|&nbsp;&nbsp;↓|목조 미륵보살 반가 사유상 (고류사)', rowspan: 3 },
        '· 수산리 고분 벽화 → 다카마쓰 고분 벽화|· 담징(금당 벽화)|· 혜자(쇼토쿠 태자 스승)',
        '· 우즈베키스탄 아프라시아브 궁전 벽화|· 각저총',
      ] },
      { label: '백제', cells: ['· 아직기, 왕인 → 日|· <em>백제 가람</em>', '—'] },
      { label: '신라', cells: ['· 조선술|· 축제술 → <em>한인의 연못</em>', '· 보검|· 유리 제품(페르시아산)'] },
      { label: '가야', cells: ['—', '<u>스에키</u> <small class="memo">(가야 토기 → 일본 스에키 토기)</small>', '—'] },
      { label: '통일 신라', cells: [{ html: '<em>하쿠호 문화</em>', rowspan: 2 }, '—', '원성왕릉(괘릉) 무인상'] },
      { label: '발해', cells: ['—', '—'] },
    ],
  },
  {
    id: 'goryeo-periods',
    era: ['goryeo1', 'goryeo2'],
    title: '고려의 시기 구분과 지배층 변화',
    images: ['notes/img/goryeo-01-periods.png'],
    head: [
      { label: '', cells: [{ html: '전기', span: 2 }, { html: '후기', span: 2 }] },
      { label: '', cells: ['초기', '중기', { html: '<em>무신 정변</em>(1170) ↓', span: 1 }, '몽골 → 원 간섭기'] },
      { label: '', cells: ['918 ~', '~ 1170', '1170 ~', '~ 1392'] },
    ],
    rows: [
      { label: '중앙', cells: [{ html: '호족 + 6두품 → <i>문벌</i>', span: 2 }, '→ <i>무신</i>', '→ <i>권문세족</i>'] },
      { label: '지방', cells: [{ html: '호족 + 6두품 → <u>향리</u>', span: 3 }, '→ <b>신진 사대부</b>(성리학) ⇑ 권문세족과 대립 → 1392 조선 건국'] },
    ],
  },
  {
    id: 'goryeo-early-curve',
    era: 'goryeo1',
    type: 'curve',
    title: '고려 초기 왕들의 정책 (그래프)',
    images: ['notes/img/goryeo-02-kings-a.webp', 'notes/img/goryeo-03-kings-b.webp'],
    curve: {
      range: [915, 1000], height: 700, base: 650, scale: 5.6,
      points: [[918, 0], [930, 20], [943, 40], [950, 42], [955, 42], [965, 55], [976, 76], [985, 90], [997, 96]],
      tickMarks: [918],
      ticks: [{ at: 918, label: '918' }],
      capitals: [],
    },
    annos: [
      { at: 925, box: [70, 8, 560, 182], title: '태조(왕↓)', body: '· 민생 안정: 감세(1/10), <em>흑창</em>(→ 의창)|· 호족 정책 ┬ O: <em>결혼, 사성, 역분전</em>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ X: <em>사심관</em>(연대 책임, 김부), <em>기인</em>|· 북진 정책 ┬ 발해 유민 수용|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <u>서경 중시</u>(청천강 ~ 영흥)|· 〈정계〉, 〈계백료서〉, <em>훈요 10조</em>' },
      { text: '공산 전투|↓|고창 전투|↓|일리천 전투', pos: [150, 250], anchor: 'middle', color: 'small' },
      { text: '왕규의 난', pos: [420, 330], anchor: 'middle', color: 'green', arrow: [[420, 338], [420, 395]] },
      { at: 965, box: [370, 470, 330, 130], title: '광종(왕↑)', body: '· <u>노비안검법</u>|· <u>과거제</u>, 호족 X, 공복 제정|· <b>칭제건원</b>(광덕, 준풍)' },
      { at: 976, box: [720, 360, 170, 70], title: '경종', body: '시정 전시과' },
      { at: 990, box: [640, 20, 350, 250], title: '성종', body: '<i>최승로 시무 28조</i>|&nbsp;&nbsp;└ 6두품, 유학|· 지방: <b>12목</b> → <u>지방관</u>|· 중앙: 2성 6부|· 연등회↓, 팔관회(도교) X|→ <em>문벌 사회 토대 마련</em>' },
    ],
  },
  {
    id: 'goryeo-central',
    era: 'goryeo1',
    title: '고려의 중앙 정치 조직 — 2성 6부',
    images: ['notes/img/goryeo-04-central.webp'],
    head: [{ label: '', cells: ['기관', '역할', '비고'] }],
    rows: [
      { label: '당', cells: ['<i>중서문하성</i>|&nbsp;&nbsp;┬ <b>재</b>신(2品↑)|&nbsp;&nbsp;└ 낭사(3品↓)', '심의 · 정책 결정|언론(간쟁·봉박)', '장관: <em>문하시중</em>'] },
      { label: '', cells: ['상서성 — <i>6부</i>(이·병·호·형·예·공)', '정책 집행', '—'] },
      { label: '송', cells: ['중추원|&nbsp;&nbsp;┬ <b>추</b>밀(2品↑)|&nbsp;&nbsp;└ 승선(3品)', '군국기무|왕명 출납(비서)', '—'] },
      { label: '', cells: ['어사대', '감찰', '낭사 + 어사대 = <b>대간</b>(대성): 서경 · 간쟁 · 봉박 ⇒ <u>언론 기능</u>'] },
      { label: '', cells: ['삼사', '회계 O, <u>언론 X</u>', '<small class="memo">← 이름은 같아도 조선 삼사(언론)와 다름</small>'] },
      { label: '고려 독자', cells: [{ html: '<em>재추 회의</em>(문관: 재신 + 추밀) · 중방(무관)|· <em>도병마사</em> → 도평의사사(도당): 임시 → 상설|· <em>식목도감</em>|&nbsp;&nbsp;└ <b>고려 독자성</b> <small class="memo">(구조도: 2성 6부 사진)</small>', span: 3 }] },
    ],
  },
  {
    id: 'goryeo-local',
    era: 'goryeo1',
    title: '고려의 지방 행정 · 군사 조직',
    images: ['notes/img/goryeo-05-local.webp'],
    head: [{ label: '', cells: [{ html: '지방: 성종 12목 → <b>5도</b>(행정) · <b>양계</b>(군사)', span: 2 }] }],
    rows: [
      { label: '양계', cells: ['<em>병마사</em> → 북계 · 동계 <small class="memo">(거란·여진 대비, 천리장성)</small>', '<b>주진군</b>: 군적 X, 상비군'] },
      { label: '5도', cells: ['<em>안찰사</em>(상설 X) → 5도|수령 → 4도호부 · 8목 — 주 · 군 · 현', '—'] },
      { label: '속현', cells: ['수령 파견 X → <i>향리</i>가 <b>실질적 지배 세력</b>|→ 속군 · 속현, 향 · 부곡 · 소', '<b>주현군</b>: 군적 X, 예비군'] },
      { label: '중앙군', cells: [{ html: '<i>2군 6위</i>: 군적 O, 직업 군인, <em>군인전</em>', span: 2 }] },
    ],
  },
  {
    id: 'goryeo-munbeol',
    era: 'goryeo1',
    title: '문벌 사회와 그 모순 (중기)',
    images: ['notes/img/goryeo-06-munbeol.webp', 'notes/img/goryeo-07-contradiction.webp', 'notes/img/goryeo-08-1170.png'],
    head: [{ label: '', cells: ['초기 → 중기 (~ 1170)'] }],
    rows: [
      { label: '변화', cells: ['<i>호족</i> → <i>문벌</i>|선종 → 교종|고구려 → 신라 <small class="memo">(계승 의식)</small>'] },
      {
        label: '특권',
        cells: [{
          html: '· 정치: <u>음서</u>(5品↑) + <em>과거</em>(광종, 쌍기) <small class="memo">→ 관료</small>' +
            '|· 경제: <u>공음전</u> + <em>전시과</em>' +
            '|· 사회: 폐쇄적 통혼(근친혼)' +
            '|<small class="memo">음서 · 공음전 = "음(蔭)" → 문벌의 세습 특권</small>',
          span: 1,
        }],
      },
      {
        label: '모순↑',
        cells: [{
          html: '1. <u>{{이자겸의 난|이자겸}}</u>의 난(인종) + 척준경 X' +
            '|↓' +
            '|2. <u>{{묘청의 난|묘청}}</u>의 서경 천도 운동(인종) X <small class="memo">→ 아래 비교표</small>' +
            '|&nbsp;&nbsp;&nbsp;&nbsp;└→ <em>신채호</em> 〈조선사연구초〉 "조선역사 일천년래 제일 대사건"' +
            '|↓' +
            '|3. 김돈중 → 정중부(수염) / 한뢰 → 이소응(뺨)' +
            '|&nbsp;&nbsp;&nbsp;&nbsp;⇒ <b>무신 정변</b>(1170, 의종)',
          span: 3,
        }],
      },
    ],
  },
  {
    id: 'goryeo-seogyeong',
    era: 'goryeo1',
    title: '묘청의 서경 천도 운동 — 서경파 vs 개경파',
    images: ['notes/img/goryeo-07-contradiction.webp'],
    head: [{ label: '', cells: ['서경파 <small class="memo">(패배)</small>', '개경파 <small class="memo">(승리)</small>'] }],
    rows: [
      { label: '인물', cells: ['묘청, 정지상', '김부식 <small class="memo">→ 서경파 진압</small>'] },
      { label: '사상', cells: ['<em>불교, 풍수지리설</em>', '<em>유학</em>'] },
      { label: '계승', cells: ['<em>고구려 계승(자주)</em>', '<em>신라 계승(사대)</em>'] },
      { label: '대외', cells: ['금 정벌', '금 사대'] },
    ],
  },
  {
    id: 'goryeo-musin',
    era: ['goryeo1', 'goryeo2'],
    title: '무신 정권 (1170 ~ 1270)',
    images: ['notes/img/goryeo-09-musin.webp'],
    head: [{ label: '', cells: ['집권자', '정치', '군사'] }],
    rows: [
      { label: '초기', cells: ['이의방 → 정중부', { html: '<b>중방</b>', rowspan: 2 }, { html: '도방', rowspan: 2 }] },
      { label: '', cells: ['경대승 → 이의민'] },
      { label: '최씨', cells: ['최충헌 (<u>봉사 10조</u>)', '<em>교정도감</em>(별감)', { html: '도방 <small class="memo">(경대승 도방 X → 최충헌 다시 설치)</small>|&nbsp;&nbsp;└ 야별초 → <b>삼별초</b>', rowspan: 2 }] },
      { label: '', cells: ['최우', '교정도감 + · <em>정방</em>(인사권) · <em>서방</em>(문신↑)'] },
      { label: '', cells: [{ html: '<small class="memo">무신 정권의 수탈 → 백성의 <b>저항</b> (사회 동요 표)</small>', span: 3 }] },
    ],
  },
  {
    id: 'goryeo-unrest',
    era: 'goryeo2',
    title: '무신 집권기의 사회 동요',
    images: ['notes/img/goryeo-10-unrest.webp'],
    head: [{ label: '', cells: ['사회 동요', '주체'] }],
    rows: [
      { label: '', cells: ['· 김보당(동계), 조위총(서경)', '지배층'] },
      { label: '', cells: ['· <u>{{망이·망소이의 난}}(공주 명학소)</u>|· 김사미 · 효심의 난(운문 · 초전)', '양민'] },
      { label: '', cells: ['· <u>{{만적의 난(모의)|만적의 난}}(개경): <em>신분 해방</em></u>', '천민'] },
    ],
  },
  {
    id: 'goryeo-foreign-1',
    era: 'goryeo1',
    title: '고려의 대외 관계 ① 거란 · 여진',
    images: ['notes/img/goryeo-foreign-102.webp', 'notes/img/goryeo-foreign-103.webp'],
    head: [{ label: '', cells: ['호족 ⇒ 10 ~ 11C <em>거란(요)</em>', '문벌 ⇒ 12C <em>여진(금)</em>'] }],
    rows: [
      { label: '침입·대응', cells: [
        '1차: <u>{{서희의 외교 담판|서희}}</u> vs 소손녕 — <u>{{강동 6주}}</u>|2차: 강조의 변, 양규|3차: 강감찬 — {{귀주 대첩}} (낙성대)',
        '· 윤관: <u>별무반</u> ⇒ {{윤관 여진 정벌|동북 9성}}|&nbsp;&nbsp;├ 신기군(기병)|&nbsp;&nbsp;├ 신보군(보병)|&nbsp;&nbsp;└ 항마군(승병)|· <i>금 사대 ⇒ O(이자겸, 김부식)</i>|&nbsp;&nbsp;↕ {{묘청의 난|묘청}}의 서경 천도 운동 X',
      ] },
      { label: '결과', cells: [
        '· <em>초조대장경</em>|· 광군(정종)|· <em>천리장성</em> <small class="memo">(압록강 ~ 도련포, 거란·여진 대비)</small>|· <em>나성</em>(개성)',
        '—',
      ] },
    ],
  },
  {
    id: 'goryeo-foreign-2',
    era: 'goryeo2',
    title: '고려의 대외 관계 ② 몽골 항쟁',
    images: ['notes/img/goryeo-foreign-104.webp'],
    head: [{ label: '', cells: ['무신 ⇒ 13C <em>몽골(원)</em> → <em>초조대장경 X, 황룡사 9층 목탑 X</em>'] }],
    rows: [
      { label: '항쟁', cells: [
        '· 최우: {{강화도}} 천도 ⇝ (1270) 개경 환도|· 김윤후: {{처인성 전투|처인성}}(살리타 X), <em>{{충주성 전투|충주}}(노비)</em> ⇝ <em>다인철소</em>|· 배중손, 김통정: <u>삼별초</u>|&nbsp;&nbsp;└ = 좌 · 우별초 + 신의군|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;강화도 → {{진도 용장성|진도(용장성)}} → {{제주 항파두리|제주도(항파두리)}}',
      ] },
      { label: '결과', cells: ['<em>팔만대장경</em> ({{합천 해인사}})'] },
    ],
  },
  {
    id: 'goryeo-yuan',
    era: 'goryeo2',
    title: '원 간섭기 ↔ 공민왕의 개혁',
    images: ['notes/img/goryeo-foreign-105.webp', 'notes/img/goryeo-foreign-106.webp'],
    head: [{ label: '', cells: ['권문세족 ⇒ <b>원 간섭기</b>', '<u>공민왕</u>(노국 대장 공주) + 신진 사대부(성리학)'] }],
    rows: [
      { label: '영토', cells: ['영토 축소 ┬ <em>쌍성총관부</em>(철령 이북)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 동녕부(서경)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 탐라총관부(제주)', '→ X ({{쌍성총관부 수복}})'] },
      { label: '왕실', cells: ['부마국, 忠○왕', '—'] },
      { label: '관제', cells: ['2성(→ 첨의부), 6부(→ 4사)|중추원(→ 밀직사)', '<small class="memo">관제 복구</small>'] },
      { label: '내정', cells: ['내정 간섭: <em>다루가치, 정동행성</em>(개경) <em>이문소</em>', '→ X (정동행성 이문소 폐지)'] },
      { label: '공녀', cells: ['<em>공녀</em>(→ 조혼)', '—'] },
      { label: '풍속', cells: ['<em>몽골풍</em>(변발, 호복) ≠ 고려양', '→ X'] },
      { label: '권문세족', cells: ['권문세족', '→ X 기철(기황후)'] },
      { label: '', cells: ['· 정치: 도평의사사, 음서, 정방', '→ X <b>정방 폐지</b>'] },
      { label: '', cells: ['· 경제: <b>대농장</b>', '→ X <u>전민변정도감(신돈)</u>|&nbsp;&nbsp;└ 왕↑, 재정↑'] },
    ],
  },
  {
    id: 'goryeo-end',
    era: 'goryeo2',
    title: '14C 홍건적 · 왜구 → 조선 건국',
    images: ['notes/img/goryeo-foreign-107.webp'],
    head: [{ label: '', cells: ['14C {{홍건적 침입|홍건적}}(안동 피신 → 공민왕) · 왜구'] }],
    rows: [
      { label: '왜구 격퇴', cells: ['· {{홍산 대첩}}: 최영|· {{진포 대첩}}: 최무선 <em>(화통도감 – 화포)</em>|&nbsp;&nbsp;⇓|· <i>{{황산 대첩|황산 전투}}: 이성계</i>|&nbsp;&nbsp;└→ 신흥 무인 세력↑'] },
      { label: '조선 건국', cells: ['명, 철령위 설치 통보|↓|최영(우왕) → 요동 정벌 단행|↓|<em>{{위화도 회군}}: 4불가론</em> <small class="memo">(최영 제거)</small>|↓|<em>과전법 시행</em>|⇓|<b>조선(1392)</b>'] },
    ],
  },
  {
    id: 'goryeo-economy',
    era: ['goryeo1', 'goryeo2'],
    title: '고려의 경제',
    images: ['notes/img/goryeo-econ-1.webp', 'notes/img/goryeo-econ-2.webp'],
    head: [
      { label: '〈경제〉', cells: ['<em>역분전</em>(태조)', '<em>시정 전시과</em>(경종)', '<em>개정 전시과</em>(목종)', '<em>경정 전시과</em>(문종)'] },
    ],
    rows: [
      { label: '수조권', cells: [
        '└ 논공행상',
        '<small class="memo">↓ 광종(공복)</small>|├ 전 · 현직|└ <b>인품</b>',
        '├ 전 · 현직|└ 인품 X',
        '└ <em>현직</em>|<small class="memo">전(토지) + 시(임야) · 토지 부족</small>',
      ] },
      { label: '소유', cells: [{ html: '<b>민전</b>(→ 조선)', span: 4 }] },
      { label: '수취 제도', cells: [{ html: '<i>양안</i> ⇒ 조세(토지세), 공납(특산물) · <i>호적</i> ⇒ 역(정남 → 요역, 군역)', span: 4 }] },
      { label: '농업(후기)', cells: [{ html: '· 논: <em>이앙법</em>(남부 일부 시행), <em>〈농상집요〉</em>(from 원, 이암)|· 밭: <em>윤작법</em>(2년 3작), 목화(from 원, 문익점)', span: 4 }] },
      { label: '상업', cells: [{ html: '· 무역: <u>{{벽란도}}</u>(국제 무역항, 예성강, 이규보 – COREA by 아라비아 상인), 〈노걸대〉|· 화폐: <u>활구(은병)</u>, 건원중보(성종, 철전) – 해동통보(숙종) ⇒ 주전도감 ⇝ 유통 X, 현물 O|· 관영 상점(서적점, 다점), 시전 ⇝ <em>경시서</em>(상행위 관리·감독), <em>상평창</em>(물가 조절 기구)', span: 4 }] },
      { label: '수공업', cells: [{ html: '관영 수공업, 소 수공업 ⟶ 민영 수공업, 사원 수공업', span: 4 }] },
    ],
  },
  {
    id: 'goryeo-society',
    era: ['goryeo1', 'goryeo2'],
    title: '고려의 사회',
    images: ['notes/img/goryeo-soc-1.webp', 'notes/img/goryeo-soc-2.png'],
    head: [{ label: '〈사회〉', cells: ['양반 문벌', '중간 계층', '양민', '천민'] }],
    rows: [
      { label: '신분제', cells: [
        '호족 → <b>양반 문벌</b>|↓ 무신|↓ 권문세족',
        '├ 하급 관리|└ 잡류, 남반, <em>군반, 향리</em>|<small class="memo">양반 + 중간 계층 = 지배층</small>',
        '<small class="memo">세금 O</small>|├ <i>백정</i>(일반 농민): 인구 多|└ <u>향 · 부곡(농업) · 소(수공업)</u>|&nbsp;&nbsp;&nbsp;&nbsp;<u><em>차별 – 세금↑, 거주 이주 X</em></u>',
        '├ <i>노비 多</i>|│ (매매 · 상속 · 증여)|└ 일천즉천',
      ] },
      { label: '농민 조직', cells: [{ html: '<b>향도</b>: 전기 — 불교 신앙 조직(매향) ⇝ 후기 — 마을 공동 조직(상장제례) → 조선', span: 4 }] },
      { label: '사회 제도', cells: [{ html: '· 구휼: <em>흑창</em>(태조) → <em>의창</em>, 제위<b>보</b>|· 기구: 동 · 서 대비원, 혜민국, 구제도감, 구급도감', span: 4 }] },
      { label: '법률', cells: [{ html: '당률 &lt; 관습법, 태 · 장 · 도 · 유 · 사', span: 4 }] },
      { label: '가족 제도', cells: [{ html: '<u>가정 內 여성 지위↑</u>|└ 균분 상속, 윤행봉사(딸 제사 O), 외가 음서 O, 호적 나이순 기재', span: 4 }] },
    ],
  },
  {
    id: 'goryeo-culture',
    era: ['goryeo1', 'goryeo2'],
    title: '고려의 문화 ① 유학 · 역사 · 불교 · 풍수지리설',
    images: ['notes/img/goryeo-culture-112.webp', 'notes/img/goryeo-culture-113.webp', 'notes/img/goryeo-culture-114.webp', 'notes/img/goryeo-culture-115.webp', 'notes/img/goryeo-culture-116.png', 'notes/img/goryeo-culture-117.webp', 'notes/img/goryeo-culture-118.webp', 'notes/img/goryeo-culture-119.png'],
    head: [{ label: '', cells: ['호족', '문벌', '무신', '원↑ ⋯ 권문세족 ← <b>신진 사대부</b>'] }],
    rows: [
      { label: '유학(훈고학)', cells: [
        '<b>성종</b> ← 최승로|├ 중앙: <u>국자감</u>|│&nbsp;&nbsp;├ 유학부 → 명경과, 제술과|│&nbsp;&nbsp;└ 기술학부 → 잡과|│&nbsp;&nbsp;<small class="memo">〈과거: 쌍기〉 승과 O, <em>무과 X</em></small>|└ 지방: <em>향교</em>',
        '<em>사학 12도</em>(최충의 9재 학당 = 문헌공도)|&nbsp;&nbsp;└ 최충 = 해동공자|→ 관학 진흥책: 양현고, 전문 7재',
        '유학↓',
        '안향: <u>성리학</u>(from 원) 소개|&nbsp;&nbsp;└→ <u>신진 사대부</u>|<i>이제현</i> – 이색 – 정몽주 · 정도전|&nbsp;&nbsp;└ 만권당, 〈역옹패설〉',
      ] },
      { label: '역사', cells: [
        '실록 · 〈구삼국사〉 → X <small class="memo">(전하지 않음)</small>',
        '<b>〈삼국사기〉</b>|├ 김부식, 신라 (계승)|├ <em>현존 우리나라 최고(最古) 역사서</em>|└ <i>기전체</i>: 본<b>기</b> + (세가) + 지 + 표 + 열<b>전</b>',
        '· 〈해동고승전〉: 각훈|· <i>〈동명왕편〉</i>: 이규보 ⇒ 고구려|&nbsp;&nbsp;└ 고주몽',
        '· 〈삼국유사〉: 일연, <em>민간 설화</em>, 군위|· 〈제왕운기〉: 이승휴|&nbsp;&nbsp;⇒ 두 책 모두 <b>단군</b> 수록|· 〈사략〉: 이제현 <small class="memo">(성리학적 사관)</small>',
      ] },
      { label: '불교', cells: [
        '· <i>균여</i>: 〈보현십원가〉 – 향가, 광종|· 태조: 훈요 10조 → 연등회, <i>팔관회</i>↑(도교·민간 신앙)|&nbsp;&nbsp;↓|· 성종: 최승로 → 연등회 ↓, 팔관회 X',
        '<u>의천</u>(왕자)|├ <u>천태종</u>(국청사)|├ <b>교</b> · 선 통합: 교관겸수|└ 〈교장〉 편찬, 화폐 유통 주장',
        '· <u>지눌</u> ┬ <u>조계종</u>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ <b>선</b> · 교 통합: 정혜쌍수, 돈오점수|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>결사</em>(수선사 → 송광사)|&nbsp;&nbsp;⇣|· 혜심: <em>유 · 불 일치설</em>|· 요세: <em>법화 신앙, 백련 결사</em>',
        '—',
      ] },
      { label: '풍수지리설', cells: [
        '<em>서경 길지설</em> → 훈요 10조, 북진 정책,|3경(개경, 서경, 동경 → 남경)',
        '⇝ <em>{{묘청의 난|묘청의 서경 천도 운동}}</em>',
        '—',
        '→ <em>한양 천도(조선)</em>',
      ] },
    ],
  },
  {
    id: 'goryeo-art',
    era: ['goryeo1', 'goryeo2'],
    title: '고려의 문화 ② 예술 · 인쇄 · 과학',
    images: ['notes/img/goryeo-art-120.webp', 'notes/img/goryeo-art-121.webp', 'notes/img/goryeo-art-122.webp', 'notes/img/goryeo-art-123.webp', 'notes/img/goryeo-art-124.webp', 'notes/img/goryeo-art-125.webp'],
    head: [{ label: '', cells: ['초기', '중기', '후기'] }],
    rows: [
      { label: '불상 · 회화', cells: [
        '· <u>철불</u> 유행: 하남 하사창동 철조 석가여래 좌상|· <u>대형</u> 석불: 논산 관촉사 석조 미륵보살 입상, 안동 이천동 마애 여래 입상, 파주 용미리 마애 이불 입상',
        '신라 계승: 영주 <i>부석사</i> 소조 아미타여래 좌상|&nbsp;&nbsp;└ <em>의상</em>',
        '· 불화 ┬ 아미타래영도|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 수월관음도 ⇒ 지배층 소원|· 천산대렵도(by 공민왕?)',
      ] },
      { label: '불탑', cells: [
        '· 여주 고달사지 승탑|· 충주 정토사지 홍법국사 승탑(국박)',
        '<b>다각 다층 석탑</b> ⇒ <em>평창 월정사 8각 9층 석탑</em>(석조 보살 좌상)',
        '<u><em>개성 경천사지 10층 석탑</em>(원 영향)</u> – 대리석(국박 실내)|→ <em>서울 원각사지 10층 석탑(조선)</em>',
      ] },
      { label: '공예', cells: ['—', '나전 칠기, <b>순청자</b> ⇝', '→ <b>상감 청자</b> → 분청사기 / 은입사'] },
      { label: '인쇄(목판)', cells: [
        '대량 O, 다양 X|<em>초조대장경</em>(거란 X)',
        '교장(의천)',
        'X → 재조대장경(= <u>팔만대장경</u>, 몽골 X, 무신) – {{합천 해인사}}에 보관, <em>유네스코 세계 기록 유산</em>',
      ] },
      { label: '인쇄(활판)', cells: [
        '소량 O, 다양 O',
        '〈상정고금예문〉(인종 X) <small class="memo">(전하지 않음)</small>',
        '<u>〈직지심체요절〉</u>[<em>현존 세계 최고(最古) 금속 활자본</em>] – 청주(서원경) 흥덕사에서 제작, <em>유네스코 세계 기록 유산</em>',
      ] },
      { label: '건축', cells: [
        '· <b>주심포 양식</b> <small class="memo">(기둥 위에만 공포, 배흘림기둥)</small>',
        { html: '→ <u>안동 봉정사 극락전</u>(현존 최고 고려 목조 건축물), 예산 수덕사 대웅전, <u>영주 부석사 무량수전</u>|· <b>다포 양식</b>: 황해도 성불사 응진전 <small class="memo">(후기)</small>', span: 2 },
      ] },
      { label: '과학(천문)', cells: ['사천대, 선명력(당)', '—', '수시력(원), <span class="no-art">개성 첨성대</span>(?)'] },
      { label: '의학', cells: ['—', '—', '<em>〈향약구급방〉: 현존 우리나라 최고(最古) 의학서</em>'] },
      { label: '무기', cells: ['—', '—', '<b>화통도감</b>(우왕, 최무선) → {{진포 대첩|진포(금강) 전투}} ⋯ {{황산 대첩|황산 전투}}(이성계)'] },
    ],
  },
  {
    id: 'joseon-founding',
    era: ['goryeo2', 'joseon1'],
    title: '조선 건국 세력 — 혁명파 vs 온건파',
    images: ['notes/img/joseon-pol-126.webp'],
    head: [{ label: '', cells: ['<b>혁명파</b> (정도전)', '<b>온건파</b> (정몽주)'] }],
    rows: [
      { label: '공통', cells: [{ html: '<b>신진 사대부</b> + 신흥 무인 ⇒ 권문세족 X|1. {{위화도 회군}} → 2. <em>과전법</em>', span: 2 }] },
      { label: '방향', cells: ['→ <b>조선 건국</b>(1392) — <em>중앙 집권</em>', '→ 낙향 — <em>향촌 자치</em>'] },
      { label: '이후', cells: ['⇒ <b>훈구파</b>(세조)', '⇒ <b>사림파</b>'] },
    ],
  },
  {
    id: 'joseon-15c',
    era: 'joseon1',
    title: '15C 중앙 집권 — 태조 ~ 성종',
    images: ['notes/img/joseon-pol-127.webp'],
    head: [{ label: '', cells: ['정책'] }],
    rows: [
      { label: '태조', cells: ['삼봉 <em>정도전</em>(재상↑)|├ {{한양}} 도성 설계, 과전법|└ 〈불씨잡변〉, 〈조선경국전〉 – 〈경제문감〉|&nbsp;&nbsp;↑ 왕자의 난 → 정도전 X'] },
      { label: '태종(왕↑)', cells: ['<u>6조 직계제</u>, <u>사병 X</u>, 양전, <u>호패법</u>, 신문고'] },
      { label: '세종', cells: ['<u>의정부 서사제</u>, <em>집현전, 훈민정음</em>|{{4군 (최윤덕)|4군}}(최윤덕), {{6진 (김종서)|6진}}(김종서) 개척, {{쓰시마 정벌|쓰시마 X}}'] },
      { label: '세조(왕↑)', cells: ['계유정난(한명회) → 단종 X (← 신숙주 vs 성삼문)|<u>6조 직계제</u>, <em>집현전 X</em>, <em>〈경국대전〉△</em>, 직전법'] },
      { label: '성종', cells: ['집현전 → <i>홍문관</i>(옥당) └ 경연, 서연|〈경국대전〉 ○(완성), 〈국조오례의〉|<small class="memo">3사(언론) 기능 강화 → 사림 등용</small>'] },
    ],
  },
  {
    id: 'joseon-sahwa',
    era: 'joseon1',
    title: '16C 사화 — 훈구파 vs 사림파',
    images: ['notes/img/joseon-pol-128.webp'],
    head: [{ label: '', cells: ['왕', '원인 · 내용'] }],
    rows: [
      { label: '무오사화', cells: ['연산군', '김종직 "조의제문" └ 김일손 \'사초\''] },
      { label: '갑자사화', cells: ['연산군', '폐비 윤씨 → 중종반정'] },
      { label: '기묘사화', cells: ['중종', '<u>조광조 개혁</u> ┬ 위훈 삭제|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 소격서 X|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 현량과 O|└ 주초위왕'] },
      { label: '을사사화', cells: ['명종', '외척 대윤(윤임) vs 소윤(윤원형) ← 임꺽정'] },
      { label: '결과', cells: [{ html: '사림은 향촌에서 세력 유지: <em>유향소, 서원, 향약</em> ⇒ 선조 때 사림 집권 → <b>붕당</b>', span: 2 }] },
    ],
  },
  {
    id: 'joseon-bungdang',
    era: 'joseon1',
    title: '붕당의 형성과 사림의 학통',
    images: ['notes/img/joseon-pol-129.webp'],
    head: [{ label: '', cells: ['동인', '서인'] }],
    rows: [
      { label: '붕당(선조)', cells: [{ html: '<em>이조 전랑</em> · <em>척신 청산</em> 문제로 분열', span: 2 }] },
      { label: '대표', cells: ['김효원', '심의겸'] },
      { label: '학통', cells: [{ html: '정몽주 – 길재 – 김숙자 – <b>김종직</b>(무오) ┬ 정여창 · <b>김굉필</b>(갑자) · 김일손|&nbsp;&nbsp;&nbsp;&nbsp;김굉필 ─ 이언적 · <b>서경덕</b> · <b>조광조</b>(기묘) · 김안국', span: 2 }] },
      { label: '학파', cells: ['<i>서경덕 · 조식 · 이황</i>', '<i>이이 · 성혼</i>'] },
      { label: '분화', cells: ['┬ <b>북인</b> (조식 · 서경덕)|└ <b>남인</b> (이황)', '┬ <b>노론</b> (이이)|└ <b>소론</b> (성혼)'] },
    ],
  },
  {
    id: 'joseon-central',
    era: 'joseon1',
    title: '조선의 행정 조직 ① 중앙',
    images: ['notes/img/joseon-adm-130.webp'],
    head: [
      { label: '', cells: [{ html: '<b>중앙 집권</b> — 중앙: <em>의정부, 6조</em>(이 · 호 · 예 · 병 · 형 · 공조) <small class="memo">구조도: 조선의 중앙 통치 조직</small>', span: 2 }] },
      { label: '', cells: ['王↑', '王↓'] },
    ],
    rows: [
      { label: '', cells: [
        '· <b>6조 직계제</b>(태종, 세조)|· 승정원(도승지) <small class="memo">— 왕명 출납</small>|· 의금부(금부도사) <small class="memo">— 국왕 직속 사법</small>',
        '· <b>의정부 서사제</b>(세종)|· <i>3사</i>(<em>언론</em>)|&nbsp;&nbsp;- 사간원(대사간, 간쟁) – 태종|&nbsp;&nbsp;- 사헌부(대사헌, 감찰)|&nbsp;&nbsp;- 홍문관(대제학, 경연)|&nbsp;&nbsp;⇒ 사간원 + 사헌부 = <i>양사</i>: <em>5品 이하 관리 서경권</em>',
      ] },
      { label: '기타', cells: [{ html: '한성부(한양) · 춘추관(역사 – 실록) · 장례원(노비) · 성균관(교육)', span: 2 }] },
    ],
  },
  {
    id: 'joseon-local',
    era: 'joseon1',
    title: '조선의 행정 조직 ② 지방',
    images: ['notes/img/joseon-adm-132.webp'],
    head: [{ label: '', cells: ['지방: <u>8도</u>(일원화) — 부 · 목 · 군 · 현'] }],
    rows: [
      { label: '관찰사', cells: ['8도 ← <em>관찰사</em>(고려: 안찰사) — 감사(감영)'] },
      { label: '수령', cells: ['<em>수령</em>(7사, 행정 + 사법 + 군사)|⇒ 관찰사 · 수령 <b>All 파견</b> └ 임기제, 상피제 <small class="memo">(고려: 속현 존재)</small>'] },
      { label: '향리', cells: ['향리(↓) — 단안 <small class="memo">(수령 보좌, 세습 아전)</small>'] },
      { label: '사족(사림)', cells: ['┬ <em>유향소</em>(여론) – 향회(향안) ↔ <b>경재소</b>(중앙에서 유향소 통제)|├ <em>서원</em>(교육 + 제사)|└ <em>향약</em>(농민 통제)'] },
    ],
  },
  {
    id: 'joseon-exam',
    era: 'joseon1',
    title: '조선의 관리 선발 방식',
    images: ['notes/img/joseon-adm-133.webp'],
    head: [{ label: '', cells: ['내용'] }],
    rows: [
      { label: '1. 과거', cells: ['<small class="memo">← 예조</small>|├ <b>문과</b> ┬ 양인 이상 O.K.|│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>X: 서얼, 재가 女의 子</em>|├ 무과 O, 승과 X ≠ 고려 <small class="memo">(고려: 무과 X, 승과 O)</small>|└ 잡과'] },
      { label: '2. 천거', cells: ['추천: <em>현량과(조광조)</em>'] },
      { label: '3. 문음', cells: ['2品↑: 고위 관료 X <small class="memo">(고려 음서보다 축소)</small>'] },
      { label: '4. 취재', cells: ['기술: 하급 관리'] },
    ],
  },
  {
    id: 'joseon-military',
    era: 'joseon1',
    title: '조선의 군사 조직',
    images: ['notes/img/joseon-adm-134.webp'],
    head: [{ label: '', cells: ['내용'] }],
    rows: [
      { label: '원칙', cells: ['양인 개병 + 농병 일치 = 의무병'] },
      { label: '편제', cells: ['<u>5위</u>(중앙군) + <u>영진군</u>(지방군) → 후기: 5군영 + 속오군'] },
      { label: '지방', cells: ['영 ⇒ 국방 요충지 · 진|→ <b>진관 체제</b>(지역 방어)'] },
      { label: '잡색군', cells: ['예비군: 향리 ~ 노비'] },
    ],
  },
  {
    id: 'joseon-diplomacy',
    era: 'joseon1',
    title: '조선 전기의 대외 관계 — 사대(명) · 교린(여진, 일본, 유구)',
    images: ['notes/img/joseon-war-135.webp'],
    head: [{ label: '', cells: ['강경책 (강)', '회유책 (온)'] }],
    rows: [
      { label: '명', cells: [{ html: '· 최영, 정도전 → <b>요동 정벌</b> 추진|· 태종: <i>사대 외교</i>, 공무역', span: 2 }] },
      { label: '여진', cells: ['<u>{{4군 (최윤덕)|4군}}(최윤덕) {{6진 (김종서)|6진}}(김종서)</u> → <em>사민 정책, 토관제</em>', '북평관, 무역소(태종)'] },
      { label: '일본', cells: ['<em>{{쓰시마 정벌|쓰시마섬 정벌}}(이종무)</em>', '<em>3포 개항</em>({{부산포}}, {{제포(내이포)|제포}}(창원), {{염포}}(울산))|&nbsp;&nbsp;└ <b>계해약조</b>'] },
      { label: '', cells: [{ html: '<small class="memo">4군 6진 · 쓰시마 정벌 · 3포 개항 = 모두 <b>세종</b></small>', span: 2 }] },
    ],
  },
  {
    id: 'joseon-imjin',
    era: ['joseon1', 'imjin'],
    title: '임진왜란 · 정유재란과 그 영향',
    images: ['notes/img/joseon-war-136.webp', 'notes/img/joseon-war-137.webp'],
    head: [{ label: '', cells: ['내용'] }],
    rows: [
      { label: '흐름', cells: ['{{삼포왜란|3포 왜란}}(중종) → {{을묘왜변}}(명종) → <b>임진왜란</b>(1592) → <b>정유재란</b> → <em>기유약조</em>(무역 재개) → 통신사 재파견'] },
      { label: '비변사', cells: ['<u>비변사</u>(임시, 중종) — 비변사(상설, 명종) — <em>비변사↑</em>(임진왜란) → 의정부 · 6조↓'] },
      { label: '초기 패배', cells: ['· {{부산진·동래성|동래성 전투}}(송상현)|· {{탄금대 전투}}(신립)|&nbsp;&nbsp;→ X → {{의주(선조 피난)|의주 피난}}'] },
      { label: '주요 전투', cells: ['<small class="memo">★ = 임진왜란 3대첩</small>|· ★ <em>{{한산도 대첩}}</em>(이순신) ─── {{명량 대첩}} – {{노량 해전}}|· ★ <em>{{진주 대첩}}</em>(김시민)|· {{평양성 탈환}}(조 · 명 연합군)|· {{북관 대첩(정문부)|북관 대첩}}(정문부, 의병) └ 곽재우, 고경명, 조헌|· ★ <em>{{행주 대첩}}</em>(권율)'] },
      { label: '군사 변화', cells: ['중앙: 5위(의무병) → <u>훈련도감</u>(5군영): <em>직업 군인</em> └ 포수, 사수, 살수(삼수병)|지방: 영진군 → <u>속오군</u>(양반 ~ 노비)|<small class="memo">← 유성룡(징비록)</small>'] },
    ],
  },
  {
    id: 'joseon-horan',
    era: ['imjin', 'horan'],
    title: '광해군 ~ 병자호란',
    images: ['notes/img/joseon-war-137.webp', 'notes/img/joseon-war-138.webp'],
    head: [{ label: '', cells: ['명↓, 후금↑, 일본(에도 막부, 도자기↑, 성리학↑)'] }],
    rows: [
      { label: '광해군', cells: ['· <u>중립 외교</u>(강홍립 투항, {{사르후 전투}})|&nbsp;&nbsp;→ 영창 대군 X, 인목 대비 △|· <u>대동법</u> 시행|· 〈동의보감〉(허준)'] },
      { label: '인조반정', cells: ['(서인) → <em>친명 배금</em> ← 이괄의 난(논공행상 불만)'] },
      { label: '정묘호란', cells: ['(후금) → {{강화도}} 피난 → <b>형제 관계</b>'] },
      { label: '병자호란', cells: ['(청) → <u>{{남한산성}}</u>(최명길 vs 김상헌) → <em>{{삼전도}} 항복</em>(<b>군신 관계</b>)'] },
    ],
  },
  {
    id: 'joseon-economy',
    era: 'joseon1',
    title: '조선 전기의 경제 (중농억상)',
    images: ['notes/img/joseon-es-139.webp', 'notes/img/joseon-es-140.webp'],
    head: [{ label: '', cells: ['← 15C', '16C →'] }],
    rows: [
      { label: '토지(수조권)', cells: [
        '<em>과전법</em>(공양왕) → 토지 부족 → <u>직전법</u>(세조) └ <em>관수관급</em>(성종)|· 전 · 현직, 경기 ⇒ 세습 X → 현직|· <em>수신전 · 휼양전</em> ⇒ 세습 O → X',
        '<em>직전법 X</em>(명종)|· <b>녹봉 전면적 실시</b>|· 수조권 X',
      ] },
      { label: '조세', cells: [
        '<small class="memo">국가 – 民 소유지</small>|<em>과전법</em>(공양왕): 1/10 (30두↑)|→ <u>공법</u>(세종)|· 전분 6등법: 비옥도|· 연분 9등법: 풍흉 → 4 ~ 20두',
        '→ 최저 세율(관행)',
      ] },
      { label: '지대', cells: ['—', '1/2 (타조법, 병작반수)'] },
      { label: '공납', cells: ['특산물(戶)', '→ <em>방납 폐단</em>'] },
      { label: '역', cells: ['노동력(군역 → 요역)', '→ <em>대립, 방군수포</em>|⇒ 임꺽정(명종)'] },
    ],
  },
  {
    id: 'joseon-society',
    era: 'joseon1',
    title: '조선 전기의 사회',
    images: ['notes/img/joseon-es-141.webp', 'notes/img/joseon-es-142.webp', 'notes/img/joseon-es-143.webp'],
    head: [{ label: '', cells: ['양반', '중인', '상민', '천민'] }],
    rows: [
      { label: '신분제', cells: [
        '문 + 무',
        '하급 관리, <em>서얼</em>',
        '<em>신량역천</em>(봉수군, 수군)',
        '노비 多, 백정',
      ] },
      { label: '', cells: [{ html: '<b>양천제</b>: 양인(양반 ~ 상민) — 〈경국대전〉 <em>과거 O</em> / 천인 — 실제로는 <b>반상제</b>(양반 · 중인 · 상민 · 천민)', span: 4 }] },
      { label: '법률', cells: [{ html: '· 대명률(형법) + <em>〈경국대전〉</em>(민법) &gt; 관습법|· 관찰사 + 수령 = <b>사법</b> + 행정 + 군사 ⇝ <em>2차 갑오개혁: 재판소 설치</em>', span: 4 }] },
      { label: '사회 제도', cells: [{ html: '· 구휼: 의창(춘대추납), 상평창, <em>〈구황촬요〉</em>|· 의료: 동 · 서 대비원, 혜민국 / 제생원(지방), 동 · 서 활인서(유랑민 관리)|⇓ 안정 — <b>농민 = 本</b> — 세금 → 국가, 지대 → 사족|⇑ 통제 — 국가: 호패(태종), 오가작통 / 사족: 향약', span: 4 }] },
      { label: '향촌 사회', cells: [{ html: '<i>향촌</i> = 군현 단위|· 중앙 — 관찰사(감영) ⇒ 감독 ⇒ 수령(임기 · 상피제) ↔ 향리(단안) ↔ 사족|· 경재소 ⇒ 감시 ⇒ <u>유향소</u>(좌수 · 별감): 여론 형성 └ 향회 ← 향안|· <em>향약</em>: 농민 통제 · <em>서원</em>: 인재 양성 + 제사|· 면 – 리: 오가작통 / 향도, 두레(民 자치)', span: 4 }] },
    ],
  },
  {
    id: 'joseon-culture-1',
    era: 'joseon1',
    title: '조선 전기의 문화 ① 유학 · 불교 · 역사',
    images: ['notes/img/joseon-cul-144.webp', 'notes/img/joseon-cul-145.webp', 'notes/img/joseon-cul-146.webp', 'notes/img/joseon-cul-147.webp', 'notes/img/joseon-cul-148.webp'],
    head: [{ label: '', cells: ['유학(성리학↑)', '불교', '<em>역사</em> → 정통성'] }],
    rows: [
      { label: '15C 훈구', cells: [
        '· 중앙: <em>성균관</em>(고등) — 대사성, <i>명륜당</i>(교육) + <i>대성전</i>(제사)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4부 학당(중등)|· 지방: <em>향교</em>(중등) ← 교수, 훈도 파견|⇒ 모두 <b>관학</b>',
        '· <u>숭유 억불</u>: 도첩제, 교단 정리(세종)|· 〈석보상절〉: <i>수양 대군</i>|&nbsp;&nbsp;└ 세조: 간경도감',
        '· 〈고려국사〉: by 정도전 (편년체)|· 〈고려사〉: <b>기전체</b>(문종)|· 〈고려사절요〉: <b>편년체</b>|· <em>〈실록〉</em>: 편년체, 춘추관, 세계 기록 유산|· <u><em>〈동국통감〉</em></u>: by 서거정, 고조선 ~ 고려, 통사|· <em>〈동문선〉</em>: by 서거정, 시문집',
      ] },
      { label: '16C 사림', cells: [
        '<u><em>서원</em></u> = 교육 + 제사 ⇒ <b>사학</b>|· <b>이황</b>: 〈주자서절요〉, <u>〈성학십도〉</u> ⇝ 동방 주자|&nbsp;&nbsp;사단칠정 논쟁(with 기대승), 예안 향약, 도산 서원, <em>일본 성리학↑</em>|· <b>이이</b>: 〈동호문답〉, <u>〈성학집요〉</u>|&nbsp;&nbsp;현실 개혁 → 10만 양병설, 수미법',
        '—',
        '→ 〈기자실기〉',
      ] },
    ],
  },
  {
    id: 'joseon-culture-2',
    era: 'joseon1',
    title: '조선 전기의 문화 ② 지리 · 법 · 윤리 · 음악',
    images: ['notes/img/joseon-cul-149.webp', 'notes/img/joseon-cul-150.webp'],
    head: [{ label: '', cells: ['<em>지리</em> → 중앙 집권', '법 · 윤리', '음악'] }],
    rows: [
      { label: '15C 훈구', cells: [
        '<u>혼일강리역대국도지도</u>|├ 태종|├ <em>현존 동양 최고 세계 지도</em>|└ 중화사상|<u><em>〈동국여지승람〉</em></u>',
        '· <u>〈경국대전〉</u>: 세조 ~ <b>성종</b>|· 〈삼강행실도〉: 세종, 충신 · 효자 · 열녀|· 〈국조오례의〉',
        '〈악학궤범〉|&nbsp;&nbsp;└ 음악 이론',
      ] },
      { label: '16C 사림', cells: [
        '↓ 〈신증동국여지승람〉(중종)',
        '〈이륜행실도〉: 중종, 연장자 · 연소자, 친구',
        '—',
      ] },
      { label: '', cells: [{ html: '<small class="memo">〈동국여지승람〉 · 〈국조오례의〉 · 〈악학궤범〉 · 〈경국대전〉 완성 = 모두 <b>성종</b> (칠판의 주황 테두리)</small>', span: 3 }] },
    ],
  },
  {
    id: 'joseon-culture-3',
    era: 'joseon1',
    title: '조선 전기의 문화 ③ 문자 · 인쇄 · 천문 · 역법 · 의학 · 농서',
    images: ['notes/img/joseon-cul-151.webp', 'notes/img/joseon-cul-152.webp'],
    head: [{ label: '', cells: ['문자 · 인쇄', '천문 · 역법', '의학 · 농서'] }],
    rows: [
      { label: '태조·태종', cells: ['태종: 주자소 설치, 계미자', '<em>천상열차분야지도</em>(태조)', '—'] },
      { label: '세종', cells: [
        '갑인자|<em>훈민정음</em> → 〈용비어천가〉|⇒ <b>민족적 · 자주적</b>',
        '· 측우기, 자격루(물시계), 앙부일구(해시계) ⇒ 장영실|· <u>〈칠정산〉</u>: 이순지, <i><em>한양 중심의 역법서</em></i>|&nbsp;&nbsp;수시력(원) + 회회력(아라비아)',
        '· 〈의방유취〉: 의학 백과사전|· <u>〈향약집성방〉</u>|· <u>〈농사직설〉</u>',
      ] },
      { label: '성종', cells: ['—', '—', '〈금양잡록〉: 강희맹'] },
    ],
  },
  {
    id: 'joseon-culture-4',
    era: 'joseon1',
    title: '조선 전기의 문화 ④ 건축 · 공예 · 회화 · 문학',
    images: ['notes/img/joseon-cul-153.webp', 'notes/img/joseon-cul-154.webp', 'notes/img/joseon-cul-155.webp', 'notes/img/joseon-cul-156.png', 'notes/img/joseon-cul-157.webp', 'notes/img/joseon-cul-158.webp'],
    head: [{ label: '', cells: ['건축 · 탑', '공예', '회화', '문학'] }],
    rows: [
      { label: '15C 훈구', cells: [
        '· <u>궁궐, 성곽</u>: 경복궁(전기) vs <i>창덕궁</i>(후기) <small class="memo">세계 유산</small>|· 우사(사직단) + <i>좌묘(종묘)</i> <small class="memo">세계 유산</small>|· 해인사 <i>장경판전</i> <small class="memo">세계 유산</small> ← <em>팔만대장경판</em> <small class="memo">세계 기록 유산</small>|· <em>원각사지 10층 석탑</em> ← 고려 경천사지 10층 석탑|&nbsp;&nbsp;└→ 후기: 백탑파(박지원, 박제가)',
        '<u>분청사기</u>',
        '<u>고사관수도</u> └ 강희안|<u>몽유도원도</u> ┬ 안평 대군 꿈|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 안견',
        '〈금오신화〉 ┬ 김시습|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>최초 한문 소설</em>',
      ] },
      { label: '16C 사림', cells: [
        '<i>서원</i>: 사당(제사) · 강당(교육) · 기숙|⇒ <i>백운동 서원</i> <small class="memo">세계 유산</small>|&nbsp;&nbsp;↓|<i><em>소수 서원</em></i>(사액) ┬ by 이황|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 안향 배향',
        '<em>백자</em>',
        '· 사군자 └ 매 · 난 · 국 · 죽|· <u>초충도</u> └ <em>신사임당</em>',
        '〈관동별곡〉, 〈사미인곡〉 ┬ 정철(기축옥사)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 가사 문학',
      ] },
    ],
  },
  {
    id: 'joseon-bungdang-flow',
    era: ['horan', 'gaehang'],
    title: '붕당 정치의 전개 — 선조 ~ 숙종',
    images: ['notes/img/joseon-late-159.webp', 'notes/img/joseon-late-160.webp', 'notes/img/joseon-late-161.webp'],
    head: [{ label: '', cells: ['내용'] }],
    rows: [
      { label: '붕당(선조)', cells: ['척신 잔재 · 이조 전랑 문제 → <b>동인</b> / <b>서인</b>|동인 ┬ <b>북인</b>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <b>남인</b>|&nbsp;&nbsp;← <em>정여립</em> 모반 사건 → <i>정철(서인)</i> └ 기축옥사'] },
      { label: '광해군', cells: ['(북인) ├ <i>중립 외교</i>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ <i>대동법</i>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 영창 대군 X|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 인목 대비 △|⇑ <b>인조반정</b>(서인) → 북인 몰락, 서인 + 남인'] },
      { label: '예송(현종)', cells: [{ html: '자의 대비 <i>상복 착용 기간</i>', span: 1 }] },
      { label: '', cells: ['<table class="mini"><tr><th></th><th>기해예송<br><small>효종 X</small></th><th>갑인예송<br><small>효종비 X</small></th></tr><tr><th>남인</th><td>3년</td><td><b>1년</b> ○ 채택</td></tr><tr><th>서인<br><small>송시열</small></th><td><b>1년</b> ○ 채택</td><td>9개월</td></tr></table>'] },
      { label: '환국(숙종)↑', cells: ['<b>경신</b>환국: 서인 집권(남인 X)|→ <b>기사</b>환국: 남인 집권 — 장희빈 O, <em>송시열 X</em>|→ <b>갑술</b>환국: 서인 집권(남인 X)|서인 ┬ <b>노론</b> → (영조)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <b>소론</b> → (경종)|⇣ <em>일당 전제</em>화'] },
    ],
  },
  {
    id: 'joseon-tangpyeong',
    era: 'gaehang',
    title: '탕평 정치 — 영조 · 정조',
    images: ['notes/img/joseon-late-162.webp', 'notes/img/joseon-late-163.webp'],
    head: [{ label: '', cells: ['방법', '정치', '경제', '사회', '문화'] }],
    rows: [
      { label: '영조', cells: [
        '· <em>탕평비</em>|· <b>완론 탕평</b>|&nbsp;&nbsp;(붕당 X)',
        '· 산림 X|· 서원↓(→ 대원군)|· 전랑↓|· <em>〈속대전〉</em>',
        '<i>균역법</i>|└ 1년 1필',
        '· <u>청계천 준설</u>|· 신문고 O (← 태종)|· 사형수 삼심제',
        '〈동국문헌비고〉',
      ] },
      { label: '(사도 세자)', cells: [{ html: '<small class="memo">영조 ─ (사도 세자) ─ 정조</small>', span: 5 }] },
      { label: '정조', cells: [
        '<b>준론 탕평</b>|&nbsp;&nbsp;(붕당 O)',
        '· <u>규장각</u> └ <u>초계문신제</u>|· <u>장용영</u>|· 〈대전통편〉',
        '<i>신해통공</i>|└ 시전 상인 <em>금난전권 X</em>',
        '· <i>향약</i> └ by 수령',
        '· <i>〈동문휘고〉</i> └ 대외 관계|· <u>수원 화성</u>',
      ] },
    ],
  },
  {
    id: 'joseon-sedo',
    era: 'gaehang',
    title: '세도 정치 — 순조 · 헌종 · 철종',
    images: ['notes/img/joseon-late-164.webp'],
    head: [{ label: '', cells: ['내용'] }],
    rows: [
      { label: '세도', cells: ['· <i>소수 가문</i> └ 안동 김씨, 풍양 조씨|&nbsp;&nbsp;→ <em>비변사</em>, 5군영 장악|· <i>매관매직</i>|&nbsp;&nbsp;↓|· <u>삼정의 문란</u> ┬ 전정(토지세)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 군정(역)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 환곡(고리대)|⇒ {{홍경래의 난}}(1811), {{임술 농민 봉기}}(1862)'] },
    ],
  },
  {
    id: 'joseon-late-military',
    era: ['imjin', 'horan', 'gaehang'],
    title: '조선 후기 군사 제도의 변화',
    images: ['notes/img/joseon-late-171.webp'],
    head: [{ label: '', cells: ['전기 → (1592) → 후기'] }],
    rows: [
      { label: '비변사', cells: ['비변사(임시 → 상설) ← 3포 왜란(중종) · 을묘왜변(명종)|→ <b>권력↑</b>(의정부, 6조↓) ⇢ 세도↑(왕↓) → X(흥선 대원군)'] },
      { label: '중앙군', cells: ['5위 → <u>5군영</u>: ① <u>훈련도감</u> — 포수 + 사수 + 살수|&nbsp;&nbsp;&nbsp;&nbsp;└→ <b>삼수병</b>(← 삼수미): 모병 → <em>직업 군인</em>(<i>급료 상비군</i>)|&nbsp;&nbsp;· 수어청, 총융청, 어영청 └ 인조(호란)|&nbsp;&nbsp;· 금위영 └ 숙종'] },
      { label: '지방군', cells: ['영진군 → <u>속오군</u>(<i>양반 ~ 노비</i>), 예비군'] },
      { label: '수비 체제', cells: ['진관 → 제승방략 → 진관 <small class="memo">(임진왜란 이후 속오군 중심 진관 체제 복구)</small>'] },
    ],
  },
  {
    id: 'joseon-late-diplomacy',
    era: ['horan', 'gaehang'],
    title: '조선 후기의 대외 관계 — 청 · 일본',
    images: ['notes/img/joseon-late-172.webp'],
    head: [{ label: '', cells: ['광해군', '인조 ← 반정(서인)', '효종'] }],
    rows: [
      { label: '여진(청)', cells: [
        '<u>중립 외교</u>|└ 강홍립 투항',
        '· 친명배금|· 정묘: 정봉수(용골), 이립|· 병자: 최명길, 김상헌',
        '· 북벌론: 송시열(⇝ 윤휴)|· {{나선 정벌 1차|나선 정벌}}(→ 러): 조총 부대 파견',
      ] },
      { label: '일본', cells: [
        '<b>기유약조</b>(1609)',
        { html: '<u>통신사</u>: 중 → 조 → 일, 선진 문물 전달, 막부 권위 인정|<small class="memo">※ 수신사: 개항 이후, 서 → 일 → 조, 서구 문물 수용</small>', span: 2 },
      ] },
    ],
  },
  {
    id: 'joseon-territory',
    era: ['horan', 'gaehang'],
    title: '영토 수호 — 간도와 독도',
    images: ['notes/img/joseon-late-173.webp'],
    head: [{ label: '', cells: ['조선 후기', '대한 제국'] }],
    rows: [
      { label: '간도', cells: [
        '<b>숙종</b>: <u>{{백두산정계비}}</u>|&nbsp;&nbsp;└ 서위압록, <i>동위토문</i> → <b>간도</b> 귀속 문제|<b>정조</b>: <i>북학론</i> └ 박지원, 박제가',
        '→ <em>간도 관리사</em>(이범윤) → <i>간도 협약</i>(1909): 청 ⊤ 일|&nbsp;&nbsp;↑ 을사늑약(1905, 외교권 X) — 협약 무효',
      ] },
      { label: '독도', cells: [
        '<i>안용복</i>(숙종): 울릉도, <b>독도</b> → 우리 영토 인정',
        '<u>대한 제국 칙령 제41호</u>(1900) <small class="memo">울도군이 석도(독도) 관할</small>|→ 러 · 일 전쟁 중 <b>일본 시마네현 강제 편입</b>(1905)',
      ] },
    ],
  },
  {
    id: 'joseon-late-economy',
    era: ['horan', 'gaehang'],
    title: '조선 후기의 경제 (1592 전후 비교)',
    images: ['notes/img/joseon-econ2-176.webp', 'notes/img/joseon-econ2-177.webp', 'notes/img/joseon-econ2-178.webp', 'notes/img/joseon-econ2-179.webp', 'notes/img/joseon-econ2-180.webp'],
    head: [{ label: '', cells: ['전기 (중농억상)', '후기 (1592 이후)'] }],
    rows: [
      { label: '〈수취〉', cells: [{ html: '<small class="memo">후기 수취 제도의 공통점 = <b>전세화 · 금납화</b> (토지 1결 기준, 돈으로 납부)</small>', span: 2 }] },
      { label: '조세', cells: ['과전법(1결 30두) → 공법(전분·연분, 1결 4 ~ 20두)', '<em>영정법</em>(인조): 1결 4 ~ 6두'] },
      { label: '공납', cells: ['특산물(戶) → <em>방납 폐단</em>', '<u>대동법</u> ┬ 광해군(이원익)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 김육(경기 → 전국)|戶 → 土: 1결 12두 or 동전, 포|→ <i>선혜청</i> └ <em>공인</em> → 상품 화폐 경제'] },
      { label: '역', cells: ['군역 → 요역|<em>대립</em>, <i>방군수포</i>(1년 2필)', '<u>균역법</u>(영조): <i>1년 1필</i>|부족분 ┬ 어 · 염 · 선박세|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 선무군관포|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 결작(1결 2두)'] },
      { label: '〈농업〉', cells: [{ html: '', span: 2 }] },
      { label: '밭', cells: ['2년 3작', '<em>상품 작물</em> → 담배, 인삼, 면화 …'] },
      { label: '논', cells: ['<em>직파법</em>|<i>이앙법</i> △ (남부 일부)', '이앙법 O (<u>전국</u>)|· 이모작, <b>광작</b>|· 생산력↑, 노동력↓'] },
      { label: '지대', cells: ['<i>타조법</i>(1/2) └ 신분', '타조법 + <i><em>도조법</em></i> └ 계약'] },
      { label: '농서', cells: ['〈농사직설〉, 〈금양잡록〉', '〈농가집성〉, 〈색경〉'] },
      { label: '〈상업〉', cells: [{ html: '', span: 2 }] },
      { label: '관허 상인', cells: ['· 시전 상인(<b>육의전</b>, 종로)|· <i>보부상</i>(지방 장시) → 혜상공국 → 황국 협회', '· <em>공인</em>(대동법)|· 금난전권 → 정조 X(<em>신해통공</em>)|· 전국적 유통망|⇒ <b>도고</b>(〈허생전〉)'] },
      { label: '사상', cells: ['—', '· 거상(송상 → <em>송방</em>)|· <em>객주</em>(중개), 여각(숙박)|· 난전: 영세 상인|· 의주 <b>만상</b> · 개성 <b>송상</b> · 동래 <b>내상</b> · 경강상인(선상)|· 후시(사) · 개시(공): 책문 · 중강 · 경원 · 회령|· 장시: 송파, 원산, 강경장'] },
      { label: '화폐', cells: ['저화(지폐) — X', '<em>상평통보</em>(숙종), <em>전황</em>(물가↓, 디플레이션)'] },
      { label: '〈수공업 · 광업〉', cells: [{ html: '<small class="memo">1592 전후 <b>부역제 해이</b> → 민영화</small>', span: 2 }] },
      { label: '수공업', cells: ['관영 → 공장안', '· 민영, <u>선대</u>제|&nbsp;&nbsp;↓|· 독립 수공업'] },
      { label: '광업', cells: ['관영', '· 민영(은광↑)|· <em>설점수세</em> → 잠채|· <u>덕대</u>(CEO): 거상 → 자본, 노동자 → 고용'] },
    ],
  },
  {
    id: 'joseon-late-society',
    era: 'gaehang',
    title: '조선 후기의 사회 — 신분제 동요 · 민 의식 · 농민 봉기',
    images: ['notes/img/joseon-soc2-181.webp', 'notes/img/joseon-soc2-182.webp', 'notes/img/joseon-soc2-183.webp', 'notes/img/joseon-soc2-184.webp'],
    head: [{ label: '', cells: ['〈신분제 동요〉: <u>양반 수↑, 상민 · 노비 수↓</u>'] }],
    rows: [
      { label: '원인', cells: ['양난 → 양안 X(토지), 호적 X(사람) → 국가 재정↓|→ <u><em>납속책</em>(공명첩)</u> └ 양반: 군역 X'] },
      { label: '양반', cells: ['권반 · 향반 · 잔반(몰락 양반)|<b>향전</b>: <em>구향</em>(보학·족보, 사당↑, 동성촌, 가부장 — 여성↓) vs <em>신향</em>(지방관 결탁 └ 향안 X)'] },
      { label: '중인', cells: ['· <b>서얼</b>: 신분 상승 상소 → <i>규장각 검서관</i>(박제가, 유득공 …)|· 기술직 중인: 소청 X, <em>시사 조직</em> ⇝ 위항(여항) 문학↑'] },
      { label: '상민', cells: ['· 부농: 족보 매입·위조, 납속책 → 양반|· 임노동자'] },
      { label: '천민', cells: ['노비 多 ⇒ 도망, <i>양인화</i> ┬ 노비종모법|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>공노비 해방(순조)</em>'] },
      { label: '民 의식', cells: ['· 예언 사상↑: 〈정감록〉, 도참, 미륵 신앙↑|· <i>평등 의식</i>↑|&nbsp;&nbsp;├ <u>서학</u>(학문) → 천주교(종교, 제사 X → 사교)|&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;신해박해(정조): 윤지충 · 신유박해(순조): 이승훈, 정약용 · <em>황사영 백서 사건</em>|&nbsp;&nbsp;└ <u>동학</u>(최제우 → 최시형): <em>인내천, 시천주</em>, 〈동경대전〉, 〈용담유사〉'] },
      { label: '농민 봉기', cells: ['<table class="mini"><tr><th></th><th><u>{{홍경래의 난}}</u></th><th><u>{{임술 농민 봉기}}</u></th></tr><tr><th>왕</th><td>순조</td><td>철종</td></tr><tr><th>주도</th><td>홍경래, 우군칙 + 광산, 농민</td><td>백낙신 ↔ 유계춘 (진주 → 전국)</td></tr><tr><th>원인</th><td>세도 정치, <em>서북 지역민 차별</em></td><td>세도 정치, <em>삼정의 문란</em></td></tr><tr><th>장소</th><td>정주성</td><td>진주</td></tr></table>|대응: 안핵사 파견 ↓ 박규수 → <u><em>삼정이정청</em></u>, 암행어사'] },
    ],
  },
  {
    id: 'joseon-silhak',
    era: 'gaehang',
    title: '양명학 · 실학',
    images: ['notes/img/joseon-silhak-185.webp', 'notes/img/joseon-silhak-186.webp', 'notes/img/joseon-silhak-187.webp'],
    head: [
      { label: '', cells: [{ html: '〈양명학〉 실천, 지행합일 — <u>정제두</u> ⇒ 강화 학파|〈실학〉 실사구시, 민족 · 자주적 ⇒ <b>국학</b>', span: 2 }] },
      { label: '구분', cells: ['<em>중농학파</em>(경세치용 학파)', '<em>중상학파</em>(이용후생 학파, <b>북</b>학파 → 청)'] },
    ],
    rows: [
      { label: '주장', cells: ['토지 분배 → 자영농 육성', '토지 생산력↑, 상공업↑, 청 문물 수용'] },
      { label: '인물', cells: [
        '· 유형원 〈반계수록〉 → <u>균전론</u>(신분 차이 O)|· 이익 〈성호사설〉 → <u>한전론</u>(영업전 매매 X)|&nbsp;&nbsp;→ 6좀: 양반, 과거, 노비, 승려, 미신, 게으름|· <i>정약용</i> 〈경세유표〉, 〈흠흠신서〉, 〈목민심서〉|&nbsp;&nbsp;→ <u>여전론</u>: 공동 소유 · 공동 경작 → 노동량에 따라 분배|&nbsp;&nbsp;→ <u>정전제</u>: 9등분 중 가운데 1구역 공동 경작',
        '· 유수원 〈우서〉 → 사농공상 X ⇝ 직업적 평등|· 홍대용 〈임하경륜〉, 〈의산문답〉|&nbsp;&nbsp;→ 문벌제도 X, 혼천의, <em>지전설, 무한 우주론</em>|· <i>박지원 〈열하일기〉</i> → 수레, 선박, 화폐 O|· <i>박제가 〈북학의〉</i> → 수레, 선박, <u><b>소비론</b></u>',
      ] },
    ],
  },
  {
    id: 'joseon-gukhak',
    era: 'gaehang',
    title: '국학의 발달',
    images: ['notes/img/joseon-silhak-188.webp', 'notes/img/joseon-silhak-189.webp'],
    head: [{ label: '구분', cells: ['내용'] }],
    rows: [
      { label: '역사', cells: ['· 안정복 〈동사강목〉: 정통성 ┐|· 한치윤 〈해동역사〉: <em>외국 문헌 인용</em> ┘ 고조선 ~ 고려|· 김정희 〈금석과안록〉: 북한산비 → <em>진흥왕 순수비</em>, <i>추사체</i>, 세한도(제주)|· 이종휘 〈동사〉: 고구려 ┐|· 유득공 <em>〈발해고〉</em>: 남북국 ┘ <em>만주로 시야 확대</em>|· 이긍익 〈연려실기술〉: 조선사'] },
      { label: '지리서', cells: ['· 역사: 한백겸 〈동국지리지〉, 정약용 〈아방강역고〉|· 인문: <u>이중환 〈택리지〉</u> <small class="memo">(상업적 활용)</small>'] },
      { label: '지도', cells: ['· 정상기 〈동국지도〉: <em>최초로 100리 척 사용</em>|· 김정호 <u>〈대동여지도〉</u>: 목판, 지도첩'] },
      { label: '백과사전', cells: ['· 이수광 〈지봉유설〉, 이익 〈성호사설〉, 서유구 〈임원경제지〉|· <em>〈동국문헌비고〉</em>: 영조 ~ 정조'] },
      { label: '한글', cells: ['신경준 〈훈민정음운해〉'] },
    ],
  },
  {
    id: 'joseon-late-science',
    era: 'gaehang',
    title: '조선 후기 과학 기술의 발달',
    images: ['notes/img/joseon-late-cul-190.webp'],
    head: [{ label: '구분', cells: ['내용'] }],
    rows: [
      { label: '서양 문물', cells: ['<u>곤여만국전도</u>(세계 지도) → <em>성리학적 세계관 X</em>'] },
      { label: '천문학', cells: ['<em>시헌력</em>(김육, 서양 역법), 지전설(김석문, 이익, 홍대용)'] },
      { label: '의학', cells: ['· <em>〈동의보감〉</em>: 허준, 광해군|· 〈침구경험방〉: 허임|· 〈마과회통〉: <em>정약용</em>, 종두법(천연두) ⇝ 을미개혁|· 〈동의수세보원〉: 이제마 → <b>사상 의학</b>'] },
      { label: '농서', cells: ['· <em>〈농가집성〉</em>: 신속, 모내기법(이앙법)|· 〈색경〉: 박세당(← 사문난적), 상품 작물|· 〈임원경제지〉: 서유구, 백과사전'] },
    ],
  },
  {
    id: 'joseon-seomin',
    era: 'gaehang',
    title: '서민 문화의 발달',
    images: ['notes/img/joseon-late-cul-191.webp', 'notes/img/joseon-late-cul-192.webp'],
    head: [{ label: '', cells: ['배경: 상품 화폐 경제↑, 서당 교육↑ · 특징: <b>해학, 풍자(비판)</b>'] }],
    rows: [
      { label: '판소리', cells: ['창 + 사설 = <em>신재효</em> 정리'] },
      { label: '탈춤', cells: ['탈 · 산대놀이'] },
      { label: '문학', cells: ['· <u>한글 소설</u>: 〈홍길동전〉, 〈춘향전〉, 〈심청전〉 → 책쾌, 전기수|· 사설시조: 형식 파괴'] },
      { label: '한문학', cells: ['· 박지원: 〈양반전〉, 〈허생전〉, 〈호질〉 ⇐ 정조 <em>\'문체반정\'</em>|· 중인: 시사 조직'] },
      { label: '회화', cells: ['· <u>진경 산수화</u>: 겸재 정선, \'인왕제색도\', \'금강전도\'|· <u>풍속화</u>: 단원 김홍도, 혜원 신윤복, 강세황(\'영통동구도\' → 서양화 기법), 장승업|· <u>민화</u>: 까치와 호랑이|· 추사체: 김정희(\'세한도\')'] },
      { label: '건축', cells: ['· 17C – 양반, 지주: 구례 화엄사 각황전, 김제 금산사 미륵전(← 견훤 유폐), 보은 법주사 팔상전(현존 유일 조선 목탑)|· 18C ┬ 부농, 상인: 논산 쌍계사, 부안 개암사|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <u>정조</u>: <u>수원 화성</u>(정약용 – 거중기, 배다리)'] },
    ],
  },
  {
    id: 'daewongun-internal',
    era: 'gaehang',
    title: '흥선 대원군의 대내 정책',
    images: ['notes/img/daewongun-193.webp', 'notes/img/daewongun-194.webp'],
    head: [{ label: '', cells: ['19C 문제', '흥선 대원군(고종 父)의 대응'] }],
    rows: [
      { label: '왕권 강화', cells: [
        '<b>정치</b>: 세도 정치',
        '· <u>비변사 X</u> = 의정부(행정) + 삼군부(군사)|· 〈대전회통〉, 〈육전조례〉|· <u>경복궁 중건</u> ⇐ <em>원납전, 당백전, 묘지림</em> 벌목|· <u>서원↓</u>(47개소), 만동묘 X',
      ] },
      { label: '민생 안정', cells: [
        '<b>경제</b>: <i>삼정 문란</i>|&nbsp;&nbsp;└ 삼정이정청 X (by 박규수)',
        '· 전정: 양전 사업 ⇝ 재정↑|· 군정: <u>호포제</u> → 양반 O|· 환곡(공무원): <em>사창제</em>(민간)',
      ] },
      { label: '반발', cells: [{ html: '경복궁 중건 · 서원 철폐 · 호포제 → 양반 반발 → <em>최익현 탄핵 상소</em> → 고종 친정(1873)|&nbsp;&nbsp;└ 최익현: 이후 개항 X(왜양일체론), 을사의병', span: 2 }] },
    ],
  },
  {
    id: 'daewongun-external',
    era: 'gaehang',
    title: '흥선 대원군의 대외 정책 — 통상 수교 거부',
    images: ['notes/img/daewongun-195.webp', 'notes/img/daewongun-196.webp'],
    head: [{ label: '', cells: ['19C 서세동점, 이양선 多 → 통상 수교 <b>거부</b> (순서 ①~⑤)'] }],
    rows: [
      { label: '① 병인박해(66)', cells: ['프랑스 천주교 선교사 X'] },
      { label: '② 제너럴 셔먼호 사건(66)', cells: ['{{제너럴셔먼호 사건|평양}}, 미국 — 박규수'] },
      { label: '③ 병인양요(66)', cells: ['강화도(프) ← ①|<u>양헌수({{정족산성}})</u>, 한성근({{문수산성}}, 김포)|<em>외규장각 도서 약탈</em>(→ 박병선)'] },
      { label: '④ 오페르트 도굴(68)', cells: ['{{오페르트 도굴 사건|남연군 묘}}(흥선 대원군 父) 도굴 시도 — 독일, 충청도 덕산'] },
      { label: '⑤ 신미양요(71)', cells: ['강화도(미) ← ②|<u>어재연({{광성보}})</u>|<em>수자기 약탈</em>|→ <b>척화비 건립</b>'] },
    ],
  },
  {
    id: 'ganghwa-treaty',
    era: 'gaehang',
    title: '강화도 조약(1876)과 부속 조약',
    images: ['notes/img/gaehang-197.webp'],
    head: [{ label: '', cells: [{ html: '박규수 / 유홍기 + 오경석(〈해국도지〉, 〈영환지략〉 = 중인) → 통상 개화파↑|흥선 대원군 X → <b>고종 + 민씨</b> — {{운요호 사건}}(75) → 서계, 정한론, 강화도', span: 2 }] }],
    rows: [
      { label: '강화도 조약', cells: [{ html: '<em>강화도 조약</em>(76) = 조 · 일 수호 조규 <small class="memo">(일본 전권: 구로다, 신헌)</small>|· 조선 = 자주국 → <em>청 종주권 X</em>|· {{부산 개항|부산}} + 2α ({{원산 개항|원산}} – 80, {{인천(제물포) 개항|인천}} – 83)|· <u>불평등</u> ┬ 해안 측량권|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 영사 재판권(= 치외 법권)|· <u>최초의 근대적 조약</u>, 최혜국 대우 X', span: 2 }] },
      { label: '부속 조약', cells: ['<b>조 · 일 무역 규칙</b>|<b>3無</b> ┬ 관세 X (→ 무관세)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 항세 X (일본 정부 소속 선박)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 곡물 유출 제한 X', '<b>조 · 일 수호 조규 부록</b>|· 개항장 → 日 화폐 O|· <i>개항장 무역</i> └ 내지 무역 X|&nbsp;&nbsp;→ 일본인 활동 범위 개항장 10리 이내 · 보부상, 객주 중개'] },
      { label: '반발', cells: [{ html: '통상 수교 반대 → <em>개항 반대</em> (위정척사)', span: 2 }] },
    ],
  },
  {
    id: 'gaehwa-policy',
    era: 'gaehang',
    title: '개화 정책 · 개화파 · 위정척사파',
    images: ['notes/img/gaehang-198.webp'],
    head: [{ label: '', cells: ['개화 정책'] }],
    rows: [
      { label: '기구·군대', cells: ['· <u>통리기무아문 – 12사</u>|· 별기군(신식 군대, by 日), 5군영 → 2영 ⇝ <b>임오군란</b>'] },
      { label: '사절단', cells: ['┬ <em>영선사(청)</em>: 무기 → 기기창|├ <em>수신사(일)</em>: <i>김홍집</i> └ 〈조선책략〉 by 황준헌 └ <u>방러 = 연미</u>|└ <em>조사 시찰단(일)</em>: 암행어사 = 신사 유람단'] },
      { label: '개화파', cells: ['┬ <b>온건파</b>: 청, 양무운동 → <em>동도서기</em>, 김홍집|└ <b>급진파</b>: 일, 메이지 유신 → <em>문명개화</em>, 김옥균'] },
      { label: '위정척사파', cells: ['성리학 → <b>위정척사파</b> → 통상 수교 반대 → 개항 반대 → 개화 반대(<em>영남 만인소</em> ← 〈조선책략〉) ⇝ 의병'] },
    ],
  },
  {
    id: 'imo-gapsin',
    era: 'gaehang',
    title: '임오군란(1882) vs 갑신정변(1884)',
    images: ['notes/img/gaehang-199.webp', 'notes/img/gaehang-200.webp'],
    head: [{ label: '', cells: ['임오군란(1882)', '갑신정변(1884)'] }],
    rows: [
      { label: '원인·주도', cells: ['· <em>구식 군인 차별</em> + 흥선 대원군 ⇒ 명성 황후 피신', '· 김옥균, 박영효, 홍영식, 서광범, 서재필 → <b>위로부터의 개혁</b>|· 차관 X, 청 병력 일부 철수|· <em>우정총국</em> → 창덕궁'] },
      { label: '내용', cells: ['—', '· <i>개혁 정강</i>|&nbsp;&nbsp;경: <u>재정 일원화(호조)</u>, <u>지조법</u>(토지 분배 X)|&nbsp;&nbsp;사: <u>신분제 X</u>, 혜상공국 X(보부상), 규장각 X|· <b>삼일천하</b>: 일 ↔ 청'] },
      { label: '청', cells: ['<em>청 진압</em> ┬ 내정 간섭↑ (고문 파견: 묄렌도르프(독) – 외교, 재정)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <em>조 · 청 상민 수륙 무역 장정</em>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ <u>내지 무역 O</u>, 치외 법권', '<em>청 진압</em> ┬ 내정 간섭↑|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ <u>톈진 조약</u>(청 · 일 철수, 파병 시 통보)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ 동학 농민 운동 때 청 · 일 전쟁'] },
      { label: '일본', cells: ['· <em>제물포 조약</em>: <u>일본 군대 O</u>(공사관 경비)|· 조 · 일 수호 조규 속약: 내지 무역↑', '· <em>한성 조약</em>: 배상금 지불, 공사관 신축'] },
    ],
  },
  {
    id: 'after-gapsin',
    era: 'gaehang',
    title: '갑신정변 이후의 정세 (1884 ~ 1894)',
    images: ['notes/img/gaehang-201.webp'],
    head: [{ label: '', cells: ['갑신정변↓ 이후'] }],
    rows: [
      { label: '外', cells: ['· 영국: <u>{{거문도 사건|거문도 불법 점령}}</u> └ <b>중립론</b> ┬ 유길준 〈서유견문〉|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 부들러(독)|· 청: 내정 간섭↑|· 일: <i>미면 교환</i> ⇣ → <b>反외세</b>'] },
      { label: '內', cells: ['· 쌀값 폭등|· <i>조세 부담↑</i> ┬ 전신(85), 전등(87) – 경복궁|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 육영 공원(86)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ 광혜원 → 제중원(85)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 박문국 → 한성순보(83)|→ <b>反봉건</b>'] },
      { label: '결과', cells: ['反외세 + 反봉건 + 포접제 → <b>동학 농민 운동(1894)</b>'] },
    ],
  },
  {
    id: 'donghak-1894',
    era: 'gaehang',
    title: '동학 농민 운동(1894)',
    images: ['notes/img/gaehang-202.webp', 'notes/img/gaehang-203.webp'],
    head: [{ label: '', cells: ['〈1차〉: 반외세 &lt; <b>반봉건</b>', '〈2차〉: <b>반외세</b> &gt; 반봉건'] }],
    rows: [
      { label: '전개', cells: [
        '<i>교조 신원 운동</i> (복합 상소)|↓|{{고부 봉기}}: 조병갑(만석보), 전봉준|↓|<i>백산 봉기</i>: 이용태|↓|{{황토현 전투|황토현}} · 황룡촌 전투|↓|{{전주성 · 전주 화약|전주성 점령}}|&nbsp;&nbsp;→ 청 출병 – 톈진 조약(갑신정변) – 일 파병|↓|<em>전주 화약</em> └ <u>폐정 개혁(집강소)</u> – 교정청(정부)|&nbsp;&nbsp;&nbsp;&nbsp;– 신분제 X|&nbsp;&nbsp;&nbsp;&nbsp;– 토지 균분, 과부 재가',
        '<b>경복궁 점령</b>(일) → 청 · 일 전쟁 → 갑오개혁|↓|남 · 북접 연합|↓|<u>{{우금치 전투}}(공주)</u>|&nbsp;&nbsp;↑ 군국기무처 진압',
      ] },
    ],
  },
  {
    id: 'gabo-eulmi',
    era: 'gaehang',
    title: '갑오개혁(1894) · 을미개혁(1895)',
    images: ['notes/img/gaehang-204.webp', 'notes/img/gaehang-205.png'],
    head: [{ label: '', cells: ['내용'] }],
    rows: [
      { label: '1차 갑오', cells: ['· <u>군국기무처</u>, 김홍집 + 흥선 대원군|· 정: 의정부 <i>8아문</i>, 궁내부, <em>개국 기원</em>|· 경: 도량형 통일, <em>재정 일원화(탁지아문)</em>, 조세 금납화, <em>은(금 X) 본위제</em>|· 사: <u>신분제 X</u>, <u>과부 재가 O</u>, <em>과거제 X</em>'] },
      { label: '2차 갑오', cells: ['· <em>독립 서고문, 홍범 14조</em>(종묘), <b>박영효</b> + 김홍집|· 정: 중앙 내각 7부, 지방 8도 → 23부, <u>재판소</u>(지방관↓)|· 사: <i>교육 입국 조서</i>(근대 학제) — 소학교 ⋯ 중학교, 사범 학교, 외국어 학교'] },
      { label: '배경', cells: ['청 · <b>일</b> 전쟁 → <u>시모노세키 조약</u>(조선 독립, <i>요동 반도 O</i>)|→ 삼국 간섭(러 · 프 · 독) → <em>을미사변</em>: 명성 황후 X'] },
      { label: '을미개혁', cells: ['· 연호: 건양|· <u>단발령</u>|· 태양력|· 종두법'] },
    ],
  },
  {
    id: 'dongnip-daehan',
    era: 'gaehang',
    title: '독립 협회와 대한 제국',
    images: ['notes/img/gaehang-206.webp', 'notes/img/gaehang-207.webp'],
    head: [{ label: '', cells: ['아관 파천(96) → 대한 <b>제국</b>(97) — 환구단(황궁우)'] }],
    rows: [
      { label: '독립 협회', cells: ['① <i>독립신문</i> → ② <em>독립 협회</em> → ③ 독립문 (by 서재필)|<em>만민 공동회</em>: <i>러시아 절영도 조차 X</i>, 한 · 러 은행 X|↓|<em>관민 공동회</em>: <i>박정양(관) + 윤치호(민)</i>|&nbsp;&nbsp;<u>헌의 6조</u> ┬ 입헌 군주제 지향|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├ <em>재정 일원화(탁지부)</em>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 피고 인권 O|↓ 중추원 관제(의회)|<b>해산</b> ← 황국 협회(보부상)'] },
      { label: '광무개혁', cells: ['· <b>구본(동도)</b>: <i>황제↑</i> ┬ <u>대한국 국제(99)</u>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 원수부|· <b>신참(서기)</b>: <i>양전 사업</i> → <u>지계 발급</u>(근대 토지 소유권), 상공업↑, 기술 학교 O, 전차, <em>경인선(최초)</em>'] },
    ],
  },
  {
    id: 'gukgwon-pital',
    era: ['gaehang', 'colonial'],
    title: '개항 ~ 국권 피탈 흐름',
    images: ['notes/img/gaehang-208.webp', 'notes/img/gaehang-209.webp', 'notes/img/gaehang-210.png'],
    head: [{ label: '', cells: ['흐름', '내용'] }],
    rows: [
      { label: '개항기', cells: [{ html: '강화도 조약(76) — 임오군란(82) — 갑신정변(84) — 동학 농민 운동(94) — 갑오 · 을미개혁 — 아관 파천 — 대한 제국|<small class="memo">↑ 위정척사: 최익현(개항 반대, 강화도 조약) · 영남 만인소(〈조선책략〉 반대) · 을미의병(을미개혁)</small>', span: 2 }] },
      { label: '러 · 일 전쟁(04)', cells: ['← 러시아 용암포 조차(03)', '· <em>한 · 일 의정서</em>: 군용지 free|· <i>1차 한 · 일 협약</i>: <b>고문</b> ┬ 메가타(재정)|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└ 스티븐스(외교)'] },
      { label: '을사늑약(05)', cells: ['<i>2차 한 · 일 협약</i>', '<em>외교권 X</em>, <b>통감</b>(부) 설치'] },
      { label: '헤이그 특사(07)', cells: ['이준 · 이위종 · 이상설 (+ 헐버트, 미국)', '→ 고종 X (강제 퇴위), <b>순종 O</b>(융희)'] },
      { label: '정미 7조약(07)', cells: ['<i>한 · 일 신협약</i>', '<em>군대 X</em>(해산), <b>차관</b> 정치'] },
      { label: '기유각서(09)', cells: ['—', '<em>사법권 X</em>'] },
      { label: '국권 피탈', cells: ['경술국치', '<b>1910. 8. 29</b>'] },
    ],
  },
  {
    id: 'aeguk-gyemong',
    era: ['gaehang', 'colonial'],
    title: '애국 계몽 운동',
    images: ['notes/img/gaehang-211.webp', 'notes/img/gaehang-212.webp'],
    head: [{ label: '', cells: ['<b>애국 계몽 운동</b> → 사회 진화론(실력↑ – 교육, 언론, 식산흥업)', '관련 사건'] }],
    rows: [
      { label: '1. 보안회', cells: ['<em>日 황무지 개간권 X</em> └ 농광 회사 with', '러 · 일 전쟁(04) 무렵'] },
      { label: '2. 헌정 연구회', cells: ['· 입헌 군주제|· 일진회 비판|· 을사늑약 반대', '을사늑약(05)'] },
      { label: '3. 대한 자강회(06)', cells: ['← 헌정 연구회 계승, 전국 <b>지회</b>, <b>월보</b>|· <i>고종 퇴위 반대</i> ← <b>보안법</b>으로 해산', '헤이그 특사 → 고종 X(07)'] },
      { label: '4. 신민회(07)', cells: ['· 안창호, 양기탁 → <b>비밀 결사</b> → 105人 사건으로 X(11)|· 대성 · 오산 학교 / 자기 회사, 태극 서관|· <u>공화정</u>, <u>국외 독립운동 기지</u>({{삼원보|서간도 삼원보}})', '→ 실력 양성'] },
    ],
  },
  {
    id: 'uibyeong',
    era: ['gaehang', 'colonial'],
    title: '위정척사 → 항일 의병 · 의열 투쟁',
    images: ['notes/img/gaehang-213.webp', 'notes/img/gaehang-214.webp', 'notes/img/gaehang-215.webp'],
    head: [{ label: '', cells: ['의병', '의열 투쟁 · 관련 사건'] }],
    rows: [
      { label: '위정척사', cells: ['<b>위정척사</b>(성리학 O) → 의병|· 최익현 <em>도끼</em> 상소 → 강화도 조약(76) 반대|· <em>영남 만인소</em> → 〈조선책략〉 반대(81 ~ 82)', '—'] },
      { label: '을미의병', cells: ['· 배경: <em>을미사변, 단발령</em>|· 유인석, 이소응 ⇒ <i>양반 유생</i>|· <u>고종의 해산 권고</u>로 해산', '← 갑오 · 을미개혁'] },
      { label: '을사의병', cells: ['· 배경: 을사늑약|· 최익현, 민종식|· <u>신돌석(평민 의병장)</u>', '민영환 X(자결), <u>장지연 \'시일야방성대곡\'(황성신문)</u>, 오적 암살단(나철, 오기호) → 을사늑약(05) 저항'] },
      { label: '정미의병', cells: ['· <u>군대 해산</u>(박승환 자결) ⇝ <em>의병 전쟁</em>|· <u>13도 창의군 ⇒ 서울 진공 작전</u>(이인영, 허위)|· 국제법상 교전 단체 요구', '← 한 · 일 신협약(정미 7조약) 군대 X|전명운, 장인환 → <b>스티븐스 X</b>(08)|안중근 → <b>이토 X</b>(09) → 의열'] },
      { label: '이후', cells: ['<em>호남 의병</em> ← \'남한 대토벌\' 작전 → <b>항일 무장 투쟁</b>으로', '—'] },
    ],
  },
  {
    id: 'econ-invasion',
    era: ['gaehang', 'colonial'],
    title: '열강의 경제 침탈과 경제적 구국 운동',
    images: ['notes/img/gaehang-216.webp', 'notes/img/gaehang-217.webp', 'notes/img/gaehang-218.webp', 'notes/img/gaehang-219.webp', 'notes/img/gaehang-220.webp', 'notes/img/gaehang-221.webp', 'notes/img/gaehang-222.png'],
    head: [{ label: '', cells: ['침탈', '저항 · 대응'] }],
    rows: [
      { label: '강화도 조약', cells: ['· 개항장 무역 ⇒ <u>내지 무역 X</u> └ 전통 상인↑(보부상 · 객주 · 여각)|· 관세 X → 가내 수공업↓, 최혜국 대우 X|· 무제한 곡물 유출', '—'] },
      { label: '임오군란', cells: ['· <b>조 · 청 상민 수륙 무역 장정</b>: 내지 무역 <u>O</u> → 청 ↔ 일 경쟁|· <b>조 · 일 통상 장정(83)</b>: 관세 O, <em>방곡령</em> 규정|· <b>조 · 미 수호 통상 조약(82)</b> ← 〈조선책략〉(방러 ⇒ 연미)|&nbsp;&nbsp;– 거중 조정, <u>관세 O</u>, <em>최혜국 대우 O</em>(최초) → 보빙사(유길준 〈서유견문〉)', '<b>상회사</b>: 주식회사 ⇒ 대동 상회, 장통 회사(83)'] },
      { label: '갑신 ↓ 동학 ↑', cells: ['곡물 유출↑', '<b>방곡령 사건</b>: 함경, 황해(89 ~) · 지방관 시행 · X, <em>배상금 O</em>'] },
      { label: '갑오 · 을미', cells: ['—', '<b>은행 설립</b>: 조선 은행(96), 한성 은행(97), 천일 은행(99)'] },
      { label: '아관 파천', cells: ['<i>이권 침탈 절정</i>|· 러: 삼림 채벌, 절영도 조차, 한 · 러 은행|· 미: 운산 금광, 경인선(→ 日)|· 프: 광산 채굴, 경의선(→ 日)', '<b>이권 수호 운동</b>: <u>독립 협회(만민)</u> — 절영도 조차 X, 한 · 러 은행 X|<b>상권 수호 운동</b>: <u>황국 중앙 총상회</u>(by 시전 상인), 철시'] },
      { label: '러 · 일 전쟁', cells: ['<i>대한 시설 강령</i>, <i>황무지 개간 요구</i>', '<b>황무지 개간 반대</b>: 보안회, 농광 회사 → 성공(O)'] },
      { label: '을사늑약', cells: ['<b>화폐 정리 사업</b>(by 메가타)|· 백동화 → <em>제일 은행권</em> → 은행 · 상업 자본 타격|· 전환국 X, <u>금(은 X) 본위제</u>|→ <b>차관</b>', '—'] },
      { label: '정미 7조약 ~', cells: ['동양 척식 주식회사(08)', '<b>국채 보상 운동(07)</b>: 나랏빚 1,300만 원, 서상돈 · <u>대구</u>, 대한매일신보 지원'] },
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
  '조선의 중앙 통치 조직': { src: 'notes/img/artifacts/joseon-central.png', caption: '조선의 중앙 통치 조직 — 의정부 · 6조, 승정원, 의금부, 3사(사헌부 · 사간원 · 홍문관), 한성부, 춘추관, 성균관' },
  '2성 6부': { src: 'notes/img/artifacts/goryeo-2seong6bu.png', caption: '고려의 2성 6부 제도 — 중서문하성 · 상서성(6부) · 중추원 · 어사대 · 삼사 + 도병마사 · 식목도감' },
  '각저총': { src: 'notes/img/artifacts/gakjeochong.webp', caption: '각저총 서역인 — 고구려 고분 벽화 속 서역인(씨름하는 인물), 서역과의 교류' },
  '원성왕릉': { src: 'notes/img/artifacts/wonseong-tomb-statue.webp', caption: '원성왕릉(괘릉) 무인상 — 서역인 모습, 통일 신라와 서역(아라비아)의 교류' },
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
