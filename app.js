/* =====================================================
   AquaVanguard - shared logic
   Right now: the 4-second intro + footer year.
   ===================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var intro = document.getElementById("intro");

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var menuButton = document.querySelector(".menu-toggle");
  var navigation = document.getElementById("site-navigation");
  if (menuButton && navigation) {
    function setNavigationOpen(isOpen) {
      navigation.classList.toggle("is-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
      var label = menuButton.querySelector(".menu-toggle-label");
      if (label) label.textContent = isOpen ? "Close" : "Menu";
    }

    menuButton.addEventListener("click", function () {
      setNavigationOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });
    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNavigationOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setNavigationOpen(false);
        menuButton.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 700) setNavigationOpen(false);
    });
  }

  var waterFacts = [
    { text: "Oil and fuel can contaminate water and may make boiling unsafe as a response.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Contamination and pollution" },
    { text: "Floodwater can carry sewage, chemicals, and other hazards into wells and water systems.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Contamination and pollution" },
    { text: "Clear water can still contain germs or chemicals that affect health.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Contamination and pollution" },
    { text: "Unusual colour or smell is a warning sign, not a way to identify a contaminant.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Contamination and pollution" },
    { text: "Pesticides and industrial chemicals can reach drinking-water sources through runoff or spills.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Contamination and pollution" },
    { text: "Waste near a well can threaten water quality, especially after heavy rain or flooding.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Contamination and pollution" },
    { text: "A chemical sheen on water is a reason to avoid contact and alert local authorities.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Contamination and pollution" },
    { text: "Boiling does not remove fuel or toxic chemicals from water.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Contamination and pollution" },
    { text: "Household waste and sewage can introduce disease-causing germs into water.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Contamination and pollution" },
    { text: "Runoff can carry contaminants from streets, farms, and other land into surface water.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Contamination and pollution" },
    { text: "A local do-not-use advisory means avoid using the affected supply as directed.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Safe drinking and filtration" },
    { text: "A boil-water notice is different from a do-not-use notice; follow the exact local advice.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Safe drinking and filtration" },
    { text: "Boiling can kill many disease-causing germs, but it does not remove chemical contamination.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Safe drinking and filtration" },
    { text: "Letting cloudy water settle can remove some particles, but it does not disinfect water.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Safe drinking and filtration" },
    { text: "Cloth straining may reduce visible sediment; it does not make water safe to drink.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Safe drinking and filtration" },
    { text: "A household filter must suit the contaminant; no single filter removes every hazard.", source: "CDC", sourceUrl: "https://www.cdc.gov/drinking-water/about/about-home-water-treatment-systems.html", topic: "Safe drinking and filtration" },
    { text: "Follow a filter maker’s instructions and replace cartridges as specified.", source: "CDC", sourceUrl: "https://www.cdc.gov/drinking-water/about/about-home-water-treatment-systems.html", topic: "Safe drinking and filtration" },
    { text: "Safe storage helps prevent treated water from becoming contaminated again.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html", topic: "Safe drinking and filtration" },
    { text: "Use clean, covered containers to protect drinking water during storage.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html", topic: "Safe drinking and filtration" },
    { text: "Keep hands and used cups out of stored drinking water.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html", topic: "Safe drinking and filtration" },
    { text: "Do not store drinking water in containers that held chemicals or fuel.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html", topic: "Safe drinking and filtration" },
    { text: "Rainwater is not automatically safe to drink; collection and storage can introduce contamination.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Safe drinking and filtration" },
    { text: "Water safety depends on its source, treatment, and protection from recontamination.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Safe drinking and filtration" },
    { text: "A filter that improves clarity may not remove germs or dissolved chemicals.", source: "CDC", sourceUrl: "https://www.cdc.gov/drinking-water/about/about-home-water-treatment-systems.html", topic: "Safe drinking and filtration" },
    { text: "Use water from a source confirmed safe when your supply is uncertain.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Safe drinking and filtration" },
    { text: "Testing can identify hazards that sight, smell, and taste cannot reliably detect.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Testing and monitoring" },
    { text: "A water test should match the suspected hazard and the source being checked.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Testing and monitoring" },
    { text: "A single observation cannot confirm that a water source is safe.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Testing and monitoring" },
    { text: "Test private wells after flooding or when local health officials recommend it.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Testing and monitoring" },
    { text: "Use a qualified laboratory or public-health service for water testing advice.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Testing and monitoring" },
    { text: "Keep test results linked to the source, collection date, and test method.", source: "WHO", sourceUrl: "", topic: "Testing and monitoring" },
    { text: "A home test result does not replace professional advice when contamination is suspected.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Testing and monitoring" },
    { text: "Monitoring water sources helps communities notice changes and seek timely testing.", source: "UNICEF", sourceUrl: "", topic: "Testing and monitoring" },
    { text: "El Niño can shift rainfall patterns and increase drought risk in some regions.", source: "NOAA", sourceUrl: "https://www.noaa.gov/education/resource-collections/weather-atmosphere/el-nino", topic: "Natural events and water quality" },
    { text: "La Niña can alter rainfall patterns, affecting water availability and source conditions.", source: "NOAA", sourceUrl: "https://www.noaa.gov/education/resource-collections/weather-atmosphere/el-nino", topic: "Natural events and water quality" },
    { text: "Heavy rain can wash contaminants into rivers, wells, and other water sources.", source: "WHO", sourceUrl: "https://www.who.int/health-topics/floods", topic: "Natural events and water quality" },
    { text: "Flooding can overwhelm sanitation systems and contaminate drinking-water supplies.", source: "WHO", sourceUrl: "https://www.who.int/health-topics/floods", topic: "Natural events and water quality" },
    { text: "After a flood, check local water advisories before using an affected source.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Natural events and water quality" },
    { text: "Drought can reduce water availability and increase pressure on remaining sources.", source: "WHO", sourceUrl: "https://www.who.int/health-topics/drought", topic: "Natural events and water quality" },
    { text: "Rising temperatures can worsen water stress and increase risks to water services.", source: "WHO", sourceUrl: "https://www.who.int/health-topics/climate-change", topic: "Natural events and water quality" },
    { text: "Floodwater may contain sewage, chemicals, and hidden physical hazards.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Natural events and water quality" },
    { text: "Report spills or unusual water changes to the responsible local authority.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Community action" },
    { text: "Community reports can help direct attention to sources needing inspection or testing.", source: "UNICEF", sourceUrl: "", topic: "Community action" },
    { text: "Record where and when a concern was observed without guessing its cause.", source: "WHO", sourceUrl: "", topic: "Community action" },
    { text: "Keep children and animals away from suspected contaminated water and spill areas.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Community action" },
    { text: "Share official advisories with neighbors, especially when water service changes.", source: "WHO", sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/drinking-water", topic: "Community action" },
    { text: "Retesting after a repair helps check whether water quality improved.", source: "WHO", sourceUrl: "", topic: "Community action" },
    { text: "Protecting wells and storage containers is a shared community responsibility.", source: "UNICEF", sourceUrl: "", topic: "Community action" },
    { text: "Never taste water to decide whether it is safe.", source: "CDC", sourceUrl: "https://www.cdc.gov/water-emergency/about/index.html", topic: "Community action" }
  ];

  function initializeWaterFacts() {
    var card = document.getElementById("water-facts-card");
    if (!card || !waterFacts.length) return;

    var topicElement = document.getElementById("water-facts-topic");
    var textElement = document.getElementById("water-facts-text");
    var sourceElement = document.getElementById("water-facts-source");
    var previousButton = document.getElementById("water-facts-previous");
    var toggleButton = document.getElementById("water-facts-toggle");
    var nextButton = document.getElementById("water-facts-next");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var order = [];
    var index = 0;
    var timer = null;
    var paused = reducedMotion.matches;
    var hovered = false;
    var focused = false;
    var transitionTimer = null;

    function shuffleFacts(previousLastIndex) {
      order = waterFacts.map(function (_, factIndex) {
        return factIndex;
      });

      for (var i = order.length - 1; i > 0; i--) {
        var swapIndex = Math.floor(Math.random() * (i + 1));
        var current = order[i];
        order[i] = order[swapIndex];
        order[swapIndex] = current;
      }

      if (previousLastIndex !== undefined && order.length > 1 && order[0] === previousLastIndex) {
        var first = order[0];
        order[0] = order[1];
        order[1] = first;
      }
      index = 0;
    }

    function clearRotationTimer() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function canRotate() {
      return !paused && !hovered && !focused && !reducedMotion.matches;
    }

    function updateToggleButton() {
      if (reducedMotion.matches) {
        toggleButton.textContent = "Manual only";
        toggleButton.setAttribute("aria-label", "Automatic rotation disabled by reduced motion preference");
        toggleButton.disabled = true;
        return;
      }

      toggleButton.disabled = false;
      toggleButton.textContent = paused ? "Play" : "Pause";
      toggleButton.setAttribute("aria-label", paused ? "Play water fact rotation" : "Pause water fact rotation");
    }

    function scheduleNextFact() {
      clearRotationTimer();
      updateToggleButton();
      if (!canRotate()) return;

      var fact = waterFacts[order[index]];
      var wordCount = fact.text.trim().split(/\s+/).length;
      timer = window.setTimeout(function () {
        showFact(1, true);
      }, 3000 + 250 * wordCount);
    }

    function renderFact(animate) {
      var fact = waterFacts[order[index]];
      if (animate && !reducedMotion.matches) {
        card.classList.add("is-changing");
        if (transitionTimer !== null) window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(function () {
          card.classList.remove("is-changing");
          transitionTimer = null;
        }, 300);
      } else {
        card.classList.remove("is-changing");
      }

      topicElement.textContent = fact.topic;
      textElement.textContent = fact.text;
      sourceElement.replaceChildren();
      sourceElement.appendChild(document.createTextNode("Source: "));
      if (fact.sourceUrl) {
        var link = document.createElement("a");
        link.href = fact.sourceUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = fact.source;
        sourceElement.appendChild(link);
      } else {
        sourceElement.appendChild(document.createTextNode(fact.source));
      }
      scheduleNextFact();
    }

    function showFact(direction, animate) {
      clearRotationTimer();
      var nextIndex = index + direction;
      if (nextIndex < 0) {
        index = 0;
      } else if (nextIndex >= order.length) {
        var previousLastIndex = order[order.length - 1];
        shuffleFacts(previousLastIndex);
        index = 0;
      } else {
        index = nextIndex;
      }
      renderFact(animate);
    }

    shuffleFacts();
    renderFact(false);

    previousButton.addEventListener("click", function () {
      showFact(-1, true);
    });
    nextButton.addEventListener("click", function () {
      showFact(1, true);
    });
    toggleButton.addEventListener("click", function () {
      paused = !paused;
      scheduleNextFact();
    });
    card.addEventListener("mouseenter", function () {
      hovered = true;
      scheduleNextFact();
    });
    card.addEventListener("mouseleave", function () {
      hovered = false;
      scheduleNextFact();
    });
    card.addEventListener("focusin", function () {
      focused = true;
      scheduleNextFact();
    });
    card.addEventListener("focusout", function (event) {
      focused = card.contains(event.relatedTarget);
      scheduleNextFact();
    });
    reducedMotion.addEventListener("change", function (event) {
      if (event.matches) paused = true;
      scheduleNextFact();
      if (event.matches) card.classList.remove("is-changing");
    });
  }

  initializeWaterFacts();

  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", function () {
      var serviceWorkerUrl = new URL("./sw.js", window.location.href).href;
      navigator.serviceWorker.getRegistration("./").then(function (registration) {
        var worker = registration &&
          (registration.active || registration.waiting || registration.installing);
        if (worker && worker.scriptURL === serviceWorkerUrl) return registration;
        return navigator.serviceWorker.register(serviceWorkerUrl);
      }).catch(function (error) {
        console.error("AquaVanguard offline support could not be registered:", error);
      });
    });
  }

  // Only run the intro if the <head> script decided it should play
  if (!intro || !root.classList.contains("intro-on")) return;

  var finished = false;

  // Mark as seen right away so it never replays in this session
  try {
    sessionStorage.setItem("aqv-intro", "1");
  } catch (e) {}

  function finish() {
    if (finished) return;
    finished = true;
    intro.classList.add("hide"); // 0.5s fade out
    setTimeout(function () {
      root.classList.remove("intro-on"); // removes the overlay
    }, 500);
  }

  // Skip: tap/click anywhere, or press Escape / Enter / Space
  intro.addEventListener("click", finish);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
  });

  // Start the animation, and guarantee the intro never runs past 4 seconds
  requestAnimationFrame(function () {
    intro.classList.add("play");
  });
  setTimeout(finish, 3500); // 3.5s + 0.5s fade = 4.0s
})();
