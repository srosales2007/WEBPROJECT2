const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const nav = document.querySelector(".nav");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const revealTargets = document.querySelectorAll("[data-reveal]");
const cursorRing = document.querySelector(".cursor-ring");
const interactiveSurfaces = document.querySelectorAll(".interactive-surface, .button, .carousel-button, .listing-option");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const listingTriggers = Array.from(document.querySelectorAll("[data-listing-trigger]"));
const listingStage = document.querySelector(".listing-stage");
const listingImage = document.querySelector("[data-listing-image]");
const listingTitle = document.querySelector("[data-listing-title]");
const listingLocation = document.querySelector("[data-listing-location]");
const listingPrice = document.querySelector("[data-listing-price]");
const listingCopy = document.querySelector("[data-listing-copy]");
const listingDetailA = document.querySelector("[data-listing-detail-a]");
const listingDetailB = document.querySelector("[data-listing-detail-b]");
const listingDetailC = document.querySelector("[data-listing-detail-c]");
const inquiryForm = document.querySelector("[data-inquiry-form]");
const formFeedback = document.querySelector("[data-form-feedback]");

if (hasFinePointer) {
  document.body.classList.add("has-fine-pointer");
}

const updateNavState = () => {
  if (!nav) {
    return;
  }

  nav.classList.toggle("is-scrolled", window.scrollY > 18);
};

const closeNav = () => {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

const toggleNav = () => {
  if (!nav || !navToggle) {
    return;
  }

  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
};

navToggle?.addEventListener("click", toggleNav);

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) {
    closeNav();
  }
});

document.addEventListener("click", (event) => {
  if (!nav?.classList.contains("is-open")) {
    return;
  }

  if (event.target instanceof Node && !nav.contains(event.target)) {
    closeNav();
  }
});

updateNavState();

let ticking = false;
const onScroll = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(() => {
    updateNavState();
    updateParallax();
    ticking = false;
  });
};

window.addEventListener("scroll", onScroll, { passive: true });

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -5% 0px",
    }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

interactiveSurfaces.forEach((surface) => {
  surface.addEventListener("pointermove", (event) => {
    const rect = surface.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    surface.style.setProperty("--mouse-x", `${x}%`);
    surface.style.setProperty("--mouse-y", `${y}%`);

    if (prefersReducedMotion || !surface.hasAttribute("data-tilt")) {
      return;
    }

    const rotateY = (x - 50) / 12;
    const rotateX = (50 - y) / 14;
    surface.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    surface.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
  });

  surface.addEventListener("pointerleave", () => {
    surface.style.setProperty("--mouse-x", "50%");
    surface.style.setProperty("--mouse-y", "50%");
    surface.style.setProperty("--tilt-x", "0deg");
    surface.style.setProperty("--tilt-y", "0deg");
  });
});

function updateParallax() {
  if (prefersReducedMotion) {
    parallaxItems.forEach((item) => item.style.setProperty("--parallax-y", "0px"));
    return;
  }

  parallaxItems.forEach((item) => {
    const speed = Number(item.getAttribute("data-parallax")) || 0.12;
    const rect = item.getBoundingClientRect();
    const centerOffset = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const offset = centerOffset * speed * 0.16;
    item.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
  });
}

updateParallax();
window.addEventListener("resize", updateParallax);

const syncListingStage = (trigger) => {
  if (
    !listingImage ||
    !listingTitle ||
    !listingLocation ||
    !listingPrice ||
    !listingCopy ||
    !listingDetailA ||
    !listingDetailB ||
    !listingDetailC
  ) {
    return;
  }

  listingTriggers.forEach((button) => {
    const isActive = button === trigger;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  listingStage?.classList.add("is-updating");

  window.setTimeout(() => {
    listingTitle.textContent = trigger.dataset.title || "";
    listingLocation.textContent = trigger.dataset.location || "";
    listingPrice.textContent = trigger.dataset.price || "";
    listingCopy.textContent = trigger.dataset.copy || "";
    listingDetailA.textContent = trigger.dataset.detailA || "";
    listingDetailB.textContent = trigger.dataset.detailB || "";
    listingDetailC.textContent = trigger.dataset.detailC || "";
    listingImage.src = trigger.dataset.image || "";
    listingImage.alt = trigger.dataset.alt || "";
    listingStage?.classList.remove("is-updating");
  }, prefersReducedMotion ? 0 : 120);
};

listingTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => syncListingStage(trigger));
});

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector(".gallery-track");
  const slides = Array.from(carousel.querySelectorAll(".gallery-slide"));
  const prevButton = document.querySelector("[data-carousel-prev]");
  const nextButton = document.querySelector("[data-carousel-next]");
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
  const currentCounter = document.querySelector("[data-current-slide]");
  const viewport = carousel.querySelector(".gallery-viewport");
  let currentIndex = 0;
  let autoPlayId = null;
  let swipeStartX = 0;

  const renderCarousel = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    if (track) {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
    });

    if (currentCounter) {
      currentCounter.textContent = String(currentIndex + 1).padStart(2, "0");
    }
  };

  const stopAutoPlay = () => {
    if (!autoPlayId) {
      return;
    }

    window.clearInterval(autoPlayId);
    autoPlayId = null;
  };

  const startAutoPlay = () => {
    if (prefersReducedMotion) {
      return;
    }

    stopAutoPlay();
    autoPlayId = window.setInterval(() => {
      renderCarousel(currentIndex + 1);
    }, 5200);
  };

  prevButton?.addEventListener("click", () => {
    renderCarousel(currentIndex - 1);
    startAutoPlay();
  });

  nextButton?.addEventListener("click", () => {
    renderCarousel(currentIndex + 1);
    startAutoPlay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.getAttribute("data-carousel-dot"));
      renderCarousel(targetIndex);
      startAutoPlay();
    });
  });

  viewport?.addEventListener("pointerdown", (event) => {
    swipeStartX = event.clientX;
  });

  viewport?.addEventListener("pointerup", (event) => {
    const delta = event.clientX - swipeStartX;

    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta < 0) {
      renderCarousel(currentIndex + 1);
    } else {
      renderCarousel(currentIndex - 1);
    }

    startAutoPlay();
  });

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);

  renderCarousel(0);
  startAutoPlay();
}

if (hasFinePointer && cursorRing) {
  window.addEventListener(
    "pointermove",
    (event) => {
      cursorRing.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%) scale(1)`;
    },
    { passive: true }
  );

  interactiveSurfaces.forEach((surface) => {
    surface.addEventListener("pointerenter", () => cursorRing.classList.add("is-active"));
    surface.addEventListener("pointerleave", () => cursorRing.classList.remove("is-active"));
  });
}

inquiryForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(inquiryForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const budget = String(formData.get("budget") || "").trim();
  const area = String(formData.get("area") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const subject = `Private inquiry from ${name || "WEBPROJECT2 visitor"}`;
  const body = [
    "WEBPROJECT2 private inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Budget: ${budget}`,
    `Preferred area: ${area}`,
    "",
    "Notes:",
    notes,
  ].join("\n");

  window.location.href = `mailto:hello@webproject2estates.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (formFeedback) {
    formFeedback.textContent = "Your inquiry draft has been opened in your email app.";
    formFeedback.classList.add("is-success");
  }
});
