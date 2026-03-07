/* =============================================
   FACES — cart.js
   Handles: reading cart from localStorage,
   rendering items, qty update, remove, promo, totals
   ============================================= */

const PROMO_CODES = {
  FACES10: 10,
  RAMADAN20: 20,
  WELCOME15: 15,
};

let appliedDiscount = 0;

// ── Helpers ─────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem("facesCart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("facesCart", JSON.stringify(cart));
}
function formatPrice(n) {
  return Number(n).toLocaleString("ar-EG") + " ج.م";
}

// ── Show Toast ───────────────────────────────
function showToast(msg, type = "") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = "toast show " + type;
  setTimeout(() => {
    toast.className = "toast";
  }, 2800);
}

// ── Update Badge ─────────────────────────────
function updateBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 35);
  document.querySelectorAll(".cart-badge").forEach((el) => {
    el.textContent = total;
    el.style.display = total === 0 ? "none" : "flex";
  });
}

// ── Render Cart ──────────────────────────────
function renderCart() {
  const cart = getCart();
  const empty = document.getElementById("cartEmpty");
  const content = document.getElementById("cartContent");
  const itemsEl = document.getElementById("cartItems");

  if (!empty || !content || !itemsEl) return;

  updateBadge();

  if (cart.length === 0) {
    empty.style.display = "flex";
    content.style.display = "none";
    return;
  }

  empty.style.display = "none";
  content.style.display = "grid";

  itemsEl.innerHTML = "";
  cart.forEach((item, idx) => {
    const li = document.createElement("div");
    li.className = "cart-item";
    li.dataset.idx = idx;

    const hasDiscount = item.oldPrice && item.oldPrice > item.price;
    const priceHtml = hasDiscount
      ? `<span class="cart-item-price has-discount">${formatPrice(item.price)}</span>
         <span class="cart-item-old-price">${formatPrice(item.oldPrice)}</span>`
      : `<span class="cart-item-price">${formatPrice(item.price)}</span>`;

    li.innerHTML = `
      <img class="cart-item-img"
           src="${item.img}"
           alt="${item.name}" />
      <div class="cart-item-details">
        <p class="cart-item-brand">${item.brand}</p>
        <p class="cart-item-name">${item.name}</p>
        ${priceHtml}
        <div class="qty-controls">
          <button class="qty-btn qty-plus" data-idx="${idx}">+</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn qty-minus" data-idx="${idx}">−</button>
        </div>
      </div>
      <button class="cart-item-remove" data-idx="${idx}" title="حذف">✕</button>
    `;
    itemsEl.appendChild(li);
  });

  // Events
  itemsEl.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(+btn.dataset.idx, 1));
  });
  itemsEl.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(+btn.dataset.idx, -1));
  });
  itemsEl.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeItem(+btn.dataset.idx, btn.closest(".cart-item")),
    );
  });

  updateTotals();
}

// ── Change Quantity ──────────────────────────
function changeQty(idx, delta) {
  const cart = getCart();
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
    showToast("تم حذف المنتج من العربة");
  }
  saveCart(cart);
  renderCart();
}

// ── Remove Item ──────────────────────────────
function removeItem(idx, el) {
  el.classList.add("removing");
  setTimeout(() => {
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
    showToast("تم حذف المنتج من العربة");
  }, 300);
}

// ── Totals ───────────────────────────────────
function updateTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = subtotal * (appliedDiscount / 100);
  const total = subtotal - discountAmt;

  const subEl = document.getElementById("subtotalVal");
  const totalEl = document.getElementById("totalVal");
  if (subEl) subEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

// ── Promo Code ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const promoBtn = document.getElementById("promoBtn");
  const promoInput = document.getElementById("promoInput");
  const promoMsg = document.getElementById("promoMsg");

  if (promoBtn && promoInput) {
    promoBtn.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();
      if (PROMO_CODES[code]) {
        appliedDiscount = PROMO_CODES[code];
        promoMsg.textContent = `✓ تم تطبيق خصم ${appliedDiscount}%`;
        promoMsg.className = "promo-msg success";
        updateTotals();
        showToast(`🎉 كود الخصم "${code}" تم تطبيقه!`, "gold");
      } else {
        promoMsg.textContent = "✗ كود الخصم غير صحيح";
        promoMsg.className = "promo-msg error";
      }
    });
    promoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") promoBtn.click();
    });
  }

  // Checkout
  document.querySelector(".checkout-btn")?.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) return;
    showToast("🛍️ جارٍ تحويلك لصفحة الدفع...", "gold");
    setTimeout(() => {
      alert("شكراً على تسوقك من FACES! 🌟\nسيتم تحويلك لبوابة الدفع.");
    }, 1000);
  });
});
