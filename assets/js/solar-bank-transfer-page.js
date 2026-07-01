(function () {
  const bookingForm = document.querySelector("#bank-transfer-booking-form");
  const bookingStatus = document.querySelector("#bank-transfer-form-status");
  const informationForm = document.querySelector("#payment-information-form");
  const informationStatus = document.querySelector("#payment-information-status");
  const summaryNode = document.querySelector("[data-payment-summary]");
  const params = new URLSearchParams(window.location.search);

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

  async function submitForm(form, statusNode) {
    const submitButton = form.querySelector('[type="submit"]');
    const sendingMessage = form.dataset.sendingMessage || "Envoi en cours...";
    const successMessage = form.dataset.successMessage || "Merci. Votre demande a bien été reçue.";
    const errorMessage = form.dataset.errorMessage || "L'envoi n'a pas abouti. Merci de réessayer.";
    const defaultLabel = submitButton?.textContent || "Envoyer";

    statusNode.textContent = "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = sendingMessage;
    }

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        statusNode.textContent = successMessage;
      } else {
        statusNode.textContent = result.message ? `${errorMessage} ${result.message}` : errorMessage;
      }
    } catch (error) {
      console.error("Erreur d'envoi du formulaire :", error);
      statusNode.textContent = errorMessage;
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
    distance: getTextParam("distance", "À confirmer"),
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

  fillSummaryFields(bookingForm, summary);
  fillSummaryFields(informationForm, summary);

  fillVisibleField(bookingForm, "#payment-full-name", summary.fullName);
  fillVisibleField(bookingForm, "#payment-phone", summary.phone);
  fillVisibleField(bookingForm, "#payment-email", summary.email);
  fillVisibleField(bookingForm, "#payment-city", summary.location !== "À confirmer" ? summary.location : "");

  fillVisibleField(informationForm, "#information-full-name", summary.fullName);
  fillVisibleField(informationForm, "#information-phone", summary.phone);
  fillVisibleField(informationForm, "#information-email", summary.email);

  if (bookingForm && bookingStatus) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await submitForm(bookingForm, bookingStatus);
    });
  }

  if (informationForm && informationStatus) {
    informationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await submitForm(informationForm, informationStatus);
    });
  }
})();
