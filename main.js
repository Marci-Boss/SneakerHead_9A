/* =============================================
   MAIN.JS — JWS KICKS
   Minden aloldalon betöltődik.
   Tartalmazza:
   - Hamburger menü nyitás/csukás
   - Badge szerinti szűrés (Összes / Új / Sale / Limitált)
   - Rendezés (ár növekvő/csökkenő, legújabb)
   ============================================= */


/* -----------------------------------------------
   HAMBURGER MENÜ
   A bal felső gombra kattintva nyílik ki a menü
----------------------------------------------- */
const hb = document.getElementById('hamburger');
const mo = document.getElementById('menuOverlay');

hb.addEventListener('click', () => {
  hb.classList.toggle('open');
  mo.classList.toggle('open');
});

// Menü linkre kattintva automatikusan bezárul
mo.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hb.classList.remove('open');
    mo.classList.remove('open');
  });
});


/* -----------------------------------------------
   TERMÉK AKTUÁLIS ÁRÁNAK KIOLVASÁSA
   Ha van sale ár, azt vesszük — ez az aktuális ár.
   Ha nincs sale, a normál árat olvassuk ki.
----------------------------------------------- */
function arKiolvasa(termek) {
  // Ha van piros sale ár, azt vesszük figyelembe
  const saleElem = termek.querySelector('.price-sale');
  if (saleElem) {
    return parseInt(saleElem.textContent.replace(/[^0-9]/g, ''));
  }

  // Normál ár — kizárjuk az áthúzott régi árat ha van
  const arElem = termek.querySelector('.product-price');
  if (!arElem) return 0;
  const klon = arElem.cloneNode(true);
  const regiAr = klon.querySelector('.price-old');
  if (regiAr) regiAr.remove();
  return parseInt(klon.textContent.replace(/[^0-9]/g, '')) || 0;
}


/* -----------------------------------------------
   BADGE SZERINTI SZŰRÉS
   Az "Összes / Új / Sale / Limitált" gombokra kattintva
   csak a megfelelő badge-es termékek jelennek meg
----------------------------------------------- */
// Aktív szűrő alapból "all" (mindenki látható)
let aktivSzuro = 'all';

document.querySelectorAll('.badge-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Aktív osztály áthelyezése a kattintott gombra
    document.querySelectorAll('.badge-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Megjegyezzük melyik szűrő van bekapcsolva
    aktivSzuro = btn.dataset.filter;

    // Szűrés + rendezés újrafuttatása
    szuresEsRendezes();
  });
});


/* -----------------------------------------------
   RENDEZÉS
   A legördülő menüre kattintva rendezi a termékeket:
   - Ár: Alacsony → Magas
   - Ár: Magas → Alacsony
   - Legújabb (badge-new először)
   - Kiemelt (eredeti sorrend visszaállítása)
----------------------------------------------- */
const sortSelect = document.querySelector('.sort-select');
const grid = document.querySelector('.product-grid');


let eredetiSorrend = [];
if (grid) {
  eredetiSorrend = Array.from(grid.querySelectorAll('.product-card'));
}

if (sortSelect) {
  sortSelect.addEventListener('change', szuresEsRendezes);
}


/* -----------------------------------------------
   SZŰRÉS ÉS RENDEZÉS EGYÜTT
   Először szűr badge alapján, majd rendezi az eredményt
----------------------------------------------- */
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


/* =============================================
   KOSÁR INTEGRÁCIÓ — main.js kiegészítés
   Az aloldalakon lévő termék kártyákon
   megjelenik a "Kosárba" gomb, és a nav
   kosár ikonon látszik a darabszám.
   ============================================= */

/* ------- KOSÁR SEGÉDFÜGGVÉNYEK ------- */
function jwsGetCart() { return JSON.parse(localStorage.getItem('jwsCart') || '[]'); }
function jwsSaveCart(c) { localStorage.setItem('jwsCart', JSON.stringify(c)); }

/* ------- NAV KOSÁR DARABSZÁM ------- */
function jwsUpdateNavCount() {
  const cart  = jwsGetCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.nav-cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline' : 'none';
  });
  // Ha az alap nav-cart-btn tartalmaz szöveget, adjuk hozzá a számot
  const cartBtns = document.querySelectorAll('.nav-cart-btn');
  cartBtns.forEach(btn => {
    let countEl = btn.querySelector('.nav-cart-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'nav-cart-count';
      countEl.style.cssText = 'background:var(--red);color:#fff;font-family:"Space Mono",monospace;font-size:9px;padding:1px 5px;margin-left:2px;';
      btn.appendChild(countEl);
    }
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'inline' : 'none';
  });
}

/* ------- KOSÁR GOMB KATTINTÁS ------- */
function jwsAddToCart(card) {
  // Adatok kiolvasása a kártyából
  const nameEl  = card.querySelector('.product-name');
  const imgEl   = card.querySelector('.product-img img');
  const badgeEl = card.querySelector('.product-badge');

  const name  = nameEl ? nameEl.textContent.trim() : 'Termék';
  const img   = imgEl  ? imgEl.getAttribute('src')  : '';

  // Ár kiolvasás (sale vagy normál)
  let price = 0, salePrice = null;
  const saleEl = card.querySelector('.price-sale');
  const oldEl  = card.querySelector('.price-old');
  const priceEl = card.querySelector('.product-price');

  if (saleEl) {
    salePrice = parseInt(saleEl.textContent.replace(/[^0-9]/g, '')) || 0;
    if (oldEl) price = parseInt(oldEl.textContent.replace(/[^0-9]/g, '')) || salePrice;
    else price = salePrice;
  } else if (priceEl) {
    const klon = priceEl.cloneNode(true);
    if (klon.querySelector('.price-old')) klon.querySelector('.price-old').remove();
    price = parseInt(klon.textContent.replace(/[^0-9]/g, '')) || 0;
  }

  // Badge infó
  let badge = '', badgeLabel = '';
  if (badgeEl) {
    badge = Array.from(badgeEl.classList).find(c => c.startsWith('badge-')) || '';
    badgeLabel = badgeEl.textContent.trim();
  }

  // Egyedi ID: oldalcím + terméknév hash
  const id = btoa(unescape(encodeURIComponent(name))).slice(0, 12);

  const cart = jwsGetCart();
  const existing = cart.find(x => x.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, name, img, price, salePrice, badge, badgeLabel, qty: 1 }); }
  jwsSaveCart(cart);
  jwsUpdateNavCount();
}

/* ------- GOMB HOZZÁADÁSA MINDEN KÁRTYÁHOZ ------- */
function jwsInitCartButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    // Ne adjunk hozzá kétszer
    if (card.querySelector('.jws-cart-add')) return;

    const info = card.querySelector('.product-info');
    if (!info) return;

    const btn = document.createElement('button');
    btn.className = 'jws-cart-add';
    btn.textContent = '+ Kosárba';
    btn.style.cssText = `
      display: block; width: 100%; margin-top: 10px;
      background: var(--black); color: var(--white); border: none;
      padding: 9px 0; font-family: 'Bebas Neue', sans-serif;
      font-size: 14px; letter-spacing: 3px; cursor: pointer;
      transition: background 0.2s;
    `;
    btn.addEventListener('mouseenter', () => btn.style.background = 'var(--red)');
    btn.addEventListener('mouseleave', () => { if (!btn.dataset.added) btn.style.background = 'var(--black)'; });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      jwsAddToCart(card);
      btn.textContent = '✓ Hozzáadva';
      btn.style.background = 'var(--red)';
      btn.dataset.added = '1';
      setTimeout(() => {
        btn.textContent = '+ Kosárba';
        btn.style.background = 'var(--black)';
        delete btn.dataset.added;
      }, 1500);
    });

    info.appendChild(btn);
  });
}

/* ------- KOSÁR GOMB LINK A NAV-BAN ------- */
function jwsLinkCartNav() {
  document.querySelectorAll('.nav-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => { window.location.href = 'cart.html'; });
  });
}

/* ------- INIT ------- */
jwsInitCartButtons();
jwsUpdateNavCount();
jwsLinkCartNav();
