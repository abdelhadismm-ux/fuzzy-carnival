/**
 * Shopi — Store interactions.
 *
 * ─── IMPORTANT: WhatsApp number ──────────────────────────────────────────────
 * All WhatsApp links on the page are centralized here. Replace the placeholder
 * value below with your real WhatsApp number (international format, digits only,
 * e.g. "212612345678") before going live.
 *
 * The current value "212600000000" is a PLACEHOLDER and must not be used in
 * production.
 */
const SHOPI_WHATSAPP_NUMBER = "212600000000"; // TODO: replace with real number

/**
 * Builds a wa.me link from the centralized number.
 * @param {string} message The pre-filled WhatsApp text.
 * @returns {string} The wa.me URL.
 */
function buildWaUrl(message) {
  return `https://wa.me/${SHOPI_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const waNumber = SHOPI_WHATSAPP_NUMBER;

  /* ===== MOBILE NAV TOGGLE ===== */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ===== CENTRALIZED WHATSAPP LINKS =====
     Note: .order-now buttons are handled separately below and are explicitly
     excluded here to avoid a double window.open. */
  const waLinks = document.querySelectorAll("[data-wa]:not(.order-now), [data-wa-float]");
  waLinks.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const msg = el.dataset.wa || "السلام عليكم، أود الاستفسار عن منتجات Baladis.com.";
      window.open(buildWaUrl(msg), "_blank", "noopener");
    });
  });

  /* ===== SCROLL REVEAL ===== */
  const revealEls = document.querySelectorAll(".prod-card, .why-card, .rev-card, .offer-banner");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));

  /* ===== SEARCH BUTTON ===== */
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ===== CART STATE =====
     cart = Map<productName, { name, price, qty, emoji }> */
  const cart = new Map();
  const countEl = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartEmptyEl = document.getElementById("cartEmpty");
  const cartFootEl = document.getElementById("cartFoot");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartHeadCountEl = document.getElementById("cartHeadCount");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartClose = document.getElementById("cartClose");
  const cartBtn = document.getElementById("cartBtn");
  const cartCheckout = document.getElementById("cartCheckout");

  function itemTotalQty() {
    let t = 0;
    cart.forEach((it) => (t += it.qty));
    return t;
  }
  function itemTotalAmount() {
    let t = 0;
    cart.forEach((it) => (t += it.price * it.qty));
    return t;
  }

  function renderCart() {
    const totalQty = itemTotalQty();
    const totalAmount = itemTotalAmount();
    if (countEl) countEl.textContent = totalQty;
    if (cartHeadCountEl) cartHeadCountEl.textContent = `(${totalQty})`;

    if (cart.size === 0) {
      cartEmptyEl.style.display = "block";
      cartItemsEl.style.display = "none";
      cartFootEl.style.display = "none";
      cartCheckout.disabled = true;
    } else {
      cartEmptyEl.style.display = "none";
      cartItemsEl.style.display = "grid";
      cartFootEl.style.display = "grid";
      cartCheckout.disabled = false;
      cartItemsEl.innerHTML = "";
      cart.forEach((it) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.dataset.id = it.id;
        li.dataset.name = it.name;
        li.innerHTML = `
          <span class="cart-item-emoji" aria-hidden="true">${it.emoji}</span>
          <div class="cart-item-info">
            <div class="cart-item-name">${it.name}</div>
            <div class="cart-item-price">${it.price} درهم</div>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn qty-remove" aria-label="إزالة ${it.name}">×</button>
            <button class="qty-btn qty-minus" aria-label="إنقاص الكمية">−</button>
            <span class="qty-val">${it.qty}</span>
            <button class="qty-btn qty-plus" aria-label="زيادة الكمية">+</button>
          </div>`;
        cartItemsEl.appendChild(li);
      });
    }
    if (cartTotalEl) cartTotalEl.textContent = totalAmount;
  }

  // Resolve a product from the centralized data source by id or name.
  function resolveProduct(ref) {
    if (!ref) return null;
    if (typeof ref === "object") return ref;
    return window.ShopiProducts && (ShopiProducts.byId(ref) || ShopiProducts.get(ref));
  }

  // Add a product to the cart. The cart is keyed by stable product id so that
  // all systems (cart, checkout, WhatsApp) reference the same identity, and so
  // renaming a product never breaks an existing cart.
  function addToCart(ref) {
    const product = resolveProduct(ref);
    const id = product ? product.id : String(ref);
    const name = product ? product.name : (typeof ref === "string" ? ref : "منتج");
    const price = product ? product.price : 0;
    const emoji = product ? product.emoji : "🛍️";
    if (cart.has(id)) cart.get(id).qty += 1;
    else cart.set(id, { id, name, price, qty: 1, emoji });
    renderCart();
  }

  function changeQty(id, delta) {
    const it = cart.get(id);
    if (!it) return;
    it.qty += delta;
    if (it.qty <= 0) cart.delete(id);
    renderCart();
  }

  function bumpPulse() {
    if (countEl) {
      countEl.classList.remove("pulse");
      void countEl.offsetWidth;
      countEl.classList.add("pulse");
    }
  }

  function openCart() {
    cartOverlay.classList.add("open");
    cartDrawer.classList.add("open");
    cartOverlay.setAttribute("aria-hidden", "false");
    cartDrawer.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    cartOverlay.classList.remove("open");
    cartDrawer.classList.remove("open");
    cartOverlay.setAttribute("aria-hidden", "true");
    cartDrawer.setAttribute("aria-hidden", "true");
  }

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", (e) => {
      const item = e.target.closest(".cart-item");
      if (!item) return;
      const id = item.dataset.id;
      if (e.target.closest(".qty-plus")) changeQty(id, 1);
      else if (e.target.closest(".qty-minus")) changeQty(id, -1);
      else if (e.target.closest(".qty-remove")) { cart.delete(id); renderCart(); }
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
      if (cart.size === 0) return;
      closeCart();
      if (window.ShopiCheckout) window.ShopiCheckout.openCheckout();
    });
  }

  /* ===== SHARED CART API (consumed by checkout.js / confirmation) =====
     Exposes the in-memory cart to other modules without tying them to the UI.
     This is the single source of truth for cart state. */
  window.ShopiCart = {
    isEmpty: () => cart.size === 0,
    getItems: () => Array.from(cart.values()).map((it) => ({ ...it })),
    qty: () => itemTotalQty(),
    subtotal: () => itemTotalAmount(),
    add: (ref) => addToCart(ref),
    changeQty: (id, delta) => changeQty(id, delta),
    remove: (id) => { cart.delete(id); renderCart(); },
    clear: () => { cart.clear(); renderCart(); },
    openCart: () => openCart(),
    closeCart: () => closeCart(),
    pulse: () => bumpPulse(),
    _cart: cart,
  };

  /* ===== PRODUCT CARD ACTIONS ===== */
  document.querySelectorAll(".prod-card").forEach((card) => {
    // Resolve the canonical product from the centralized data source.
    const product = window.ShopiProducts && ShopiProducts.byId(card.dataset.id);

    const orderBtn = card.querySelector(".order-now");
    if (orderBtn) {
      orderBtn.addEventListener("click", () => {
        // Single WhatsApp message builder — shared with search & everywhere.
        const msg = window.ShopiProducts.buildWhatsAppMessage(product);
        window.open(buildWaUrl(msg), "_blank", "noopener");
      });
    }

    const addBtn = card.querySelector(".add-cart");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart(product);
        bumpPulse();
        const original = addBtn.innerHTML;
        addBtn.textContent = "تمت الإضافة ✓";
        addBtn.classList.add("added");
        setTimeout(() => {
          addBtn.textContent = "أضف للسلة";
          addBtn.classList.remove("added");
        }, 1500);
      });
    }
  });

  /* ===== NAV LINKS ACTIVE STATE ===== */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ===== DYNAMIC STYLES (cart pulse, add-to-cart state) ===== */
  const style = document.createElement("style");
  style.textContent = `
    .cart-count.pulse { animation: cartPulse 0.4s ease; }
    @keyframes cartPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.5); }
      100% { transform: scale(1); }
    }
    .btn-outline.added { border-color: #22c55e; color: #22c55e; background: rgba(34,197,94,0.12); }
    .nav-links a.active { color: var(--orange); }
  `;
  document.head.appendChild(style);
});
