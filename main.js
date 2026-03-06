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
