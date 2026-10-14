/*
 * 판서 노트는 지도 노트에서 뺐다 (빈 목록으로 둔다)
 */
window.NOTES = [];

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
