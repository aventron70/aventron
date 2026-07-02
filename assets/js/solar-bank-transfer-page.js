(function () {
  const bookingForm = document.querySelector("#bank-transfer-booking-form");
  const bookingStatus = document.querySelector("#bank-transfer-form-status");
  const bookingFrame = document.querySelector("#bank-transfer-upload-target");
  const informationForm = document.querySelector("#payment-information-form");
  const informationStatus = document.querySelector("#payment-information-status");
  const successModal = document.querySelector("#payment-success-modal");
  const successModalBackdrop = successModal?.querySelector(".payment-success-modal__backdrop");
  const successModalCloseButton = successModal?.querySelector(".payment-success-modal__close");
  const summaryNode = document.querySelector("[data-payment-summary]");
  const heroPriceNode = document.querySelector("[data-payment-hero-price]");
  const callbackPageLinks = document.querySelectorAll("[data-callback-page-link]");
  const bankTransferPageLinks = document.querySelectorAll("[data-bank-transfer-page-link]");
  const params = new URLSearchParams(window.location.search);

  let bookingSubmissionPending = false;
  let bookingSubmissionTimer = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat("fr-MA", {
      maximumFractionDigits: 0,
    }).format(value);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function trackMetaCustomEvent(eventName) {
    if (typeof window.fbq === "undefined") {
      return;
    }

    try {
      window.fbq("trackCustom", eventName);
    } catch (error) {
      console.error("Meta Pixel custom event failed:", error);
    }
  }

  function getNumberParam(key) {
    const rawValue = params.get(key);

    if (rawValue === null || rawValue.trim() === "") {
      return null;
    }

    const value = Number(rawValue);
    return Number.isFinite(value) ? value : null;
  }

  function getTextParam(key, fallback = "") {
    return params.get(key)?.trim() || fallback;
  }

  function getFeatureList() {
    const rawValue = getTextParam("features");

    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Impossible de lire les options de la commande :", error);
      return [];
    }
  }

  function buildCurrentFlowUrl(path) {
    const url = new URL(path, window.location.href);
    url.search = params.toString();
    return url.toString();
  }

  function getFinalPrice(summary) {
    return summary.payNowPrice ?? summary.standardPrice;
  }

  function getPriceNote(summary) {
    if (summary.discount > 0 && summary.paymentMode === "payNow") {
      return `La remise immédiate de ${formatCurrency(summary.discount)} DHS est déjà incluse dans ce montant.`;
    }

    if (summary.paymentMode === "payLater") {
      return "Ce montant correspond au prix final TTC à régler par virement.";
    }

    return "Ce montant correspond au prix final TTC de votre commande.";
  }

  function getSelectedOptions(summary) {
    const baseItems = new Set([
      `${summary.capacity} ${summary.model}`.trim(),
      summary.installation,
    ]);

    return summary.features.filter((feature) => {
      const normalizedFeature = String(feature || "").trim();
      return normalizedFeature && !baseItems.has(normalizedFeature);
    });
  }

  function setHiddenField(form, fieldName, value) {
    const field = form?.querySelector(`[name="${fieldName}"]`);

    if (field) {
      field.value = value || "";
    }
  }

  function fillVisibleField(form, selector, value) {
    const field = form?.querySelector(selector);

    if (field && value) {
      field.value = value;
    }
  }

  function setStatus(statusNode, message = "", tone = "") {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.classList.remove("payment-status--error", "payment-status--success");

    if (tone === "error" || tone === "success") {
      statusNode.classList.add(`payment-status--${tone}`);
    }
  }

  function setSubmitButtonState(form, isSubmitting) {
    const submitButton = form?.querySelector('[type="submit"]');

    if (!submitButton) {
      return;
    }

    if (!submitButton.dataset.defaultLabel) {
      submitButton.dataset.defaultLabel = submitButton.textContent?.trim() || "Envoyer";
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? form.dataset.sendingMessage || "Envoi en cours..."
      : submitButton.dataset.defaultLabel;
  }

  function getBookingSuccessUrl() {
    const successUrl = new URL("form-submit-success.html", window.location.href);
    successUrl.searchParams.set("form", "bank-transfer-booking");
    return successUrl.toString();
  }

  function openSuccessModal() {
    if (!successModal) {
      return;
    }

    successModal.hidden = false;
    document.body.style.overflow = "hidden";
    successModalCloseButton?.focus();
  }

  function closeSuccessModal() {
    if (!successModal) {
      return;
    }

    successModal.hidden = true;
    document.body.style.overflow = "";
  }

  function validateTransferReceipt(form, statusNode) {
    const receiptInput = form?.querySelector("#payment-transfer-receipt");

    if (!receiptInput || !receiptInput.files?.length) {
      return true;
    }

    const files = Array.from(receiptInput.files || []);

    if (files.length > 1) {
      setStatus(statusNode, "Merci d'ajouter une seule photo du reçu bancaire.", "error");
      receiptInput.focus();
      return false;
    }

    const [file] = files;

    if ((file.size || 0) > 10 * 1024 * 1024) {
      setStatus(statusNode, "La photo du reçu bancaire doit rester inférieure à 10 Mo.", "error");
      receiptInput.focus();
      return false;
    }

    if (file.type && !file.type.startsWith("image/")) {
      setStatus(statusNode, "Merci d'ajouter uniquement une photo du reçu bancaire.", "error");
      receiptInput.focus();
      return false;
    }

    return true;
  }

  function fillSummaryFields(form, summary) {
    if (!form) {
      return;
    }

    setHiddenField(form, "selected_capacity", summary.capacity);
    setHiddenField(form, "selected_model", summary.model);
    setHiddenField(form, "selected_location", summary.location);
    setHiddenField(form, "selected_distance", summary.distance);
    setHiddenField(form, "selected_distance_band", summary.distanceBand);
    setHiddenField(form, "selected_installation_mode", summary.installation);
    setHiddenField(form, "selected_features", getSelectedOptions(summary).join(" | "));
    setHiddenField(form, "standard_price_ttc", summary.standardPrice !== null ? `${summary.standardPrice} DHS TTC` : "");
    setHiddenField(form, "pay_now_total_ttc", summary.payNowPrice !== null ? `${summary.payNowPrice} DHS TTC` : "");
    setHiddenField(form, "discount_value", summary.discount > 0 ? `${summary.discount} DHS` : "");
    setHiddenField(form, "payment_mode", summary.paymentMode);
  }

  function hydrateBookingForm(summary) {
    fillSummaryFields(bookingForm, summary);
    fillVisibleField(bookingForm, "#payment-full-name", summary.fullName);
    fillVisibleField(bookingForm, "#payment-phone", summary.phone);
    fillVisibleField(bookingForm, "#payment-email", summary.email);
    fillVisibleField(bookingForm, "#payment-city", summary.location !== "À confirmer" ? summary.location : "");
    setHiddenField(bookingForm, "_next", getBookingSuccessUrl());
  }

  function hydrateInformationForm(summary) {
    fillSummaryFields(informationForm, summary);
    fillVisibleField(informationForm, "#information-full-name", summary.fullName);
    fillVisibleField(informationForm, "#information-phone", summary.phone);
    setHiddenField(informationForm, "email", summary.email);
  }

  function clearBookingPendingState() {
    bookingSubmissionPending = false;

    if (bookingSubmissionTimer) {
      window.clearTimeout(bookingSubmissionTimer);
      bookingSubmissionTimer = null;
    }

    setSubmitButtonState(bookingForm, false);
  }

  function finalizeBookingSuccess(summary) {
    clearBookingPendingState();
    trackMetaCustomEvent("BankTransferSubmitted");
    setStatus(
      bookingStatus,
      bookingForm?.dataset.successMessage || "Merci. Votre confirmation de virement a bien été reçue.",
      "success",
    );

    bookingForm?.reset();
    hydrateBookingForm(summary);
    openSuccessModal();
  }

  async function submitForm(form, statusNode, summary) {
    const submitButton = form.querySelector('[type="submit"]');
    const sendingMessage = form.dataset.sendingMessage || "Envoi en cours...";
    const successMessage = form.dataset.successMessage || "Merci. Votre demande a bien été reçue.";
    const errorMessage = form.dataset.errorMessage || "L'envoi n'a pas abouti. Merci de réessayer.";
    const defaultLabel = submitButton?.textContent?.trim() || "Envoyer";

    setStatus(statusNode, "");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = sendingMessage;
    }

    try {
      const response = await fetch(form.action, {
        method: form.method,
        headers: {
          Accept: "application/json",
        },
        body: new FormData(form),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setStatus(statusNode, successMessage, "success");
        form.reset();

        if (form === informationForm) {
          trackMetaCustomEvent("NeedMoreInfo");
          hydrateInformationForm(summary);
          openSuccessModal();
        }
      } else {
        setStatus(statusNode, result.message ? `${errorMessage} ${result.message}` : errorMessage, "error");
      }
    } catch (error) {
      console.error("Erreur d'envoi du formulaire :", error);
      setStatus(statusNode, errorMessage, "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultLabel;
      }
    }
  }

  function renderHeroPrice(summary) {
    if (!heroPriceNode) {
      return;
    }

    const finalPrice = getFinalPrice(summary);

    if (finalPrice === null) {
      heroPriceNode.innerHTML = `
        <span>Montant final</span>
        <strong>À confirmer</strong>
        <small>Revenez au configurateur pour afficher le montant final de votre commande.</small>
      `;
      return;
    }

    heroPriceNode.innerHTML = `
      <span>Montant final</span>
      <strong>${formatCurrency(finalPrice)} DHS TTC</strong>
      <small>${escapeHtml(getPriceNote(summary))}</small>
    `;
  }

  function renderSummary(summary) {
    if (!summaryNode) {
      return;
    }

    const finalPrice = getFinalPrice(summary);

    if (finalPrice === null) {
      summaryNode.innerHTML = `
        <p class="payment-empty-state">
          Reprenez le configurateur pour calculer votre commande avant de confirmer votre virement.
        </p>
      `;
      return;
    }

    const selectedOptions = getSelectedOptions(summary);
    const optionsMarkup = selectedOptions.length
      ? `
          <ul class="payment-order-summary-options">
            ${selectedOptions.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}
          </ul>
        `
      : '<span class="payment-order-summary-empty">Aucune option supplémentaire</span>';

    summaryNode.innerHTML = `
      <div class="payment-summary-price">
        <span class="payment-summary-price__label">Prix final TTC</span>
        <strong>${formatCurrency(finalPrice)} DHS TTC</strong>
        <p>${escapeHtml(getPriceNote(summary))}</p>
      </div>

      <dl class="payment-order-summary-list">
        <div>
          <dt>Produit</dt>
          <dd>Chauffe-eau solaire</dd>
        </div>
        <div>
          <dt>Capacité</dt>
          <dd>${escapeHtml(summary.capacity)}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>${escapeHtml(summary.model)}</dd>
        </div>
        <div>
          <dt>Ville / site</dt>
          <dd>${escapeHtml(summary.location)}</dd>
        </div>
        <div>
          <dt>Installation</dt>
          <dd>${escapeHtml(summary.installation)}</dd>
        </div>
        <div>
          <dt>Options sélectionnées</dt>
          <dd>${optionsMarkup}</dd>
        </div>
      </dl>
    `;
  }

  function hydratePageLinks() {
    const callbackUrl = buildCurrentFlowUrl("rappel-avant-paiement.html");
    const bankTransferUrl = buildCurrentFlowUrl("paiement-virement-installation.html");

    callbackPageLinks.forEach((link) => {
      link.href = callbackUrl;
    });

    bankTransferPageLinks.forEach((link) => {
      link.href = bankTransferUrl;
    });
  }

  function trackPaymentIntent(summary) {
    const finalPrice = getFinalPrice(summary);

    if (document.body.dataset.paymentFlow !== "bank-transfer") {
      return;
    }

    if (summary.paymentMode !== "payNow" || finalPrice === null) {
      return;
    }

    const trackingKey = [
      "aventron-payment-intent",
      summary.capacity,
      summary.model,
      summary.location,
      String(finalPrice),
    ].join("|");

    try {
      if (window.sessionStorage.getItem(trackingKey)) {
        return;
      }

      window.sessionStorage.setItem(trackingKey, "1");
    } catch (error) {
      console.warn("Session storage unavailable for PaymentIntent tracking:", error);
    }

    trackMetaCustomEvent("PaymentIntent");
  }

  const summary = {
    capacity: getTextParam("capacity", "Configuration à confirmer"),
    model: getTextParam("model", "À confirmer"),
    location: getTextParam("location", "À confirmer"),
    distance: getNumberParam("distance"),
    distanceBand: getTextParam("distanceBand", "À confirmer"),
    installation: getTextParam("installation", "À confirmer"),
    standardPrice: getNumberParam("standardPrice"),
    payNowPrice: getNumberParam("payNowPrice"),
    discount: getNumberParam("discount") ?? 0,
    paymentMode: getTextParam("paymentMode", "payNow"),
    features: getFeatureList(),
    fullName: getTextParam("fullName"),
    phone: getTextParam("phone"),
    email: getTextParam("email"),
  };

  renderHeroPrice(summary);
  renderSummary(summary);
  hydratePageLinks();
  hydrateBookingForm(summary);
  hydrateInformationForm(summary);
  trackPaymentIntent(summary);

  if (bookingForm && bookingStatus && bookingFrame) {
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin || !bookingSubmissionPending) {
        return;
      }

      if (event.data?.type === "formsubmit-success" && event.data.form === "bank-transfer-booking") {
        finalizeBookingSuccess(summary);
      }
    });

    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateTransferReceipt(bookingForm, bookingStatus)) {
        return;
      }

      bookingSubmissionPending = true;
      setStatus(bookingStatus, "");
      setSubmitButtonState(bookingForm, true);
      setHiddenField(bookingForm, "_next", getBookingSuccessUrl());

      if (bookingSubmissionTimer) {
        window.clearTimeout(bookingSubmissionTimer);
      }

      bookingSubmissionTimer = window.setTimeout(() => {
        if (!bookingSubmissionPending) {
          return;
        }

        clearBookingPendingState();
        setStatus(
          bookingStatus,
          bookingForm.dataset.errorMessage || "L'envoi n'a pas abouti. Merci de réessayer.",
          "error",
        );
      }, 30000);

      HTMLFormElement.prototype.submit.call(bookingForm);
    });
  }

  if (successModal) {
    successModalBackdrop?.addEventListener("click", closeSuccessModal);
    successModalCloseButton?.addEventListener("click", closeSuccessModal);

    successModal.addEventListener("click", (event) => {
      if (event.target === successModal) {
        closeSuccessModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !successModal.hidden) {
        closeSuccessModal();
      }
    });
  }

  if (informationForm && informationStatus) {
    informationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await submitForm(informationForm, informationStatus, summary);
    });
  }
})();
