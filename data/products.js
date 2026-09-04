/**
 * Shopi — Product Data & Rendering (data/products.js)
 * -----------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for all products. Every system (product cards, cart,
 * search, WhatsApp, checkout order) reads from this one module.
 *
 * PRODUCT SCHEMA (per product):
 *   id          {string}  unique, stable identifier (used by cart & orders)
 *   name        {string}  display name (Arabic)
 *   price       {number}  current price (MAD)
 *   oldPrice    {number|null} strike-through price before discount (null = none)
 *   image       {string}  main image path under assets/images/products/
 *   images      {string[]} gallery of additional photos (empty until real photos)
 *   category    {string}  category label
 *   description {string}  short product description
 *   stock       {number}  available quantity
 *   badge       {string}  optional ribbon text ("" = none)
 *   featured    {boolean} whether it appears in the featured section
 *   + PRESENTATION EXTRAS used to preserve the existing UI (not part of the
 *       required schema): emoji {string}, tint {number}, section {string}
 *       ("featured" | "bestseller"), hot {boolean} (orange badge styling).
 *
 * IMAGE SYSTEM:
 *   Images live in assets/images/products/. Placeholder SVGs are provided now.
 *   To use real photos, drop .jpg/.png files into that folder and either update
 *   `image` (or add them to `images`). The module resolves the first image in
 *   `images`, falling back to `image`. If nothing loads, an emoji placeholder
 *   is shown (no broken-image icon).
 */
window.ShopiProducts = window.ShopiProducts || {};

(function () {
  "use strict";

  var IMG = "assets/images/products/";

  var products = [
    {
        "id": "earbuds-pro",
        "name": "سماعات لاسلكية احترافية",
        "price": 299,
        "oldPrice": 399,
        "image": "assets/images/products/earbuds-pro.svg",
        "images": [],
        "category": "سماعات",
        "description": "عزل ضوضاء + بطارية حتى 30 ساعة",
        "stock": 25,
        "badge": "جديد",
        "featured": true,
        "hot": false,
        "emoji": "🎧",
        "tint": 170,
        "section": "featured"
    },
    {
        "id": "smart-watch-sport",
        "name": "ساعة ذكية رياضية",
        "price": 499,
        "oldPrice": 650,
        "image": "assets/images/products/smart-watch-sport.svg",
        "images": [],
        "category": "ساعات",
        "description": "تتبع اللياقة + استقبال المكالمات",
        "stock": 40,
        "badge": "متوفر الآن",
        "featured": true,
        "hot": true,
        "emoji": "⌚",
        "tint": 200,
        "section": "featured"
    },
    {
        "id": "bluetooth-speaker",
        "name": "مكبر صوت ذكي بلوتوث",
        "price": 349,
        "oldPrice": 410,
        "image": "assets/images/products/bluetooth-speaker.svg",
        "images": [],
        "category": "صوت",
        "description": "صوت محيطي + اتصال بلوتوث سريع",
        "stock": 18,
        "badge": "",
        "featured": true,
        "hot": false,
        "emoji": "🔊",
        "tint": 120,
        "section": "featured"
    },
    {
        "id": "smart-bulb",
        "name": "لمبة ذكية متعددة الألوان",
        "price": 129,
        "oldPrice": 159,
        "image": "assets/images/products/smart-bulb.svg",
        "images": [],
        "category": "إضاءة ذكية",
        "description": "ألوان متعددة + تحكم بالتطبيق",
        "stock": 60,
        "badge": "جديد",
        "featured": true,
        "hot": false,
        "emoji": "💡",
        "tint": 260,
        "section": "featured"
    },
    {
        "id": "beauty-kit",
        "name": "طقم عناية عصرية",
        "price": 199,
        "oldPrice": 285,
        "image": "assets/images/products/beauty-kit.svg",
        "images": [],
        "category": "عناية",
        "description": "مجموعة كاملة لجمالك اليومي",
        "stock": 22,
        "badge": "",
        "featured": true,
        "hot": false,
        "emoji": "💄",
        "tint": 30,
        "section": "featured"
    },
    {
        "id": "fast-charger-65w",
        "name": "شاحن سريع 65 واط",
        "price": 159,
        "oldPrice": 189,
        "image": "assets/images/products/fast-charger-65w.svg",
        "images": [],
        "category": "شواحن",
        "description": "قوة عالية متوافق مع جميع الأجهزة",
        "stock": 55,
        "badge": "",
        "featured": true,
        "hot": false,
        "emoji": "🔌",
        "tint": 330,
        "section": "featured"
    },
    {
        "id": "smart-bundle",
        "name": "حزمة الأجهزة الذكية",
        "price": 799,
        "oldPrice": 1040,
        "image": "assets/images/products/smart-bundle.svg",
        "images": [],
        "category": "حزم",
        "description": "سماعات + ساعة + لمبة",
        "stock": 12,
        "badge": "الأكثر مبيعًا",
        "featured": false,
        "hot": true,
        "emoji": "📦",
        "tint": 210,
        "section": "bestseller"
    },
    {
        "id": "neckband-earbuds",
        "name": "سماعات نكف لاسلكية",
        "price": 349,
        "oldPrice": 450,
        "image": "assets/images/products/neckband-earbuds.svg",
        "images": [],
        "category": "سماعات",
        "description": "صوت نقّي + وقت تشغيل طويل",
        "stock": 30,
        "badge": "",
        "featured": false,
        "hot": false,
        "emoji": "🎵",
        "tint": 90,
        "section": "bestseller"
    },
    {
        "id": "smart-watch-elegant",
        "name": "ساعة ذكية أنيقة",
        "price": 549,
        "oldPrice": 720,
        "image": "assets/images/products/smart-watch-elegant.svg",
        "images": [],
        "category": "ساعات",
        "description": "تصميم عصري + شاشة واضحة",
        "stock": 20,
        "badge": "",
        "featured": false,
        "hot": false,
        "emoji": "⌚",
        "tint": 160,
        "section": "bestseller"
    },
    {
        "id": "magnetic-cable",
        "name": "كابل مغناطيسي سريع الشحن",
        "price": 99,
        "oldPrice": 129,
        "image": "assets/images/products/magnetic-cable.svg",
        "images": [],
        "category": "شواحن",
        "description": "شحن سريع + رأس مغناطيسي متوافق مع كل الهواتف",
        "stock": 50,
        "badge": "جديد",
        "featured": true,
        "hot": false,
        "emoji": "🧲",
        "tint": 220,
        "section": "featured"
    },
    {
        "id": "power-bank",
        "name": "باوربانك لاسلكي 10000mAh",
        "price": 249,
        "oldPrice": 320,
        "image": "assets/images/products/power-bank.svg",
        "images": [],
        "category": "شواحن",
        "description": "شحن سريع لاسلكي + غلاف أنيق",
        "stock": 30,
        "badge": "الأكثر طلبًا",
        "featured": true,
        "hot": true,
        "emoji": "🔋",
        "tint": 140,
        "section": "featured"
    },
    {
        "id": "sleep-headphones",
        "name": "سماعة نوم لاسلكية",
        "price": 199,
        "oldPrice": 259,
        "image": "assets/images/products/sleep-headphones.svg",
        "images": [],
        "category": "سماعات",
        "description": "عصابة نوم رفيعة + بلوتوث + جودة صوت ناعمة",
        "stock": 25,
        "badge": "جديد",
        "featured": true,
        "hot": false,
        "emoji": "😴",
        "tint": 280,
        "section": "featured"
    },
    {
        "id": "led-strip",
        "name": "إضاءة LED ذكية للتلفاز",
        "price": 179,
        "oldPrice": 230,
        "image": "assets/images/products/led-strip.svg",
        "images": [],
        "category": "إضاءة ذكية",
        "description": "إضاءة خلفية متعددة الألوان + تحكم بالريموت",
        "stock": 40,
        "badge": "",
        "featured": true,
        "hot": false,
        "emoji": "🌈",
        "tint": 300,
        "section": "featured"
    },
    {
        "id": "phone-cover",
        "name": "كوفر حماية مضاد للصدمات",
        "price": 79,
        "oldPrice": 99,
        "image": "assets/images/products/phone-cover.svg",
        "images": [],
        "category": "إكسسوارات",
        "description": "حماية قوية + تصميم شفاف أنيق",
        "stock": 80,
        "badge": "",
        "featured": true,
        "hot": false,
        "emoji": "📱",
        "tint": 200,
        "section": "featured"
    },
    {
        "id": "kitchen-tools",
        "name": "طقم أدوات مطبخ عملية",
        "price": 149,
        "oldPrice": 199,
        "image": "assets/images/products/kitchen-tools.svg",
        "images": [],
        "category": "مطبخ",
        "description": "مجموعة أدوات مقاومة للصدأ لكل الطبخ",
        "stock": 35,
        "badge": "جديد",
        "featured": true,
        "hot": false,
        "emoji": "🍳",
        "tint": 25,
        "section": "featured"
    }
];

  /**
   * Guarantee every product has an `images` array (defaults to [image]).
   * Applied so a minimal new product entry still works with the gallery API.
   */
  function normalize(p) {
    if (!Array.isArray(p.images)) p.images = p.image ? [p.image] : [];
    if (!p.images.length && p.image) p.images.push(p.image);
    if (!p.image && p.images.length) p.image = p.images[0];
    else if (!p.image) p.image = "";
    return p;
  }
  products.forEach(normalize);

  /**
   * Resolve the display image: first entry of `images`, else `image`.
   * Returns "" when none exist (caller falls back to emoji).
   */
  function resolveImage(p) {
    if (!p) return "";
    if (p.images && p.images.length) return p.images[0];
    return p.image || "";
  }

  /**
   * Shared image error fallback: hide the <img> so the emoji placeholder
   * underneath becomes visible. Reused by product cards and search thumbnails.
   */
  function onImageError(img) {
    if (img) img.style.display = "none";
  }

  // Discount percentage (whole number) from price/oldPrice.
  function discountOf(p) {
    if (!p.oldPrice || p.oldPrice <= p.price) return null;
    return Math.round((1 - p.price / p.oldPrice) * 100);
  }

  /**
   * Centralized WhatsApp order message built from product data.
   * Used by both the product cards and search so the wording stays consistent.
   */
  function buildWhatsAppMessage(p) {
    var price = p && typeof p.price === "number" ? p.price : "";
    return (
      "السلام عليكم، أريد طلب منتج: *" + (p.name || "") + "*" +
      (price !== "" ? " (بثمن " + price + " درهم)" : "") +
      "\nالدفع عند الاستلام."
    );
  }

  /**
   * Build a single product card element (grid cards).
   */
  function buildCard(p) {
    var card = document.createElement("article");
    card.className = "prod-card";
    card.dataset.id = p.id;
    card.dataset.name = p.name;
    card.dataset.price = p.price;
    card.dataset.old = p.oldPrice || "";

    var media = document.createElement("div");
    media.className = "prod-media";
    media.style.setProperty("--tint", (p.tint != null ? p.tint : 180) + "deg");

    if (p.badge) {
      var badge = document.createElement("span");
      badge.className = "prod-badge" + (p.hot ? " hot" : "");
      badge.textContent = p.badge;
      media.appendChild(badge);
    }

    var disc = discountOf(p);
    if (disc !== null) {
      var discEl = document.createElement("span");
      discEl.className = "prod-disc";
      discEl.textContent = "-" + disc + "%";
      media.appendChild(discEl);
    }

    var img = document.createElement("img");
    img.className = "prod-img";
    img.src = resolveImage(p);
    img.alt = p.name;
    img.loading = "lazy";
    img.addEventListener("error", function () { onImageError(img); });
    media.appendChild(img);

    var emoji = document.createElement("span");
    emoji.className = "prod-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = p.emoji;
    media.appendChild(emoji);

    card.appendChild(media);

    var body = document.createElement("div");
    body.className = "prod-body";

    var h = document.createElement("h3");
    h.className = "prod-title";
    h.textContent = p.name;
    body.appendChild(h);

    var desc = document.createElement("p");
    desc.className = "prod-desc";
    desc.textContent = p.description;
    body.appendChild(desc);

    var price = document.createElement("div");
    price.className = "prod-price";
    if (p.oldPrice) {
      var old = document.createElement("del");
      old.className = "old";
      old.textContent = p.oldPrice;
      price.appendChild(old);
    }
    var cur = document.createElement("b");
    cur.className = "cur";
    cur.textContent = p.price;
    price.appendChild(cur);
    var mad = document.createElement("span");
    mad.className = "mad";
    mad.textContent = "درهم";
    price.appendChild(mad);
    if (disc !== null) {
      var pct = document.createElement("span");
      pct.className = "pct";
      pct.textContent = "-" + disc + "%";
      price.appendChild(pct);
    }
    body.appendChild(price);

    var actions = document.createElement("div");
    actions.className = "prod-actions";
    var orderBtn = document.createElement("button");
    orderBtn.className = "btn btn-primary btn-sm order-now";
    orderBtn.textContent = "اطلب الآن";
    var addBtn = document.createElement("button");
    addBtn.className = "btn btn-outline btn-sm add-cart";
    addBtn.textContent = "أضف للسلة";
    actions.appendChild(orderBtn);
    actions.appendChild(addBtn);
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  /**
   * Render all products into their grid containers (featured / bestseller).
   * Placement is driven by the `section` presentation field (keeps the current
   * two-grid UI); `featured` mirrors which are flagged for the featured view.
   */
  function render() {
    var featured = document.getElementById("featuredGrid");
    var best = document.getElementById("bestGrid");
    var count = 0;
    products.forEach(function (p) {
      var card = buildCard(p);
      if (p.section === "bestseller" && best) {
        best.appendChild(card);
        count++;
      } else if (featured) {
        featured.appendChild(card);
        count++;
      }
    });
    return count;
  }

  // Public API
  ShopiProducts.list = function () {
    return products.slice();
  };
  ShopiProducts.get = function (name) {
    return products.find(function (p) {
      return p.name === name;
    });
  };
  ShopiProducts.byId = function (id) {
    return products.find(function (p) {
      return p.id === id;
    });
  };
  ShopiProducts.resolveImage = resolveImage;
  ShopiProducts.onImageError = onImageError;
  ShopiProducts.buildWhatsAppMessage = buildWhatsAppMessage;
  ShopiProducts.discountOf = discountOf;
  ShopiProducts.render = render;
  ShopiProducts.IMG = IMG;

  // Render immediately: this script loads at the end of <body>, so the grid
  // containers already exist. Cards must be present before script.js binds the
  // order/add-cart handlers.
  render();
})();
