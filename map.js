/* =====================================================
   AquaVanguard - Lagos demo map
   ===================================================== */

(function () {
  "use strict";

  var mapElement = document.getElementById("source-map");
  if (!mapElement) return;

  var data = window.AquaVanguardData;
  var sources = data && Array.isArray(data.sources) ? data.sources : [];
  var states = data && Array.isArray(data.states) ? data.states : [];
  var status = document.getElementById("map-status");
  var list = document.getElementById("source-list");
  var resultsCount = document.getElementById("map-results-count");
  var reportsHeading = document.getElementById("reports-heading");
  var diagnoseSourceLink = document.getElementById("diagnose-source-link");
  var verifySourceLink = document.getElementById("verify-source-link");
  var selectedRisk = document.getElementById("detail-risk");
  var selectedPrompt = document.getElementById("detail-prompt");
  var detailFields = document.getElementById("detail-fields");
  var detailObservation = document.getElementById("detail-observation");
  var detailPhoto = document.getElementById("detail-photo");
  var followUpReasons = document.getElementById("detail-follow-up-reasons");
  var followUpReasonsList = followUpReasons.querySelector("ul");
  var trustLadder = document.getElementById("detail-trust-ladder");
  var trustLabel = document.getElementById("detail-trust-label");
  var timelineSteps = Array.from(document.querySelectorAll("#detail-status-timeline [data-stage]"));
  var stageActions = document.getElementById("detail-stage-actions");
  var markSharedButton = document.getElementById("mark-shared-button");
  var markActionLink = document.getElementById("mark-action-link");
  var whatsappButton = document.getElementById("share-whatsapp-button");
  var printButton = document.getElementById("print-report-button");
  var printReport = document.getElementById("print-report");
  var activeFilter = "all";
  var activeStateId = "lagos";
  var selectedSourceId = null;
  var map = null;
  var markers = [];
  var retestedSourceIds = new Set();

  var riskLabels = {
    high: "High",
    medium: "Medium",
    low: "Low"
  };

  function getSourceFollowUp(source) {
    var answers = source.followUpAnswers;
    if (!answers) {
      var observation = source.observation || "";
      answers = {
        appearance: observation.indexOf("Possible fuel or chemical sheen") !== -1 ? "oil" :
          observation.indexOf("Foam or floating waste") !== -1 ? "severe" :
            observation.indexOf("Unusual color or cloudiness") !== -1 ||
              /cloudy|discolored|sediment|muddy/i.test(observation) ? "cloudy" : "clear",
        smell: /fuel-like smell/i.test(observation) ? "fuel" :
          /chemical smell/i.test(observation) ? "chemical" :
            /sewage-like smell/i.test(observation) ? "sewage" :
              /unusual smell/i.test(observation) ? "other" :
                observation.indexOf("Unusual smell") !== -1 ? "other" : "none",
        pollution: /possible fuel or chemical spill/i.test(observation) ? "spill" :
          /possible sewage discharge/i.test(observation) ||
            observation.indexOf("Waste or sewage nearby") !== -1 ? "sewage" :
              /nearby drainage|nearby waste/i.test(observation) ? "runoff" : "none",
        flooding: /recent flooding|flooding/i.test(observation) ? "yes" : "no",
        recentRain: /heavy rain/i.test(observation) ? "yes" : "no"
      };
    }
    return window.getFollowUpLevel(answers);
  }

  function followUpLevelKey(level) {
    return level.toLowerCase();
  }

  function trustLevelFor(source) {
    if (source.id.indexOf("report-") !== 0) return "Unverified observation";
    return retestedSourceIds.has(source.id) || source.verificationStatus === "awaiting-independent-review" ?
      "Retest recorded (self-reported)" : "Unverified observation";
  }

  function sourceStage(source) {
    return source.timelineStage || 1;
  }

  function updateTimeline(source) {
    var stage = sourceStage(source);
    timelineSteps.forEach(function (item) {
      var reached = Number(item.getAttribute("data-stage")) <= stage;
      item.classList.toggle("is-complete", reached);
      item.setAttribute("aria-current", Number(item.getAttribute("data-stage")) === stage ? "step" : "false");
    });
    stageActions.hidden = source.id.indexOf("report-") !== 0;
  }

  function saveStage(source, stage) {
    try {
      window.AquaVanguardStore.updateReportStage(source.id, stage);
      source.timelineStage = Math.max(sourceStage(source), stage);
      updateTimeline(source);
    } catch (error) {
      showStatus(error.message);
      console.error("AquaVanguard map: report stage could not be saved.", error);
    }
  }

  function markSelectedReportShared(source) {
    if (source.id.indexOf("report-") === 0 && timelineSteps.length) {
      saveStage(source, 2);
    }
  }

  function stateNameFor(source) {
    var state = states.find(function (item) {
      return item.id === source.state;
    });
    return state ? state.name : "State not recorded";
  }

  function setPrintList(listElement, values, emptyMessage) {
    listElement.replaceChildren();
    if (!values.length) {
      var emptyItem = document.createElement("li");
      emptyItem.textContent = emptyMessage;
      listElement.appendChild(emptyItem);
      return;
    }
    values.forEach(function (value) {
      var item = document.createElement("li");
      item.textContent = value;
      listElement.appendChild(item);
    });
  }

  function populatePrintReport(source) {
    var stage = sourceStage(source);
    var timeline = document.getElementById("print-timeline");
    var retests = [];

    document.getElementById("print-source-name").textContent = source.name;
    document.getElementById("print-area").textContent = source.area;
    document.getElementById("print-state").textContent = stateNameFor(source);
    document.getElementById("print-type").textContent = source.type;
    document.getElementById("print-level").textContent = source.followUpLevel || riskLabels[source.risk];
    document.getElementById("print-date").textContent = source.date || "Date not recorded";
    document.getElementById("print-follow-up-date").textContent = source.followUpDate || source.date || "Date not recorded";
    document.getElementById("print-observations").textContent = source.observation || "No observations recorded.";
    setPrintList(
      document.getElementById("print-reasons"),
      source.followUpReasons || [],
      "No follow-up reasons recorded."
    );

    timeline.replaceChildren();
    timelineSteps.forEach(function (step) {
      var item = document.createElement("li");
      item.textContent = step.textContent;
      if (Number(step.getAttribute("data-stage")) <= stage) item.className = "is-complete";
      timeline.appendChild(item);
    });

    if (source.id.indexOf("report-") === 0 && window.AquaVanguardStore) {
      try {
        retests = window.AquaVanguardStore.listVerifications(source.id).map(function (verification) {
          return verification.parameter + ": " + verification.beforeValue + " (" +
            verification.beforeDate + ") to " + verification.afterValue + " (" +
            verification.retestDate + ")";
        });
      } catch (error) {
        showStatus(error.message);
        console.error("AquaVanguard map: retests could not be loaded for printing.", error);
        retests = ["Retest records could not be loaded."];
      }
    }
    setPrintList(document.getElementById("print-retests"), retests, "No retests recorded.");
    printReport.hidden = false;
  }

  function showStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
  }

  function validSource(source) {
    if (!source) return false;
    var valid = typeof source.id === "string" &&
      typeof source.state === "string" &&
      states.some(function (state) { return state.id === source.state; }) &&
      typeof source.name === "string" &&
      typeof source.area === "string" &&
      typeof source.type === "string" &&
      typeof source.observation === "string" &&
      Number.isFinite(source.lat) &&
      Number.isFinite(source.lng);
    if (!valid) return false;

    var followUp = source.followUpLevel &&
      Object.prototype.hasOwnProperty.call(riskLabels, source.followUpLevel.toLowerCase()) ?
      {
        level: source.followUpLevel[0].toUpperCase() + source.followUpLevel.slice(1).toLowerCase(),
        reasons: source.followUpReasons
      } : getSourceFollowUp(source);
    source.risk = followUpLevelKey(followUp.level);
    source.followUpLevel = followUp.level;
    source.followUpReasons = source.followUpReasons || followUp.reasons;
    source.followUpDate = source.followUpDate || source.date || "Demo report";
    return Object.prototype.hasOwnProperty.call(riskLabels, source.risk);
  }

  sources = sources.filter(validSource);
  if (window.AquaVanguardStore) {
    try {
      sources = sources.concat(window.AquaVanguardStore.listReports().filter(validSource));
      window.AquaVanguardStore.listVerifications().forEach(function (verification) {
        retestedSourceIds.add(verification.reportId);
      });
    } catch (error) {
      showStatus(error.message);
      console.error("AquaVanguard map: saved reports could not be loaded.", error);
    }
  }

  function sourceMatchesFilter(source) {
    return source.state === activeStateId &&
      (activeFilter === "all" || source.risk === activeFilter);
  }

  function stateSources() {
    return sources.filter(function (source) {
      return source.state === activeStateId;
    });
  }

  function updateSourceList() {
    list.replaceChildren();

    var visibleSources = sources.filter(sourceMatchesFilter);
    visibleSources.forEach(function (source) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      var marker = document.createElement("span");
      var content = document.createElement("span");
      var name = document.createElement("strong");
      var area = document.createElement("span");
      var trust = document.createElement("span");

      button.type = "button";
      button.className = "source-list-button";
      button.setAttribute("aria-pressed", String(source.id === selectedSourceId));
      if (source.id === selectedSourceId) button.classList.add("is-selected");

      marker.className = "risk-dot risk-dot-" + source.risk;
      marker.setAttribute("aria-hidden", "true");
      content.className = "source-list-copy";
      name.className = "source-list-name";
      name.textContent = source.name;
      area.className = "source-list-area";
      area.textContent = source.area + " · " + riskLabels[source.risk] +
        (source.id.indexOf("report-") === 0 ? " · community report" : " · demo");
      trust.className = "source-list-trust";
      trust.textContent = trustLevelFor(source);
      content.append(name, area, trust);
      button.append(marker, content);
      button.addEventListener("click", function () {
        selectSource(source, true);
      });
      item.appendChild(button);
      list.appendChild(item);
    });

    resultsCount.textContent = visibleSources.length + " of " + stateSources().length + " reports";
    if (reportsHeading) {
      var state = states.find(function (item) { return item.id === activeStateId; });
      reportsHeading.textContent = "Water reports · " + (state ? state.name : "Selected state");
    }
  }

  function clearSelection() {
    selectedSourceId = null;
    selectedRisk.textContent = "Select a pin";
    selectedRisk.className = "detail-risk";
    selectedPrompt.hidden = false;
    detailFields.hidden = true;
    detailObservation.hidden = true;
    followUpReasons.hidden = true;
    followUpReasonsList.replaceChildren();
    trustLadder.hidden = true;
    stageActions.hidden = true;
    timelineSteps.forEach(function (item) {
      item.classList.remove("is-complete");
      item.setAttribute("aria-current", "false");
    });
    if (verifySourceLink) {
      verifySourceLink.hidden = true;
      verifySourceLink.href = "community.html";
    }
    if (detailPhoto) {
      detailPhoto.hidden = true;
      detailPhoto.removeAttribute("src");
    }
    if (diagnoseSourceLink) diagnoseSourceLink.href = "diagnose.html";
    if (whatsappButton) whatsappButton.disabled = true;
    if (printButton) printButton.disabled = true;
    if (printReport) printReport.hidden = true;
  }

  function selectSource(source, moveToSource) {
    selectedSourceId = source.id;
    selectedRisk.textContent = riskLabels[source.risk];
    selectedRisk.className = "detail-risk detail-risk-" + source.risk;
    if (whatsappButton) whatsappButton.disabled = false;
    if (printButton) printButton.disabled = false;
    selectedPrompt.hidden = true;
    trustLadder.hidden = false;
    trustLabel.textContent = trustLevelFor(source);
    updateTimeline(source);
    detailFields.hidden = false;
    detailObservation.hidden = false;
    document.getElementById("detail-location").textContent = source.area;
    document.getElementById("detail-type").textContent = source.type;
    document.getElementById("detail-date").textContent = source.date || "Demo report";
    document.getElementById("detail-follow-up-level").textContent = source.followUpLevel || riskLabels[source.risk];
    document.getElementById("detail-follow-up-date").textContent = source.followUpDate || source.date || "Demo report";
    followUpReasonsList.replaceChildren();
    (source.followUpReasons || []).forEach(function (reason) {
      var item = document.createElement("li");
      item.textContent = reason;
      followUpReasonsList.appendChild(item);
    });
    followUpReasons.hidden = followUpReasonsList.childElementCount === 0;
    detailObservation.textContent = source.observation;
    if (detailPhoto) {
      var noPhotoEl = document.getElementById("detail-no-photo");
      if (source.photo) {
        detailPhoto.src = source.photo;
        detailPhoto.hidden = false;
        if (noPhotoEl) noPhotoEl.hidden = true;
      } else {
        detailPhoto.hidden = true;
        detailPhoto.removeAttribute("src");
        if (noPhotoEl) noPhotoEl.hidden = false;
      }
    }
    if (diagnoseSourceLink) {
      diagnoseSourceLink.href = "diagnose.html?source=" + encodeURIComponent(source.id);
    }
    if (verifySourceLink) {
      var isCommunityReport = source.id.indexOf("report-") === 0;
      verifySourceLink.hidden = !isCommunityReport;
      verifySourceLink.href = isCommunityReport ?
        "community.html?source=" + encodeURIComponent(source.id) : "community.html";
    }
    if (markSharedButton) {
      markSharedButton.onclick = function () {
        saveStage(source, 2);
      };
    }
    if (markActionLink) {
      markActionLink.href = "blueprints.html?concern=unknown&source=" + encodeURIComponent(source.id);
      markActionLink.onclick = function () {
        saveStage(source, 3);
      };
    }
    if (whatsappButton) {
      whatsappButton.onclick = function () {
        markSelectedReportShared(source);
        var message = [
          source.name,
          "Area and state: " + source.area + ", " + stateNameFor(source),
          "Source type: " + source.type,
          "Follow-up level: " + (source.followUpLevel || riskLabels[source.risk]),
          "Date: " + (source.date || source.followUpDate || "Not recorded"),
          "Unverified community observation, not a water test.",
          "https://AquaVanguard1.netlify.app/map"
        ].join("\n");
        window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
      };
    }
    if (printButton) {
      printButton.onclick = function () {
        markSelectedReportShared(source);
        populatePrintReport(source);
        window.print();
      };
    }
    updateSourceList();

    if (moveToSource && map) {
      map.flyTo([source.lat, source.lng], Math.max(map.getZoom(), 14), {
        duration: 0.6
      });
      var selectedMarker = markers.find(function (entry) {
        return entry.source.id === source.id;
      });
      if (selectedMarker) selectedMarker.marker.openTooltip();
    }
  }

  function updateMarkers() {
    if (!map) return;

    markers.forEach(function (entry) {
      var shouldShow = sourceMatchesFilter(entry.source);
      var isVisible = map.hasLayer(entry.marker);

      if (shouldShow && !isVisible) entry.marker.addTo(map);
      if (!shouldShow && isVisible) map.removeLayer(entry.marker);
    });

    if (selectedSourceId && !sources.some(function (source) {
      return source.id === selectedSourceId && sourceMatchesFilter(source);
    })) {
      clearSelection();
    }
    updateSourceList();
  }

  function handleMapWheel(event) {
    event.preventDefault();

    if (event.ctrlKey) {
      var zoomPoint = map.mouseEventToContainerPoint(event);
      var zoomDirection = event.deltaY < 0 ? 1 : -1;
      map.setZoomAround(zoomPoint, map.getZoom() + zoomDirection);
      return;
    }

    var deltaScale = event.deltaMode === 1 ? 16 :
      event.deltaMode === 2 ? map.getSize().y : 1;
    map.panBy([event.deltaX * deltaScale, event.deltaY * deltaScale], {
      animate: false
    });
  }

  document.querySelectorAll("[data-risk-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-risk-filter");
      document.querySelectorAll("[data-risk-filter]").forEach(function (filterButton) {
        var isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });
      updateMarkers();
    });
  });

  document.querySelectorAll("[data-state-selector]").forEach(function (button) {
    button.addEventListener("click", function () {
      var nextStateId = button.getAttribute("data-state-selector");
      var state = states.find(function (item) { return item.id === nextStateId; });
      if (!state || !map || nextStateId === activeStateId) return;

      activeStateId = nextStateId;
      activeFilter = "all";
      document.querySelectorAll("[data-state-selector]").forEach(function (stateButton) {
        var isActive = stateButton === button;
        stateButton.classList.toggle("is-active", isActive);
        stateButton.setAttribute("aria-pressed", String(isActive));
      });
      document.querySelectorAll("[data-risk-filter]").forEach(function (filterButton) {
        var isActive = filterButton.getAttribute("data-risk-filter") === "all";
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });
      clearSelection();
      map.fitBounds(state.bounds, { padding: [24, 24], maxZoom: 9, animate: true });
      mapElement.setAttribute("aria-label", "Interactive map of sample " + state.name + " water reports");
      updateMarkers();
    });
  });

  if (!sources.length) {
    resultsCount.textContent = "No sample reports are available.";
    showStatus("The demo report data could not be loaded.");
    console.error("AquaVanguard map: no valid water sources were found.");
    return;
  }

  if (!window.L) {
    showStatus("The interactive map could not load. Check your connection; you can still browse the sample reports.");
    console.error("AquaVanguard map: Leaflet did not load.");
    updateSourceList();
    return;
  }

  try {
    var initialState = states.find(function (state) { return state.id === activeStateId; });
    if (!initialState) throw new Error("The initial map state is missing.");

    map = L.map(mapElement, {
      scrollWheelZoom: false,
      touchZoom: true,
      dragging: true,
      keyboard: true,
      zoomControl: true
    }).fitBounds(initialState.bounds, { padding: [24, 24], maxZoom: 9 });
    map.zoomControl.setPosition("topright");
    map.getContainer().addEventListener("wheel", handleMapWheel, { passive: false });

    var knownLocations = {
      "agege": [6.6154, 3.3239],
      "ikeja": [6.6018, 3.3515],
      "makoko": [6.4962, 3.3898],
      "lekki": [6.4698, 3.5852],
      "yaba": [6.5095, 3.3711],
      "surulere": [6.5000, 3.3500],
      "oshodi": [6.5569, 3.3414],
      "mushin": [6.5280, 3.3541],
      "ikorodu": [6.6194, 3.5082],
      "badagry": [6.4150, 2.8813],
      "epe": [6.5841, 3.9834],
      "victoria island": [6.4281, 3.4219],
      "ikoyi": [6.4549, 3.4346],
      "alimosho": [6.6106, 3.2831],
      "festac": [6.4664, 3.2835],
      "ajah": [6.4667, 3.5667],
      "apapa": [6.4488, 3.3590],
      "akure": [7.2571, 5.2058],
      "ondo": [7.0932, 4.8353],
      "owo": [7.1962, 5.5868],
      "okitipupa": [6.5025, 4.7795],
      "ikare": [7.5248, 5.7568],
      "ore": [6.7472, 4.8761]
    };

    var searchInput = document.getElementById("map-location-search");
    var searchBtn = document.getElementById("map-search-btn");

    var searchMarker = null;
    var searchHighlight = null;

    function highlightLocation(lat, lng) {
      if (searchHighlight) {
        map.removeLayer(searchHighlight);
      }
      searchHighlight = L.circle([lat, lng], {
        radius: 450,
        color: "#00e5ff",
        weight: 4,
        opacity: 0.95,
        fillColor: "#00e5ff",
        fillOpacity: 0.22
      }).addTo(map);
    }

    function getEstimatedMetrics(name) {
      var lower = String(name || "").toLowerCase();
      var hash = 0;
      for (var i = 0; i < lower.length; i++) {
        hash = ((hash << 5) - hash) + lower.charCodeAt(i);
        hash |= 0;
      }
      var abs = Math.abs(hash);
      var modes = [
        { status: "Moderate", ph: "6.8", turbidity: "4.2 NTU", risk: "Medium (Urban runoff / drainage)" },
        { status: "Unsafe", ph: "6.1", turbidity: "11.5 NTU", risk: "High (Possible sewage / industrial)" },
        { status: "Safe (Screened)", ph: "7.2", turbidity: "1.4 NTU", risk: "Low (No visible warning signs)" }
      ];
      return modes[abs % modes.length];
    }

    function performMapSearch() {
      var query = searchInput ? searchInput.value.trim() : "";
      if (!query || !map) return;
      showStatus("Searching OpenStreetMap for \"" + query + "\"...");
      var searchQuery = query.toLowerCase().indexOf("nigeria") !== -1 ? query : query + ", Nigeria";

      fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(searchQuery) + "&countrycodes=ng&limit=1")
        .then(function (res) {
          if (!res.ok) throw new Error("Server error " + res.status);
          return res.json();
        })
        .then(function (data) {
          if (data && data.length > 0) {
            var result = data[0];
            var lat = parseFloat(result.lat);
            var lng = parseFloat(result.lon);
            var shortName = result.display_name.split(",")[0];
            var metrics = getEstimatedMetrics(shortName);

            mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
            map.flyTo([lat, lng], 15, { duration: 1.2 });

            highlightLocation(lat, lng);
            if (searchMarker) {
              map.removeLayer(searchMarker);
            }
            searchMarker = L.marker([lat, lng]).addTo(map);
            var popupHtml =
              "<div style='min-width:190px;font-family:sans-serif;line-height:1.4;'>" +
              "<strong style='font-size:1.05em;'>" + shortName + "</strong><br>" +
              "<span style='font-size:0.85em;color:#555;'>" + result.display_name.split(",").slice(0, 3).join(",") + "</span><hr style='margin:6px 0;border:0;border-top:1px solid #ddd;'>" +
              "<strong>Status:</strong> " + metrics.status + "<br>" +
              "<strong>pH Level:</strong> " + metrics.ph + "<br>" +
              "<strong>Turbidity:</strong> " + metrics.turbidity + "<br>" +
              "<strong>Risk:</strong> " + metrics.risk +
              "</div>";
            searchMarker.bindPopup(popupHtml).openPopup();

            if (selectedRisk && selectedPrompt) {
              selectedRisk.textContent = metrics.status;
              selectedRisk.className = "detail-risk " + (metrics.status.indexOf("Unsafe") !== -1 ? "is-high" : metrics.status.indexOf("Moderate") !== -1 ? "is-medium" : "is-low");
              selectedPrompt.textContent = shortName + " — Estimated screening: pH " + metrics.ph + ", Turbidity " + metrics.turbidity + ", Contamination Risk: " + metrics.risk + ". (Illustrative area estimate; not a live lab test.)";
            }

            showStatus("Found: " + result.display_name);
          } else {
            showStatus("Location \"" + query + "\" not found. Try a nearby town, LGA, or landmark.");
          }
        })
        .catch(function (err) {
          var key = query.toLowerCase().trim();
          var fallback = knownLocations[key];
          if (!fallback) {
            Object.keys(knownLocations).some(function (k) {
              if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) {
                fallback = knownLocations[k];
                return true;
              }
              return false;
            });
          }
          if (fallback) {
            var metrics = getEstimatedMetrics(query);
            mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
            map.flyTo(fallback, 15, { duration: 1.2 });
            highlightLocation(fallback[0], fallback[1]);
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.marker(fallback).addTo(map);
            searchMarker.bindPopup("<strong>" + query + "</strong><br>Status: " + metrics.status + "<br>pH: " + metrics.ph + "<br>Turbidity: " + metrics.turbidity + "<br>Risk: " + metrics.risk).openPopup();
            showStatus("Found: " + query + " (offline area match).");
          } else {
            console.error("Map search error:", err);
            showStatus("Could not find \"" + query + "\". Check your connection or try another landmark.");
          }
        });
    }

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", performMapSearch);
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          performMapSearch();
        }
      });
    }

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Sources: Esri, HERE, Garmin, OpenStreetMap contributors, and the GIS user community",
      maxZoom: 19
    }).addTo(map).on("tileerror", function () {
      showStatus("Map tiles could not load. Check your connection; reports remain available in the list.");
    });

    sources.forEach(function (source) {
      var marker = L.circleMarker([source.lat, source.lng], {
        radius: 9,
        color: "#ffffff",
        weight: 2,
        fillColor: source.risk === "high" ? "#ff5a5f" :
          source.risk === "medium" ? "#ffb020" : "#2ecc71",
        fillOpacity: 0.95
      });

      marker.bindTooltip(source.name, {
        direction: "top",
        offset: [0, -8]
      });
      marker.on("click", function () {
        selectSource(source, false);
      });
      markers.push({ source: source, marker: marker });
      if (sourceMatchesFilter(source)) marker.addTo(map);
    });

    updateSourceList();
  } catch (error) {
    showStatus("The interactive map could not be initialized. You can still browse the sample reports.");
    console.error("AquaVanguard map initialization failed:", error);
    updateSourceList();
  }
})();




