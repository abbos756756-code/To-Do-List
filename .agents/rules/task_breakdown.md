# 📐 Vazifalarni Texnologiyalar va Tillar Bo'yicha Maydalab Berish Qoidasi (Architecture & Language Breakdown Rule)

Har qanday yangi vazifa kiritilganda, uni amalga oshirishdan oldin yoki tushuntirish davomida **har bir dasturlash tili va texnologiyani alohida ajratib**, quyidagi qat'iy formatda detallari bilan tayyorlab beriladi:

---

### 1. 🦴 HTML (Markup & Semantika)
- **Vazifasi**: Sahifaning suyagi, tuzilishi va qaysi elementlar qayerda turishini belgilash.
- **Detallari**:
  - Kerakli semantik teglar (`<header>`, `<main>`, `<dialog>`, `<form>`, `<section>`);
  - Kiritish maydonlari (`<input>`, `<select>`, `<button>`);
  - Elementlarning unikal `id`, `class` va `data-*` atributlari;
  - Accessibility (`aria-label`, `role`).

### 2. 🎨 CSS (Stil, Dizayn va Animatsiyalar)
- **Vazifasi**: Foydalanuvchi ko'radigan vizual qiyofa, ranglar palitrasi, joylashuv va animatsiyalar.
- **Detallari**:
  - `:root` o'zgaruvchilari (ranglar, gradientlar, radiuslar, soyalar);
  - Joylashuv qoidalari (Flexbox, CSS Grid);
  - Mikro-animatsiyalar va o'tishlar (`@keyframes`, `transition`, hover/active);
  - Moslashuvchanlik (`@media screen and (max-width: ...)`).

### 3. ⚡ JavaScript / TypeScript (Front-End Mantig'i)
- **Vazifasi**: Sahifadagi jonlilik, foydalanuvchi harakatlarini boshqarish va brauzer imkoniyatlaridan foydalanish.
- **Detallari**:
  - Dastur holati (`State`: o'zgaruvchilar, massivlar va ob'ektlar tuzilishi);
  - DOM hodisalari (`addEventListener`, Event Delegation);
  - Brauzer API lari (`localStorage`, `Web Audio API`, `Notification API`, `fetch`);
  - Algoritmlar, CRUD amallari va funksiyalar ro'yxati.

### 4. 🗄️ BackEnd (Server Tili: Node.js / Python / PHP / Java / Go)
- **Vazifasi**: Ma'lumotlarni xavfsiz saqlash, biznes mantig'i, server hisob-kitoblari va API yaratish.
- **Detallari**:
  - **Dasturlash tili va framework** (masalan: Node.js + Express, Python + FastAPI/Django);
  - **API Endpointlar** (URL yo'llari: `GET`, `POST`, `PUT`, `DELETE`);
  - **Validatsiya va Sanitizatsiya** (xakerlik hujumlaridan himoya);
  - **Autentifikatsiya** (JWT tokenlar, sessiyalar, parollarni xeshlash).

### 5. 💾 Ma'lumotlar Bazasi (SQL / PostgreSQL / MySQL yoki NoSQL / MongoDB)
- **Vazifasi**: Ma'lumotlarni doimiy, strukturalangan va tezkor saqlash.
- **Detallari**:
  - Jadvallar yoki Kolleksiyalar sxemasi (Sxema dizayni);
  - Maydonlar turlari (`id`, `title`, `created_at`, `status`, bog'lanishlar — Foreign Keys);
  - Asosiy so'rovlar (SQL CRUD so'rovlari).

### 6. 🛠️ Boshqalar (DevOps, Git, Testlash va Xavfsizlik)
- Git commitlar va GitHub repozitoriya boshqaruvi;
- Xavfsizlik qoidalari (CORS, Environment variables `.env`);
- Qadamma-qadam integratsiya qilish rejasi.
