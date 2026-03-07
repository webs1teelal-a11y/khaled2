/* =============================================
   FACES Beauty Store — script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────
  // 1. NAVBAR — STICKY SHADOW ON SCROLL
  // ─────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,0.12)'
        : '0 2px 16px rgba(0,0,0,0.07)';
    });
  }

  // ─────────────────────────────────────────
  // 2. MOBILE HAMBURGER MENU
  // ─────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });
  }

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (hamburger && navLinks && navLinks.classList.contains('open')) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    }
  });

  // ─────────────────────────────────────────
  // 3. PRODUCT SLIDERS — ARROW NAVIGATION
  // ─────────────────────────────────────────
  const SCROLL_AMOUNT = 400;

  const sliders = {
    givenchySlider: 'givenchyTrack',
    diorSlider:     'diorTrack',
    clarinsSlider:  'clarinsTrack',
  };

  function updateArrows(track, prevBtn, nextBtn) {
    if (!prevBtn || !nextBtn) return;
    const atStart = track.scrollLeft >= -10;
    const atEnd   = track.scrollLeft <= -(track.scrollWidth - track.clientWidth - 10);
    prevBtn.style.opacity = atStart ? '0.35' : '1';
    nextBtn.style.opacity = atEnd   ? '0.35' : '1';
  }

  Object.entries(sliders).forEach(([wrapperId, trackId]) => {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    const track   = document.getElementById(trackId);
    const prevBtn = wrapper.querySelector('.arrow-prev');
    const nextBtn = wrapper.querySelector('.arrow-next');
    if (prevBtn && track) prevBtn.addEventListener('click', () => track.scrollBy({ left:  SCROLL_AMOUNT, behavior: 'smooth' }));
    if (nextBtn && track) nextBtn.addEventListener('click', () => track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' }));
    if (track) {
      updateArrows(track, prevBtn, nextBtn);
      track.addEventListener('scroll', () => updateArrows(track, prevBtn, nextBtn));
    }
  });

  // ─────────────────────────────────────────
  // 4. CART HELPERS (localStorage)
  // ─────────────────────────────────────────
  function getCart()      { return JSON.parse(localStorage.getItem('facesCart') || '[]'); }
  function saveCart(cart) { localStorage.setItem('facesCart', JSON.stringify(cart)); }

  function addToCart(product) {
    const cart     = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
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

  // ─────────────────────────────────────────
  // 5. TOAST NOTIFICATION
  // ─────────────────────────────────────────
  function showToast(msg) {
    let toast = document.getElementById('homeToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'homeToast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ─────────────────────────────────────────
  // 6. CONFIRMATION POPUP
  // ─────────────────────────────────────────
  function buildPopup() {
    if (document.getElementById('confirmPopup')) return;
    const overlay = document.createElement('div');
    overlay.id = 'confirmPopup';
    overlay.innerHTML = `
      <div class="cp-box">
        <div class="cp-img-wrap">
          <img id="cpImg" src="" alt="" />
        </div>
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
  }

  function openPopup(product, addBtn) {
    document.getElementById('cpImg').src          = product.img;
    document.getElementById('cpBrand').textContent = product.brand;
    document.getElementById('cpName').textContent  = product.name;
    document.getElementById('cpPrice').textContent = Number(product.price).toLocaleString('ar-EG') + ' ج.م';

    const overlay = document.getElementById('confirmPopup');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // استبدل الزرار عشان نمسح اي listener قديم
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
  // 7. ADD BUTTON INSIDE EVERY PRODUCT CARD
  // بيشتغل بس في index.html مش صفحات الماركات
  // ─────────────────────────────────────────
  const isBrandPage = document.getElementById('productsGrid');
  if (!isBrandPage) {
    document.querySelectorAll('.product-card').forEach((card, idx) => {
      if (card.querySelector('.add-to-cart-btn')) return;

      const brand    = card.querySelector('.brand')?.textContent.trim()        || 'FACES';
      const name     = card.querySelector('.product-name')?.textContent.trim() || 'منتج';
      const priceEl  = card.querySelector('.price strong');
      const oldEl    = card.querySelector('.old-price');
      const imgEl    = card.querySelector('img');

      const price    = parseFloat(priceEl?.textContent.replace(/[^\d.]/g, '') || '0') || 0;
      const oldPrice = oldEl ? parseFloat(oldEl.textContent.replace(/[^\d.]/g, '')) : null;
      const img      = imgEl?.src || '';
      const id       = brand + '-' + idx;

      const addBtn       = document.createElement('button');
      addBtn.className   = 'add-to-cart-btn';
      addBtn.textContent = '+ أضف للعربة';
      card.querySelector('.product-info').appendChild(addBtn);

      addBtn.addEventListener('click', e => {
        e.stopPropagation();
        openPopup({ id, brand, name, price, oldPrice, img }, addBtn);
      });
    });
  }

  syncBadge();

  // ─────────────────────────────────────────
  // 8. ENTRANCE ANIMATIONS
  // ─────────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('products-section')) {
        entry.target.querySelectorAll('.product-card').forEach((c, i) => {
          setTimeout(() => c.classList.add('visible'), i * 80);
        });
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.products-section, .ramadan-banner').forEach(el => observer.observe(el));

  // ─────────────────────────────────────────
  // 9. SEARCH BAR
  // ─────────────────────────────────────────
  const searchInput = document.querySelector('.nav-search input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) searchInput.blur();
    });
  }

});
