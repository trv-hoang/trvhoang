// The amber constellation behind every page.
// Colours come from CSS (--star, --star-alpha, --star-line in tokens.css),
// so it follows the theme. It sleeps while the tab is hidden, uses fewer
// stars on small screens and draws a single still frame for reduced motion.

import { THEME_EVENT } from "./theme.js";

const LINK_DISTANCE = 120;
const CURSOR_DISTANCE = 160;

export function initConstellation() {
  const canvas = document.getElementById("constellation");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)").matches;

  let w = 0;
  let h = 0;
  let stars = [];
  let colour = { rgb: "255 190 60", alpha: 0.7, line: 0.22 };
  let frame = 0;
  const cursor = { x: -9999, y: -9999 };

  function readColours() {
    const cs = getComputedStyle(document.documentElement);
    colour = {
      rgb: cs.getPropertyValue("--star").trim() || colour.rgb,
      alpha: parseFloat(cs.getPropertyValue("--star-alpha")) || colour.alpha,
      line: parseFloat(cs.getPropertyValue("--star-line")) || colour.line,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const max = w < 640 ? 45 : 110;
    const count = Math.min(Math.floor((w * h) / 13000), max);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  const rgba = (a) => `rgb(${colour.rgb} / ${a})`;

  function draw(move) {
    ctx.clearRect(0, 0, w, h);

    if (move) {
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0 || s.x > w) s.vx *= -1;
        if (s.y < 0 || s.y > h) s.vy *= -1;
      }
    }

    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(colour.alpha);
      ctx.fill();
    }

    // lines between stars, and towards the cursor
    ctx.lineWidth = 0.6;
    for (let i = 0; i < stars.length; i++) {
      const a = stars[i];
      for (let j = i + 1; j < stars.length; j++) {
        const b = stars[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d >= LINK_DISTANCE) continue;
        ctx.strokeStyle = rgba((1 - d / LINK_DISTANCE) * colour.line);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      const dc = Math.hypot(a.x - cursor.x, a.y - cursor.y);
      if (dc < CURSOR_DISTANCE) {
        ctx.strokeStyle = rgba((1 - dc / CURSOR_DISTANCE) * colour.line * 1.8);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
      }
    }
  }

  function loop() {
    draw(true);
    frame = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(frame);
    if (reduce.matches || document.hidden) {
      draw(false);
      return;
    }
    frame = requestAnimationFrame(loop);
  }

  readColours();
  resize();
  start();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      start();
    }, 200);
  });
  document.addEventListener("visibilitychange", start);
  reduce.addEventListener("change", start);
  window.addEventListener(THEME_EVENT, () => {
    readColours();
    if (reduce.matches) draw(false);
  });

  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (e) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
      },
      { passive: true },
    );
    document.addEventListener("pointerleave", () => {
      cursor.x = cursor.y = -9999;
    });
  }
}
