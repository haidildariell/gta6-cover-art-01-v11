// Fixed scenes for screenshots: ?shot=cover draws the exported cover alone
// (size=landscape|square|story); ?shot=editor shows the editor with the
// default cast loaded. window.__shotReady is set once painted.
import { SIZES } from './cover.js';

export function runShot(shot, query, state, images, redraw) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const size = query.get('size') || 'landscape';
  if (SIZES[size]) state.size = size;
  const layout = query.get('layout');
  if (layout) state.layout = layout;
  const grade = query.get('grade');
  if (grade) state.grade = grade;
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
