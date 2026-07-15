// JERSA ERP — components/charts.js
// Thin wrapper around the global Chart.js (loaded via CDN in index.html).

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const registry = new Map();

function destroyIfExists(canvas) {
  const prev = registry.get(canvas);
  if (prev) { prev.destroy(); registry.delete(canvas); }
}

function baseScales() {
  const grid = cssVar('--border-subtle');
  const tick = cssVar('--text-tertiary');
  return {
    x: { grid: { display: false }, ticks: { color: tick, font: { size: 11 } } },
    y: { grid: { color: grid, drawTicks: false }, ticks: { color: tick, font: { size: 11 }, callback: (v) => (v >= 1000 ? Math.round(v / 1000) + 'k' : v) }, border: { display: false } },
  };
}

export function renderAreaChart(canvas, { labels, data, color, tooltipFormatter }) {
  destroyIfExists(canvas);
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
  gradient.addColorStop(0, color + '3D');
  gradient.addColorStop(1, color + '00');

  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: color, backgroundColor: gradient, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: color }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => tooltipFormatter ? tooltipFormatter(c.raw) : c.raw } } },
      scales: baseScales(),
    },
  });
  registry.set(canvas, chart);
  return chart;
}

export function renderBarChart(canvas, { labels, data, color, tooltipFormatter }) {
  destroyIfExists(canvas);
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: color, borderRadius: 5, maxBarThickness: 34 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => tooltipFormatter ? tooltipFormatter(c.raw) : c.raw } } },
      scales: baseScales(),
    },
  });
  registry.set(canvas, chart);
  return chart;
}

export function renderLineChart(canvas, { labels, data, color, tooltipFormatter }) {
  destroyIfExists(canvas);
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [{ data, borderColor: color, backgroundColor: color, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: color }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => tooltipFormatter ? tooltipFormatter(c.raw) : c.raw } } },
      scales: baseScales(),
    },
  });
  registry.set(canvas, chart);
  return chart;
}

export function renderDonutChart(canvas, { labels, data, colors }) {
  destroyIfExists(canvas);
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { color: cssVar('--text-secondary'), font: { size: 11 }, boxWidth: 9, padding: 12 } } },
    },
  });
  registry.set(canvas, chart);
  return chart;
}
