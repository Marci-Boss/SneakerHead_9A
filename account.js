/* === ACCOUNT.JS — JWS KICKS === */

(function () {

  /* SEGÉDFÜGGVÉNYEK */
  function getUser() {
    try { return JSON.parse(localStorage.getItem('jwsUser') || 'null'); }
    catch(e) { return null; }
  }
  function saveUser(u) {
    try { localStorage.setItem('jwsUser', JSON.stringify(u)); }
    catch(e) {}
  }
  function logout() {
    localStorage.removeItem('jwsUser');
    updateAccountIcon();
    closeAccount();
  }

  /* PANEL HTML INJEKTÁLÁSA */
  const panel = document.createElement('div');
  panel.id = 'jwsAccountPanel';
  panel.innerHTML = `
    <div id="jwsAccountBox">
      <div id="jwsAccountTop">
        <span id="jwsAccountLabel">FIÓK</span>
        <button id="jwsAccountClose">✕</button>
      </div>
      <div id="jwsAccountContent"></div>
    </div>
  `;
  document.body.appendChild(panel);

  /* STÍLUSOK */
  const style = document.createElement('style');
  style.textContent = `
    #jwsAccountPanel {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
    }
    #jwsAccountPanel.open {
      opacity: 1;
      pointer-events: all;
    }
    #jwsAccountBox {
      background: #fff;
      width: 100%;
      max-width: 400px;
      height: 100vh;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(.77,0,.18,1);
      overflow-y: auto;
    }
    #jwsAccountPanel.open #jwsAccountBox {
      transform: translateX(0);
    }
    #jwsAccountTop {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    #jwsAccountLabel {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 4px;
      color: #e8000d;
      text-transform: uppercase;
    }
    #jwsAccountClose {
      background: none; border: none; cursor: pointer;
      font-size: 18px; color: #888; padding: 0; transition: color 0.15s;
    }
    #jwsAccountClose:hover { color: #0a0a0a; }

    /* FORM stílusok */
    .jws-acc-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 36px;
      letter-spacing: 2px;
      color: #0a0a0a;
      margin-bottom: 6px;
    }
    .jws-acc-sub {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 28px;
    }
    .jws-acc-field { margin-bottom: 16px; }
    .jws-acc-label {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
      display: block;
      margin-bottom: 6px;
    }
    .jws-acc-input {
      width: 100%;
      border: none;
      border-bottom: 1.5px solid #ddd;
      padding: 8px 0;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 18px;
      color: #0a0a0a;
      outline: none;
      background: transparent;
      transition: border-color 0.2s;
    }
    .jws-acc-input:focus { border-color: #0a0a0a; }
    .jws-acc-btn {
      display: block;
      width: 100%;
      background: #0a0a0a;
      color: #fff;
      border: none;
      padding: 14px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 18px;
      letter-spacing: 4px;
      cursor: pointer;
      margin-top: 24px;
      transition: background 0.2s;
    }
    .jws-acc-btn:hover { background: #e8000d; }
    .jws-acc-btn.secondary {
      background: transparent;
      color: #0a0a0a;
      border: 1.5px solid #ddd;
      margin-top: 10px;
    }
    .jws-acc-btn.secondary:hover { background: #f4f4f4; }
    .jws-acc-switch {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 1px;
      color: #888;
      text-align: center;
      margin-top: 20px;
      cursor: pointer;
    }
    .jws-acc-switch span {
      color: #0a0a0a;
      text-decoration: underline;
      cursor: pointer;
    }
    .jws-acc-error {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 1px;
      color: #e8000d;
      margin-top: 12px;
      min-height: 14px;
    }
    .jws-acc-divider {
      border: none;
      border-top: 1px solid #f0f0f0;
      margin: 24px 0;
    }

    /* BELÉPETT ÁLLAPOT */
    .jws-acc-avatar {
      width: 64px; height: 64px;
      background: #0a0a0a;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      color: #fff;
      margin-bottom: 16px;
    }
    .jws-acc-welcome {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 2px;
      color: #0a0a0a;
      margin-bottom: 4px;
    }
    .jws-acc-email-display {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 28px;
    }
    .jws-acc-stat-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .jws-acc-stat {
      background: #f4f4f4;
      padding: 14px;
      text-align: center;
    }
    .jws-acc-stat-num {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      color: #0a0a0a;
      line-height: 1;
    }
    .jws-acc-stat-label {
      font-family: 'Space Mono', monospace;
      font-size: 8px;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .jws-acc-logout {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-top: 8px;
      transition: color 0.15s;
    }
    .jws-acc-logout:hover { color: #e8000d; }

    /* Nav ikon állapot */
    .nav-icon.logged-in .jws-acc-dot {
      display: block !important;
    }
    .jws-acc-dot {
      width: 6px; height: 6px;
      background: #e8000d;
      border-radius: 50%;
      position: absolute;
      top: 0; right: -2px;
      display: none;
    }
  `;
  document.head.appendChild(style);

  /* PANEL MEGNYITÁSA / ZÁRÁSA */
  function openAccount() {
    panel.classList.add('open');
    renderContent();
  }
  function closeAccount() {
    panel.classList.remove('open');
  }

  document.getElementById('jwsAccountClose').addEventListener('click', closeAccount);
  panel.addEventListener('click', (e) => { if (e.target === panel) closeAccount(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAccount(); });

  /* TARTALOM RENDERELÉSE */
  function renderContent() {
    const user = getUser();
    const content = document.getElementById('jwsAccountContent');
    if (user) {
      renderLoggedIn(content, user);
    } else {
      renderLogin(content);
    }
  }

  /* BEJELENTKEZETT NÉZET */
  function renderLoggedIn(content, user) {
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const cart = JSON.parse(localStorage.getItem('jwsCart') || '[]');
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);
    const cartTotal = cart.reduce((s, i) => s + (i.salePrice || i.price) * i.qty, 0);

    content.innerHTML = `
      <div class="jws-acc-avatar">${initials}</div>
      <div class="jws-acc-welcome">SZIA, ${user.name.split(' ')[0].toUpperCase()}!</div>
      <div class="jws-acc-email-display">${user.email}</div>
      <div class="jws-acc-stat-row">
        <div class="jws-acc-stat">
          <div class="jws-acc-stat-num">${cartCount}</div>
          <div class="jws-acc-stat-label">Kosárban</div>
        </div>
        <div class="jws-acc-stat">
          <div class="jws-acc-stat-num">${cartTotal > 0 ? Math.round(cartTotal/1000) + 'K' : '0'}</div>
          <div class="jws-acc-stat-label">Kosár értéke (Ft)</div>
        </div>
      </div>
      <button class="jws-acc-btn" onclick="window.location.href='cart.html'">🛒 Kosár megtekintése</button>
      <hr class="jws-acc-divider">
      <button class="jws-acc-logout" onclick="jwsLogout()">← Kijelentkezés</button>
    `;
  }

  /* BEJELENTKEZÉSI FORM */
  function renderLogin(content) {
    content.innerHTML = `
      <div class="jws-acc-title">BELÉPÉS</div>
      <div class="jws-acc-sub">Üdv vissza a JWS Kicks-nél</div>
      <div class="jws-acc-field">
        <label class="jws-acc-label">Email cím</label>
        <input class="jws-acc-input" type="email" id="accEmail" placeholder="pelda@email.com">
      </div>
      <div class="jws-acc-field">
        <label class="jws-acc-label">Jelszó</label>
        <input class="jws-acc-input" type="password" id="accPass" placeholder="••••••••">
      </div>
      <div class="jws-acc-error" id="accError"></div>
      <button class="jws-acc-btn" id="accLoginBtn">Belépés →</button>
      <button class="jws-acc-btn secondary" id="accToRegister">Még nincs fiókom</button>
    `;

    document.getElementById('accLoginBtn').addEventListener('click', doLogin);
    document.getElementById('accToRegister').addEventListener('click', () => renderRegister(content));
    document.getElementById('accPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  }

  /* REGISZTRÁCIÓS FORM */
  function renderRegister(content) {
    content.innerHTML = `
      <div class="jws-acc-title">REGISZTRÁCIÓ</div>
      <div class="jws-acc-sub">Hozd létre a fiókodat</div>
      <div class="jws-acc-field">
        <label class="jws-acc-label">Teljes név</label>
        <input class="jws-acc-input" type="text" id="regName" placeholder="Kovács János">
      </div>
      <div class="jws-acc-field">
        <label class="jws-acc-label">Email cím</label>
        <input class="jws-acc-input" type="email" id="regEmail" placeholder="pelda@email.com">
      </div>
      <div class="jws-acc-field">
        <label class="jws-acc-label">Jelszó</label>
        <input class="jws-acc-input" type="password" id="regPass" placeholder="Min. 6 karakter">
      </div>
      <div class="jws-acc-error" id="accError"></div>
      <button class="jws-acc-btn" id="accRegBtn">Regisztráció →</button>
      <button class="jws-acc-btn secondary" id="accToLogin">Már van fiókom</button>
    `;

    document.getElementById('accRegBtn').addEventListener('click', doRegister);
    document.getElementById('accToLogin').addEventListener('click', () => renderLogin(content));
  }

  /* BEJELENTKEZÉS LOGIKA */
  function doLogin() {
    const email = document.getElementById('accEmail').value.trim();
    const pass  = document.getElementById('accPass').value;
    const errEl = document.getElementById('accError');

    const users = JSON.parse(localStorage.getItem('jwsUsers') || '[]');
    const found = users.find(u => u.email === email && u.password === pass);

    if (!email || !pass) {
      errEl.textContent = 'Töltsd ki az összes mezőt!'; return;
    }
    if (!found) {
      errEl.textContent = 'Hibás email vagy jelszó.'; return;
    }

    saveUser({ name: found.name, email: found.email });
    updateAccountIcon();
    renderContent();
  }

  /* REGISZTRÁCIÓ LOGIKA */
  function doRegister() {
    const name  = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass  = document.getElementById('regPass').value;
    const errEl = document.getElementById('accError');

    if (!name || !email || !pass) {
      errEl.textContent = 'Töltsd ki az összes mezőt!'; return;
    }
    if (pass.length < 6) {
      errEl.textContent = 'A jelszó legalább 6 karakter legyen!'; return;
    }
    if (!email.includes('@')) {
      errEl.textContent = 'Érvényes email címet adj meg!'; return;
    }

    const users = JSON.parse(localStorage.getItem('jwsUsers') || '[]');
    if (users.find(u => u.email === email)) {
      errEl.textContent = 'Ez az email már regisztrált!'; return;
    }

    users.push({ name, email, password: pass });
    localStorage.setItem('jwsUsers', JSON.stringify(users));
    saveUser({ name, email });
    updateAccountIcon();
    renderContent();
  }

  /* FIÓK IKON FRISSÍTÉSE */
  function updateAccountIcon() {
    const user = getUser();
    document.querySelectorAll('.nav-icon[data-type="account"]').forEach(el => {
      const dot = el.querySelector('.jws-acc-dot');
      if (dot) dot.style.display = user ? 'block' : 'none';
      const label = el.querySelector('.nav-icon-label');
      if (label) label.textContent = user ? user.name.split(' ')[0] : 'Fiók';
    });
  }

  /* GLOBÁLIS EXPORT */
  window.jwsOpenAccount = openAccount;
  window.jwsLogout = logout;
  window.jwsUpdateAccountIcon = updateAccountIcon;

  /* INICIALIZÁLÁS */
  document.addEventListener('DOMContentLoaded', updateAccountIcon);

})();
