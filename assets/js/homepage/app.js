const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.querySelector(".site-header");
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const mobileMenuToggle = document.querySelector("[data-mobile-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const mobileMenuLinks = Array.from(document.querySelectorAll(".mobile-menu a"));
const mobileSubmenus = Array.from(document.querySelectorAll("[data-mobile-submenu]"));
const mobileSubmenuToggles = Array.from(document.querySelectorAll("[data-mobile-submenu-toggle]"));
const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"], .mobile-menu a[href^="#"]'));
const observedSections = Array.from(document.querySelectorAll("[data-section][id]"));

const contactForm = document.querySelector("#contact-form");
const contactSuccess = document.querySelector("#contact-success");
const contactSubmitButton = contactForm?.querySelector('[type="submit"]');
const desiredSolutionSelect = document.querySelector("#desired-solution");
const customerTypeSelect = document.querySelector("#customer-type");
const prefillButtons = Array.from(document.querySelectorAll("[data-prefill-solution], [data-prefill-profile]"));

function setHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function setMobileMenuState(isOpen) {
  if (!mobileMenu || !mobileMenuToggle) {
    return;
  }

  mobileMenu.classList.toggle("is-open", isOpen);
  mobileMenuToggle.classList.toggle("is-open", isOpen);
  mobileMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

  if (!isOpen) {
    mobileSubmenus.forEach((submenu) => submenu.classList.remove("is-open"));
    mobileSubmenuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
  }
}

function setActiveSection(id) {
  const activeHrefs = new Set([`#${id}`]);

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", activeHrefs.has(link.getAttribute("href") || ""));
  });
}

function markPrefillButtons() {
  prefillButtons.forEach((button) => {
    const matchesSolution =
      desiredSolutionSelect && button.dataset.prefillSolution && desiredSolutionSelect.value === button.dataset.prefillSolution;
    const matchesProfile =
      customerTypeSelect && button.dataset.prefillProfile && customerTypeSelect.value === button.dataset.prefillProfile;

    button.classList.toggle("is-selected", Boolean(matchesSolution || matchesProfile));
  });
}

function applyFormPrefill({ solution, profile }) {
  if (solution && desiredSolutionSelect) {
    desiredSolutionSelect.value = solution;
  }

  if (profile && customerTypeSelect) {
    customerTypeSelect.value = profile;
  }

  markPrefillButtons();
}

if (revealItems.length && "IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => {
    if (!item.classList.contains("is-visible")) {
      revealObserver.observe(item);
    }
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (observedSections.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry?.target?.id) {
        setActiveSection(visibleEntry.target.id);
      }
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.3, 0.6] }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

if (mobileMenu && mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", () => {
    setMobileMenuState(!mobileMenu.classList.contains("is-open"));
  });

  mobileSubmenuToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const parent = toggle.closest("[data-mobile-submenu]");
      if (!parent) {
        return;
      }

      const willOpen = !parent.classList.contains("is-open");
      mobileSubmenus.forEach((submenu) => submenu.classList.remove("is-open"));
      mobileSubmenuToggles.forEach((button) => button.setAttribute("aria-expanded", "false"));

      parent.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMobileMenuState(false);
    });
  });

  document.addEventListener("click", (event) => {
    if (
      mobileMenu.classList.contains("is-open") &&
      !mobileMenu.contains(event.target) &&
      !mobileMenuToggle.contains(event.target)
    ) {
      setMobileMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
      setMobileMenuState(false);
    }
  });
}

prefillButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyFormPrefill({
      solution: button.dataset.prefillSolution || "",
      profile: button.dataset.prefillProfile || "",
    });
  });
});

if (desiredSolutionSelect) {
  desiredSolutionSelect.addEventListener("change", markPrefillButtons);
}

if (customerTypeSelect) {
  customerTypeSelect.addEventListener("change", markPrefillButtons);
}

if (contactForm && contactSuccess) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const sendingMessage = contactForm.dataset.sendingMessage || "Envoi en cours...";
    const successMessage =
      contactForm.dataset.successMessage || "Merci. Votre demande a bien Ã©tÃ© reÃ§ue. Nous vous contacterons rapidement.";
    const errorMessage = contactForm.dataset.errorMessage || "Lâ€™envoi nâ€™a pas abouti. Merci de rÃ©essayer.";
    const defaultSubmitLabel = contactSubmitButton?.dataset.defaultLabel || contactSubmitButton?.textContent || "Recevoir un devis";

    contactSuccess.textContent = "";

    if (contactSubmitButton) {
      contactSubmitButton.disabled = true;
      contactSubmitButton.textContent = sendingMessage;
    }

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        contactSuccess.textContent = successMessage;
        contactForm.reset();
        markPrefillButtons();
      } else {
        contactSuccess.textContent = data.message ? `${errorMessage} ${data.message}` : errorMessage;
      }
    } catch (error) {
      contactSuccess.textContent = errorMessage;
      console.error("Contact form submission failed:", error);
    } finally {
      if (contactSubmitButton) {
        contactSubmitButton.disabled = false;
        contactSubmitButton.textContent = defaultSubmitLabel.trim();
      }
    }
  });
}

setHeaderState();
setActiveSection("hero");
markPrefillButtons();

window.addEventListener("scroll", setHeaderState, { passive: true });

// Product selector on landing/product pages
const productSizeButtons = Array.from(document.querySelectorAll("[data-product-size]"));
const productVariantButtons = Array.from(document.querySelectorAll("[data-product-variant]"));
const productModel = document.querySelector("[data-product-model]");
const productSummary = document.querySelector("[data-product-summary]");
const productBadge = document.querySelector("[data-product-badge]");
const productCapacity = document.querySelector("[data-product-capacity]");
const productCollector = document.querySelector("[data-product-collector]");
const productControl = document.querySelector("[data-product-control]");

const PRODUCT_DATA = {
  "150": { capacity: "150L", collector: "1 x 2.0 m2" },
  "200": { capacity: "200L", collector: "1 x 2.5 m2" },
  "300": { capacity: "300L", collector: "2 x 2.0 m2" },
};

const VARIANT_LABELS = {
  N: "Standard",
  S: "Smart",
};

function updateProductState() {
  if (!productModel) return;

  const activeSize = productSizeButtons.find((button) => button.classList.contains("is-active"))?.dataset.productSize || "150";
  const activeVariant = productVariantButtons.find((button) => button.classList.contains("is-active"))?.dataset.productVariant || "N";

  const data = PRODUCT_DATA[activeSize] || PRODUCT_DATA["150"];
  const variantLabel = VARIANT_LABELS[activeVariant] || "Standard";
  const modelCode = `AT${activeSize}${activeVariant}`;

  if (productModel) productModel.textContent = modelCode;
  if (productBadge) productBadge.textContent = `${data.capacity} / ${variantLabel}`;
  if (productCapacity) productCapacity.textContent = data.capacity;
  if (productCollector) productCollector.textContent = data.collector;
  if (productControl) productControl.textContent = activeVariant === "S" ? "Version Smart" : "Version Standard";
  if (productSummary) {
    productSummary.textContent = `Chauffe-eau solaire ${data.capacity} en version ${variantLabel.toLowerCase()} avec ${data.collector.replace(" x", " collecteur(s) de ")}.`;
  }
}

function setActiveProductButton(buttons, targetButton) {
  buttons.forEach((button) => button.classList.remove("is-active"));
  targetButton.classList.add("is-active");
  updateProductState();
}

productSizeButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveProductButton(productSizeButtons, button));
});

productVariantButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveProductButton(productVariantButtons, button));
});

updateProductState();

