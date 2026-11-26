/* =========================================================
   ИИ-таргетолог — интерактивность сайта
   Обычно этот файл менять не нужно.
   ========================================================= */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Шапка при прокрутке ---------- */
  var header = document.getElementById("header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("no-scroll", open);
  }
  burger.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Появление блоков при прокрутке ---------- */
  var reveals = document.querySelectorAll(".reveal");
  // Небольшая задержка для соседних элементов, чтобы они появлялись «волной»
  var groups = new Map();
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var i = groups.get(parent) || 0;
    el.style.setProperty("--d", Math.min(i * 0.08, 0.48) + "s");
    groups.set(parent, i + 1);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Подсветка карточек за курсором ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Аккордеоны: программа (можно открыть несколько) и FAQ (один) ---------- */
  function setupAccordion(itemSelector, headSelector, single) {
    var items = document.querySelectorAll(itemSelector);
    items.forEach(function (item) {
      var head = item.querySelector(headSelector);
      head.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        if (single) {
          items.forEach(function (other) {
            other.classList.remove("is-open");
            other.querySelector(headSelector).setAttribute("aria-expanded", "false");
          });
        }
        item.classList.toggle("is-open", willOpen);
        head.setAttribute("aria-expanded", String(willOpen));
      });
    });
  }
  setupAccordion(".module", ".module__head", false);
  setupAccordion(".faq__item", ".faq__q", true);

  // Первый модуль программы открыт по умолчанию
  var firstModule = document.querySelector(".module");
  if (firstModule) {
    firstModule.classList.add("is-open");
    firstModule.querySelector(".module__head").setAttribute("aria-expanded", "true");
  }

  /* ---------- Эффект печати в «консоли» на первом экране ---------- */
  var typing = document.getElementById("typing");
  var phrases = [
    "Нашёл 3 объявления с CTR ниже среднего. Предлагаю отключить их и перераспределить бюджет.",
    "Готовлю ежедневный отчёт по Meta Ads, TikTok Ads и Google Ads…",
    "Сгенерировал 5 идей для креативов на основе брифа клиента."
  ];
  if (typing) {
    if (reduceMotion) {
      typing.textContent = phrases[0];
    } else {
      var p = 0, c = 0, deleting = false;
      (function tick() {
        var text = phrases[p];
        if (!deleting) {
          c++;
          typing.textContent = text.slice(0, c);
          if (c === text.length) { deleting = true; return setTimeout(tick, 2600); }
          return setTimeout(tick, 28);
        }
        c -= 3;
        if (c <= 0) { c = 0; deleting = false; p = (p + 1) % phrases.length; }
        typing.textContent = text.slice(0, c);
        setTimeout(tick, deleting ? 12 : 400);
      })();
    }
  }

  /* ---------- Окно записи ---------- */
  var modal = document.getElementById("modal");
  var form = document.getElementById("enroll-form");
  var formWrap = document.getElementById("modal-form-wrap");
  var success = document.getElementById("modal-success");
  var errorBox = document.getElementById("form-error");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    formWrap.hidden = false;
    success.hidden = true;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    setTimeout(function () { var f = form.querySelector("input"); if (f) f.focus(); }, 60);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-enroll]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (config.enrollLink) { window.open(config.enrollLink, "_blank", "noopener"); return; }
      openModal();
    });
  });
  modal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!modal.hidden) closeModal();
      if (nav.classList.contains("is-open")) setMenu(false);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name;
    var phone = form.elements.phone;
    var social = form.elements.social;
    var errors = [];

    [name, phone].forEach(function (f) { f.classList.remove("is-invalid"); });
    if (name.value.trim().length < 2) { errors.push("Укажите имя"); name.classList.add("is-invalid"); }
    if (phone.value.replace(/\D/g, "").length < 10) { errors.push("Укажите корректный номер телефона"); phone.classList.add("is-invalid"); }

    if (errors.length) { errorBox.textContent = errors.join(". ") + "."; return; }
    errorBox.textContent = "";

    if (config.whatsappNumber) {
      var msg = "Здравствуйте! Хочу записаться на курс " + (config.courseName || "") +
        " (" + (config.price || "") + ").\nИмя: " + name.value.trim() +
        "\nТелефон: " + phone.value.trim() +
        (social.value.trim() ? "\nКонтакт: " + social.value.trim() : "");
      window.open("https://wa.me/" + config.whatsappNumber.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    }
    // Демо-режим: данные никуда не отправляются
    form.reset();
    formWrap.hidden = true;
    success.hidden = false;
  });

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
