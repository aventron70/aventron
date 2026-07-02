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

  function validatePreinstallationPhotos(form, statusNode) {
    const photoInput = form?.querySelector("#payment-preinstallation-photos");

    if (!photoInput) {
      return true;
    }

    if (!photoInput.files?.length) {
      return true;
    }

    const files = Array.from(photoInput.files || []);

    if (!files.length) {
      setStatus(statusNode, "Merci d'ajouter au moins une photo de préinstallation.", "error");
      photoInput.focus();
      return false;
    }

    if (files.length > 5) {
      setStatus(statusNode, "Merci de sélectionner au maximum 5 photos de préinstallation.", "error");
      photoInput.focus();
      return false;
    }

    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

    if (totalSize > 10 * 1024 * 1024) {
      setStatus(statusNode, "La taille totale des photos doit rester inférieure à 10 Mo.", "error");
      photoInput.focus();
      return false;
    }

    const invalidFile = files.find((file) => file.type && !file.type.startsWith("image/"));

    if (invalidFile) {
      setStatus(statusNode, "Merci d'ajouter uniquement des photos au format image.", "error");
      photoInput.focus();
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
    setHiddenField(form, "selected_features", summary.features.join(" | "));
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
    setStatus(
      bookingStatus,
      bookingForm?.dataset.successMessage || "Merci. Votre demande liée au virement a bien été reçue.",
      "success",
    );

    bookingForm?.reset();
    hydrateBookingForm(summary);
    openSuccessModal();
  }

  async function submitForm(form, statusNode) {
    const submitButton = form.querySelector('[type="submit"]');
    const sendingMessage = form.dataset.sendingMessage || "Envoi en cours...";
    const successMessage = form.dataset.successMessage || "Merci. Votre demande a bien été reçue.";
    const errorMessage = form.dataset.errorMessage || "L'envoi n'a pas abouti. Merci de réessayer.";
    const defaultLabel = submitButton?.textContent || "Envoyer";

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
        submitButton.textContent = defaultLabel.trim();
      }
    }
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

  if (summaryNode) {
    if (summary.standardPrice === null && summary.payNowPrice === null) {
      summaryNode.innerHTML = `
        <p class="payment-empty-state">
          Reprenez le configurateur pour calculer votre commande avant de payer ou de demander plus d'informations.
        </p>
      `;
    } else {
      summaryNode.innerHTML = `
        <div class="payment-summary-price">
          <span class="payment-summary-price__label">Montant final TTC</span>
          <strong>${formatCurrency(summary.payNowPrice ?? summary.standardPrice)} DHS TTC</strong>
          <p>
            ${
              summary.discount > 0
                ? `La remise immédiate de ${formatCurrency(summary.discount)} DHS est déjà incluse dans ce montant.`
                : summary.paymentMode === "payLater"
                  ? "Vous pourrez payer ce montant plus tard par virement."
                  : "Ce montant correspond à votre prix final TTC."
            }
          </p>
        </div>

        <dl class="payment-summary-list">
          <div>
            <dt>Produit</dt>
            <dd>${escapeHtml(summary.capacity)} ${escapeHtml(summary.model)}</dd>
          </div>
          <div>
            <dt>Ville / site</dt>
            <dd>${escapeHtml(summary.location)}</dd>
          </div>
          <div>
            <dt>Installation</dt>
            <dd>${escapeHtml(summary.installation)}</dd>
          </div>
        </dl>

        ${
          summary.features.length
            ? `
                <div>
                  <h3>Ce que vous recevrez</h3>
                  <ul class="payment-feature-list">
                    ${summary.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
                  </ul>
                </div>
              `
            : ""
        }
      `;
    }
  }

  hydrateBookingForm(summary);
  fillSummaryFields(informationForm, summary);

  fillVisibleField(informationForm, "#information-full-name", summary.fullName);
  fillVisibleField(informationForm, "#information-phone", summary.phone);
  fillVisibleField(informationForm, "#information-email", summary.email);

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

      if (!validatePreinstallationPhotos(bookingForm, bookingStatus)) {
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
      await submitForm(informationForm, informationStatus);
    });
  }
})();
