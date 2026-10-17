/*
 * Firebase 웹 앱 설정 — Firebase 콘솔 › 프로젝트 설정 › 내 앱 › 'firebaseConfig' 값을 그대로 붙여 넣는다.
 * (이 값들은 공개되어도 되는 앱 식별자이고, 실제 접근 제한은 Firestore 보안 규칙이 한다)
 * null 이면 로그인 버튼이 숨겨지고 기록은 이 브라우저에만 저장된다.
 */
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC6_4ttbXt26FiYntYtmXXM73UQAWC241M',
  authDomain: 'study-notes-80ece.firebaseapp.com',
  projectId: 'study-notes-80ece',
  storageBucket: 'study-notes-80ece.firebasestorage.app',
  messagingSenderId: '241076520650',
  appId: '1:241076520650:web:b1ef550f9e598bf57b1633',
};

/*
 * 구독(유료) 설정 — 설정 방법은 PAYMENT.md
 *   enabled: false 이면 지금처럼 누구나 무료로 쓴다 (서버·결제 설정이 끝나면 true 로)
 *   contentFromStorage: true 이면 문제 이미지·풀이 자료를 Firebase Storage(구독자만 읽기)에서 불러온다
 *   channels: PortOne 콘솔 › 결제 연동 › 채널 관리의 채널 키 (테스트 채널 → 심사 뒤 실연동 채널로 교체)
 */
window.PAYWALL = {
  enabled: false,
  contentFromStorage: false,
  storeId: '',
  channels: { card: '', kakaopay: '', naverpay: '' },
  price: 5000,
  trialDays: 7,
  region: 'asia-northeast3',
};

/*
 * 광고 (Google 애드센스) — 방법은 ADS.md
 *   enabled: 애드센스 승인을 받은 뒤 true 로
 *   client : 애드센스 게시자 ID (ca-pub-로 시작하는 16자리)
 *   slots  : 광고 단위 ID (없으면 자동 광고 단위로 보여 줌)
 */
window.ADS = {
  enabled: false,
  client: '',
  slots: { home: '', list: '', result: '', review: '', map: '' },
};
