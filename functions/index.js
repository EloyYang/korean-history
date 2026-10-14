/*
 * 구독 서버 (Firebase Cloud Functions · PortOne V2 정기결제)
 *   - 첫 로그인한 구글 계정에 7일 무료 체험
 *   - 체험이 끝나면 월 5,000원 자동 결제 (신용카드 · 카카오페이 · 네이버페이)
 *   - 화면에서 쓰는 이용 기간은 access/{uid} 에만 쓴다 (클라이언트는 읽기만, 쓰기는 이 서버만)
 *   - 빌링키·결제 내역은 billing/{uid} 에 두고 클라이언트는 읽지도 못한다 (firestore.rules)
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret, defineString, defineInt } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { createHash } from 'node:crypto';

initializeApp();
const db = getFirestore();

const PORTONE_SECRET = defineSecret('PORTONE_API_SECRET'); // PortOne 콘솔 › 결제 연동 › API Keys › V2 API Secret
const STORE_ID = defineString('PORTONE_STORE_ID');          // store-xxxxxxxx
const PRICE = defineInt('SUB_PRICE', { default: 5000 });
const TRIAL_DAYS = defineInt('TRIAL_DAYS', { default: 7 });
const REGION = 'asia-northeast3'; // 서울
const METHODS = ['card', 'kakaopay', 'naverpay'];
const MAX_FAILS = 3;

const DAY = 864e5;
const addMonth = (ms) => { const d = new Date(ms); const day = d.getDate(); d.setMonth(d.getMonth() + 1); if (d.getDate() < day) d.setDate(0); return d.getTime(); };
const ts = (ms) => (ms ? Timestamp.fromMillis(ms) : null);
const ms = (t) => (t ? t.toMillis() : 0);
const emailKey = (e) => createHash('sha256').update(String(e || '').trim().toLowerCase()).digest('hex');

async function portone(path, init = {}) {
  const res = await fetch(`https://api.portone.io${path}`, {
    ...init,
    headers: { Authorization: `PortOne ${PORTONE_SECRET.value()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(body.message || body.type || `PortOne ${res.status}`); e.body = body; e.status = res.status; throw e; }
  return body;
}

// 화면용 이용 정보 (access/{uid}) 를 billing 상태에서 다시 계산해 쓴다
async function syncAccess(uid, b) {
  const until = Math.max(ms(b.trialUntil), ms(b.paidUntil));
  await db.doc(`access/${uid}`).set({
    until: ts(until), trialUntil: b.trialUntil || null, paidUntil: b.paidUntil || null,
    status: b.status || 'trial', method: b.method || null, cardLabel: b.cardLabel || null,
    nextChargeAt: b.status === 'active' ? b.nextChargeAt || null : null,
    lastError: b.lastError || null, updatedAt: FieldValue.serverTimestamp(),
  });
}

function need(req) {
  if (!req.auth) throw new HttpsError('unauthenticated', '로그인이 필요해요.');
  return req.auth;
}

// 1회 결제 (빌링키) — 성공하면 결제 정보를 돌려준다
async function charge(uid, b, reason) {
  const paymentId = `sub-${uid.slice(0, 10)}-${Date.now()}`;
  const amount = PRICE.value();
  const orderName = `시험 공부 노트 월 구독 (${new Date().getFullYear()}.${new Date().getMonth() + 1})`;
  await portone(`/payments/${encodeURIComponent(paymentId)}/billing-key`, {
    method: 'POST',
    body: JSON.stringify({ storeId: STORE_ID.value(), billingKey: b.billingKey, orderName, customer: { id: uid, email: b.email || undefined }, amount: { total: amount }, currency: 'KRW' }),
  });
  // 결제 결과는 반드시 다시 조회해서 확인한다
  const p = await portone(`/payments/${encodeURIComponent(paymentId)}?storeId=${STORE_ID.value()}`);
  const ok = p.status === 'PAID' && p.amount && p.amount.total === amount;
  await db.collection(`billing/${uid}/payments`).doc(paymentId).set({ paymentId, amount, status: p.status, reason, at: FieldValue.serverTimestamp(), pgTxId: p.pgTxId || null });
  if (!ok) throw new Error(`결제가 완료되지 않았어요 (${p.status})`);
  return { paymentId, paidAt: Date.now() };
}

/* 첫 로그인 → 7일 무료 체험 (같은 구글 이메일은 한 번만) */
export const startTrial = onCall({ region: REGION }, async (req) => {
  const { uid, token } = need(req);
  const ref = db.doc(`billing/${uid}`);
  return db.runTransaction(async (tx) => {
    const cur = await tx.get(ref);
    if (cur.exists) return { ok: true, already: true };
    const tref = db.doc(`trials/${emailKey(token.email || uid)}`);
    const used = await tx.get(tref);
    const now = Date.now();
    const trialUntil = used.exists ? used.data().trialUntil : ts(now + TRIAL_DAYS.value() * DAY);
    const b = { uid, email: token.email || null, status: 'trial', trialUntil, createdAt: FieldValue.serverTimestamp() };
    tx.set(ref, b);
    if (!used.exists) tx.set(tref, { trialUntil, at: FieldValue.serverTimestamp() });
    return { ok: true, b };
  }).then(async (r) => { const s = await ref.get(); await syncAccess(uid, s.data()); return { ok: true }; });
});

/* 결제 수단 등록(빌링키) → 체험 중이면 체험 끝날 때 첫 결제, 아니면 바로 결제 */
export const subscribe = onCall({ region: REGION, secrets: [PORTONE_SECRET] }, async (req) => {
  const { uid, token } = need(req);
  const { billingKey, method } = req.data || {};
  if (!billingKey || !METHODS.includes(method)) throw new HttpsError('invalid-argument', '결제 수단 정보가 올바르지 않아요.');
  // 빌링키가 이 상점·이 사용자 것인지 PortOne 에서 확인
  let info;
  try { info = await portone(`/billing-keys/${encodeURIComponent(billingKey)}?storeId=${STORE_ID.value()}`); }
  catch (e) { throw new HttpsError('failed-precondition', '등록한 결제 수단을 확인하지 못했어요.'); }
  if (info.status !== 'ISSUED' || (info.customer && info.customer.id && info.customer.id !== uid)) throw new HttpsError('permission-denied', '다른 사용자의 결제 수단이에요.');
  const card = (info.methods || []).map((m) => (m.card && (m.card.name || m.card.issuer)) || (m.provider) || '').filter(Boolean)[0] || null;

  const ref = db.doc(`billing/${uid}`);
  const snap = await ref.get();
  const b = { ...(snap.exists ? snap.data() : { uid, email: token.email || null, trialUntil: null }) };
  // 예전 빌링키는 지운다
  if (b.billingKey && b.billingKey !== billingKey) await portone(`/billing-keys/${encodeURIComponent(b.billingKey)}?storeId=${STORE_ID.value()}`, { method: 'DELETE' }).catch(() => {});
  Object.assign(b, { billingKey, method, cardLabel: card, status: 'active', failCount: 0, lastError: null });
  const now = Date.now();
  const coveredUntil = Math.max(ms(b.trialUntil), ms(b.paidUntil));
  if (coveredUntil > now) {
    b.nextChargeAt = ts(coveredUntil); // 남은 체험·이용 기간이 끝날 때 첫 결제
  } else {
    try { await charge(uid, b, 'first'); }
    catch (e) { logger.warn('first charge failed', uid, e.message, e.body); throw new HttpsError('aborted', `결제하지 못했어요: ${e.message}`); }
    b.paidUntil = ts(addMonth(now)); b.nextChargeAt = b.paidUntil; b.lastPaidAt = ts(now);
  }
  await ref.set(b, { merge: true });
  await syncAccess(uid, b);
  return { ok: true, charged: coveredUntil <= now };
});

/* 해지: 다음 결제부터 멈춘다 (이미 낸 기간까지는 계속 이용) */
export const cancel = onCall({ region: REGION, secrets: [PORTONE_SECRET] }, async (req) => {
  const { uid } = need(req);
  const ref = db.doc(`billing/${uid}`);
  const snap = await ref.get(); if (!snap.exists) return { ok: true };
  const b = snap.data();
  if (b.billingKey) await portone(`/billing-keys/${encodeURIComponent(b.billingKey)}?storeId=${STORE_ID.value()}`, { method: 'DELETE' }).catch((e) => logger.warn('billing key delete', e.message));
  const nb = { ...b, status: 'canceled', billingKey: FieldValue.delete(), nextChargeAt: null, canceledAt: FieldValue.serverTimestamp() };
  await ref.set(nb, { merge: true });
  await syncAccess(uid, { ...b, status: 'canceled', nextChargeAt: null });
  return { ok: true };
});

/* 매일 아침: 결제일이 된 구독을 결제한다. 실패하면 이틀 더 시도하고 멈춘다 */
export const renew = onSchedule({ region: REGION, schedule: 'every day 09:00', timeZone: 'Asia/Seoul', secrets: [PORTONE_SECRET] }, async () => {
  const due = await db.collection('billing').where('status', '==', 'active').where('nextChargeAt', '<=', Timestamp.fromMillis(Date.now() + 3600e3)).get();
  for (const d of due.docs) {
    const uid = d.id; const b = d.data();
    if (!b.billingKey) continue;
    try {
      await charge(uid, b, 'renew');
      const base = Math.max(ms(b.paidUntil), ms(b.nextChargeAt), Date.now());
      const paidUntil = ts(addMonth(base));
      const nb = { ...b, paidUntil, nextChargeAt: paidUntil, lastPaidAt: ts(Date.now()), failCount: 0, lastError: null };
      await d.ref.set(nb, { merge: true }); await syncAccess(uid, nb);
    } catch (e) {
      const failCount = (b.failCount || 0) + 1;
      const nb = { ...b, failCount, lastError: String(e.message).slice(0, 200), status: failCount >= MAX_FAILS ? 'past_due' : 'active', nextChargeAt: ts(Date.now() + DAY) };
      await d.ref.set(nb, { merge: true }); await syncAccess(uid, nb);
      logger.warn('renew failed', uid, failCount, e.message);
    }
  }
});
