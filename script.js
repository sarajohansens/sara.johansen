
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const infoBox = document.getElementById("lightbox-info");
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");
  const closeBtn = document.querySelector(".lightbox-close");


  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal-on-load").forEach(el => {
      el.classList.add("is-revealed");
    });
  });


  document.querySelectorAll("a.nav-link").forEach(a => {
    if (a.target === "_blank") return;
    const href = a.getAttribute("href") || "";

    const isInternal = href.startsWith("#") || href.endsWith(".html") || href.startsWith("index") || href.startsWith("posters");
    if (!isInternal) return;

    a.addEventListener("click", (e) => {

      const isAnchorSamePage = href.startsWith("#");
      if (isAnchorSamePage) return;

      e.preventDefault();
      document.body.classList.add("page-leave");

      setTimeout(() => {
        window.location.href = href;
      }, 180);
    });
  });

  // --- BLUR-UP LAZYBILDER ---
  document.querySelectorAll(".gallery-image img[loading='lazy']").forEach(img => {
    const done = () => img.classList.add("is-loaded");
    if (img.complete) done();
    else img.addEventListener("load", done, { once: true });
  });


  if (lightbox && lightboxImg && infoBox && items.length) {
    let currentIndex = -1;
    let lastFocused = null;

    function buildHtmlFromItem(item) {
      const mainEl = item.querySelector(".gallery-main");
      const sizeEl = item.querySelector(".gallery-size");
      const soldEl = item.querySelector(".sold-badge");
      const ctaEl = item.querySelector(".lb-cta");

      if (ctaEl) {
        const title = mainEl ? mainEl.textContent : "Poster";
        return `
          <div class="lb-title">${title}</div>
          <a class="lb-cta" href="${ctaEl.getAttribute("href")}" target="_blank" rel="noopener">
            Köp som poster via Printler
          </a>`;
      }

      const title = mainEl ? mainEl.textContent : "";
      const size = sizeEl ? sizeEl.textContent : "";
      const sold = soldEl ? `<div class="lb-sold">${soldEl.textContent}</div>` : "";
      return `
        <div class="lb-title">${title}</div>
        <div class="lb-size">${size}</div>
        ${sold}`;
    }

    function setLightboxContent(index, animate = true) {
      const item = items[index];
      if (!item) return;

      const img = item.querySelector("img");
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "";

      infoBox.innerHTML = buildHtmlFromItem(item);

      if (animate) {
        lightboxImg.classList.remove("slide-change");
        void lightboxImg.offsetWidth;
        lightboxImg.classList.add("slide-change");
      }

      // Preloada grannar
      const preload = (idx) => {
        const it = items[idx];
        if (!it) return;
        const im = it.querySelector("img");
        const p = new Image();
        p.src = im.currentSrc || im.src;
      };
      preload((index + 1) % items.length);
      preload((index - 1 + items.length) % items.length);
    }

    function openLightbox(index) {
      if (index < 0 || index >= items.length) return;
      lastFocused = document.activeElement;
      currentIndex = index;

      setLightboxContent(currentIndex);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      lightbox.setAttribute("aria-hidden", "false");
      (closeBtn || nextBtn || prevBtn || lightbox).focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      lightbox.setAttribute("aria-hidden", "true");
      currentIndex = -1;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function showRelative(delta) {
      if (currentIndex === -1) return;
      currentIndex = (currentIndex + delta + items.length) % items.length;
      setLightboxContent(currentIndex);
    }

    items.forEach((item, index) => {
      item.addEventListener("click", () => openLightbox(index));
      item.setAttribute("tabindex", "0");
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showRelative(-1); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showRelative(1); });
    if (closeBtn) closeBtn.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") showRelative(1);
      else if (e.key === "ArrowLeft") showRelative(-1);
    });

    document.addEventListener("focusin", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (!lightbox.contains(e.target)) {
        (closeBtn || nextBtn || prevBtn || lightbox).focus();
      }
    });
  }


  const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
  if (filterBtns.length && items.length) {

    const isSold = (item) => !!item.querySelector(".sold-badge");

    function applyFilter(mode) {
      items.forEach(item => {
        const sold = isSold(item);
        let show = true;
        if (mode === "till-salu") show = !sold;
        else if (mode === "sålda") show = sold;
        item.classList.toggle("is-hidden", !show);
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-pressed","false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed","true");
        applyFilter(btn.dataset.filter);
      });
    });
  }
});
