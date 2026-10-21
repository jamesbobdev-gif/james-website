document.getElementById('year').textContent = new Date().getFullYear();

// Minecraft-style rain: drawn on a small canvas and scaled up so every drop is chunky pixels.
const rain = document.getElementById('rain');
if (rain) {
  const ctx = rain.getContext('2d');
  const PIXEL = 3;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, drops, splashes;

  const newDrop = (anyHeight) => ({
    x: Math.floor(Math.random() * w),
    y: anyHeight ? Math.random() * h : -Math.random() * h * 0.5,
    len: 3 + Math.floor(Math.random() * 5),
    speed: 2 + Math.random() * 1.5,
    light: Math.random() < 0.3,
  });

  function resize() {
    w = Math.ceil(innerWidth / PIXEL);
    h = Math.ceil(innerHeight / PIXEL);
    rain.width = w;
    rain.height = h;
    drops = Array.from({ length: Math.round(w * 0.12) }, () => newDrop(true));
    splashes = [];
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const d of drops) {
      ctx.fillStyle = d.light ? 'rgba(140, 165, 230, .28)' : 'rgba(70, 100, 190, .45)';
      ctx.fillRect(d.x, Math.floor(d.y), 1, d.len);
    }
    ctx.fillStyle = 'rgba(150, 175, 235, .6)';
    for (const s of splashes) ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
  }

  function step() {
    for (const d of drops) {
      d.y += d.speed;
      if (d.y > h) {
        // little splash where the drop lands, then respawn above the screen
        for (let i = 0; i < 2; i++) splashes.push({ x: d.x, y: h - 1, vx: (Math.random() - 0.5) * 1.2, vy: -0.6 - Math.random() * 0.8, life: 10 });
        Object.assign(d, newDrop(false));
      }
    }
    for (const s of splashes) { s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.life--; }
    splashes = splashes.filter(s => s.life > 0);
    draw();
    requestAnimationFrame(step);
  }

  resize();
  addEventListener('resize', resize);
  if (still) draw(); else requestAnimationFrame(step);
}
