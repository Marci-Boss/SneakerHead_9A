/* =============================================
   CART.JS — JWS KICKS
   ============================================= */

const SHIPPING_COST   = 1990;
const FREE_SHIP_ABOVE = 50000;
const PROMO_CODES = {
  'HH': 0.32,
  'JEWS':    0.45,
  'LACIMACI':      0.60,
};

let activeDiscount = 0;

function getCart() { return JSON.parse(localStorage.getItem('jwsCart') || '[]'); }
function saveCart(c) { localStorage.setItem('jwsCart', JSON.stringify(c)); }
function fmt(n) { return n.toLocaleString('hu-HU') + ' Ft'; }

function updateNavCount() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.nav-cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline' : 'none';
  });
}

function render() {
  const cart  = getCart();
  const list  = document.getElementById('cartItemsList');
  const empty = document.getElementById('emptyState');
  const btn   = document.getElementById('checkoutBtn');
  if (!list) return;

  list.innerHTML = '';

  if (cart.length === 0) {
    empty.style.display = 'block';
    if (btn) btn.disabled = true;
    updateSummary(0);
    updateNavCount();
    return;
  }

  empty.style.display = 'none';
  if (btn) btn.disabled = false;

  cart.forEach((item, index) => {
    const dispPrice = item.salePrice || item.price;
    const lineTotal = dispPrice * item.qty;
    const isSale    = !!item.salePrice;

    const imgHtml = item.img
      ? `<img src="${item.img}" alt="${item.name}">`
      : '';

    const badgeHtml = item.badge
      ? `<span class="item-badge ${item.badge}">${item.badgeLabel || ''}</span><br>`
      : '';

    const oldPriceHtml = isSale
      ? `<span style="font-size:11px;color:#bbb;text-decoration:line-through;margin-right:4px;">${fmt(item.price)}</span>`
      : '';

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.index = index;
    row.innerHTML = `
      <div class="item-left">
        <div class="item-img">${imgHtml}</div>
        <div>
          ${badgeHtml}
          <div class="item-name">${item.name}</div>
          <div class="item-unit-price">${oldPriceHtml}${fmt(dispPrice)} / db</div>
        </div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn qty-minus" data-index="${index}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn qty-plus" data-index="${index}">+</button>
      </div>
      <div class="item-total${isSale ? ' is-sale' : ''}">${fmt(lineTotal)}</div>
      <button class="remove-btn" data-index="${index}" title="Eltávolítás">✕</button>
    `;
    list.appendChild(row);
  });

  // Eseménykezelők — index alapján, nem inline onclick
  list.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(+btn.dataset.index, -1));
  });
  list.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(+btn.dataset.index, +1));
  });
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeItem(+btn.dataset.index));
  });

  const subtotal = cart.reduce((s, i) => s + (i.salePrice || i.price) * i.qty, 0);
  updateSummary(subtotal);
  updateNavCount();
}

function updateSummary(subtotal) {
  const shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIP_ABOVE ? 0 : SHIPPING_COST);
  const discount = Math.round(subtotal * activeDiscount);
  const total    = subtotal - discount + shipping;

  const elSub     = document.getElementById('sSubtotal');
  const elShip    = document.getElementById('sShipping');
  const elDisc    = document.getElementById('sDiscount');
  const elDiscRow = document.getElementById('sDiscountRow');
  const elTotal   = document.getElementById('sTotal');

  if (elSub)  elSub.textContent = subtotal > 0 ? fmt(subtotal) : '—';

  if (elShip) {
    if (subtotal === 0)   { elShip.textContent = '—'; elShip.classList.remove('free'); }
    else if (shipping===0){ elShip.textContent = 'Ingyenes 🎉'; elShip.classList.add('free'); }
    else                  { elShip.textContent = fmt(shipping); elShip.classList.remove('free'); }
  }

  if (elDiscRow) elDiscRow.style.display = discount > 0 ? 'flex' : 'none';
  if (elDisc)    elDisc.textContent = discount > 0 ? '−' + fmt(discount) : '—';
  if (elTotal)   elTotal.textContent = subtotal > 0 ? fmt(total) : '—';
}

function changeQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(cart);
  render();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  render();
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  const msg   = document.getElementById('promoMsg');
  const code  = (input ? input.value : '').trim().toUpperCase();

  if (PROMO_CODES[code]) {
    activeDiscount = PROMO_CODES[code];
    if (msg) { msg.textContent = `✓ ${Math.round(activeDiscount * 100)}% kedvezmény aktiválva!`; msg.className = 'promo-msg ok'; }
    render();
  } else {
    if (msg) { msg.textContent = 'Érvénytelen kuponkód.'; msg.className = 'promo-msg err'; }
  }
}

function checkout() {
  alert('Köszönjük a megrendelést! 🎉\n\nItt csatlakoztasd a saját fizetési rendszeredet.');
}

render();
