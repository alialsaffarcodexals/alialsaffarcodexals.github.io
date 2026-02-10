import { debounce } from '../../utils/debounce.js';
import { formatXP, formatXPStat } from '../../utils/format.js';
import { projectFromPath } from '../../utils/path.js';

export function initTransactionsTable(data) {
  const txSearch = document.getElementById('txSearch');
  const txClear = document.getElementById('txClear');
  const txReset = document.getElementById('txReset');
  const xpRange = document.getElementById('xpRange');
  const xpRangeLabel = document.getElementById('xpRangeLabel');
  const dateRange = document.getElementById('dateRange');
  const dateRangeLabel = document.getElementById('dateRangeLabel');
  const transactionsBody = document.getElementById('transactionsBody');
  const txCount = document.getElementById('txCount');
  const txLoadMore = document.getElementById('txLoadMore');

  if (!transactionsBody) return;

  const allTransactions = (Array.isArray(data.transactions) ? data.transactions : [])
    .map((t) => ({ ...t, amount: Number(t?.amount) }))
    .filter((t) => t?.type === 'xp' && Number.isFinite(t.amount));

  let txPageSize = 15;
  let txVisible = txPageSize;

  let xpRangeVals = null;
  let dateRangeVals = null;
  let xpDefaults = null;
  let dateDefaults = null;

  if (allTransactions.length && xpRange && dateRange && window.noUiSlider) {
    const amountsKb = allTransactions.map((t) => (t.amount || 0) / 1000);
    const minKb = Math.max(0, Math.min(...amountsKb));
    const maxKb = Math.max(...amountsKb);
    xpDefaults = [minKb, maxKb];

    window.noUiSlider.create(xpRange, {
      start: [minKb, maxKb],
      connect: true,
      range: { min: minKb, max: maxKb },
      step: 0.01,
      behaviour: 'tap-drag',
    });

    const dates = allTransactions.map((t) => (t.createdAt ? new Date(t.createdAt).getTime() : Date.now()));
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    dateDefaults = [minDate, maxDate];

    window.noUiSlider.create(dateRange, {
      start: [minDate, maxDate],
      connect: true,
      range: { min: minDate, max: maxDate },
      step: 24 * 60 * 60 * 1000,
      behaviour: 'tap-drag',
    });

    const updateLabels = () => {
      const [minV, maxV] = xpRange.noUiSlider.get().map(Number);
      xpRangeVals = [minV, maxV];
      if (xpRangeLabel) xpRangeLabel.textContent = `${minV.toFixed(2)} – ${maxV.toFixed(2)} kB`;

      const [fromV, toV] = dateRange.noUiSlider.get().map(Number);
      dateRangeVals = [fromV, toV];
      if (dateRangeLabel) dateRangeLabel.textContent = `${new Date(fromV).toLocaleDateString()} – ${new Date(toV).toLocaleDateString()}`;
    };

    updateLabels();
    xpRange.noUiSlider.on('update', updateLabels);
    dateRange.noUiSlider.on('update', updateLabels);
  }

  function filterTransactions() {
    const q = (txSearch?.value || '').toLowerCase();
    const minKb = xpRangeVals ? xpRangeVals[0] : null;
    const maxKb = xpRangeVals ? xpRangeVals[1] : null;
    const fromMs = dateRangeVals ? dateRangeVals[0] : null;
    const toMs = dateRangeVals ? dateRangeVals[1] : null;

    return allTransactions.filter((t) => {
      const project = projectFromPath(t.path).toLowerCase();
      const matchesText = !q || project.includes(q);
      const amtKb = typeof t.amount === 'number' ? t.amount / 1000 : 0;
      const matchesMin = minKb === null || amtKb >= minKb;
      const matchesMax = maxKb === null || amtKb <= maxKb;
      const time = t.createdAt ? new Date(t.createdAt).getTime() : 0;
      const matchesFrom = fromMs === null || time >= fromMs;
      const matchesTo = toMs === null || time <= toMs;
      return matchesText && matchesMin && matchesMax && matchesFrom && matchesTo;
    });
  }

  function renderTransactions() {
    const filtered = filterTransactions();
    const visible = filtered.slice(0, txVisible);

    transactionsBody.innerHTML =
      visible.length
        ? visible
            .map(
              (t) => `
          <tr>
            <td>${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
            <td>${projectFromPath(t.path)}</td>
            <td>${formatXP(t.amount || 0)}</td>
          </tr>
        `
            )
            .join('')
        : '<tr><td colspan="3" class="muted">No transactions found</td></tr>';

    if (txCount) txCount.textContent = `${Math.min(txVisible, filtered.length)} of ${filtered.length}`;
    if (txLoadMore) txLoadMore.style.display = filtered.length > txVisible ? 'inline-flex' : 'none';
  }

  const resetAndRender = () => {
    txVisible = txPageSize;
    renderTransactions();
  };

  const resetSliders = () => {
    if (xpDefaults && xpRange?.noUiSlider) xpRange.noUiSlider.set(xpDefaults);
    if (dateDefaults && dateRange?.noUiSlider) dateRange.noUiSlider.set(dateDefaults);
  };

  txSearch?.addEventListener('input', debounce(resetAndRender, 200));
  xpRange?.noUiSlider?.on('update', debounce(resetAndRender, 200));
  dateRange?.noUiSlider?.on('update', debounce(resetAndRender, 200));

  txClear?.addEventListener('click', () => {
    if (txSearch) txSearch.value = '';
    resetAndRender();
  });

  txReset?.addEventListener('click', () => {
    resetSliders();
    resetAndRender();
  });

  txLoadMore?.addEventListener('click', () => {
    txVisible += txPageSize;
    renderTransactions();
  });

  renderTransactions();
}
