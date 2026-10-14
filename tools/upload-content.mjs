/*
 * 유료 콘텐츠를 Firebase Storage 의 content/ 아래로 올린다 (구독자만 읽기 — storage.rules)
 *   준비: Firebase 콘솔 › 프로젝트 설정 › 서비스 계정 › '새 비공개 키 생성' → JSON 파일 (절대 저장소에 올리지 말 것)
 *   실행: cd tools && npm i firebase-admin && GOOGLE_APPLICATION_CREDENTIALS=~/keys/study-notes.json node upload-content.mjs
 *   올리는 것: js/content.js 의 보호 대상 스크립트 + quiz/ 문제 이미지
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BUCKET = 'study-notes-80ece.firebasestorage.app';
const PROTECTED = /^js\/(exam|wrongq|qmeta|solve|opt-same|gichul-ex|ex-where)\.js$|^js\/(solve|optx|optm)\/|^quiz\/\d+\/\d+\.webp$/;
const TYPES = { '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = ['js', 'quiz'].flatMap((d) => walk(join(ROOT, d))).map((p) => relative(ROOT, p)).filter((p) => PROTECTED.test(p));

initializeApp({ credential: applicationDefault(), storageBucket: BUCKET });
const bucket = getStorage().bucket();
let n = 0;
for (const f of files) {
  await bucket.upload(join(ROOT, f), { destination: `content/${f}`, metadata: { contentType: TYPES[extname(f)] || 'application/octet-stream', cacheControl: 'private, max-age=3600' } });
  if (++n % 50 === 0) console.log(n, '/', files.length);
}
console.log('올림', n, '개');
