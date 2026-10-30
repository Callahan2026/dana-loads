// Night highway: perspective road with streaking headlights (toward you) and taillights (away), on a canvas behind the hero.
(function () {
  var host = document.querySelector('.fx-night');
  if (!host) return;
  var c = document.createElement('canvas'); host.appendChild(c);
  var ctx = c.getContext('2d'), W, H, dpr, vx, vy, cars = [], dash = 0, last = 0;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vx = W * 0.68; vy = H * 0.36;
  }
  // lanes: -2,-1 = oncoming (headlights, toward viewer); 1,2 = outgoing (taillights, away)
  function spawn(z) {
    var lane = [-1.9, -1.1, -0.45, 0.45, 1.1, 1.9][Math.floor(Math.random() * 6)];
    return { lane: lane, z: z === undefined ? Math.random() : z, v: 0.10 + Math.random() * 0.16 };
  }
  for (var i = 0; i < 64; i++) cars.push(spawn());
  // occasional semi pulling away from the viewer down the road
  var semi = null, semiWait = 2.5;
  function newSemi() { return { z: 0.8, lane: Math.random() < 0.5 ? 0.32 : 0.62, v: 0.07 + Math.random() * 0.025 }; }
  function drawSemi(dt) {
    if (!semi) { if (!still) semiWait -= dt; if (semiWait <= 0 || still) { semi = newSemi(); if (still) semi.z = 0.7; } else return; }
    if (!still) semi.z -= semi.v * dt;
    if (semi.z < 0.06) { semi = null; semiWait = 6 + Math.random() * 6; return; }
    var b = proj(semi.lane, semi.z), w = W * 0.95 * b.s * 0.45 * 0.62, h = w * 1.45;
    if (w < 1.5) return;
    var x = b.x - w / 2, y = b.y - h - w * 0.12;
    ctx.globalCompositeOperation = 'source-over';
    // shadow on road
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, w * 0.62, w * 0.08, 0, 0, 6.283); ctx.fill();
    // wheels
    ctx.fillStyle = '#050504'; ctx.fillRect(x + w * 0.04, y + h, w * 0.26, w * 0.12); ctx.fillRect(x + w * 0.70, y + h, w * 0.26, w * 0.12);
    // trailer box (rear doors)
    var tg = ctx.createLinearGradient(x, y, x + w, y);
    tg.addColorStop(0, '#2b2e24'); tg.addColorStop(0.5, '#3a3e31'); tg.addColorStop(1, '#25281f');
    ctx.fillStyle = tg; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(214,212,198,.55)'; ctx.lineWidth = Math.max(0.6, w * 0.02); ctx.strokeRect(x, y, w, h);
    ctx.beginPath(); ctx.moveTo(b.x, y + h * 0.04); ctx.lineTo(b.x, y + h * 0.96); ctx.stroke();       // door seam
    ctx.strokeStyle = 'rgba(214,212,198,.25)';
    for (var k = 1; k < 4; k++) { var bx = x + w * (k / 4); ctx.beginPath(); ctx.moveTo(bx - w * 0.06, y + h * 0.05); ctx.lineTo(bx - w * 0.06, y + h * 0.95); ctx.stroke(); } // lock rods
    // Callahan green stripe
    ctx.fillStyle = 'rgba(61,151,61,.85)'; ctx.fillRect(x, y + h * 0.84, w, h * 0.035);
    // bumper + mud flaps
    ctx.fillStyle = '#0b0b08'; ctx.fillRect(x + w * 0.02, y + h + w * 0.01, w * 0.96, w * 0.05);
    ctx.fillRect(x + w * 0.06, y + h - w * 0.02, w * 0.12, w * 0.16); ctx.fillRect(x + w * 0.82, y + h - w * 0.02, w * 0.12, w * 0.16);
    // lights (glow)
    ctx.globalCompositeOperation = 'lighter';
    function lamp(lx, ly, r, col, a) { var gg = ctx.createRadialGradient(lx, ly, 0, lx, ly, r); gg.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gg.addColorStop(1, 'rgba(' + col + ',0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(lx, ly, r, 0, 6.283); ctx.fill(); }
    var r = Math.max(2, w * 0.10), brake = (Math.sin(performance.now() / 900) > 0.92) ? 1 : 0.75;
    lamp(x + w * 0.09, y + h * 0.9, r * 1.8, '235,60,45', brake); lamp(x + w * 0.91, y + h * 0.9, r * 1.8, '235,60,45', brake);
    lamp(x + w * 0.09, y + h * 0.9, r * 0.5, '255,200,190', 0.9); lamp(x + w * 0.91, y + h * 0.9, r * 0.5, '255,200,190', 0.9);
    for (var m = 0; m < 5; m++) lamp(x + w * (0.2 + m * 0.15), y + h * 0.03, r * 0.7, '255,170,40', 0.8);   // amber clearance lights
    lamp(x + w * 0.02, y + h * 0.03, r * 0.8, '235,60,45', 0.8); lamp(x + w * 0.98, y + h * 0.03, r * 0.8, '235,60,45', 0.8);
    // headlight wash ahead of the truck on the road
    lamp(b.x, b.y - w * 0.05, w * 0.9, '245,243,236', 0.06);
    ctx.globalCompositeOperation = 'source-over';
  }
  function proj(lane, z) { // z: 0 far .. 1 near
    var p = Math.pow(z, 2.2);
    var roadHalf = W * 0.95 * p;
    return { x: vx + lane * roadHalf * 0.45, y: vy + (H - vy) * p, s: p };
  }
  function draw(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
    // sky
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2E3226'); g.addColorStop(0.30, '#3A4231'); g.addColorStop(0.37, '#4F6A45'); g.addColorStop(0.38, '#1A1C14'); g.addColorStop(1, '#0E0F0A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // horizon glow (city)
    var hg = ctx.createRadialGradient(vx, vy, 0, vx, vy, W * 0.55);
    hg.addColorStop(0, 'rgba(120,200,110,.45)'); hg.addColorStop(0.35, 'rgba(61,151,61,.18)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    // stars
    ctx.fillStyle = 'rgba(245,243,236,.6)';
    for (var s = 0; s < 40; s++) { var sx = (s * 97 % W), sy = (s * 53 % (vy * 0.9)); ctx.fillRect(sx, sy, 1, 1); }
    // road edges
    ctx.strokeStyle = 'rgba(214,212,198,.25)'; ctx.lineWidth = 1.5;
    [-2.4, -0.02, 0.02, 2.4].forEach(function (L) { var a = proj(L, 0.02), b = proj(L, 1.2); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    // center dashes (gold) moving toward viewer
    if (!still) dash = (dash + dt * 0.55) % 0.1;
    ctx.strokeStyle = 'rgba(245,243,236,.85)';
    for (var d = 0; d < 1.2; d += 0.1) {
      var z1 = d + dash, z2 = z1 + 0.04; if (z1 > 1.2) continue;
      var p1 = proj(0, z1), p2 = proj(0, Math.min(z2, 1.2));
      ctx.lineWidth = 1 + p1.s * 6; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }
    // cars as light streaks
    ctx.globalCompositeOperation = 'lighter';
    cars.forEach(function (car, i) {
      var toward = car.lane < 0;
      if (!still) car.z += (toward ? 1 : -1) * car.v * dt;
      if (car.z > 1.25 || car.z < 0.02) { cars[i] = spawn(toward ? 0.03 : 1.2); return; }
      var tail = toward ? -0.2 : 0.2;
      var a = proj(car.lane, car.z), b = proj(car.lane, Math.max(0.01, car.z + tail));
      var col = toward ? '245,243,236' : '230,90,70';
      var lg = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      lg.addColorStop(0, 'rgba(' + col + ',.95)'); lg.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.strokeStyle = lg; ctx.lineCap = 'round';
      for (var k = -1; k <= 1; k += 2) { // two lamps per vehicle
        var off = k * (1.5 + a.s * 10);
        ctx.lineWidth = 0.8 + a.s * 4; ctx.beginPath(); ctx.moveTo(a.x + off, a.y); ctx.lineTo(b.x + off * 0.6, b.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + col + ',' + (0.10 + a.s * 0.18) + ')';
      ctx.beginPath(); ctx.arc(a.x, a.y, 2 + a.s * 12, 0, 6.283); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    drawSemi(dt);
    if (!still) requestAnimationFrame(draw);
  }
  size(); window.addEventListener('resize', size);
  requestAnimationFrame(draw);
})();
