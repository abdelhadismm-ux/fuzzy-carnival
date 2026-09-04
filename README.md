# Baladis.com — متجر Baladis

متجر مغربي اونلاين (بيع عند الاستلام) — صفحة المتجر + صفحة إدارة المنتجات.

## التشغيل محليًا
```bash
npm install   # لا توجد dependencies فعلًا، لكن شغّلها للسلامة
npm start     # يشغّل الخادم على المنفذ 8080
```
- المتجر: `http://localhost:8080`
- لوحة التحكم: `http://localhost:8080/admin.html`

## النشر على Render.com (مجاني)
1. انشر مجلد `shopi` هادا في مستودع GitHub (git init + push).
2. ادخل إلى [render.com](https://render.com) → **New → Web Service**.
3. اربط مستودعك، Render كيقرا `package.json` أوتوماتيكيًا:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Render كيدير ليك `PORT` أوتوماتيكيًا (server.js كيستعملو).
5. بعد الـ deploy → لقتي URL ديال المتجر + `/admin.html` للتحكم.

## ملاحظة على لوحة التحكم
الاحتفاظ ديال التعديلات كيتم بـ `data/products.js` على قرص الخادم.
- علا الفري (free tier) ديرو **يتطلع من عدّت** — يعني تعديلاتك كتبقى حتى يعيد الـ service restart أو redeploy.
- إلا بغيتي الحفظ الدائم، خاصك تزيد قاعدة بيانات صغيرة (مثلا SQLite أو Firebase) — قول ليا ونعدل الرمز.
- مصدر الحقيقة ديال المنتجات هو `data/products.js` — إلا فوق ليك الحاجة رجّع فـ GitHub وredeploy.