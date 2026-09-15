(() => {
  const $ = (s, root = document) => root.querySelector(s);

  /* -----------------------------------------
     MOTION (Anime.js)
     ----------------------------------------- */
  function initMotion() {
    const els = document.querySelectorAll("[data-animate]");
    if (!els.length) return;
    if (!window.anime || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.removeAttribute("data-animate"));
      return;
    }
    const play = (el, delay = 0) => {
      const anim = el.dataset.animate;
      const props = {
        opacity: [0, 1],
        duration: 350,
        easing: "cubicBezier(0, 0, 0.2, 1)",
        delay,
      };
      if (anim === "fade-up") props.translateY = [20, 0];
      if (anim === "scale") props.scale = [0.95, 1];
      if (anim === "slide-left") props.translateX = [-20, 0];
      anime(Object.assign({ targets: el }, props)).finished.then(() => {
        el.style.opacity = "";
        el.style.transform = "";
        el.removeAttribute("data-animate");
      });
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              play(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el, i) => play(el, i * 100));
    }
  }

  /* -----------------------------------------
     EMAIL COPY
     ----------------------------------------- */
  async function copyEmail(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const email = el.dataset.email || el.textContent.trim() || el.dataset.copyEmail;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      const original = el.innerHTML;
      el.innerHTML = "Copied <i class='arrow-check'></i>";
      setTimeout(() => (el.innerHTML = original), 1800);
    } catch (_) {
      window.location.href = `mailto:${email}`;
    }
  }
  document.querySelectorAll("[data-copy-email]").forEach((el) =>
    el.addEventListener("click", copyEmail),
  );

  /* -----------------------------------------
     NAVIGATION
     ----------------------------------------- */
  const toggle = $(".menu-toggle");
  if (toggle)
    toggle.addEventListener("click", () => {
      const nav = $("#site-nav");
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });

  /* -----------------------------------------
     FILTERING (DOM-based)
     ----------------------------------------- */
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get("category");
  const cards = (list) => list.querySelectorAll(".project-card, .article-card");
  const matches = (card, category) =>
    category === "all" ||
    card.dataset.category === category ||
    (card.dataset.tags || "").split(",").includes(category);

  function initFiltering() {
    document.querySelectorAll(".listing").forEach((listing) => {
      const list = listing.querySelector(".project-grid, .article-list");
      const empty = listing.querySelector("#portfolio-empty, #blog-empty");
      if (!list) return;
      const filterLinks = listing.querySelectorAll(".filters a");
      const active = activeCategory || "all";
      let visible = 0;
      cards(list).forEach((card) => {
        const show = matches(card, active);
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
      filterLinks.forEach((a) => {
        if (a.dataset.filter === active) a.classList.add("active");
      });
    });
  }

  /* -----------------------------------------
     LIGHTBOX (gallery, progressive enhancement)
     ----------------------------------------- */
  function initLightbox() {
    const items = document.querySelectorAll("[data-lightbox]");
    if (!items.length || typeof HTMLDialogElement === "undefined") return;
    const dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    const img = document.createElement("img");
    const caption = document.createElement("figcaption");
    const close = document.createElement("button");
    close.className = "lightbox-close";
    close.setAttribute("aria-label", "Close image");
    close.textContent = "Close";
    dialog.append(img, caption, close);
    document.body.append(dialog);

    const open = (el) => {
      img.src = el.currentSrc || el.src;
      img.alt = el.alt || "";
      const fig = el.closest("figure");
      caption.textContent = fig && fig.querySelector("figcaption")
        ? fig.querySelector("figcaption").textContent
        : "";
      if (!dialog.open) dialog.showModal();
    };

    items.forEach((el) =>
      el.addEventListener("click", () => open(el)),
    );
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  /* -----------------------------------------
     BEFORE / AFTER (progressive enhancement)
     ----------------------------------------- */
  function initBeforeAfter() {
    document.querySelectorAll("[data-before-after]").forEach((el) => {
      const range = el.querySelector(".ba-range");
      if (!range) return;
      const split = () =>
        el.style.setProperty("--split", `${range.value}%`);
      split();
      range.addEventListener("input", split);
    });
  }

  /* -----------------------------------------
     INIT
     ----------------------------------------- */
  initMotion();
  initFiltering();
  initLightbox();
  initBeforeAfter();
})();