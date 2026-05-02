'use strict';

// ─── Helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);
const num = id => parseFloat($(id)?.value) || 0;
const fmt = v => '$' + Math.max(0, v).toFixed(2);

// ─── Collapsible Sections ─────────────────────────────────
function toggleSection(header) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  const isOpen = !body.classList.contains('collapsed');
  body.classList.toggle('collapsed', isOpen);
  chevron.classList.toggle('open', !isOpen);
}

// ─── Sliders ─────────────────────────────────────────────
function initSlider(sliderId, displayId, suffix = '%') {
  const slider = $(sliderId);
  const display = $(displayId);
  const update = () => { display.textContent = slider.value + suffix; recalc(); };
  slider.addEventListener('input', update);
  update();
}

// ─── Other Costs ─────────────────────────────────────────
function addOtherCost() {
  const list = $('otherCostsList');
  const row = document.createElement('div');
  row.className = 'other-cost-row';
  row.innerHTML = `
    <input type="text" placeholder="Label" class="other-label" />
    <input type="number" class="other-amount" value="0" min="0" step="0.5" />
    <button onclick="this.parentElement.remove(); recalc();" 
      style="background:none;border:none;color:#888;font-size:18px;cursor:pointer;padding:0 4px;">×</button>
  `;
  list.appendChild(row);
  row.querySelectorAll('input').forEach(i => i.addEventListener('input', recalc));
}

// ─── Core Calculation ─────────────────────────────────────
function recalc() {
  const printHours = num('printHours') + num('printMins') / 60;
  const filamentUsed = num('filamentWeight');

  // Filament
  const spoolPrice = num('spoolPrice');
  const spoolWeight = num('spoolWeight');
  const markup = num('markupSlider') / 100;
  const costPerGram = spoolWeight > 0 ? spoolPrice / spoolWeight : 0;
  const filament = costPerGram * filamentUsed * (1 + markup);

  // Electricity
  const watts = num('printerWatts');
  const energyCost = num('energyCost');
  const electricity = (watts / 1000) * printHours * energyCost;

  // Labor
  const prepCost = (num('prepTime') / 60) * num('prepRate');
  const postCost = (num('postTime') / 60) * num('postRate');
  const labor = prepCost + postCost;

  // Machine
  const printerCost = num('printerCost');
  const returnYears = num('returnYears') || 1;
  const dailyUse = num('dailyUse') || 1;
  const repair = num('repairSlider') / 100;
  const lifetimeHours = returnYears * 365 * dailyUse;
  const costPerHour = lifetimeHours > 0 ? (printerCost * (1 + repair)) / lifetimeHours : 0;
  const machine = costPerHour * printHours;

  // Other
  let other = 0;
  document.querySelectorAll('.other-amount').forEach(el => {
    other += parseFloat(el.value) || 0;
  });

  // VAT
  const subtotal = filament + electricity + labor + machine + other;
  const vatRate = num('vatSlider') / 100;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  // Update section badges
  $('filamentCost').textContent = fmt(filament);
  $('electricityCost').textContent = fmt(electricity);
  $('laborCost').textContent = fmt(labor);
  $('machineCost').textContent = fmt(machine);
  $('otherCost').textContent = fmt(other);

  // Update breakdown
  $('b-filament').textContent = fmt(filament);
  $('b-electricity').textContent = fmt(electricity);
  $('b-labor').textContent = fmt(labor);
  $('b-machine').textContent = fmt(machine);
  $('b-other').textContent = fmt(other);
  $('b-subtotal').textContent = fmt(subtotal);
  $('b-vat').textContent = fmt(vat);

  // Header + total
  $('headerPrice').textContent = fmt(total);
  $('finalTotal').textContent = fmt(total);

  // Bar chart
  updateBarChart({ filament, electricity, labor, machine, other, vat }, total);
}

// ─── Bar Chart ────────────────────────────────────────────
const barColors = ['#FF6B2B', '#3DDC84', '#5B8BFF', '#FFB830', '#C97FFF', '#FF5E8A'];
const barLabels = ['Filament', 'Electric', 'Labor', 'Machine', 'Other', 'VAT'];

function updateBarChart(costs, total) {
  const chart = $('barChart');
  chart.innerHTML = '';
  const values = [costs.filament, costs.electricity, costs.labor, costs.machine, costs.other, costs.vat];
  const max = Math.max(...values, 0.01);

  values.forEach((v, i) => {
    const pct = Math.round((v / max) * 100);
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    wrap.innerHTML = `
      <div class="bar" style="height:${pct}%;background:${barColors[i]};opacity:${v > 0 ? 1 : 0.15}"></div>
      <span class="bar-lbl">${barLabels[i]}</span>
    `;
    chart.appendChild(wrap);
  });
}

// ─── Copy Result ──────────────────────────────────────────
function copyResult() {
  const name = $('jobName')?.value || 'Print';
  const total = $('finalTotal').textContent;
  const lines = [
    `3D Print Cost: ${name}`,
    `─────────────────────`,
    `Filament:   ${$('b-filament').textContent}`,
    `Electricity:${$('b-electricity').textContent}`,
    `Labor:      ${$('b-labor').textContent}`,
    `Machine:    ${$('b-machine').textContent}`,
    `Other:      ${$('b-other').textContent}`,
    `Subtotal:   ${$('b-subtotal').textContent}`,
    `VAT:        ${$('b-vat').textContent}`,
    `─────────────────────`,
    `TOTAL:      ${total}`,
  ];
  navigator.clipboard?.writeText(lines.join('\n')).then(() => showToast());
}

function showToast() {
  const toast = $('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ─── Reset ────────────────────────────────────────────────
const defaults = {
  jobName: '', printHours: '2.5', printMins: '0', filamentWeight: '50',
  filamentType: 'PLA', spoolPrice: '25', spoolWeight: '1000',
  markupSlider: '20', printerWatts: '120', energyCost: '0.13',
  prepTime: '15', prepRate: '20', postTime: '10', postRate: '20',
  printerCost: '800', returnYears: '3', dailyUse: '6',
  repairSlider: '5', vatSlider: '0'
};

function resetAll() {
  for (const [id, val] of Object.entries(defaults)) {
    const el = $(id);
    if (el) el.value = val;
  }
  // Reset other costs
  $('otherCostsList').querySelectorAll('.other-amount').forEach((el, i) => {
    el.value = i === 0 ? '0.50' : '0';
  });
  initSlider('markupSlider', 'markupVal');
  initSlider('repairSlider', 'repairVal');
  initSlider('vatSlider', 'vatVal');
  recalc();
}

// ─── Event Listeners ─────────────────────────────────────
function bindAll() {
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  });
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSlider('markupSlider', 'markupVal');
  initSlider('repairSlider', 'repairVal');
  initSlider('vatSlider', 'vatVal');
  bindAll();
  recalc();
});

// ─── Service Worker Registration ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
