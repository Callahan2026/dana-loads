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
  function proj(lane, z) { // z: 0 far .. 1 near
    var p = Math.pow(z, 2.2);
    var roadHalf = W * 0.95 * p;
    return { x: vx + lane * roadHalf * 0.45, y: vy + (H - vy) * p, s: p };
  }
  function draw(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
    // sky
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07060a'); g.addColorStop(0.32, '#1a1020'); g.addColorStop(0.37, '#3a1c16'); g.addColorStop(0.38, '#0b0908'); g.addColorStop(1, '#050404');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // horizon glow (city)
    var hg = ctx.createRadialGradient(vx, vy, 0, vx, vy, W * 0.55);
    hg.addColorStop(0, 'rgba(255,150,60,.55)'); hg.addColorStop(0.35, 'rgba(255,90,40,.18)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    // stars
    ctx.fillStyle = 'rgba(255,240,220,.6)';
    for (var s = 0; s < 40; s++) { var sx = (s * 97 % W), sy = (s * 53 % (vy * 0.9)); ctx.fillRect(sx, sy, 1, 1); }
    // road edges
    ctx.strokeStyle = 'rgba(255,200,120,.35)'; ctx.lineWidth = 1.5;
    [-2.4, -0.02, 0.02, 2.4].forEach(function (L) { var a = proj(L, 0.02), b = proj(L, 1.2); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    // center dashes (gold) moving toward viewer
    if (!still) dash = (dash + dt * 0.55) % 0.1;
    ctx.strokeStyle = 'rgba(240,163,58,.9)';
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
      var col = toward ? '255,226,170' : '255,70,50';
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
    if (!still) requestAnimationFrame(draw);
  }
  size(); window.addEventListener('resize', size);
  requestAnimationFrame(draw);
})();
