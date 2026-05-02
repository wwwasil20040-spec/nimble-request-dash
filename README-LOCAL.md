# 🚀 موقع الأصيل — تشغيل محلي ورفع للإنتاج

## 📋 المتطلبات
- [Node.js 20+](https://nodejs.org/) أو [Bun](https://bun.sh/) (موصى به)
- محرر أكواد (VS Code مثلاً)

---

## 💻 التشغيل على اللابتوب (محلياً)

### 1. فك ضغط الملف ثم افتح المجلد في الترمنال:
```bash
cd asil-site
```

### 2. تثبيت الحزم:
```bash
# باستخدام Bun (الأسرع)
bun install

# أو باستخدام npm
npm install
```

### 3. ملف البيئة `.env` موجود مسبقاً ومُعدّ مع Lovable Cloud:
```
VITE_SUPABASE_URL=https://xlxskfxbeounpzocjykg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=xlxskfxbeounpzocjykg
```
✅ لا تحتاج لتعديله — قاعدة البيانات والتخزين والمصادقة كلها جاهزة.

### 4. شغّل خادم التطوير:
```bash
bun run dev
# أو
npm run dev
```
افتح: **http://localhost:8080**

---

## 🌐 بناء نسخة الإنتاج (للرفع)

```bash
bun run build
```
سينتج مجلد `dist/` يحتوي على الملفات الجاهزة للرفع.

---

## ☁️ خيارات الرفع

### الخيار 1️⃣ — النشر من Lovable (الأسهل والأفضل ✅)
- اضغط زر **Publish** في Lovable
- يدعم SSR + SEO تلقائياً
- مجاني ويشمل دومين فرعي `.lovable.app`

### الخيار 2️⃣ — Cloudflare Pages (موصى به للدومين الخاص)
المشروع مبني على TanStack Start مع Cloudflare Workers.
1. ادفع الكود لـ GitHub
2. Cloudflare Dashboard → Pages → Connect repo
3. Build command: `bun run build`
4. Output: `dist`
5. أضف متغيرات البيئة من `.env`

### الخيار 3️⃣ — Netlify (SPA fallback)
ملف `netlify.toml` جاهز.
- Build: `bun install && bun run build`
- Publish dir: `dist/client`
- ⚠️ بعض ميزات SSR/SEO قد لا تعمل بكفاءة

### الخيار 4️⃣ — Vercel
- استورد المشروع
- يكتشف Vite تلقائياً
- أضف متغيرات `.env`

---

## 🔐 لوحة المشرفين
- الرابط: `/admin`
- سجّل أول حساب من `/auth` ثم أعطه دور `admin` من قاعدة البيانات (جدول `user_roles`).

## 📂 الميزات الجاهزة
- ✅ نظام طلبات الخدمات مع تتبع
- ✅ لوحة مشرفين كاملة
- ✅ إدارة الأعمال السابقة (PDF)
- ✅ نظام مصادقة آمن
- ✅ تخزين سحابي للملفات
- ✅ تصميم متجاوب RTL

## ❓ مشاكل شائعة
- **Port 8080 مشغول**: غيّر المنفذ من `vite.config.ts`
- **خطأ في الحزم**: احذف `node_modules` و `bun.lockb` ثم أعد `bun install`
- **خطأ في قاعدة البيانات**: تأكد من ملف `.env`
