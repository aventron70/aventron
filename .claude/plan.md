# Plan — Configurator / payment fixes

## 1. Mobile header: keep hamburger + logo pinned
**File:** `styles.css` (`.site-header`, `.landing-header`)
- Confirm `.site-header` is `position: fixed` on mobile; add defensive rule if needed.
- Convert `.landing-header` to `position: fixed` on mobile so the payment/configurator-style header behaves the same way.
- Add a scroll-aware background class so the header stays readable while scrolling.

## 2. Mobile configurator: hide the progress sidebar
**Files:** `assets/css/solar-configurator.css`, `assets/css/configurator-page.css`
- Add `@media (max-width: 640px) { .solar-progress-sidebar { display: none; } }` so "Votre progression" is not shown on phones.
- Keep the existing desktop sidebar behavior.

## 3. Wi-Fi step: use image cards, remove badges/radio
**File:** `assets/js/solar-water-heater-configurator.js`
- In `renderWifiFieldGroup()`, replace the current icon-only technical cards with image-based cards using `assets/images/wifi.png` and `assets/images/nonwifi.png`.
- Remove the "Oui" / "Non" badges.
- Hide the upper-right radio indicator for these cards (target `.solar-version-card--wifi` or add a dedicated modifier).
- Keep the follow-up "Ajouter l'installation Wi-Fi ?" cards unchanged except for consistent spacing.
- Add corresponding CSS in `assets/css/solar-configurator.css` for image sizing and selected state.

## 4. Payment page: remove virement instructions string
**File:** `paiement-virement-installation.html`
- Remove the paragraph: "Effectuez le virement depuis votre application bancaire … formulaire de confirmation." inside the hero bank-card panel.

## 5. Virement form: show success modal after mail is sent
**Files:** `form-submit-success.html`, `assets/js/solar-bank-transfer-page.js`
- Fix `form-submit-success.html` so it posts the expected `formsubmit-success` message to the parent window (`window.parent.postMessage`).
- Verify the `solar-bank-transfer-page.js` listener opens the existing success modal when that message arrives.
- Keep the 30 s timeout as a fallback but make sure the happy path displays the modal instead of an error.

---

**Assumption confirmed:** Task 1 targets the main website header (hamburger + logo). Task 5 should display the existing success modal after a successful send.
