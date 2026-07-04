(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const scrollProgress = document.querySelector(".scroll-progress");
  const cursor = document.querySelector(".focus-cursor");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("siteNav");
  const magneticItems = document.querySelectorAll(".magnetic");

  window.addEventListener("load", () => {
    window.setTimeout(() => body.classList.add("is-loaded"), reducedMotion ? 0 : 850);
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
    if (scrollProgress) scrollProgress.style.height = `${progress * 100}%`;
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

  function initAmbientVideos() {
    const videos = Array.from(document.querySelectorAll(".ambient-video"));
    if (!videos.length || reducedMotion) return;

    const loadVideo = (video) => {
      if (video.dataset.loaded === "true") return;
      const src = video.dataset.src;
      if (!src) return;
      video.src = src;
      video.dataset.loaded = "true";
      video.addEventListener("canplay", () => video.classList.add("is-ready"), { once: true });
      video.play().catch(() => {});
    };

    if (!("IntersectionObserver" in window)) {
      videos.forEach(loadVideo);
      return;
    }

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            loadVideo(video);
            video.play().catch(() => {});
          } else if (video.dataset.loaded === "true") {
            video.pause();
          }
        });
      },
      { rootMargin: "380px 0px", threshold: 0.01 }
    );

    videos.forEach((video) => videoObserver.observe(video));
  }

  initAmbientVideos();

  async function initFilmOrbit() {
    const canvas = document.getElementById("filmOrbitCanvas");
    const shell = document.querySelector(".film-orbit-shell");
    if (!canvas || !shell || reducedMotion) {
      if (shell) shell.classList.add("is-fallback");
      return;
    }

    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0.28, 7.4);

      const group = new THREE.Group();
      scene.add(group);

      const red = new THREE.Color("#e10613");
      const white = new THREE.Color("#f7f4ef");
      const graphite = new THREE.Color("#151519");
      const glass = new THREE.MeshPhysicalMaterial({
        color: graphite,
        roughness: 0.42,
        metalness: 0.26,
        transmission: 0.18,
        transparent: true,
        opacity: 0.74,
        side: THREE.DoubleSide
      });
      const redMat = new THREE.MeshStandardMaterial({
        color: red,
        roughness: 0.35,
        metalness: 0.35,
        emissive: red,
        emissiveIntensity: 0.18
      });
      const lineMat = new THREE.MeshBasicMaterial({ color: white, transparent: true, opacity: 0.32 });
      const frameMat = new THREE.MeshBasicMaterial({
        color: white,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
      });
      const frameRedMat = new THREE.MeshBasicMaterial({
        color: red,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      });

      const lensOuter = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.035, 16, 128), lineMat);
      const lensMid = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.028, 16, 128), redMat);
      const lensInner = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.024, 16, 128), lineMat);
      const lensCore = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 64), redMat);
      lensCore.rotation.x = Math.PI / 2;
      group.add(lensOuter, lensMid, lensInner, lensCore);

      const aperture = new THREE.Group();
      for (let i = 0; i < 8; i += 1) {
        const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), glass);
        blade.position.set(0.52, 0, 0);
        blade.rotation.z = (Math.PI * 2 * i) / 8 + 0.28;
        aperture.add(blade);
      }
      group.add(aperture);

      const frames = new THREE.Group();
      const frameData = [
        [-2.25, 0.75, -0.42, -0.24, frameMat],
        [2.0, 0.55, -0.95, 0.2, frameRedMat],
        [-1.45, -1.25, -0.8, 0.18, frameRedMat],
        [1.95, -1.05, -0.35, -0.15, frameMat],
        [0.1, 1.55, -1.1, 0.08, frameMat]
      ];
      frameData.forEach(([x, y, z, rot, material]) => {
        const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.74), material);
        frame.position.set(x, y, z);
        frame.rotation.set(0.18, rot, rot * 0.8);
        frames.add(frame);
      });
      group.add(frames);

      const tickGroup = new THREE.Group();
      for (let i = 0; i < 36; i += 1) {
        const tick = new THREE.Mesh(new THREE.BoxGeometry(0.018, i % 3 === 0 ? 0.28 : 0.16, 0.014), i % 3 === 0 ? redMat : lineMat);
        const angle = (Math.PI * 2 * i) / 36;
        tick.position.set(Math.cos(angle) * 1.86, Math.sin(angle) * 1.86, 0);
        tick.rotation.z = angle;
        tickGroup.add(tick);
      }
      group.add(tickGroup);

      scene.add(new THREE.AmbientLight(0xffffff, 0.44));
      const keyLight = new THREE.PointLight(0xff3030, 2.1, 10);
      keyLight.position.set(2.5, 2.1, 3.6);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0xffffff, 1.2, 8);
      rimLight.position.set(-3.2, -1.8, 2.8);
      scene.add(rimLight);

      let pointerX = 0;
      let pointerY = 0;
      let targetX = 0;
      let targetY = 0;
      let scroll = 0;
      let targetScroll = 0;
      let clock = new THREE.Clock();

      function resize() {
        const rect = shell.getBoundingClientRect();
        const width = Math.max(260, rect.width);
        const height = Math.max(260, rect.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      function onScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        targetScroll = max <= 0 ? 0 : Math.min(window.scrollY / max, 1);
      }

      function animate() {
        const elapsed = clock.getElapsedTime();
        pointerX += (targetX - pointerX) * 0.06;
        pointerY += (targetY - pointerY) * 0.06;
        scroll += (targetScroll - scroll) * 0.045;

        group.rotation.y = -0.32 + scroll * 1.25 + pointerX * 0.18;
        group.rotation.x = 0.12 + scroll * 0.36 + pointerY * 0.12;
        group.rotation.z = Math.sin(elapsed * 0.22) * 0.035;
        group.position.x = scroll * -0.5;
        group.position.y = Math.sin(elapsed * 0.3) * 0.04;
        camera.position.z = 7.2 - scroll * 1.2;
        aperture.rotation.z = elapsed * 0.08 + scroll * 1.4;
        frames.rotation.y = Math.sin(elapsed * 0.25) * 0.16 + scroll * 0.6;
        tickGroup.rotation.z = -elapsed * 0.05 - scroll * 0.8;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }

      window.addEventListener("resize", resize);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", (event) => {
        if (!window.matchMedia("(pointer: fine)").matches) return;
        targetX = event.clientX / window.innerWidth - 0.5;
        targetY = event.clientY / window.innerHeight - 0.5;
      });

      resize();
      onScroll();
      animate();
    } catch (error) {
      shell.classList.add("is-fallback");
    }
  }

  initFilmOrbit();
})();
