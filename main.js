/* === MAIN.JS — JWS KICKS === */

document.addEventListener('DOMContentLoaded', function () {

  /* HAMBURGER MENÜ */
  const hb = document.getElementById('hamburger');
  const mo = document.getElementById('menuOverlay');

  if (hb && mo) {
    hb.addEventListener('click', () => {
      hb.classList.toggle('open');
      mo.classList.toggle('open');
    });

    mo.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hb.classList.remove('open');
        mo.classList.remove('open');
      });
    });
  }


  /* TERMÉK AKTUÁLIS ÁRÁNAK KIOLVASÁSA */
  function arKiolvasa(termek) {
    const saleElem = termek.querySelector('.price-sale');
    if (saleElem) {
      return parseInt(saleElem.textContent.replace(/[^0-9]/g, ''));
    }
    const arElem = termek.querySelector('.product-price');
    if (!arElem) return 0;
    const klon = arElem.cloneNode(true);
    const regiAr = klon.querySelector('.price-old');
    if (regiAr) regiAr.remove();
    return parseInt(klon.textContent.replace(/[^0-9]/g, '')) || 0;
  }


  /* BADGE SZERINTI SZŰRÉS */
  let aktivSzuro = 'all';

  document.querySelectorAll('.badge-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.badge-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      aktivSzuro = btn.dataset.filter;
      szuresEsRendezes();
    });
  });


  /* RENDEZÉS */
  const sortSelect = document.querySelector('.sort-select');
  const grid = document.querySelector('.product-grid');

  let eredetiSorrend = [];
  if (grid) {
    eredetiSorrend = Array.from(grid.querySelectorAll('.product-card'));
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', szuresEsRendezes);
  }

  function szuresEsRendezes() {
    if (!grid) return;

    const osszes = Array.from(grid.querySelectorAll('.product-card'));

    osszes.forEach(termek => {
      if (aktivSzuro === 'all') {
        termek.style.display = '';
      } else {
        const vanBadge = termek.querySelector('.' + aktivSzuro);
        termek.style.display = vanBadge ? '' : 'none';
      }
    });

    const lathatoak = osszes.filter(t => t.style.display !== 'none');
    const rejtett   = osszes.filter(t => t.style.display === 'none');

    const kivalasztott = sortSelect ? sortSelect.value : 'Kiemelt termékek';
    let rendezett;

    if (kivalasztott === 'Ár: Alacsony → Magas') {
      rendezett = lathatoak.sort((a, b) => arKiolvasa(a) - arKiolvasa(b));
    } else if (kivalasztott === 'Ár: Magas → Alacsony') {
      rendezett = lathatoak.sort((a, b) => arKiolvasa(b) - arKiolvasa(a));
    } else if (kivalasztott === 'Legújabb') {
      rendezett = lathatoak.sort((a, b) => {
        const aUj = a.querySelector('.badge-new') ? 1 : 0;
        const bUj = b.querySelector('.badge-new') ? 1 : 0;
        return bUj - aUj;
      });
    } else {
      rendezett = eredetiSorrend.filter(t => lathatoak.includes(t));
    }

    [...rendezett, ...rejtett].forEach(termek => grid.appendChild(termek));

    const szamlalo = document.querySelector('.products-count');
    if (szamlalo) {
      szamlalo.textContent = lathatoak.length + ' termék';
    }
  }


  /* KOSÁR — SEGÉDFÜGGVÉNYEK */
  function jwsGetCart() {
    try { return JSON.parse(localStorage.getItem('jwsCart') || '[]'); }
    catch(e) { return []; }
  }

  function jwsSaveCart(c) {
    try { localStorage.setItem('jwsCart', JSON.stringify(c)); }
    catch(e) { console.warn('Kosár mentése sikertelen:', e); }
  }


  /* KOSÁR — IKON ANIMÁCIÓ ÉS STÍLUSOK */
  if (!document.getElementById('jws-cart-style')) {
    const style = document.createElement('style');
    style.id = 'jws-cart-style';
    style.textContent = `
      .nav-cart-btn { position: relative; display: flex !important; align-items: center; gap: 4px; }

      .nav-cart-count {
        background: var(--red) !important; color: #fff;
        font-family: 'Space Mono', monospace; font-size: 10px; font-weight: bold;
        min-width: 20px; height: 20px; border-radius: 50%;
        display: inline-flex !important; align-items: center; justify-content: center;
        margin-left: 2px; transition: transform 0.2s;
      }

      @keyframes jwsPulse {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.5); }
        100% { transform: scale(1); }
      }
      .nav-cart-count.pulse { animation: jwsPulse 0.4s ease; }

      .jws-size-wrap { margin-top: 10px; }
      .jws-size-label {
        font-family: 'Space Mono', monospace; font-size: 9px;
        letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 6px;
      }
      .jws-size-btns { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
      .jws-size-btn {
        font-family: 'Space Mono', monospace; font-size: 10px;
        width: 36px; height: 30px; border: 1px solid #ddd;
        background: #fff; color: #333; cursor: pointer; transition: all 0.15s;
        display: flex; align-items: center; justify-content: center;
      }
      .jws-size-btn:hover { border-color: #0a0a0a; color: #0a0a0a; }
      .jws-size-btn.selected { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }

      .jws-cart-add {
        display: block; width: 100%; background: var(--black); color: var(--white);
        border: none; padding: 9px 0; font-family: 'Bebas Neue', sans-serif;
        font-size: 14px; letter-spacing: 3px; cursor: pointer; transition: background 0.2s;
      }
      .jws-cart-add:hover { background: var(--red); }

      @keyframes jwsShake {
        0%, 100% { transform: translateX(0); }
        25%       { transform: translateX(-4px); }
        75%       { transform: translateX(4px); }
      }
      .jws-size-warn { animation: jwsShake 0.3s ease; color: var(--red) !important; }
    `;
    document.head.appendChild(style);
  }


  /* KOSÁR — NAV DARABSZÁM FRISSÍTÉSE */
  function jwsUpdateNavCount(animate) {
    const cart  = jwsGetCart();
    const total = cart.reduce((s, i) => s + i.qty, 0);

    document.querySelectorAll('.nav-cart-btn').forEach(btn => {
      let countEl = btn.querySelector('.nav-cart-count');
      if (!countEl) {
        countEl = document.createElement('span');
        countEl.className = 'nav-cart-count';
        btn.appendChild(countEl);
      }
      countEl.textContent = total;
      countEl.style.display = total > 0 ? 'inline-flex' : 'none';

      if (animate && total > 0) {
        countEl.classList.remove('pulse');
        void countEl.offsetWidth;
        countEl.classList.add('pulse');
        setTimeout(() => countEl.classList.remove('pulse'), 400);
      }
    });
  }


  /* KOSÁR — MÉRETVÁLASZTÓ */
  const MERETEK = ['39', '40', '41', '42', '43', '44', '45', '46'];

  function jwsCreateSizeSelector(card) {
    const wrap = document.createElement('div');
    wrap.className = 'jws-size-wrap';

    const label = document.createElement('div');
    label.className = 'jws-size-label';
    label.textContent = 'Méret:';
    wrap.appendChild(label);

    const btns = document.createElement('div');
    btns.className = 'jws-size-btns';

    MERETEK.forEach(m => {
      const b = document.createElement('button');
      b.className = 'jws-size-btn';
      b.textContent = m;
      b.dataset.size = m;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        btns.querySelectorAll('.jws-size-btn').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        label.textContent = 'Méret: ' + m;
        label.classList.remove('jws-size-warn');
      });
      btns.appendChild(b);
    });

    wrap.appendChild(btns);
    return wrap;
  }


  /* KOSÁR — TERMÉK HOZZÁADÁSA */
  function jwsAddToCart(card, sizeWrap) {
    const selectedSizeBtn = sizeWrap ? sizeWrap.querySelector('.jws-size-btn.selected') : null;
    const selectedSize = selectedSizeBtn ? selectedSizeBtn.dataset.size : null;

    if (!selectedSize) {
      const label = sizeWrap ? sizeWrap.querySelector('.jws-size-label') : null;
      if (label) {
        label.textContent = 'Válassz méretet!';
        label.classList.add('jws-size-warn');
        setTimeout(() => {
          label.textContent = 'Méret:';
          label.classList.remove('jws-size-warn');
        }, 2000);
      }
      return false;
    }

    const nameEl  = card.querySelector('.product-name');
    const imgEl   = card.querySelector('.product-img img');
    const badgeEl = card.querySelector('.product-badge');

    const name = nameEl ? nameEl.textContent.trim() : 'Termék';
    const img  = imgEl  ? imgEl.getAttribute('src')  : '';

    let price = 0, salePrice = null;
    const saleEl  = card.querySelector('.price-sale');
    const oldEl   = card.querySelector('.price-old');
    const priceEl = card.querySelector('.product-price');

    if (saleEl) {
      salePrice = parseInt(saleEl.textContent.replace(/[^0-9]/g, '')) || 0;
      price = oldEl ? (parseInt(oldEl.textContent.replace(/[^0-9]/g, '')) || salePrice) : salePrice;
    } else if (priceEl) {
      const klon = priceEl.cloneNode(true);
      if (klon.querySelector('.price-old')) klon.querySelector('.price-old').remove();
      price = parseInt(klon.textContent.replace(/[^0-9]/g, '')) || 0;
    }

    let badge = '', badgeLabel = '';
    if (badgeEl) {
      badge = Array.from(badgeEl.classList).find(c => c.startsWith('badge-')) || '';
      badgeLabel = badgeEl.textContent.trim();
    }

    const id = btoa(unescape(encodeURIComponent(name + '_' + selectedSize))).slice(0, 16);

    const cart = jwsGetCart();
    const existing = cart.find(x => x.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, img, price, salePrice, badge, badgeLabel, size: selectedSize, qty: 1 });
    }
    jwsSaveCart(cart);
    jwsUpdateNavCount(true);
    return true;
  }


  /* KOSÁR — GOMBOK INICIALIZÁLÁSA MINDEN KÁRTYÁN */
  function jwsInitCartButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
      if (card.querySelector('.jws-cart-add')) return;

      const info = card.querySelector('.product-info');
      if (!info) return;

      const sizeWrap = jwsCreateSizeSelector(card);
      info.appendChild(sizeWrap);

      const btn = document.createElement('button');
      btn.className = 'jws-cart-add';
      btn.textContent = '+ Kosárba';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const siker = jwsAddToCart(card, sizeWrap);
        if (siker) {
          btn.textContent = '✓ Hozzáadva';
          btn.style.background = 'var(--red)';
          setTimeout(() => {
            btn.textContent = '+ Kosárba';
            btn.style.background = '';
          }, 1500);
        }
      });

      info.appendChild(btn);
    });
  }


  /* KOSÁR — LINK A NAV IKONON */
  function jwsLinkCartNav() {
    document.querySelectorAll('.nav-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => { window.location.href = 'cart.html'; });
    });
  }


  /* NAV IKONOK — feliratok hozzáadása */
    document.querySelectorAll('.nav-icon').forEach(el => {
      const emoji = el.textContent.trim();
      let icon = '', label = '';
      if (emoji === '🔍') { icon = '🔍'; label = 'Keresés'; }
      else if (emoji === '👤') { icon = '👤'; label = 'Fiók'; }
      if (!label) return;
      el.innerHTML = `<span style="font-size:20px;line-height:1;">${icon}</span><span class="nav-icon-label">${label}</span>`;
    });

    document.querySelectorAll('.nav-cart-btn').forEach(btn => {
      const existing = btn.querySelector('.nav-cart-count');
      const countVal = existing ? existing.textContent : '';
      btn.innerHTML = `
        <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;">
          <span style="font-size:22px;line-height:1;">🛒</span>
          <span class="nav-cart-count" style="position:absolute;top:-6px;right:-10px;display:none;">${countVal}</span>
        </span>
        <span class="nav-icon-label">Kosár</span>
      `;
    });

  /* INICIALIZÁLÁS */
  jwsInitCartButtons();
  jwsUpdateNavCount(false);
  jwsLinkCartNav();

}); // DOMContentLoaded vége
