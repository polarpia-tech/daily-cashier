/* ❄️ snow.fx.js — Christmas Snow Overlay (top -> mid fade-out)
   Usage: include <script src="./snow.fx.js" defer></script>
   Optional: window.setSnowFxEnabled(true/false)
*/

(() => {
  const CFG = {
    enabled: true,
    density: 0.22,   // 0.12 πολύ αραιό • 0.22 αραιό • 0.35 πιο πυκνό
    maxY: 0.52,      // μέχρι ποιο ποσοστό ύψους να φτάνει πριν “χάνεται”
    speedMin: 0.18,
    speedMax: 0.55,
    sizeMin: 1.1,
    sizeMax: 3.2,
    windMin: -0.18,
    windMax: 0.18,
    zIndex: 996,
    opacity: 0.95
  };

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) CFG.enabled = false;

  function ensureCanvas() {
    let c = document.getElementById("snowFx");
    if (c) return c;

    c = document.createElement("canvas");
    c.id = "snowFx";
    c.setAttribute("aria-hidden", "true");

    // inline style ώστε να ΜΗΝ πειράξεις CSS στον κεντρικό κώδικα
    c.style.position = "fixed";
    c.style.left = "0";
    c.style.top = "0";
    c.style.width = "100vw";
    c.style.height = "100vh";
    c.style.pointerEvents = "none";
    c.style.zIndex = String(CFG.zIndex);
    c.style.opacity = String(CFG.opacity);

    // μπαίνει πρώτο στο body (κάτω απ’ τα modals κτλ λόγω z-index)
    document.body.prepend(c);
    return c;
  }

  const canvas = ensureCanvas();
  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0, H = 0, DPR = 1;
  let flakes = [];
  let raf = 0;
  let running = false;

  const rand = (a, b) => a + Math.random() * (b - a);

  function spawnFlake(initial = false) {
    const yStart = initial ? rand(0, H * CFG.maxY) : -rand(6, 60);
    const r = rand(CFG.sizeMin, CFG.sizeMax);
    return {
      x: rand(0, W),
      y: yStart,
      r,
      vy: rand(CFG.speedMin, CFG.speedMax) * (0.65 + r / 3),
      vx: rand(CFG.windMin, CFG.windMax),
      wob: rand(0, Math.PI * 2),
      wobSpeed: rand(0.004, 0.012),
      alphaBase: rand(0.35, 0.85)
    };
  }

  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const targetCount = Math.floor((W * H) / 55000 * (1 + CFG.density * 3));
    const base = Math.max(18, Math.min(120, targetCount));
    const count = Math.floor(base * (0.75 + CFG.density));

    flakes = new Array(count).fill(0).map(() => spawnFlake(true));
  }

  function step() {
    if (!running) return;

    ctx.clearRect(0, 0, W, H);

    const yFadeStart = H * (CFG.maxY * 0.70);
    const yFadeEnd = H * CFG.maxY;

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];

      f.wob += f.wobSpeed;
      f.x += f.vx + Math.sin(f.wob) * 0.22;
      f.y += f.vy;

      if (f.x < -10) f.x = W + 10;
      if (f.x > W + 10) f.x = -10;

      let a = f.alphaBase;
      if (f.y >= yFadeStart) {
        const t = Math.min(
          1,
          Math.max(0, (f.y - yFadeStart) / Math.max(1, yFadeEnd - yFadeStart))
        );
        a = f.alphaBase * (1 - t);
      }

      if (a > 0.01 && f.y <= yFadeEnd + 10) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      if (f.y > yFadeEnd + 14) {
        flakes[i] = spawnFlake(false);
      }
    }

    raf = requestAnimationFrame(step);
  }

  function start() {
    if (!CFG.enabled) {
      canvas.style.display = "none";
      return;
    }
    canvas.style.display = "block";
    if (running) return;
    running = true;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, W, H);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener("resize", () => resize(), { passive: true });

  // public toggle
  window.setSnowFxEnabled = (on) => {
    CFG.enabled = !!on;
    if (CFG.enabled) start();
    else {
      stop();
      canvas.style.display = "none";
    }
  };

  // boot
  resize();
  start();
})();