// JERSA ERP — components/kpiCard.js

/**
 * @param {Object} opts
 * @param {string} opts.label
 * @param {string} opts.value
 * @param {string} opts.iconSvg - inline SVG string (lucide icon markup)
 * @param {string} opts.tint - hex color for the icon chip
 * @param {string} [opts.sub] - small caption under the value
 * @param {{dir:'up'|'down', text:string}} [opts.delta]
 */
export function kpiCard({ label, value, iconSvg, tint, sub, delta }) {
  return `
    <div class="jr-card kpi-card">
      <div class="kpi-top">
        <span class="kpi-label">${label}</span>
        <div class="kpi-icon" style="background:${tint}1A; color:${tint};">${iconSvg}</div>
      </div>
      <div class="kpi-value tabular">${value}</div>
      ${delta ? `<span class="kpi-delta ${delta.dir}">${delta.dir === 'up' ? '↑' : '↓'} ${delta.text}</span>` : ''}
      ${sub ? `<span class="kpi-sub">${sub}</span>` : ''}
    </div>
  `;
}
