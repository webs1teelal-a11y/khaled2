/* =============================================
   FACES — brand.js
   Handles: filter tabs, add-to-cart popup, badge sync
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────
  // 1. CART HELPERS
  // ─────────────────────────────────────────
  function getCart()      { return JSON.parse(localStorage.getItem('facesCart') || '[]'); }
  function saveCart(cart) { localStorage.setItem('facesCart', JSON.stringify(cart)); }

  function addToCart(product) {
    const cart     = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) { existing.qty += 1; } 
    else          { cart.push({ ...product, qty: 1 }); }
    saveCart(cart);
    syncBadge();
  }

  function syncBadge() {
    const total = getCart().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = total;
      el.style.display = total === 0 ? 'none' : 'flex';
      el.style.transform = 'scale(1.5)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 250);
    });
  }

  syncBadge();

  // ─────────────────────────────────────────
  // 2. TOAST
  // ─────────────────────────────────────────
  function showToast(msg) {
    let toast = document.getElementById('brandToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'brandToast';
      document.body.appendChild(toast);

      const s = document.createElement('style');
      s.textContent = `
        #brandToast {
          position:fixed; bottom:30px; left:50%;
          transform:translateX(-50%) translateY(20px);
          background:#1a1a2e; color:#fff;
          padding:13px 26px; border-radius:30px;
          font-family:'Tajawal',sans-serif; font-size:14px; font-weight:600;
          opacity:0; pointer-events:none; z-index:9999;
          transition:opacity .3s, transform .3s;
          box-shadow:0 8px 30px rgba(0,0,0,0.2); white-space:nowrap;
        }
        #brandToast.show { opacity:1; transform:translateX(-50%) translateY(0); }
      `;
      document.head.appendChild(s);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ─────────────────────────────────────────
  // 3. CONFIRMATION POPUP
  // ─────────────────────────────────────────
  function buildPopup() {
    if (document.getElementById('confirmPopup')) return;
    const overlay = document.createElement('div');
    overlay.id = 'confirmPopup';
    overlay.innerHTML = `
      <div class="cp-box">
        <div class="cp-img-wrap"><img id="cpImg" src="" alt="" /></div>
        <div class="cp-body">
          <p class="cp-brand" id="cpBrand"></p>
          <p class="cp-name"  id="cpName"></p>
          <p class="cp-price" id="cpPrice"></p>
          <p class="cp-question">تضيف المنتج ده للعربة؟</p>
          <div class="cp-actions">
            <button class="cp-btn cp-confirm" id="cpConfirm">✓ موافق</button>
            <button class="cp-btn cp-cancel"  id="cpCancel">✕ إلغاء</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
    document.getElementById('cpCancel').addEventListener('click', closePopup);

    // Popup styles
    const s = document.createElement('style');
    s.textContent = `
      #confirmPopup {
        position:fixed; inset:0;
        background:rgba(10,13,26,0.65);
        backdrop-filter:blur(4px);
        display:flex; align-items:center; justify-content:center;
        z-index:9998; opacity:0; pointer-events:none;
        transition:opacity 0.3s; padding:20px;
      }
      #confirmPopup.active { opacity:1; pointer-events:all; }
      .cp-box {
        background:#fff; border-radius:18px; overflow:hidden;
        width:100%; max-width:400px;
        box-shadow:0 24px 60px rgba(0,0,0,0.25);
        transform:translateY(30px) scale(0.95);
        transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      }
      #confirmPopup.active .cp-box { transform:translateY(0) scale(1); }
      .cp-img-wrap {
        background:#f9f6f2; display:flex; align-items:center;
        justify-content:center; padding:24px; height:180px;
      }
      .cp-img-wrap img { max-height:140px; width:auto; object-fit:contain; }
      .cp-body { padding:18px 22px 22px; direction:rtl; text-align:right; }
      .cp-brand { font-size:11px; font-weight:700; letter-spacing:2px; color:#999; margin-bottom:4px; }
      .cp-name  { font-size:15px; font-weight:700; color:#1a1a2e; margin-bottom:6px; line-height:1.4; }
      .cp-price { font-size:18px; font-weight:800; color:#c8a750; margin-bottom:12px; }
      .cp-question { font-size:14px; color:#666; margin-bottom:16px; padding-top:12px; border-top:1px solid #f0e8dc; }
      .cp-actions { display:flex; gap:10px; }
      .cp-btn {
        flex:1; padding:13px 0; border:none; border-radius:10px;
        font-family:'Tajawal',sans-serif; font-size:15px; font-weight:700;
        cursor:pointer; transition:transform 0.2s, box-shadow 0.2s, background 0.2s;
      }
      .cp-confirm {
        background:linear-gradient(135deg,#c8a750,#a87d30); color:#fff;
        box-shadow:0 4px 16px rgba(200,167,80,0.35);
      }
      .cp-confirm:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(200,167,80,0.5); }
      .cp-cancel { background:#f5f0ea; color:#1a1a2e; }
      .cp-cancel:hover { background:#ede5d8; }
      .add-to-cart-btn {
        width:100%; margin-top:10px; padding:9px 0;
        background:#1a1a2e; color:#fff; border:none; border-radius:8px;
        font-family:'Tajawal',sans-serif; font-size:13px; font-weight:700;
        cursor:pointer; transition:background 0.25s, transform 0.2s;
      }
      .add-to-cart-btn:hover:not(:disabled) { background:#c8a750; transform:translateY(-1px); }
      .add-to-cart-btn:disabled { cursor:default; }
      .cart-badge { transition: transform 0.25s ease; }
    `;
    document.head.appendChild(s);
  }

  function openPopup(product, addBtn) {
    document.getElementById('cpImg').src            = product.img;
    document.getElementById('cpBrand').textContent  = product.brand;
    document.getElementById('cpName').textContent   = product.name;
    document.getElementById('cpPrice').textContent  = Number(product.price).toLocaleString('ar-EG') + ' ج.م';

    const overlay = document.getElementById('confirmPopup');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const oldBtn = document.getElementById('cpConfirm');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.replaceWith(newBtn);

    newBtn.addEventListener('click', () => {
      addToCart(product);
      closePopup();

      addBtn.textContent      = '✓ تمت الإضافة';
      addBtn.style.background = '#27ae60';
      addBtn.disabled         = true;
      setTimeout(() => {
        addBtn.textContent      = '+ أضف للعربة';
        addBtn.style.background = '';
        addBtn.disabled         = false;
      }, 2000);

      showToast('🛍️ أُضيف "' + product.name.slice(0, 20) + '..." للعربة');
    });
  }

  function closePopup() {
    document.getElementById('confirmPopup')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
  buildPopup();

  // ─────────────────────────────────────────
  // 4. ADD BUTTON TO EVERY PRODUCT CARD
  // ─────────────────────────────────────────
  document.querySelectorAll('.product-card').forEach((card, idx) => {
    const brand    = card.querySelector('.brand')?.textContent.trim()        || 'FACES';
    const name     = card.querySelector('.product-name')?.textContent.trim() || 'منتج';
    const priceEl  = card.querySelector('.price strong');
    const oldEl    = card.querySelector('.old-price');
    const imgEl    = card.querySelector('img');

    const price    = parseFloat(priceEl?.textContent.replace(/[^\d.]/g, '') || '0') || 0;
    const oldPrice = oldEl ? parseFloat(oldEl.textContent.replace(/[^\d.]/g, '')) : null;
    const img      = imgEl?.src || '';
    const id       = brand + '-brand-' + idx;

    const addBtn       = document.createElement('button');
    addBtn.className   = 'add-to-cart-btn';
    addBtn.textContent = '+ أضف للعربة';
    card.querySelector('.product-info').appendChild(addBtn);

    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      openPopup({ id, brand, name, price, oldPrice, img }, addBtn);
    });
  });

  // ─────────────────────────────────────────
  // 5. FILTER TABS
  // ─────────────────────────────────────────
  const tabs         = document.querySelectorAll('.filter-tab');
  const grid         = document.getElementById('productsGrid');
  const countEl      = document.getElementById('productsCount');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      const cards  = Array.from(grid.querySelectorAll('.product-card'));

      // Sort + filter
      let sorted = [...cards];

      if (filter === 'low') {
        sorted.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
      } else if (filter === 'high') {
        sorted.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
      }

      // Re-append in sorted order and show/hide
      sorted.forEach(card => {
        grid.appendChild(card);
        const badge = card.dataset.badge;
        let show = true;

        if (filter === 'best')   show = badge === 'best';
        if (filter === 'new')    show = badge === 'new';
        if (filter === 'low' || filter === 'high' || filter === 'all') show = true;

        card.classList.toggle('hidden', !show);

        // Re-trigger animation
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = '';
      });

      // Update count
      const visible = sorted.filter(c => !c.classList.contains('hidden')).length;
      if (countEl) countEl.textContent = visible + ' منتج';
    });
  });

});
