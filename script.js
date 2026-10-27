// Tungi / kunduzgi rejim
// Bu qism sahifa chizilishidan oldin ishlaydi, shuning uchun ekran "miltillamaydi"
const root = document.documentElement;

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}

function saveTheme(theme) {
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

applyTheme(getSavedTheme() || "light");

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Element ekranga chiqqanda bir marta chaqiriladi
function onVisible(el, fn, threshold = 0.25) {
  if (!el) return;
  if (!("IntersectionObserver" in window)) { fn(); return; }
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { threshold });
  io.observe(el);
}

// Sonni silliq o'zgartirish
function animateNumber(el, to, duration = 900, format = n => Math.round(n)) {
  const from = parseFloat(el.dataset.current || 0);
  el.dataset.current = to;
  if (reduceMotion) { el.textContent = format(to); return; }
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const formatThousands = n => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ");

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle");
  applyTheme(root.getAttribute("data-theme"));
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
    btn.classList.remove("spin");
    void btn.offsetWidth;
    btn.classList.add("spin");
  });

  document.getElementById("yearNow").textContent = new Date().getFullYear();

  initTyped();
  initCounters();
  initGroups();
  initReveal();
  initPathCards();
  initChart();
  initCompare();
  initCalc();
  initQuiz();
  initTimeline();
  initGallery();
  initScroll();
});

// Sarlavhadagi so'zni almashtirib yozish effekti
function initTyped() {
  const el = document.getElementById("typed");
  const words = [
    { text: "bilim", color: "var(--primary)" },
    { text: "stipendiya", color: "var(--accent)" },
    { text: "tanish-bilish", color: "var(--red)" }
  ];
  if (reduceMotion) return;
  let w = 0, i = words[0].text.length, deleting = true;
  function tick() {
    const word = words[w].text;
    if (deleting) {
      i--;
      el.textContent = word.slice(0, i);
      if (i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        el.style.color = words[w].color;
      }
      setTimeout(tick, 55);
    } else {
      const next = words[w].text;
      i++;
      el.textContent = next.slice(0, i);
      if (i === next.length) { deleting = true; setTimeout(tick, 2200); }
      else setTimeout(tick, 95);
    }
  }
  setTimeout(tick, 2200);
}

function initCounters() {
  document.querySelectorAll("[data-count]").forEach(el => {
    onVisible(el, () => animateNumber(el, +el.dataset.count, 1200));
  });
}

// Lenta uzluksiz aylanishi uchun guruhlar nusxalanadi
function initGroups() {
  const track = document.getElementById("groupsTrack");
  const items = track.innerHTML;
  track.innerHTML = items + items + items + items;
}

function initReveal() {
  const items = document.querySelectorAll(".hero-grid > div, .section-head, .path-card, .chart-card, .compare, .calc, .quiz, .timeline > li, .g-item, .contact-box");
  if (!("IntersectionObserver" in window) || reduceMotion) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  items.forEach(el => {
    // Yonma-yon elementlar birin-ketin chiqadi
    const index = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--d", Math.min(index, 4) * 0.12 + "s");
    el.classList.add("reveal");
    observer.observe(el);
  });
}

function initPathCards() {
  const grid = document.querySelector(".paths-grid");
  onVisible(grid, () => grid.classList.add("in"));
  grid.querySelectorAll(".path-card").forEach(card => {
    const toggle = () => card.classList.toggle("flipped");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

// 10 yillik grafik: taxminiy model
const model = {
  k: t => 5 + 91 * Math.pow(t / 10, 0.95),
  s: t => 5 + 70 * (1 - Math.exp(-t / 3.2)),
  t: t => 5 + 38 * (1 - Math.exp(-t / 0.7)) - 2.6 * Math.max(0, t - 2.5)
};

function initChart() {
  const X0 = 50, X1 = 620, Y0 = 260, Y1 = 20;
  const sx = t => X0 + (X1 - X0) * t / 10;
  const sy = v => Y0 - (Y0 - Y1) * v / 100;
  const ns = "http://www.w3.org/2000/svg";

  const grid = document.getElementById("chartGrid");
  [0, 25, 50, 75, 100].forEach(v => {
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", X0); line.setAttribute("x2", X1);
    line.setAttribute("y1", sy(v)); line.setAttribute("y2", sy(v));
    grid.appendChild(line);
    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", X0 - 10); text.setAttribute("y", sy(v) + 5);
    text.setAttribute("text-anchor", "end");
    text.textContent = v;
    grid.appendChild(text);
  });
  for (let t = 0; t <= 10; t += 2) {
    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", sx(t)); text.setAttribute("y", Y0 + 28);
    text.setAttribute("text-anchor", "middle");
    text.textContent = t === 0 ? "1-kurs" : t === 4 ? "Bitirish" : t + "-yil";
    grid.appendChild(text);
  }

  const lines = {};
  Object.keys(model).forEach(key => {
    const path = document.getElementById("line" + key.toUpperCase());
    let d = "";
    for (let i = 0; i <= 100; i++) {
      const t = i / 10;
      d += (i ? "L" : "M") + sx(t).toFixed(1) + " " + sy(model[key](t)).toFixed(1);
    }
    path.setAttribute("d", d);
    // Chiziq chizilish animatsiyasi uchun tayyorlash
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = reduceMotion ? 0 : len;
    lines[key] = path;
  });

  const slider = document.getElementById("year");
  const cursor = document.getElementById("cursorLine");
  const label = document.getElementById("yearLabel");
  const hint = document.getElementById("yearHint");
  const $ = id => document.getElementById(id);
  const pts = { k: $("ptK"), s: $("ptS"), t: $("ptT") };
  const vals = { k: $("vK"), s: $("vS"), t: $("vT") };

  function update() {
    const t = +slider.value;
    cursor.setAttribute("x1", sx(t)); cursor.setAttribute("x2", sx(t));
    label.textContent = t.toFixed(1).replace(".0", "");
    if (t === 0) hint.textContent = "— hamma bir nuqtadan boshlaydi";
    else if (t < 4) hint.textContent = "— hali talabalik yillari";
    else if (t < 4.5) hint.textContent = "— universitetni bitirgan payt";
    else hint.textContent = "— bitirgandan keyin " + Math.round(t - 4) + " yil";

    let best = "k";
    Object.keys(model).forEach(key => {
      const v = model[key](t);
      pts[key].setAttribute("cx", sx(t));
      pts[key].setAttribute("cy", sy(v));
      vals[key].textContent = Math.round(v);
      if (v > model[best](t)) best = key;
    });
    Object.keys(pts).forEach(key => pts[key].setAttribute("r", key === best ? 9 : 6));
  }
  slider.addEventListener("input", update);
  update();

  onVisible(document.getElementById("chart"), () => {
    Object.values(lines).forEach((path, i) => {
      path.style.transition = `stroke-dashoffset 1.8s cubic-bezier(.4, 0, .2, 1) ${i * 0.25}s`;
      path.style.strokeDashoffset = 0;
    });
    // Slayder o'zi bir marta 0 dan 10 gacha yurib chiqadi
    if (reduceMotion) return;
    const start = performance.now() + 600;
    function run(now) {
      const p = Math.max(0, Math.min((now - start) / 2600, 1));
      slider.value = (10 * (1 - Math.pow(1 - p, 2))).toFixed(1);
      update();
      if (p < 1) requestAnimationFrame(run);
    }
    requestAnimationFrame(run);
  }, 0.4);
}

function initCompare() {
  const el = document.querySelector(".compare");
  onVisible(el, () => el.classList.add("in"));
}

// 4 yilda yig'iladigan soatlar
function initCalc() {
  const input = document.getElementById("hours");
  const label = document.getElementById("hoursLabel");
  const total = document.getElementById("totalHours");
  const bar = document.getElementById("levelBar");
  const text = document.getElementById("levelText");
  const levels = [
    [1, "Faqat darsga tayanib qolasiz — bu yetarli emas. 😐"],
    [1000, "Boshlang'ich daraja — asoslarni bilasiz."],
    [2500, "Junior darajaga yaqin — birinchi amaliyotga tayyor."],
    [5000, "Junior mutaxassis — birinchi ishga tayyor. 💼"],
    [10000, "Kuchli mutaxassis — raqobatda oldindasiz. 🚀"],
    [Infinity, "Ekspert darajasi — 10 000 soat qoidasi bajarildi! 🏆"]
  ];
  function update() {
    const h = +input.value;
    const sum = h * 365 * 4;
    label.textContent = String(h).replace(".", ",");
    animateNumber(total, sum, 500, formatThousands);
    bar.style.width = Math.min(sum / 10000, 1) * 100 + "%";
    text.textContent = levels.find(([max]) => sum < max)[1];
  }
  input.addEventListener("input", update);
  onVisible(input, update);
}

// Mini test
const questions = [
  {
    q: "Universitetga nima uchun keldingiz?",
    a: [["Kasbimni chuqur o'rganish uchun", "k"], ["Yaxshi o'qib, stipendiya va imkoniyatlar olish uchun", "s"], ["Diplom kerak, ishni keyin tanishlar orqali topaman", "t"]]
  },
  {
    q: "Darsdan keyingi bo'sh vaqtingiz qanday o'tadi?",
    a: [["Qo'shimcha kurs, kitob yoki o'z loyiham", "k"], ["Uy vazifalari va imtihonlarga tayyorgarlik", "s"], ["Dam olish, telefon, do'stlar", "t"]]
  },
  {
    q: "Imtihonda qiyin savol chiqsa nima qilasiz?",
    a: [["Keyin baribir o'zim tushunib olaman", "k"], ["Oldindan yaxshi tayyorlanaman — bunday bo'lmaydi", "s"], ["Kimdandir yordam so'rayman yoki ko'chiraman", "t"]]
  },
  {
    q: "Kelajakda ish topish haqida o'ylasangiz...",
    a: [["Portfolio va ko'nikmalarim o'zi gapiradi", "k"], ["Yuqori GPA va ustozlar tavsiyasi yordam beradi", "s"], ["Qarindosh yoki tanishlar joylashtirib qo'yadi", "t"]]
  },
  {
    q: "Ingliz tili bilan munosabatingiz?",
    a: [["Mustaqil, har kuni o'rganyapman", "k"], ["Fan sifatida a'lo bahoga o'qiyman", "s"], ["Kerak bo'lsa, keyinroq...", "t"]]
  },
  {
    q: "5 yildan keyin o'zingizni qayerda ko'rasiz?",
    a: [["Sohamda kuchli, talab yuqori mutaxassis", "k"], ["Grant bilan magistraturada yoki yaxshi kompaniyada", "s"], ["Qayerda bo'lsa ham, ish bo'lsa bo'ldi", "t"]]
  }
];

const results = {
  k: { emoji: "📚", title: "Siz bilim yo'lidasiz!", text: "Zo'r poydevor. Endi unga stipendiyani qo'shing: yuqori baho + amaliy ko'nikma = eng kuchli kombinatsiya. Har kuni ozgina, lekin to'xtamasdan." },
  s: { emoji: "🏅", title: "Siz stipendiyant yo'lidasiz!", text: "Intizomingiz bor — bu katta kuch. Faqat baho uchun emas, ko'nikma uchun ham o'qing: har semestrda bitta amaliy loyiha qiling." },
  t: { emoji: "⚠️", title: "Ehtiyot bo'ling — mo'rt yo'l", text: "Hozir ko'proq omad va tanishlarga tayanyapsiz. Yaxshi xabar: 1-kurs — o'zgarish uchun eng qulay payt. Bugundan kuniga 1 soat mustaqil o'qishni boshlang." }
};

function initQuiz() {
  const body = document.getElementById("qBody");
  const count = document.getElementById("qCount");
  const bar = document.getElementById("qBar");
  let step = 0;
  let score = { k: 0, s: 0, t: 0 };

  function swap(render) {
    if (reduceMotion) { render(); return; }
    body.classList.add("out");
    setTimeout(() => {
      body.classList.remove("out");
      render();
      // Kirish animatsiyasini qayta ishga tushirish
      body.style.animation = "none";
      void body.offsetWidth;
      body.style.animation = "";
    }, 250);
  }

  function renderQuestion() {
    const item = questions[step];
    count.textContent = `${step + 1} / ${questions.length}`;
    bar.style.width = (step / questions.length) * 100 + "%";
    // Javoblar tartibi aralashtiriladi, toki "birinchisi doim to'g'ri" bo'lmasin
    const answers = [...item.a].sort(() => Math.random() - 0.5);
    body.innerHTML = `<h3>${item.q}</h3><div class="answers">${answers.map(([text, key]) =>
      `<button class="answer" type="button" data-key="${key}">${text}</button>`).join("")}</div>`;
    body.querySelectorAll(".answer").forEach(b => b.addEventListener("click", () => {
      if (body.querySelector(".picked")) return;
      b.classList.add("picked");
      score[b.dataset.key]++;
      step++;
      setTimeout(() => swap(step < questions.length ? renderQuestion : renderResult), 280);
    }));
  }

  function renderResult() {
    count.textContent = "Natija";
    bar.style.width = "100%";
    const best = ["k", "s", "t"].reduce((a, b) => score[b] > score[a] ? b : a);
    const r = results[best];
    const rows = [["k", "📚 Bilim", "var(--primary)"], ["s", "🏅 Stipendiya", "var(--accent)"], ["t", "🤝 Tanish", "var(--red)"]];
    body.innerHTML = `
      <div class="result">
        <div class="r-emoji">${r.emoji}</div>
        <h3>${r.title}</h3>
        <p>${r.text}</p>
        <div class="r-bars">${rows.map(([key, name, color]) => {
          const pct = Math.round(score[key] / questions.length * 100);
          return `<div class="r-bar"><b>${name}</b><div><span style="background:${color}" data-w="${pct}%"></span></div><small>${pct}%</small></div>`;
        }).join("")}</div>
        <button class="btn btn-primary" type="button" id="qRestart">↻ Qaytadan</button>
      </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      body.querySelectorAll(".r-bar span").forEach(s => s.style.width = s.dataset.w);
    }));
    document.getElementById("qRestart").addEventListener("click", () => {
      step = 0;
      score = { k: 0, s: 0, t: 0 };
      swap(renderQuestion);
    });
  }

  renderQuestion();
}

// Reja chizig'i skroll bilan to'lib boradi
function initTimeline() {
  const tl = document.querySelector(".timeline");
  function update() {
    const rect = tl.getBoundingClientRect();
    const p = (innerHeight * 0.65 - rect.top) / rect.height;
    tl.style.setProperty("--fill", Math.max(0, Math.min(p, 1)) * 100 + "%");
  }
  addEventListener("scroll", update, { passive: true });
  update();
}

function initGallery() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  document.querySelectorAll(".g-item").forEach(item => {
    item.addEventListener("click", () => {
      img.src = item.dataset.src;
      img.alt = item.querySelector("img").alt;
      box.hidden = false;
    });
  });
  const close = () => { box.hidden = true; };
  box.addEventListener("click", close);
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
}

// Skroll progress va menyudagi faol bo'lim
function initScroll() {
  const progress = document.getElementById("progress");
  const links = document.querySelectorAll(".nav-links a");
  const sections = [...links].map(link => document.querySelector(link.getAttribute("href")));
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const y = scrollY + 120;
    sections.forEach((section, i) => {
      const active = section.offsetTop <= y && section.offsetTop + section.offsetHeight > y;
      links[i].classList.toggle("active", active);
    });
  }
  addEventListener("scroll", update, { passive: true });
  update();
}
