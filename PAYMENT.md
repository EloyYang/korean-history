# 구독(유료) 설정 안내

7일 무료 체험 → 월 5,000원 자동 결제 (신용·체크카드 · 카카오페이 · 네이버페이)

- 결제: [PortOne(포트원)](https://portone.io) V2 정기결제(빌링키)
- 서버: Firebase Cloud Functions (`functions/`)
- 콘텐츠 보호: Firebase Storage `content/…` + `storage.rules` (이용 기간 안의 로그인 사용자만 읽기)

`js/firebase-config.js`의 `PAYWALL.enabled`가 `false`인 동안에는 지금처럼 누구나 무료로 쓸 수 있어요. 아래를 모두 마친 뒤 `true`로 바꿔요.

---

## 1. Firebase 준비 (콘솔에서 직접)

1. **Firestore 데이터베이스 만들기**: 콘솔 › Firestore Database › 데이터베이스 만들기 (위치 `asia-northeast3` 서울). 학습 기록 동기화에도 필요해요.
2. **Storage 시작하기**: 콘솔 › Storage › 시작하기 (같은 위치).
3. **요금제 Blaze(종량제)로 전환**: Cloud Functions를 쓰려면 필요해요. 이 정도 규모는 대부분 무료 사용량 안에 들어가요. 예산 알림을 꼭 걸어 두세요.
4. **Firebase CLI 설치·로그인** (터미널):

```bash
npm install -g firebase-tools
```

```bash
firebase login
```

## 2. PortOne 준비

1. PortOne 가입 → **상점 ID** (`store-…`) 확인
2. 결제 연동 › 채널 관리에서 **테스트 채널** 3개 추가
   - 신용카드 정기결제: KG이니시스 또는 토스페이먼츠 (빌링 지원 PG)
   - 카카오페이 정기결제
   - 네이버페이 정기결제
3. 결제 연동 › API Keys › **V2 API Secret** 발급
4. 실제 결제로 바꿀 때: 사업자등록 · 통신판매업 신고 후 각 PG사 심사 → 실연동 채널 키로 교체

> 네이버페이·카카오페이 정기결제는 PG사별 추가 파라미터가 필요할 수 있어요. 테스트 채널에서 결제 수단 등록이 실패하면 PortOne 문서의 해당 PG 정기결제 항목을 확인해 `js/sub.js`의 `requestIssueBillingKey` 호출에 맞춰 넣어요.

## 3. 서버 배포

```bash
firebase functions:secrets:set PORTONE_API_SECRET
```

`functions/.env` 파일을 만들고 상점 ID를 넣어요 (이 파일은 저장소에 올리지 않음):

```
PORTONE_STORE_ID=store-xxxxxxxx
SUB_PRICE=5000
TRIAL_DAYS=7
```

```bash
cd functions && npm install && cd ..
```

```bash
firebase deploy --only functions,firestore,storage
```

배포되는 것: `startTrial`(체험 시작) · `subscribe`(결제 수단 등록·첫 결제) · `cancel`(해지) · `renew`(매일 09:00 자동 결제, 실패 시 하루 간격 3번 재시도), Firestore/Storage 보안 규칙·색인.

## 4. 콘텐츠를 Storage로 옮기기

1. 콘솔 › 프로젝트 설정 › 서비스 계정 › **새 비공개 키 생성** → JSON 파일을 저장소 **밖**에 보관
2. 업로드:

```bash
cd tools && npm i firebase-admin && GOOGLE_APPLICATION_CREDENTIALS=~/keys/study-notes.json node upload-content.mjs
```

3. Storage CORS 설정 (Google Cloud SDK 필요):

```bash
gcloud storage buckets update gs://study-notes-80ece.firebasestorage.app --cors-file=storage-cors.json
```

4. `js/firebase-config.js`의 `PAYWALL`을 채우고 `enabled: true`, `contentFromStorage: true`로 바꿔 배포
5. 확인한 뒤 공개 저장소에서 원본 파일을 지우고 Git 기록에서도 정리 (Claude에게 요청 — 되돌릴 수 없는 작업이라 따로 확인해요)

## 5. 법적으로 꼭 필요한 것 (직접)

- 사업자등록, 통신판매업 신고
- 구독 화면(`js/subscribe-page.js`의 `plan()`)과 첫 화면에 사업자 정보(상호·대표자·사업자번호·주소·연락처) 표시
- 이용약관, 개인정보처리방침, 환불 정책 (정기결제 해지·환불 기준 명시)
- 자동 결제 전 안내: 체험 종료·결제일 전에 알림(이메일 등)을 보내는 것이 권장돼요

## 동작 요약

| 상황 | 화면 |
|---|---|
| 로그인 안 함 | 잠금 화면 · "Google 계정으로 시작하기" |
| 첫 로그인 | 서버가 7일 체험 시작 (같은 구글 이메일은 한 번만) |
| 체험 중 결제 수단 등록 | 결제 없음 → 체험 끝나는 날 첫 결제 |
| 체험 끝난 뒤 등록 | 바로 5,000원 결제 → 한 달 이용 |
| 해지 | 이미 낸 기간까지 이용, 다음 결제 없음 |
| 자동 결제 3번 실패 | 이용 기간이 끝나면 잠금 · 결제 수단 다시 등록 안내 |
