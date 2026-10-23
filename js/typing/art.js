/*
 * 유물 사진 → 시대 (한능검 심화 기출 문제에 실린 사진을 교재 PDF에서 뽑아 이름을 붙인 것)
 *   name 유물 이름 · era 쳐야 할 시대/나라 · alt 같이 맞다고 볼 답 · img 사진 · info 풀고 난 뒤 설명
 *   사진은 typing/img/ — 새로 넣을 땐 이름·시대를 확인하고 이 목록에 한 줄 추가
 */
window.TY_ART = [
  {"name": "주먹도끼", "era": "구석기", "alt": [], "img": "typing/img/jumeokdokki.webp", "info": "구석기 시대의 뗀석기 — 하나의 도구로 찍고 자르고 긁는 등 여러 용도로 썼어요 (연천 전곡리)"},
  {"name": "빗살무늬 토기", "era": "신석기", "alt": [], "img": "typing/img/bitsalmunui.webp", "info": "신석기 시대의 토기 — 바닥이 뾰족해 모래땅에 꽂아 두고 식량을 저장했어요"},
  {"name": "갈돌과 갈판", "era": "신석기", "alt": [], "img": "typing/img/galdol.webp", "info": "신석기 시대 — 곡식을 갈아 먹을 때 쓴 간석기예요"},
  {"name": "비파형 동검", "era": "청동기", "alt": [], "img": "typing/img/bipahyeong.webp", "info": "청동기 시대 — 악기 비파를 닮은 칼, 고조선의 세력 범위(요령 지방)를 보여 주는 대표 유물이에요"},
  {"name": "반달 돌칼", "era": "청동기", "alt": [], "img": "typing/img/bandal.webp", "info": "청동기 시대 — 벼 이삭을 딸 때 쓴 농기구예요"},
  {"name": "민무늬 토기", "era": "청동기", "alt": [], "img": "typing/img/mnmunui.webp", "info": "청동기 시대의 대표 토기 — 무늬가 없고 바닥이 납작해요"},
  {"name": "백제 금동 대향로", "era": "백제", "alt": [], "img": "typing/img/daehyangno.webp", "info": "백제 — 부여 능산리 고분군 근처에서 출토, 도교와 불교 사상이 함께 표현돼요"},
  {"name": "이불병좌상", "era": "발해", "alt": [], "img": "typing/img/ibulbyeongjwa.webp", "info": "발해 — 동경 용원부 유적에서 출토, 석가불과 다보불이 나란히 앉은 불상이에요 (고구려 양식 계승)"},
  {"name": "영광탑", "era": "발해", "alt": [], "img": "typing/img/yeonggwangtap.webp", "info": "발해 — 벽돌을 쌓아 만든 누각 모양의 전탑, 탑 아래에 지하 공간이 있어 무덤으로 보기도 해요"},
  {"name": "분황사 모전 석탑", "era": "신라", "alt": [], "img": "typing/img/bunhwangsa.webp", "info": "신라 선덕 여왕 때 — 돌을 벽돌 모양으로 다듬어 쌓았어요"},
  {"name": "익산 미륵사지 석탑", "era": "백제", "alt": [], "img": "typing/img/mireuksaji.webp", "info": "백제 무왕 때 — 목탑 양식을 따른 가장 큰 규모의 석탑이에요"},
  {"name": "부여 정림사지 5층 석탑", "era": "백제", "alt": [], "img": "typing/img/jeongnimsaji.webp", "info": "백제 — 부여 정림사 터에 있는 5층 석탑이에요 (사비 시기)"},
  {"name": "불국사 3층 석탑", "era": "통일 신라", "alt": ["신라"], "img": "typing/img/seokgatap.webp", "info": "통일 신라 — 석가탑(무영탑), 탑에서 무구정광대다라니경이 발견됐어요"},
  {"name": "화엄사 사사자 3층 석탑", "era": "통일 신라", "alt": ["신라"], "img": "typing/img/sasaja.webp", "info": "통일 신라 — 네 마리 사자가 탑신을 받치고 있어요 (구례 화엄사)"},
  {"name": "월정사 팔각 9층 석탑", "era": "고려", "alt": [], "img": "typing/img/woljeongsa.webp", "info": "고려 — 송의 영향을 받은 다각 다층 석탑이에요 (평창 월정사)"},
  {"name": "경천사지 10층 석탑", "era": "고려", "alt": [], "img": "typing/img/gyeongcheonsa.webp", "info": "고려 후기 — 원의 영향을 받은 탑, 대리석으로 만들었고 지금은 국립중앙박물관에 있어요"},
  {"name": "신라 금관", "era": "신라", "alt": [], "img": "typing/img/geumgwan.webp", "info": "신라 — 나뭇가지와 사슴뿔 모양을 세운 금관, 돌무지덧널무덤에서 출토돼요"},
  {"name": "경주 포석정", "era": "통일 신라", "alt": ["신라"], "img": "typing/img/poseokjeong.webp", "info": "통일 신라 — 물을 돌려 술잔을 띄우던 곳, 경애왕이 견훤의 습격으로 죽임을 당한 곳이에요 (927)"},
  {"name": "보림사 철조 비로자나불 좌상", "era": "통일 신라", "alt": ["신라"], "img": "typing/img/borimsa.webp", "info": "통일 신라 하대 — 선종이 퍼지며 철불이 유행했어요, 팔에 새긴 글로 만든 때(858)를 알 수 있어요"},
  {"name": "청자 상감 모란무늬 항아리", "era": "고려", "alt": [], "img": "typing/img/cheongja_moran.webp", "info": "고려 — 그릇 표면을 파고 다른 흙을 채워 넣는 상감 기법을 쓴 청자예요"},
  {"name": "청자 투각 칠보무늬 뚜껑 향로", "era": "고려", "alt": [], "img": "typing/img/cheongja_hyangro.webp", "info": "고려 청자 — 무늬를 뚫어 새긴(투각) 향로예요"},
  {"name": "청자 어룡형 주전자", "era": "고려", "alt": [], "img": "typing/img/cheongja_eoryong.webp", "info": "고려 청자 — 용의 머리에 물고기 몸을 한 모양의 주전자예요"},
  {"name": "청자 상감 당초무늬 표주박 모양 주전자", "era": "고려", "alt": [], "img": "typing/img/cheongja_pyohyeong.webp", "info": "고려 청자 — 표주박 모양에 덩굴(당초) 무늬를 상감했어요"},
  {"name": "나전 칠기 합", "era": "고려", "alt": [], "img": "typing/img/najeon.webp", "info": "고려 — 얇게 간 조개껍데기를 박아 장식한 나전 칠기예요"},
  {"name": "수월관음도", "era": "고려", "alt": [], "img": "typing/img/suwol.webp", "info": "고려의 불화 — 물가 바위에 앉은 관음보살을 그렸어요"},
  {"name": "씨름도", "era": "조선 후기", "alt": ["조선"], "img": "typing/img/ssireum.webp", "info": "김홍도 — 단원 풍속도첩의 풍속화, 씨름판 둘레의 구경꾼들을 생생하게 그렸어요"},
  {"name": "파적도", "era": "조선 후기", "alt": ["조선"], "img": "typing/img/jeokdo.webp", "info": "김득신 — 도둑고양이가 병아리를 채 가는 순간을 그린 풍속화예요"},
  {"name": "월하정인", "era": "조선 후기", "alt": ["조선"], "img": "typing/img/wolha.webp", "info": "신윤복 — 달밤에 만나는 남녀를 그린 풍속화예요"},
  {"name": "연소답청", "era": "조선 후기", "alt": ["조선"], "img": "typing/img/yeonso.webp", "info": "신윤복 — 봄나들이 나선 양반 자제와 기생을 그린 풍속화예요"},
  {"name": "매화서옥도", "era": "조선 후기", "alt": ["조선"], "img": "typing/img/maehwa.webp", "info": "조희룡 — 눈 덮인 산속 매화 핀 집을 그린 그림이에요"},
  {"name": "불이선란도", "era": "조선 후기", "alt": ["조선"], "img": "typing/img/buiseonran.webp", "info": "김정희(추사) — 난초 그림에 긴 글씨를 곁들인 문인화예요"},
  {"name": "경복궁 향원정", "era": "조선", "alt": [], "img": "typing/img/hyangwonjeong.webp", "info": "조선 — 경복궁 안 연못 가운데의 정자예요 (고종 때 지은 건청궁 가까이)"},
  {"name": "창덕궁 주합루", "era": "조선", "alt": [], "img": "typing/img/juhamnu.webp", "info": "조선 정조 — 창덕궁 부용지 위에 세운 규장각 건물이에요"}
];
