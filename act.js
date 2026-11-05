/* =====================================================
   AquaVanguard - action guidance selector
   ===================================================== */

(function () {
  "use strict";

  var guidance = document.getElementById("act-guidance");
  if (!guidance) return;

  var label = document.getElementById("act-guidance-label");
  var title = document.getElementById("act-guidance-title");
  var summary = document.getElementById("act-guidance-summary");
  var steps = document.getElementById("act-guidance-steps");
  var caution = document.getElementById("act-guidance-caution");

  var recommendations = {
    unknown: {
      label: "Safety unknown",
      title: "Do not assume untreated water is safe.",
      summary: "Appearance and smell cannot rule out harmful germs or chemicals. If you cannot confirm the source is treated and safe, use a known safe alternative and arrange appropriate testing.",
      steps: [
        "Use water from a trusted treated supply or another source confirmed safe by the responsible authority.",
        "Ask the local water or public-health authority which test is appropriate for this source and concern.",
        "If you have no safe alternative, contact local authorities for emergency advice before choosing a treatment."
      ],
      caution: "No warning signs is not a safety result. A household filter or clear appearance alone cannot confirm drinking-water safety."
    },
    microbial: {
      label: "Possible germs or flood contamination",
      title: "Prioritize a known safe source; follow local advisories.",
      summary: "Flooding or suspected sewage contamination can introduce pathogens. Treatment choices depend on the hazard and local guidance.",
      steps: [
        "Use a known safe alternative and follow any current boil-water or do-not-use advisory.",
        "If authorities advise boiling for a germ concern and chemical contamination is not suspected, bring clear water to a rolling boil for 1 minute (3 minutes above 6,500 feet), then cool it.",
        "Store treated water in a clean, covered container and avoid touching or dipping into it.",
        "Arrange appropriate testing and follow public-health advice before returning to the source."
      ],
      caution: "Boiling does not remove fuel, toxic chemicals, or radioactive materials. If these may be present, do not use boiling as the treatment."
    },
    cloudy: {
      label: "Cloudy or muddy water",
      title: "Clarify first, then address germs separately.",
      summary: "Visible particles can interfere with some disinfection methods. Clarifying water is only a pre-treatment step; it does not remove all hazards.",
      steps: [
        "If it is safe to handle and there is no suspected chemical spill, allow particles to settle or strain through a clean cloth.",
        "Use only a validated treatment suitable for the suspected hazard and follow its instructions or local public-health advice.",
        "Keep treated water in a clean, covered container and arrange testing if the source is untreated or safety is uncertain."
      ],
      caution: "Settling, cloth, sand, gravel, or charcoal alone does not establish that water is safe to drink. Do not handle water with a sheen or chemical/fuel smell."
    },
    chemical: {
      label: "Possible fuel or chemical contamination",
      title: "Do not drink, cook with, or try to treat this water at home.",
      summary: "Boiling and improvised filters do not reliably remove fuel or toxic chemicals. Some contaminants may also make direct contact unsafe.",
      steps: [
        "Use a known safe alternative for drinking, cooking, brushing teeth, and food preparation.",
        "Avoid contact with the suspected spill or contaminated water; keep children and animals away.",
        "Report the location and observation to the appropriate local water or public-health authority and ask for testing and cleanup guidance."
      ],
      caution: "Do not try to make suspected chemical contamination safe by boiling, chlorinating, settling, or using a homemade filter."
    }
  };

  function renderConcern(concern, updateHistory) {
    var recommendation = recommendations[concern];
    if (!recommendation) return;

    label.textContent = recommendation.label;
    title.textContent = recommendation.title;
    summary.textContent = recommendation.summary;
    caution.textContent = recommendation.caution;
    steps.replaceChildren();
    recommendation.steps.forEach(function (step) {
      var item = document.createElement("li");
      item.textContent = step;
      steps.appendChild(item);
    });

    document.querySelectorAll("[data-concern]").forEach(function (button) {
      var selected = button.getAttribute("data-concern") === concern;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    if (updateHistory) {
      var url = new URL(window.location.href);
      url.searchParams.set("concern", concern);
      window.history.replaceState(null, "", url);
    }
  }

  document.querySelectorAll("[data-concern]").forEach(function (button) {
    button.addEventListener("click", function () {
      renderConcern(button.getAttribute("data-concern"), true);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var requestedConcern = params.get("concern");
  var concernFromDiagnosis = recommendations[requestedConcern] ? requestedConcern : "unknown";
  renderConcern(concernFromDiagnosis, false);
})();
