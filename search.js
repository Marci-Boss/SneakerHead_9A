/* === SEARCH.JS — JWS KICKS === */

(function () {

  /* KERESŐSÁV HTML INJEKTÁLÁSA */
  const overlay = document.createElement('div');
  overlay.id = 'jwsSearchOverlay';
  overlay.innerHTML = `
    <div id="jwsSearchBox">
      <div id="jwsSearchTop">
        <span id="jwsSearchLabel">KERESÉS</span>
        <button id="jwsSearchClose">✕</button>
      </div>
      <input id="jwsSearchInput" type="text" placeholder="Pl. Nike Dunk, Balenciaga, Dior..." autocomplete="off">
      <div id="jwsSearchResults"></div>
      <div id="jwsSearchEmpty" style="display:none;">
        <div id="jwsSearchEmptyIcon">🔍</div>
        <div id="jwsSearchEmptyTitle">Nincs találat</div>
        <div id="jwsSearchEmptySub">Próbálj más kulcsszót</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* STÍLUSOK */
  const style = document.createElement('style');
  style.textContent = `
    #jwsSearchOverlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 100px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
    }
    #jwsSearchOverlay.open {
      opacity: 1;
      pointer-events: all;
    }
    #jwsSearchBox {
      background: #fff;
      width: 100%;
      max-width: 680px;
      margin: 0 24px;
      padding: 28px 32px 32px;
    }
    #jwsSearchTop {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    #jwsSearchLabel {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      letter-spacing: 4px;
      color: #e8000d;
      text-transform: uppercase;
    }
    #jwsSearchClose {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #888;
      line-height: 1;
      padding: 0;
      transition: color 0.15s;
    }
    #jwsSearchClose:hover { color: #0a0a0a; }
    #jwsSearchInput {
      width: 100%;
      border: none;
      border-bottom: 2px solid #0a0a0a;
      padding: 10px 0;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 32px;
      letter-spacing: 2px;
      color: #0a0a0a;
      outline: none;
      background: transparent;
    }
    #jwsSearchInput::placeholder { color: #ddd; }
    #jwsSearchResults {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 420px;
      overflow-y: auto;
    }
    .jws-search-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 8px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s;
      text-decoration: none;
      color: inherit;
    }
    .jws-search-item:hover { background: #f9f9f9; }
    .jws-search-item-img {
      width: 56px;
      height: 56px;
      background: #f4f4f4;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .jws-search-item-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 4px;
    }
    .jws-search-item-info { flex: 1; }
    .jws-search-item-brand {
      font-family: 'Space Mono', monospace;
      font-size: 8px;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .jws-search-item-name {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #0a0a0a;
      line-height: 1.2;
    }
    .jws-search-item-price {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 16px;
      color: #0a0a0a;
      flex-shrink: 0;
    }
    .jws-search-item-price.is-sale { color: #e8000d; }
    .jws-search-badge {
      font-family: 'Space Mono', monospace;
      font-size: 8px;
      padding: 2px 7px;
      letter-spacing: 1px;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .jws-search-badge.badge-new  { background: #0a0a0a; color: #fff; }
    .jws-search-badge.badge-sale { background: #e8000d; color: #fff; }
    .jws-search-badge.badge-lim  { border: 1px solid #ddd; color: #888; }
    #jwsSearchEmpty {
      text-align: center;
      padding: 40px 0 20px;
    }
    #jwsSearchEmptyIcon { font-size: 36px; margin-bottom: 12px; }
    #jwsSearchEmptyTitle {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 2px;
      color: #0a0a0a;
      margin-bottom: 6px;
    }
    #jwsSearchEmptySub {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
    }
    .jws-search-count {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
      margin-top: 20px;
      margin-bottom: 4px;
    }
  `;
  document.head.appendChild(style);

  /* TERMÉKADATOK — minden brand oldalról összegyűjtve */
  const PRODUCTS = [
    { name: 'Balenciaga 10XL', price: '504 997 Ft', brand: 'Balenciaga', img: 'img/balenciaga 10xl.png', badge: 'badge-new', badgeLabel: 'Új', page: 'balenciaga.html' },
    { name: 'Balenciaga Track LED', price: '670 983 Ft', brand: 'Balenciaga', img: 'img/balencitrack.png', badge: 'badge-lim', badgeLabel: 'Limitált', page: 'balenciaga.html' },
    { name: 'Balenciaga 6XL Black Grey', price: '459 999 Ft', brand: 'Balenciaga', img: 'img/balenciaga6xl.png', badge: 'badge-sale', badgeLabel: 'SALE', isSale: true, page: 'balenciaga.html' },
    { name: 'Balenciaga Runner Blue Silver White Red', price: '329 246 Ft', brand: 'Balenciaga', img: 'img/balenciagarunner.png', page: 'balenciaga.html' },
    { name: 'Balenciaga Runner Graffiti Black Red', price: '361 368 Ft', brand: 'Balenciaga', img: 'img/balenciagarunnergraffitiblack.png', badge: 'badge-lim', badgeLabel: 'VIP', page: 'balenciaga.html' },
    { name: 'Balenciaga Track Green', price: '280 394 Ft', brand: 'Balenciaga', img: 'img/balenciagatrackgreen.png', badge: 'badge-new', badgeLabel: 'Új', page: 'balenciaga.html' },
    { name: 'Balenciaga x adidas Speed Trainer Red White', price: '54 881 Ft', brand: 'Balenciaga', img: 'img/Balenciagaspeedtrainer.png', page: 'balenciaga.html' },
    { name: 'Balenciaga Triple S Logotype Trainers White Pink', price: '152 994 Ft', brand: 'Balenciaga', img: 'img/Balenciagatriples.png', page: 'balenciaga.html' },
    { name: 'Balenciaga All Over Logo Triple S White Black', price: '251 414 Ft', brand: 'Balenciaga', img: 'img/BalenciagaAlloverlogo.png', page: 'balenciaga.html' },
    { name: 'Balenciaga Track White Black Graffiti', price: '582 544 Ft', brand: 'Balenciaga', img: 'img/Balenciagagraffitewhiteblack.png', page: 'balenciaga.html' },
    { name: 'Balenciaga Paris Low Top Black White LNY Print', price: '424 951 Ft', brand: 'Balenciaga', img: 'img/Balenciagaparislowtop.png', page: 'balenciaga.html' },
    { name: 'Balenciaga Space Shoe Silver', price: '330 210 Ft', brand: 'Balenciaga', img: 'img/Balenciagaspaceshoes.png', page: 'balenciaga.html' },
    { name: 'Nike Kobe 5 Protro', price: '110 925 Ft', brand: 'Nike', img: 'img/OIP.png', badge: 'badge-new', badgeLabel: 'Új', page: 'nike.html' },
    { name: 'Nike Air Force 1 Low \'07', price: '29 652 Ft', brand: 'Nike', img: 'img/Nike_low_white.png', page: 'nike.html' },
    { name: 'Nike P-6000', price: '37 400 Ft', brand: 'Nike', img: 'img/Nike_p6000.png', badge: 'badge-sale', badgeLabel: 'SALE', isSale: true, page: 'nike.html' },
    { name: 'Nike Zoom Vomero 5', price: '37 318 Ft', brand: 'Nike', img: 'img/Nike_Vomero.png', badge: 'badge-lim', badgeLabel: 'Limitált', page: 'nike.html' },
    { name: 'Nike Dunk Low Retro', price: '20 203 Ft', brand: 'Nike', img: 'img/Nike_dunk.png', page: 'nike.html' },
    { name: 'Nike Blazer Mid 77 Vintage', price: '18 962 Ft', brand: 'Nike', img: 'img/Nike_blazer.png', badge: 'badge-new', badgeLabel: 'Új', page: 'nike.html' },
    { name: 'Dior B30 Black', price: '402 711 Ft', brand: 'Dior', img: 'img/b30.png', badge: 'badge-new', badgeLabel: 'Új', page: 'dior.html' },
    { name: 'Dior B22 White Silver Fluo Green', price: '906 770 Ft', brand: 'Dior', img: 'img/b22.png', page: 'dior.html' },
    { name: 'Dior B25 Oblique Runner Sneaker Black Suede', price: '299 999 Ft', brand: 'Dior', img: 'img/b25.png', badge: 'badge-sale', badgeLabel: 'SALE', isSale: true, page: 'dior.html' },
    { name: 'Dior B23 High Top Logo Oblique', price: '344 653 Ft', brand: 'Dior', img: 'img/b23.png', badge: 'badge-lim', badgeLabel: 'Limitált', page: 'dior.html' },
    { name: 'Jordan 1 Retro High Dior', price: '2 561 241 Ft', brand: 'Dior', img: 'img/j1dior.png', page: 'dior.html' },
    { name: 'Dior B27 Low-Top White Calfskin', price: '442 982 Ft', brand: 'Dior', img: 'img/b27.png', page: 'dior.html' },
    { name: 'Louis Vuitton Skate Trainer Black Swarovski Monogram', price: '2 936 684 Ft', brand: 'Louis Vuitton', img: 'img/lvskate-removebg-preview.png', badge: 'badge-lim', badgeLabel: 'Limitált', page: 'lv.html' },
    { name: 'Louis Vuitton Timberland 6" High End Ankle Boot', price: '51 413 840 Ft', brand: 'Louis Vuitton', img: 'img/timb.png', page: 'lv.html' },
    { name: 'Louis Vuitton LV Trainer', price: '430 930 Ft', brand: 'Louis Vuitton', img: 'img/lvtrainer.png', badge: 'badge-lim', badgeLabel: 'VIP', page: 'lv.html' },
    { name: 'Louis Vuitton Nike Air Force 1 Low', price: '2 343 530 Ft', brand: 'Louis Vuitton', img: 'img/lvaf1.png', badge: 'badge-new', badgeLabel: 'Új', isSale: true, page: 'lv.html' },
    { name: 'Louis Vuitton Runner Tatic', price: '877 662 Ft', brand: 'Louis Vuitton', img: 'img/Runner.png', page: 'lv.html' },
  ];

  /* KERESÉS LOGIKA */
  const input  = document.getElementById('jwsSearchInput');
  const results = document.getElementById('jwsSearchResults');
  const empty  = document.getElementById('jwsSearchEmpty');

  function search(query) {
    results.innerHTML = '';
    empty.style.display = 'none';

    if (!query || query.length < 2) return;

    const q = query.toLowerCase();
    const found = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );

    if (found.length === 0) {
      empty.style.display = 'block';
      return;
    }

    const countEl = document.createElement('div');
    countEl.className = 'jws-search-count';
    countEl.textContent = found.length + ' találat';
    results.appendChild(countEl);

    found.forEach(p => {
      const item = document.createElement('a');
      item.className = 'jws-search-item';
      item.href = p.page;
      item.innerHTML = `
        <div class="jws-search-item-img">
          <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
        </div>
        <div class="jws-search-item-info">
          <div class="jws-search-item-brand">${p.brand}</div>
          <div class="jws-search-item-name">${p.name}</div>
        </div>
        ${p.badge ? `<span class="jws-search-badge ${p.badge}">${p.badgeLabel}</span>` : ''}
        <div class="jws-search-item-price${p.isSale ? ' is-sale' : ''}">${p.price}</div>
      `;
      results.appendChild(item);
    });
  }

  input.addEventListener('input', () => search(input.value.trim()));

  /* MEGNYITÁS / ZÁRÁS */
  function openSearch() {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    overlay.classList.remove('open');
    input.value = '';
    results.innerHTML = '';
    empty.style.display = 'none';
  }

  document.getElementById('jwsSearchClose').addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  /* KERESÉS IKON BEKÖTÉSE */
  window.jwsOpenSearch = openSearch;

})();
