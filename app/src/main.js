// Tideline Cover Press — editor wiring: pick photos, crop each panel,
// edit the lettering, switch layout / grade / size, export PNGs.
// A `?shot=` query sets up a fixed scene for a screenshot instead.
import { drawCover, defaultState, CAST, GRADES, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
const images = {};
let selectedPanel = 'boss';
const history = [];
let historyIndex = -1;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadCast() {
  for (const c of CAST) {
    try { images[c.key] = await loadImage(c.file); } catch { /* panel stays empty */ }
  }
}

function redraw() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, images, state);
  document.querySelectorAll('[data-size-btn]').forEach((b) => {
    b.classList.toggle('active', b.dataset.sizeBtn === state.size);
  });
  document.querySelectorAll('[data-layout-btn]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layoutBtn === state.layout);
  });
  document.querySelectorAll('[data-grade-btn]').forEach((b) => {
    b.classList.toggle('active', b.dataset.gradeBtn === state.grade);
  });
  document.querySelectorAll('[data-panel-btn]').forEach((b) => {
    b.classList.toggle('active', b.dataset.panelBtn === selectedPanel);
  });
  const p = state.panels[selectedPanel];
  document.getElementById('zoom').value = p.zoom;
  document.getElementById('panx').value = p.ox;
  document.getElementById('pany').value = p.oy;
  document.getElementById('panel-name').textContent = CAST.find((c) => c.key === selectedPanel).label;
}

function pushHistory() {
  history.splice(historyIndex + 1);
  history.push(JSON.stringify(state));
  if (history.length > 40) history.shift();
  historyIndex = history.length - 1;
  document.getElementById('undo').disabled = historyIndex <= 0;
  document.getElementById('redo').disabled = true;
}

function applyHistory() {
  const saved = JSON.parse(history[historyIndex]);
  Object.assign(state, saved);
  document.getElementById('title').value = state.title;
  document.getElementById('quote').value = state.quote;
  document.getElementById('script').value = state.script;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('undo').disabled = historyIndex <= 0;
  document.getElementById('redo').disabled = historyIndex >= history.length - 1;
  redraw();
}

function exportPNG(sizeKey) {
  const size = SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = size.w; off.height = size.h;
  const savedSize = state.size;
  state.size = sizeKey;
  drawCover(off, images, state);
  state.size = savedSize;
  redraw();
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `velvet-tide-${sizeKey}-${size.w}x${size.h}.png`;
    a.click();
    status.textContent = `Saved velvet-tide-${sizeKey}-${size.w}x${size.h}.png — 100% offline, photos never leave this machine.`;
  }, 'image/png');
}

function bind(id, event, fn) {
  document.getElementById(id).addEventListener(event, fn);
}

bind('title', 'input', (e) => { state.title = e.target.value; redraw(); });
bind('title', 'change', pushHistory);
bind('quote', 'input', (e) => { state.quote = e.target.value; redraw(); });
bind('quote', 'change', pushHistory);
bind('script', 'input', (e) => { state.script = e.target.value; redraw(); });
bind('script', 'change', pushHistory);
bind('tagline', 'input', (e) => { state.tagline = e.target.value; redraw(); });
bind('tagline', 'change', pushHistory);
bind('zoom', 'input', (e) => { state.panels[selectedPanel].zoom = Number(e.target.value); redraw(); });
bind('zoom', 'change', pushHistory);
bind('panx', 'input', (e) => { state.panels[selectedPanel].ox = Number(e.target.value); redraw(); });
bind('panx', 'change', pushHistory);
bind('pany', 'input', (e) => { state.panels[selectedPanel].oy = Number(e.target.value); redraw(); });
bind('pany', 'change', pushHistory);
bind('undo', 'click', () => { if (historyIndex > 0) { historyIndex -= 1; applyHistory(); } });
bind('redo', 'click', () => { if (historyIndex < history.length - 1) { historyIndex += 1; applyHistory(); } });
bind('reset-crop', 'click', () => {
  const c = CAST.find((x) => x.key === selectedPanel);
  state.panels[selectedPanel] = { zoom: c.zoom, ox: 0, oy: 0, src: null };
  pushHistory(); redraw();
});
bind('replace-photo', 'change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  images[selectedPanel] = await loadImage(URL.createObjectURL(file));
  pushHistory(); redraw();
  status.textContent = `${CAST.find((c) => c.key === selectedPanel).label} photo replaced — your photo never leaves this machine.`;
});
bind('export-all', 'click', () => {
  for (const k of Object.keys(SIZES)) exportPNG(k);
  status.textContent = 'Exported all three post sizes as PNG.';
});
document.querySelectorAll('[data-size-btn]').forEach((b) => {
  b.addEventListener('click', () => { state.size = b.dataset.sizeBtn; pushHistory(); redraw(); });
});
document.querySelectorAll('[data-layout-btn]').forEach((b) => {
  b.addEventListener('click', () => { state.layout = b.dataset.layoutBtn; pushHistory(); redraw(); });
});
document.querySelectorAll('[data-grade-btn]').forEach((b) => {
  b.addEventListener('click', () => { state.grade = b.dataset.gradeBtn; pushHistory(); redraw(); });
});
document.querySelectorAll('[data-panel-btn]').forEach((b) => {
  b.addEventListener('click', () => { selectedPanel = b.dataset.panelBtn; redraw(); });
});
document.querySelectorAll('[data-export-btn]').forEach((b) => {
  b.addEventListener('click', () => exportPNG(b.dataset.exportBtn));
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  await loadCast();
  runShot(shot, new URLSearchParams(location.search), state, images, redraw);
} else {
  await loadCast();
  document.getElementById('title').value = state.title;
  document.getElementById('quote').value = state.quote;
  document.getElementById('script').value = state.script;
  document.getElementById('tagline').value = state.tagline;
  pushHistory();
  redraw();
}
