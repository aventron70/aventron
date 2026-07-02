(function () {
  const AVENTRON_REFERENCE = {
    label: "Tit Mellil, Casablanca-Settat, Maroc",
    latitude: 33.5588,
    longitude: -7.4863,
  };

  const PRICING = {
    capacityBase: {
      "150": 9000,
      "200": 11900,
      "300": 14000,
    },
    smartUpgrade: 2500,
    installationService: 500,
    deliveryOnlyFee: 1000,
    wifiSetup: 1000,
    plumbingSetup: 1000,
    waterFilter: 500,
    mixer: 250,
    travelBands: [
      { max: 100, fee: 500, label: "Distance jusqu'à 100 km" },
      { max: 300, fee: 700, label: "Distance jusqu'à 300 km" },
      { max: 600, fee: 1000, label: "Distance jusqu'à 600 km" },
    ],
    longDistanceFallbackFee: 1000,
    immediatePaymentDiscount: 700,
  };

  const CALLBACK_ACCESS_KEY = "4de3406d-49da-47a1-9e30-e5f9ae41aace";
  const BANK_TRANSFER_PAGE_PATH = "paiement-virement-installation.html";
  const CALLBACK_PAGE_PATH = "rappel-avant-paiement.html";

  const CITY_REFERENCE_DATA = [
    { label: "Casablanca", aliases: ["casa"], latitude: 33.5731, longitude: -7.5898 },
    { label: "Mohammedia", aliases: [], latitude: 33.6835, longitude: -7.3846 },
    { label: "Rabat", aliases: [], latitude: 34.0209, longitude: -6.8416 },
    { label: "Salé", aliases: [], latitude: 34.0331, longitude: -6.7985 },
    { label: "Kénitra", aliases: ["kenitra"], latitude: 34.261, longitude: -6.5802 },
    { label: "Tanger", aliases: ["tangier"], latitude: 35.7595, longitude: -5.834 },
    { label: "Tétouan", aliases: ["tetouan"], latitude: 35.5889, longitude: -5.3626 },
    { label: "Marrakech", aliases: [], latitude: 31.6295, longitude: -7.9811 },
    { label: "Agadir", aliases: [], latitude: 30.4278, longitude: -9.5981 },
    { label: "Essaouira", aliases: [], latitude: 31.5085, longitude: -9.7595 },
    { label: "Safi", aliases: [], latitude: 32.2994, longitude: -9.2372 },
    { label: "El Jadida", aliases: ["jadida"], latitude: 33.2316, longitude: -8.5007 },
    { label: "Settat", aliases: [], latitude: 33.001, longitude: -7.6166 },
    { label: "Benslimane", aliases: [], latitude: 33.6186, longitude: -7.1196 },
    { label: "Fès", aliases: ["fes"], latitude: 34.0331, longitude: -5.0003 },
    { label: "Meknès", aliases: ["meknes"], latitude: 33.8935, longitude: -5.5473 },
    { label: "Oujda", aliases: [], latitude: 34.6814, longitude: -1.9086 },
    { label: "Nador", aliases: [], latitude: 35.1681, longitude: -2.9335 },
    { label: "Berkane", aliases: [], latitude: 34.9218, longitude: -2.3194 },
    { label: "Khouribga", aliases: [], latitude: 32.886, longitude: -6.9209 },
    { label: "Béni Mellal", aliases: ["beni mellal"], latitude: 32.3373, longitude: -6.3498 },
    { label: "Taza", aliases: [], latitude: 34.2133, longitude: -4.0083 },
    { label: "Errachidia", aliases: [], latitude: 31.9314, longitude: -4.4244 },
    { label: "Ouarzazate", aliases: [], latitude: 30.9335, longitude: -6.937 },
    { label: "Guelmim", aliases: [], latitude: 28.987, longitude: -10.0574 },
    { label: "Laâyoune", aliases: ["laayoune"], latitude: 27.1536, longitude: -13.2033 },
    { label: "Dakhla", aliases: [], latitude: 23.6848, longitude: -15.957 },
  ];

  const CITY_LOOKUP = CITY_REFERENCE_DATA.reduce((lookup, city) => {
    lookup[normalizeString(city.label)] = city;

    city.aliases.forEach((alias) => {
      lookup[normalizeString(alias)] = city;
    });

    return lookup;
  }, {});

  const CITY_OPTIONS = CITY_REFERENCE_DATA.map((city) => city.label).sort((left, right) =>
    left.localeCompare(right, "fr")
  );

  function findNearestCity(latitude, longitude) {
    return CITY_REFERENCE_DATA.reduce((closestCity, city) => {
      const distanceKm = haversineDistance(latitude, longitude, city.latitude, city.longitude);

      if (!closestCity || distanceKm < closestCity.distanceKm) {
        return {
          ...city,
          distanceKm,
        };
      }

      return closestCity;
    }, null);
  }

  function normalizeString(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[’']/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("fr-MA", {
      maximumFractionDigits: 0,
    }).format(value);
  }

  function trackMetaCustomEvent(eventName) {
    if (typeof window === "undefined" || typeof window.fbq !== "function") {
      return;
    }

    try {
      window.fbq("trackCustom", eventName);
    } catch (error) {
      console.error("Meta Pixel custom event failed:", error);
    }
  }

  function haversineDistance(fromLatitude, fromLongitude, toLatitude, toLongitude) {
    const earthRadius = 6371;
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const latitudeDelta = toRadians(toLatitude - fromLatitude);
    const longitudeDelta = toRadians(toLongitude - fromLongitude);
    const latitudeA = toRadians(fromLatitude);
    const latitudeB = toRadians(toLatitude);

    const a =
      Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
      Math.sin(longitudeDelta / 2) *
        Math.sin(longitudeDelta / 2) *
        Math.cos(latitudeA) *
        Math.cos(latitudeB);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  function roundDistance(distance) {
    return Math.max(1, Math.round(distance));
  }

  function renderSolarHeaterSymbol(variant) {
    if (variant === "150") {
      return '<img class="solar-choice-card__symbol-image solar-choice-card__symbol-image--150" src="assets/images/solar-heater-150.png" alt="" />';
    }

    if (variant === "200") {
      return '<img class="solar-choice-card__symbol-image solar-choice-card__symbol-image--200" src="assets/images/solar-heater-200.png" alt="" />';
    }

    return '<img class="solar-choice-card__symbol-image solar-choice-card__symbol-image--300" src="assets/images/solar-heater-300.png" alt="" />';
  }

  function renderWaterFilterSymbol() {
    return '<img class="solar-choice-card__symbol-image solar-choice-card__symbol-image--filter" src="assets/images/solar-water-filter.png" alt="" />';
  }

  function renderMixerSymbol() {
    return '<img class="solar-choice-card__symbol-image solar-choice-card__symbol-image--mixer" src="assets/images/solar-mixer.png" alt="" />';
  }

  function renderCrossedSymbol(symbolMarkup) {
    return `
      <span class="solar-choice-card__symbol-visual solar-choice-card__symbol-visual--crossed">
        ${symbolMarkup}
        <span class="solar-choice-card__symbol-cross" aria-hidden="true">X</span>
      </span>
    `;
  }

  function renderUiIcon(iconName, className = "") {
    const classAttribute = className ? ` class="${className}"` : "";

    switch (iconName) {
      case "bank":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10h18M5 10v7m14-7v7M2 20h20M12 4 3 8v2h18V8l-9-4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "info":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 10v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.2" r="1.1" fill="currentColor"/></svg>`;
      case "tag":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m13.8 3.6 6.6 6.6a2 2 0 0 1 0 2.8l-6.9 6.9a2 2 0 0 1-2.8 0l-6.6-6.6V5.6a2 2 0 0 1 2-2h7.7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><path d="M9 15 15 9M10.2 10.2h.01M13.8 13.8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "lock":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10V8a3.5 3.5 0 1 1 7 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 14v2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "arrow-right":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "message":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 7.5h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H10l-4 3v-3H6a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 12h8M8 15h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "phone":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.8 4.5h2.4l1.4 4-1.7 1.9a14.2 14.2 0 0 0 4.7 4.7l1.9-1.7 4 1.4v2.4a1.8 1.8 0 0 1-1.8 1.8h-.9C10.7 19 5 13.3 5 6.3v-.9a1.8 1.8 0 0 1 1.8-1.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
      case "user":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "mail":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.4" stroke="currentColor" stroke-width="1.8"/><path d="m5.5 8 6.5 5 6.5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "shield":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.8 5.5 6.4v5.5c0 4.2 2.6 7.9 6.5 9.3 3.9-1.4 6.5-5.1 6.5-9.3V6.4L12 3.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9.4 12.2 1.8 1.8 3.5-3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "wifi":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 9.5a12 12 0 0 1 15 0M7.7 12.7a7.5 7.5 0 0 1 8.6 0M10.9 15.9a3.1 3.1 0 0 1 2.2 0" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="18.6" r="1.3" fill="currentColor"/></svg>`;
      case "roof-wifi":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5.2 8.8a10.9 10.9 0 0 1 13.6 0M8.2 11.8a6.5 6.5 0 0 1 7.6 0M11 14.7a2.7 2.7 0 0 1 2 0" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/><circle cx="12" cy="16.9" r="1.1" fill="currentColor"/><path d="m5.8 19.1 6.2-5.3 6.2 5.3" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "wrench":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 5.5a4 4 0 0 0 4.8 4.8l-3.6 3.6-2.8-2.8-5.8 5.8a1.7 1.7 0 1 1-2.4-2.4l5.8-5.8-2.8-2.8 3.6-3.6a4 4 0 0 0 3.2 3.2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "truck":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7.5h11v8H3v-8ZM14 10h3.1l2.4 2.6v2.9H14V10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.8"/></svg>`;
      case "pin":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/></svg>`;
      case "target":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v3.1M12 18.1v3.1M2.8 12h3.1M18.1 12h3.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "droplet":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.4C10.2 6.5 6.8 9.9 6.8 13.7a5.2 5.2 0 0 0 10.4 0c0-3.8-3.4-7.2-5.2-10.3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.6 13.6a2.4 2.4 0 0 0 2.4 2.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "calculator":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="2.8" stroke="currentColor" stroke-width="1.8"/><rect x="8" y="6.7" width="8" height="3.2" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M8.4 13.2h1.2M12 13.2h1.2M15.6 13.2h.01M8.4 16.8h1.2M12 16.8h1.2M15.6 16.8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "sun":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.7" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "bolt":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.2 2.8 6.8 13h4.2l-1 8.2L17.2 11H13l.2-8.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
      case "thermometer":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 13.5V6.8a2.6 2.6 0 1 1 5.2 0v6.7a4 4 0 1 1-5.2 0Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.6 10.5h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      case "mobile":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="3.5" width="10" height="17" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 6.8h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17.2" r="0.9" fill="currentColor"/></svg>`;
      case "clock":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.8" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.8v4.5l3.1 1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "scales":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.2v14.6M8.5 6.6h7M5.4 9.1 3 13.4a2.9 2.9 0 0 0 2.5 1.5h.1a2.9 2.9 0 0 0 2.5-1.5L5.7 9.1M18.6 9.1 16.2 13.4a2.9 2.9 0 0 0 2.5 1.5h.1a2.9 2.9 0 0 0 2.5-1.5l-2.4-4.3M9 19.2h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "check":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5.5 12.6 4.1 4.1 8.9-9.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "minus":
        return `<svg${classAttribute} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
      default:
        return "";
    }
  }

  class SolarWaterHeaterConfigurator extends HTMLElement {
    constructor() {
      super();

      this.state = {
        capacity: "",
        model: "",
        waterFilter: "",
        mixer: "",
        installationMode: "",
        city: "",
        locationMode: "manual",
        coordinates: null,
        distanceDetails: null,
        roofWifi: "",
        wifiSetup: "",
        roofElectricity: "",
        roofPlumbing: "",
        plumbingSetup: "",
        isLocating: false,
        priceCalculated: false,
        priceSummary: null,
        validationErrors: [],
        customerErrors: [],
        configMessage: null,
        customerMessage: null,
        customer: {
          fullName: "",
          phone: "",
          email: "",
        },
        currentStepId: "capacity",
        callbackSubmitting: false,
        activeCompareModal: "",
        isPricePopupOpen: false,
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleInput = this.handleInput.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleWindowKeydown = this.handleWindowKeydown.bind(this);
    }

    connectedCallback() {
      if (this.isConnectedOnce) {
        return;
      }

      this.isConnectedOnce = true;
      this.addEventListener("change", this.handleChange);
      this.addEventListener("input", this.handleInput);
      this.addEventListener("click", this.handleClick);
      window.addEventListener("keydown", this.handleWindowKeydown);
      this.render();
    }

    disconnectedCallback() {
      this.removeEventListener("change", this.handleChange);
      this.removeEventListener("input", this.handleInput);
      this.removeEventListener("click", this.handleClick);
      window.removeEventListener("keydown", this.handleWindowKeydown);
    }

    handleWindowKeydown(event) {
      if (event.key === "Escape") {
        if (this.state.activeCompareModal) {
          this.state.activeCompareModal = "";
          this.render();
          return;
        }

        if (this.state.isPricePopupOpen) {
          this.state.isPricePopupOpen = false;
          this.render();
        }
      }
    }

    handleChange(event) {
      const target = event.target;

      switch (target.name) {
        case "capacity":
          this.state.capacity = target.value;
          this.onConfigurationUpdated();
          break;
        case "model":
          this.state.model = target.value;
          if (target.value !== "smart") {
            this.state.roofWifi = "";
            this.state.wifiSetup = "";
          }
          this.onConfigurationUpdated();
          break;
        case "waterFilter":
          this.state.waterFilter = target.value;
          this.onConfigurationUpdated();
          break;
        case "mixer":
          this.state.mixer = target.value;
          this.onConfigurationUpdated();
          break;
        case "installationMode":
          this.state.installationMode = target.value;
          if (target.value !== "withInstallation") {
            this.clearInstallationTechnicalFields();
          }
          this.onConfigurationUpdated();
          break;
        case "installationCity":
          this.state.city = target.value.trim();
          this.state.locationMode = "manual";
          this.state.coordinates = null;
          this.refreshDistanceEstimate({ silent: true });
          this.onConfigurationUpdated();
          break;
        case "roofWifi":
          this.state.roofWifi = target.value;
          if (target.value === "yes") {
            this.state.wifiSetup = "";
          }
          this.onConfigurationUpdated();
          break;
        case "wifiSetup":
          this.state.wifiSetup = target.value;
          this.onConfigurationUpdated();
          break;
        case "roofElectricity":
          this.state.roofElectricity = target.value;
          this.onConfigurationUpdated();
          break;
        case "roofPlumbing":
          this.state.roofPlumbing = target.value;
          if (target.value === "yes") {
            this.state.plumbingSetup = "";
          }
          this.onConfigurationUpdated();
          break;
        case "plumbingSetup":
          this.state.plumbingSetup = target.value;
          this.onConfigurationUpdated();
          break;
        default:
          break;
      }
    }

    handleInput(event) {
      const target = event.target;

      switch (target.name) {
        case "customerFullName":
          this.state.customer.fullName = target.value;
          break;
        case "customerPhone":
          this.state.customer.phone = target.value;
          break;
        case "customerEmail":
          this.state.customer.email = target.value;
          break;
        default:
          break;
      }
    }

    handleClick(event) {
      const actionNode = event.target.closest("[data-action]");

      if (!actionNode) {
        return;
      }

      const action = actionNode.dataset.action;

      switch (action) {
        case "estimate-distance":
          this.refreshDistanceEstimate();
          this.resetPriceIfConfigurationChanges();
          this.render();
          break;
        case "use-location":
          this.useCurrentLocation();
          break;
        case "calculate-price":
          this.calculatePrice();
          break;
        case "go-to-bank-transfer":
          this.goToBankTransferFlow(actionNode.dataset.paymentMode || "payNow");
          break;
        case "close-price-popup":
          this.state.isPricePopupOpen = false;
          this.render();
          break;
        case "price-popup-more-info":
          trackMetaCustomEvent("IneedmoreInfo");
          this.state.isPricePopupOpen = false;
          this.goToCallbackFlow(this.getImmediatePaymentOfferSummary(this.state.priceSummary) ? "payNow" : "payLater");
          break;
        case "request-callback":
          this.goToCallbackFlow(this.getImmediatePaymentOfferSummary(this.state.priceSummary) ? "payNow" : "payLater");
          break;
        case "previous-step":
          this.goToPreviousStep();
          break;
        case "next-step":
          this.goToNextStep();
          break;
        case "jump-to-step":
          this.goToWizardStep(actionNode.dataset.stepTarget);
          break;
        case "open-version-compare":
          this.state.activeCompareModal = "version";
          this.render();
          break;
        case "close-version-compare":
          this.state.activeCompareModal = "";
          this.render();
          break;
        case "open-compare-modal":
          this.state.activeCompareModal = actionNode.dataset.compareTopic || "";
          this.render();
          break;
        case "close-compare-modal":
          this.state.activeCompareModal = "";
          this.render();
          break;
        default:
          break;
      }
    }

    clearInstallationTechnicalFields() {
      this.state.roofWifi = "";
      this.state.wifiSetup = "";
      this.state.roofElectricity = "";
      this.state.roofPlumbing = "";
      this.state.plumbingSetup = "";
    }

    isLocationStepComplete() {
      const distanceDetails = this.calculateDistance();
      return Boolean(distanceDetails && distanceDetails.status === "known");
    }

    isWifiStepRelevant() {
      return this.state.installationMode === "withInstallation" && this.state.model === "smart";
    }

    isWifiStepComplete() {
      if (!this.isWifiStepRelevant()) {
        return true;
      }

      return this.state.roofWifi === "yes" || (this.state.roofWifi === "no" && Boolean(this.state.wifiSetup));
    }

    isElectricityStepRelevant() {
      return this.state.installationMode === "withInstallation";
    }

    isElectricityStepComplete() {
      if (!this.isElectricityStepRelevant()) {
        return true;
      }

      return Boolean(this.state.roofElectricity);
    }

    isPlumbingStepRelevant() {
      return this.state.installationMode === "withInstallation";
    }

    isPlumbingStepComplete() {
      if (!this.isPlumbingStepRelevant()) {
        return true;
      }

      return this.state.roofPlumbing === "yes" || (this.state.roofPlumbing === "no" && Boolean(this.state.plumbingSetup));
    }

    isConfigurationReadyForReview() {
      const withInstallation = this.state.installationMode === "withInstallation";

      return Boolean(
        this.state.capacity &&
          this.state.model &&
          this.state.waterFilter &&
          this.state.mixer &&
          this.state.installationMode &&
          this.isLocationStepComplete() &&
          (!withInstallation || (this.isElectricityStepComplete() && this.isPlumbingStepComplete())) &&
          this.isWifiStepComplete()
      );
    }

    getWizardSteps() {
      const steps = [
        { id: "capacity", title: "Capacité souhaitée" },
        { id: "version", title: "Version" },
        { id: "water-filter", title: "Filtre à eau" },
        { id: "mixer", title: "Mélangeur" },
        { id: "installation-mode", title: "Installation" },
        { id: "installation-city", title: "Ville d'installation" },
      ];

      if (this.isWifiStepRelevant()) {
        steps.push({ id: "roof-wifi", title: "Wi-Fi sur le toit" });
      }

      if (this.isElectricityStepRelevant()) {
        steps.push({ id: "roof-electricity", title: "Électricité sur le toit" });
      }

      if (this.isPlumbingStepRelevant()) {
        steps.push({ id: "roof-plumbing", title: "Préinstallation plomberie" });
      }

      steps.push({ id: "payment", title: "Paiement et rappel" });

      return steps;
    }

    getLastConfigurationStepId() {
      const steps = this.getWizardSteps().filter((step) => step.id !== "payment");
      return steps[steps.length - 1]?.id || "capacity";
    }

    getWizardStepIndex(stepId) {
      return this.getWizardSteps().findIndex((step) => step.id === stepId);
    }

    getCurrentWizardStep() {
      const steps = this.getWizardSteps();
      return steps.find((step) => step.id === this.state.currentStepId) || steps[0] || null;
    }

    isWizardStepSatisfied(stepId) {
      switch (stepId) {
        case "capacity":
          return Boolean(this.state.capacity);
        case "version":
          return Boolean(this.state.model);
        case "water-filter":
          return Boolean(this.state.waterFilter);
        case "mixer":
          return Boolean(this.state.mixer);
        case "installation-mode":
          return Boolean(this.state.installationMode);
        case "installation-city":
          return this.isLocationStepComplete();
        case "roof-wifi":
          return this.isWifiStepComplete();
        case "roof-electricity":
          return this.isElectricityStepComplete();
        case "roof-plumbing":
          return this.isPlumbingStepComplete();
        case "summary":
          return this.isConfigurationReadyForReview();
        case "total-price":
          return Boolean(this.state.priceCalculated && this.state.priceSummary);
        case "payment":
          return Boolean(this.state.priceCalculated && this.state.priceSummary);
        default:
          return false;
      }
    }

    getWizardStepValidationMessage(stepId) {
      switch (stepId) {
        case "capacity":
          return "Choisissez une capacité avant de continuer.";
        case "version":
          return "Choisissez une version avant de continuer.";
        case "water-filter":
          return "Choisissez avec ou sans filtre à eau avant de continuer.";
        case "mixer":
          return "Choisissez avec ou sans mélangeur avant de continuer.";
        case "installation-mode":
          return "Choisissez avec installation ou livraison uniquement avant de continuer.";
        case "installation-city": {
          const distanceDetails = this.calculateDistance();

          if (!this.state.city.trim() && !this.state.coordinates) {
            return "Choisissez votre ville dans la liste ou utilisez votre localisation GPS.";
          }

          if (distanceDetails && distanceDetails.status === "unknown") {
            return "Choisissez une ville valide dans la liste ou utilisez votre localisation GPS.";
          }

          return "Choisissez une ville valide avant de continuer.";
        }
        case "roof-wifi":
          return this.state.roofWifi === "no" && !this.state.wifiSetup
            ? "Choisissez si vous souhaitez ajouter l'installation Wi-Fi sur le toit."
            : "Indiquez si le Wi-Fi est disponible sur le toit.";
        case "roof-electricity":
          return "Indiquez si l'électricité est disponible sur le toit.";
        case "roof-plumbing":
          return this.state.roofPlumbing === "no" && !this.state.plumbingSetup
            ? "Choisissez si vous souhaitez ajouter la préinstallation plomberie."
            : "Indiquez si la préinstallation eau chaude / eau froide existe sur le toit.";
        case "summary": {
          const errors = this.validateConfiguration();
          return errors[0] || "Complétez la configuration avant de continuer.";
        }
        case "total-price":
          return 'Cliquez sur "Calculer le prix final" pour passer à l\'étape suivante.';
        case "payment":
          return "Calculez d'abord le prix final pour afficher le paiement et la demande de rappel.";
        default:
          return "Complétez cette étape avant de continuer.";
      }
    }

    canAccessWizardStep(stepId) {
      if (stepId === "payment" && !this.state.priceCalculated) {
        return false;
      }

      const steps = this.getWizardSteps();
      const targetIndex = steps.findIndex((step) => step.id === stepId);

      if (targetIndex === -1) {
        return false;
      }

      for (let index = 0; index < targetIndex; index += 1) {
        if (!this.isWizardStepSatisfied(steps[index].id)) {
          return false;
        }
      }

      return true;
    }

    syncCurrentStepId() {
      const steps = this.getWizardSteps();
      const lastConfigurationStepId = this.getLastConfigurationStepId();

      if (!steps.length) {
        this.state.currentStepId = "capacity";
        return;
      }

      const currentVisible = steps.some((step) => step.id === this.state.currentStepId);

      if (currentVisible && this.canAccessWizardStep(this.state.currentStepId)) {
        return;
      }

      const firstIncompleteConfigurationStep = steps.find(
        (step) => step.id !== "payment" && !this.isWizardStepSatisfied(step.id)
      );

      if (firstIncompleteConfigurationStep) {
        this.state.currentStepId = firstIncompleteConfigurationStep.id;
        return;
      }

      this.state.currentStepId = this.state.priceCalculated ? "payment" : lastConfigurationStepId;
    }

    setWizardStepError(text) {
      this.state.configMessage = {
        type: "warning",
        title: "Complétez cette étape",
        text,
      };
      this.state.validationErrors = [];
    }

    goToWizardStep(stepId, options = {}) {
      const steps = this.getWizardSteps();
      const targetStep = steps.find((step) => step.id === stepId);

      if (!targetStep) {
        this.syncCurrentStepId();
        this.render();
        return;
      }

      if (!options.force && !this.canAccessWizardStep(stepId)) {
        const currentStep = this.getCurrentWizardStep();
        this.setWizardStepError(this.getWizardStepValidationMessage(currentStep?.id || targetStep.id));
        this.render();
        return;
      }

      this.state.currentStepId = stepId;
      this.state.validationErrors = [];
      this.render();
      this.scrollToStep(stepId);
    }

    goToPreviousStep() {
      const steps = this.getWizardSteps();
      const currentIndex = steps.findIndex((step) => step.id === this.state.currentStepId);

      if (currentIndex <= 0) {
        return;
      }

      this.state.currentStepId = steps[currentIndex - 1].id;
      this.state.validationErrors = [];
      this.render();
      this.scrollToStep(this.state.currentStepId);
    }

    goToNextStep() {
      const steps = this.getWizardSteps();
      const currentIndex = steps.findIndex((step) => step.id === this.state.currentStepId);

      if (currentIndex === -1 || currentIndex >= steps.length - 1) {
        return;
      }

      const currentStepId = steps[currentIndex].id;

      if (!this.isWizardStepSatisfied(currentStepId)) {
        this.setWizardStepError(this.getWizardStepValidationMessage(currentStepId));
        this.render();
        return;
      }

      this.state.currentStepId = steps[currentIndex + 1].id;
      this.state.validationErrors = [];
      this.render();
      this.scrollToStep(this.state.currentStepId);
    }

    onConfigurationUpdated() {
      this.state.validationErrors = [];
      this.state.customerErrors = [];
      this.state.customerMessage = null;
      this.state.isPricePopupOpen = false;
      this.enforceInstallationAvailability();
      this.resetPriceIfConfigurationChanges();
      this.syncCurrentStepId();
      this.render();
    }

    resetPriceIfConfigurationChanges() {
      if (!this.state.priceCalculated) {
        if (!this.state.validationErrors.length) {
          this.state.configMessage = null;
        }
        return;
      }

      this.state.priceCalculated = false;
      this.state.priceSummary = null;
      this.state.configMessage = {
        type: "warning",
        title: "Configuration modifiée",
        text: 'Votre configuration a changé. Cliquez de nouveau sur "Calculer le prix final".',
      };
    }

    refreshDistanceEstimate(options = {}) {
      const details = this.calculateDistance();
      this.state.distanceDetails = details;
      this.enforceInstallationAvailability();

      if (options.silent) {
        return details;
      }

      if (!details) {
        this.state.configMessage = {
          type: "info",
          title: "Ville à renseigner",
          text: "Choisissez votre ville dans la liste ou utilisez votre localisation GPS pour finaliser le calcul.",
        };
        return details;
      }

      if (details.status === "unknown") {
        this.state.configMessage = {
          type: "warning",
          title: "Ville à confirmer",
          text: "Sélectionnez une ville valide dans la liste ou utilisez votre localisation GPS.",
        };
        return details;
      }

      this.state.configMessage = {
        type: "info",
        title: details.source === "geolocation" ? "Localisation GPS prise en compte" : "Ville prise en compte",
        text:
          details.source === "geolocation"
            ? `La ville la plus proche a été détectée automatiquement : ${details.locationLabel}.`
            : "Votre ville d'installation a bien été enregistrée pour le calcul automatique.",
      };

      return details;
    }

    calculateDistance() {
      if (this.state.coordinates) {
        const distance = roundDistance(
          haversineDistance(
            AVENTRON_REFERENCE.latitude,
            AVENTRON_REFERENCE.longitude,
            this.state.coordinates.latitude,
            this.state.coordinates.longitude
          )
        );

        return {
          status: "known",
          source: "geolocation",
          locationLabel: this.state.city.trim() || "Localisation GPS",
          km: distance,
          label: `${distance} km`,
        };
      }

      if (!this.state.city.trim()) {
        return null;
      }

      const city = CITY_LOOKUP[normalizeString(this.state.city)];

      if (!city) {
        return {
          status: "unknown",
          source: "manual",
          locationLabel: this.state.city.trim(),
          km: null,
          label: "Ville à confirmer",
        };
      }

      const distance = roundDistance(
        haversineDistance(
          AVENTRON_REFERENCE.latitude,
          AVENTRON_REFERENCE.longitude,
          city.latitude,
          city.longitude
        )
      );

      return {
        status: "known",
        source: "manual",
        locationLabel: city.label,
        km: distance,
        label: `${distance} km`,
      };
    }

    getTravelFee(distanceKm) {
      const band = PRICING.travelBands.find((candidate) => distanceKm <= candidate.max);

      if (band) {
        return {
          fee: band.fee,
          label: band.label,
          requiresCustomStudy: false,
          installationAvailable: true,
        };
      }

      return {
        fee: PRICING.longDistanceFallbackFee,
        label: "Distance supérieure à 600 km",
        requiresCustomStudy: true,
        installationAvailable: false,
      };
    }

    enforceInstallationAvailability() {
      const details = this.state.distanceDetails;

      if (!details || details.status !== "known") {
        return;
      }

      if (details.km > 600 && this.state.installationMode === "withInstallation") {
        this.state.installationMode = "deliveryOnly";
        this.clearInstallationTechnicalFields();
        this.state.configMessage = {
          type: "warning",
          title: "Installation non disponible automatiquement",
          text: "Pour cette zone, seule la livraison peut être proposée. L'option installation a été retirée.",
        };
      }
    }

    validateConfiguration() {
      const errors = [];
      const distanceDetails = this.calculateDistance();

      if (!this.state.capacity) {
        errors.push("Choisissez une capacité.");
      }

      if (!this.state.model) {
        errors.push("Choisissez une version.");
      }

      if (!this.state.waterFilter) {
        errors.push("Choisissez avec ou sans filtre à eau.");
      }

      if (!this.state.mixer) {
        errors.push("Choisissez avec ou sans mélangeur.");
      }

      if (!this.state.installationMode) {
        errors.push("Choisissez avec installation ou livraison uniquement.");
      }

      if (!this.state.city.trim() && !this.state.coordinates) {
        errors.push("Choisissez votre ville dans la liste ou utilisez votre localisation GPS.");
      }

      if (distanceDetails && distanceDetails.status === "unknown") {
        errors.push("Choisissez une ville valide dans la liste ou utilisez votre localisation GPS.");
      }

      if (
        this.state.installationMode === "withInstallation" &&
        distanceDetails &&
        distanceDetails.status === "known" &&
        distanceDetails.km > 600
      ) {
        errors.push("L'installation Aventron n'est pas disponible automatiquement pour cette zone.");
      }

      if (this.state.installationMode === "withInstallation") {
        if (this.state.model === "smart" && !this.state.roofWifi) {
          errors.push("Indiquez si le Wi-Fi est disponible sur le toit.");
        }

        if (this.state.model === "smart" && this.state.roofWifi === "no" && !this.state.wifiSetup) {
          errors.push("Choisissez si vous souhaitez ajouter l'installation Wi-Fi sur le toit.");
        }

        if (!this.state.roofElectricity) {
          errors.push("Indiquez si l'électricité est disponible sur le toit.");
        }

        if (!this.state.roofPlumbing) {
          errors.push("Indiquez si la préinstallation eau chaude / eau froide existe sur le toit.");
        }

        if (this.state.roofPlumbing === "no" && !this.state.plumbingSetup) {
          errors.push("Choisissez si vous souhaitez ajouter la préinstallation plomberie.");
        }
      }

      return errors;
    }

    validateCustomerDetails() {
      const errors = [];

      if (!this.state.customer.fullName.trim()) {
        errors.push("Nom complet manquant.");
      }

      if (!this.state.customer.phone.trim()) {
        errors.push("Numéro de téléphone manquant.");
      }

      if (!this.state.customer.email.trim()) {
        errors.push("Email manquant.");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.customer.email.trim())) {
        errors.push("Email invalide.");
      }

      return errors;
    }

    calculatePrice() {
      const errors = this.validateConfiguration();
      this.state.validationErrors = errors;
      this.state.customerErrors = [];
      this.state.customerMessage = null;

      if (errors.length) {
        this.state.isPricePopupOpen = false;
        this.state.configMessage = {
          type: "error",
          title: "Informations obligatoires manquantes",
          text: "Complétez toutes les informations avant de calculer le prix final.",
        };
        this.render();
        return;
      }

      const distanceDetails = this.refreshDistanceEstimate({ silent: true });
      const travelFee = this.getTravelFee(distanceDetails.km);
      const capacityPrice = PRICING.capacityBase[this.state.capacity];
      const smartFee = this.state.model === "smart" ? PRICING.smartUpgrade : 0;
      const installationFee = this.state.installationMode === "withInstallation" ? PRICING.installationService : 0;
      const deliveryOnlyFee = this.state.installationMode === "deliveryOnly" ? PRICING.deliveryOnlyFee : 0;
      const logisticsFee = travelFee.fee;
      const wifiSetupFee =
        this.state.installationMode === "withInstallation" &&
        this.state.model === "smart" &&
        this.state.roofWifi === "no" &&
        this.state.wifiSetup === "add"
          ? PRICING.wifiSetup
          : 0;
      const plumbingSetupFee =
        this.state.installationMode === "withInstallation" &&
        this.state.roofPlumbing === "no" &&
        this.state.plumbingSetup === "add"
          ? PRICING.plumbingSetup
          : 0;
      const waterFilterFee = this.state.waterFilter === "with" ? PRICING.waterFilter : 0;
      const mixerFee = this.state.mixer === "with" ? PRICING.mixer : 0;
      const totalPrice =
        capacityPrice +
        smartFee +
        installationFee +
        deliveryOnlyFee +
        logisticsFee +
        wifiSetupFee +
        plumbingSetupFee +
        waterFilterFee +
        mixerFee;

      const notes = [];

      if (this.state.installationMode === "withInstallation" && this.state.model === "smart" && this.state.roofWifi === "no" && this.state.wifiSetup === "skip") {
        notes.push("Le Wi-Fi devra être préparé sur le toit avant la mise en service de la version Smart connectée.");
      }

      if (this.state.installationMode === "withInstallation" && this.state.roofElectricity === "no") {
        notes.push("Un électricien devra préparer l'alimentation sur le toit avant l'intervention.");
      }

      if (this.state.installationMode === "withInstallation" && this.state.roofPlumbing === "no" && this.state.plumbingSetup === "skip") {
        notes.push("La préinstallation eau chaude / eau froide devra être préparée avant l'installation.");
      }

      if (travelFee.requiresCustomStudy) {
        notes.push("Pour cette zone, la livraison reste possible, mais l'installation automatique n'est pas proposée.");
      }

      this.state.priceSummary = {
        capacity: this.state.capacity,
        capacityLabel: `${this.state.capacity} L`,
        model: this.state.model,
        modelLabel: this.state.model === "smart" ? "Smart connectée" : "Standard",
        waterFilter: this.state.waterFilter,
        waterFilterLabel: this.state.waterFilter === "with" ? "Avec filtre à eau" : "Sans filtre à eau",
        mixer: this.state.mixer,
        mixerLabel: this.state.mixer === "with" ? "Avec mélangeur" : "Sans mélangeur",
        locationLabel: distanceDetails.locationLabel,
        distanceLabel: distanceDetails.label,
        distanceBandLabel: travelFee.label,
        installationMode: this.state.installationMode,
        installationModeLabel:
          this.state.installationMode === "withInstallation"
            ? "Avec installation Aventron"
            : "Livraison uniquement",
        roofWifi: this.state.roofWifi,
        roofWifiLabel:
          this.state.installationMode === "withInstallation" && this.state.model === "smart"
            ? this.state.roofWifi === "yes"
              ? "Oui"
              : "Non"
            : "Non nécessaire",
        wifiSetup: this.state.wifiSetup,
        wifiSetupLabel:
          this.state.installationMode === "withInstallation" &&
          this.state.model === "smart" &&
          this.state.roofWifi === "no"
            ? this.state.wifiSetup === "add"
              ? "Ajout Aventron"
              : "À préparer par le client"
            : "",
        roofElectricity: this.state.roofElectricity,
        roofElectricityLabel:
          this.state.installationMode === "withInstallation"
            ? this.state.roofElectricity === "yes"
              ? "Oui"
              : "Non"
            : "Non nécessaire",
        roofPlumbing: this.state.roofPlumbing,
        roofPlumbingLabel:
          this.state.installationMode === "withInstallation"
            ? this.state.roofPlumbing === "yes"
              ? "Oui"
              : "Non"
            : "Non nécessaire",
        plumbingSetup: this.state.plumbingSetup,
        plumbingSetupLabel:
          this.state.installationMode === "withInstallation" && this.state.roofPlumbing === "no"
            ? this.state.plumbingSetup === "add"
              ? "Ajout Aventron"
              : "À préparer par le client"
            : "",
        deliveryOnlyFee,
        totalPrice,
        standardPrice: totalPrice,
        travelFee,
        requiresCustomStudy: travelFee.requiresCustomStudy,
        installationAvailable: travelFee.installationAvailable,
        notes,
      };

      this.state.priceCalculated = true;
      this.state.isPricePopupOpen = true;
      this.state.validationErrors = [];
      this.state.configMessage = {
        type: "success",
        title: "Prix final prêt",
        text: "Votre prix final TTC est disponible ci-dessous. Vous pouvez poursuivre vers le virement ou demander plus d'informations.",
      };
      this.state.currentStepId = "payment";

      trackMetaCustomEvent("ConfigurationCompleted");

      this.render();
      this.scrollToStep("payment");
    }

    getDisplayedSummary() {
      if (!this.state.priceSummary) {
        return null;
      }

      return this.state.priceSummary;
    }

    isImmediatePaymentOfferEligible(summary) {
      return (
        Boolean(summary) &&
        summary.installationMode === "withInstallation" &&
        summary.installationAvailable &&
        !summary.requiresCustomStudy
      );
    }

    isDeferredBankTransferEligible(summary) {
      return Boolean(summary) && summary.installationMode === "deliveryOnly";
    }

    getImmediatePaymentOfferSummary(summary = this.state.priceSummary) {
      if (!this.isImmediatePaymentOfferEligible(summary)) {
        return null;
      }

      return {
        ...summary,
        discountValue: PRICING.immediatePaymentDiscount,
        payNowPrice: Math.max(0, summary.standardPrice - PRICING.immediatePaymentDiscount),
      };
    }

    getDeferredBankTransferSummary(summary = this.state.priceSummary) {
      if (!this.isDeferredBankTransferEligible(summary)) {
        return null;
      }

      return {
        ...summary,
        transferPrice: summary.standardPrice,
        discountValue: 0,
      };
    }

    buildIncludedItems(summary) {
      if (!summary) {
        return [];
      }

      const items = [
        `${summary.capacityLabel} ${summary.modelLabel}`,
        summary.installationModeLabel,
      ];

      if (summary.installationMode === "deliveryOnly" && summary.deliveryOnlyFee > 0) {
        items.push(`Frais de livraison inclus (${formatCurrency(summary.deliveryOnlyFee)} DHS)`);
      }

      if (summary.waterFilter === "with") {
        items.push("Filtre à eau");
      }

      if (summary.mixer === "with") {
        items.push("Mélangeur thermostatique");
      }

      if (summary.model === "smart") {
        items.push("Pilotage Smart connectée");
      }

      if (summary.installationMode === "withInstallation" && summary.model === "smart") {
        if (summary.roofWifi === "yes") {
          items.push("Wi-Fi déjà disponible sur le toit");
        } else if (summary.wifiSetup === "add") {
          items.push("Ajout du Wi-Fi sur le toit");
        } else if (summary.roofWifi === "no") {
          items.push("Wi-Fi à préparer par le client");
        }
      }

      if (summary.installationMode === "withInstallation") {
        if (summary.roofElectricity === "yes") {
          items.push("Électricité déjà disponible sur le toit");
        } else if (summary.roofElectricity === "no") {
          items.push("Électricité à préparer par un électricien");
        }

        if (summary.roofPlumbing === "yes") {
          items.push("Préinstallation eau chaude / eau froide déjà présente");
        } else if (summary.plumbingSetup === "add") {
          items.push("Ajout de la préinstallation eau chaude / eau froide");
        } else if (summary.roofPlumbing === "no") {
          items.push("Préinstallation plomberie à préparer");
        }
      }

      return items;
    }

    buildCustomerFlowPageUrl(path, paymentMode = "payNow") {
      const summary = this.getDisplayedSummary();
      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      const deferredTransfer = this.getDeferredBankTransferSummary(summary);
      const url = new URL(path, window.location.href);

      if (!summary) {
        return url.toString();
      }

      const params = new URLSearchParams({
        capacity: summary.capacityLabel,
        model: summary.modelLabel,
        location: summary.locationLabel,
        distance: summary.distanceLabel,
        distanceBand: summary.distanceBandLabel,
        installation: summary.installationModeLabel,
        standardPrice: String(summary.standardPrice),
        payNowPrice:
          paymentMode === "payNow" && paymentOffer
            ? String(paymentOffer.payNowPrice)
            : paymentMode === "payLater" && deferredTransfer
              ? String(deferredTransfer.transferPrice)
              : String(summary.standardPrice),
        discount: paymentMode === "payNow" && paymentOffer ? String(paymentOffer.discountValue) : "0",
        paymentMode,
        features: JSON.stringify(this.buildIncludedItems(summary)),
      });

      if (this.state.customer.fullName.trim()) {
        params.set("fullName", this.state.customer.fullName.trim());
      }

      if (this.state.customer.phone.trim()) {
        params.set("phone", this.state.customer.phone.trim());
      }

      if (this.state.customer.email.trim()) {
        params.set("email", this.state.customer.email.trim());
      }

      url.search = params.toString();
      return url.toString();
    }

    buildBankTransferPageUrl(paymentMode = "payNow") {
      return this.buildCustomerFlowPageUrl(BANK_TRANSFER_PAGE_PATH, paymentMode);
    }

    buildCallbackPageUrl(paymentMode = "payNow") {
      return this.buildCustomerFlowPageUrl(CALLBACK_PAGE_PATH, paymentMode);
    }

    goToBankTransferFlow(paymentMode = "payNow") {
      if (!this.state.priceCalculated) {
        this.state.customerMessage = {
          type: "warning",
          title: "Calculez d'abord le prix",
          text: 'Cliquez sur "Calculer le prix final" avant de passer au paiement.',
        };
        this.render();
        return;
      }

      if (paymentMode === "payLater") {
        const deferredTransfer = this.getDeferredBankTransferSummary(this.state.priceSummary);

        if (!deferredTransfer) {
          this.state.customerMessage = {
            type: "warning",
            title: "Paiement par virement après non disponible",
            text: "Cette option est réservée au mode livraison uniquement.",
          };
          this.render();
          return;
        }
      } else {
        const paymentOffer = this.getImmediatePaymentOfferSummary(this.state.priceSummary);

        if (!paymentOffer) {
          this.state.customerMessage = {
            type: "warning",
            title: "Paiement immédiat non disponible",
            text: "Le paiement immédiat avec remise est réservé aux installations Aventron techniquement possibles.",
          };
          this.render();
          return;
        }
      }

      if (paymentMode === "payNow") {
        trackMetaCustomEvent("PayNow");
      }

      window.location.assign(this.buildBankTransferPageUrl(paymentMode));
    }

    goToCallbackFlow(paymentMode = "payNow") {
      window.location.assign(this.buildCallbackPageUrl(paymentMode));
    }

    scrollToFinalPrice() {
      requestAnimationFrame(() => {
        const target = this.querySelector("[data-price-anchor]");

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    }

    scrollToStep(stepId) {
      if (!stepId) {
        return;
      }

      const fallbackTargets = {
        capacity: "product",
        version: "product",
        "installation-mode": "product",
        "installation-city": "installation",
        "roof-wifi": "installation",
        "roof-electricity": "installation",
        "roof-plumbing": "installation",
        summary: "total-price",
      };

      requestAnimationFrame(() => {
        const target =
          this.querySelector(`[data-step-id="${stepId}"]`) ||
          this.querySelector(`[data-step-id="${fallbackTargets[stepId] || ""}"]`);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    }

    generateCustomerMessage() {
      const summary = this.getDisplayedSummary();

      if (!summary) {
        return "";
      }

      const lines = [
        "Bonjour Aventron Technologies,",
        "",
        "Je souhaite plus d'informations sur mon chauffe-eau solaire.",
        "",
        "Configuration choisie :",
        `* Produit : ${summary.capacityLabel} ${summary.modelLabel}`,
        `* Filtre à eau : ${summary.waterFilterLabel}`,
        `* Mélangeur : ${summary.mixerLabel}`,
        `* Installation : ${summary.installationModeLabel}`,
        `* Ville / localisation : ${summary.locationLabel}`,
        `* Prix final TTC : ${formatCurrency(summary.standardPrice)} DHS TTC`,
      ];

      if (summary.installationMode === "withInstallation" && summary.model === "smart") {
        lines.push(`* Wi-Fi sur le toit : ${summary.roofWifiLabel}`);
        if (summary.wifiSetupLabel) {
          lines.push(`* Wi-Fi à ajouter : ${summary.wifiSetupLabel}`);
        }
      }

      if (summary.installationMode === "withInstallation") {
        lines.push(`* Électricité sur le toit : ${summary.roofElectricityLabel}`);
        lines.push(`* Préinstallation plomberie : ${summary.roofPlumbingLabel}`);
        if (summary.plumbingSetupLabel) {
          lines.push(`* Préinstallation à ajouter : ${summary.plumbingSetupLabel}`);
        }
      }

      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      if (paymentOffer) {
        lines.push(`* Paiement immédiat par virement : ${formatCurrency(paymentOffer.payNowPrice)} DHS TTC`);
      }

      lines.push("");
      lines.push("Coordonnées client :");
      lines.push(`* Nom complet : ${this.state.customer.fullName}`);
      lines.push(`* Téléphone : ${this.state.customer.phone}`);
      lines.push(`* Email : ${this.state.customer.email}`);
      lines.push("");
      lines.push("Merci de me rappeler pour plus d'informations.");

      return lines.join("\n");
    }

    async submitCallbackRequest() {
      if (!this.state.priceCalculated) {
        this.state.customerMessage = {
          type: "warning",
          title: "Prix requis",
          text: 'Cliquez sur "Calculer le prix final" avant de demander un rappel.',
        };
        this.render();
        return;
      }

      const errors = this.validateCustomerDetails();
      this.state.customerErrors = errors;

      if (errors.length) {
        this.state.customerMessage = {
          type: "error",
          title: "Informations client manquantes",
          text: "Complétez votre nom, votre téléphone et votre email.",
        };
        this.render();
        return;
      }

      if (this.state.callbackSubmitting) {
        return;
      }

      const summary = this.getDisplayedSummary();
      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);

      this.state.callbackSubmitting = true;
      this.state.customerMessage = {
        type: "info",
        title: "Envoi en cours",
        text: "Nous envoyons votre demande d'information à Aventron Technologies.",
      };
      this.render();

      try {
        const payload = new FormData();
        payload.append("access_key", CALLBACK_ACCESS_KEY);
        payload.append("subject", "Demande d'informations - Configurateur chauffe-eau solaire");
        payload.append("from_name", "Aventron Technologies Website");
        payload.append("source_page", "Configurateur chauffe-eau solaire");
        payload.append("full_name", this.state.customer.fullName);
        payload.append("phone", this.state.customer.phone);
        payload.append("email", this.state.customer.email);
        payload.append("selected_capacity", summary.capacityLabel);
        payload.append("selected_model", summary.modelLabel);
        payload.append("selected_installation", summary.installationModeLabel);
        payload.append("selected_location", summary.locationLabel);
        payload.append("selected_distance", summary.distanceLabel);
        payload.append("selected_distance_band", summary.distanceBandLabel);
        payload.append("selected_filter", summary.waterFilterLabel);
        payload.append("selected_mixer", summary.mixerLabel);
        payload.append("final_price_ttc", `${summary.standardPrice} DHS`);

        if (paymentOffer) {
          payload.append("pay_now_price_ttc", `${paymentOffer.payNowPrice} DHS`);
          payload.append("immediate_discount", `${paymentOffer.discountValue} DHS`);
        }

        payload.append("message", this.generateCustomerMessage());

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: payload,
        });
        const result = await response.json();

        if (response.ok && result.success) {
          this.state.customerMessage = {
            type: "success",
            title: "Demande envoyée",
            text: "Merci. Nous vous rappellerons rapidement.",
          };
          this.state.customerErrors = [];
        } else {
          this.state.customerMessage = {
            type: "error",
            title: "Envoi non abouti",
            text: result.message || "La demande n'a pas pu être envoyée. Merci de réessayer.",
          };
        }
      } catch (error) {
        console.error("Callback request failed:", error);
        this.state.customerMessage = {
          type: "error",
          title: "Envoi non abouti",
          text: "La demande n'a pas pu être envoyée. Merci de réessayer.",
        };
      } finally {
        this.state.callbackSubmitting = false;
        this.render();
      }
    }

    useCurrentLocation() {
      if (!navigator.geolocation) {
        this.state.configMessage = {
          type: "error",
          title: "Géolocalisation indisponible",
          text: "Votre navigateur ne permet pas d'utiliser la géolocalisation. Choisissez votre ville dans la liste.",
        };
        this.render();
        return;
      }

      this.state.isLocating = true;
      this.state.configMessage = {
        type: "info",
        title: "Localisation en cours",
        text: "Nous recherchons votre position pour sélectionner automatiquement la ville la plus proche.",
      };
      this.render();

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nearestCity = findNearestCity(position.coords.latitude, position.coords.longitude);

          this.state.isLocating = false;
          this.state.locationMode = "geolocation";
          this.state.coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.state.city = nearestCity ? nearestCity.label : "";
          this.refreshDistanceEstimate();
          this.resetPriceIfConfigurationChanges();
          this.render();
        },
        () => {
          this.state.isLocating = false;
          this.state.configMessage = {
            type: "error",
            title: "Localisation refusée",
            text: "Nous n'avons pas pu accéder à votre localisation. Choisissez votre ville dans la liste.",
          };
          this.render();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    renderChoiceCards(name, options, selectedValue, classes = "") {
      return `
        <div class="solar-choice-grid ${classes}">
          ${options
            .map((option) => {
              const selected = selectedValue === option.value;
              const cardClass = option.cardClass ? ` ${option.cardClass}` : "";
              const disabled = Boolean(option.disabled);

              return `
                <label class="solar-choice-card${cardClass} ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}">
                  <input
                    class="solar-choice-input"
                    type="radio"
                    name="${escapeHtml(name)}"
                    value="${escapeHtml(option.value)}"
                    ${selected ? "checked" : ""}
                    ${disabled ? "disabled" : ""}
                  />
                  ${option.symbol ? `<span class="solar-choice-card__symbol">${option.symbol}</span>` : ""}
                  <span class="solar-choice-card__top">
                    <span class="solar-choice-card__title">
                      <strong>${escapeHtml(option.title)}</strong>
                      ${option.subtitle ? `<span>${escapeHtml(option.subtitle)}</span>` : ""}
                    </span>
                    ${option.badge ? `<span class="solar-choice-card__badge">${escapeHtml(option.badge)}</span>` : ""}
                  </span>
                  ${option.meta ? `<span class="solar-choice-card__meta">${escapeHtml(option.meta)}</span>` : ""}
                  ${option.hint ? `<span class="solar-choice-card__hint">${escapeHtml(option.hint)}</span>` : ""}
                </label>
              `;
            })
            .join("")}
        </div>
      `;
    }

    getComparisonShowcaseConfig(topic) {
      const configs = {
        version: {
          topic: "version",
          name: "model",
          selectedValue: this.state.model,
          compareLabel: "Comparer les fonctionnalités",
          noteText: "",
          cards: [
            {
              value: "standard",
              title: "Standard",
              subtitle: "Simple et efficace",
              badge: "",
              iconMarkup: renderUiIcon("shield", "solar-version-card__icon-svg"),
              features: [
                { icon: "sun", label: "Chauffage solaire" },
                { icon: "bolt", label: "Résistance de secours" },
                { icon: "user", label: "Utilisation classique" },
              ],
            },
            {
              value: "smart",
              title: "Smart connectée",
              subtitle: "Pilotage intelligent",
              badge: "Smart",
              iconMarkup: renderUiIcon("wifi", "solar-version-card__icon-svg"),
              features: [
                { icon: "thermometer", label: "Température en temps réel" },
                { icon: "mobile", label: "Contrôle via application" },
                { icon: "clock", label: "Programmation horaire" },
              ],
            },
          ],
          modal: {
            title: "Standard ou Smart connectée ?",
            description: "Comparez les fonctions clés pour choisir la version qui correspond le mieux à votre usage.",
            columns: [
              { key: "standard", label: "Standard" },
              { key: "smart", label: "Smart connectée" },
            ],
            rows: [
              {
                label: "Chauffage solaire",
                cells: {
                  standard: { state: "yes", text: "Inclus" },
                  smart: { state: "yes", text: "Inclus" },
                },
              },
              {
                label: "Résistance de secours",
                cells: {
                  standard: { state: "yes", text: "Incluse" },
                  smart: { state: "yes", text: "Incluse" },
                },
              },
              {
                label: "Température en temps réel",
                cells: {
                  standard: { state: "no", text: "Non" },
                  smart: { state: "yes", text: "Oui" },
                },
              },
              {
                label: "Contrôle via application",
                cells: {
                  standard: { state: "no", text: "Non" },
                  smart: { state: "yes", text: "Oui" },
                },
              },
              {
                label: "Programmation horaire",
                cells: {
                  standard: { state: "no", text: "Non" },
                  smart: { state: "yes", text: "Oui" },
                },
              },
              {
                label: "Usage principal",
                cells: {
                  standard: { state: "text", text: "Utilisation classique", icon: "user" },
                  smart: { state: "text", text: "Pilotage intelligent", icon: "wifi" },
                },
              },
            ],
          },
        },
        filter: {
          topic: "filter",
          name: "waterFilter",
          selectedValue: this.state.waterFilter,
          compareLabel: "Comparer les options",
          noteText: "Vous pourrez continuer la configuration après avoir choisi avec ou sans filtre à eau.",
          cards: [
            {
              value: "with",
              title: "Avec filtre à eau",
              subtitle: "Protection supplémentaire",
              iconMarkup: renderWaterFilterSymbol(),
              features: [
                { icon: "shield", label: "Réduit les impuretés" },
                { icon: "check", label: "Circuit mieux protégé" },
                { icon: "info", label: "Recommandé si l'eau est chargée" },
              ],
            },
            {
              value: "without",
              title: "Sans filtre à eau",
              subtitle: "Configuration simple",
              iconMarkup: renderCrossedSymbol(renderWaterFilterSymbol()),
              features: [
                { icon: "check", label: "Configuration simple" },
                { icon: "minus", label: "Pas de filtration ajoutée" },
                { icon: "info", label: "À choisir si l'eau est déjà propre" },
              ],
            },
          ],
          modal: {
            title: "Avec ou sans filtre à eau ?",
            description: "Comparez les deux options pour décider si vous souhaitez ajouter une protection contre les impuretés.",
            columns: [
              { key: "with", label: "Avec filtre à eau" },
              { key: "without", label: "Sans filtre à eau" },
            ],
            rows: [
              {
                label: "Réduction des impuretés",
                cells: {
                  with: { state: "yes", text: "Oui" },
                  without: { state: "no", text: "Non" },
                },
              },
              {
                label: "Protection du circuit",
                cells: {
                  with: { state: "yes", text: "Supplémentaire" },
                  without: { state: "text", text: "Standard" },
                },
              },
              {
                label: "Configuration la plus simple",
                cells: {
                  with: { state: "text", text: "Avec filtration" },
                  without: { state: "yes", text: "Oui" },
                },
              },
              {
                label: "Recommandé si l'eau est chargée",
                cells: {
                  with: { state: "yes", text: "Oui" },
                  without: { state: "no", text: "Non" },
                },
              },
            ],
          },
        },
        mixer: {
          topic: "mixer",
          name: "mixer",
          selectedValue: this.state.mixer,
          compareLabel: "Comparer les options",
          noteText: "Vous pourrez continuer la configuration après avoir choisi avec ou sans mélangeur.",
          cards: [
            {
              value: "with",
              title: "Avec mélangeur",
              subtitle: "Température maîtrisée",
              iconMarkup: renderMixerSymbol(),
              features: [
                { icon: "thermometer", label: "Température régulée" },
                { icon: "check", label: "Confort plus stable" },
                { icon: "shield", label: "Limite l'eau très chaude" },
              ],
            },
            {
              value: "without",
              title: "Sans mélangeur",
              subtitle: "Configuration simple",
              iconMarkup: renderCrossedSymbol(renderMixerSymbol()),
              features: [
                { icon: "check", label: "Configuration simple" },
                { icon: "minus", label: "Température non régulée" },
                { icon: "info", label: "Eau très chaude possible" },
              ],
            },
          ],
          modal: {
            title: "Avec ou sans mélangeur ?",
            description: "Comparez les deux options pour voir l'intérêt du mélangeur sur le confort et la sécurité d'usage.",
            columns: [
              { key: "with", label: "Avec mélangeur" },
              { key: "without", label: "Sans mélangeur" },
            ],
            rows: [
              {
                label: "Température de sortie régulée",
                cells: {
                  with: { state: "yes", text: "Oui" },
                  without: { state: "no", text: "Non" },
                },
              },
              {
                label: "Confort plus stable",
                cells: {
                  with: { state: "yes", text: "Oui" },
                  without: { state: "text", text: "Variable" },
                },
              },
              {
                label: "Limite l'eau très chaude",
                cells: {
                  with: { state: "yes", text: "Oui" },
                  without: { state: "no", text: "Non" },
                },
              },
              {
                label: "Configuration la plus simple",
                cells: {
                  with: { state: "text", text: "Avec régulation" },
                  without: { state: "yes", text: "Oui" },
                },
              },
            ],
          },
        },
      };

      return configs[topic] || null;
    }

    renderComparisonSelection(config) {
      if (!config) {
        return "";
      }

      return `
        <div class="solar-version-selector">
          ${this.renderShowcaseCards(
            config.name,
            config.cards,
            config.selectedValue,
            "",
            `solar-version-card--${config.topic}`
          )}

          <button class="solar-version-compare" type="button" data-action="open-compare-modal" data-compare-topic="${escapeHtml(config.topic)}">
            <span class="solar-version-compare__group">
              <span class="solar-version-compare__icon-shell">
                ${renderUiIcon("scales", "solar-version-compare__icon")}
              </span>
              <span>${escapeHtml(config.compareLabel)}</span>
            </span>
            ${renderUiIcon("arrow-right", "solar-version-compare__arrow")}
          </button>

          ${
            config.noteText
              ? `
                  <p class="solar-version-note">
                    ${renderUiIcon("info", "solar-version-note__icon")}
                    <span>${escapeHtml(config.noteText)}</span>
                  </p>
                `
              : ""
          }
        </div>
      `;
    }

    renderShowcaseCards(name, options, selectedValue, gridClasses = "", cardClasses = "") {
      return `
        <div class="solar-version-grid ${gridClasses}">
          ${options
            .map((option) => {
              const selected = selectedValue === option.value;
              const extraCardClasses = `${cardClasses}${option.cardClass ? ` ${option.cardClass}` : ""}`.trim();

              return `
                <label class="solar-choice-card solar-version-card ${extraCardClasses} ${selected ? "is-selected" : ""}">
                  <input
                    class="solar-choice-input"
                    type="radio"
                    name="${escapeHtml(name)}"
                    value="${escapeHtml(option.value)}"
                    ${selected ? "checked" : ""}
                  />
                  <span class="solar-version-card__header">
                    <span class="solar-version-card__icon">
                      ${option.iconMarkup}
                    </span>
                    <span class="solar-version-card__copy">
                      <span class="solar-version-card__title-row">
                        <strong>${escapeHtml(option.title)}</strong>
                        ${option.badge ? `<span class="solar-choice-card__badge">${escapeHtml(option.badge)}</span>` : ""}
                      </span>
                      <span class="solar-version-card__subtitle">${escapeHtml(option.subtitle)}</span>
                    </span>
                  </span>
                  <span class="solar-version-card__chips">
                    ${option.features
                      .map(
                        (feature) => `
                          <span class="solar-version-card__chip">
                            ${renderUiIcon(feature.icon, "solar-version-card__chip-icon")}
                            <span>${escapeHtml(feature.label)}</span>
                          </span>
                        `
                      )
                      .join("")}
                  </span>
                </label>
              `;
            })
            .join("")}
        </div>
      `;
    }

    renderVersionSelection() {
      return this.renderComparisonSelection(this.getComparisonShowcaseConfig("version"));
    }

    renderWaterFilterSelection() {
      return this.renderComparisonSelection(this.getComparisonShowcaseConfig("filter"));
    }

    renderMixerSelection() {
      return this.renderComparisonSelection(this.getComparisonShowcaseConfig("mixer"));
    }

    renderTechnicalSelection(name, options, selectedValue) {
      return this.renderShowcaseCards(
        name,
        options,
        selectedValue,
        "solar-version-grid--technical",
        "solar-version-card--technical"
      );
    }

    renderWifiFieldGroupLegacy() {
      const options = [
        {
          value: "yes",
          title: "Oui",
          subtitle: "Wi-Fi disponible",
        },
        {
          value: "no",
          title: "Non",
          subtitle: "Pas encore disponible",
        },
      ];

      return `
        <div class="solar-field-group solar-field-group--wifi">
          <div class="solar-wifi-panel__header">
            <span class="solar-wifi-panel__icon" aria-hidden="true">
              ${renderUiIcon("roof-wifi", "solar-wifi-panel__icon-svg")}
            </span>
            <div class="solar-wifi-panel__copy">
              <h5>Wi-Fi sur le toit</h5>
              <p>Requis pour la version Smart connectée.</p>
            </div>
          </div>

          <div class="solar-wifi-grid">
            ${options
              .map((option) => {
                const selected = this.state.roofWifi === option.value;

                return `
                  <label class="solar-choice-card solar-wifi-card ${selected ? "is-selected" : ""}">
                    <input
                      class="solar-choice-input"
                      type="radio"
                      name="roofWifi"
                      value="${escapeHtml(option.value)}"
                      ${selected ? "checked" : ""}
                    />
                    <span class="solar-wifi-card__icon" aria-hidden="true">
                      ${renderUiIcon("roof-wifi", "solar-wifi-card__icon-svg")}
                    </span>
                    <span class="solar-wifi-card__content">
                      <strong>${escapeHtml(option.title)}</strong>
                      <span>${escapeHtml(option.subtitle)}</span>
                    </span>
                  </label>
                `;
              })
              .join("")}
          </div>

          ${
            this.state.roofWifi === "no"
              ? `
                <div class="solar-followup-card">
                  <h6>Ajouter l'installation Wi-Fi sur le toit ?</h6>
                  <p>Vous pouvez demander cette préparation pour 1 000 DHS.</p>
                  ${this.renderChoiceCards(
                    "wifiSetup",
                    [
                      {
                        value: "add",
                        title: "Oui, ajouter",
                        subtitle: "Ajouter pour 1 000 DHS",
                        cardClass: "solar-choice-card--decision",
                      },
                      {
                        value: "skip",
                        title: "Non",
                        subtitle: "Je la prépare moi-même",
                        cardClass: "solar-choice-card--decision",
                      },
                    ],
                    this.state.wifiSetup,
                    "solar-choice-grid--two solar-choice-grid--decision"
                  )}
                </div>
              `
              : ""
          }
        </div>
      `;
    }

    renderWifiFieldGroup() {
      return this.renderFieldGroup(
        "Wi-Fi sur le toit",
        "Requis pour la version Smart connectée.",
        `
          ${this.renderTechnicalSelection(
            "roofWifi",
            [
              {
                value: "yes",
                title: "Wi-Fi disponible",
                subtitle: "Le réseau Wi-Fi est déjà accessible sur le toit.",
                badge: "Oui",
                iconMarkup: renderUiIcon("roof-wifi", "solar-version-card__icon-svg"),
                features: [
                  { icon: "check", label: "Connexion déjà disponible" },
                  { icon: "wifi", label: "Version Smart prête" },
                  { icon: "clock", label: "Mise en service plus fluide" },
                ],
              },
              {
                value: "no",
                title: "Wi-Fi à prévoir",
                subtitle: "Le réseau Wi-Fi n'est pas encore disponible sur le toit.",
                badge: "Non",
                iconMarkup: renderCrossedSymbol(renderUiIcon("roof-wifi", "solar-version-card__icon-svg")),
                features: [
                  { icon: "wrench", label: "Préparation réseau à prévoir" },
                  { icon: "wifi", label: "Option Aventron disponible" },
                  { icon: "info", label: "Vous pouvez continuer la configuration" },
                ],
              },
            ],
            this.state.roofWifi
          )}

          ${
            this.state.roofWifi === "no"
              ? `
                <div class="solar-followup-card">
                  <h6>Ajouter l'installation Wi-Fi sur le toit ?</h6>
                  <p>Vous pouvez demander cette préparation pour 1 000 DHS.</p>
                  ${this.renderChoiceCards(
                    "wifiSetup",
                    [
                      {
                        value: "add",
                        title: "Oui, ajouter",
                        subtitle: "Ajouter pour 1 000 DHS",
                        cardClass: "solar-choice-card--decision",
                      },
                      {
                        value: "skip",
                        title: "Non",
                        subtitle: "Je la prépare moi-même",
                        cardClass: "solar-choice-card--decision",
                      },
                    ],
                    this.state.wifiSetup,
                    "solar-choice-grid--two solar-choice-grid--decision"
                  )}
                </div>
              `
              : ""
          }
        `,
        { stepId: "roof-wifi" }
      );
    }

    renderComparisonModal() {
      const config = this.getComparisonShowcaseConfig(this.state.activeCompareModal);

      if (!config) {
        return "";
      }

      const renderComparisonCell = (cell) => {
        const iconName = cell.icon || (cell.state === "yes" ? "check" : cell.state === "no" ? "minus" : "");

        return `
          <span class="solar-compare-table__cell solar-compare-table__cell--${escapeHtml(cell.state)}">
            ${iconName ? renderUiIcon(iconName, "solar-compare-table__status-icon") : ""}
            <span>${escapeHtml(cell.text)}</span>
          </span>
        `;
      };

      return `
        <div class="solar-compare-modal" aria-hidden="false">
          <button
            class="solar-compare-modal__backdrop"
            type="button"
            data-action="close-version-compare"
            aria-label="Fermer la comparaison"
          ></button>

          <div class="solar-compare-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="solar-version-compare-title">
            <button
              class="solar-compare-modal__close"
              type="button"
              data-action="close-version-compare"
              aria-label="Fermer"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div class="solar-panel-badge solar-panel-badge--amber">
              ${renderUiIcon("scales", "solar-panel-badge__icon")}
              <span>Comparer les fonctionnalités</span>
            </div>

            <div class="solar-panel-copy solar-panel-copy--summary">
              <h4 id="solar-version-compare-title">${escapeHtml(config.modal.title)}</h4>
              <p>${escapeHtml(config.modal.description)}</p>
            </div>

            <div class="solar-compare-table-wrap">
              <table class="solar-compare-table">
                <thead>
                  <tr>
                    <th scope="col">Fonctionnalité</th>
                    ${config.modal.columns
                      .map(
                        (column) => `
                          <th scope="col" class="${config.selectedValue === column.key ? "is-current" : ""}">
                            ${escapeHtml(column.label)}
                          </th>
                        `
                      )
                      .join("")}
                  </tr>
                </thead>
                <tbody>
                  ${config.modal.rows
                    .map(
                      (row) => `
                        <tr>
                          <th scope="row">${escapeHtml(row.label)}</th>
                          ${config.modal.columns
                            .map(
                              (column) => `
                                <td
                                  data-column-label="${escapeHtml(column.label)}"
                                  data-current="${config.selectedValue === column.key ? "true" : "false"}"
                                >
                                  ${renderComparisonCell(row.cells[column.key])}
                                </td>
                              `
                            )
                            .join("")}
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    renderPricePopupModal() {
      if (!this.state.isPricePopupOpen) {
        return "";
      }

      const summary = this.getDisplayedSummary();

      if (!summary) {
        return "";
      }

      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      const deferredTransfer = this.getDeferredBankTransferSummary(summary);
      const paymentMode = paymentOffer ? "payNow" : "payLater";
      const paymentButtonLabel = paymentOffer ? "Payer maintenant" : "Continuer vers le virement";
      const paymentAmount = paymentOffer
        ? `${formatCurrency(paymentOffer.payNowPrice)} DHS TTC`
        : deferredTransfer
          ? `${formatCurrency(deferredTransfer.transferPrice)} DHS TTC`
          : `${formatCurrency(summary.standardPrice)} DHS TTC`;
      const helperText = paymentOffer
        ? `Payez maintenant par virement et profitez immédiatement de votre remise de ${formatCurrency(paymentOffer.discountValue)} DHS.`
        : "Vous pouvez continuer vers la page de virement ou demander à être rappelé avant paiement.";

      return `
        <div class="solar-compare-modal solar-compare-modal--price" aria-hidden="false">
          <button class="solar-compare-modal__backdrop" type="button" data-action="close-price-popup" aria-label="Fermer"></button>
          <div class="solar-compare-modal__dialog solar-price-modal">
            <button class="solar-compare-modal__close" type="button" data-action="close-price-popup" aria-label="Fermer">×</button>

            <div class="solar-price-modal__hero">
              <div class="solar-panel-badge solar-panel-badge--amber">
                ${renderUiIcon("calculator", "solar-panel-badge__icon")}
                <span>Prix final TTC prêt</span>
              </div>
              <div class="solar-panel-copy solar-panel-copy--summary">
                <h4>Votre prix final est prêt</h4>
                <p>${helperText}</p>
              </div>
            </div>

            <div class="solar-price-modal__amount ${paymentOffer ? "solar-price-modal__amount--promo" : ""}">
              <div class="solar-price-modal__amount-main">
                <span class="solar-summary-price__label">${paymentOffer ? "Offre immédiate TTC" : "Montant final TTC"}</span>
              ${
                paymentOffer
                  ? `
                      <div class="solar-price-modal__promo">
                        <span class="solar-price-modal__promo-old">${formatCurrency(summary.standardPrice)} DHS TTC</span>
                        <div class="solar-price-modal__promo-current">
                          <span class="solar-price-modal__promo-value">${formatCurrency(paymentOffer.payNowPrice)}</span>
                          <span class="solar-price-modal__promo-currency">DHS TTC</span>
                        </div>
                        <div class="solar-price-modal__promo-save">
                          <span class="solar-price-modal__promo-save-icon">${renderUiIcon("check", "solar-price-modal__promo-save-glyph")}</span>
                          <span>Économie immédiate : ${formatCurrency(paymentOffer.discountValue)} DHS</span>
                        </div>
                      </div>
                    `
                  : `
                      <strong>${paymentAmount}</strong>
                    `
              }
                <small>${
                  paymentOffer
                    ? `Prix remisé si vous payez maintenant par virement.`
                    : `Ce montant correspond à votre configuration actuelle.`
                }</small>
              </div>
              ${
                paymentOffer
                  ? `
                      <div class="solar-price-modal__decor" aria-hidden="true">
                        <span class="solar-price-modal__decor-spark solar-price-modal__decor-spark--one">✦</span>
                        <span class="solar-price-modal__decor-spark solar-price-modal__decor-spark--two">✦</span>
                        <span class="solar-price-modal__decor-badge">%</span>
                      </div>
                    `
                  : ""
              }
            </div>

            <p class="solar-panel-footnote solar-panel-footnote--amber solar-price-modal__note">
              ${renderUiIcon("shield", "solar-panel-footnote__icon")}
              <span>${
                paymentOffer
                  ? `Prix remisé si vous payez maintenant par virement. Remise immédiate de ${formatCurrency(paymentOffer.discountValue)} DHS.`
                  : `Vous pouvez continuer vers la page de virement ou demander à être rappelé avant paiement.`
              }</span>
            </p>

            <div class="solar-price-modal__actions">
              <button
                class="button button--primary solar-payment-cta"
                type="button"
                data-action="go-to-bank-transfer"
                data-payment-mode="${paymentMode}"
              >
                <span class="solar-payment-cta__group">
                  ${renderUiIcon(paymentOffer ? "lock" : "bank", "solar-payment-cta__glyph")}
                  <span>${paymentButtonLabel}</span>
                </span>
                <span class="solar-payment-cta__arrow">
                  ${renderUiIcon("arrow-right", "solar-payment-cta__glyph")}
                </span>
              </button>

              <button class="button button--secondary solar-price-modal__secondary" type="button" data-action="price-popup-more-info">
                ${renderUiIcon("info", "solar-action-button__icon")}
                <span>J'ai besoin de plus d'informations</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderFlashMessage(message, errors = []) {
      if (!message && !errors.length) {
        return "";
      }

      const type = message?.type || "info";
      const title = message?.title || "";
      const text = message?.text ? `<p>${escapeHtml(message.text)}</p>` : "";
      const list = errors.length
        ? `<ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>`
        : "";

      return `
        <div class="solar-flash solar-flash--${escapeHtml(type)}" aria-live="polite">
          ${title ? `<span class="solar-flash__title">${escapeHtml(title)}</span>` : ""}
          ${text}
          ${list}
        </div>
      `;
    }

    renderDistanceCard() {
      const details = this.state.distanceDetails;

      if (!details) {
        return `
          <div class="solar-distance-card solar-distance-card--pending">
            <div class="solar-distance-card__header">
              <strong>Distance non estimée</strong>
              <span class="solar-distance-card__pill">Ville à renseigner</span>
            </div>
            <div class="solar-distance-card__meta">
              <span>Indiquez votre ville ou utilisez votre localisation.</span>
            </div>
          </div>
        `;
      }

      if (details.status === "unknown") {
        return `
          <div class="solar-distance-card solar-distance-card--pending">
            <div class="solar-distance-card__header">
              <strong>Ville à confirmer</strong>
              <span class="solar-distance-card__pill">Estimation en attente</span>
            </div>
            <div class="solar-distance-card__meta">
              <span>Nous n'avons pas reconnu "${escapeHtml(details.locationLabel)}".</span>
            </div>
          </div>
        `;
      }

      const sourceLabel = details.source === "geolocation" ? "Calcul via votre GPS" : "Calcul via votre ville";

      return `
        <div class="solar-distance-card solar-distance-card--ready">
          <div class="solar-distance-card__header">
            <strong>${escapeHtml(details.label)} estimés</strong>
            <span class="solar-distance-card__pill">${escapeHtml(sourceLabel)}</span>
          </div>
          <div class="solar-distance-card__meta">
            <span>${escapeHtml(details.locationLabel)}</span>
          </div>
        </div>
      `;
    }

    renderFieldGroup(title, text, content, options = {}) {
      const stepId = options.stepId ? ` data-step-id="${escapeHtml(options.stepId)}"` : "";
      const className = options.className ? ` ${options.className}` : "";

      return `
        <div class="solar-field-group${className}"${stepId}>
          <div class="solar-field-group__header">
            <h5>${escapeHtml(title)}</h5>
            <p>${escapeHtml(text)}</p>
          </div>
          ${content}
        </div>
      `;
    }

    getConfigurationPreview() {
      const distanceDetails = this.calculateDistance();
      const withInstallation = this.state.installationMode === "withInstallation";

      return {
        capacityLabel: this.state.capacity ? `${this.state.capacity} L` : "",
        modelLabel: this.state.model === "smart" ? "Smart connectée" : this.state.model === "standard" ? "Standard" : "",
        waterFilterLabel:
          this.state.waterFilter === "with"
            ? "Avec filtre à eau"
            : this.state.waterFilter === "without"
              ? "Sans filtre à eau"
              : "",
        mixerLabel:
          this.state.mixer === "with" ? "Avec mélangeur" : this.state.mixer === "without" ? "Sans mélangeur" : "",
        installationModeLabel:
          this.state.installationMode === "withInstallation"
            ? "Avec installation Aventron"
            : this.state.installationMode === "deliveryOnly"
              ? "Livraison uniquement"
              : "",
        locationLabel: distanceDetails?.locationLabel || this.state.city.trim() || "À confirmer",
        distanceLabel: distanceDetails?.label || "",
        roofWifiLabel: this.isWifiStepRelevant()
          ? this.state.roofWifi === "yes"
            ? "Wi-Fi disponible"
            : this.state.roofWifi === "no"
              ? "Wi-Fi à prévoir"
              : ""
          : "",
        wifiSetupLabel:
          this.isWifiStepRelevant() && this.state.roofWifi === "no"
            ? this.state.wifiSetup === "add"
              ? "Ajout Aventron"
              : this.state.wifiSetup === "skip"
                ? "Préparation par le client"
                : ""
            : "",
        roofElectricityLabel: withInstallation
          ? this.state.roofElectricity === "yes"
            ? "Électricité disponible"
            : this.state.roofElectricity === "no"
              ? "Électricité à préparer"
              : ""
          : "",
        roofPlumbingLabel: withInstallation
          ? this.state.roofPlumbing === "yes"
            ? "Préinstallation prête"
            : this.state.roofPlumbing === "no"
              ? "Préinstallation à préparer"
              : ""
          : "",
        plumbingSetupLabel:
          withInstallation && this.state.roofPlumbing === "no"
            ? this.state.plumbingSetup === "add"
              ? "Ajout Aventron"
              : this.state.plumbingSetup === "skip"
                ? "Préparation par le client"
                : ""
            : "",
      };
    }

    buildPreviewItems(preview = this.getConfigurationPreview()) {
      const items = [];

      if (preview.capacityLabel && preview.modelLabel) {
        items.push(`${preview.capacityLabel} ${preview.modelLabel}`);
      }

      if (preview.waterFilterLabel) {
        items.push(preview.waterFilterLabel);
      }

      if (preview.mixerLabel) {
        items.push(preview.mixerLabel);
      }

      if (preview.installationModeLabel) {
        items.push(preview.installationModeLabel);
      }

      if (preview.roofWifiLabel) {
        items.push(preview.roofWifiLabel);
      }

      if (preview.wifiSetupLabel) {
        items.push(`Wi-Fi : ${preview.wifiSetupLabel}`);
      }

      if (preview.roofElectricityLabel) {
        items.push(preview.roofElectricityLabel);
      }

      if (preview.roofPlumbingLabel) {
        items.push(preview.roofPlumbingLabel);
      }

      if (preview.plumbingSetupLabel) {
        items.push(`Plomberie : ${preview.plumbingSetupLabel}`);
      }

      return items;
    }

    renderConfigurationPreviewCard() {
      const preview = this.getConfigurationPreview();
      const items = this.buildPreviewItems(preview);

      return `
        <div class="solar-summary-card solar-summary-card--preview" data-price-anchor>
          <div class="solar-summary-card__header">
            <div class="solar-panel-badge solar-panel-badge--amber">
              ${renderUiIcon("calculator", "solar-panel-badge__icon")}
              <span>Résumé</span>
            </div>
            <div class="solar-panel-copy solar-panel-copy--summary">
              <h4>Vérifiez votre configuration</h4>
              <p>Le prix final TTC reste masqué jusqu'à l'étape suivante.</p>
            </div>
          </div>

          <div class="solar-summary-card__price">
            <span class="solar-summary-price__label">Prix final TTC</span>
            <strong>Masqué jusqu'au calcul</strong>
            <small>Vous pourrez calculer le montant exact à l'étape suivante.</small>
          </div>

          <div class="solar-summary-meta">
            <div>
              <span>Ville d'installation</span>
              <strong>${escapeHtml(preview.locationLabel)}</strong>
            </div>
            <div>
              <span>Distance estimée</span>
              <strong>${escapeHtml(preview.distanceLabel || "À confirmer")}</strong>
            </div>
          </div>

          <div class="solar-summary-included">
            <h5>Votre configuration</h5>
            <p>Revoyez vos choix avant de passer au calcul final.</p>
            <ul class="solar-included-list">
              ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    }

    renderWizardNavigation(stepId, options = {}) {
      const steps = this.getWizardSteps();
      const stepIndex = steps.findIndex((step) => step.id === stepId);
      const lastConfigurationStepId = this.getLastConfigurationStepId();
      const useDirectCalculation = stepId === lastConfigurationStepId && !this.state.priceCalculated;
      const hasPrevious = stepIndex > 0;
      const hasNext = stepIndex > -1 && stepIndex < steps.length - 1 && !options.hideNext;
      const nextLabel = options.nextLabel || (useDirectCalculation ? "Calculer le prix final" : "Suivant");
      const nextAction = options.nextAction || (useDirectCalculation ? "calculate-price" : "next-step");

      return `
        <div class="solar-wizard-nav">
          ${
            hasPrevious
              ? '<button class="button button--secondary solar-wizard-nav__button" type="button" data-action="previous-step">Précédent</button>'
              : '<span class="solar-wizard-nav__spacer" aria-hidden="true"></span>'
          }
          ${
            hasNext
              ? `<button class="button button--primary solar-wizard-nav__button" type="button" data-action="${escapeHtml(nextAction)}">${escapeHtml(nextLabel)}</button>`
              : ""
          }
        </div>
      `;
    }

    renderWizardStepSection({ stepId, sectionTitle, sectionIntro, body, nextLabel, hideNext = false }) {
      const steps = this.getWizardSteps();
      const stepIndex = steps.findIndex((step) => step.id === stepId);

      return `
        <section class="solar-step solar-section-card solar-step--wizard" data-step-id="${escapeHtml(stepId)}">
          <div class="solar-step__heading">
            <span class="solar-step__index">${stepIndex + 1}</span>
            <div>
              <h4>${escapeHtml(sectionTitle)}</h4>
              <p class="solar-step__intro">${escapeHtml(sectionIntro)}</p>
            </div>
            <span class="solar-step__meta">Étape ${stepIndex + 1} / ${steps.length}</span>
          </div>

          <div class="solar-step__body">
            ${body}
            ${this.renderWizardNavigation(stepId, { nextLabel, hideNext })}
          </div>
        </section>
      `;
    }

    renderPaymentStepContent() {
      const summary = this.getDisplayedSummary();

      if (!summary) {
        return `
          <div class="solar-payment-empty">
            <div class="solar-panel-badge solar-panel-badge--blue">
              ${renderUiIcon("info", "solar-panel-badge__icon")}
              <span>Paiement et rappel</span>
            </div>
            <div class="solar-panel-copy solar-panel-copy--summary solar-panel-copy--info">
              <h4>Le paiement apparaîtra ici</h4>
              <p>Calculez d'abord le prix final pour afficher vos options.</p>
            </div>
          </div>
        `;
      }

      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      const deferredTransfer = this.getDeferredBankTransferSummary(summary);
      const nameInvalid = this.state.customerErrors.includes("Nom complet manquant.");
      const phoneInvalid = this.state.customerErrors.includes("Numéro de téléphone manquant.");
      const emailInvalid =
        this.state.customerErrors.includes("Email manquant.") || this.state.customerErrors.includes("Email invalide.");
      const transferAvailable = Boolean(paymentOffer || deferredTransfer);
      const transferTitle = paymentOffer ? "Je paie maintenant" : "Je paierai plus tard";
      const transferDescription = paymentOffer
        ? `Vous payez ${formatCurrency(paymentOffer.payNowPrice)} DHS TTC et vous profitez de la remise immédiate de ${formatCurrency(paymentOffer.discountValue)} DHS.`
        : `Si vous choisissez la livraison uniquement, ${formatCurrency(summary.deliveryOnlyFee)} DHS de frais de livraison sont déjà inclus dans votre prix final.`;
      const transferAmountLabel = paymentOffer ? "Montant à payer" : "Montant final";
      const transferAmountValue = paymentOffer
        ? `${formatCurrency(paymentOffer.payNowPrice)} DHS TTC`
        : deferredTransfer
          ? `${formatCurrency(deferredTransfer.transferPrice)} DHS TTC`
          : `${formatCurrency(summary.standardPrice)} DHS TTC`;
      const transferSecondaryLabel = paymentOffer ? "Remise immédiate" : "Frais de livraison";
      const transferSecondaryValue = paymentOffer
        ? `-${formatCurrency(paymentOffer.discountValue)} DHS`
        : `+${formatCurrency(summary.deliveryOnlyFee)} DHS`;
      const transferSecondaryClass = paymentOffer
        ? "solar-payment-breakdown__value--success"
        : "solar-payment-breakdown__value--accent";
      const transferSecondaryRowClass = paymentOffer
        ? "solar-payment-breakdown__row--discount"
        : "solar-payment-breakdown__row--surcharge";
      const transferOldPriceMarkup = paymentOffer
        ? `<span class="solar-payment-breakdown__old-price">${formatCurrency(summary.standardPrice)} DHS TTC</span>`
        : "";
      const transferButtonLabel = paymentOffer ? "Payer par virement" : "Payer plus tard par virement";
      const callbackButtonLabel = this.state.callbackSubmitting ? "Envoi en cours..." : "Demander un rappel";

      const transferPanel = transferAvailable
        ? `
            <article class="solar-payment-panel solar-payment-panel--transfer">
              <div class="solar-panel-badge solar-panel-badge--amber">
                ${renderUiIcon("bank", "solar-panel-badge__icon")}
                <span>Payer par virement</span>
              </div>

              <div class="solar-panel-copy">
                <h4>${transferTitle}</h4>
                <p>${transferDescription}</p>
              </div>

              <div class="solar-payment-breakdown">
                <div class="solar-payment-breakdown__rows">
                  <div class="solar-payment-breakdown__row solar-payment-breakdown__row--primary">
                    <span class="solar-payment-breakdown__label">${transferAmountLabel}</span>
                    ${transferOldPriceMarkup}
                    <strong class="solar-payment-breakdown__value">${transferAmountValue}</strong>
                  </div>
                  <div class="solar-payment-breakdown__row solar-payment-breakdown__row--secondary ${transferSecondaryRowClass}">
                    <span class="solar-payment-breakdown__label">${transferSecondaryLabel}</span>
                    <strong class="solar-payment-breakdown__value ${transferSecondaryClass}">${transferSecondaryValue}</strong>
                  </div>
                </div>
              </div>

              <button
                class="button button--primary solar-payment-cta"
                type="button"
                data-action="go-to-bank-transfer"
                data-payment-mode="${paymentOffer ? "payNow" : "payLater"}"
              >
                <span class="solar-payment-cta__group">
                  ${renderUiIcon(paymentOffer ? "lock" : "bank", "solar-payment-cta__glyph")}
                  <span>${transferButtonLabel}</span>
                </span>
                <span class="solar-payment-cta__arrow">
                  ${renderUiIcon("arrow-right", "solar-payment-cta__glyph")}
                </span>
              </button>

              <p class="solar-panel-footnote solar-panel-footnote--amber">
                ${renderUiIcon("shield", "solar-panel-footnote__icon")}
                <span>Paiement sécurisé et 100% fiable</span>
              </p>
            </article>
          `
        : `
            <article class="solar-payment-panel solar-payment-panel--transfer">
              <div class="solar-panel-badge solar-panel-badge--amber">
                ${renderUiIcon("bank", "solar-panel-badge__icon")}
                <span>Payer par virement</span>
              </div>

              <div class="solar-panel-copy">
                <h4>Paiement par virement non disponible</h4>
                <p>
                  Le paiement immédiat avec remise est disponible uniquement lorsque l'installation Aventron est
                  possible.
                </p>
              </div>

              <p class="solar-panel-footnote solar-panel-footnote--amber">
                ${renderUiIcon("shield", "solar-panel-footnote__icon")}
                <span>Nous vous proposerons la meilleure option disponible.</span>
              </p>
            </article>
          `;

      return `
        <div class="solar-payment-grid">
          ${transferPanel}

          <div class="solar-configurator__customer solar-configurator__customer--info">
            <div class="solar-panel-badge solar-panel-badge--blue">
              ${renderUiIcon("info", "solar-panel-badge__icon")}
              <span>Besoin d'informations</span>
            </div>

            <div class="solar-panel-copy solar-panel-copy--info">
              <h4>Être rappelé avant paiement</h4>
              <p>Laissez vos coordonnées. Un conseiller Aventron vous rappellera rapidement.</p>
            </div>

            ${this.renderFlashMessage(this.state.customerMessage, this.state.customerErrors)}

            <div class="contact-form solar-contact-form">
              <div class="contact-form__grid">
                <div class="contact-form__field solar-contact-field">
                  <label for="solar-customer-full-name">Nom complet</label>
                  <div class="solar-input-shell ${nameInvalid ? "is-invalid" : ""}">
                    <span class="solar-input-shell__icon">
                      ${renderUiIcon("user", "solar-input-shell__glyph")}
                    </span>
                    <input
                      id="solar-customer-full-name"
                      name="customerFullName"
                      type="text"
                      value="${escapeHtml(this.state.customer.fullName)}"
                      placeholder="Votre nom"
                      aria-invalid="${nameInvalid ? "true" : "false"}"
                    />
                  </div>
                </div>

                <div class="contact-form__field solar-contact-field">
                  <label for="solar-customer-phone">Numéro de téléphone</label>
                  <div class="solar-input-shell ${phoneInvalid ? "is-invalid" : ""}">
                    <span class="solar-input-shell__icon">
                      ${renderUiIcon("phone", "solar-input-shell__glyph")}
                    </span>
                    <input
                      id="solar-customer-phone"
                      name="customerPhone"
                      type="tel"
                      value="${escapeHtml(this.state.customer.phone)}"
                      placeholder="06 12 34 56 78"
                      aria-invalid="${phoneInvalid ? "true" : "false"}"
                    />
                  </div>
                </div>

                <div class="contact-form__field contact-form__field--full solar-contact-field">
                  <label for="solar-customer-email">Email</label>
                  <div class="solar-input-shell ${emailInvalid ? "is-invalid" : ""}">
                    <span class="solar-input-shell__icon">
                      ${renderUiIcon("mail", "solar-input-shell__glyph")}
                    </span>
                    <input
                      id="solar-customer-email"
                      name="customerEmail"
                      type="email"
                      value="${escapeHtml(this.state.customer.email)}"
                      placeholder="votre@email.com"
                      aria-invalid="${emailInvalid ? "true" : "false"}"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="solar-customer-footer">
              <div class="solar-customer-actions">
                <button
                  class="button solar-info-button"
                  type="button"
                  data-action="request-callback"
                  ${this.state.callbackSubmitting ? "disabled" : ""}
                >
                  ${renderUiIcon("message", "solar-info-button__icon")}
                  <span>${callbackButtonLabel}</span>
                </button>
              </div>

              <p class="solar-panel-footnote solar-panel-footnote--blue">
                ${renderUiIcon("shield", "solar-panel-footnote__icon")}
                <span>Vos données sont confidentielles et sécurisées.</span>
              </p>
            </div>
          </div>
        </div>
      `;
    }

    renderCurrentWizardStep() {
      const currentStepId = this.getCurrentWizardStep()?.id || "capacity";
      const distanceDetails = this.calculateDistance();
      const installationBlockedByZone = Boolean(
        distanceDetails && distanceDetails.status === "known" && distanceDetails.km > 600
      );

      switch (currentStepId) {
        case "capacity":
          return this.renderWizardStepSection({
            stepId: "capacity",
            sectionTitle: "Produit",
            sectionIntro: "Choisissez votre chauffe-eau solaire étape par étape.",
            body: this.renderFieldGroup(
              "Capacité",
              "Choisissez la taille du chauffe-eau solaire.",
              this.renderChoiceCards(
                "capacity",
                [
                  {
                    value: "150",
                    title: "150 L",
                    subtitle: "1 à 2 personnes",
                    cardClass: "solar-choice-card--capacity",
                    symbol: renderSolarHeaterSymbol("150"),
                  },
                  {
                    value: "200",
                    title: "200 L",
                    subtitle: "2 à 4 personnes",
                    cardClass: "solar-choice-card--capacity",
                    symbol: renderSolarHeaterSymbol("200"),
                  },
                  {
                    value: "300",
                    title: "300 L",
                    subtitle: "4 à 6 personnes",
                    cardClass: "solar-choice-card--capacity",
                    symbol: renderSolarHeaterSymbol("300"),
                  },
                ],
                this.state.capacity
              ),
              { stepId: "capacity" }
            ),
          });
        case "version":
          return this.renderWizardStepSection({
            stepId: "version",
            sectionTitle: "Produit",
            sectionIntro: "Choisissez la version qui correspond à vos besoins.",
            body: this.renderFieldGroup(
              "Version",
              "Comparez les fonctionnalités puis choisissez votre version.",
              this.renderVersionSelection(),
              { stepId: "version" }
            ),
          });
        case "water-filter":
          return this.renderWizardStepSection({
            stepId: "water-filter",
            sectionTitle: "Produit",
            sectionIntro: "Ajoutez les options importantes pour votre installation.",
            body: this.renderFieldGroup(
              "Filtre à eau",
              "Le filtre à eau aide à limiter les impuretés dans le circuit.",
              this.renderWaterFilterSelection(),
              { stepId: "water-filter" }
            ),
          });
        case "mixer":
          return this.renderWizardStepSection({
            stepId: "mixer",
            sectionTitle: "Produit",
            sectionIntro: "Continuez avec les options de confort et de sécurité.",
            body: this.renderFieldGroup(
              "Mélangeur",
              "Le mélangeur permet de limiter la température de sortie de l'eau chaude.",
              this.renderMixerSelection(),
              { stepId: "mixer" }
            ),
          });
        case "installation-mode":
          return this.renderWizardStepSection({
            stepId: "installation-mode",
            sectionTitle: "Installation",
            sectionIntro: "Choisissez comment vous souhaitez recevoir votre chauffe-eau solaire.",
            body: `
              ${this.renderFieldGroup(
                "Installation",
                "Choisissez si vous souhaitez l'installation Aventron.",
                this.renderChoiceCards(
                  "installationMode",
                  [
                    {
                      value: "withInstallation",
                      title: "Avec installation",
                      subtitle: installationBlockedByZone
                        ? "Indisponible pour cette zone"
                        : "Pose complète par Aventron",
                      badge: installationBlockedByZone ? "Indisponible" : "Service Aventron",
                      meta: installationBlockedByZone
                        ? "Choisissez une ville éligible pour activer cette option."
                        : "",
                      symbol: renderUiIcon("wrench", "solar-choice-card__feature-icon"),
                      cardClass: "solar-choice-card--feature solar-choice-card--installation",
                      disabled: installationBlockedByZone,
                    },
                    {
                      value: "deliveryOnly",
                      title: "Livraison uniquement",
                      subtitle: "Sans pose par Aventron",
                      symbol: renderUiIcon("truck", "solar-choice-card__feature-icon"),
                      cardClass: "solar-choice-card--feature solar-choice-card--installation",
                    },
                  ],
                  this.state.installationMode,
                  "solar-choice-grid--two solar-choice-grid--feature"
                ),
                { stepId: "installation-mode" }
              )}

              ${
                installationBlockedByZone
                  ? this.renderFlashMessage({
                      type: "warning",
                      title: "Installation Aventron indisponible pour cette zone",
                      text: "Pour cette ville, seule la livraison peut être proposée automatiquement.",
                    })
                  : ""
              }
            `,
          });
        case "installation-city":
          return this.renderWizardStepSection({
            stepId: "installation-city",
            sectionTitle: "Localisation",
            sectionIntro: "Votre ville permet d'ajuster automatiquement la logistique et le prix final.",
            body: this.renderFieldGroup(
              "Ville / localisation",
              "Choisissez la ville dans la liste ou laissez-nous la détecter via GPS.",
              `
                <div class="solar-location-card">
                  <div class="contact-form__field solar-contact-field solar-contact-field--location">
                    <label for="solar-installation-city">Ville d'installation</label>
                    <div class="solar-input-shell solar-input-shell--location">
                      <span class="solar-input-shell__icon">
                        ${renderUiIcon("pin", "solar-input-shell__glyph")}
                      </span>
                      <select
                        id="solar-installation-city"
                        name="installationCity"
                        required
                        ${this.state.isLocating ? "disabled" : ""}
                      >
                        <option value="" disabled ${this.state.city ? "" : "selected"}>Choisissez une ville</option>
                        ${CITY_OPTIONS.map(
                          (city) =>
                            `<option value="${escapeHtml(city)}" ${this.state.city === city ? "selected" : ""}>${escapeHtml(city)}</option>`
                        ).join("")}
                      </select>
                      <button
                        type="button"
                        class="solar-input-shell__action"
                        data-action="use-location"
                        aria-label="${this.state.isLocating ? "Localisation GPS en cours" : "Utiliser ma localisation GPS"}"
                        title="${this.state.isLocating ? "Localisation GPS en cours" : "Utiliser ma localisation GPS"}"
                        ${this.state.isLocating ? "disabled" : ""}
                      >
                        ${renderUiIcon("target", "solar-input-shell__action-icon")}
                      </button>
                    </div>
                  </div>
                </div>
              `,
              { stepId: "installation-city" }
            ),
          });
        case "roof-wifi":
          return this.renderWizardStepSection({
            stepId: "roof-wifi",
            sectionTitle: "Conditions techniques",
            sectionIntro: "Vérifiez les éléments nécessaires pour la version Smart connectée.",
            body: this.renderWifiFieldGroup(),
          });
        case "roof-electricity":
          return this.renderWizardStepSection({
            stepId: "roof-electricity",
            sectionTitle: "Conditions techniques",
            sectionIntro: "Vérifiez la préparation électrique sur le toit.",
            body: this.renderFieldGroup(
              "Électricité sur le toit",
              "L'alimentation électrique doit être disponible pour la mise en service.",
              `
                ${this.renderTechnicalSelection(
                  "roofElectricity",
                  [
                    {
                      value: "yes",
                      title: "Électricité disponible",
                      subtitle: "L'alimentation est déjà prête pour la mise en service.",
                      badge: "Oui",
                      iconMarkup: renderUiIcon("bolt", "solar-version-card__icon-svg"),
                      features: [
                        { icon: "check", label: "Toit déjà alimenté" },
                        { icon: "clock", label: "Mise en service plus fluide" },
                        { icon: "shield", label: "Aucune préparation supplémentaire" },
                      ],
                    },
                    {
                      value: "no",
                      title: "Électricité à préparer",
                      subtitle: "Une préparation est nécessaire avant l'intervention.",
                      badge: "Non",
                      iconMarkup: renderCrossedSymbol(renderUiIcon("bolt", "solar-version-card__icon-svg")),
                      features: [
                        { icon: "wrench", label: "Électricien à prévoir" },
                        { icon: "bolt", label: "Alimentation à préparer" },
                        { icon: "info", label: "Vous pouvez continuer la configuration" },
                      ],
                    },
                  ],
                  this.state.roofElectricity
                )}

                ${
                  this.state.roofElectricity === "no"
                    ? this.renderFlashMessage({
                        type: "warning",
                        title: "Électricien à prévoir",
                        text: "Merci de contacter votre électricien avant notre intervention. Vous pouvez continuer la configuration.",
                      })
                    : ""
                }
              `,
              { stepId: "roof-electricity" }
            ),
          });
        case "roof-plumbing":
          return this.renderWizardStepSection({
            stepId: "roof-plumbing",
            sectionTitle: "Conditions techniques",
            sectionIntro: "Confirmez la préparation plomberie nécessaire avant la pose.",
            body: this.renderFieldGroup(
              "Préinstallation eau chaude / eau froide",
              "Les arrivées doivent être disponibles sur le toit avant la pose.",
              `
                ${this.renderTechnicalSelection(
                  "roofPlumbing",
                  [
                    {
                      value: "yes",
                      title: "Préinstallation prête",
                      subtitle: "Les arrivées eau chaude / eau froide sont déjà disponibles.",
                      badge: "Oui",
                      iconMarkup: renderUiIcon("droplet", "solar-version-card__icon-svg"),
                      features: [
                        { icon: "check", label: "Arrivées déjà prêtes" },
                        { icon: "clock", label: "Pose plus simple" },
                        { icon: "shield", label: "Intervention plus rapide" },
                      ],
                    },
                    {
                      value: "no",
                      title: "Préinstallation à préparer",
                      subtitle: "Les arrivées doivent être préparées avant la pose.",
                      badge: "Non",
                      iconMarkup: renderCrossedSymbol(renderUiIcon("droplet", "solar-version-card__icon-svg")),
                      features: [
                        { icon: "wrench", label: "Préparation à prévoir" },
                        { icon: "droplet", label: "Raccordement à organiser" },
                        { icon: "info", label: "Option Aventron disponible" },
                      ],
                    },
                  ],
                  this.state.roofPlumbing
                )}

                ${
                  this.state.roofPlumbing === "no"
                    ? `
                        <div class="solar-followup-card">
                          <h6>Ajouter la préinstallation plomberie ?</h6>
                          <p>Vous pouvez demander cette préparation pour 1 000 DHS.</p>
                          ${this.renderChoiceCards(
                            "plumbingSetup",
                            [
                              {
                                value: "add",
                                title: "Oui, ajouter",
                                subtitle: "Ajouter pour 1 000 DHS",
                                cardClass: "solar-choice-card--decision",
                              },
                              {
                                value: "skip",
                                title: "Non",
                                subtitle: "Je la prépare moi-même",
                                cardClass: "solar-choice-card--decision",
                              },
                            ],
                            this.state.plumbingSetup,
                            "solar-choice-grid--two solar-choice-grid--decision"
                          )}
                        </div>
                      `
                    : ""
                }
              `,
              { stepId: "roof-plumbing" }
            ),
          });
        case "summary":
          return this.renderWizardStepSection({
            stepId: "summary",
            sectionTitle: "Résumé",
            sectionIntro: "Vérifiez tous vos choix avant de demander le prix final.",
            body: this.renderConfigurationPreviewCard(),
            nextLabel: "Passer au calcul",
          });
        case "total-price":
          return this.renderWizardStepSection({
            stepId: "total-price",
            sectionTitle: "Calcul du prix",
            sectionIntro: "Le prix final TTC apparaît seulement après votre clic de confirmation.",
            body: `
              <div class="solar-configurator__actions">
                <button class="button button--primary solar-action-button" type="button" data-action="calculate-price">
                  <span class="solar-action-button__group">
                    ${renderUiIcon("calculator", "solar-action-button__icon")}
                    <span>Calculer le prix final</span>
                  </span>
                </button>
              </div>
              ${this.renderSummaryCard()}
            `,
            hideNext: true,
          });
        case "payment":
        default:
          return this.renderWizardStepSection({
            stepId: "payment",
            sectionTitle: "Paiement et rappel",
            sectionIntro: "Payez par virement ou demandez un rappel.",
            body: this.renderPaymentStepContent(),
            hideNext: true,
          });
      }
    }

    getStepOverviewItems() {
      const steps = this.getWizardSteps();
      const currentIndex = steps.findIndex((step) => step.id === this.state.currentStepId);

      return steps.map((step, index) => {
        const accessible = this.canAccessWizardStep(step.id);
        const state = index < currentIndex ? "completed" : index === currentIndex ? "active" : accessible ? "available" : "pending";

        return {
          ...step,
          state,
          accessible,
          helper: index === currentIndex ? "Étape en cours" : "",
          lineBefore: index === 0 ? "none" : index - 1 < currentIndex ? "complete" : "pending",
          lineAfter: index === steps.length - 1 ? "none" : index < currentIndex ? "complete" : "pending",
        };
      });
    }

    renderStepOverview() {
      const steps = this.getStepOverviewItems();
      const currentIndex = steps.findIndex((step) => step.state === "active");
      const progressPercent = Math.round(((Math.max(currentIndex, 0) + 1) / Math.max(steps.length, 1)) * 100);

      return `
        <aside class="solar-progress-sidebar" aria-label="Progression du configurateur">
          <div class="solar-progress-sidebar__card">
            <div class="solar-progress-sidebar__header">
              <h4>Votre progression</h4>
              <p>${progressPercent}% complété</p>
            </div>

            <div
              class="solar-progress-sidebar__bar"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${progressPercent}"
              aria-label="Progression du configurateur"
            >
              <span class="solar-progress-sidebar__bar-fill" style="width: ${progressPercent}%;"></span>
            </div>

            <nav class="solar-progress" aria-label="Aperçu des étapes">
              ${steps
            .map(
              (step) => `
                <button
                  class="solar-progress__item solar-progress__item--${step.state}"
                  type="button"
                  data-action="jump-to-step"
                  data-step-target="${escapeHtml(step.id)}"
                  ${step.state === "active" ? 'aria-current="step"' : ""}
                  ${step.accessible ? "" : "disabled"}
                >
                  <span class="solar-progress__marker" aria-hidden="true">
                    ${
                      step.lineBefore !== "none"
                        ? `<span class="solar-progress__line solar-progress__line--before solar-progress__line--${step.lineBefore}"></span>`
                        : ""
                    }
                    <span class="solar-progress__index">
                      ${step.state === "completed" ? renderUiIcon("check", "solar-progress__check") : ""}
                    </span>
                    ${
                      step.lineAfter !== "none"
                        ? `<span class="solar-progress__line solar-progress__line--after solar-progress__line--${step.lineAfter}"></span>`
                        : ""
                    }
                  </span>
                  <span class="solar-progress__content">
                    <strong>${escapeHtml(step.title)}</strong>
                    ${step.helper ? `<span class="solar-progress__helper">${escapeHtml(step.helper)}</span>` : ""}
                  </span>
                </button>
              `
            )
            .join("")}
            </nav>
          </div>
        </aside>
      `;
    }

    renderProductSection() {
      const distanceDetails = this.calculateDistance();
      const installationBlockedByZone = Boolean(
        distanceDetails && distanceDetails.status === "known" && distanceDetails.km > 600
      );

      return `
        <section class="solar-step solar-section-card" data-step-id="product">
          <div class="solar-step__heading">
            <span class="solar-step__index">A</span>
            <div>
              <h4>Produit</h4>
              <p class="solar-step__intro">Choisissez votre chauffe-eau solaire et les options produit.</p>
            </div>
          </div>

          <div class="solar-step__body">
            ${this.renderFieldGroup(
              "Capacité",
              "Choisissez la taille du chauffe-eau solaire.",
              this.renderChoiceCards(
                "capacity",
                [
                  {
                    value: "150",
                    title: "150 L",
                    subtitle: "1 à 2 personnes",
                    cardClass: "solar-choice-card--capacity",
                    symbol: renderSolarHeaterSymbol("150"),
                  },
                  {
                    value: "200",
                    title: "200 L",
                    subtitle: "2 à 4 personnes",
                    cardClass: "solar-choice-card--capacity",
                    symbol: renderSolarHeaterSymbol("200"),
                  },
                  {
                    value: "300",
                    title: "300 L",
                    subtitle: "4 à 6 personnes",
                    cardClass: "solar-choice-card--capacity",
                    symbol: renderSolarHeaterSymbol("300"),
                  },
                ],
                this.state.capacity
              ),
              { stepId: "capacity" }
            )}

            ${this.renderFieldGroup(
              "Version",
              "Choisissez la version qui correspond à vos besoins.",
              this.renderVersionSelection(),
              { stepId: "version" }
            )}

            ${this.renderFieldGroup(
              "Filtre à eau",
              "Le filtre à eau aide à limiter les impuretés dans le circuit.",
              this.renderWaterFilterSelection()
            )}

            ${this.renderFieldGroup(
              "Mélangeur",
              "Le mélangeur permet de limiter la température de sortie de l'eau chaude.",
              this.renderMixerSelection()
            )}

            ${this.renderFieldGroup(
              "Installation",
              "Choisissez si vous souhaitez l'installation Aventron.",
              this.renderChoiceCards(
                "installationMode",
                [
                  {
                    value: "withInstallation",
                    title: "Avec installation",
                    subtitle: installationBlockedByZone
                      ? "Indisponible pour cette zone"
                      : "Pose complète par Aventron",
                    badge: installationBlockedByZone ? "Indisponible" : "Service Aventron",
                    meta: installationBlockedByZone
                      ? "Choisissez une ville éligible pour activer cette option."
                      : "",
                    symbol: renderUiIcon("wrench", "solar-choice-card__feature-icon"),
                    cardClass: "solar-choice-card--feature solar-choice-card--installation",
                    disabled: installationBlockedByZone,
                  },
                  {
                    value: "deliveryOnly",
                    title: "Livraison uniquement",
                    subtitle: "Sans pose par Aventron",
                    symbol: renderUiIcon("truck", "solar-choice-card__feature-icon"),
                    cardClass: "solar-choice-card--feature solar-choice-card--installation",
                  },
                ],
                this.state.installationMode,
                "solar-choice-grid--two solar-choice-grid--feature"
              ),
              { stepId: "installation-mode" }
            )}

            ${
              installationBlockedByZone
                ? this.renderFlashMessage({
                    type: "warning",
                    title: "Installation Aventron indisponible pour cette zone",
                    text: "Pour cette ville, seule la livraison peut être proposée automatiquement.",
                  })
                : ""
            }
          </div>
        </section>
      `;
    }

    renderInstallationSection() {
      const withInstallation = this.state.installationMode === "withInstallation";
      const smartInstallation = withInstallation && this.state.model === "smart";

      return `
        <section class="solar-step solar-section-card" data-step-id="installation">
          <div class="solar-step__heading">
            <span class="solar-step__index">B</span>
            <div>
              <h4>Installation</h4>
              <p class="solar-step__intro">Ville et conditions techniques sur le toit.</p>
            </div>
          </div>

          <div class="solar-step__body">
            ${this.renderFieldGroup(
              "Ville / localisation",
              "Choisissez la ville dans la liste ou laissez-nous la détecter via GPS pour ajuster automatiquement le prix final.",
              `
                <div class="solar-location-card">
                  <div class="solar-location-card__intro">
                    <div class="solar-panel-badge solar-panel-badge--amber">
                      ${renderUiIcon("pin", "solar-panel-badge__icon")}
                      <span>Ville d'installation</span>
                    </div>
                    <p>Sélectionnez votre ville dans la liste ou utilisez votre localisation GPS.</p>
                  </div>
                  <div class="contact-form__field solar-contact-field solar-contact-field--location">
                    <label for="solar-installation-city">Ville d'installation</label>
                    <div class="solar-input-shell solar-input-shell--location">
                      <span class="solar-input-shell__icon">
                        ${renderUiIcon("pin", "solar-input-shell__glyph")}
                      </span>
                      <select
                        id="solar-installation-city"
                        name="installationCity"
                        required
                        ${this.state.isLocating ? "disabled" : ""}
                      >
                        <option value="" disabled ${this.state.city ? "" : "selected"}>Choisissez une ville</option>
                        ${CITY_OPTIONS.map(
                          (city) =>
                            `<option value="${escapeHtml(city)}" ${this.state.city === city ? "selected" : ""}>${escapeHtml(city)}</option>`
                        ).join("")}
                      </select>
                    </div>
                  </div>
                  <div class="solar-location-actions solar-location-actions--single">
                    <button
                      type="button"
                      class="button button--secondary solar-action-button"
                      data-action="use-location"
                      ${this.state.isLocating ? "disabled" : ""}
                    >
                      <span class="solar-action-button__group">
                        ${renderUiIcon("target", "solar-action-button__icon")}
                        <span>${this.state.isLocating ? "Localisation GPS en cours..." : "Utiliser ma localisation GPS"}</span>
                      </span>
                    </button>
                  </div>
                </div>
              `,
              { stepId: "installation-city" }
            )}

            ${
              withInstallation
                ? `
                  ${
                    smartInstallation
                      ? this.renderWifiFieldGroup()
                      : this.renderFlashMessage({
                          type: "info",
                          title: "Wi-Fi",
                          text: "Le Wi-Fi n'est demandé que pour la version Smart connectée.",
                        })
                  }

                  ${this.renderFieldGroup(
                    "Électricité sur le toit",
                    "L'alimentation électrique doit être disponible pour la mise en service.",
                    `
                      ${this.renderTechnicalSelection(
                        "roofElectricity",
                        [
                          {
                            value: "yes",
                            title: "Électricité disponible",
                            subtitle: "L'alimentation est déjà prête pour la mise en service.",
                            badge: "Oui",
                            iconMarkup: renderUiIcon("bolt", "solar-version-card__icon-svg"),
                            features: [
                              { icon: "check", label: "Toit déjà alimenté" },
                              { icon: "clock", label: "Mise en service plus fluide" },
                              { icon: "shield", label: "Aucune préparation supplémentaire" },
                            ],
                          },
                          {
                            value: "no",
                            title: "Électricité à préparer",
                            subtitle: "Une préparation est nécessaire avant l'intervention.",
                            badge: "Non",
                            iconMarkup: renderCrossedSymbol(renderUiIcon("bolt", "solar-version-card__icon-svg")),
                            features: [
                              { icon: "wrench", label: "Électricien à prévoir" },
                              { icon: "bolt", label: "Alimentation à préparer" },
                              { icon: "info", label: "Vous pouvez continuer la configuration" },
                            ],
                          },
                        ],
                        this.state.roofElectricity
                      )}

                      ${
                        this.state.roofElectricity === "no"
                          ? this.renderFlashMessage({
                              type: "warning",
                              title: "Électricien à prévoir",
                              text: "Merci de contacter votre électricien avant notre intervention. Vous pouvez continuer la configuration.",
                            })
                          : ""
                      }
                    `,
                    { stepId: "roof-electricity" }
                  )}

                  ${this.renderFieldGroup(
                    "Préinstallation eau chaude / eau froide",
                    "Les arrivées doivent être disponibles sur le toit avant la pose.",
                    `
                      ${this.renderTechnicalSelection(
                        "roofPlumbing",
                        [
                          {
                            value: "yes",
                            title: "Préinstallation prête",
                            subtitle: "Les arrivées eau chaude / eau froide sont déjà disponibles.",
                            badge: "Oui",
                            iconMarkup: renderUiIcon("droplet", "solar-version-card__icon-svg"),
                            features: [
                              { icon: "check", label: "Arrivées déjà prêtes" },
                              { icon: "clock", label: "Pose plus simple" },
                              { icon: "shield", label: "Intervention plus rapide" },
                            ],
                          },
                          {
                            value: "no",
                            title: "Préinstallation à préparer",
                            subtitle: "Les arrivées doivent être préparées avant la pose.",
                            badge: "Non",
                            iconMarkup: renderCrossedSymbol(renderUiIcon("droplet", "solar-version-card__icon-svg")),
                            features: [
                              { icon: "wrench", label: "Préparation nécessaire" },
                              { icon: "droplet", label: "Arrivées eau à prévoir" },
                              { icon: "info", label: "Option Aventron disponible ensuite" },
                            ],
                          },
                        ],
                        this.state.roofPlumbing
                      )}

                      ${
                        this.state.roofPlumbing === "no"
                          ? `
                              <div class="solar-followup-card">
                                <h6>Ajouter cette préinstallation ?</h6>
                                <p>Nous pouvons ajouter cette préparation pour 1 000 DHS.</p>
                                ${this.renderChoiceCards(
                                  "plumbingSetup",
                                  [
                                    {
                                      value: "add",
                                      title: "Oui, ajouter",
                                      subtitle: "Ajouter pour 1 000 DHS",
                                      cardClass: "solar-choice-card--decision",
                                    },
                                    {
                                      value: "skip",
                                      title: "Non",
                                      subtitle: "Je la prépare moi-même",
                                      cardClass: "solar-choice-card--decision",
                                    },
                                  ],
                                  this.state.plumbingSetup,
                                  "solar-choice-grid--two solar-choice-grid--decision"
                                )}
                              </div>
                            `
                          : ""
                      }
                    `,
                    { stepId: "roof-plumbing" }
                  )}
                `
                : this.renderFlashMessage({
                    type: "info",
                    title: "Sans installation Aventron",
                    text: "Les vérifications techniques sur le toit ne sont pas nécessaires pour une livraison uniquement.",
                  })
            }
          </div>
        </section>
      `;
    }

    renderIncludedItems(summary) {
      const items = this.buildIncludedItems(summary);

      return `
        <ul class="solar-included-list">
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      `;
    }

    renderSummaryCard() {
      const summary = this.getDisplayedSummary();
      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      const deferredTransfer = this.getDeferredBankTransferSummary(summary);

      if (!summary) {
        return `
          <div class="solar-summary-card" data-price-anchor data-step-id="summary">
            <div class="solar-summary-card__header">
              <div class="solar-panel-badge solar-panel-badge--amber">
                ${renderUiIcon("calculator", "solar-panel-badge__icon")}
                <span>Prix final TTC</span>
              </div>
              <div class="solar-panel-copy solar-panel-copy--summary">
                <h4>Le prix reste masqué</h4>
                <p>Répondez aux sections Produit et Installation puis cliquez sur "Calculer le prix final".</p>
              </div>
            </div>
            <div class="solar-summary-card__price">
              <span class="solar-summary-price__label">Prix final TTC</span>
              <strong>À la fin seulement</strong>
              <small>Aucun prix n'est affiché avant le calcul final.</small>
            </div>
          </div>
        `;
      }

      return `
        <div class="solar-summary-card" data-price-anchor data-step-id="summary">
          <div class="solar-summary-card__header">
            <div class="solar-panel-badge solar-panel-badge--amber">
              ${renderUiIcon("calculator", "solar-panel-badge__icon")}
              <span>Prix final TTC</span>
            </div>
            <div class="solar-panel-copy solar-panel-copy--summary">
              <h4>Votre configuration</h4>
              <p>Voici le prix final correspondant à la configuration sélectionnée.</p>
            </div>
          </div>

          <div class="solar-summary-card__price">
            <span class="solar-summary-price__label">Prix final TTC</span>
            <strong>${formatCurrency(summary.standardPrice)} DHS TTC</strong>
            <small>Ce montant correspond à la configuration sélectionnée.</small>
          </div>

          <div class="solar-summary-meta">
            <div>
              <span>Ville d'installation</span>
              <strong>${escapeHtml(summary.locationLabel)}</strong>
            </div>
          </div>

          <div class="solar-summary-included">
            <h5>Ce que vous recevez</h5>
            ${this.renderIncludedItems(summary)}
          </div>

          ${
            paymentOffer
              ? `
                  <div class="solar-payment-offer">
                    <p class="solar-payment-offer__eyebrow">Paiement immédiat</p>
                    <h4>Payer maintenant par virement</h4>
                    <p>
                      Si vous souhaitez une installation dès que possible, vous pouvez payer maintenant par virement et
                      bénéficier d'une remise de ${formatCurrency(paymentOffer.discountValue)} DHS.
                    </p>
                    <div class="solar-payment-offer__total">
                      <span>Montant à payer maintenant</span>
                      <strong>${formatCurrency(paymentOffer.payNowPrice)} DHS TTC</strong>
                    </div>
                  </div>
                `
              : ""
          }

          ${
            !paymentOffer && deferredTransfer
              ? `
                  <div class="solar-payment-offer">
                    <p class="solar-payment-offer__eyebrow">Paiement par virement après</p>
                    <h4>Livraison uniquement</h4>
                    <p>
                      Le prix final inclut ${formatCurrency(summary.deliveryOnlyFee)} DHS de frais de livraison.
                      Vous pouvez conserver ce prix et payer plus tard par virement.
                    </p>
                    <div class="solar-payment-offer__total">
                      <span>Montant à payer par virement</span>
                      <strong>${formatCurrency(deferredTransfer.transferPrice)} DHS TTC</strong>
                    </div>
                  </div>
                `
              : ""
          }

          ${
            summary.notes.length
              ? this.renderFlashMessage(
                  {
                    type: "warning",
                    title: "Informations importantes",
                    text: "Merci de tenir compte des points suivants pour votre commande.",
                  },
                  summary.notes
                )
              : ""
          }
        </div>
      `;
    }

    renderPriceSection() {
      return `
        <section class="solar-step solar-section-card" data-step-id="total-price">
          <div class="solar-step__heading">
            <span class="solar-step__index">C</span>
            <div>
              <h4>Prix final</h4>
              <p class="solar-step__intro">Le prix apparaît seulement après le clic final.</p>
            </div>
          </div>

          <div class="solar-step__body">
            <div class="solar-configurator__actions">
              <button class="button button--primary solar-action-button" type="button" data-action="calculate-price">
                <span class="solar-action-button__group">
                  ${renderUiIcon("calculator", "solar-action-button__icon")}
                  <span>Calculer le prix final</span>
                </span>
              </button>
              <a class="button button--ghost solar-action-button" href="contact.html">
                <span class="solar-action-button__group">
                  ${renderUiIcon("phone", "solar-action-button__icon")}
                  <span>Contacter Aventron Technologies</span>
                </span>
              </a>
            </div>
            ${this.renderSummaryCard()}
          </div>
        </section>
      `;
    }

    renderCustomerPanel() {
      const summary = this.getDisplayedSummary();
      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      const deferredTransfer = this.getDeferredBankTransferSummary(summary);

      if (!summary) {
        return `
          <section class="solar-step solar-section-card" data-step-id="payment">
            <div class="solar-step__heading">
              <span class="solar-step__index">D</span>
              <div>
                <h4>Paiement et informations</h4>
                <p class="solar-step__intro">Calculez d'abord le prix final pour afficher les options suivantes.</p>
              </div>
            </div>

            <div class="solar-step__body">
              <div class="solar-payment-empty">
                <div class="solar-panel-badge solar-panel-badge--blue">
                  ${renderUiIcon("info", "solar-panel-badge__icon")}
                  <span>Paiement et informations</span>
                </div>
                <div class="solar-panel-copy solar-panel-copy--summary solar-panel-copy--info">
                  <h4>Les options apparaîtront ici</h4>
                  <p>Calculez d'abord le prix final pour afficher le virement bancaire ou la demande d'information.</p>
                </div>
              </div>
            </div>
          </section>
        `;
      }

      return `
        <section class="solar-step solar-section-card" data-step-id="payment">
          <div class="solar-step__heading">
            <span class="solar-step__index">D</span>
            <div>
              <h4>Paiement et informations</h4>
                <p class="solar-step__intro">Choisissez entre le virement bancaire et une demande d'information.</p>
            </div>
          </div>

          <div class="solar-step__body">
            <div class="solar-payment-grid">
              ${
                paymentOffer || deferredTransfer
                  ? `
                      <article class="solar-payment-panel">
                        <p class="eyebrow">Payer par virement</p>
                        <h4>${paymentOffer ? "Je paie maintenant" : "Je paierai plus tard"}</h4>
                        <p>
                          ${
                            paymentOffer
                              ? `Vous payez ${formatCurrency(paymentOffer.payNowPrice)} DHS TTC et vous profitez de la remise immédiate de ${formatCurrency(paymentOffer.discountValue)} DHS.`
                              : `Si vous choisissez la livraison uniquement, ${formatCurrency(summary.deliveryOnlyFee)} DHS de frais de livraison sont déjà inclus dans votre prix final.`
                          }
                        </p>
                        <button class="button button--primary" type="button" data-action="go-to-bank-transfer" data-payment-mode="${paymentOffer ? "payNow" : "payLater"}">
                          ${paymentOffer ? "Payer par virement" : "Payer plus tard par virement"}
                        </button>
                      </article>
                    `
                  : `
                      <article class="solar-payment-panel">
                        <p class="eyebrow">Payer par virement</p>
                        <h4>Paiement par virement non disponible</h4>
                        <p>
                          Le paiement immédiat avec remise est disponible uniquement lorsque l'installation Aventron est
                          possible.
                        </p>
                      </article>
                    `
              }

              <div class="solar-configurator__customer">
                <div>
                  <p class="eyebrow">Besoin d'informations</p>
                  <h4>Être rappelé avant paiement</h4>
                  <p>Laissez vos coordonnées. Un conseiller Aventron vous rappellera rapidement.</p>
                </div>

                ${this.renderFlashMessage(this.state.customerMessage, this.state.customerErrors)}

                <div class="contact-form">
                  <div class="contact-form__grid">
                    <div class="contact-form__field">
                      <label for="solar-customer-full-name">Nom complet</label>
                      <input
                        id="solar-customer-full-name"
                        name="customerFullName"
                        type="text"
                        value="${escapeHtml(this.state.customer.fullName)}"
                        aria-invalid="${this.state.customerErrors.includes("Nom complet manquant.") ? "true" : "false"}"
                      />
                    </div>
                    <div class="contact-form__field">
                      <label for="solar-customer-phone">Numéro de téléphone</label>
                      <input
                        id="solar-customer-phone"
                        name="customerPhone"
                        type="tel"
                        value="${escapeHtml(this.state.customer.phone)}"
                        aria-invalid="${this.state.customerErrors.includes("Numéro de téléphone manquant.") ? "true" : "false"}"
                      />
                    </div>
                    <div class="contact-form__field contact-form__field--full">
                      <label for="solar-customer-email">Email</label>
                      <input
                        id="solar-customer-email"
                        name="customerEmail"
                        type="email"
                        value="${escapeHtml(this.state.customer.email)}"
                        aria-invalid="${
                          this.state.customerErrors.includes("Email manquant.") || this.state.customerErrors.includes("Email invalide.")
                            ? "true"
                            : "false"
                        }"
                      />
                    </div>
                  </div>
                </div>

                <div class="solar-customer-actions">
                  <button class="button solar-info-button" type="button" data-action="request-callback" ${
                    this.state.callbackSubmitting ? "disabled" : ""
                  }>
                    ${renderUiIcon("message", "solar-info-button__icon")}
                    <span>${this.state.callbackSubmitting ? "Envoi en cours..." : "Demander un rappel"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    renderCustomerPanelV2() {
      const summary = this.getDisplayedSummary();
      const paymentOffer = this.getImmediatePaymentOfferSummary(summary);
      const deferredTransfer = this.getDeferredBankTransferSummary(summary);

      if (!summary) {
        return `
          <section class="solar-step solar-section-card" data-step-id="payment">
            <div class="solar-step__heading">
              <span class="solar-step__index">D</span>
              <div>
                <h4>Paiement et informations</h4>
                <p class="solar-step__intro">Calculez d'abord le prix final pour afficher les options suivantes.</p>
              </div>
            </div>
          </section>
        `;
      }

      const nameInvalid = this.state.customerErrors.includes("Nom complet manquant.");
      const phoneInvalid = this.state.customerErrors.includes("Numéro de téléphone manquant.");
      const emailInvalid =
        this.state.customerErrors.includes("Email manquant.") || this.state.customerErrors.includes("Email invalide.");
      const transferAvailable = Boolean(paymentOffer || deferredTransfer);
      const transferTitle = paymentOffer ? "Je paie maintenant" : "Je paierai plus tard";
      const transferDescription = paymentOffer
        ? `Vous payez ${formatCurrency(paymentOffer.payNowPrice)} DHS TTC et vous profitez de la remise immédiate de ${formatCurrency(paymentOffer.discountValue)} DHS.`
        : `Si vous choisissez la livraison uniquement, ${formatCurrency(summary.deliveryOnlyFee)} DHS de frais de livraison sont déjà inclus dans votre prix final.`;
      const transferAmountLabel = paymentOffer ? "Montant à payer" : "Montant final";
      const transferAmountValue = paymentOffer
        ? `${formatCurrency(paymentOffer.payNowPrice)} DHS TTC`
        : deferredTransfer
          ? `${formatCurrency(deferredTransfer.transferPrice)} DHS TTC`
          : `${formatCurrency(summary.standardPrice)} DHS TTC`;
      const transferSecondaryLabel = paymentOffer ? "Remise immédiate" : "Frais de livraison";
      const transferSecondaryValue = paymentOffer
        ? `-${formatCurrency(paymentOffer.discountValue)} DHS`
        : `+${formatCurrency(summary.deliveryOnlyFee)} DHS`;
      const transferSecondaryClass = paymentOffer
        ? "solar-payment-breakdown__value--success"
        : "solar-payment-breakdown__value--accent";
      const transferSecondaryRowClass = paymentOffer
        ? "solar-payment-breakdown__row--discount"
        : "solar-payment-breakdown__row--surcharge";
      const transferOldPriceMarkup = paymentOffer
        ? `<span class="solar-payment-breakdown__old-price">${formatCurrency(summary.standardPrice)} DHS TTC</span>`
        : "";
      const transferButtonLabel = paymentOffer ? "Payer par virement" : "Payer plus tard par virement";
      const callbackButtonLabel = this.state.callbackSubmitting ? "Envoi en cours..." : "Demander un rappel";

      const transferPanel = transferAvailable
        ? `
            <article class="solar-payment-panel solar-payment-panel--transfer">
              <div class="solar-panel-badge solar-panel-badge--amber">
                ${renderUiIcon("bank", "solar-panel-badge__icon")}
                <span>Payer par virement</span>
              </div>

              <div class="solar-panel-copy">
                <h4>${transferTitle}</h4>
                <p>${transferDescription}</p>
              </div>

              <div class="solar-payment-breakdown">
                <div class="solar-payment-breakdown__rows">
                  <div class="solar-payment-breakdown__row solar-payment-breakdown__row--primary">
                    <span class="solar-payment-breakdown__label">${transferAmountLabel}</span>
                    ${transferOldPriceMarkup}
                    <strong class="solar-payment-breakdown__value">${transferAmountValue}</strong>
                  </div>
                  <div class="solar-payment-breakdown__row solar-payment-breakdown__row--secondary ${transferSecondaryRowClass}">
                    <span class="solar-payment-breakdown__label">${transferSecondaryLabel}</span>
                    <strong class="solar-payment-breakdown__value ${transferSecondaryClass}">${transferSecondaryValue}</strong>
                  </div>
                </div>
              </div>

              <button
                class="button button--primary solar-payment-cta"
                type="button"
                data-action="go-to-bank-transfer"
                data-payment-mode="${paymentOffer ? "payNow" : "payLater"}"
              >
                <span class="solar-payment-cta__group">
                  ${renderUiIcon(paymentOffer ? "lock" : "bank", "solar-payment-cta__glyph")}
                  <span>${transferButtonLabel}</span>
                </span>
                <span class="solar-payment-cta__arrow">
                  ${renderUiIcon("arrow-right", "solar-payment-cta__glyph")}
                </span>
              </button>

              <p class="solar-panel-footnote solar-panel-footnote--amber">
                ${renderUiIcon("shield", "solar-panel-footnote__icon")}
                <span>Paiement sécurisé et 100% fiable</span>
              </p>
            </article>
          `
        : `
            <article class="solar-payment-panel solar-payment-panel--transfer">
              <div class="solar-panel-badge solar-panel-badge--amber">
                ${renderUiIcon("bank", "solar-panel-badge__icon")}
                <span>Payer par virement</span>
              </div>

              <div class="solar-panel-copy">
                <h4>Paiement par virement non disponible</h4>
                <p>
                  Le paiement immédiat avec remise est disponible uniquement lorsque l'installation Aventron est
                  possible.
                </p>
              </div>

              <p class="solar-panel-footnote solar-panel-footnote--amber">
                ${renderUiIcon("shield", "solar-panel-footnote__icon")}
                <span>Nous vous proposerons la meilleure option disponible.</span>
              </p>
            </article>
          `;

      return `
        <section class="solar-step solar-section-card" data-step-id="payment">
          <div class="solar-step__heading">
            <span class="solar-step__index">D</span>
            <div>
              <h4>Paiement et informations</h4>
              <p class="solar-step__intro">Payez par virement ou demandez un rappel.</p>
            </div>
          </div>

          <div class="solar-step__body">
            <div class="solar-payment-grid">
              ${transferPanel}

              <div class="solar-configurator__customer solar-configurator__customer--info">
                <div class="solar-panel-badge solar-panel-badge--blue">
                  ${renderUiIcon("info", "solar-panel-badge__icon")}
                  <span>Besoin d'informations</span>
                </div>

                <div class="solar-panel-copy solar-panel-copy--info">
                  <h4>Être rappelé avant paiement</h4>
                  <p>Laissez vos coordonnées. Un conseiller Aventron vous rappellera rapidement.</p>
                </div>

                ${this.renderFlashMessage(this.state.customerMessage, this.state.customerErrors)}

                <div class="contact-form solar-contact-form">
                  <div class="contact-form__grid">
                    <div class="contact-form__field solar-contact-field">
                      <label for="solar-customer-full-name">Nom complet</label>
                      <div class="solar-input-shell ${nameInvalid ? "is-invalid" : ""}">
                        <span class="solar-input-shell__icon">
                          ${renderUiIcon("user", "solar-input-shell__glyph")}
                        </span>
                        <input
                          id="solar-customer-full-name"
                          name="customerFullName"
                          type="text"
                          value="${escapeHtml(this.state.customer.fullName)}"
                          placeholder="Votre nom"
                          aria-invalid="${nameInvalid ? "true" : "false"}"
                        />
                      </div>
                    </div>

                    <div class="contact-form__field solar-contact-field">
                      <label for="solar-customer-phone">Numéro de téléphone</label>
                      <div class="solar-input-shell ${phoneInvalid ? "is-invalid" : ""}">
                        <span class="solar-input-shell__icon">
                          ${renderUiIcon("phone", "solar-input-shell__glyph")}
                        </span>
                        <input
                          id="solar-customer-phone"
                          name="customerPhone"
                          type="tel"
                          value="${escapeHtml(this.state.customer.phone)}"
                          placeholder="06 12 34 56 78"
                          aria-invalid="${phoneInvalid ? "true" : "false"}"
                        />
                      </div>
                    </div>

                    <div class="contact-form__field contact-form__field--full solar-contact-field">
                      <label for="solar-customer-email">Email</label>
                      <div class="solar-input-shell ${emailInvalid ? "is-invalid" : ""}">
                        <span class="solar-input-shell__icon">
                          ${renderUiIcon("mail", "solar-input-shell__glyph")}
                        </span>
                        <input
                          id="solar-customer-email"
                          name="customerEmail"
                          type="email"
                          value="${escapeHtml(this.state.customer.email)}"
                          placeholder="votre@email.com"
                          aria-invalid="${emailInvalid ? "true" : "false"}"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="solar-customer-footer">
                  <div class="solar-customer-actions">
                    <button
                      class="button solar-info-button"
                      type="button"
                      data-action="request-callback"
                      ${this.state.callbackSubmitting ? "disabled" : ""}
                    >
                      ${renderUiIcon("message", "solar-info-button__icon")}
                      <span>${callbackButtonLabel}</span>
                    </button>
                  </div>

                  <p class="solar-panel-footnote solar-panel-footnote--blue">
                    ${renderUiIcon("shield", "solar-panel-footnote__icon")}
                    <span>Vos données sont confidentielles et sécurisées.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    render() {
      this.syncCurrentStepId();

      const steps = this.getWizardSteps();
      const currentStep = this.getCurrentWizardStep();
      const currentStepIndex = currentStep ? this.getWizardStepIndex(currentStep.id) + 1 : 1;
      const priceStatus = this.state.priceCalculated ? "Prix final affiché" : "";
      const wizardStatus = `Étape ${currentStepIndex} / ${steps.length}`;
      const headerStatus = priceStatus ? `${wizardStatus} • ${priceStatus}` : wizardStatus;

      this.innerHTML = `
        <div class="solar-configurator">
          <div class="solar-configurator__main solar-configurator__main--plain">
            ${this.renderFlashMessage(this.state.configMessage, this.state.validationErrors)}
            ${this.renderCurrentWizardStep()}
          </div>
          ${this.renderStepOverview()}
        </div>
        ${this.renderComparisonModal()}
        ${this.renderPricePopupModal()}
      `;
    }
  }

  if (!customElements.get("solar-water-heater-configurator")) {
    customElements.define("solar-water-heater-configurator", SolarWaterHeaterConfigurator);
  }
})();
