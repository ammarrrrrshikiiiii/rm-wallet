// ===== Login / register (simulated; registered users live in localStorage) =====
const DEMO_USER = 'demo';
const DEMO_PASSWORD = 'Finance@123';

const $ = (id) => document.getElementById(id);
let mode = 'login';

const showMsg = (text, ok = false) => {
  const el = $('msg');
  el.textContent = text; // textContent, never innerHTML, for message strings
  el.className = 'alert ' + (ok ? 'alert-success' : 'alert-danger');
};

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('rmUsers') || '{}');
  } catch {
    return {};
  }
};

if (sessionStorage.getItem('rmUser')) location.replace('dashboard.html');

$('sw').addEventListener('click', (e) => {
  e.preventDefault();
  mode = mode === 'login' ? 'register' : 'login';
  const registering = mode === 'register';
  $('formTitle').textContent = registering ? 'Create account' : 'Sign in';
  $('go').textContent = registering ? 'Create account' : 'Sign in';
  $('confirmBox').classList.toggle('d-none', !registering);
  $('swText').textContent = registering ? 'Already registered?' : 'New here?';
  $('sw').textContent = registering ? 'Sign in' : 'Create an account';
  $('msg').classList.add('d-none');
});

$('fillDemo').addEventListener('click', () => {
  $('u').value = DEMO_USER;
  $('p').value = DEMO_PASSWORD;
  showMsg('Demo credentials filled in. Press "Sign in".', true);
});

$('go').addEventListener('click', () => {
  const u = $('u').value.trim();
  const p = $('p').value;
  const saved = readUsers();

  if (!u || !p) return showMsg('Enter both username and password.');

  if (mode === 'register') {
    if (p.length < 6) return showMsg('Password must be at least 6 characters.');
    if (p !== $('p2').value) return showMsg('Passwords do not match.');
    if (u === DEMO_USER || saved[u]) return showMsg('That username is taken. Try another.');
    saved[u] = p;
    localStorage.setItem('rmUsers', JSON.stringify(saved));
    $('sw').click();
    return showMsg('Account created. Sign in below.', true);
  }

  if ((u === DEMO_USER && p === DEMO_PASSWORD) || saved[u] === p) {
    sessionStorage.setItem('rmUser', u);
    location.href = 'dashboard.html';
  } else {
    showMsg('Invalid username or password. Check your details and try again.');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && ['u', 'p', 'p2'].includes(e.target.id)) $('go').click();
});
