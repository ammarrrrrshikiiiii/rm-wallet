// ===== Shared logic: auth guard, navbar, footer, helpers =====
const rm = n => 'RM ' + Number(n).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
const PAGES = [['dashboard.html','Dashboard','bi-speedometer2'],['transactions.html','Transactions','bi-receipt'],['budgets.html','Budgets','bi-piggy-bank']];
const PALETTE = ['#1f7a6d','#e9a23b','#e0604a','#4f8fba','#8a6fb0','#7fb77e'];

// Redirect to login if not signed in
function requireAuth(){ if(!sessionStorage.getItem('rmUser')) location.replace('index.html'); }
function logout(){ sessionStorage.removeItem('rmUser'); location.href='index.html'; }

// Build navbar + footer so every page stays consistent
function renderShell(active){
  requireAuth();
  const user = sessionStorage.getItem('rmUser');
  const links = PAGES.map(p=>`<li class="nav-item"><a class="nav-link ${p[0]===active?'active':''}" href="${p[0]}"><i class="bi ${p[2]} me-1"></i>${p[1]}</a></li>`).join('');
  document.getElementById('nav').innerHTML = `
  <nav class="navbar navbar-expand-md navbar-dark"><div class="container">
    <a class="brand" href="dashboard.html">RM<span>Wallet</span></a>
    <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu" aria-label="Toggle menu"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="menu">
      <ul class="navbar-nav me-auto ms-md-3">${links}</ul>
      <span class="text-light me-3 small">Hi, ${user}</span>
      <button class="btn btn-sm btn-outline-light" onclick="logout()"><i class="bi bi-box-arrow-right me-1"></i>Log out</button>
    </div></div></nav>`;
  document.getElementById('foot').innerHTML = `
  <footer class="py-4 mt-5"><div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
    <div><strong class="text-white">RM Wallet</strong> – a personal finance tracker for students.<br>IMS566 Individual Project, Universiti Teknologi MARA.</div>
    <div class="text-md-end">Sample data only. Built with Bootstrap 5 &amp; Chart.js.<br>&copy; 2026 RM Wallet</div>
  </div></footer>`;
}

// Helpers used by several pages
const totals = list => { const i=list.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0), e=list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0); return {income:i,expense:e,balance:i-e}; };
const monthName = ym => new Date(ym+'-01').toLocaleString('en-MY',{month:'short'});
