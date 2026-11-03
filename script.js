const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Résumé request button: builds the mailto from data attributes so the address isn't plain text in the HTML.
const ask = document.getElementById('resume-request');
if (ask) {
  const { user, domain, subject } = ask.dataset;
  ask.href = 'mailto:' + user + '@' + domain + '?subject=' + encodeURIComponent(subject);
}

// Cyberpunk skyline drawn on a small canvas and scaled up so everything is chunky pixels: dark towers with
// neon windows, flying cars, a rocket that launches now and then, and a sandworm that rises out of the city.
const sky = document.getElementById('rain');
if (sky) {
  const ctx = sky.getContext('2d');
  const PIXEL = 4;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const neon = ['#3ef0ff', '#ff4fd8', '#ffe14d', '#7dff6a'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  let w, h, stars, back, front, cars, rocket, worm, smoke = [], sand = [], t = 0;
  const ship = [
    '  W  ',
    ' WWW ',
    ' WCW ',
    ' WWW ',
    ' WWW ',
    'PWWWP',
    'P   P',
  ];
  const shipColors = { W: '#f4effc', C: '#3ef0ff', P: '#ff4fd8' };
  // launch somewhere in the empty margin right of the text column (just inside the edge on phones)
  const launchX = () => w - 7 - Math.floor(Math.random() * Math.max(0, (w - 160) / 2 - 10));

  function towers(minH, maxH) {
    const list = [];
    for (let x = -2; x < w;) {
      const bw = 5 + Math.floor(Math.random() * 9), bh = minH + Math.floor(Math.random() * (maxH - minH));
      const wins = [];
      for (let y = 2; y < bh - 1; y += 2) for (let i = 1; i < bw - 1; i += 2) if (Math.random() < 0.15) wins.push([i, y, pick(neon)]);
      list.push({ x, bw, bh, wins, sign: Math.random() < 0.3 ? pick(neon) : null, antenna: bh > maxH * 0.7 });
      x += bw + Math.floor(Math.random() * 2);
    }
    return list;
  }

  function resetCar(c, anywhere) {
    const right = Math.random() < 0.5;
    c.x = anywhere ? Math.random() * w : right ? -4 : w + 4;
    c.y = h - 30 - Math.floor(Math.random() * 30);
    c.v = (right ? 1 : -1) * (0.15 + Math.random() * 0.25);
    c.c = pick(neon);
  }

  function resize() {
    w = Math.ceil(innerWidth / PIXEL); h = Math.ceil(innerHeight / PIXEL);
    sky.width = w; sky.height = h;
    stars = Array.from({ length: Math.round(w * 0.08) }, () => [Math.floor(Math.random() * w), Math.floor(Math.random() * h * 0.4)]);
    back = towers(10, 26); front = towers(5, 15);
    cars = Array.from({ length: 4 }, () => { const c = {}; resetCar(c, true); return c; });
    rocket = { x: launchX(), y: h + 10, v: 0, wait: 60 };
    worm = { x: 0, r: 11, y: h + 2, wait: 240, phase: 'rise', open: 0, peak: 0, hold: 0 };
  }

  // rocket rises from behind the front row of towers
  function drawRocket() {
    for (const s of smoke) { ctx.fillStyle = 'rgba(244, 239, 252, ' + (s.life / 120 * 0.45) + ')'; ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.r, s.r); }
    const rx = Math.floor(rocket.x), ry = Math.floor(rocket.y);
    ship.forEach((row, y) => [...row].forEach((ch, x) => { if (shipColors[ch]) { ctx.fillStyle = shipColors[ch]; ctx.fillRect(rx + x, ry + y, 1, 1); } }));
    if (rocket.v) {
      ctx.fillStyle = t % 6 < 3 ? '#ffe14d' : '#ffb000'; ctx.fillRect(rx + 1, ry + 7, 3, 2);
      ctx.fillStyle = '#ff6b3d'; ctx.fillRect(rx + 2, ry + 9, 1, t % 4 < 2 ? 2 : 1);
    }
  }

  // A giant sandworm rising behind the skyline. It is drawn pixel by pixel as a lit cylinder: shading runs
  // across its width, the ring segments bow into arcs so it reads as round, and the head tips toward the
  // viewer while four lip flaps peel back to show a round maw with rings of crystal teeth spiralling inward.
  const sandTones = ['#f0d3a6', '#d6a872', '#b5844f', '#8c6038', '#5e3d27'];
  const margin = () => (w - 160) / 2;
  // big in the empty margin left of the text column; on narrow screens a smaller one rises from the bottom-left corner
  const wide = () => margin() >= 40;
  // centre line of the body: straight at the ground, bending toward the page near the head, slowly swaying
  const centre = (y, top) => { const k = (h - y) / Math.max(1, h - top), s = worm.r === 11 ? 1 : 0.3; return worm.x + (k * k * 12 - Math.sin(k * 3.1) * 4) * s + Math.sin(k * 4 + t * 0.025) * 1.2; };
  const mouth = () => ({ cx: centre(worm.y, worm.y), rx: worm.r + 1 + worm.open * worm.r * 0.35, ry: 2 + worm.open * worm.r * 0.65 });

  // one lip flap peeled back from the rim at angle a: tan outside, a raw red inside lined with teeth
  function flap(m, top, a, len) {
    let nx = Math.cos(a), ny = Math.sin(a) * 1.4; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
    const px = m.cx + Math.cos(a) * m.rx * 0.8, py = top + Math.sin(a) * m.ry * 0.8, base = m.rx * 0.55;
    for (let s = 0; s <= len; s++) {
      const f = s / (len + 1), half = base * Math.sqrt(1 - f * f) * (1 - f * 0.4);   // rounded petal tip
      for (let q = -half; q <= half; q += 0.5) {
        const inner = Math.abs(q) < half * 0.65 && s < len - 1;
        const tooth = inner && s % 2 === 1 && Math.abs(Math.abs(q) - half * 0.5) < 0.6;
        ctx.fillStyle = tooth ? '#f6ecd9' : inner ? '#6b2238' : q < 0 ? sandTones[1] : sandTones[3];
        ctx.fillRect(Math.round(px + nx * s - ny * q), Math.round(py + ny * s + nx * q), 1, 1);
      }
    }
  }

  function drawWorm() {
    if (worm.wait > 0) return;
    const top = Math.round(worm.y);
    ctx.globalAlpha = worm.r === 11 ? 1 : 0.55;   // on phones it sits behind text, so keep it see-through
    // body
    for (let y = top; y < h; y++) {
      const r = worm.r + Math.min(2, (y - top) / 40), cx = centre(y, top);
      for (let x = Math.ceil(cx - r); x <= cx + r; x++) {
        const u = (x - cx) / r;                       // -1 at the lit left edge, +1 at the shaded right edge
        let tone = u < -0.65 ? 1 : u < 0.05 ? 2 : u < 0.6 ? 3 : 4;
        if (u < -0.35 && u > -0.55) tone = 0;           // narrow specular strip
        const ring = (y - top + Math.round((1 - u * u) * 3)) % 8;
        if (ring === 0) tone = Math.min(4, tone + 2);    // groove between segments
        else if (ring === 1) tone = Math.max(0, tone - 1); // raised lip of the next segment
        ctx.fillStyle = sandTones[tone]; ctx.fillRect(x, y, 1, 1);
      }
    }
    // head: an ellipse that opens as the worm tips its mouth toward us, with flaps peeling back around it
    const m = mouth();
    if (worm.open > 0.15) for (const a of [-2.45, -0.7, 0.45, 2.7]) flap(m, top, a, Math.round(worm.open * worm.r * 1.3));
    for (let y = Math.floor(top - m.ry); y <= top + m.ry; y++) for (let x = Math.floor(m.cx - m.rx); x <= m.cx + m.rx; x++) {
      const dx = (x - m.cx) / m.rx, dy = (y - top) / m.ry, d = Math.hypot(dx, dy);
      if (d > 1) continue;
      let c;
      if (d > 0.86) c = dy < 0 ? sandTones[dx < 0 ? 0 : 1] : sandTones[dx < 0 ? 2 : 3];   // outer lip, lit on top
      else if (worm.open < 0.15) c = sandTones[1];                                          // closed: blunt cap
      else {
        // four rings of teeth, each ring twisted a little further so they spiral down into the throat
        const ring = Math.floor((0.86 - d) / 0.16), band = ((0.86 - d) / 0.16) % 1;
        const spin = Math.atan2(dy, dx) * (9 - ring * 1.5) + ring * 0.9 + d * 4;
        const shade = ['#f6ecd9', '#d9cbb4', '#a99a86', '#6e5f55'][Math.min(3, ring)];
        c = ring > 3 ? '#0c0409' : band < 0.55 && Math.floor(spin) % 2 === 0 ? shade : ['#3a1424', '#2a0d1b', '#1c0813', '#12050d'][ring];
      }
      ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  // streams of sand sliding off both sides of the head
  function pourSand(n) {
    const m = mouth();
    for (let i = 0; i < n; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      sand.push({ x: m.cx + side * (m.rx - Math.random() * 3), y: worm.y + 1, vx: side * Math.random() * 0.15, vy: 0.2 + Math.random() * 0.3, life: 90 });
    }
  }

  function drawCity(list, body) {
    for (const b of list) {
      const top = h - b.bh;
      ctx.fillStyle = body; ctx.fillRect(b.x, top, b.bw, b.bh);
      ctx.globalAlpha = 0.8;
      for (const [i, y, c] of b.wins) { ctx.fillStyle = c; ctx.fillRect(b.x + i, top + y, 1, 1); }
      ctx.globalAlpha = 1;
      if (b.sign) { ctx.fillStyle = b.sign; ctx.fillRect(b.x + b.bw - 2, top + 2, 1, Math.min(6, b.bh - 3)); }
      if (b.antenna) {
        ctx.fillStyle = body; ctx.fillRect(b.x + (b.bw >> 1), top - 4, 1, 4);
        if (t % 90 < 45) { ctx.fillStyle = '#ff3b5c'; ctx.fillRect(b.x + (b.bw >> 1), top - 5, 1, 1); }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, .7)';
    for (const [x, y] of stars) ctx.fillRect(x, y, 1, 1);
    drawCity(back, '#2a1347');
    drawWorm();
    drawRocket();
    for (const c of cars) {
      const x = Math.floor(c.x);
      ctx.fillStyle = '#1a0d30'; ctx.fillRect(x, c.y, 3, 1);
      ctx.fillStyle = c.c; ctx.fillRect(c.v > 0 ? x - 1 : x + 3, c.y, 1, 1);
      ctx.fillStyle = '#fff'; ctx.fillRect(c.v > 0 ? x + 3 : x - 1, c.y, 1, 1);
    }
    drawCity(front, '#150a28');
    for (const p of sand) { ctx.fillStyle = 'rgba(226, 190, 140, ' + Math.min(1, p.life / 40) + ')'; ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1); }
  }

  function step() {
    t++;
    for (const c of cars) { c.x += c.v; if (c.x < -6 || c.x > w + 6) resetCar(c, false); }
    if (rocket.wait > 0) { if (--rocket.wait === 0) rocket.v = 0.05; }
    else {
      rocket.v = Math.min(rocket.v + 0.004, 1.2); rocket.y -= rocket.v;
      if (t % 3 === 0) smoke.push({ x: rocket.x + 1 + Math.random() * 2, y: rocket.y + 9, r: 1 + Math.floor(Math.random() * 2), life: 120 });
      if (rocket.y < -20) Object.assign(rocket, { x: launchX(), y: h + 10, v: 0, wait: 400 + Math.floor(Math.random() * 300) });
    }
    for (const s of smoke) { s.life--; s.x += (Math.random() - 0.5) * 0.2; s.y += 0.05; if (s.life % 40 === 0) s.r++; }
    smoke = smoke.filter(s => s.life > 0);
    if (worm.wait > 0) {
      if (--worm.wait === 0) Object.assign(worm, wide()
        ? { r: 11, x: 15 + Math.floor(Math.random() * (margin() - 36)), peak: h - 60 - Math.floor(Math.random() * 20) }
        : { r: 7, x: 2 + Math.floor(Math.random() * 3), peak: h - 30 - Math.floor(Math.random() * 6) },
        { y: h + 2, phase: 'rise', open: 0 });
    }
    else if (worm.phase === 'rise') {
      worm.y -= 0.35;
      // sand thrown up at the base, and sand pouring off the rim of the head
      if (t % 2 === 0) for (let i = 0; i < 2; i++) sand.push({ x: worm.x - worm.r - 4 + Math.random() * (worm.r * 2 + 8), y: h - 1, vx: (Math.random() - 0.5) * 1.6, vy: -0.6 - Math.random() * 1.1, life: 50 });
      pourSand(3);
      if (worm.y <= worm.peak) Object.assign(worm, { phase: 'hold', hold: 220 });
    } else if (worm.phase === 'hold') {
      worm.open = Math.min(1, worm.open + 0.012);
      pourSand(1);
      if (--worm.hold <= 0) worm.phase = 'sink';
    } else {
      worm.open = Math.max(0, worm.open - 0.03); worm.y += 0.45;
      if (worm.y > h + 2) worm.wait = 900 + Math.floor(Math.random() * 900);
    }
    for (const p of sand) { p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life--; }
    sand = sand.filter(p => p.life > 0 && p.y < h);
    draw(); requestAnimationFrame(step);
  }
  resize(); addEventListener('resize', resize);
  if (still) draw(); else requestAnimationFrame(step);
}
