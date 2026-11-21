// Tideline Cover Press — VELVET TIDE (v11 cover engine).
// Draws a GTA-style multi-panel poster on any canvas: one uniform hard
// golden-hour grade on EVERY panel, a tall hero panel whose face is fully
// visible, an opaque chrome title in a band BELOW the hero's chin, and
// full-bleed mosaic panels with no dead surround. All lettering is drawn
// with canvas text (no external font files, no Rockstar assets).

export const CAST = [
  { key: 'boss', label: 'THE BOSS', sub: 'SKYLINE ROOF · 8:12 PM', file: 'cast/boss.jpg', focus: [0.5, 0.37], zoom: 1.22, hero: true },
  { key: 'driver', label: 'THE DRIVER', sub: 'PALM ROW · 6:47 PM', file: 'cast/driver.jpg', focus: [0.52, 0.34], zoom: 1.0 },
  { key: 'rider', label: 'THE RIDER', sub: 'SUNSET STRIP · 2:48 PM', file: 'cast/rider.jpg', focus: [0.55, 0.33], zoom: 0.92 },
  { key: 'courier', label: 'THE COURIER', sub: 'BACK ALLEY · 11:47 PM', file: 'cast/courier.jpg', focus: [0.5, 0.38], zoom: 0.92 },
  { key: 'mechanic', label: 'THE MECHANIC', sub: 'DOCKSIDE · 9:36 PM', file: 'cast/mechanic.jpg', focus: [0.55, 0.38], zoom: 1.0 },
  { key: 'lookout', label: 'THE LOOKOUT', sub: 'PIER 9 · 7:23 PM', file: 'cast/lookout.jpg', focus: [0.5, 0.34], zoom: 0.92 },
];

export const GRADES = {
  golden: { name: 'Golden Hour', filter: 'saturate(1.45) contrast(1.14) brightness(1.04) sepia(0.28)', warm: 0.2, pink: 0.14 },
  neon: { name: 'Neon Dusk', filter: 'saturate(1.35) contrast(1.18) brightness(1.0) sepia(0.18) hue-rotate(-12deg)', warm: 0.14, pink: 0.22 },
  palm: { name: 'Palm Heat', filter: 'saturate(1.6) contrast(1.1) brightness(1.07) sepia(0.34)', warm: 0.26, pink: 0.1 },
  vintage: { name: 'Vintage Fade', filter: 'saturate(1.2) contrast(1.05) brightness(1.08) sepia(0.45)', warm: 0.16, pink: 0.08 },
};

export const SIZES = {
  landscape: { w: 1920, h: 1080, label: 'Landscape 1920 × 1080' },
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  story: { w: 1080, h: 1350, label: 'Story 1080 × 1350' },
};

export function defaultState() {
  return {
    title: 'VELVET TIDE',
    quote: 'EVERY FRAME DRIPS WITH SUNLIGHT AND SIN',
    gazette: 'TIDELINE GAZETTE',
    script: 'salt on the wind',
    tagline: 'SIX STRANGERS · ONE BURNING COAST · EVERY DEBT COMES DUE',
    layout: 'mosaic',
    grade: 'golden',
    size: 'landscape',
    panels: Object.fromEntries(CAST.map((c) => [c.key, { zoom: c.zoom, ox: 0, oy: 0, src: null }])),
  };
}

// Relative layout: hero column spans almost the full photo height so the
// hero face (28%+ of the frame wide) fits 100% visible; five side panels
// fill the two flanks (3 left, 2 right). Title band sits BELOW the hero
// chin; furniture band closes the bottom. Fractions of W / H.
function mosaicPanels(W, H) {
  const top = 0.06 * H, photoBottom = 0.8 * H;
  const hero = { key: 'boss', x: 0.28 * W, y: top, w: 0.44 * W, h: photoBottom - top, rot: 0 };
  const leftW = 0.28 * W, rightX = 0.72 * W, rightW = 0.28 * W;
  const lh = (photoBottom - top) / 3, rh = (photoBottom - top) / 2;
  return [
    { key: 'driver', x: 0, y: top, w: leftW, h: lh, rot: -1.1 },
    { key: 'courier', x: 0, y: top + lh, w: leftW, h: lh, rot: 1.2 },
    { key: 'rider', x: 0, y: top + 2 * lh, w: leftW, h: lh, rot: -1.0 },
    hero,
    { key: 'mechanic', x: rightX, y: top, w: rightW, h: rh, rot: 1.1 },
    { key: 'lookout', x: rightX, y: top + rh, w: rightW, h: rh, rot: -1.2 },
  ];
}

function straightPanels(W, H) {
  return mosaicPanels(W, H).map((p) => ({ ...p, rot: 0 }));
}

function cinemaPanels(W, H) {
  const top = 0.06 * H, photoBottom = 0.8 * H, ph = photoBottom - top;
  return [
    { key: 'boss', x: 0, y: top, w: 0.45 * W, h: ph, rot: 0 },
    { key: 'driver', x: 0.45 * W, y: top, w: 0.27 * W, h: ph / 3, rot: 0 },
    { key: 'rider', x: 0.45 * W, y: top + ph / 3, w: 0.27 * W, h: ph / 3, rot: 0 },
    { key: 'courier', x: 0.45 * W, y: top + (2 * ph) / 3, w: 0.27 * W, h: ph / 3, rot: 0 },
    { key: 'mechanic', x: 0.72 * W, y: top, w: 0.28 * W, h: ph / 2, rot: 0 },
    { key: 'lookout', x: 0.72 * W, y: top + ph / 2, w: 0.28 * W, h: ph / 2, rot: 0 },
  ];
}

const LAYOUTS = { mosaic: mosaicPanels, straight: straightPanels, cinema: cinemaPanels };

function coverDrawImage(ctx, img, x, y, w, h, focus, zoom) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  // Blurred backdrop of the same photo: no dead gaps ever, grade stays warm.
  ctx.save();
  ctx.filter = 'blur(18px) saturate(1.4) brightness(0.75) sepia(0.25)';
  const bs = Math.max(w / iw, h / ih) * 1.15;
  ctx.drawImage(img, x + (w - iw * bs) / 2, y + (h - ih * bs) / 2, iw * bs, ih * bs);
  ctx.restore();
  // Sharp layer: cover-fit around the face focus point, at the panel zoom.
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const fx = focus[0] * iw * scale, fy = focus[1] * ih * scale;
  let dx = x + w / 2 - fx, dy = y + h / 2 - fy;
  dx = Math.min(x, Math.max(x + w - dw, dx));
  dy = Math.min(y, Math.max(y + h - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanelLabel(ctx, p, label, sub, W) {
  const pad = Math.max(10, W * 0.008);
  const fs = Math.max(13, W * 0.016);
  ctx.save();
  ctx.font = `900 ${fs}px "Arial Black", "DejaVu Sans", "Noto Sans", sans-serif`;
  const lw = ctx.measureText(label).width;
  ctx.font = `700 ${fs * 0.62}px "DejaVu Sans", "Noto Sans", sans-serif`;
  const sw = ctx.measureText(sub).width;
  const bw = Math.max(lw, sw) + pad * 2 + fs * 0.7;
  const bh = fs * 2.15;
  const bx = p.x + Math.max(8, W * 0.006), by = p.y + p.h - bh - Math.max(8, W * 0.006);
  ctx.fillStyle = 'rgba(8, 4, 14, 0.78)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#ffd34d';
  ctx.fillRect(bx, by, fs * 0.28, bh);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${fs}px "Arial Black", "DejaVu Sans", "Noto Sans", sans-serif`;
  ctx.fillText(label, bx + pad + fs * 0.42, by + bh * 0.32);
  ctx.fillStyle = '#ffd9a0';
  ctx.font = `700 ${fs * 0.62}px "DejaVu Sans", "Noto Sans", sans-serif`;
  ctx.fillText(sub, bx + pad + fs * 0.42, by + bh * 0.74);
  ctx.restore();
}

function drawChromeTitle(ctx, text, cx, cy, maxW, size) {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let s = size;
  const font = (px) => `900 ${px}px "Arial Black", "DejaVu Sans", "Noto Sans", sans-serif`;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 20) { s -= 4; ctx.font = font(s); }
  // Magenta slab offset below, then thick black outline, then gold-pink gradient fill.
  ctx.fillStyle = '#d63384';
  ctx.fillText(text, cx, cy + s * 0.14);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#12060f';
  ctx.lineWidth = Math.max(6, s * 0.1);
  ctx.strokeText(text, cx, cy);
  const g = ctx.createLinearGradient(0, cy - s * 0.55, 0, cy + s * 0.55);
  g.addColorStop(0, '#fffbe8'); g.addColorStop(0.35, '#ffd34d');
  g.addColorStop(0.62, '#ff8a3c'); g.addColorStop(0.85, '#ff2e88'); g.addColorStop(1, '#c9186b');
  ctx.fillStyle = g;
  ctx.fillText(text, cx, cy);
  // Top sheen.
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = font(s * 0.92);
  ctx.fillText(text, cx, cy - s * 0.06);
  ctx.restore();
  return s;
}

function drawGoldSeal(ctx, cx, cy, r) {
  ctx.save();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#fff3b0'); g.addColorStop(0.55, '#f5b301'); g.addColorStop(1, '#a86e00');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7a4d00'; ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#4a2c00'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${r * 0.34}px "Arial Black", "DejaVu Sans", sans-serif`;
  ctx.fillText('BEST', cx, cy - r * 0.28);
  ctx.fillText('COVER', cx, cy + r * 0.08);
  ctx.font = `700 ${r * 0.17}px "DejaVu Sans", sans-serif`;
  ctx.fillText('★ ORIGINAL ★', cx, cy + r * 0.48);
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let bx = x + w * 0.07;
  const bars = [3, 1, 2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 1, 3, 2, 1];
  const gap = w / 60;
  for (const b of bars) { const bw = b * (w / 130); ctx.fillRect(bx, y + h * 0.08, bw, h * 0.6); bx += bw + gap; }
  ctx.fillStyle = '#111111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fs = h * 0.2;
  ctx.font = `700 ${fs}px "DejaVu Sans", sans-serif`;
  while (ctx.measureText('0 27118 40635 2').width > w * 0.92 && fs > 6) {
    fs -= 1; ctx.font = `700 ${fs}px "DejaVu Sans", sans-serif`;
  }
  ctx.fillText('0 27118 40635 2', x + w / 2, y + h * 0.86);
  ctx.restore();
}

/** Draws the full cover onto `canvas` (sized by the caller). `images` maps cast key -> HTMLImageElement. */
export function drawCover(canvas, images, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const grade = GRADES[state.grade] || GRADES.golden;
  ctx.fillStyle = '#160a1e'; ctx.fillRect(0, 0, W, H);

  const panels = (LAYOUTS[state.layout] || mosaicPanels)(W, H);
  const byKey = Object.fromEntries(CAST.map((c) => [c.key, c]));

  // 1) Photo panels, each through the SAME hard sunset grade.
  for (const p of panels) {
    const c = byKey[p.key];
    const img = images[p.key];
    const st = state.panels[p.key] || { zoom: c.zoom, ox: 0, oy: 0 };
    ctx.save();
    ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip();
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    ctx.translate(cx, cy); ctx.rotate(((p.rot || 0) * Math.PI) / 180); ctx.translate(-cx, -cy);
    const pad = Math.max(10, W * 0.012);
    const rx = p.x - pad, ry = p.y - pad, rw = p.w + pad * 2, rh = p.h + pad * 2;
    if (img) {
      ctx.filter = grade.filter;
      const focus = [c.focus[0] + (st.ox || 0) * 0.1, c.focus[1] + (st.oy || 0) * 0.1];
      coverDrawImage(ctx, img, rx, ry, rw, rh, focus, st.zoom || 1);
      ctx.filter = 'none';
    }
    // Uniform warm wash over the panel: the grade is one grade, not six.
    const wash = ctx.createLinearGradient(rx, ry, rx, ry + rh);
    wash.addColorStop(0, `rgba(255, 140, 40, ${grade.warm * 0.7})`);
    wash.addColorStop(1, `rgba(255, 60, 140, ${grade.pink})`);
    ctx.fillStyle = wash; ctx.fillRect(rx, ry, rw, rh);
    // Vignette.
    const vg = ctx.createRadialGradient(cx, cy, Math.min(rw, rh) * 0.3, cx, cy, Math.max(rw, rh) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,4,20,0.35)');
    ctx.fillStyle = vg; ctx.fillRect(rx, ry, rw, rh);
    ctx.restore();
    // Gold frame + label (unrotated, so text stays level).
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 211, 77, 0.9)'; ctx.lineWidth = Math.max(2, W * 0.002);
    ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
    drawPanelLabel(ctx, p, c.label, c.sub, W);
    ctx.restore();
  }

  // 2) Top press strip.
  const stripH = 0.06 * H;
  ctx.fillStyle = '#160a1e'; ctx.fillRect(0, 0, W, stripH);
  ctx.fillStyle = '#ffd34d'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${stripH * 0.42}px "DejaVu Sans", sans-serif`;
  ctx.textAlign = 'left';
  const stars = '★★★★★';
  ctx.fillText(stars, W * 0.015, stripH * 0.52);
  const starsW = ctx.measureText(stars).width;
  const quoteX = W * 0.015 + starsW + W * 0.012;
  // Quote + gazette shrink to fit the strip (never overlap, never clip).
  const vol = 'VOL. 11';
  ctx.font = `900 ${stripH * 0.38}px "DejaVu Sans", sans-serif`;
  const vw = ctx.measureText(vol).width + stripH * 0.5;
  const avail = W - vw - W * 0.03 - quoteX;
  let qSize = stripH * 0.4;
  const quote = `“${state.quote}”`;
  const gaz = ` — ${state.gazette}`;
  const qFont = (px) => `900 ${px}px "DejaVu Sans", "Noto Sans", sans-serif`;
  const gFont = (px) => `700 ${px}px "DejaVu Sans", sans-serif`;
  ctx.font = qFont(qSize);
  let qw = ctx.measureText(quote).width;
  ctx.font = gFont(qSize * 0.85);
  let gw = ctx.measureText(gaz).width;
  while (qw + gw > avail && qSize > stripH * 0.2) {
    qSize -= 1;
    ctx.font = qFont(qSize); qw = ctx.measureText(quote).width;
    ctx.font = gFont(qSize * 0.85); gw = ctx.measureText(gaz).width;
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = qFont(qSize);
  ctx.fillText(quote, quoteX, stripH * 0.52);
  ctx.fillStyle = '#ffb3d1';
  ctx.font = gFont(qSize * 0.85);
  ctx.fillText(gaz, quoteX + qw + W * 0.008, stripH * 0.54);
  ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = Math.max(2, stripH * 0.06);
  ctx.strokeRect(W - vw - W * 0.012, stripH * 0.16, vw, stripH * 0.68);
  ctx.fillStyle = '#ffd34d'; ctx.textAlign = 'center';
  ctx.font = `900 ${stripH * 0.38}px "DejaVu Sans", sans-serif`;
  ctx.fillText(vol, W - vw / 2 - W * 0.012, stripH * 0.52);

  // 3) Title band — BELOW the hero chin (hero panel ends at 0.80H).
  const bandY = 0.8 * H, bandH = 0.1 * H;
  ctx.fillStyle = '#14091d'; ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = '#ffd34d'; ctx.fillRect(0, bandY, W, Math.max(2, H * 0.004));
  ctx.fillStyle = '#ff2e88'; ctx.fillRect(0, bandY + bandH, W, Math.max(2, H * 0.004));
  const titleSize = drawChromeTitle(ctx, state.title.toUpperCase(), W / 2, bandY + bandH * 0.42, W * 0.86, bandH * 0.78);
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff5da2';
  ctx.font = `italic 900 ${titleSize * 0.34}px Georgia, "Times New Roman", serif`;
  ctx.fillText(state.script, W / 2, bandY + bandH * 0.86);
  ctx.restore();

  // Gold seal overlapping the title band's right edge.
  drawGoldSeal(ctx, W * 0.945, bandY + bandH * 0.5, Math.min(W, H) * 0.052);

  // 4) Bottom furniture band: sunset strip + billing.
  const botY = 0.9 * H, botH = 0.1 * H;
  const sg = ctx.createLinearGradient(0, botY, W, botY);
  sg.addColorStop(0, '#ff8a3c'); sg.addColorStop(0.5, '#ff5da2'); sg.addColorStop(1, '#7a2bff');
  ctx.fillStyle = sg; ctx.fillRect(0, botY, W, Math.max(3, H * 0.006));
  ctx.fillStyle = '#160a1e'; ctx.fillRect(0, botY + Math.max(3, H * 0.006), W, botH);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff5da2'; ctx.textAlign = 'left';
  ctx.font = `900 ${W * 0.02}px "Arial Black", "DejaVu Sans", sans-serif`;
  ctx.fillText('COMING SOON', W * 0.015, botY + botH * 0.32);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.font = `700 ${W * 0.0115}px "DejaVu Sans", sans-serif`;
  ctx.fillText('A TIDELINE PICTURES PRODUCTION · STARRING YOU · MUSIC BY GOLDEN STATIC', W * 0.5, botY + botH * 0.3);
  ctx.fillStyle = '#ffd9a0';
  ctx.font = `700 ${W * 0.0115}px "DejaVu Sans", sans-serif`;
  ctx.fillText(state.tagline, W * 0.5, botY + botH * 0.62);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
  ctx.font = `900 ${W * 0.013}px "DejaVu Sans", sans-serif`;
  ctx.fillText('DIRECTED BY S. VASQUEZ', W * 0.015, botY + botH * 0.72);
  // 18+ box + barcode, bottom right.
  const bcW = W * 0.085, bcH = botH * 0.72;
  const bcX = W - bcW - W * 0.012, bcY = botY + botH * 0.14;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, botH * 0.04);
  ctx.strokeRect(bcX - bcW * 0.74, bcY, bcW * 0.62, bcH);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.font = `900 ${Math.min(bcH * 0.42, bcW * 0.3)}px "DejaVu Sans", sans-serif`;
  ctx.fillText('18+', bcX - bcW * 0.43, bcY + bcH * 0.52);
  drawBarcode(ctx, bcX, bcY, bcW, bcH);

  // Grain: light speckle so flat bands read as print, not plastic.
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.restore();
}
