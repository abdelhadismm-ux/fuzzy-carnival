/**
 * Shopi — Checkout flow module (checkout.js)
 * -----------------------------------------------------------------------------
 * Orchestrates: Cart -> Checkout form -> Payment method -> Order Confirmation.
 *
 * Relies on (loaded earlier):
 *   - window.ShopiCart          (cart state, from script.js)
 *   - window.PaymentConfig      (payment/payment-config.js)
 *   - window.PaymentProvider    (payment/payment-provider.js)
 *   - window.CODProvider / OnlinePaymentProvider
 *
 * No API secrets live in this (frontend) file. Payment providers expose an
 * isReady()/process() contract so a real gateway can be connected later via the
 * payment/ layer with zero UI changes.
 */
window.ShopiCheckout = window.ShopiCheckout || {};

(function () {
  "use strict";

  var SUBTOTAL = 0; // set when the checkout is opened

  // ---------- Config: delivery / order ----------
  // Flat delivery fee in MAD (configurable by the store owner / backend).
  var SHIPPING_FEE = 30;

  // Which DOM ids are the "storefront" sections we show/hide.
  var STORE_SELECTOR =
    "#hero,#featured,#bestsellers,#offers,#why,#how,#reviews,#faq,#final-cta";

  var els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function init() {
    els.checkout = $("checkout");
    els.confirmation = $("confirmation");
    els.checkoutItems = $("checkoutItems");
    els.coSubtotal = $("coSubtotal");
    els.coShipping = $("coShipping");
    els.coTotal = $("coTotal");
    els.checkoutForm = $("checkoutForm");
    els.payMethods = $("payMethods");
    els.onlinePlaceholder = $("onlinePlaceholder");
    els.checkoutSubmit = $("checkoutSubmit");
    els.checkoutFormErr = $("checkoutFormErr");
    els.checkoutBack = $("checkoutBack");

    els.confOrderId = $("confOrderId");
    els.confPayMethod = $("confPayMethod");
    els.confTotal = $("confTotal");
    els.confStatus = $("confStatus");
    els.confCity = $("confCity");
    els.confItems = $("confItems");
    els.confMsg = $("confMsg");
    els.confPayPlaceholder = $("confPayPlaceholder");
    els.confBackHome = $("confBackHome");

    // Ensure the panels are hidden on initial load (no hidden attr in markup).
    els.checkout.hidden = true;
    els.checkout.setAttribute("aria-hidden", "true");
    els.confirmation.hidden = true;
    els.confirmation.setAttribute("aria-hidden", "true");
    document.body.classList.remove("checkout-open", "confirm-open");

    wireEvents();
  }

  // ---------- View switching ----------
  function showCheckout() {
    hideStore();
    els.checkout.hidden = false;
    els.checkout.setAttribute("aria-hidden", "false");
    document.body.classList.add("checkout-open");
    document.body.classList.remove("confirm-open");
    if (els.checkout.scrollIntoView) els.checkout.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  function showConfirmation() {
    hideStore();
    els.confirmation.hidden = false;
    els.confirmation.setAttribute("aria-hidden", "false");
    document.body.classList.add("confirm-open");
    document.body.classList.remove("checkout-open");
    window.scrollTo(0, 0);
  }
  function hideStore() {
    document.querySelectorAll(STORE_SELECTOR).forEach(function (sec) {
      sec.style.display = "none";
    });
    els.checkout.hidden = true;
    els.checkout.setAttribute("aria-hidden", "true");
    els.confirmation.hidden = true;
    els.confirmation.setAttribute("aria-hidden", "true");
  }
  function showStore() {
    document.querySelectorAll(STORE_SELECTOR).forEach(function (sec) {
      sec.style.display = "";
    });
    els.checkout.hidden = true;
    els.checkout.setAttribute("aria-hidden", "true");
    els.confirmation.hidden = true;
    els.confirmation.setAttribute("aria-hidden", "true");
    document.body.classList.remove("checkout-open", "confirm-open");
    window.scrollTo(0, 0);
  }

  // ---------- Open the checkout from the cart ----------
  function openCheckout() {
    if (window.ShopiCart.isEmpty()) return;
    SUBTOTAL = window.ShopiCart.subtotal();
    renderSummary();
    renderPaymentMethods();
    clearErrors();
    showCheckout();
  }
  function renderSummary() {
    els.checkoutItems.innerHTML = "";
    window.ShopiCart.getItems().forEach(function (it) {
      var li = document.createElement("li");
      li.className = "checkout-item";
      li.innerHTML =
        '<span class="co-emoji" aria-hidden="true">' + it.emoji + "</span>" +
        '<span class="co-name">' + it.name + ' <em>× ' + it.qty + "</em></span>" +
        '<span class="co-price">' + it.price * it.qty + " درهم</span>";
      els.checkoutItems.appendChild(li);
    });
    var ship = SUBTOTAL > 0 ? SHIPPING_FEE : 0;
    var total = SUBTOTAL + ship;
    els.coSubtotal.textContent = SUBTOTAL + " درهم";
    els.coShipping.textContent = ship + " درهم";
    els.coTotal.textContent = total + " درهم";
  }

  function renderPaymentMethods() {
    els.payMethods.innerHTML = "";
    var order = ["cod", "online"];
    order.forEach(function (key) {
      var m = PaymentConfig.methods[key];
      if (!m) return;
      var label = document.createElement("label");
      label.className = "pay-method" + (key === PaymentConfig.activeProvider ? " selected" : "");
      label.innerHTML =
        '<input type="radio" name="payMethod" value="' + m.id + '"' +
        (key === PaymentConfig.activeProvider ? " checked" : "") + ">" +
        '<span class="pay-radio" aria-hidden="true"></span>' +
        '<span class="pay-body"><strong>' + m.label + "</strong>" +
        "<small>" + m.description + "</small></span>";
      label.addEventListener("click", function () {
        onMethodSelect(key);
      });
      els.payMethods.appendChild(label);
    });
    onMethodSelect(PaymentConfig.activeProvider);
  }

  function onMethodSelect(id) {
    var m = PaymentConfig.methods[id];
    els.payMethods.querySelectorAll(".pay-method").forEach(function (el) {
      var input = el.querySelector("input");
      var isSel = input && input.value === id;
      el.classList.toggle("selected", isSel);
      if (input) input.checked = isSel;
    });
    // Show integration placeholder for online (not ready).
    var onlineReady = m && m.id === "online" && !m.ready;
    els.onlinePlaceholder.hidden = !onlineReady;
    // Update submit button label/state.
    if (m) {
      if (m.id === "online" && !m.ready) {
        els.checkoutSubmit.disabled = true;
        els.checkoutSubmit.textContent = "الدفع الإلكتروني غير متاح حاليًا";
      } else {
        els.checkoutSubmit.disabled = false;
        els.checkoutSubmit.textContent =
          m.id === "cod"
            ? "تأكيد الطلب — الدفع عند الاستلام"
            : "تأكيد الطلب — الدفع الإلكتروني";
      }
    }
  }

  // ---------- Validation ----------
  function validPhone(v) {
    var digits = String(v).replace(/[\s\-()]/g, "");
    return /^(\+?212|0)([5-7]\d{8})$/.test(digits);
  }
  function setErr(fieldId, msg) {
    var f = $(fieldId);
    var wrap = f && f.closest(".field");
    var err = wrap && wrap.querySelector(".field-err");
    if (err) err.textContent = msg || "";
    if (f) f.classList.toggle("invalid", !!msg);
  }
  function clearErrors() {
    ["coName", "coPhone", "coCity", "coAddress"].forEach(function (id) {
      setErr(id, "");
    });
    els.checkoutFormErr.textContent = "";
  }

  function validateForm() {
    var ok = true;
    var name = els.checkoutForm.elements.name.value.trim();
    var phone = els.checkoutForm.elements.phone.value.trim();
    var city = els.checkoutForm.elements.city.value.trim();
    var address = els.checkoutForm.elements.address.value.trim();

    if (!name) { setErr("coName", "المرجو إدخال الاسم الكامل."); ok = false; }
    else setErr("coName", "");

    if (!phone) { setErr("coPhone", "المرجو إدخال رقم الهاتف."); ok = false; }
    else if (!validPhone(phone)) { setErr("coPhone", "رقم هاتف مغربي غير صحيح. مثال: 0612345678"); ok = false; }
    else setErr("coPhone", "");

    if (!city) { setErr("coCity", "المرجو إدخال المدينة."); ok = false; }
    else setErr("coCity", "");

    if (!address) { setErr("coAddress", "المرجو إدخال العنوان الكامل."); ok = false; }
    else setErr("coAddress", "");

    if (!window.ShopiCart || window.ShopiCart.isEmpty()) {
      els.checkoutFormErr.textContent = "سلتك فارغة. المرجو إضافة منتجات أولاً.";
      ok = false;
    }
    return ok;
  }

  // ---------- Order object builder ----------
  function buildOrder() {
    var f = els.checkoutForm.elements;
    var items = window.ShopiCart.getItems();
    var subtotal = window.ShopiCart.subtotal();
    var shipping = subtotal > 0 ? SHIPPING_FEE : 0;
    var total = subtotal + shipping;
    var payId = PaymentConfig.activeProvider;
    var payMethod = PaymentConfig.methods[payId] || PaymentConfig.methods.cod;
    var orderId = "SHOP-" + Date.now().toString(36).toUpperCase();

    return {
      orderId: orderId,
      customer: {
        name: f.name.value.trim(),
        phone: f.phone.value.trim().replace(/[\s\-()]/g, ""),
        city: f.city.value.trim(),
        address: f.address.value.trim(),
        notes: f.notes ? f.notes.value.trim() : "",
      },
      products: items.map(function (it) {
        return {
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.qty,
          emoji: it.emoji,
        };
      }),
      quantities: items.reduce(function (acc, it) { acc += it.qty; return acc; }, 0),
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      paymentMethod: { id: payId, label: payMethod.label },
      orderStatus: "received", // Order received; awaiting confirmation/delivery.
      createdAt: new Date().toISOString(),
      _meta: { currency: "MAD", region: "MA" },
    };
  }

  // ---------- Submit flow ----------
  function onSubmit() {
    if (!validateForm()) {
      els.checkoutFormErr.textContent = "المرجو تصحيح الحقول المطلوبة.";
      return;
    }
    var provider = PaymentProvider.resolve();
    if (!provider) {
      els.checkoutFormErr.textContent = "طريقة الدفع غير متوفرة حالياً.";
      return;
    }
    if (provider.id === "online" && !provider.isReady()) {
      onMethodSelect("online");
      return; // UI already reflects the not-ready state.
    }

    var order = buildOrder();
    els.checkoutSubmit.disabled = true;
    els.checkoutSubmit.textContent = "جاري معالجة طلبك...";

    // Unified call through the abstraction layer. COD resolves immediately;
    // a real gateway awaits a server call here later (no UI changes).
    provider
      .process(order)
      .then(function (result) {
        if (result && result.success) {
          renderConfirmation(order, result);
        } else {
          els.checkoutFormErr.textContent =
            (result && result.message) || "تعذر تأكيد الطلب. المرجو المحاولة مجددًا.";
          els.checkoutSubmit.disabled = false;
          els.checkoutSubmit.textContent = "إعادة المحاولة";
        }
      })
      .catch(function (err) {
        // Not a fake success — surface the real error.
        els.checkoutFormErr.textContent =
          (err && err.message) || "تعذر إتمام العملية. المرجو المحاولة مجددًا.";
        els.checkoutSubmit.disabled = false;
        els.checkoutSubmit.textContent = "إعادة المحاولة";
      });
  }

  function renderConfirmation(order, result) {
    els.confOrderId.textContent = order.orderId;
    els.confPayMethod.textContent = order.paymentMethod.label;
    els.confTotal.textContent = order.total + " درهم";
    els.confStatus.textContent = "قيد المعالجة";
    els.confCity.textContent = order.customer.city;

    var msg =
      "شكرًا " + order.customer.name.split(" ")[0] + "! تم استلام طلبك رقم " +
      order.orderId + ". سنتواصل معك لتأكيد التوصيل.";
    if (order.paymentMethod.id === "cod") {
      msg += " ستدفع عند استلام طلبك.";
    }
    els.confMsg.textContent = msg;

    // Clearly marked placeholder info for online payment (never a fake success).
    if (order.paymentMethod.id === "online") {
      els.confPayPlaceholder.textContent =
        "ملاحظة: بوابة الدفع الإلكتروني قيد الربط — هذا تأكيد تجريبي وليس دفعًا فعليًا.";
      els.confPayPlaceholder.hidden = false;
    } else {
      els.confPayPlaceholder.hidden = true;
    }

    els.confItems.innerHTML = "";
    order.products.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "conf-li";
      li.innerHTML =
        '<span class="co-emoji" aria-hidden="true">' + it.emoji + "</span>" +
        '<span class="co-name">' + it.name + ' <em>× ' + it.quantity + "</em></span>" +
        '<span class="co-price">' + it.price * it.quantity + " درهم</span>";
      els.confItems.appendChild(li);
    });

    // Archive the order (in-memory ready-for-backend). Do NOT clear until the
    // user navigates home, so confirmation shows the saved cart.
    window.__lastOrder = order;

    showConfirmation();
  }

  function goBackToStore() {
    showStore();
  }

  function wireEvents() {
    els.checkoutSubmit.addEventListener("click", onSubmit);
    els.checkoutBack.addEventListener("click", function () {
      showStore();
      // "Back to cart" returns to the storefront with the drawer reopened.
      if (window.ShopiCart && window.ShopiCart.openCart) {
        window.ShopiCart.openCart();
      }
    });
    els.confBackHome.addEventListener("click", function () {
      if (window.ShopiCart) window.ShopiCart.clear();
      goBackToStore();
    });
    // Listen for price updates if the cart changed.
    document.addEventListener("shopi:cart-changed", function () {
      if (!els.checkout.hidden) renderSummary();
    });
    // Phone input: allow digits / + / spaces.
    els.checkoutForm.elements.phone.addEventListener("input", function () {
      setErr("coPhone", "");
    });
  }

  // Public API
  ShopiCheckout.openCheckout = openCheckout;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
