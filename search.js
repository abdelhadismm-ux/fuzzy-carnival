/**
 * Shopi — Live Product Search (search.js)
 * -----------------------------------------------------------------------------
 * Opens a search overlay from the navbar #searchBtn (or the '/' shortcut) and
 * filters products from data/products.js in real time by name / category /
 * description. Results support add-to-cart and WhatsApp order — reusing the
 * shared ShopiProducts / ShopiCart / buildWaUrl APIs so behavior stays
 * consistent with the rest of the store.
 */
window.ShopiSearch = window.ShopiSearch || {};

(function () {
  "use strict";

  var els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function init() {
    els.overlay = $("searchOverlay");
    els.panel = document.querySelector(".search-panel");
    els.input = $("searchInput");
    els.close = $("searchClose");
    els.results = $("searchResults");
    els.meta = $("searchMeta");
    if (!els.overlay || !els.input || !els.results) return;

    var searchBtn = $("searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", open);

    els.close.addEventListener("click", close);
    els.overlay.addEventListener("click", function (e) {
      if (e.target === els.overlay) close();
    });
    els.input.addEventListener("input", function () {
      render(els.input.value);
    });

    // Keyboard: '/' opens (when not already typing), Esc closes.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "/" && !isTyping(e.target)) {
        e.preventDefault();
        open();
      }
    });
  }

  function isTyping(target) {
    if (!target) return false;
    var t = target.tagName;
    return t === "INPUT" || t === "TEXTAREA" || target.isContentEditable;
  }

  function open() {
    if (!els.overlay) return;
    els.overlay.hidden = false;
    document.body.classList.add("search-open");
    // Show the full catalog as a starting point.
    render("");
    setTimeout(function () {
      els.input.focus();
    }, 30);
  }

  function close() {
    if (!els.overlay) return;
    els.overlay.hidden = true;
    document.body.classList.remove("search-open");
    els.input.value = "";
    els.results.innerHTML = "";
    if (els.meta) els.meta.textContent = "";
  }

  /**
   * Arabic-aware, case/region-insensitive filtering across
   * name, category and description.
   */
  function filter(query) {
    var q = query.trim().toLowerCase().replace(/\s+/g, " ");
    var all = window.ShopiProducts ? ShopiProducts.list() : [];
    if (!q) return all;
    return all.filter(function (p) {
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });
  }

  /**
   * Discount chip value (reuses the same math as the product cards).
   */
  function discountOf(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return null;
    return Math.round((1 - p.price / p.oldPrice) * 100);
  }

  function buildRow(p) {
    var li = document.createElement("li");
    li.className = "search-item";

    var thumb = document.createElement("span");
    thumb.className = "search-thumb";
    thumb.style.setProperty("--tint", (p.tint || 180) + "deg");
    var img = document.createElement("img");
    img.className = "search-thumb-img";
    img.src = window.ShopiProducts.resolveImage(p);
    img.alt = p.name;
    img.loading = "lazy";
    img.addEventListener("error", function () {
      if (window.ShopiProducts.onImageError) window.ShopiProducts.onImageError(img);
      else img.style.display = "none";
    });
    thumb.appendChild(img);
    var emoji = document.createElement("span");
    emoji.className = "search-thumb-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = p.emoji || "🛍️";
    thumb.appendChild(emoji);
    li.appendChild(thumb);

    var info = document.createElement("div");
    info.className = "search-info";
    var name = document.createElement("strong");
    name.className = "search-name";
    name.textContent = p.name;
    info.appendChild(name);
    var cat = document.createElement("span");
    cat.className = "search-cat";
    cat.textContent = p.category || "";
    info.appendChild(cat);
    var price = document.createElement("div");
    price.className = "search-price";
    if (p.oldPrice) {
      var old = document.createElement("del");
      old.textContent = p.oldPrice;
      price.appendChild(old);
    }
    var cur = document.createElement("b");
    cur.textContent = p.price + " درهم";
    price.appendChild(cur);
    var disc = discountOf(p);
    if (disc !== null) {
      var pct = document.createElement("span");
      pct.className = "search-pct";
      pct.textContent = "-" + disc + "%";
      price.appendChild(pct);
    }
    info.appendChild(price);
    li.appendChild(info);

    var actions = document.createElement("div");
    actions.className = "search-actions";

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-outline btn-sm";
    addBtn.textContent = "أضف للسلة";
    addBtn.addEventListener("click", function () {
      if (window.ShopiCart) {
        window.ShopiCart.add(p);
        if (window.ShopiCart.pulse) window.ShopiCart.pulse();
      }
      flash(addBtn);
    });
    actions.appendChild(addBtn);

    var orderBtn = document.createElement("button");
    orderBtn.type = "button";
    orderBtn.className = "btn btn-primary btn-sm order-now";
    orderBtn.textContent = "اطلب الآن";
    orderBtn.addEventListener("click", function () {
      var msg = window.ShopiProducts.buildWhatsAppMessage(p);
      window.open(buildWaUrl(msg), "_blank", "noopener");
    });
    actions.appendChild(orderBtn);

    li.appendChild(actions);
    return li;
  }

  function flash(btn) {
    var orig = btn.textContent;
    btn.textContent = "تمت الإضافة ✓";
    btn.classList.add("added");
    setTimeout(function () {
      btn.textContent = orig;
      btn.classList.remove("added");
    }, 1400);
  }

  function render(query) {
    var matches = filter(query);
    els.results.innerHTML = "";

    if (els.meta) {
      els.meta.textContent =
        query.trim() === ""
          ? "كل المنتجات (" + matches.length + ")"
          : "نتائج البحث \u201C" + query.trim() + "\u201D (" + matches.length + ")";
    }

    if (matches.length === 0) {
      var empty = document.createElement("li");
      empty.className = "search-empty";
      var ico = document.createElement("span");
      ico.textContent = "🔍";
      empty.appendChild(ico);
      var t = document.createElement("p");
      t.textContent = "لا توجد نتائج مطابقة لبحثك";
      empty.appendChild(t);
      var s = document.createElement("small");
      s.textContent = "جرب كلمات أخرى مثل: ساعة، سماعات، شاحن";
      empty.appendChild(s);
      els.results.appendChild(empty);
      return;
    }

    matches.forEach(function (p) {
      els.results.appendChild(buildRow(p));
    });
  }

  // Public API
  ShopiSearch.open = open;
  ShopiSearch.close = close;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
