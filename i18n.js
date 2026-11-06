(function () {
  "use strict";

  var storageKey = "aquavanguard-language";
  var translations = {
    en: {
      screeningNote: "This is a screening of visible signs, not a water test. Low does not mean the water is safe.",
      whenInDoubt: "When in doubt, do not drink it untreated.",
      chemicalWater: "Do not drink or use water that smells like fuel or chemicals.",
      floodGerms: "Floodwater can carry germs. Avoid contact and follow local boil advice.",
      clothSettling: "Cloth or settling only removes some visible particles. It does not make water safe to drink.",
      contactAuthority: "Contact your local health or water authority."
    },
    // NEEDS NATIVE SPEAKER REVIEW
    yo: {
      screeningNote: "Èyí jẹ́ àyẹ̀wò àwọn àmì tí a lè rí, kì í ṣe ìdánwò omi. Ìpele kékeré kò túmọ̀ sí pé omi náà dáa láti mu.",
      whenInDoubt: "Tí o bá ń ṣiyèméjì, má ṣe mu omi náà láì tọ́jú rẹ̀.",
      chemicalWater: "Má mu omi tó ń run bí epo tàbí kẹ́míkà, má sì lò ó.",
      floodGerms: "Omi ìkún omi lè ní kòkòrò àrùn. Má ṣe kàn án, kí o sì tẹ̀lé ìmọ̀ràn agbègbè nípa bíbo omi.",
      clothSettling: "Aṣọ tàbí fífi omi sílẹ̀ kí àwọn èérí tó ṣeé rí tó lọ sí ìsàlẹ̀ máa yọ díẹ̀ lára àwọn èérí náà nìkan. Kò mú kí omi dáa láti mu.",
      contactAuthority: "Kàn sí aláṣẹ ìlera tàbí omi ní agbègbè rẹ."
    },
    // NEEDS NATIVE SPEAKER REVIEW
    pcm: {
      screeningNote: "Na screening of wetin eye fit see, e no be water test. Low level no mean say the water safe.",
      whenInDoubt: "If you no sure, no drink am if dem never treat am.",
      chemicalWater: "No drink or use water wey smell like fuel or chemicals.",
      floodGerms: "Floodwater fit carry germs. Avoid touching am and follow local advice about boiling water.",
      clothSettling: "Cloth or settling dey remove only some particles wey eye fit see. E no make water safe to drink.",
      contactAuthority: "Make you contact health or water authority for your area."
    }
  };

  var selector = document.getElementById("site-language");
  var language = "en";

  function translateElement(element) {
    if (!element || element.nodeType !== 1) return;
    var key = element.getAttribute("data-i18n");
    if (key && translations[language][key]) {
      var text = translations[language][key];
      if (element.textContent !== text) element.textContent = text;
      element.lang = language === "pcm" ? "pcm-NG" : language;
    }
  }

  function translatePage() {
    document.querySelectorAll("[data-i18n]").forEach(translateElement);
  }

  function setLanguage(nextLanguage, persist) {
    language = Object.prototype.hasOwnProperty.call(translations, nextLanguage) ?
      nextLanguage : "en";
    document.documentElement.lang = language === "pcm" ? "pcm-NG" : language;
    if (selector) selector.value = language;
    translatePage();

    if (persist) {
      try {
        window.localStorage.setItem(storageKey, language);
      } catch (error) {
        console.error("AquaVanguard language preference could not be saved:", error);
      }
    }
  }

  try {
    setLanguage(window.localStorage.getItem(storageKey) || "en", false);
  } catch (error) {
    console.error("AquaVanguard language preference could not be read:", error);
    setLanguage("en", false);
  }

  if (selector) {
    selector.addEventListener("change", function () {
      setLanguage(selector.value, true);
    });
  }

  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          translateElement(node);
          node.querySelectorAll("[data-i18n]").forEach(translateElement);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
