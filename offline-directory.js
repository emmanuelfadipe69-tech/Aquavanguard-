(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var concern = params.get("concern");
  var topicsByConcern = {
    unknown: "unknown",
    microbial: "flood",
    cloudy: "cloudy",
    chemical: "chemical",
    shortage: "shortage",
    storage: "storage"
  };
  var topic = topicsByConcern[concern];
  if (!topic) return;

  document.querySelectorAll("[data-topic-card]").forEach(function (card) {
    var selected = card.getAttribute("data-topic-card") === topic;
    card.classList.toggle("is-recommended", selected);
    if (selected) card.setAttribute("aria-current", "true");
  });
})();
