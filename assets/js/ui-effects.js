(async () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ready = () => {
    document.body.classList.add("is-ready");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }

  // Inject any [data-include] partials before wiring observers and listeners,
  // so injected content (e.g. the shared footer) is picked up by downstream queries.
  const includeEls = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(includeEls.map(async (el) => {
    try {
      const r = await fetch(el.getAttribute('data-include'));
      if (!r.ok) return;
      const html = await r.text();
      const tmp = document.createElement('template');
      tmp.innerHTML = html.trim();
      el.replaceWith(tmp.content);
    } catch (_) {
      // swallow — page still functions without the partial
    }
  }));

  const revealTargets = Array.from(
    document.querySelectorAll(
      ".panel, .card, .preview-card, .profile-card-compact, .software-card"
    )
  );

  revealTargets.forEach((el) => el.classList.add("reveal-item"));

  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  // Pause SVG animations when hero is off-screen to save CPU
  const heroSvg = document.querySelector("svg.hero-diagram");
  if (heroSvg && "IntersectionObserver" in window) {
    const svgObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          heroSvg.unpauseAnimations();
        } else {
          heroSvg.pauseAnimations();
        }
      },
      { threshold: 0 }
    );
    svgObserver.observe(heroSvg);
  }

  const transitionDurationMs = 160;
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    const href = anchor.getAttribute("href") || "";
    if (!href || href.startsWith("#")) {
      return;
    }
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
      return;
    }

    const url = new URL(href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isInternalPage = isSameOrigin && /\.html$/.test(url.pathname);
    if (!isInternalPage) {
      return;
    }

    if (reduceMotion) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.assign(url.href);
    }, transitionDurationMs);
  });
})();
