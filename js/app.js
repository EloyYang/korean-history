(function () {
  'use strict';

  const ERAS = window.ERAS;
  const NOTES = window.NOTES || [];
  const RULERS = window.RULERS || {};
  const ARTIFACTS = window.ARTIFACTS || {};
  const ART_RE = Object.keys(ARTIFACTS).length
    ? new RegExp('(' + Object.keys(ARTIFACTS).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![가-힣])', 'g')
    : null;

  // 본문 글씨 중 유물 이름을 찾아 사진 링크로 감싼다
  function linkArtifacts(root) {
    if (!ART_RE || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('a, button, .stepper, .no-art') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      ART_RE.lastIndex = 0;
      if (!ART_RE.test(node.nodeValue)) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(ART_RE).forEach((part, i) => {
        if (i % 2 === 0) { if (part) frag.appendChild(document.createTextNode(part)); return; }
        const a = document.createElement('a');
        a.className = 'artifact';
        a.dataset.art = part;
        a.title = part + ' 사진 보기';
        a.textContent = part;
        frag.appendChild(a);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  // src 는 경로 하나 또는 여러 장(배열) — 여러 장이면 나란히 보여 준다
  function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    const box = lb.querySelector('.lb-imgs');
    const srcs = [].concat(src);
    lb.classList.remove('missing');
    box.innerHTML = '';
    box.style.setProperty('--n', srcs.length);
    let failed = 0;
    srcs.forEach((u) => {
      const img = document.createElement('img');
      img.alt = caption || '';
      img.onerror = () => { img.remove(); if (++failed === srcs.length) lb.classList.add('missing'); };
      img.src = u;
      box.appendChild(img);
    });
    lb.querySelector('figcaption').textContent = caption || '';
    lb.hidden = false;
  }
  const COLORS = window.POLITY_COLORS || {};
  // 모든 시대의 왕·대통령을 순서대로 이어 붙인 목록 (이전/다음으로 차례대로 넘겨 보기)
  const RULER_SEQ = [];
  ERAS.forEach((e, ei) => (RULERS[e.id] || []).forEach((r, ri) => RULER_SEQ.push({ ei, ri, r })));
  const LAND_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json';

  const TYPE_LABEL = { capital: '도읍·중심지', battle: '전투·전쟁', site: '유적', monument: '비석·기념물', event: '사건' };
  const LINE_STYLE = {
    attack: { weight: 3, dashArray: '10 7', opacity: 0.9 },
    route: { weight: 2.5, dashArray: '2 7', opacity: 0.9 },
    wall: { weight: 5, opacity: 0.85 },
    border: { weight: 2.5, dashArray: '12 6', opacity: 0.8 },
  };
  const TERR_STYLE = {
    normal: { weight: 2, fillOpacity: 0.4, opacity: 0.95 },
    neighbor: { weight: 1.2, fillOpacity: 0.2, opacity: 0.8, dashArray: '4 4' },
    overlay: { weight: 2, fillOpacity: 0.55, opacity: 1, dashArray: '6 3' },
    dashed: { weight: 2.5, fillOpacity: 0.1, opacity: 1, dashArray: '8 6' },
  };
  const GEO_LABELS = [
    ['압록강', 40.72, 125.25], ['두만강', 42.7, 129.55], ['청천강(살수)', 39.78, 126.0], ['대동강(패수)', 39.2, 126.1],
    ['예성강', 38.2, 126.3], ['임진강', 38.1, 126.9], ['한강', 37.45, 127.45], ['금강(백강)', 36.35, 127.35],
    ['영산강', 35.0, 126.5], ['섬진강', 35.25, 127.55], ['낙동강', 35.75, 128.45], ['요하', 41.9, 122.5], ['쑹화강', 45.1, 126.6],
    ['▲ 백두산', 42.0, 128.08], ['▲ 한라산', 33.36, 126.53], ['동해', 38.4, 130.8], ['황해(서해)', 36.5, 124.6], ['남해', 34.0, 127.6],
  ];

  // ── 상태 ─────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('khmap.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('khmap.' + k, JSON.stringify(v)); } catch (e) { /* 무시 */ } },
  };
  const state = {
    era: 0,
    tab: store.get('tab', 'info'),
    allLabels: store.get('labelsOn', true),
    geoLabels: store.get('geoLabels', true),
    rulerPos: 0,
    rulerFilter: 'all',
    rulerQuiz: false,
    rulerView: store.get('rulerView', 'list'),
    exAll: store.get('exAll', false),
    topSort: store.get('topSort', 'n'),
    topMore: false,
  };

  let land = null;
  const clipCache = new Map();
  let markerByName = new Map();

  // ── 지도 ─────────────────────────────
  const map = L.map('map', { zoomControl: false, minZoom: 3, maxZoom: 10, worldCopyJump: false, zoomSnap: 0.25 });
  L.control.zoom({ position: 'topleft' }).addTo(map);
  map.attributionControl.setPrefix(false);

  // 배경 지도: 지형도로 고정
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 8, maxZoom: 10, attribution: 'Tiles © Esri — US National Park Service',
  }).addTo(map);

  const gTerr = L.layerGroup().addTo(map);
  const gLines = L.layerGroup().addTo(map);
  const gMarkers = L.layerGroup().addTo(map);
  const gGeo = L.layerGroup();

  GEO_LABELS.forEach(([name, lat, lng]) => {
    L.marker([lat, lng], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: `<div class="river-label">${name}</div>`, iconSize: [0, 0] }) }).addTo(gGeo);
  });

  // ── 유틸 ─────────────────────────────
  function $(s, el) { return (el || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function stripTags(s) {
    return String(s).replace(/<[^>]*>/g, '').replace(/\{\{([^}|]+)(\|[^}]*)?\}\}/g, '$1')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function toPolygon(coords) {
    const ring = coords.map(([lat, lng]) => [lng, lat]);
    const [f, l] = [ring[0], ring[ring.length - 1]];
    if (f[0] !== l[0] || f[1] !== l[1]) ring.push(f);
    return turf.polygon([ring]);
  }

  function clipToLand(coords) {
    const poly = toPolygon(coords);
    if (!land) return poly;
    const key = JSON.stringify(coords);
    if (clipCache.has(key)) return clipCache.get(key);
    let out = poly;
    try { out = turf.intersect(poly, land) || null; } catch (e) { out = poly; }
    clipCache.set(key, out);
    return out;
  }

  function markerHtml(type) {
    if (type === 'capital') return '<div class="mk mk-capital">★</div>';
    if (type === 'battle') return '<div class="mk mk-battle"><span></span></div>';
    return `<div class="mk mk-${type}"></div>`;
  }
  const ICON_SIZE = { capital: [18, 18], battle: [16, 16], site: [14, 14], monument: [13, 16], event: [14, 14] };

  function popupHtml(m) {
    return `<div class="pop-title">${esc(m.name)}${m.tag ? `<span class="pop-tag">${esc(m.tag)}</span>` : ''}</div>` +
      (m.year ? `<div class="pop-year">${esc(m.year)}</div>` : '') +
      (m.desc ? `<div>${esc(m.desc)}</div>` : '') +
      (ARTIFACTS[m.name] ? `<img class="pop-img" src="${esc(ARTIFACTS[m.name].src)}" alt="${esc(m.name)} 사진" data-art="${esc(m.name)}" onerror="this.remove()">` : '');
  }

  function bearing(a, b) {
    const p1 = map.project(L.latLng(a), 0);
    const p2 = map.project(L.latLng(b), 0);
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 90;
  }

  // ── 시대 그리기 ─────────────────────────────
  function drawEra(fit) {
    const era = ERAS[state.era];
    gTerr.clearLayers(); gLines.clearLayers(); gMarkers.clearLayers();
    clearCallouts();
    markerByName = new Map();

    era.territories.forEach((t) => {
      const shape = clipToLand(t.coords);
      if (!shape) return;
      const st = TERR_STYLE[t.style || 'normal'];
      L.geoJSON(shape, { style: { ...st, color: t.color, fillColor: t.color }, interactive: false }).addTo(gTerr);
      let at = t.label;
      if (!at) { const c = turf.centerOfMass(shape).geometry.coordinates; at = [c[1], c[0]]; }
      const small = t.style && t.style !== 'normal';
      const color = t.style === 'neighbor' ? '#555' : t.color;
      L.marker(at, {
        interactive: false, keyboard: false,
        icon: L.divIcon({ className: '', html: `<div class="terr-label${small ? ' small' : ''}" style="color:${color}">${esc(t.name)}</div>`, iconSize: [0, 0] }),
      }).addTo(gTerr);
    });

    era.lines.forEach((ln) => {
      const st = LINE_STYLE[ln.kind] || LINE_STYLE.route;
      const pl = L.polyline(ln.coords, { ...st, color: ln.color }).addTo(gLines);
      pl.bindTooltip(ln.name, { sticky: true, className: 'mk-label' });
      if (ln.kind === 'attack' || ln.kind === 'route') {
        const n = ln.coords.length;
        const rot = bearing(ln.coords[n - 2], ln.coords[n - 1]);
        L.marker(ln.coords[n - 1], {
          interactive: false, keyboard: false,
          icon: L.divIcon({ className: '', html: `<div class="arrow-head" style="color:${ln.color};transform:rotate(${rot}deg)"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] }),
        }).addTo(gLines);
      }
    });

    era.markers.forEach((m) => {
      const size = ICON_SIZE[m.type] || [14, 14];
      const mk = L.marker(m.at, {
        riseOnHover: true,
        icon: L.divIcon({ className: '', html: markerHtml(m.type), iconSize: size, iconAnchor: [size[0] / 2, size[1] / 2] }),
      }).addTo(gMarkers);
      mk.bindPopup(popupHtml(m), { maxWidth: 280 });
      const entry = { marker: mk, data: m, size, prio: m.major ? 3 : (m.type === 'capital' || m.type === 'battle') ? 2 : 1 };
      // 마우스를 올리면 이름 툴팁 — 이름표(콜아웃)가 이미 보이면 툴팁 대신 이름표를 강조
      mk.bindTooltip(m.year ? `${m.name} (${m.year})` : m.name, { direction: 'top', offset: [0, -8], className: 'mk-label' });
      mk.on('tooltipopen', () => { if (entry.callout) mk.closeTooltip(); });
      mk.on('mouseover', () => { if (entry.callout) entry.callout.classList.add('hover'); });
      mk.on('mouseout', () => { if (entry.callout) entry.callout.classList.remove('hover'); });
      markerByName.set(m.name, entry);
    });

    renderLegend(era);
    renderSync(era);
    requestAnimationFrame(layoutCallouts);
    if (fit) map.fitBounds(era.view, { padding: [20, 20], animate: false });
  }

  // ── 동시대 연표: 여러 나라가 공존한 시대에 나라별 왕 재위와 사건을 한 축에 나란히 ─────
  function parseYear(str) {
    if (str == null) return null;
    const c = String(str).match(/(기원전\s*)?(\d{1,2})\s*세기/);
    if (c) return c[1] ? -(Number(c[2]) - 1) * 100 - 50 : (Number(c[2]) - 1) * 100 + 10;
    const m = String(str).match(/(기원전\s*)?(\d{1,4})/);
    if (!m) return null;
    return m[1] ? -Number(m[2]) : Number(m[2]);
  }
  function parseReign(str) {
    const parts = String(str).split('~');
    const a = parseYear(parts[0]);
    const b = parts.length > 1 ? parseYear(parts[1].replace(/^[^\d기]*/, '')) : a;
    return [a, parts.length > 1 && /\d/.test(parts[1]) ? b : null];
  }
  const fmtYear = (y) => (y < 0 ? `기원전 ${-y}` : `${y}`);

  // 나라별 재위 구간(끝이 없으면 다음 왕 즉위년까지). 모든 시대의 인물을 한 번에 계산해 둔다
  const NOW_Y = new Date().getFullYear();
  const REIGNS = (() => {
    const byState = new Map();
    ERAS.forEach((e, ei) => (RULERS[e.id] || []).forEach((r, ri) => {
      const span = parseReign(r.reign);
      if (span[0] == null) return;
      if (!byState.has(r.state)) byState.set(r.state, []);
      byState.get(r.state).push({ r, ei, ri, span });
    }));
    const all = [];
    byState.forEach((rs) => {
      rs.sort((a, b) => a.span[0] - b.span[0]);
      rs.forEach((x, i) => {
        if (x.span[1] == null) {
          const nx = rs.slice(i + 1).find((y) => y.span[0] > x.span[0]);
          x.span[1] = nx ? nx.span[0] : Math.min(x.span[0] + 25, Math.max(NOW_Y, x.span[0] + 1));
        }
        if (x.span[1] <= x.span[0]) x.span[1] = x.span[0] + 1;
        all.push(x);
      });
    });
    return all;
  })();

  function eraRulers(era) {
    const ei = ERAS.indexOf(era);
    return REIGNS.filter((x) => x.ei === ei);
  }

  function syncData(era) {
    const ei = ERAS.indexOf(era);
    const own = eraRulers(era);
    if (!own.length) return null;
    const states = [...new Set((RULERS[era.id] || []).map((r) => r.state))];
    const lo0 = Math.min(...own.map((x) => x.span[0])), hi0 = Math.max(...own.map((x) => x.span[1]));
    // 이웃 시대에 정리된 왕이라도 이 시대 범위와 재위가 겹치면 함께 보여 준다(시대 경계에서 칸이 비지 않게)
    const lanes = states.map((st) => {
      const rs = REIGNS.filter((x) => x.r.state === st && (x.ei === ei || (x.span[1] > lo0 && x.span[0] < hi0)))
        .map((x) => ({ ...x, ext: x.ei !== ei })).sort((a, b) => a.span[0] - b.span[0] || a.ext - b.ext);
      // 재위가 겹치는 인물(섭정·무신 집권자 등)은 아래 줄로 쌓는다
      const rowEnd = [];
      rs.forEach((x) => {
        let row = rowEnd.findIndex((end) => end <= x.span[0]);
        if (row < 0) { row = rowEnd.length; rowEnd.push(0); }
        rowEnd[row] = x.span[1]; x.row = row;
      });
      return { st, rs, rows: Math.max(1, rowEnd.length) };
    }).filter((l) => l.rs.length);
    const pad = Math.max(3, Math.round((hi0 - lo0) * 0.03));
    const lo = lo0 - pad, hi = hi0 + pad;
    // 사건: 기출·판서 기반으로 고른 주요 사건(ERA_EVENTS) — 지도 마커와 이름이 맞으면 클릭 시 지도로 이동
    const findMarker = (name) => name && (era.markers.find((m) => m.name === name) || era.markers.find((m) => m.name.includes(name) || name.includes(m.name)));
    let events = ((window.ERA_EVENTS || {})[era.id] || []).map(([y, label, type, mk]) => {
      const m = findMarker(mk);
      return { y, label: label.replace(/^★/, ''), star: label.startsWith('★'), type, marker: m ? m.name : '' };
    });
    if (!events.length) events = era.markers.map((m) => ({ y: parseYear(m.year), label: m.name, type: m.type, marker: m.name, star: !!m.major })).filter((x) => x.y != null);
    return { lanes, events: events.filter((e) => e.y >= lo && e.y <= hi), lo, hi };
  }

  function renderSync(era) {
    const box = $('#sync');
    const d = syncData(era);
    $('#chip-sync').hidden = !d;
    if (!d || !$('#tg-sync').checked) { box.hidden = true; document.body.style.setProperty('--sync-h', '0px'); return; }
    box.hidden = false;
    const X = (y) => ((Math.max(d.lo, Math.min(d.hi, y)) - d.lo) / (d.hi - d.lo)) * 100;
    const step = [10, 20, 25, 50, 100, 200][[10, 20, 25, 50, 100, 200].findIndex((s) => (d.hi - d.lo) / s <= 9)] || 200;
    const ticks = [];
    for (let y = Math.ceil(d.lo / step) * step; y <= d.hi; y += step) ticks.push(y);
    const lanesHtml = d.lanes.map((l) => `
      <div class="sync-lane" style="height:${l.rows * 22}px">
        <div class="sync-name" style="color:${stateColor(l.st)}">${esc(l.st)}</div>
        <div class="sync-track">${l.rs.map((x) => `<button class="sync-king${x.ext ? ' ext' : ''}" data-ei="${x.ei}" data-ri="${x.ri}" style="left:${X(x.span[0])}%;width:${Math.max(0.8, X(x.span[1]) - X(x.span[0]))}%;top:${x.row * 22 + 2}px;height:18px;--c:${stateColor(l.st)}" title="${esc(x.r.name)} (${esc(x.r.reign)})${x.r.key ? ' — ' + esc(x.r.key) : ''}${x.ext ? ' · ' + esc(ERAS[x.ei].name) : ''}"><span>${esc(x.r.name)}</span></button>`).join('')}</div>
      </div>`).join('');
    const evs = d.events.slice().sort((a, b) => a.y - b.y);
    const tip = (e) => `${esc(e.label)} (${fmtYear(e.y)})${e.star ? ' · 기출 빈출' : ''}`;
    // 이름표는 기출 빈출(★) 사건을 먼저 자리 잡게 한다
    const evHtml = evs.map((e) => `<button class="sync-ev ${e.type}${e.star ? ' star' : ''}" data-marker="${esc(e.marker)}" style="left:${X(e.y)}%" title="${tip(e)}"></button>`).join('')
      + evs.slice().sort((a, b) => b.star - a.star).map((e) => `<span class="sync-evl ${e.type}${e.star ? ' star' : ''}" data-marker="${esc(e.marker)}" data-x="${X(e.y)}" style="left:${X(e.y)}%" title="${tip(e)}">${esc(e.label)}</span>`).join('');
    box.innerHTML = `
      <div class="sync-head"><b>동시대 연표</b><span class="sync-read">막대에 마우스를 올리면 그 해의 인물(왕·대통령)과 사건이 보여요 · <b class="star">굵은 사건</b>은 기출 빈출</span><button class="sync-x" title="닫기">✕</button></div>
      <div class="sync-body">
        ${lanesHtml}
        <div class="sync-lane ev"><div class="sync-name">사건</div><div class="sync-track ev">${evHtml}</div></div>
        <div class="sync-lane axis"><div class="sync-name"></div><div class="sync-track">${ticks.map((t) => `<span class="sync-tick" style="left:${X(t)}%">${fmtYear(t)}</span>`).join('')}</div></div>
        <div class="sync-cursor" hidden></div>
      </div>`;
    box._d = d;
    layoutEvLabels(box);
    document.body.style.setProperty('--sync-h', box.offsetHeight + 'px');
  }

  // 사건 이름표: 두 줄에 번갈아 배치하고, 겹치면 숨긴다(점에 마우스를 올리면 보임)
  function layoutEvLabels(box) {
    if (!box.offsetWidth) return; // 지도가 숨겨진 상태면 다시 보일 때 배치
    const labels = [...box.querySelectorAll('.sync-evl')];
    const rows = [[], []];
    const tr = box.querySelector('.sync-track.ev').getBoundingClientRect();
    labels.forEach((el) => {
      el.classList.remove('hide', 'r1');
      el.style.transform = '';
      let r = el.getBoundingClientRect();
      // 양 끝 이름표는 연표 밖으로 잘리지 않게 안쪽으로 붙인다
      if (r.left < tr.left) el.style.transform = 'translateX(0)';
      else if (r.right > tr.right) el.style.transform = 'translateX(-100%)';
      r = el.getBoundingClientRect();
      const row = rows.findIndex((taken) => taken.every(([a, b]) => r.right + 4 < a || r.left > b + 4));
      if (row < 0) { el.classList.add('hide'); return; }
      if (row === 1) el.classList.add('r1');
      const r2 = el.getBoundingClientRect();
      rows[row].push([r2.left, r2.right]);
    });
  }

  function syncReadout(year) {
    const d = $('#sync')._d; if (!d) return;
    const kings = d.lanes.map((l) => {
      const k = l.rs.find((x) => year >= x.span[0] && year < x.span[1]) || l.rs.find((x) => year === x.span[1]);
      return k ? `<span style="color:${stateColor(l.st)}">${esc(l.st)} <b>${esc(k.r.name)}</b></span>` : '';
    }).filter(Boolean);
    const near = d.events.filter((e) => Math.abs(e.y - year) <= Math.max(2, (d.hi - d.lo) / 60)).map((e) => `<em>${esc(e.label)}</em>`);
    $('#sync .sync-read').innerHTML = `<b>${fmtYear(year)}년</b> · ${kings.join(' · ') || '—'}${near.length ? ' · ⚑ ' + near.join(', ') : ''}`;
  }

  $('#sync').addEventListener('mousemove', (e) => {
    const body = e.target.closest('.sync-body'); if (!body) return;
    const track = body.querySelector('.sync-track'); const r = track.getBoundingClientRect();
    const d = $('#sync')._d; const f = (e.clientX - r.left) / r.width;
    if (f < 0 || f > 1) return;
    const year = Math.round(d.lo + f * (d.hi - d.lo));
    const cur = body.querySelector('.sync-cursor'); cur.hidden = false;
    cur.style.left = (r.left - body.getBoundingClientRect().left + f * r.width) + 'px';
    syncReadout(year);
  });
  $('#sync').addEventListener('click', (e) => {
    if (e.target.closest('.sync-x')) { $('#tg-sync').checked = false; store.set('sync', false); renderSync(ERAS[state.era]); return; }
    const ev = e.target.closest('.sync-ev, .sync-evl'); if (ev) { if (ev.dataset.marker) focusMarker(ev.dataset.marker); return; }
    const k = e.target.closest('.sync-king');
    if (k) selectRuler(+k.dataset.ei, +k.dataset.ri);
  });
  L.DomEvent.disableClickPropagation($('#sync'));
  L.DomEvent.disableScrollPropagation($('#sync'));
  $('#tg-sync').checked = store.get('sync', true);
  $('#tg-sync').addEventListener('change', () => { store.set('sync', $('#tg-sync').checked); renderSync(ERAS[state.era]); });

  // ── 마커 이름표(콜아웃) ─────────────────────────────
  // 이름표를 육지(지도 내용) 밖 — 바다나 빈 곳 — 에 우선 배치하고, 선으로 실제 위치와 연결한다.
  // 자리가 없으면 숨기고 마우스를 올렸을 때 툴팁으로 보여 준다.
  const overlay = L.DomUtil.create('div', 'callouts', map.getContainer());
  overlay.innerHTML = '<svg class="callout-lines"></svg>';
  const svgLines = overlay.firstChild;
  let landMask = null;
  let landLite = null;
  let placed = [];

  function buildLandMask(w, h) {
    if (!landLite) return null;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const b = map.getBounds();
    ctx.beginPath();
    landLite.forEach(({ poly, bbox }) => {
      if (bbox[2] < b.getWest() - 1 || bbox[0] > b.getEast() + 1 || bbox[3] < b.getSouth() - 1 || bbox[1] > b.getNorth() + 1) return;
      poly.forEach((ring) => {
        ring.forEach(([lng, lat], i) => {
          const pt = map.latLngToContainerPoint([lat, lng]);
          i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y);
        });
        ctx.closePath();
      });
    });
    ctx.fill('evenodd');
    const data = ctx.getImageData(0, 0, w, h).data;
    return (x, y) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      return data[(y * w + x) * 4 + 3] > 0;
    };
  }

  function relRect(el, base) {
    const r = el.getBoundingClientRect();
    return { left: r.left - base.left, top: r.top - base.top, right: r.right - base.left, bottom: r.bottom - base.top };
  }
  function hit(a, list, pad) {
    pad = pad || 0;
    return list.some((b) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad);
  }

  function segCross(a, b) {
    const d = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    const [p1, p2] = a, [p3, p4] = b;
    return d(p1, p2, p3) * d(p1, p2, p4) < 0 && d(p3, p4, p1) * d(p3, p4, p2) < 0;
  }
  function segHitsRect(a, r) {
    // 선분을 몇 점으로 나눠 사각형 안을 지나는지 검사
    for (let t = 0.15; t < 0.9; t += 0.15) {
      const x = a[0][0] + (a[1][0] - a[0][0]) * t, y = a[0][1] + (a[1][1] - a[0][1]) * t;
      if (x > r.left && x < r.right && y > r.top && y < r.bottom) return true;
    }
    return false;
  }

  function clearCallouts() {
    placed.forEach((e) => { if (e.callout) e.callout.remove(); e.callout = null; });
    placed = [];
    svgLines.innerHTML = '';
    markerByName.forEach((e) => { if (e.callout) { e.callout.remove(); e.callout = null; } });
  }

  function layoutCallouts() {
    if (map._animatingZoom) return;
    overlay.classList.remove('zooming');
    clearCallouts();
    const entries = [...markerByName.values()];
    if (!state.allLabels) return;

    const box = map.getContainer();
    const base = box.getBoundingClientRect();
    const W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) return; // 노트 크게(지도 숨김) 상태
    landMask = buildLandMask(W, H);

    // 피해야 할 영역: 지도 위 UI, 마커, 나라 이름
    const blocked = [];
    document.querySelectorAll('.map-tools, .legend, .sync, .leaflet-control-zoom, .leaflet-control-attribution').forEach((el) => {
      if (el.offsetParent) blocked.push(relRect(el, base));
    });
    const uiRects = blocked.slice();
    const labels = [];
    const segs = [];
    entries.forEach((e) => { const el = e.marker.getElement(); if (el) blocked.push(relRect(el, base)); });
    document.querySelectorAll('.terr-label').forEach((el) => blocked.push(relRect(el, base)));

    const ANG = [];
    for (let a = 0; a < 16; a++) ANG.push((a / 16) * Math.PI * 2);
    const DIST = [22, 45, 75, 110, 150, 200];

    entries.sort((a, b) => b.prio - a.prio).forEach((e) => {
      const p = map.latLngToContainerPoint(e.marker.getLatLng());
      if (p.x < 0 || p.y < 0 || p.x > W || p.y > H) return;
      if (uiRects.some((r) => p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom)) return;
      const el = document.createElement('div');
      el.className = 'callout' + (e.prio >= 3 ? ' major' : '') + (e.data.type === 'battle' ? ' battle' : '') + (e.data.type === 'capital' ? ' capital' : '');
      el.textContent = e.data.name;
      if (state.hlTerms && state.hlTerms.some((t) => e.data.name.includes(t))) el.classList.add('hl');
      overlay.appendChild(el);
      const w = el.offsetWidth, h = el.offsetHeight;

      let best = null;
      DIST.forEach((d) => ANG.forEach((a) => {
        const cx = p.x + Math.cos(a) * (d + w / 2), cy = p.y + Math.sin(a) * (d + h / 2);
        const r = { left: cx - w / 2, top: cy - h / 2, right: cx + w / 2, bottom: cy + h / 2 };
        if (r.left < 4 || r.top < 4 || r.right > W - 4 || r.bottom > H - 4) return;
        if (hit(r, blocked, 2)) return;
        if (segs.some((sg) => segHitsRect(sg, r))) return;
        let land = 0;
        if (landMask) {
          for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) if (landMask(r.left + (w * i) / 2, r.top + (h * j) / 2)) land++;
        }
        const tx = Math.max(r.left, Math.min(p.x, r.right)), ty = Math.max(r.top, Math.min(p.y, r.bottom));
        const seg = [[p.x, p.y], [tx, ty]];
        if (labels.some((lr) => segHitsRect(seg, lr))) return;
        const crosses = segs.filter((sg) => segCross(seg, sg)).length;
        // 육지를 덮을수록, 멀수록, 다른 선과 교차할수록 감점
        const score = land * 14 + d * 0.45 + crosses * 40 + (Math.abs(Math.sin(a)) > 0.92 ? 3 : 0);
        if (!best || score < best.score) best = { score, r, seg, d };
      }));
      // 너무 멀리 밀려나는 덜 중요한 이름표는 숨긴다 (확대하거나 마우스를 올리면 보임)
      if (!best || (best.d > 110 && e.prio < 2)) { el.remove(); return; }

      el.style.left = best.r.left + 'px';
      el.style.top = best.r.top + 'px';
      blocked.push(best.r);
      labels.push(best.r);
      segs.push(best.seg);
      e.callout = el;
      e.offset = [best.r.left - p.x, best.r.top - p.y, w, h];
      e.marker.closeTooltip();
      el.addEventListener('click', (ev) => { ev.stopPropagation(); e.marker.openPopup(); });
      el.addEventListener('mouseenter', () => el.classList.add('hover'));
      el.addEventListener('mouseleave', () => el.classList.remove('hover'));
      L.DomEvent.disableClickPropagation(el);
      placed.push(e);
    });
    drawLines();
  }

  function drawLines() {
    const out = [];
    placed.forEach((e) => {
      const p = map.latLngToContainerPoint(e.marker.getLatLng());
      const [ox, oy, w, h] = e.offset;
      const x = p.x + ox, y = p.y + oy;
      e.callout.style.left = x + 'px';
      e.callout.style.top = y + 'px';
      // 이름표 테두리에서 마커에 가장 가까운 점까지 선을 긋는다
      const tx = Math.max(x, Math.min(p.x, x + w)), ty = Math.max(y, Math.min(p.y, y + h));
      if (Math.hypot(tx - p.x, ty - p.y) < 9) return;
      const cls = e.prio >= 3 || e.data.type === 'battle' ? 'strong' : '';
      out.push(`<line class="${cls}" x1="${p.x}" y1="${p.y}" x2="${tx}" y2="${ty}"/>`);
    });
    svgLines.setAttribute('width', map.getContainer().clientWidth);
    svgLines.setAttribute('height', map.getContainer().clientHeight);
    svgLines.innerHTML = out.join('');
  }

  // 팝업이 열려 있는 동안 이름표가 팝업을 가리지 않도록 흐리게
  map.on('popupopen', () => overlay.classList.add('dim'));
  map.on('popupclose', () => overlay.classList.remove('dim'));
  map.on('zoomstart', () => overlay.classList.add('zooming'));
  map.on('move', () => { if (!overlay.classList.contains('zooming')) drawLines(); });
  map.on('moveend', () => { overlay.classList.remove('zooming'); requestAnimationFrame(layoutCallouts); });
  map.on('resize', () => requestAnimationFrame(layoutCallouts));
  function relayoutSync() {
    const b = $('#sync');
    if (!b || b.hidden) return;
    layoutEvLabels(b);
    document.body.style.setProperty('--sync-h', b.offsetHeight + 'px');
  }
  window.addEventListener('resize', relayoutSync);
  map.on('resize', relayoutSync);

  function renderLegend(era) {
    const rows = [];
    const seen = new Set();
    era.territories.forEach((t) => {
      if (seen.has(t.name)) return; seen.add(t.name);
      const dashed = t.style === 'dashed';
      const op = t.style === 'neighbor' ? 0.35 : t.style === 'overlay' ? 0.85 : 0.6;
      rows.push(`<div class="legend-row"><span class="legend-sw${dashed ? ' dashed' : ''}" style="background:${hexA(t.color, op)};border-color:${t.color}"></span>${esc(t.name)}</div>`);
    });
    const types = [...new Set(era.markers.map((m) => m.type))];
    if (types.length) {
      if (rows.length) rows.push('<div class="legend-sep"></div>');
      types.forEach((ty) => rows.push(`<div class="legend-row"><span class="mk-legend">${markerHtml(ty)}</span>${TYPE_LABEL[ty]}</div>`));
    }
    const kinds = [...new Set(era.lines.map((l) => l.kind))];
    const KL = { attack: '진격·침입로', route: '이동·교류로', wall: '성곽·방어선', border: '경계선' };
    if (kinds.length) {
      rows.push('<div class="legend-sep"></div>');
      kinds.forEach((k) => {
        const s = LINE_STYLE[k];
        rows.push(`<div class="legend-row"><svg width="22" height="10"><line x1="1" y1="5" x2="21" y2="5" stroke="#555" stroke-width="${Math.min(s.weight, 4)}" stroke-dasharray="${s.dashArray ? s.dashArray.split(' ').map((v) => v / 2).join(' ') : ''}"/></svg>${KL[k]}</div>`);
      });
    }
    const lg = $('#legend');
    lg.innerHTML = rows.length ? `<button class="legend-toggle" type="button">범례 <span>${lg.classList.contains('collapsed') ? '▸' : '▾'}</span></button><div class="legend-body">${rows.join('')}</div>` : '';
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // ── 패널 ─────────────────────────────
  // 기출 분석 시험 포인트 (70~79회)
  // 오답 노트(review.html)의 복습 대상 문항이 걸린 기출 포인트: '시대:번호' → 개수
  const MY_WRONG = new Map();
  (window.MY_LOG || []).forEach((l) => l.wrong.forEach((n) => {
    const row = ((window.EXAM || {})[l.round] || []).find((x) => x[0] === n);
    if (!row || row[7] < 0 || row[3] < 2 || !['하', '중'].includes(row[4])) return;
    const k = row[6] + ':' + row[7];
    MY_WRONG.set(k, (MY_WRONG.get(k) || 0) + 1);
  }));

  function gichulHtml(era) {
    const g = (window.GICHUL || {})[era.id];
    if (!g) return '';
    const ex = (window.GICHUL_EX || {})[era.id] || [];
    const star = (n) => (n >= 3 ? '★★★' : n === 2 ? '★★' : '★');
    const exHtml = (x) => {
      if (!x || (!x.o.length && !x.q.length)) return '';
      const o = x.o.map(([t, c, k, rs]) => `<li><q>${esc(t)}</q><span class="ex-meta">${c > 1 ? `<b>${c}회</b> 출제` : '1회 출제'}${k ? ` · 정답 ${k}회` : ''} · ${rs.join('·')}회</span></li>`).join('');
      const q = x.q.map(([t, r, num, ans]) => `<li><blockquote>${esc(t)}</blockquote><span class="ex-meta">${r}회 ${num}번${ans ? ` → 정답 <q>${esc(ans)}</q>` : ''}</span></li>`).join('');
      return `<div class="ex-box">${o ? `<p class="ex-h">선택지에 이렇게 나와요</p><ul class="ex-o">${o}</ul>` : ''}${q ? `<p class="ex-h">지문(자료)에 이렇게 나와요</p><ul class="ex-q">${q}</ul>` : ''}</div>`;
    };
    const any = ex.some((x) => x && (x.o.length || x.q.length));
    return `
      <div class="section-title">기출 시험 포인트 <small>(한능검 심화 70~79회 · 이 시대 ${g.n}문항)</small>${any ? `<button class="ex-all" type="button" aria-pressed="${!!state.exAll}">${state.exAll ? '기출 문장 모두 접기' : '기출 문장 모두 펼치기'}</button>` : ''}</div>
      <p class="gichul-top">자주 나온 주제: ${esc(g.top)}</p>
      <ul class="points gichul">${g.pts.map(([n, t], i) => {
        const e = exHtml(ex[i]);
        const mw = MY_WRONG.get(era.id + ':' + i);
        return `<li class="f${Math.min(n, 3)}${e && state.exAll ? ' ex-open' : ''}"><span class="freq">${star(n)}</span>${t}${mw ? `<a class="my-wrong" href="review.html" title="오답 노트의 복습 대상 문항">내 오답 ${mw}</a>` : ''}${e ? `<button class="ex-btn" type="button">기출 문장</button>${e}` : ''}</li>`;
      }).join('')}</ul>
      <p class="gichul-legend">★★★ 3회 이상 · ★★ 2회 · ★ 1회(정답) 출제 · <b>기출 문장</b>을 누르면 실제 시험의 선택지·지문 표현을 볼 수 있어요 (국사편찬위원회 출제 문항 발췌)</p>`;
  }

  // 시대별 기출 문장 모아 보기: 많이 나온 순 / 정답으로 많이 나온 순
  function topHtml(era) {
    const all = (window.GICHUL_TOP || {})[era.id];
    if (!all || !all.length) return '';
    const byK = state.topSort === 'k';
    const rows = byK
      ? all.filter((r) => r[2]).sort((a, b) => b[2] - a[2] || b[2] / b[1] - a[2] / a[1] || b[1] - a[1])
      : all.slice().sort((a, b) => b[1] - a[1] || b[2] - a[2]);
    const LIMIT = 10;
    const shown = state.topMore ? rows : rows.slice(0, LIMIT);
    return `
      <div class="section-title">기출 문장 모아 보기 <small>(이 시대 선택지 · 70~79회)</small></div>
      <div class="top-tools">
        <span class="seg"><button data-top="n" aria-pressed="${!byK}">많이 나온 순</button><button data-top="k" aria-pressed="${byK}">정답 많은 순</button></span>
        <span class="top-help">${byK ? '정답 선택지로 나온 횟수 순 (같으면 정답률 높은 순)' : '선택지로 나온 횟수 순 (정답·오답 모두)'}</span>
      </div>
      <ol class="top-list">${shown.map(([t, c, k, rs], i) => `
        <li class="${k ? 'has-k' : ''}"><span class="top-rank">${i + 1}</span><div><q>${esc(t)}</q>
          <span class="ex-meta"><b>${c}회</b> 출제 · ${k ? `<em>정답 ${k}회 (${Math.round((k / c) * 100)}%)</em>` : '정답 0회'} · ${rs.join('·')}회</span></div></li>`).join('')}</ol>
      ${rows.length > LIMIT ? `<button class="top-more" type="button">${state.topMore ? '접기' : `더 보기 (${rows.length - LIMIT}개 더)`}</button>` : ''}`;
  }

  function renderPanel() {
    const era = ERAS[state.era];
    const G = (window.GICHUL || {})[era.id];
    $('#era-name').textContent = era.name;
    $('#era-period').textContent = era.period;

    const evs = era.markers.map((m, i) => `
      <li data-marker="${esc(m.name)}">
        <span class="mk-legend">${markerHtml(m.type)}</span>
        <span class="ev-name">${esc(m.name)}${m.desc ? `<span class="ev-desc">${esc(m.desc)}</span>` : ''}</span>
        <span class="ev-year">${esc(m.year || '')}</span>
      </li>`).join('');

    $('#tab-info').innerHTML = `
      <p class="summary">${esc(era.summary)}</p>
      ${gichulHtml(era)}
      <div id="top-box">${topHtml(era)}</div>
      <details class="old-points"${G ? '' : ' open'}><summary class="section-title">기본 시험 포인트</summary>
      <ul class="points">${era.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></details>
      ${evs ? `<div class="section-title">지도 위 사건·장소 <small>(누르면 지도 이동)</small></div><ul class="event-list">${evs}</ul>` : ''}
    `;

    renderRulers();

    const notes = NOTES.filter((n) => noteEras(n).includes(era.id));
    $('#note-count').textContent = notes.length || '';
    $('#tab-notes').innerHTML = notes.length
      ? notes.map(renderNote).join('')
      : `<div class="empty-notes"><strong>아직 이 시대의 판서 노트가 없어요</strong>판서 사진을 Claude에게 보내면 표로 정리해서 여기에 추가해 드립니다.</div>`;
    ['#tab-info', '#tab-notes'].forEach((id) => linkArtifacts($(id)));
  }

  function formatCell(src) {
    const withLinks = String(src).replace(/\{\{([^}|]+)(?:\|([^}]*))?\}\}/g, (_, name, label) =>
      `<a class="place" data-place="${esc(name.trim())}">${label != null ? label : esc(name.trim())}</a>`);
    return withLinks.split('|').map((l) => `<span class="ln">${l}</span>`).join('');
  }

  // 판서 노트의 era 는 문자열 하나 또는 여러 시대 배열
  function noteEras(n) { return [].concat(n.era); }

  // 셀은 문자열 또는 { html, span, rowspan } (span = 가로로, rowspan = 세로로 합칠 칸 수)
  function tableHtml(t) {
    const td = (c) => (typeof c === 'object'
      ? `<td colspan="${c.span || 1}" rowspan="${c.rowspan || 1}">${formatCell(c.html)}</td>`
      : `<td>${formatCell(c)}</td>`);
    // label 이 null 이면 왼쪽 제목 칸 없이 셀만 그린다
    const tr = (r) => `<tr>${r.label === null ? '' : `<th class="row-label"><span>${esc(r.label)}</span></th>`}${r.cells.map(td).join('')}</tr>`;
    return `<div class="chalk-wrap"><table class="chalk"><thead>${t.head.map(tr).join('')}</thead><tbody>${t.rows.map(tr).join('')}</tbody></table></div>`;
  }

  // 흥망 곡선 그래프 (판서의 그래프를 SVG로 재현)
  function curveHtml(n) {
    const c = n.curve;
    const W = 1000, H = c.height || 660, base = c.base || 540, left = 60, right = c.right || 860, scale = c.scale || 3.8;
    const X = (yr) => left + ((yr - c.range[0]) / (c.range[1] - c.range[0])) * (right - left);
    const Y = (v) => base - v * scale;
    const vAt = (yr) => {
      const p = c.points;
      for (let i = 1; i < p.length; i++) {
        if (yr <= p[i][0]) { const [x0, v0] = p[i - 1], [x1, v1] = p[i]; return v0 + ((v1 - v0) * (yr - x0)) / (x1 - x0); }
      }
      return p[p.length - 1][1];
    };
    const pts = c.points.map(([yr, v]) => [X(yr), Y(v)]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1} ${c2} ${p2}`;
    }
    const mid = `ah-${n.id}`;
    const parts = [];
    // 축
    parts.push(`<line class="axis" x1="${left}" y1="${base}" x2="${right + 20}" y2="${base}"/><line class="axis" x1="${left}" y1="${base}" x2="${left}" y2="20"/>`);
    (c.tickMarks || []).forEach((yr) => parts.push(`<line class="axis" x1="${X(yr)}" y1="${base - 6}" x2="${X(yr)}" y2="${base + 6}"/>`));
    (c.ticks || []).forEach((t) => {
      const x = X(t.at);
      if (t.circle) parts.push(`<circle class="tick-circle" cx="${x}" cy="${base + 21}" r="13"/>`);
      parts.push(`<text class="tick" x="${x}" y="${base + 26}" text-anchor="middle">${esc(t.label)}</text>`);
    });
    // 도읍 막대
    (c.capitals || []).forEach(([name, a, b]) => {
      const x1 = X(a), x2 = X(b), y = base + 62;
      parts.push(`<line class="cap" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line class="cap" x1="${x1}" y1="${y - 7}" x2="${x1}" y2="${y + 7}"/><line class="cap" x1="${x2}" y1="${y - 7}" x2="${x2}" y2="${y + 7}"/>`);
      parts.push(`<text class="cap-label" x="${(x1 + x2) / 2}" y="${y + 5}" text-anchor="middle">${esc(name)}</text>`);
    });
    parts.push(`<path class="curve-line" d="${d}"/>`);
    // 주석
    (n.annos || []).forEach((a) => {
      if (a.box) {
        const [bx, by, bw, bh] = a.box;
        const ax = X(a.at), ay = Y(vAt(a.at));
        const top = by + 10;
        const tx = Math.max(bx + 8, Math.min(ax, bx + bw - 8));
        const ty = Math.max(top, Math.min(ay, by + bh));
        parts.push(`<line class="lead" x1="${ax}" y1="${ay}" x2="${tx}" y2="${ty}"/><circle class="dot" cx="${ax}" cy="${ay}" r="4.5"/>`);
        parts.push(`<foreignObject x="${bx}" y="${by}" width="${bw}" height="${bh}"><div xmlns="http://www.w3.org/1999/xhtml" class="cbox"><div class="cbox-title">${esc(a.title)}</div><div class="cbox-body">${formatCell(a.body)}</div></div></foreignObject>`);
      } else {
        if (a.arrow) {
          const [[x1, y1], [x2, y2]] = a.arrow;
          parts.push(`<line class="arrow ${a.color || ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${mid})"/>`);
        }
        if (a.at != null && a.dot) parts.push(`<circle class="dot" cx="${X(a.at)}" cy="${Y(vAt(a.at))}" r="4.5"/>`);
        const [lx, ly] = a.pos;
        const lines = String(a.text).split('|');
        parts.push(`<text class="clabel q ${a.color || ''}" x="${lx}" y="${ly}" text-anchor="${a.anchor || 'start'}">${lines.map((l, i) => `<tspan x="${lx}" dy="${i ? 19 : 0}">${esc(l)}</tspan>`).join('')}</text>`);
      }
    });
    return `
      <div class="curve-wrap">
        <button class="curve-close" data-act="shrink" type="button">✕ 닫기</button>
        <svg class="curve" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(n.title)}">
          <defs><marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker></defs>
          ${parts.join('')}
        </svg>
      </div>`;
  }

  function renderNote(n) {
    const imgs = (n.images || []).map((src) => `<img src="${esc(src)}" alt="${esc(n.title)} 원본 판서" loading="lazy">`).join('');
    const isCurve = n.type === 'curve';
    const body = isCurve
      ? (n.caption ? `<p class="note-caption">${formatCell(n.caption)}</p>` : '') + curveHtml(n) + (n.table ? `${n.table.title ? `<div class="sub-title">${esc(n.table.title)}</div>` : ''}${tableHtml(n.table)}` : '')
      : tableHtml(n);
    return `
      <article class="note-card" data-note="${esc(n.id)}">
        <div class="note-head">
          <h3>${esc(n.title)}</h3>
          <div class="note-actions">
            ${isCurve ? '<button data-act="expand" aria-pressed="false">크게 보기</button>' : ''}
            <button data-act="quiz" aria-pressed="false">암기 모드</button>
            ${imgs ? '<button data-act="img" aria-pressed="false">원본 판서</button>' : ''}
          </div>
        </div>
        ${body}
        ${imgs ? `<div class="note-img" hidden>${imgs}</div>` : ''}
      </article>`;
  }

  // ── 왕·대통령 ─────────────────────────────
  function stateColor(name) {
    return COLORS[name] || { 태봉: COLORS.태봉, 일제: COLORS.일제 }[name] || '#888';
  }

  // 동시대 나란히 보기: 행 = 왕이 바뀐 해, 열 = 나라. 한 왕의 재위는 세로로 이어진 칸 하나
  function rulerGridHtml(era) {
    const d = syncData(era);
    if (!d) return '';
    const own = eraRulers(era);
    const lo0 = Math.min(...own.map((x) => x.span[0]));
    const cols = d.lanes.flatMap((l) => Array.from({ length: l.rows }, (_, r) => ({ l, r, rs: l.rs.filter((x) => x.row === r) })));
    const years = [...new Set([lo0, ...cols.flatMap((c) => c.rs.map((x) => x.span[0]))])].filter((y) => y >= lo0 && y < d.hi).sort((a, b) => a - b);
    const covers = (x, y) => y >= x.span[0] && y < x.span[1];
    const cur = RULER_SEQ[state.rulerPos];
    const skip = cols.map(() => 0);
    const body = years.map((y, i) => {
      const tds = cols.map((c, ci) => {
        if (skip[ci] > 0) { skip[ci]--; return ''; }
        const k = c.rs.find((x) => covers(x, y));
        let n = 1;
        while (i + n < years.length && (k ? covers(k, years[i + n]) : !c.rs.some((x) => covers(x, years[i + n])))) n++;
        skip[ci] = n - 1;
        const rs = n > 1 ? ` rowspan="${n}"` : '';
        if (!k) return `<td class="g-empty"${rs}></td>`;
        const isCur = cur && cur.ei === k.ei && cur.ri === k.ri;
        const cont = k.span[0] < y; // 이전 시대부터 이어지는 재위
        return `<td class="g-king${k.ext ? ' ext' : ''}${isCur ? ' current' : ''}"${rs} style="--c:${stateColor(c.l.st)}" data-ei="${k.ei}" data-ri="${k.ri}">
          <b>${esc(k.r.name)}</b><small>${esc(k.r.reign)}${cont ? ' · 이어짐' : ''}</small>${k.r.key && !k.ext ? `<span class="g-key">${esc(k.r.key)}</span>` : ''}${k.ext ? `<span class="g-key">${esc(ERAS[k.ei].name)}</span>` : ''}</td>`;
      }).join('');
      return `<tr><th class="g-year">${fmtYear(y)}</th>${tds}</tr>`;
    }).join('');
    const head = d.lanes.map((l) => `<th colspan="${l.rows}" style="--c:${stateColor(l.st)}">${esc(l.st)}</th>`).join('');
    return `<div class="rgrid-wrap"><table class="rgrid"><thead><tr><th class="g-year">즉위</th>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function renderRulers() {
    const era = ERAS[state.era];
    const list = RULERS[era.id] || [];
    $('#ruler-count').textContent = list.length || '';
    const box = $('#tab-rulers');
    if (!list.length) { box.innerHTML = '<div class="empty-notes"><strong>이 시대에는 정리된 인물이 없어요</strong></div>'; return; }

    const cur = RULER_SEQ[state.rulerPos];
    const states = [...new Set(list.map((r) => r.state))];
    if (!states.includes(state.rulerFilter)) state.rulerFilter = 'all';
    const multi = states.length > 1;
    const grid = multi && state.rulerView === 'grid';

    const items = list.map((r, ri) => {
      if (state.rulerFilter !== 'all' && r.state !== state.rulerFilter) return '';
      const isCur = cur && cur.ei === state.era && cur.ri === ri;
      const bare = !r.key && !(r.items || []).length;
      return `
        <li class="ruler${isCur ? ' current' : ''}${bare ? ' compact' : ''}" data-ri="${ri}" style="--c:${stateColor(r.state)}">
          <div class="ruler-card">
            <div class="ruler-top">
              <span class="ruler-state">${esc(r.state)}</span>
              <span class="ruler-name">${esc(r.name)}</span>
              <span class="ruler-reign">${esc(r.reign)}</span>
            </div>
            ${r.key ? `<div class="ruler-key">${esc(r.key)}</div>` : ''}
            ${bare ? '' : `<ul class="ruler-items">${r.items.map((it) => `<li>${formatCell(it)}</li>`).join('')}</ul>`}
          </div>
        </li>`;
    }).join('');

    const pos = state.rulerPos;
    box.innerHTML = `
      <div class="stepper">
        <button data-step="-1" ${pos <= 0 ? 'disabled' : ''}>◀ 이전</button>
        <div class="step-now"><b>${cur ? esc(cur.r.name) : ''}</b><small>${pos + 1} / ${RULER_SEQ.length} · ${cur ? esc(ERAS[cur.ei].name) : ''}</small></div>
        <button data-step="1" ${pos >= RULER_SEQ.length - 1 ? 'disabled' : ''}>다음 ▶</button>
      </div>
      <div class="ruler-tools">
        ${multi ? `<span class="seg"><button data-view="list" aria-pressed="${!grid}">목록</button><button data-view="grid" aria-pressed="${grid}">동시대 나란히</button></span>` : ''}
        ${multi && !grid ? ['all', ...states].map((st) => `<button data-filter="${esc(st)}" aria-pressed="${state.rulerFilter === st}">${st === 'all' ? '전체' : esc(st)}</button>`).join('') : ''}
        <span class="spacer"></span>
        ${grid ? '' : `<button data-act="rquiz" aria-pressed="${state.rulerQuiz}">정책 가리기</button>`}
      </div>
      ${grid ? `<p class="rgrid-help">같은 줄에 있는 왕들이 같은 시기에 재위했어요. 칸을 누르면 그 왕의 정책을 볼 수 있어요. <span class="ext-sample">흐린 칸</span>은 앞뒤 시대에 정리된 왕이에요.</p>${rulerGridHtml(era)}`
        : `<ol class="ruler-list${state.rulerQuiz ? ' quiz' : ''}">${items}</ol>`}`;
    linkArtifacts(box);
  }

  // 연표·나란히 보기에서 왕을 누르면 목록에서 그 왕을 보여 준다
  function selectRuler(ei, ri) {
    const pos = RULER_SEQ.findIndex((x) => x.ei === ei && x.ri === ri);
    if (pos < 0) return;
    state.rulerPos = pos;
    state.rulerView = 'list'; store.set('rulerView', 'list');
    state.rulerFilter = 'all';
    if (ei !== state.era) goEra(ei, { keepRuler: true }); else renderRulers();
    setTab('rulers');
    scrollToCurrentRuler();
  }

  function scrollToCurrentRuler() {
    const el = $('#tab-rulers .ruler.current');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function stepRuler(delta) {
    const next = Math.max(0, Math.min(RULER_SEQ.length - 1, state.rulerPos + delta));
    if (next === state.rulerPos) return;
    state.rulerPos = next;
    const { ei } = RULER_SEQ[next];
    if (ei !== state.era) goEra(ei, { keepRuler: true }); else renderRulers();
    setTab('rulers');
    scrollToCurrentRuler();
  }

  function setTab(tab) {
    state.tab = tab;
    store.set('tab', tab);
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $('#tab-info').hidden = tab !== 'info';
    $('#tab-notes').hidden = tab !== 'notes';
    $('#tab-rulers').hidden = tab !== 'rulers';
  }

  // ── 타임라인 ─────────────────────────────
  function renderTimeline() {
    $('#timeline').innerHTML = ERAS.map((e, i) => {
      const hasNote = NOTES.some((n) => noteEras(n).includes(e.id));
      return `<li><button data-i="${i}" title="${esc(e.period)}">${esc(e.name)}${hasNote ? '<span class="dot" title="판서 노트 있음"></span>' : ''}<small>${esc(e.period.split('(')[0].trim())}</small></button></li>`;
    }).join('');
  }

  function goEra(i, opts) {
    opts = opts || {};
    state.era = Math.max(0, Math.min(ERAS.length - 1, i));
    const era = ERAS[state.era];
    state.topMore = false;
    if (!opts.fromSearch) { state.hlTerms = null; const c = document.getElementById('search-clear'); if (c) c.hidden = true; }
    if (!opts.keepRuler) {
      const first = RULER_SEQ.findIndex((x) => x.ei === state.era);
      if (first >= 0) state.rulerPos = first;
      state.rulerFilter = 'all';
    }
    document.querySelectorAll('#timeline button').forEach((b) => b.classList.toggle('active', +b.dataset.i === state.era));
    const active = $(`#timeline button[data-i="${state.era}"]`);
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    drawEra(opts.fit !== false);
    renderPanel();
    if (history.replaceState) history.replaceState(null, '', '#' + era.id);
  }

  // ── 화면 배치 (지도 크게 · 반반 · 노트 크게) ─────────────────────────────
  function setLayout(mode, opts) {
    if (!['map', 'split', 'panel'].includes(mode)) mode = 'split';
    const prev = document.body.dataset.layout;
    document.body.dataset.layout = mode;
    state.layout = mode;
    store.set('layout', mode);
    document.querySelectorAll('.layout-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layout === mode)));
    // 지도가 다시 보이거나 크기가 바뀌면 크기를 다시 계산하고 시대 범위에 맞춘다
    if (mode !== 'panel' && prev !== mode) {
      requestAnimationFrame(() => {
        map.invalidateSize();
        if ((prev === 'panel' || !prev) && !(opts && opts.noFit)) map.fitBounds(ERAS[state.era].view, { padding: [20, 20], animate: false });
      });
    }
  }
  document.querySelector('.layout-switch').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-layout]');
    if (b) setLayout(b.dataset.layout);
  });

  function focusMarker(name) {
    // 노트 크게 상태에서 지명을 누르면 지도가 보이도록 반반으로 전환
    if (state.layout === 'panel') { setLayout('split', { noFit: true }); map.invalidateSize(); }
    let hit = markerByName.get(name);
    if (!hit) {
      // 다른 시대에서 찾기
      const idx = ERAS.findIndex((e) => e.markers.some((m) => m.name === name));
      const fuzzy = idx < 0 ? ERAS.findIndex((e) => e.markers.some((m) => m.name.includes(name) || name.includes(m.name))) : idx;
      if (fuzzy < 0) return;
      goEra(fuzzy);
      hit = markerByName.get(name) || [...markerByName.values()].find((v) => v.data.name.includes(name) || name.includes(v.data.name));
      if (!hit) return;
    }
    const { marker } = hit;
    // 아래쪽 타임라인에 가리지 않도록 마커를 화면 중앙보다 조금 위에 둔다
    const z = Math.max(map.getZoom(), 7);
    const pt = map.project(marker.getLatLng(), z).add([0, 70]);
    map.flyTo(map.unproject(pt, z), z, { duration: 0.8 });
    map.once('moveend', () => {
      marker.openPopup();
      const el = marker.getElement() && marker.getElement().querySelector('.mk');
      if (el) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
    });
    if (window.matchMedia('(max-width: 900px)').matches) $('.map-wrap').scrollIntoView({ behavior: 'smooth' });
  }

  // ── 검색 ─────────────────────────────
  const index = [];
  ERAS.forEach((e, ei) => {
    index.push({ kind: 'era', ei, title: e.name, sub: e.period, text: e.name + ' ' + e.summary + ' ' + e.points.join(' ') + ' ' + (((window.GICHUL || {})[e.id] || {}).pts || []).map((p) => stripTags(p[1])).join(' ') });
    e.markers.forEach((m) => index.push({ kind: 'marker', ei, title: m.name + (m.year ? ` (${m.year})` : ''), name: m.name, sub: e.name, text: [m.name, m.year, m.desc, m.tag].join(' ') }));
  });
  RULER_SEQ.forEach(({ ei, r }, pos) => {
    index.push({ kind: 'ruler', ei, pos, title: `👑 ${r.name} (${r.reign})`, sub: `${ERAS[ei].name} · ${r.state}`, text: [r.state, r.name, r.key, ...r.items].map(stripTags).join(' ') });
  });
  NOTES.forEach((n) => {
    const ei = ERAS.findIndex((e) => e.id === noteEras(n)[0]);
    const tables = [n, n.table].filter((t) => t && t.head);
    const annos = (n.annos || []).map((a) => [a.title, a.body, a.text].filter(Boolean).join(' '));
    const text = [n.title, ...annos, ...tables.flatMap((t) => [...t.head.flatMap((r) => [r.label, ...r.cells]), ...t.rows.flatMap((r) => [r.label, ...r.cells])])].filter((c) => c != null).map((c) => stripTags(typeof c === 'object' ? c.html : c)).join(' ');
    index.push({ kind: 'note', ei, title: '📝 ' + n.title, sub: (ERAS[ei] || {}).name + ' · 판서 노트', text, note: n.id });
  });

  let results = [];
  let lastTerms = [];
  let cursor = -1;
  function runSearch(q) {
    const ul = $('#search-results');
    q = q.trim().replace(/\s+/g, ' ');
    if (!q) { ul.hidden = true; return; }
    const terms = q.split(' ');
    results = index.filter((it) => terms.every((t) => (it.title + ' ' + it.text).includes(t)))
      .sort((a, b) => (b.title.includes(q) - a.title.includes(q)) || (a.kind === 'marker' ? -1 : 1))
      .slice(0, 30);
    cursor = -1;
    lastTerms = terms;
    ul.innerHTML = results.length
      ? results.map((r, i) => {
        // 제목에 없는 검색어는 본문에서 앞뒤 문맥을 잘라 보여 준다
        const missing = terms.filter((t) => !r.title.includes(t));
        let snip = '';
        if (missing.length) {
          const at = r.text.indexOf(missing[0]);
          if (at >= 0) snip = (at > 18 ? '…' : '') + r.text.slice(Math.max(0, at - 18), at + missing[0].length + 26).trim() + '…';
        }
        return `<li data-r="${i}">${markTerms(r.title, terms)}${snip ? `<span class="sr-snip">${markTerms(snip, terms)}</span>` : ''}<span class="sr-era">${esc(r.sub)}</span></li>`;
      }).join('')
      : '<li class="sr-empty">검색 결과가 없습니다</li>';
    ul.hidden = false;
  }
  function markTerms(text, terms) {
    let html = esc(text);
    terms.filter(Boolean).sort((a, b) => b.length - a.length).forEach((t) => {
      html = html.split(esc(t)).join(`\u0000${esc(t)}\u0001`);
    });
    return html.replace(/\u0000/g, '<mark>').replace(/\u0001/g, '</mark>');
  }

  // 화면(패널·지도 이름표)에서 검색어를 찾아 형광펜으로 칠하고 첫 번째 위치로 스크롤
  function clearHighlights() {
    document.querySelectorAll('mark.hl').forEach((m) => m.replaceWith(document.createTextNode(m.textContent)));
    document.querySelectorAll('.panel .ln, .panel li, .panel td').forEach((el) => el.normalize && el.normalize());
    document.querySelectorAll('.callout.hl, .hl-row').forEach((el) => el.classList.remove('hl', 'hl-row'));
  }
  function highlightIn(root, terms) {
    if (!root || !terms.length) return [];
    const re = new RegExp('(' + terms.filter(Boolean).sort((a, b) => b.length - a.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('script, style, mark, button, .stepper') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const marks = [];
    nodes.forEach((node) => {
      re.lastIndex = 0;
      if (!re.test(node.nodeValue)) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(re).forEach((part, i) => {
        if (!part) return;
        if (i % 2) { const m = document.createElement('mark'); m.className = 'hl'; m.textContent = part; frag.appendChild(m); marks.push(m); }
        else frag.appendChild(document.createTextNode(part));
      });
      node.parentNode.replaceChild(frag, node);
    });
    return marks;
  }
  function applyHighlights(terms, scrollTarget) {
    clearHighlights();
    const tab = $('#tab-' + state.tab);
    const marks = highlightIn(tab, terms);
    document.querySelectorAll('.callout').forEach((c) => { if (terms.some((t) => c.textContent.includes(t))) c.classList.add('hl'); });
    const first = (scrollTarget && scrollTarget.querySelector('mark.hl')) || marks[0];
    if (first) {
      const row = first.closest('tr, li, .cbox');
      if (row) row.classList.add('hl-row');
      first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first.classList.add('hl-first');
    }
    $('#search-clear').hidden = false;
  }

  function pickResult(i) {
    const r = results[i];
    if (!r) return;
    const terms = lastTerms.slice();
    $('#search-results').hidden = true;
    $('#search').blur();
    state.hlTerms = terms;
    if (r.kind === 'marker') { if (state.era !== r.ei) goEra(r.ei, { fromSearch: true }); setTab('info'); focusMarker(r.name); }
    else if (r.kind === 'ruler') { goEra(r.ei, { fromSearch: true }); state.rulerPos = r.pos; renderRulers(); setTab('rulers'); scrollToCurrentRuler(); }
    else if (r.kind === 'note') { goEra(r.ei, { fromSearch: true }); setTab('notes'); }
    else { goEra(r.ei, { fromSearch: true }); setTab('info'); }
    const target = r.kind === 'note' ? document.querySelector(`[data-note="${r.note}"]`)
      : r.kind === 'ruler' ? $('#tab-rulers .ruler.current')
        : r.kind === 'marker' ? document.querySelector(`#tab-info li[data-marker="${CSS.escape(r.name)}"]`) : null;
    // 지도 이동·이름표 배치가 끝난 뒤 칠한다
    setTimeout(() => applyHighlights(terms, target), r.kind === 'marker' ? 950 : 60);
  }

  // ── 이벤트 연결 ─────────────────────────────
  $('#timeline').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) goEra(+b.dataset.i); });
  $('#prev').addEventListener('click', () => goEra(state.era - 1));
  $('#next').addEventListener('click', () => goEra(state.era + 1));
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

  $('#tab-info').addEventListener('click', (e) => {
    const tb = e.target.closest('button[data-top]');
    if (tb || e.target.closest('.top-more')) {
      if (tb) { state.topSort = tb.dataset.top; store.set('topSort', state.topSort); } else state.topMore = !state.topMore;
      $('#top-box').innerHTML = topHtml(ERAS[state.era]);
      return;
    }
    const xb = e.target.closest('.ex-btn');
    if (xb) { xb.parentElement.classList.toggle('ex-open'); return; }
    if (e.target.closest('.ex-all')) {
      state.exAll = !state.exAll; store.set('exAll', state.exAll);
      const top = $('#tab-info').scrollTop; renderPanel(); $('#tab-info').scrollTop = top; return;
    }
    const li = e.target.closest('li[data-marker]');
    if (!li) return;
    document.querySelectorAll('.event-list li').forEach((x) => x.classList.toggle('active', x === li));
    focusMarker(li.dataset.marker);
  });

  $('#tab-rulers').addEventListener('click', (e) => {
    const place = e.target.closest('a.place');
    if (place) { focusMarker(place.dataset.place); return; }
    const step = e.target.closest('button[data-step]');
    if (step) { stepRuler(+step.dataset.step); return; }
    const f = e.target.closest('button[data-filter]');
    if (f) { state.rulerFilter = f.dataset.filter; renderRulers(); return; }
    if (e.target.closest('button[data-act="rquiz"]')) { state.rulerQuiz = !state.rulerQuiz; renderRulers(); return; }
    const v = e.target.closest('button[data-view]');
    if (v) { state.rulerView = v.dataset.view; store.set('rulerView', state.rulerView); renderRulers(); return; }
    const g = e.target.closest('.g-king');
    if (g) { selectRuler(+g.dataset.ei, +g.dataset.ri); return; }
    const li = e.target.closest('.ruler');
    if (!li) return;
    const ri = +li.dataset.ri;
    if (state.rulerQuiz && !li.classList.contains('revealed')) li.classList.add('revealed');
    state.rulerPos = RULER_SEQ.findIndex((x) => x.ei === state.era && x.ri === ri);
    document.querySelectorAll('#tab-rulers .ruler').forEach((x) => x.classList.toggle('current', x === li));
    const now = RULER_SEQ[state.rulerPos];
    $('#tab-rulers .step-now').innerHTML = `<b>${esc(now.r.name)}</b><small>${state.rulerPos + 1} / ${RULER_SEQ.length} · ${esc(ERAS[now.ei].name)}</small>`;
    $('#tab-rulers [data-step="-1"]').disabled = state.rulerPos <= 0;
    $('#tab-rulers [data-step="1"]').disabled = state.rulerPos >= RULER_SEQ.length - 1;
  });

  $('#tab-notes').addEventListener('click', (e) => {
    const place = e.target.closest('a.place');
    if (place) { focusMarker(place.dataset.place); return; }
    const btn = e.target.closest('button[data-act]');
    if (btn) {
      const card = btn.closest('.note-card');
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      if (btn.dataset.act === 'quiz') {
        card.querySelectorAll('.chalk, .curve').forEach((el) => el.classList.toggle('quiz', on));
        card.querySelectorAll('.revealed').forEach((el) => el.classList.remove('revealed'));
      } else if (btn.dataset.act === 'expand' || btn.dataset.act === 'shrink') {
        const open = btn.dataset.act === 'expand' ? on : false;
        card.classList.toggle('expanded', open);
        const eb = $('button[data-act="expand"]', card);
        if (eb) eb.setAttribute('aria-pressed', String(open));
        document.body.classList.toggle('no-scroll', open);
      } else {
        $('.note-img', card).hidden = !on;
      }
      return;
    }
    const td = e.target.closest('.chalk.quiz td');
    if (td) { td.classList.toggle('revealed'); return; }
    const qc = e.target.closest('.curve.quiz .cbox, .curve.quiz .clabel');
    if (qc) { qc.classList.toggle('revealed'); return; }
    const img = e.target.closest('.note-img img');
    if (img) openLightbox(img.src, '');
  });
  const legendEl = $('#legend');
  if (store.get('legendCollapsed', window.matchMedia('(max-width: 900px)').matches)) legendEl.classList.add('collapsed');
  legendEl.addEventListener('click', (e) => {
    if (!e.target.closest('.legend-toggle')) return;
    const c = legendEl.classList.toggle('collapsed');
    store.set('legendCollapsed', c);
    $('.legend-toggle span', legendEl).textContent = c ? '▸' : '▾';
  });
  L.DomEvent.disableClickPropagation(legendEl);
  L.DomEvent.disableScrollPropagation(legendEl);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.artifact, img.pop-img');
    if (!a) return;
    e.stopPropagation();
    const art = ARTIFACTS[a.dataset.art];
    if (art) openLightbox(art.src, art.caption || a.dataset.art);
  }, true);

  $('#lightbox').addEventListener('click', () => { $('#lightbox').hidden = true; });

  const tgLabels = $('#tg-labels');
  tgLabels.checked = state.allLabels;
  tgLabels.addEventListener('change', () => { state.allLabels = tgLabels.checked; store.set('labelsOn', state.allLabels); drawEra(false); });
  const tgGeo = $('#tg-rivers');
  tgGeo.checked = state.geoLabels;
  const syncGeo = () => { state.geoLabels = tgGeo.checked; store.set('geoLabels', state.geoLabels); tgGeo.checked ? gGeo.addTo(map) : map.removeLayer(gGeo); };
  tgGeo.addEventListener('change', syncGeo);

  const search = $('#search');
  search.addEventListener('input', () => runSearch(search.value));
  search.addEventListener('focus', () => { if (search.value) runSearch(search.value); });
  $('#search-clear').addEventListener('click', () => { clearHighlights(); state.hlTerms = null; search.value = ''; $('#search-clear').hidden = true; });
  search.addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('#search-results li[data-r]');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      cursor = (cursor + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(items.length, 1);
      items.forEach((li, i) => li.classList.toggle('active', i === cursor));
    } else if (e.key === 'Enter') { pickResult(cursor < 0 ? 0 : cursor); }
    else if (e.key === 'Escape') { $('#search-results').hidden = true; search.blur(); }
  });
  $('#search-results').addEventListener('mousedown', (e) => { const li = e.target.closest('li[data-r]'); if (li) { e.preventDefault(); pickResult(+li.dataset.r); } });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search')) $('#search-results').hidden = true; });

  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (state.tab === 'rulers' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); stepRuler(e.key === 'ArrowDown' ? 1 : -1); return; }
    if (e.key === 'ArrowRight') goEra(state.era + 1);
    if (e.key === 'ArrowLeft') goEra(state.era - 1);
  });

  // ── 시작 ─────────────────────────────
  setLayout(store.get('layout', 'split'));
  syncGeo();
  renderTimeline();
  setTab(['notes', 'rulers'].includes(state.tab) ? state.tab : 'info');
  const eraFromHash = () => ERAS.findIndex((e) => '#' + e.id === location.hash);
  goEra(Math.max(0, eraFromHash()));
  window.addEventListener('hashchange', () => { const i = eraFromHash(); if (i >= 0 && i !== state.era) goEra(i); });

  // 레이아웃(폰트·CSS)이 늦게 잡혀 지도 크기가 바뀌면 다시 맞춘다
  let lastSize = '';
  new ResizeObserver(() => {
    const el = map.getContainer();
    const size = el.clientWidth + 'x' + el.clientHeight;
    if (size === lastSize || !el.clientHeight) return;
    const first = !lastSize || lastSize.endsWith('x0');
    lastSize = size;
    map.invalidateSize();
    if (first) map.fitBounds(ERAS[state.era].view, { padding: [20, 20], animate: false });
  }).observe(map.getContainer());

  // 해안선에 맞춰 영토를 자르기 위해 육지 데이터를 불러온 뒤 다시 그린다
  fetch(LAND_URL)
    .then((r) => r.json())
    .then((topo) => {
      // 동아시아에 걸친 육지 다각형만 남긴다 (bboxClip은 잘못된 고리를 만들어 intersect가 실패함)
      const B = [100, 20, 145, 56];
      const polys = topojson.merge(topo, topo.objects.land.geometries).coordinates.filter((poly) => {
        const b = turf.bbox(turf.polygon(poly));
        return !(b[2] < B[0] || b[0] > B[2] || b[3] < B[1] || b[1] > B[3]);
      });
      land = turf.multiPolygon(polys);
      landLite = turf.simplify(land, { tolerance: 0.03 }).geometry.coordinates.map((poly) => ({ poly, bbox: turf.bbox(turf.polygon(poly)) }));
      drawEra(false);
    })
    .catch((err) => console.warn('육지 데이터를 불러오지 못해 영토를 해안선에 맞추지 않고 표시합니다.', err));
})();
