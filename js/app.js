// ===== Shared UI shell: auth guard, navbar, footer =====
import { escapeHtml } from './core.js';

export const PAGES = [
  ['dashboard.html', 'Dashboard', 'bi-speedometer2'],
  ['transactions.html', 'Transactions', 'bi-receipt'],
  ['budgets.html', 'Budgets', 'bi-piggy-bank'],
];

// Redirect to login when there is no active session. Returns true when authorised.
export function requireAuth() {
  if (!sessionStorage.getItem('rmUser')) {
    location.replace('index.html');
    return false;
  }
  return true;
}

export function logout() {
  sessionStorage.removeItem('rmUser');
  location.href = 'index.html';
}

// Build the navbar + footer so every page stays consistent.
// Returns false (and schedules a redirect) when the user is not signed in.
export function renderShell(active) {
  if (!requireAuth()) return false;

  const user = escapeHtml(sessionStorage.getItem('rmUser') || 'guest');
  const links = PAGES.map(([href, label, icon]) =>
    `<li class="nav-item"><a class="nav-link ${href === active ? 'active' : ''}" ${href === active ? 'aria-current="page"' : ''} href="${href}"><i class="bi ${icon} me-1"></i>${label}</a></li>`
  ).join('');

  document.getElementById('nav').innerHTML = `
  <nav class="navbar navbar-expand-md navbar-dark"><div class="container">
    <a class="brand" href="dashboard.html">RM<span>Wallet</span></a>
    <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu" aria-label="Toggle menu" aria-expanded="false" aria-controls="menu"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="menu">
      <ul class="navbar-nav me-auto ms-md-3">${links}</ul>
      <span class="text-light me-3 small">Hi, ${user}</span>
      <button id="logoutBtn" class="btn btn-sm btn-outline-light"><i class="bi bi-box-arrow-right me-1"></i>Log out</button>
    </div></div></nav>`;

  document.getElementById('foot').innerHTML = `
  <footer class="py-4 mt-5"><div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
    <div><strong class="text-white">RM Wallet</strong> &mdash; a personal finance tracker for students.<br>Know where your allowance goes.</div>
    <div class="text-md-end">Sample data only. Built with Bootstrap 5 &amp; Chart.js.<br>&copy; 2026 RM Wallet</div>
  </div></footer>`;

  document.getElementById('logoutBtn').addEventListener('click', logout);
  return true;
}
