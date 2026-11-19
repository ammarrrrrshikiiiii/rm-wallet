// ===== Transactions page =====
import { CATEGORIES, PAYMENT_METHODS } from './data.js';
import { renderShell } from './app.js';
import { getTransactions, exportBackupJSON, importBackupJSON, exportTransactionsCSV, importTransactionsCSV } from './store.js';
import { rm, filterTransactions, escapeHtml } from './core.js';

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

if (renderShell('transactions')) {
  const $ = (id) => document.getElementById(id);
  const txns = getTransactions();

  const cats = [...new Set([...CATEGORIES, ...txns.map((t) => t.cat)])].sort();
  cats.forEach((c) => $('fCat').insertAdjacentHTML('beforeend', `<option>${escapeHtml(c)}</option>`));
  PAYMENT_METHODS.forEach((s) => $('fSource').insertAdjacentHTML('beforeend', `<option>${escapeHtml(s)}</option>`));

  function draw() {
    const list = filterTransactions(txns, {
      q: $('q').value,
      type: $('fType').value,
      cat: $('fCat').value,
      source: $('fSource').value,
    });

    $('rows').innerHTML = list.length
      ? list.map((t) => `<tr>
          <td>${escapeHtml(t.date)}</td>
          <td>${escapeHtml(t.desc)}</td>
          <td>${escapeHtml(t.cat)}</td>
          <td><span class="badge rounded-pill badge-source">${escapeHtml(t.source || '')}</span></td>
          <td><span class="badge rounded-pill badge-${t.type}">${escapeHtml(t.type)}</span></td>
          <td class="text-end ${t.type === 'income' ? 'amt-in' : 'amt-out'}">${t.type === 'income' ? '+' : '-'}${rm(t.amount)}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="text-center text-secondary py-4">No transactions match. Clear a filter to see more.</td></tr>';

    $('count').textContent = `${list.length} of ${txns.length} transactions`;
  }

  ['q', 'fType', 'fCat', 'fSource'].forEach((id) => $(id).addEventListener('input', draw));
  draw();

  $('expJSON').addEventListener('click', () => {
    download('rm-wallet-backup.json', exportBackupJSON(), 'application/json');
    $('backupMsg').textContent = 'Backup exported as JSON.';
  });

  $('expCSV').addEventListener('click', () => {
    download('rm-wallet-transactions.csv', exportTransactionsCSV(), 'text/csv');
    $('backupMsg').textContent = 'Transactions exported as CSV.';
  });

  $('impBtn').addEventListener('click', () => $('impFile').click());

  $('impFile').addEventListener('change', async () => {
    const file = $('impFile').files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const isJSON = text.trim().startsWith('{');
      if (isJSON) {
        importBackupJSON(text);
        $('backupMsg').textContent = 'Backup imported. Reloading\u2026';
      } else {
        importTransactionsCSV(text);
        $('backupMsg').textContent = 'Transactions imported. Reloading\u2026';
      }
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      $('backupMsg').textContent = 'Import failed: ' + (err && err.message ? err.message : 'unknown error');
    } finally {
      $('impFile').value = '';
    }
  });
}
