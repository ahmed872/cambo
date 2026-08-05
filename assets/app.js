/* ═══════════════════════════════════════════════════════════
   دعوة زفاف حسام و حنان — logic
   كل ما قد تحتاج تعديله موجود في CONFIG بالأسفل مباشرة.
   ═══════════════════════════════════════════════════════════ */

const CONFIG = {
  groom: 'حسام',
  bride: 'حنان',
  host:  'كابو',

  /* موعد الحفل — التوقيت المصري (UTC+3 صيفًا) */
  startISO: '2026-08-06T20:00:00+03:00',
  hours:    5,                       // مدة الحفل التقريبية لإضافتها للتقويم

  venue:     'قاعة مريديان',
  venueArea: 'قرية عطاف — مركز المحلة الكبرى، محافظة الغربية',
  /* عبارة البحث في خرائط Google — تفتح القاعة مباشرة على الخريطة */
  mapQuery:  'قاعة مريديان عطاف مركز المحلة الكبرى محافظة الغربية',

  /* اختياري: ضع رقم واتساب لتأكيد الحضور بصيغة دولية بدون + مثل 201012345678
     اتركه فارغًا وسيفتح واتساب ليختار الضيف المرسل إليه بنفسه. */
  whatsapp: '',

  /* صور الألبوم — ضع الصور داخل مجلد photos بهذه الأسماء.
     أي صورة غير موجودة تُتجاهل تلقائيًا، والقسم كله يختفي إن لم توجد صور. */
  photos: [
    'photos/01.jpg', 'photos/02.jpg', 'photos/03.jpg',
    'photos/04.jpg', 'photos/05.jpg', 'photos/06.jpg'
  ]
};

/* ── helpers ─────────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toArabic = n => String(n).replace(/\d/g, d => AR_DIGITS[+d]);
const pad2 = n => String(n).padStart(2, '0');

const EVENT_START = new Date(CONFIG.startISO);
const EVENT_END   = new Date(EVENT_START.getTime() + CONFIG.hours * 3600e3);

const EVENT_TITLE = `حفل زفاف ${CONFIG.groom} و ${CONFIG.bride}`;
const EVENT_PLACE = `${CONFIG.venue} — ${CONFIG.venueArea}`;

const MAPS_PLACE  = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapQuery)}`;
const MAPS_DIR    = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONFIG.mapQuery)}`;
const MAPS_EMBED  = `https://maps.google.com/maps?q=${encodeURIComponent(CONFIG.mapQuery)}&hl=ar&z=14&output=embed`;

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('is-on'), 3200);
}

/* ── 1. Preloader → Cover ────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => $('#preloader').classList.add('is-gone'), 700);
});
// حماية: لو تأخر تحميل مورد خارجي لا نحبس الضيف خلف الشاشة
setTimeout(() => $('#preloader')?.classList.add('is-gone'), 4000);

/* ── 2. فتح الدعوة ───────────────────────────────────────── */
$('#openBtn').addEventListener('click', () => {
  $('#cover').classList.add('is-open');
  document.body.classList.remove('is-locked');
  $('#invite').classList.add('is-shown');
  $('#petals').classList.add('is-on');
  startPetals();
  window.scrollTo({ top: 0, behavior: 'auto' });
});

/* ── 3. العد التنازلي ────────────────────────────────────── */
const cd = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };

function tick() {
  const diff = EVENT_START - Date.now();

  if (diff <= 0) {
    $('#clock').hidden = true;
    $('#clockDone').hidden = false;
    clearInterval(tick._i);
    return;
  }
  const sec = Math.floor(diff / 1000);
  cd.d.textContent = toArabic(pad2(Math.floor(sec / 86400)));
  cd.h.textContent = toArabic(pad2(Math.floor(sec / 3600) % 24));
  cd.m.textContent = toArabic(pad2(Math.floor(sec / 60) % 60));
  cd.s.textContent = toArabic(pad2(sec % 60));
}
tick();
tick._i = setInterval(tick, 1000);

/* ── 4. الخريطة ──────────────────────────────────────────── */
$('#mapOpen').href        = MAPS_PLACE;
$('#mapDirections').href  = MAPS_DIR;

/* بطاقة المكان تظهر أولًا. لا نحمّل الخريطة إلا بعد التأكد من الوصول إلى Google،
   لأن المتصفح يُطلق حدث load حتى على صفحة الخطأ — فيرى الضيف إطارًا مكسورًا.
   وإن تعذّر الاتصال تبقى البطاقة الأنيقة مكانها وتفتح الخريطة عند الضغط. */
const mapFrame = $('#mapFrame');
const mapHolder = $('#mapPlaceholder');

mapHolder.addEventListener('click', () => window.open(MAPS_PLACE, '_blank', 'noopener'));

(function loadMap() {
  const ping = new Image();
  let settled = false;

  const give_up = () => {
    if (settled) return;
    settled = true;
    mapFrame.remove();
    mapHolder.classList.add('is-clickable');
  };

  ping.onload = () => {
    if (settled) return;
    settled = true;
    mapFrame.addEventListener('load', () => { mapHolder.style.display = 'none'; }, { once: true });
    mapFrame.src = MAPS_EMBED;
  };
  ping.onerror = give_up;
  setTimeout(give_up, 5000);

  ping.src = 'https://maps.gstatic.com/favicon.ico?_=' + Date.now();
})();

/* ── 5. التقويم ──────────────────────────────────────────── */
const stampUTC = d =>
  d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()) + 'T' +
  pad2(d.getUTCHours()) + pad2(d.getUTCMinutes()) + pad2(d.getUTCSeconds()) + 'Z';

$('#calGoogle').href =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  `&text=${encodeURIComponent(EVENT_TITLE)}` +
  `&dates=${stampUTC(EVENT_START)}/${stampUTC(EVENT_END)}` +
  `&location=${encodeURIComponent(EVENT_PLACE)}` +
  `&details=${encodeURIComponent(`دعوة من ${CONFIG.host}\n${MAPS_PLACE}`)}`;

$('#calIcs').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding-invite//AR//',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@wedding-invite`,
    `DTSTAMP:${stampUTC(new Date())}`,
    `DTSTART:${stampUTC(EVENT_START)}`,
    `DTEND:${stampUTC(EVENT_END)}`,
    `SUMMARY:${EVENT_TITLE}`,
    `LOCATION:${EVENT_PLACE}`,
    `DESCRIPTION:دعوة من ${CONFIG.host} — ${MAPS_PLACE}`,
    'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY',
    `DESCRIPTION:${EVENT_TITLE}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'wedding-hossam-hanan.ics' });
  a.click();
  URL.revokeObjectURL(url);
  toast('تم تنزيل الموعد — أضِفه إلى تقويمك');
});

/* ── 6. تأكيد الحضور والمشاركة ───────────────────────────── */
const RSVP_TEXT =
  `مبروك! 🎉 سأحضر بإذن الله حفل زفاف ${CONFIG.groom} و ${CONFIG.bride}\n` +
  `الخميس ٦ أغسطس ٢٠٢٦ — ٨:٠٠ مساءً\n${EVENT_PLACE}`;

$('#rsvpYes').href = CONFIG.whatsapp
  ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(RSVP_TEXT)}`
  : `https://wa.me/?text=${encodeURIComponent(RSVP_TEXT)}`;

const SHARE_TEXT =
  `${EVENT_TITLE}\nالخميس ٦ أغسطس ٢٠٢٦ — ٨:٠٠ مساءً\n${EVENT_PLACE}\nالموقع: ${MAPS_PLACE}`;

$('#shareBtn').addEventListener('click', async () => {
  const data = { title: EVENT_TITLE, text: SHARE_TEXT, url: location.href };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(`${SHARE_TEXT}\n${location.href}`);
    toast('تم نسخ الدعوة — ألصقها وأرسلها');
  } catch (_) { /* ألغى المستخدم المشاركة */ }
});

/* ── 7. الألبوم ──────────────────────────────────────────── */
/* نفحص كل صورة أولًا ثم نبنى الشبكة بالترتيب الأصلي،
   وإن لم توجد أى صورة يختفى القسم بالكامل. */
const loaded = [];

const probe = src => new Promise(resolve => {
  const img = new Image();
  img.onload  = () => resolve(src);
  img.onerror = () => resolve(null);
  img.src = src;
});

async function buildGallery() {
  const found = (await Promise.all(CONFIG.photos.map(probe))).filter(Boolean);
  if (!found.length) return;

  const grid = $('#galleryGrid');

  found.forEach((src, i) => {
    loaded.push(src);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery__item reveal';
    btn.setAttribute('aria-label', `عرض الصورة ${toArabic(i + 1)}`);

    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.alt = `صورة من احتفال ${CONFIG.groom} و ${CONFIG.bride}`;

    btn.appendChild(img);
    btn.addEventListener('click', () => openLightbox(i));
    grid.appendChild(btn);
    observer.observe(btn);
  });

  $('#gallery').hidden = false;
}

/* ── 8. Lightbox ─────────────────────────────────────────── */
let lbIndex = 0;
let lbScrollY = 0;
const lb = $('#lightbox');

function openLightbox(i) {
  lbIndex = i;
  $('#lbImg').src = loaded[i];
  lb.hidden = false;
  lbScrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.hidden = true;
  document.body.style.overflow = '';
  window.scrollTo({ top: lbScrollY, behavior: 'auto' });
}
function step(dir) {
  lbIndex = (lbIndex + dir + loaded.length) % loaded.length;
  $('#lbImg').src = loaded[lbIndex];
}

$('#lbClose').addEventListener('click', closeLightbox);
$('#lbPrev').addEventListener('click', () => step(-1));
$('#lbNext').addEventListener('click', () => step(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  step(-1);   // RTL: يمين = السابق
  if (e.key === 'ArrowLeft')   step(1);
});

/* ── 9. الظهور عند التمرير ───────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('is-in');
      observer.unobserve(en.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

$$('.reveal').forEach(el => observer.observe(el));

/* ── 10. تساقط بتلات الورد ───────────────────────────────── */
function startPetals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (startPetals._on) return;
  startPetals._on = true;

  const cv = $('#petals');
  const ctx = cv.getContext('2d');
  const COLORS = ['#f2ddaa', '#e7cf94', '#fff6e2', '#dfe8dd', '#c9a24b'];
  let w, h, petals, dpr;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.width  = innerWidth  * dpr;
    h = cv.height = innerHeight * dpr;
    cv.style.width  = innerWidth  + 'px';
    cv.style.height = innerHeight + 'px';
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  const count = innerWidth < 640 ? 16 : 30;
  const make = (seed = false) => ({
    x: Math.random() * w,
    y: seed ? Math.random() * h : -40 * dpr,
    r: (5 + Math.random() * 7) * dpr,
    sp: (0.35 + Math.random() * 0.75) * dpr,
    sw: 0.6 + Math.random() * 1.6,
    ph: Math.random() * Math.PI * 2,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.02,
    col: COLORS[(Math.random() * COLORS.length) | 0],
    op: 0.35 + Math.random() * 0.45
  });
  petals = Array.from({ length: count }, () => make(true));

  (function frame() {
    ctx.clearRect(0, 0, w, h);
    petals.forEach((p, i) => {
      p.y  += p.sp;
      p.ph += 0.012;
      p.x  += Math.sin(p.ph) * p.sw;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.op;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.y > h + 40 * dpr) petals[i] = make();
    });
    requestAnimationFrame(frame);
  })();
}

/* ── init ────────────────────────────────────────────────── */
buildGallery();
