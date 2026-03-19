import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   ULTRA-PREMIUM CINEMATIC PRELOADER — CODE CATALYSTS
   
   Purely choreographed. No mouse interaction.
   Canvas 2D with multi-depth particle systems, line-stroke text
   construction, volumetric haze, circuit patterns, transformation
   phase, and seamless exit.
═══════════════════════════════════════════════════════════════ */

/* ── Palette (muted luxury) ── */
const BLUE = '#4AA8D8';
const VIOLET = '#8B7FD4';
const ACCENT = '#5CBBFF';
const DIM = '#2A3A5C';

/* ── Timing ── */
const TOTAL = 3800;
const EXIT_DUR = 1000;
const FONT = "'Space Grotesk', 'Inter', sans-serif";

/* ── Easing library ── */
const ease = {
  outQuint: t => 1 - Math.pow(1 - t, 5),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const remap = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);
const lerp = (a, b, t) => a + (b - a) * t;

/* ════════════════════════════════════════════════
   PARTICLE SYSTEMS — two layers for depth
════════════════════════════════════════════════ */

// Background particles — large, slow, dim
function makeBgParticle(W, H) {
  const angle = Math.random() * Math.PI * 2;
  const r = 200 + Math.random() * Math.max(W, H) * 0.5;
  return {
    x: W / 2 + Math.cos(angle) * r,
    y: H / 2 + Math.sin(angle) * r,
    tx: W / 2 + (Math.random() - 0.5) * 500,
    ty: H / 2 + (Math.random() - 0.5) * 200,
    size: 1.0 + Math.random() * 2.5,
    alpha: 0.04 + Math.random() * 0.08,
    speed: 0.008 + Math.random() * 0.012,
    phase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.6 ? DIM : VIOLET,
  };
}

// Foreground particles — small, faster, brighter, converge to wordmark
function makeFgParticle(W, H) {
  const angle = Math.random() * Math.PI * 2;
  const r = 100 + Math.random() * 350;
  return {
    x: W / 2 + Math.cos(angle) * r,
    y: H / 2 + Math.sin(angle) * r,
    tx: W / 2 + (Math.random() - 0.5) * 300,
    ty: H / 2 + (Math.random() - 0.5) * 60,
    size: 0.4 + Math.random() * 1.2,
    alpha: 0.1 + Math.random() * 0.3,
    speed: 0.015 + Math.random() * 0.025,
    phase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.4 ? ACCENT : BLUE,
    formAngle: Math.random() * Math.PI * 2,
    formR: 130 + Math.random() * 50,
  };
}

/* ════════════════════════════════════════════════
   LINE-STROKE LETTER CONSTRUCTION
   Traces the outline of each character before filling
════════════════════════════════════════════════ */
function drawConstructedText(ctx, text, x, y, font, fillStyle, glowColor, revealT) {
  ctx.save();
  ctx.font = font;
  ctx.textBaseline = 'middle';

  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const charW = ctx.measureText(ch).width;

    // Stagger per character
    const lo = (i / text.length) * 0.45;
    const hi = lo + 0.55;
    const rawT = clamp(remap(revealT, lo, hi, 0, 1), 0, 1);

    if (rawT > 0) {
      const eased = ease.outQuint(rawT);

      // Phase 1 (0 → 0.4): Line-stroke scaffold
      const strokeT = clamp(rawT / 0.4, 0, 1);
      // Phase 2 (0.3 → 1.0): Solid fill emerges
      const fillT = clamp(remap(rawT, 0.3, 1.0, 0, 1), 0, 1);
      const fillEased = ease.outCubic(fillT);

      const yOff = (1 - eased) * 8;

      ctx.save();
      ctx.globalAlpha = eased;

      // Line-stroke phase — thin wireframe outline of the letter
      if (strokeT > 0 && strokeT < 1) {
        ctx.save();
        ctx.globalAlpha = (1 - fillEased) * 0.65 * eased;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        // We use strokeText with clipping to simulate partial drawing
        ctx.beginPath();
        ctx.rect(cx - 2, y - 60, charW * ease.outCubic(strokeT) + 2, 120);
        ctx.clip();
        ctx.strokeText(ch, cx, y + yOff);
        ctx.restore();
      }

      // Solid fill phase — the letter solidifies
      if (fillEased > 0) {
        ctx.save();
        ctx.globalAlpha = fillEased * eased;

        // Single elegant glow (not multi-pass bloom)
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12 * (1 - fillEased * 0.5);
        ctx.fillStyle = fillStyle;
        ctx.fillText(ch, cx, y + yOff);
        ctx.restore();
      }

      ctx.restore();
    }
    cx += charW;
  }
  ctx.restore();
}

/* ════════════════════════════════════════════════
   MAIN DRAW FRAME
════════════════════════════════════════════════ */
function drawFrame(ctx, W, H, ms, bgParts, fgParts) {
  ctx.clearRect(0, 0, W, H);

  // ── DEEP SKY BACKGROUND ──
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
  bg.addColorStop(0, 'rgb(8,8,30)');
  bg.addColorStop(0.5, 'rgb(4,4,18)');
  bg.addColorStop(1, 'rgb(1,1,8)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── AMBIENT AWAKENING PULSE (0 → 600ms) ──
  const pulseT = ease.outExpo(clamp(ms / 1200, 0, 1));
  const pulseAlpha = 0.10 * pulseT * (1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 600, TOTAL, 0, 1), 0, 1)));
  if (pulseAlpha > 0.001) {
    const pulse = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 300 + pulseT * 80);
    pulse.addColorStop(0, `rgba(60,130,220,${pulseAlpha})`);
    pulse.addColorStop(0.6, `rgba(80,60,180,${pulseAlpha * 0.4})`);
    pulse.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pulse;
    ctx.fillRect(0, 0, W, H);
  }

  // ── EXPANDING PULSE RING (200 → 800ms) ──
  const ringT = ease.outCubic(clamp(remap(ms, 200, 800, 0, 1), 0, 1));
  if (ringT > 0 && ringT < 1) {
    const ringR = 50 + ringT * 350;
    ctx.save();
    ctx.globalAlpha = (1 - ringT) * 0.12;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── VIGNETTE ──
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, W * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // ── BACKGROUND GRID/CIRCUIT FRAGMENTS (reveals 400 → 1200ms, fades 3200+) ──
  const gridIn = ease.outCubic(clamp(remap(ms, 400, 1200, 0, 1), 0, 1));
  const gridOut = ease.inOutCubic(clamp(remap(ms, TOTAL - 600, TOTAL, 0, 1), 0, 1));
  const gridA = gridIn * (1 - gridOut);
  if (gridA > 0.005) {
    ctx.save();
    ctx.globalAlpha = gridA * 0.04;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 0.5;
    const step = 60;
    const ox = (W / 2) % step, oy = (H / 2) % step;
    for (let gx = ox; gx < W; gx += step) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = oy; gy < H; gy += step) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
    // Center crosshair
    ctx.globalAlpha = gridA * 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 20, H / 2); ctx.lineTo(W / 2 + 20, H / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2, H / 2 - 20); ctx.lineTo(W / 2, H / 2 + 20); ctx.stroke();
    ctx.restore();
  }

  // ── BACKGROUND PARTICLES (layer 1 — deep, slow) ──
  const bgIn = ease.outCubic(clamp(ms / 800, 0, 1));
  const bgOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 500, TOTAL, 0, 1), 0, 1));
  bgParts.forEach(p => {
    const ct = ease.outCubic(clamp(ms * p.speed * 0.08, 0, 1));
    const px = lerp(p.x, p.tx, ct);
    const py = lerp(p.y, p.ty, ct);
    const twinkle = 0.6 + 0.4 * Math.sin(ms * 0.0008 + p.phase);
    const a = p.alpha * twinkle * bgIn * bgOut;
    if (a < 0.002) return;
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
    g.addColorStop(0, p.color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── FOREGROUND PARTICLES (layer 2 — closer, converge, then form) ──
  const fgIn = ease.outCubic(clamp(ms / 600, 0, 1));
  const fgOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 500, TOTAL, 0, 1), 0, 1));
  const formT = ease.inOutQuart(clamp(remap(ms, 2200, 2900, 0, 1), 0, 1));

  fgParts.forEach(p => {
    const ct = ease.outCubic(clamp(ms * p.speed * 0.06, 0, 1));
    let px = lerp(p.x, p.tx, ct);
    let py = lerp(p.y, p.ty, ct);

    // Formation: snap to orbital ring at 2200ms+
    const fpx = W / 2 + Math.cos(p.formAngle) * p.formR;
    const fpy = H / 2 + Math.sin(p.formAngle) * p.formR;
    px = lerp(px, fpx, formT * 0.6);
    py = lerp(py, fpy, formT * 0.6);

    const twinkle = 0.5 + 0.5 * Math.sin(ms * 0.0015 + p.phase);
    const a = p.alpha * twinkle * fgIn * fgOut;
    if (a < 0.002) return;

    ctx.save();
    ctx.globalAlpha = a;
    // Soft glow dot
    const g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
    g.addColorStop(0, p.color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
    ctx.fill();
    // Hard core
    ctx.globalAlpha = a * 1.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── TYPOGRAPHY SETUP ──
  const codeSize = Math.min(W * 0.12, 102);
  const catSize = Math.min(W * 0.125, 107);
  const gap = codeSize * 0.18;

  ctx.font = `800 ${codeSize}px ${FONT}`;
  const codeW = ctx.measureText('Code').width;
  ctx.font = `800 ${catSize}px ${FONT}`;
  const catW = ctx.measureText('Catalysts').width;
  const totalW = codeW + gap + catW;
  const startX = W / 2 - totalW / 2;
  const catX = startX + codeW + gap;

  // Create gradient fill for "Code"
  const codeGrad = ctx.createLinearGradient(startX, 0, startX + codeW, 0);
  codeGrad.addColorStop(0, '#5CBBFF');
  codeGrad.addColorStop(1, '#8B7FD4');

  // "Code" — line-stroke construction (400 → 1200ms)
  const codeT = clamp(remap(ms, 400, 1200, 0, 1), 0, 1);
  if (codeT > 0) {
    drawConstructedText(
      ctx, 'Code', startX, H / 2,
      `800 ${codeSize}px ${FONT}`,
      codeGrad, BLUE, codeT, ms
    );
  }

  // "Catalysts" — line-stroke construction (1100 → 2000ms)
  const catT = clamp(remap(ms, 1100, 2000, 0, 1), 0, 1);
  if (catT > 0) {
    drawConstructedText(
      ctx, 'Catalysts', catX, H / 2,
      `800 ${catSize}px ${FONT}`,
      'rgba(230,233,245,0.95)', VIOLET, catT, ms
    );
  }

  // ── SCAN LINE — single pass across full wordmark (1200 → 1500ms) ──
  const scanT = ease.inOutCubic(clamp(remap(ms, 1200, 1500, 0, 1), 0, 1));
  if (scanT > 0 && scanT < 1 && codeT >= 0.8) {
    const sx = startX - 10 + (totalW + 20) * scanT;
    const halfH = codeSize * 0.65;
    ctx.save();
    ctx.globalAlpha = Math.sin(scanT * Math.PI) * 0.5;
    ctx.strokeStyle = 'rgba(140,200,255,0.9)';
    ctx.lineWidth = 1;
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(sx, H / 2 - halfH);
    ctx.lineTo(sx, H / 2 + halfH);
    ctx.stroke();
    ctx.restore();
  }

  // ── LIGHT SWEEP across typography (2000 → 2500ms) ──
  const sweepT = ease.inOutCubic(clamp(remap(ms, 2000, 2500, 0, 1), 0, 1));
  if (sweepT > 0 && sweepT < 1 && catT >= 0.8) {
    const sx = startX - 60 + (totalW + 120) * sweepT;
    const sw = 80;
    ctx.save();
    const sg = ctx.createLinearGradient(sx - sw, 0, sx + 20, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.6, 'rgba(255,255,255,0.04)');
    sg.addColorStop(0.9, 'rgba(255,255,255,0.10)');
    sg.addColorStop(1, 'rgba(255,255,255,0.03)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx - sw, H / 2 - codeSize * 0.9, sw + 22, codeSize * 1.8);
    ctx.restore();
  }

  // ── ORBITAL ARCS (emerge at 1800ms, fade at exit) ──
  const arcIn = ease.outCubic(clamp(remap(ms, 1800, 2600, 0, 1), 0, 1));
  const arcOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 600, TOTAL, 0, 1), 0, 1));
  const arcA = arcIn * arcOut;
  if (arcA > 0.005) {
    ctx.save();
    ctx.globalAlpha = arcA * 0.12;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 0.8;

    // Two thin orbital arcs around the wordmark
    const arcR1 = totalW * 0.38;
    const arcR2 = totalW * 0.42;
    const arcAngle = ms * 0.0003;
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, arcR1, arcR1 * 0.35, 0, arcAngle, arcAngle + Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, arcR2, arcR2 * 0.3, Math.PI * 0.15, -arcAngle, -arcAngle + Math.PI * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  // ── CIRCUIT CONNECTOR LINES (2200 → 2800ms) ──
  const circIn = ease.outCubic(clamp(remap(ms, 2200, 2800, 0, 1), 0, 1));
  const circOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 500, TOTAL, 0, 1), 0, 1));
  const circA = circIn * circOut;
  if (circA > 0.01) {
    const branches = [
      { x1: startX - 8, y1: H / 2, x2: startX - 55, y2: H / 2, delay: 0 },
      { x1: startX - 55, y1: H / 2, x2: startX - 55, y2: H / 2 - 18, delay: 0.15 },
      { x1: startX - 55, y1: H / 2, x2: startX - 55, y2: H / 2 + 18, delay: 0.2 },
      { x1: catX + catW + 8, y1: H / 2, x2: catX + catW + 55, y2: H / 2, delay: 0.05 },
      { x1: catX + catW + 55, y1: H / 2, x2: catX + catW + 55, y2: H / 2 - 18, delay: 0.18 },
      { x1: catX + catW + 55, y1: H / 2, x2: catX + catW + 55, y2: H / 2 + 18, delay: 0.22 },
      { x1: W / 2, y1: H / 2 - codeSize * 0.85, x2: W / 2, y2: H / 2 - codeSize * 1.35, delay: 0.1 },
      { x1: W / 2, y1: H / 2 + codeSize * 0.85, x2: W / 2, y2: H / 2 + codeSize * 1.35, delay: 0.12 },
    ];

    ctx.save();
    branches.forEach(({ x1, y1, x2, y2, delay }) => {
      const lt = clamp(remap(circIn, delay, delay + 0.5, 0, 1), 0, 1);
      if (lt <= 0) return;
      const ex = lerp(x1, x2, lt);
      const ey = lerp(y1, y2, lt);

      ctx.globalAlpha = circA * 0.5;
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 0.8;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Endpoint node
      if (lt > 0.95) {
        ctx.globalAlpha = circA * 0.8;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x2, y2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // ── TRANSFORMATION HALO (2500 → 3200ms) ──
  const haloIn = ease.outCubic(clamp(remap(ms, 2500, 2800, 0, 1), 0, 1));
  const haloOut = ease.inOutCubic(clamp(remap(ms, 3000, 3400, 0, 1), 0, 1));
  const haloA = haloIn * (1 - haloOut);
  if (haloA > 0.005) {
    ctx.save();
    const haloR = totalW * 0.35;
    ctx.globalAlpha = haloA * 0.08;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, haloR, 0, Math.PI * 2);
    ctx.stroke();
    // Inner ring
    ctx.globalAlpha = haloA * 0.04;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, haloR * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── MICRO GLASS SHELF LINE (2100 → exit) ──
  const shelfIn = ease.outCubic(clamp(remap(ms, 2100, 2600, 0, 1), 0, 1));
  const shelfOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 500, TOTAL, 0, 1), 0, 1));
  const shelfA = shelfIn * shelfOut;
  if (shelfA > 0.005 && catT >= 0.9) {
    const lnY = H / 2 + codeSize * 0.78;
    const lnW = totalW * 0.5;
    const lnX = W / 2 - lnW / 2;
    const lnGr = ctx.createLinearGradient(lnX, 0, lnX + lnW, 0);
    lnGr.addColorStop(0, 'rgba(255,255,255,0)');
    lnGr.addColorStop(0.25, 'rgba(120,180,255,0.2)');
    lnGr.addColorStop(0.5, 'rgba(180,200,255,0.35)');
    lnGr.addColorStop(0.75, 'rgba(120,180,255,0.2)');
    lnGr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.globalAlpha = shelfA;
    ctx.strokeStyle = lnGr;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(lnX, lnY);
    ctx.lineTo(lnX + lnW, lnY);
    ctx.stroke();
    ctx.restore();
  }

  // ── TAGLINE (2200 → exit) ──
  const tagIn = ease.outCubic(clamp(remap(ms, 2200, 2700, 0, 1), 0, 1));
  const tagOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 500, TOTAL, 0, 1), 0, 1));
  const tagA = tagIn * tagOut;
  if (tagA > 0.005 && catT >= 0.9) {
    const tagSize = Math.min(W * 0.014, 12);
    ctx.save();
    ctx.globalAlpha = tagA * 0.45;
    ctx.font = `400 ${tagSize}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(155,170,200,1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEARN  ·  BUILD  ·  SHIP', W / 2, H / 2 + codeSize * 1.1);
    ctx.restore();
  }

  // ── SLIM PROGRESS BAR ──
  const barIn = ease.outCubic(clamp(ms / 300, 0, 1));
  const barOut = 1 - ease.inOutCubic(clamp(remap(ms, TOTAL - 400, TOTAL, 0, 1), 0, 1));
  const barA = barIn * barOut;
  const progT = ease.outQuint(clamp(ms / (TOTAL - 300), 0, 1));
  if (barA > 0.005) {
    const bW = Math.min(W * 0.22, 180);
    const bH = 1;
    const bX = W / 2 - bW / 2;
    const bY = H / 2 + codeSize * 1.5;
    ctx.save();
    // Track
    ctx.globalAlpha = barA * 0.12;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(bX, bY, bW, bH);
    // Fill
    const barG = ctx.createLinearGradient(bX, 0, bX + bW, 0);
    barG.addColorStop(0, BLUE);
    barG.addColorStop(1, VIOLET);
    ctx.globalAlpha = barA * 0.7;
    ctx.fillStyle = barG;
    ctx.shadowColor = BLUE;
    ctx.shadowBlur = 5;
    ctx.fillRect(bX, bY, bW * progT, bH);
    ctx.restore();
  }

  // ── FINAL VIGNETTE PASS ──
  const vig2 = ctx.createRadialGradient(W / 2, H / 2, W * 0.12, W / 2, H / 2, W * 0.68);
  vig2.addColorStop(0, 'rgba(0,0,0,0)');
  vig2.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig2;
  ctx.fillRect(0, 0, W, H);
}

/* ════════════════════════════════════════════════
   PRELOADER REACT COMPONENT
════════════════════════════════════════════════ */
export default function Preloader({ onReveal, onComplete }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const bgParts = useRef([]);
  const fgParts = useRef([]);
  const fontReady = useRef(false);
  const revealStarted = useRef(false);
  const completedRef = useRef(false);
  const mountedRef = useRef(false);
  const previousBodyOverflowRef = useRef('');
  const previousHtmlOverflowRef = useRef('');
  const onRevealRef = useRef(onReveal);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onRevealRef.current = onReveal;
    onCompleteRef.current = onComplete;
  }, [onReveal, onComplete]);

  useEffect(() => {
    mountedRef.current = true;
    previousBodyOverflowRef.current = document.body.style.overflow;
    previousHtmlOverflowRef.current = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => {
        mountedRef.current = false;
        document.body.style.overflow = previousBodyOverflowRef.current;
        document.documentElement.style.overflow = previousHtmlOverflowRef.current;
      };
    }

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) {
      return () => {
        mountedRef.current = false;
        document.body.style.overflow = previousBodyOverflowRef.current;
        document.documentElement.style.overflow = previousHtmlOverflowRef.current;
      };
    }

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgParts.current = Array.from({ length: 35 }, () => makeBgParticle(W, H));
      fgParts.current = Array.from({ length: 45 }, () => makeFgParticle(W, H));
    };

    setup();
    window.addEventListener('resize', setup, { passive: true });

    // Wait for font, but don't block if it takes too long
    const fallbackTimer = window.setTimeout(() => { fontReady.current = true; }, 300);
    const fontPromise = document.fonts?.load
      ? document.fonts.load(`800 96px 'Space Grotesk'`)
      : Promise.resolve();

    fontPromise
      .then(() => {
        fontReady.current = true;
        window.clearTimeout(fallbackTimer);
      })
      .catch(() => {
        fontReady.current = true;
        window.clearTimeout(fallbackTimer);
      });

    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      if (fontReady.current) {
        drawFrame(ctx, W, H, elapsed, bgParts.current, fgParts.current);
      }

      if (elapsed < TOTAL) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (!revealStarted.current) {
          revealStarted.current = true;
          onRevealRef.current?.();
        }

        if (mountedRef.current) {
          setVisible(false);
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      document.body.style.overflow = previousBodyOverflowRef.current;
      document.documentElement.style.overflow = previousHtmlOverflowRef.current;
      window.removeEventListener('resize', setup);
      window.clearTimeout(fallbackTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleExitComplete = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    document.body.style.overflow = previousBodyOverflowRef.current;
    document.documentElement.style.overflow = previousHtmlOverflowRef.current;
    onCompleteRef.current?.();
  }, []);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: EXIT_DUR / 1000, ease: [0.4, 0, 0.2, 1] },
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgb(4,4,18)',
            willChange: 'opacity',
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
