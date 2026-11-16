// ===== Transactions page =====
import { TRANSACTIONS } from './data.js';
import { renderShell } from './app.js';
import { rm, filterTransactions, escapeHtml } from './core.js';

if (renderShell('transactions')) {
  const $ = (id) => document.getElementById(id);

  [...new Set(TRANSACTIONS.map((t) => t.cat))].sort().forEach((c) => {
    $('fCat').insertAdjacentHTML('beforeend', `<option>${escapeHtml(c)}</option>`);
  });

  function draw() {
    const list = filterTransactions(TRANSACTIONS, {
      q: $('q').value,
      type: $('fType').value,
      cat: $('fCat').value,
    });

    $('rows').innerHTML = list.length
      ? list.map((t) => `<tr>
          <td>${escapeHtml(t.date)}</td>
          <td>${escapeHtml(t.desc)}</td>
          <td>${escapeHtml(t.cat)}</td>
          <td><span class="badge rounded-pill badge-${t.type}">${escapeHtml(t.type)}</span></td>
          <td class="text-end ${t.type === 'income' ? 'amt-in' : 'amt-out'}">${t.type === 'income' ? '+' : '-'}${rm(t.amount)}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="text-center text-secondary py-4">No transactions match. Clear a filter to see more.</td></tr>';

    $('count').textContent = `${list.length} of ${TRANSACTIONS.length} transactions`;
  }

  ['q', 'fType', 'fCat'].forEach((id) => $(id).addEventListener('input', draw));
  draw();
}
