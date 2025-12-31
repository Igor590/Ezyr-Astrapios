// lightning-canvas.js – raios em canvas
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("lightningCanvas");
  const flashLayer = document.querySelector(".bg-flash");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function randRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function jitter(prev, amplitude) {
    return prev + randRange(-amplitude, amplitude);
  }

  function createBolt(startX, startY, endY) {
    const points = [];
    const steps = 26 + Math.floor(Math.random() * 10);
    let x = startX;
    let y = startY;
    const totalY = endY - startY;

    const driftDir = Math.random() < 0.5 ? -1 : 1;
    const driftStrength = randRange(18, 32);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const targetY = startY + totalY * t;
      y = targetY + randRange(-10, 10);

      const midIntensity = 1 - Math.abs(t - 0.5) * 1.6;
      const jitterAmp = 28 * midIntensity + 10;
      x = jitter(x, jitterAmp);
      x += driftDir * driftStrength * 0.05;

      points.push({ x, y });
    }

    return points;
  }

  function smoothPoints(points) {
    if (points.length < 3) return points;
    const smooth = [];
    smooth.push(points[0]);
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      smooth.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3
      });
    }
    smooth.push(points[points.length - 1]);
    return smooth;
  }

  function drawBoltPath(points, alpha) {
    if (!points.length) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = `rgba(110,185,255,${alpha * 0.55})`;
    ctx.lineWidth = 18;
    ctx.shadowColor = `rgba(110,185,255,${alpha * 0.9})`;
    ctx.shadowBlur = 90;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(180,215,255,${alpha})`;
    ctx.lineWidth = 9;
    ctx.shadowColor = `rgba(180,215,255,${alpha})`;
    ctx.shadowBlur = 55;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `rgba(230,240,255,${alpha})`;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  let bolts = [];

  function spawnBoltGroup() {
    const { width, height } = canvas.getBoundingClientRect();
    const groupCount = 3 + Math.floor(Math.random() * 3);
    bolts = [];

    const heroSection = document.querySelector(".hero-selection");

    for (let i = 0; i < groupCount; i++) {
      const startX = randRange(-width * 0.2, width * 1.2);
      const startY = -80;
      const endY = height + 140;

      const rawPoints = createBolt(startX, startY, endY);
      const mainPoints = smoothPoints(rawPoints);

      bolts.push({
        points: mainPoints,
        life: 0,
        maxLife: 0.28 + Math.random() * 0.12
      });
    }

    if (flashLayer) {
      flashLayer.animate(
        [
          { opacity: 0 },
          { opacity: 0.65 },
          { opacity: 0.22 },
          { opacity: 0 }
        ],
        { duration: 380, easing: "ease-out" }
      );
    }

    if (heroSection) {
      heroSection.classList.remove("impact-soft", "impact-strong", "impact-shake");
      const variants = ["impact-soft", "impact-strong", "impact-shake"];
      const picked = variants[Math.floor(Math.random() * variants.length)];
      void heroSection.offsetWidth;
      heroSection.classList.add(picked);
    }

    const delayToNext = 2600 + Math.random() * 4200;
    setTimeout(spawnBoltGroup, delayToNext);
  }

  let lastTime = performance.now();
  function loop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bolts.forEach(bolt => {
      bolt.life += dt;
      const t = bolt.life / bolt.maxLife;
      if (t > 1) return;
      const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      drawBoltPath(bolt.points, Math.max(alpha, 0));
    });

    bolts = bolts.filter(b => b.life < b.maxLife * 1.02);
    requestAnimationFrame(loop);
  }

  spawnBoltGroup();
  requestAnimationFrame(loop);
});