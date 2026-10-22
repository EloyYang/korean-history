# 소방공무원 채용시험 기출 PDF(소방청 공개 자료) → 문항별 이미지(fire/img/<시험>/<과목>/<NN>.webp) + 정답 JSON
# 사용: python fire_cut.py <src폴더> <사이트 루트>   (src 에는 2022_open_q.pdf … 2025_all_a.pdf 가 있다)
import sys, os, re, json
import pymupdf
from PIL import Image

SRC = sys.argv[1]; SITE = sys.argv[2]
OUT = f'{SITE}/fire/img'
ZOOM = 1.7
SUBJ = {'소방학개론': 'fire', '소방관계법규': 'law', '행정법총론': 'admin', '한국사': 'hist', '영어': 'eng', '국어': 'kor', '생활영어': 'liveeng', '응급처치학개론': 'first', '화학개론': 'chem', '컴퓨터일반': 'comp'}
# 시험별 과목 순서 (시험지 순서) — 같은 이름이면 시험지 순서대로 나온다
EXAMS = {
    '2022_open': ['소방학개론', '소방관계법규', '행정법총론', '한국사', '영어'],
    '2022_car': ['국어', '생활영어', '소방학개론', '소방관계법규', '영어'],
    '2023_open': ['소방학개론', '소방관계법규', '행정법총론'],
    '2023_car': ['소방학개론', '소방관계법규', '응급처치학개론', '화학개론', '컴퓨터일반'],
    '2024_open': ['소방학개론', '소방관계법규', '행정법총론'],
    '2024_car': ['소방학개론', '소방관계법규', '응급처치학개론', '화학개론', '컴퓨터일반'],
    '2025_open': ['소방학개론', '소방관계법규', '행정법총론'],
    '2025_car': ['소방학개론', '소방관계법규', '응급처치학개론', '화학개론', '컴퓨터일반'],
    '2026_open': ['소방학개론', '소방관계법규', '행정법총론'],
    '2026_car': ['소방학개론', '소방관계법규', '응급처치학개론', '화학개론', '컴퓨터일반'],
}
CIRC = '①②③④⑤'

def page_starts(page):
    """한 쪽에서 문항 시작 줄을 (열, y0, 번호) 로. 열: 0 왼쪽, 1 오른쪽"""
    W, H = page.rect.width, page.rect.height
    out = []
    for b in page.get_text('dict')['blocks']:
        if b['type'] != 0: continue
        for l in b['lines']:
            t = ''.join(s['text'] for s in l['spans']).strip()
            m = re.match(r'^(\d{1,2})\s*\.', t)
            if not m: continue
            x0 = l['bbox'][0]
            if x0 < W * 0.10: col = 0
            elif W * 0.46 < x0 < W * 0.58: col = 1
            else: continue
            out.append((col, l['bbox'][1], int(m.group(1))))
    return sorted(out, key=lambda r: (r[0], r[1]))

def page_headers(page):
    """'※ [10∼11] 다음 글을 읽고 물음에 답하시오.' 같은 안내 줄: (열, y0, 범위 끝 번호 또는 None)"""
    W = page.rect.width; out = []
    for b in page.get_text('dict')['blocks']:
        if b['type'] != 0: continue
        for l in b['lines']:
            t = ''.join(s['text'] for s in l['spans']).strip()
            if not t.startswith('※') or not ('읽고' in t or '물음' in t): continue
            x0 = l['bbox'][0]
            col = 0 if x0 < W * 0.30 else 1
            m = re.search(r'\[\s*(\d+)\s*[∼~]\s*(\d+)\s*\]', t)
            out.append((col, l['bbox'][1], int(m.group(2)) if m else None))
    return out

def content_bottom(page):
    """본문이 끝나는 y (쪽 번호·과목 표시줄 위)"""
    H = page.rect.height; y = H * 0.955
    for b in page.get_text('dict')['blocks']:
        if b['type'] != 0: continue
        for l in b['lines']:
            t = ''.join(s['text'] for s in l['spans']).strip()
            if l['bbox'][1] > H * 0.93 and (re.match(r'^\d+\s*/\s*\d+$', t) or '【' in t): y = min(y, l['bbox'][1] - 2)
    return y

def subject_pages(doc, subs):
    """과목마다 시작 쪽 (쪽에 【 과목명 】 표시가 처음 나오는 쪽). 2026 공채처럼 이름이 【 】 밖에 있어도 찾는다"""
    names = [x.replace(' ', '') for x in subs]; start = [None] * len(subs); k = 0
    for pi, page in enumerate(doc):
        t = re.sub(r'\s+', '', page.get_text())
        while k < len(subs) and (('【' + names[k] + '】') in t or (names[k] + '【】') in t):
            if start[k] is None: start[k] = pi
            k += 1
    assert all(x is not None for x in start), start
    return start

def cut(exam):
    """문항마다 [과목 번호, 문항 번호, [(쪽, 열, y0, y1) …]] — 열·쪽을 넘어가는 문항과 공통 지문도 이어 붙인다"""
    doc = pymupdf.open(f'{SRC}/{exam}_q.pdf'); subs = EXAMS[exam]; sp = subject_pages(doc, subs)
    items = []; expect = 0; cur = -1; shared = {}
    target = None; start = None; pend = None; pend_end = None   # target: 지금 이어 붙이는 parts 리스트
    def close(end_y):
        if target is not None and start is not None and end_y - start[2] > 30:
            target.append((start[0], start[1], start[2], end_y))
    for pi, page in enumerate(doc):
        k = max([j for j in range(len(subs)) if sp[j] <= pi], default=-1)
        if k != cur: cur = k; expect = 0; target = None; start = None; pend = None; shared = {}
        if cur < 0: continue
        W, H = page.rect.width, page.rect.height; bot = content_bottom(page); top = H * 0.065
        starts = page_starts(page); heads = page_headers(page) if pi else []
        for col in (0, 1):
            ev = []
            for (c, y, n) in [x for x in starts if x[0] == col]:
                if n == expect + 1: expect = n; ev.append((y, 'Q', n, None))
            ev += [(h[1], 'H', None, h[2]) for h in heads if h[0] == col]
            ev.sort(key=lambda e: e[0])
            start = (pi, col, top) if target is not None else None
            for (y, kind, n, rng) in ev:
                close(y - 3)
                if kind == 'H':
                    pend = []; pend_end = rng; target = pend; start = (pi, col, y - 3)
                else:
                    parts = []
                    if pend is not None:
                        parts = list(pend)
                        if pend_end: shared[pend_end] = list(pend)
                        pend = None
                    elif n in shared: parts = list(shared.pop(n))
                    item = [cur, n, parts]; items.append(item); target = parts; start = (pi, col, y - 3)
            close(bot)
    return doc, items

def render(doc, parts):
    imgs = []
    for (pi, col, y0, y1) in parts:
        page = doc[pi]; W = page.rect.width; mid = W / 2
        x0, x1 = (8, mid - 6) if col == 0 else (mid + 6, W - 8)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=pymupdf.Rect(x0, y0, x1, y1), alpha=False)
        imgs.append(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))
    w = max(i.width for i in imgs); h = sum(i.height for i in imgs)
    out = Image.new('RGB', (w, h), 'white'); y = 0
    for i in imgs: out.paste(i, (0, y)); y += i.height
    # 열 사이 구분선(세로줄)이 가장자리에 남으면 지운다
    g0 = out.convert('L'); px0 = g0.load(); hh = out.height
    for x in list(range(0, 10)) + list(range(w - 10, w)):
        if sum(1 for yy in range(0, hh, 2) if px0[x, yy] < 140) > 0.5 * (hh / 2):
            for yy in range(hh):
                out.putpixel((x, yy), (255, 255, 255))
    # 아래쪽 빈 곳 자르기
    g = out.convert('L'); px = g.load(); last = 0
    for yy in range(h - 1, -1, -1):
        if any(px[x, yy] < 200 for x in range(0, w, 2)): last = yy; break
    return out.crop((0, 0, w, min(h, last + 10)))

def opts_ok(doc, parts):
    t = ''
    for (pi, col, y0, y1) in parts:
        page = doc[pi]; W = page.rect.width; mid = W / 2
        x0, x1 = (0, mid) if col == 0 else (mid, W)
        t += page.get_text('text', clip=pymupdf.Rect(x0, y0, x1, y1))
    return sum(1 for c in '①②③④' if c in t)

def parse_answers(exam, counts):
    """exam 의 과목별 정답 리스트 (0 = 모두 정답 처리)"""
    subs = EXAMS[exam]; res = {}
    if exam.startswith('2025'):
        doc = pymupdf.open(f'{SRC}/2025_all_a.pdf')
        for page in doc:
            t = ' '.join(page.get_text().split())
            name = re.search(r'(?:과목|영역)\s+(\S+)\s+구분\s+(\S+)', t)
            sub, kind = name.group(1), name.group(2)
            nums = re.search(r'정답\s+문번\s+정답\s+(.*)$', t).group(1).split()
            pairs = {int(nums[i]): int(nums[i + 1]) for i in range(0, len(nums) - 1, 2)}
            res[(sub, kind)] = [pairs[k] for k in sorted(pairs)]
        kind = 'open' if exam.endswith('open') else 'car'
        out = {}
        for s in subs:
            for key in ([(s, '공통'), (s, '공개채용' if kind == 'open' else '경력채용')]):
                if key in res: out[s] = res[key]; break
        return out
    t = ' '.join(pymupdf.open(f'{SRC}/{exam}_a.pdf')[0].get_text().split())
    t = re.sub(r'(?<=\d) (공개 채용|경력 채용|공통) ', ' ', t)   # 2026 정답표의 '구분' 칸 제거
    t = t.replace('모두 정답', 'ALL').replace('정답 없음', 'ALL')
    t = t.replace('①', '1').replace('②', '2').replace('③', '3').replace('④', '4')
    tok = t.split()
    names = [x.replace(' ', '') for x in subs]
    # 과목 이름 위치 (한글만 이어진 토큰들) 찾기: 첫 과목 이름부터
    flat = ''.join(tok)
    i = 0
    # 헤더 건너뛰기: 첫 번째 과목 이름의 첫 글자가 나오는 위치
    first = subs[0].replace(' ', '')
    j = next(k for k in range(len(tok)) if tok[k] and tok[k][0] == first[0] and (''.join(tok[k:k + 4]).startswith(first)))
    i = j - 1  # 연번
    for si, s in enumerate(subs):
        assert tok[i].isdigit() and int(tok[i]) == si + 1, (exam, s, tok[i:i + 3])
        i += 1; nm = ''
        while nm != s.replace(' ', ''):
            nm += tok[i]; i += 1
        n = counts[s]; ans = tok[i:i + n]; i += n
        res[s] = [0 if a == 'ALL' else int(a) for a in ans]
    return res

if __name__ == '__main__':
    data = {}
    only = sys.argv[3:] 
    for exam in EXAMS:
        if only and exam not in only: continue
        doc, items = cut(exam); subs = EXAMS[exam]
        counts = {s: sum(1 for it in items if subs[it[0]] == s) for s in subs}
        print(exam, counts)
        bad = []
        for it in items:
            if opts_ok(doc, it[2]) < 4: bad.append((subs[it[0]], it[1], opts_ok(doc, it[2])))
        print('  보기 4개가 안 보이는 문항:', bad)
        ans = parse_answers(exam, counts)
        for s in subs:
            assert len(ans[s]) == counts[s], (exam, s, len(ans[s]), counts[s])
        data[exam] = {'subjects': [{'name': s, 'id': SUBJ[s], 'count': counts[s], 'ans': ans[s]} for s in subs]}
        for it in items:
            s = subs[it[0]]; d = f'{OUT}/{exam}/{SUBJ[s]}'; os.makedirs(d, exist_ok=True)
            img = render(doc, it[2]); w = 760
            if img.width > w: img = img.resize((w, int(img.height * w / img.width)))
            img.save(f'{d}/{it[1]:02d}.webp', 'WEBP', quality=72, method=6)
    os.makedirs(f'{SITE}/js/fire', exist_ok=True)
    json.dump(data, open(f'{SITE}/js/fire/_ans.json', 'w'), ensure_ascii=False)
