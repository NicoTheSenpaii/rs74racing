/* RS74 — Women Race & Drivers Circle — interactions */
(function () {
  "use strict";

  /* ---------- Preloader: F1 start lights ---------- */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    if (sessionStorage.getItem("rs74-loaded")) {
      preloader.classList.add("done");
    } else {
      const lights = preloader.querySelectorAll(".startlights span");
      let i = 0;
      const step = setInterval(() => {
        if (i < lights.length) {
          lights[i].classList.add("red");
          i++;
        } else {
          clearInterval(step);
          lights.forEach((l) => {
            l.classList.remove("red");
            l.classList.add("green");
          });
          setTimeout(() => {
            preloader.classList.add("done");
            sessionStorage.setItem("rs74-loaded", "1");
          }, 420);
        }
      }, 210);
    }
  }

  /* ---------- Scroll progress + header state ---------- */
  const rpm = document.getElementById("scrollbar-rpm");
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    const st = window.scrollY;
    if (rpm) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      rpm.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
    }
    if (header) header.classList.toggle("scrolled", st > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("open");
      burger.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      mobileNav.querySelectorAll("a").forEach((a, idx) => {
        a.style.transitionDelay = open ? 0.08 + idx * 0.05 + "s" : "0s";
      });
    });
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        burger.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Seamless ticker marquee ---------- */
  const initTicker = (ticker) => {
    const track = ticker.querySelector(".ticker-track");
    if (!track) return;
    // keep only one original segment as the repeating unit
    const unit = track.querySelector("span");
    if (!unit) return;
    track.innerHTML = "";
    track.appendChild(unit);
    const build = () => {
      if (track._anim) track._anim.cancel();
      track.querySelectorAll("span:not(:first-child)").forEach((s) => s.remove());
      const w = unit.offsetWidth;
      if (!w) return;
      // enough copies to cover viewport + one full loop period
      const copies = Math.max(3, Math.ceil((window.innerWidth + w) / w) + 1);
      for (let i = 0; i < copies; i++) track.appendChild(unit.cloneNode(true));
      track._anim = track.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-" + w + "px)" }],
        { duration: Math.max(12000, w * 18), iterations: Infinity }
      );
    };
    build();
    ticker.addEventListener("mouseenter", () => track._anim && track._anim.pause());
    ticker.addEventListener("mouseleave", () => track._anim && track._anim.play());
    let rto;
    window.addEventListener("resize", () => {
      clearTimeout(rto);
      rto = setTimeout(build, 250);
    });
  };
  const startTickers = () => document.querySelectorAll(".ticker").forEach(initTicker);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startTickers);
  } else {
    window.addEventListener("load", startTickers);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          cio.unobserve(el);
          const target = parseFloat(el.dataset.count);
          const decimals = (el.dataset.count.split(".")[1] || "").length;
          const dur = 1600;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Hero slideshow ---------- */
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    const dotsWrap = document.querySelector(".hero-dots");
    let current = 0;
    let timer;
    const dots = [];
    slides.forEach((_, idx) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (idx + 1));
      if (idx === 0) b.classList.add("active");
      b.addEventListener("click", () => go(idx));
      dotsWrap && dotsWrap.appendChild(b);
      dots.push(b);
    });
    const go = (idx) => {
      slides[current].classList.remove("active");
      dots[current] && dots[current].classList.remove("active");
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current] && dots[current].classList.add("active");
      restart();
    };
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => go(current + 1), 6500);
    };
    restart();
    const prev = document.querySelector(".hero-arrow.prev");
    const next = document.querySelector(".hero-arrow.next");
    prev && prev.addEventListener("click", () => go(current - 1));
    next && next.addEventListener("click", () => go(current + 1));
  }

  /* ---------- Tile tilt ---------- */
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (fine) {
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("mousemove", (e) => {
        const r = tile.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tile.style.transform = "perspective(900px) rotateY(" + x * 6 + "deg) rotateX(" + -y * 6 + "deg)";
      });
      tile.addEventListener("mouseleave", () => {
        tile.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lbItems = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (lbItems.length) {
    const lb = document.createElement("div");
    lb.id = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="Schliessen">✕</button>' +
      '<button class="lb-prev" aria-label="Vorheriges Bild">←</button>' +
      '<img alt="Galeriebild" />' +
      '<button class="lb-next" aria-label="Nächstes Bild">→</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lb);
    const img = lb.querySelector("img");
    const count = lb.querySelector(".lb-count");
    let idx = 0;
    const show = (i) => {
      idx = (i + lbItems.length) % lbItems.length;
      img.src = lbItems[idx].dataset.lightbox;
      count.textContent = String(idx + 1).padStart(2, "0") + " / " + String(lbItems.length).padStart(2, "0");
    };
    const open = (i) => {
      show(i);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };
    lbItems.forEach((el, i) => el.addEventListener("click", () => open(i)));
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
    lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Kontakt form: start-light launch ---------- */
  const form = document.querySelector("form.race-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const lights = form.querySelectorAll(".form-lights span");
      const note = form.querySelector(".form-note");
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      let i = 0;
      const step = setInterval(() => {
        if (i < lights.length) {
          lights[i].classList.add("red");
          i++;
        } else {
          clearInterval(step);
          lights.forEach((l) => {
            l.classList.remove("red");
            l.classList.add("green");
          });
          if (note) note.textContent = "Green Light! Deine Anfrage wird gesendet …";
          const name = encodeURIComponent(form.querySelector("#f-name").value);
          const mail = encodeURIComponent(form.querySelector("#f-email").value);
          const phone = encodeURIComponent(form.querySelector("#f-phone").value);
          const ev = encodeURIComponent(form.querySelector("#f-event").value);
          const body =
            "Name: " + name + "%0D%0AE-Mail: " + mail + "%0D%0AHandynummer: " + phone + "%0D%0AEvent: " + ev;
          setTimeout(() => {
            window.location.href =
              "mailto:stefanie@metropolestate.ch?subject=" +
              encodeURIComponent("Anmeldung – Women Race & Drivers Circle") +
              "&body=" + body;
            btn.disabled = false;
          }, 700);
        }
      }, 180);
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
