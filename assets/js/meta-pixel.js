(function () {
  const PIXEL_ID = "988197560578933";
  const VALID_EVENTS = new Set([
    "ConfiguratorStarted",
    "ConfiguratorCompleted",
    "Lead",
    "InitiateCheckout",
    "BankTransferSelected",
    "RecallBeforePayment",
    "VirementConfirmed",
  ]);

  function initMetaPixel() {
    if (typeof window.fbq === "function") {
      return;
    }

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    try {
      window.fbq("init", PIXEL_ID);
      window.fbq("track", "PageView");
    } catch (error) {
      console.error("Meta Pixel initialization failed:", error);
    }
  }

  function trackMetaCustomEvent(eventName, params) {
    if (typeof window.fbq !== "function") {
      return;
    }

    if (!VALID_EVENTS.has(eventName)) {
      console.warn(`Meta Pixel event "${eventName}" is not in the approved event list.`);
    }

    try {
      window.fbq("trackCustom", eventName, params);
    } catch (error) {
      console.error("Meta Pixel custom event failed:", error);
    }
  }

  window.aventronMetaPixel = {
    trackCustomEvent: trackMetaCustomEvent,
  };

  window.trackMetaCustomEvent = trackMetaCustomEvent;

  initMetaPixel();
})();
