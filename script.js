function initializeValueCards() {
  document.querySelectorAll(".values-flip-grid .card").forEach((card, index) => {
    const heading = card.querySelector("h4");
    const details = card.querySelector("p");
    const faces = document.createElement("div");
    const button = document.createElement("button");
    let isHovered = false;

    heading.id ||= `value-heading-${index + 1}`;
    details.id ||= `value-details-${index + 1}`;
    heading.classList.add("value-card-front");
    details.classList.add("value-card-back");

    faces.className = "value-card-faces";
    faces.append(heading, details);

    button.type = "button";
    button.className = "value-card-toggle";
    button.setAttribute("aria-labelledby", heading.id);
    button.setAttribute("aria-controls", details.id);

    card.classList.add("value-card");
    card.append(faces, button);

    function setFlipped(isFlipped) {
      card.classList.toggle("is-flipped", isFlipped);
      button.setAttribute("aria-expanded", String(isFlipped));
      details.setAttribute("aria-hidden", String(!isFlipped));
    }

    setFlipped(false);

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      isHovered = true;
      setFlipped(true);
    });

    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "touch") return;
      isHovered = false;
      if (!button.matches(":focus-visible")) setFlipped(false);
    });

    button.addEventListener("focus", () => {
      if (button.matches(":focus-visible")) setFlipped(true);
    });

    button.addEventListener("blur", () => {
      if (!isHovered) setFlipped(false);
    });

    button.addEventListener("click", () => {
      setFlipped(button.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setFlipped(false);
    });
  });
}
function initializeWebsite() {
  initializeValueCards();
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  /* Mobile navigation */
  if (toggle && navLinks) {
    function setMenuOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      navLinks.classList.toggle("open", isOpen);
    }

    setMenuOpen(false);

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    const mobileLayout = window.matchMedia("(max-width: 760px)");

    mobileLayout.addEventListener("change", () => {
      setMenuOpen(false);
    });
  }

  /* Footer year */
  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* Moving blobs */
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  document.querySelectorAll(".hero, .feature").forEach((area) => {
    const blob = area.querySelector(".hero-blob");

    if (!blob) return;

    let targetX = area.clientWidth / 2;
    let targetY = area.clientHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrame = null;

    function placeBlob() {
      blob.style.left = `${currentX}px`;
      blob.style.top = `${currentY}px`;
    }

    function stopAnimation() {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }

    function animateBlob() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      const hasSettled =
        Math.abs(targetX - currentX) < 0.5 &&
        Math.abs(targetY - currentY) < 0.5;

      if (hasSettled) {
        currentX = targetX;
        currentY = targetY;
      }

      placeBlob();

      animationFrame = hasSettled
        ? null
        : requestAnimationFrame(animateBlob);
    }

    function startAnimation() {
      if (reduceMotion.matches || animationFrame !== null) return;

      animationFrame = requestAnimationFrame(animateBlob);
    }

    function centerBlob() {
      targetX = area.clientWidth / 2;
      targetY = area.clientHeight / 2;

      if (reduceMotion.matches) {
        stopAnimation();
        currentX = targetX;
        currentY = targetY;
        placeBlob();
      } else {
        startAnimation();
      }
    }

    area.addEventListener("pointermove", (event) => {
      if (reduceMotion.matches || event.pointerType === "touch") return;

      const bounds = area.getBoundingClientRect();

      targetX = event.clientX - bounds.left;
      targetY = event.clientY - bounds.top;

      startAnimation();
    });

    area.addEventListener("pointerleave", centerBlob);

    reduceMotion.addEventListener("change", centerBlob);

    const resizeObserver = new ResizeObserver(centerBlob);
    resizeObserver.observe(area);

    placeBlob();
  });
}

/* Works whether the script loads before or after the HTML */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWebsite, {
    once: true
  });
} else {
  initializeWebsite();
}