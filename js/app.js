(function () {
  'use strict';

  const ERAS = window.ERAS;
  const NOTES = window.NOTES || [];
  const RULERS = window.RULERS || {};
  const ARTIFACTS = window.ARTIFACTS || {};
  const ART_RE = Object.keys(ARTIFACTS).length
    ? new RegExp('(' + Object.keys(ARTIFACTS).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g')
    : null;

  // 본문 글씨 중 유물 이름을 찾아 사진 링크로 감싼다
  function linkArtifacts(root) {
    if (!ART_RE || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('a, button, .stepper') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
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

  function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    const img = lb.querySelector('img');
    const cap = lb.querySelector('figcaption');
    lb.classList.remove('missing');
    img.onerror = () => lb.classList.add('missing');
    img.src = src;
    img.alt = caption || '';
    cap.textContent = caption || '';
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
    base: store.get('base', 'terrain'),
    rulerPos: 0,
    rulerFilter: 'all',
    rulerQuiz: false,
  };

  let land = null;
  const clipCache = new Map();
  let markerByName = new Map();

  // ── 지도 ─────────────────────────────
  const map = L.map('map', { zoomControl: false, minZoom: 3, maxZoom: 10, worldCopyJump: false, zoomSnap: 0.25 });
  L.control.zoom({ position: 'topleft' }).addTo(map);
  map.attributionControl.setPrefix(false);

  const BASES = {
    terrain: {
      label: '지형',
      layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 8, maxZoom: 10, attribution: 'Tiles © Esri — US National Park Service',
      }),
    },
    light: {
      label: '밝은 지도',
      layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 10, attribution: '© OpenStreetMap © CARTO',
      }),
    },
  };

  const gTerr = L.layerGroup().addTo(map);
  const gLines = L.layerGroup().addTo(map);
  const gMarkers = L.layerGroup().addTo(map);
  const gGeo = L.layerGroup();

  GEO_LABELS.forEach(([name, lat, lng]) => {
    L.marker([lat, lng], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: `<div class="river-label">${name}</div>`, iconSize: [0, 0] }) }).addTo(gGeo);
  });

  function setBase(key) {
    Object.values(BASES).forEach((b) => map.removeLayer(b.layer));
    BASES[key].layer.addTo(map).bringToBack();
    state.base = key;
    store.set('base', key);
    // 버튼에는 "누르면 바뀔" 지도 이름 대신 현재 지도 이름을 보여준다
    $('#btn-layer').textContent = '배경: ' + BASES[key].label;
  }

  // ── 유틸 ─────────────────────────────
  function $(s, el) { return (el || document).querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function stripTags(s) { return String(s).replace(/<[^>]*>/g, '').replace(/\{\{([^}|]+)(\|[^}]*)?\}\}/g, '$1'); }

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
    requestAnimationFrame(layoutCallouts);
    if (fit) map.fitBounds(era.view, { padding: [20, 20], animate: false });
  }

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
    landMask = buildLandMask(W, H);

    // 피해야 할 영역: 지도 위 UI, 마커, 나라 이름
    const blocked = [];
    document.querySelectorAll('.map-tools, .legend, .timeline, .leaflet-control-zoom, .leaflet-control-attribution').forEach((el) => {
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
        if (!best || score < best.score) best = { score, r, seg };
      }));
      if (!best) { el.remove(); return; }

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

  map.on('zoomstart', () => overlay.classList.add('zooming'));
  map.on('move', () => { if (!overlay.classList.contains('zooming')) drawLines(); });
  map.on('moveend', () => { overlay.classList.remove('zooming'); requestAnimationFrame(layoutCallouts); });
  map.on('resize', () => requestAnimationFrame(layoutCallouts));

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
  function renderPanel() {
    const era = ERAS[state.era];
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
      <div class="section-title">시험 포인트</div>
      <ul class="points">${era.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
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
    const tr = (r) => `<tr><th class="row-label"><span>${esc(r.label)}</span></th>${r.cells.map(td).join('')}</tr>`;
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

  function renderRulers() {
    const era = ERAS[state.era];
    const list = RULERS[era.id] || [];
    $('#ruler-count').textContent = list.length || '';
    const box = $('#tab-rulers');
    if (!list.length) { box.innerHTML = '<div class="empty-notes"><strong>이 시대에는 정리된 인물이 없어요</strong></div>'; return; }

    const cur = RULER_SEQ[state.rulerPos];
    const states = [...new Set(list.map((r) => r.state))];
    if (!states.includes(state.rulerFilter)) state.rulerFilter = 'all';

    const items = list.map((r, ri) => {
      if (state.rulerFilter !== 'all' && r.state !== state.rulerFilter) return '';
      const isCur = cur && cur.ei === state.era && cur.ri === ri;
      return `
        <li class="ruler${isCur ? ' current' : ''}" data-ri="${ri}" style="--c:${stateColor(r.state)}">
          <div class="ruler-card">
            <div class="ruler-top">
              <span class="ruler-state">${esc(r.state)}</span>
              <span class="ruler-name">${esc(r.name)}</span>
              <span class="ruler-reign">${esc(r.reign)}</span>
            </div>
            ${r.key ? `<div class="ruler-key">${esc(r.key)}</div>` : ''}
            <ul class="ruler-items">${r.items.map((it) => `<li>${formatCell(it)}</li>`).join('')}</ul>
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
        ${states.length > 1 ? ['all', ...states].map((st) => `<button data-filter="${esc(st)}" aria-pressed="${state.rulerFilter === st}">${st === 'all' ? '전체' : esc(st)}</button>`).join('') : ''}
        <span class="spacer"></span>
        <button data-act="rquiz" aria-pressed="${state.rulerQuiz}">정책 가리기</button>
      </div>
      <ol class="ruler-list${state.rulerQuiz ? ' quiz' : ''}">${items}</ol>`;
    linkArtifacts(box);
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

  function focusMarker(name) {
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
    index.push({ kind: 'era', ei, title: e.name, sub: e.period, text: e.name + ' ' + e.summary + ' ' + e.points.join(' ') });
    e.markers.forEach((m) => index.push({ kind: 'marker', ei, title: m.name + (m.year ? ` (${m.year})` : ''), name: m.name, sub: e.name, text: [m.name, m.year, m.desc, m.tag].join(' ') }));
  });
  RULER_SEQ.forEach(({ ei, r }, pos) => {
    index.push({ kind: 'ruler', ei, pos, title: `👑 ${r.name} (${r.reign})`, sub: `${ERAS[ei].name} · ${r.state}`, text: [r.state, r.name, r.key, ...r.items].map(stripTags).join(' ') });
  });
  NOTES.forEach((n) => {
    const ei = ERAS.findIndex((e) => e.id === noteEras(n)[0]);
    const tables = [n, n.table].filter((t) => t && t.head);
    const annos = (n.annos || []).map((a) => [a.title, a.body, a.text].filter(Boolean).join(' '));
    const text = [n.title, ...annos, ...tables.flatMap((t) => [...t.head.flatMap((r) => [r.label, ...r.cells]), ...t.rows.flatMap((r) => [r.label, ...r.cells])])].map((c) => stripTags(typeof c === 'object' ? c.html : c)).join(' ');
    index.push({ kind: 'note', ei, title: '📝 ' + n.title, sub: (ERAS[ei] || {}).name + ' · 판서 노트', text, note: n.id });
  });

  let results = [];
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
    ul.innerHTML = results.length
      ? results.map((r, i) => `<li data-r="${i}">${esc(r.title)}<span class="sr-era">${esc(r.sub)}</span></li>`).join('')
      : '<li class="sr-empty">검색 결과가 없습니다</li>';
    ul.hidden = false;
  }
  function pickResult(i) {
    const r = results[i];
    if (!r) return;
    $('#search-results').hidden = true;
    $('#search').blur();
    if (r.kind === 'marker') { if (state.era !== r.ei) goEra(r.ei); setTab('info'); focusMarker(r.name); }
    else if (r.kind === 'ruler') { goEra(r.ei); state.rulerPos = r.pos; renderRulers(); setTab('rulers'); scrollToCurrentRuler(); }
    else if (r.kind === 'note') { goEra(r.ei); setTab('notes'); const el = document.querySelector(`[data-note="${r.note}"]`); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
    else { goEra(r.ei); setTab('info'); }
  }

  // ── 이벤트 연결 ─────────────────────────────
  $('#timeline').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) goEra(+b.dataset.i); });
  $('#prev').addEventListener('click', () => goEra(state.era - 1));
  $('#next').addEventListener('click', () => goEra(state.era + 1));
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

  $('#tab-info').addEventListener('click', (e) => {
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

  $('#btn-layer').addEventListener('click', () => setBase(state.base === 'terrain' ? 'light' : 'terrain'));
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
  setBase(state.base in BASES ? state.base : 'terrain');
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
