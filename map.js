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
  var activeFilter = "all";
  var activeStateId = "lagos";
  var selectedSourceId = null;
  var map = null;
  var markers = [];

  var riskLabels = {
    high: "High risk",
    medium: "Medium risk",
    low: "Low risk"
  };

  function showStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
  }

  function validSource(source) {
    return source &&
      typeof source.id === "string" &&
      typeof source.state === "string" &&
      states.some(function (state) { return state.id === source.state; }) &&
      typeof source.name === "string" &&
      typeof source.area === "string" &&
      typeof source.type === "string" &&
      typeof source.observation === "string" &&
      Object.prototype.hasOwnProperty.call(riskLabels, source.risk) &&
      Number.isFinite(source.lat) &&
      Number.isFinite(source.lng);
  }

  sources = sources.filter(validSource);
  if (window.AquaVanguardStore) {
    try {
      sources = sources.concat(window.AquaVanguardStore.listReports().filter(validSource));
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
      content.append(name, area);
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
    if (verifySourceLink) {
      verifySourceLink.hidden = true;
      verifySourceLink.href = "community.html";
    }
    if (detailPhoto) {
      detailPhoto.hidden = true;
      detailPhoto.removeAttribute("src");
    }
    if (diagnoseSourceLink) diagnoseSourceLink.href = "diagnose.html";
  }

  function selectSource(source, moveToSource) {
    selectedSourceId = source.id;
    selectedRisk.textContent = riskLabels[source.risk];
    selectedRisk.className = "detail-risk detail-risk-" + source.risk;
    selectedPrompt.hidden = true;
    detailFields.hidden = false;
    detailObservation.hidden = false;
    document.getElementById("detail-location").textContent = source.area;
    document.getElementById("detail-type").textContent = source.type;
    document.getElementById("detail-date").textContent = source.date || "Demo report";
    detailObservation.textContent = source.observation;
    if (detailPhoto) {
      if (source.photo) {
        detailPhoto.src = source.photo;
        detailPhoto.hidden = false;
      } else {
        detailPhoto.hidden = true;
        detailPhoto.removeAttribute("src");
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
      keyboard: true,
      zoomControl: true
    }).fitBounds(initialState.bounds, { padding: [24, 24], maxZoom: 9 });
    map.zoomControl.setPosition("topright");
    map.getContainer().addEventListener("wheel", handleMapWheel, { passive: false });

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