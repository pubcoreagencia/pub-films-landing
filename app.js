(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const preloadTime = document.getElementById("preloadTime");
  const heroTime = document.getElementById("heroTime");
  const scrollProgress = document.querySelector(".scroll-progress");
  const cursor = document.querySelector(".focus-cursor");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("siteNav");
  const modal = document.querySelector(".project-modal");
  const modalTitle = document.getElementById("modalTitle");
  const closeModalButtons = document.querySelectorAll("[data-close-modal]");
  const projectButtons = document.querySelectorAll(".project-frame");
  const magneticItems = document.querySelectorAll(".magnetic");
  let lastFocused = null;
  let frameCount = 0;

  function formatTime(frame) {
    const totalFrames = frame % (60 * 60 * 24);
    const seconds = Math.floor(totalFrames / 24);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = seconds % 60;
    const remainingFrames = totalFrames % 24;
    return [
      String(hours).padStart(2, "0"),
      String(minutes % 60).padStart(2, "0"),
      String(remainingSeconds).padStart(2, "0"),
      String(remainingFrames).padStart(2, "0")
    ].join(":");
  }

  function updateTimecode() {
    frameCount += 1;
    if (preloadTime) preloadTime.textContent = formatTime(frameCount * 8);
    if (heroTime) heroTime.textContent = formatTime(frameCount);
    if (!reducedMotion) requestAnimationFrame(updateTimecode);
  }

  updateTimecode();

  window.addEventListener("load", () => {
    window.setTimeout(() => body.classList.add("is-loaded"), reducedMotion ? 0 : 1150);
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
  }

  function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max <= 0 ? 0 : Math.min(window.scrollY / max, 1);
    document.documentElement.style.setProperty("--scroll-progress", String(Math.round(progress * 100)));
    if (scrollProgress) {
      scrollProgress.style.height = `${progress * 100}%`;
    }
  }

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  if (cursor && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      cursor.classList.add("is-visible");
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    });

    document.querySelectorAll("a, button, .take-card").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
      element.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
    });
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  magneticItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate3d(${x * 0.08}px, ${y * 0.12}px, 0)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });

  function openModal(title, trigger) {
    if (!modal || !modalTitle) return;
    lastFocused = trigger;
    modalTitle.textContent = title;
    modal.hidden = false;
    body.classList.add("modal-open");
    const closeButton = modal.querySelector(".project-modal__close");
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  projectButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.project || "Projeto", button));
  });

  closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (body.classList.contains("nav-open")) {
        body.classList.remove("nav-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
      if (!modal?.hidden) closeModal();
    }
  });

  function initLensCanvas() {
    const canvas = document.getElementById("lensCanvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let time = 0;

    function resizeCanvas() {
      const size = 900;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.floor(size * ratio);
      canvas.height = Math.floor(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw() {
      const size = 900;
      const center = size / 2;
      const xOffset = pointerX * 24;
      const yOffset = pointerY * 24;
      time += reducedMotion ? 0 : 0.006;

      context.clearRect(0, 0, size, size);

      const glow = context.createRadialGradient(center + xOffset, center + yOffset, 20, center, center, 390);
      glow.addColorStop(0, "rgba(255,255,255,0.16)");
      glow.addColorStop(0.22, "rgba(225,6,19,0.18)");
      glow.addColorStop(0.72, "rgba(20,20,24,0.32)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);

      context.save();
      context.translate(center + xOffset, center + yOffset);
      context.rotate(time);

      for (let i = 0; i < 8; i += 1) {
        context.rotate((Math.PI * 2) / 8);
        context.beginPath();
        context.moveTo(56, -12);
        context.lineTo(250, -58);
        context.lineTo(326, 34);
        context.lineTo(90, 46);
        context.closePath();
        context.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(225,6,19,0.07)";
        context.fill();
        context.strokeStyle = "rgba(255,255,255,0.11)";
        context.stroke();
      }

      context.restore();

      context.save();
      context.translate(center + xOffset * 0.45, center + yOffset * 0.45);
      for (let radius = 128; radius <= 330; radius += 48) {
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.strokeStyle = radius === 272 ? "rgba(225,6,19,0.42)" : "rgba(255,255,255,0.15)";
        context.lineWidth = radius === 272 ? 2 : 1;
        context.stroke();
      }

      for (let i = 0; i < 36; i += 1) {
        const angle = (Math.PI * 2 * i) / 36 + time * 0.4;
        const inner = 358;
        const outer = i % 3 === 0 ? 384 : 374;
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.strokeStyle = i % 3 === 0 ? "rgba(225,6,19,0.58)" : "rgba(255,255,255,0.14)";
        context.stroke();
      }

      context.beginPath();
      context.arc(0, 0, 78, 0, Math.PI * 2);
      context.fillStyle = "rgba(5,5,6,0.86)";
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.34)";
      context.stroke();

      context.beginPath();
      context.arc(0, 0, 24, 0, Math.PI * 2);
      context.fillStyle = "rgba(225,6,19,0.86)";
      context.fill();
      context.restore();

      if (!reducedMotion) {
        pointerX += (targetX - pointerX) * 0.06;
        pointerY += (targetY - pointerY) * 0.06;
        requestAnimationFrame(draw);
      }
    }

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
    });

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    draw();
  }

  initLensCanvas();
})();
