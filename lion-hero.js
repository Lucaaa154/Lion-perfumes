/* LION PERFUMES — generative 3D wireframe lion + constellation field */
(function () {
  var stage = document.getElementById('lx-stage');
  if (!stage) return;
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CX = 200, CY = 205;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function svgLayer(cls) {
    var s = el('svg', { viewBox: '0 0 400 400', 'class': 'lx-layer ' + cls, 'aria-hidden': 'true' });
    var d = el('defs', {}, s);
    var g = el('linearGradient', { id: 'm' + cls, gradientUnits: 'userSpaceOnUse', x1: '40', y1: '40', x2: '360', y2: '360' }, d);
    [['0', '#94702A'], ['.3', '#EBD394'], ['.55', '#C9A04A'], ['.8', '#C8621F'], ['1', '#E8893C']].forEach(function (st) {
      el('stop', { offset: st[0], 'stop-color': st[1] }, g);
    });
    var cg = el('linearGradient', { id: 'c' + cls, x1: '0', y1: '0', x2: '1', y2: '1' }, d);
    el('stop', { offset: '0', 'stop-color': '#E8893C' }, cg);
    el('stop', { offset: '1', 'stop-color': '#A44E17' }, cg);
    stage.querySelector('.lx-stage__rig').appendChild(s);
    return { svg: s, grad: g, root: el('g', { 'class': 'spin' }, s), id: cls };
  }
  var delay = 0;
  function line(parent, pts, stroke, w, opacity) {
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' L');
    var p = el('path', { d: d, fill: 'none', stroke: stroke, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: opacity, pathLength: '1', 'class': 'lx-draw' }, parent);
    p.style.animationDelay = (delay += 0.012).toFixed(3) + 's';
    return p;
  }
  function poly(parent, pts, fill, op, d0) {
    var p = el('polygon', { points: pts.map(function (q) { return q.join(','); }).join(' '), fill: fill, 'fill-opacity': op, 'class': 'lx-fill' }, parent);
    p.style.animationDelay = d0 + 's';
    return p;
  }
  function node(parent, p, r, fill, d0) {
    var c = el('circle', { cx: p[0], cy: p[1], r: r, fill: fill, 'class': 'lx-node' }, parent);
    c.style.animationDelay = d0 + 's';
  }
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ---- mane ---- */
  function mane(L, n, rIn, rOut, offset, w, op, fillCol, seed) {
    var stroke = 'url(#m' + L.id + ')';
    for (var i = 0; i < n; i++) {
      var a = (i + offset) / n * Math.PI * 2 - Math.PI / 2;
      var half = Math.PI / n * 0.95;
      var ro = rOut * (0.8 + 0.28 * rnd(i + seed));
      var skew = 0.10 * (rnd(i * 3 + seed) - 0.5);
      var b1 = [CX + Math.cos(a - half) * rIn, CY + Math.sin(a - half) * rIn];
      var b2 = [CX + Math.cos(a + half) * rIn, CY + Math.sin(a + half) * rIn];
      var tip = [CX + Math.cos(a + skew) * ro, CY + Math.sin(a + skew) * ro];
      var mid = [CX + Math.cos(a) * (rIn + (ro - rIn) * 0.42), CY + Math.sin(a) * (rIn + (ro - rIn) * 0.42)];
      // light comes from the top: upper facets brighter
      var shade = 0.05 + 0.13 * (0.5 - 0.5 * Math.sin(a)) * (0.6 + 0.4 * rnd(i + 9));
      poly(L.root, [b1, tip, mid], fillCol, shade, 1.5 + i * 0.02);
      poly(L.root, [mid, tip, b2], fillCol, shade * 0.45, 1.5 + i * 0.02);
      line(L.root, [b1, tip, b2], stroke, w, op);
      line(L.root, [mid, tip], stroke, w * 0.6, op * 0.55);
      node(L.root, tip, 1.5, '#C9A04A', 1.8 + i * 0.03);
    }
  }
  var back = svgLayer('lx-layer--back');
  var mid = svgLayer('lx-layer--mid');
  var face = svgLayer('lx-layer--face');
  mane(back, 30, 98, 182, 0, 0.9, 0.75, '#C9A04A', 1);
  el('circle', { cx: CX, cy: CY, r: 98, fill: 'none', stroke: '#C9A04A', 'stroke-width': .6, 'stroke-dasharray': '2 5', opacity: .6 }, back.root);
  mane(mid, 22, 92, 150, 0.5, 1.1, 0.9, '#C8621F', 20);
  mane(mid, 16, 90, 120, 0.25, 1.2, 0.95, '#E27E30', 40);

  /* ---- face (low-poly, mirrored) ---- */
  var P = {
    F0: [200, 124], F1: [200, 160], N0: [200, 192], N1: [200, 236], Mc: [200, 255], K: [200, 292],
    EarT: [144, 108], EarB: [128, 148], B1: [166, 132], B2: [146, 160], T: [126, 192],
    E2: [160, 193], E1: [185, 199], NL: [185, 226], C: [132, 236], M: [174, 252], J: [158, 276]
  };
  function R(k) { var p = P[k]; return p[0] === 200 ? p : [400 - p[0], p[1]]; }
  function L_(k) { return P[k]; }
  var tris = [['F0','B1','F1'],['B1','B2','F1'],['B2','E2','F1'],['F1','E2','E1'],['F1','E1','N0'],['B2','T','E2'],
    ['T','C','E2'],['E2','C','NL'],['E2','NL','E1'],['E1','NL','N0'],['N0','NL','N1'],['NL','C','M'],['NL','M','N1'],
    ['N1','M','Mc'],['C','J','M'],['M','J','Mc'],['Mc','J','K'],['EarB','B2','B1'],['EarT','EarB','B1']];
  var outline = ['K','J','C','T','B2','EarB','EarT','B1','F0'];
  var sil = outline.map(L_).concat(outline.slice(0, -1).reverse().map(R));
  poly(face.svg, sil, '#FFFFFF', 0.93, 0).classList.remove('lx-fill');
  var fg = el('g', {}, face.svg);
  var stroke = 'url(#mlx-layer--face)';
  tris.forEach(function (t, i) {
    var cyAvg = (P[t[0]][1] + P[t[1]][1] + P[t[2]][1]) / 3;
    var cxAvg = (P[t[0]][0] + P[t[1]][0] + P[t[2]][0]) / 3;
    var op = 0.04 + 0.16 * Math.min(1, (200 - cxAvg) / 70) * (0.55 + 0.45 * rnd(i + 70)) + (cyAvg > 240 ? 0.04 : 0);
    var col = t[0] === 'EarT' ? '#C8621F' : '#E27E30';
    poly(fg, t.map(L_), col, op, 2.0 + i * 0.03);
    poly(fg, t.map(R), col, op, 2.0 + i * 0.03);
  });
  delay = 0.6;
  tris.forEach(function (t) {
    line(fg, t.map(L_).concat([L_(t[0])]), stroke, 1.15, 1);
    line(fg, t.map(R).concat([R(t[0])]), stroke, 1.15, 1);
  });
  // inner ears
  poly(fg, [[144, 116], [134, 144], [158, 136]], '#C8621F', .28, 2.2);
  poly(fg, [[256, 116], [266, 144], [242, 136]], '#C8621F', .28, 2.2);
  // nose
  var nose = el('path', { d: 'M187,227 L213,227 L200,239 Z', fill: 'url(#clx-layer--face)', 'class': 'lx-fill' }, fg);
  nose.style.animationDelay = '2.4s';
  // mouth
  line(fg, [[200, 239], [200, 255], [186, 263]], '#9C4813', 1.3, .9);
  line(fg, [[200, 255], [214, 263]], '#9C4813', 1.3, .9);
  // eyes
  [[0, 1], [400, -1]].forEach(function (m) {
    var x = function (v) { return m[0] + m[1] * v; };
    var eye = el('g', { 'class': 'lx-fill' }, fg); eye.style.animationDelay = '2.6s';
    var inner = el('g', { 'class': 'lx-eye' }, eye);
    el('path', { d: 'M' + x(161) + ',195 Q' + x(172) + ',186 ' + x(185) + ',198 Q' + x(172) + ',202 ' + x(161) + ',195 Z', fill: 'url(#clx-layer--face)' }, inner);
    el('ellipse', { cx: x(174), cy: 195.5, rx: 1.5, ry: 3.6, fill: '#1E1611' }, inner);
  });
  // vertices
  Object.keys(P).forEach(function (k, i) {
    node(fg, L_(k), 2, '#C9A04A', 2.3 + i * 0.04);
    if (P[k][0] !== 200) node(fg, R(k), 2, '#C9A04A', 2.3 + i * 0.04);
  });
  // diamond star on the forehead (from the bag)
  var star = el('path', { d: 'M200,92 L205,104 L200,116 L195,104 Z', fill: 'url(#mlx-layer--face)', 'class': 'lx-fill' }, face.svg);
  star.style.animationDelay = '2.8s';

  /* ---- motion: parallax + idle drift + roar ---- */
  var rig = stage.querySelector('.lx-stage__rig');
  var hero = document.getElementById('hero');
  var tx = 0, ty = 0, cx = 0, cy = 0, lastMove = 0, t0 = performance.now(), visible = true;
  function onMove(e) {
    var pt = e.touches ? e.touches[0] : e;
    tx = (pt.clientX / window.innerWidth - 0.5) * 2;
    ty = (pt.clientY / window.innerHeight - 0.5) * 2;
    lastMove = performance.now();
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 30));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    lastMove = performance.now();
  }, { passive: true });

  var grads = [back.grad, mid.grad, face.grad];
  function frame(now) {
    if (visible) {
      var idle = now - lastMove > 2500;
      var t = (now - t0) / 1000;
      var gx = idle ? Math.sin(t * 0.5) * 0.55 : tx;
      var gy = idle ? Math.cos(t * 0.37) * 0.35 : ty;
      cx += (gx - cx) * 0.06; cy += (gy - cy) * 0.06;
      if (!reduce) rig.style.transform = 'rotateY(' + (cx * 18).toFixed(2) + 'deg) rotateX(' + (-cy * 14).toFixed(2) + 'deg)';
      var ang = (t * 40) % 360;
      for (var i = 0; i < grads.length; i++) grads[i].setAttribute('gradientTransform', 'rotate(' + (ang + i * 40).toFixed(1) + ' 200 205)');
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  stage.addEventListener('click', function () {
    stage.classList.remove('roar'); void stage.offsetWidth; stage.classList.add('roar');
    var s = document.createElement('span'); s.className = 'lx-shock'; stage.appendChild(s);
    setTimeout(function () { s.remove(); }, 1100);
  });

  /* ---- constellation particle field ---- */
  var cv = document.getElementById('lx-field');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, window.devicePixelRatio || 1), parts = [], mx = -999, my = -999;
    function size() {
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 700 ? 34 : 70;
      parts = [];
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .5, c: Math.random() < .5 ? '200,98,31' : '201,160,74' });
    }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    function draw() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          var dxm = p.x - mx, dym = p.y - my, dm = Math.sqrt(dxm * dxm + dym * dym);
          if (dm < 160) {
            p.x += dxm / dm * 0.6; p.y += dym / dm * 0.6;
            ctx.strokeStyle = 'rgba(200,98,31,' + (0.35 * (1 - dm / 160)).toFixed(3) + ')';
            ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke();
          }
          for (var j = i + 1; j < parts.length; j++) {
            var q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
            if (d < 13000) {
              ctx.strokeStyle = 'rgba(201,160,74,' + (0.22 * (1 - d / 13000)).toFixed(3) + ')';
              ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
          ctx.fillStyle = 'rgba(' + p.c + ',.75)';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    size(); draw();
    window.addEventListener('resize', size);
  }
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
  }

  /* ---- live counts ---- */
  try {
    var total = (typeof perfumes !== 'undefined') ? perfumes.length : 0;
    var inStock = (typeof perfumes !== 'undefined') ? perfumes.filter(function (p) { return !p.soldOut; }).length : 0;
    document.querySelectorAll('[data-lx-count]').forEach(function (n) { n.textContent = total; });
    document.querySelectorAll('[data-lx-stock]').forEach(function (n) { n.textContent = inStock; });
  } catch (e) {}
})();
