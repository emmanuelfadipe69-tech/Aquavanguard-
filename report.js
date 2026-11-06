/* =====================================================
   AquaVanguard - local community source reports
   ===================================================== */
(function () {
  "use strict";

  var form = document.getElementById("report-form");
  if (!form) return;

  var stateSelect = document.getElementById("report-state");
  var latInput = document.getElementById("report-lat");
  var lngInput = document.getElementById("report-lng");
  var locationStatus = document.getElementById("report-location-status");
  var feedback = document.getElementById("report-feedback");
  var reportCount = document.getElementById("report-count");
  var photoInput = document.getElementById("report-photo");
  var locationMarker = null;
  var map = null;

  var stateViews = {
    lagos: { center: [6.5244, 3.3792], bounds: [[6.15, 2.65], [6.95, 4.45]] },
    ondo: { center: [7.2571, 5.2058], bounds: [[5.75, 4.25], [7.6, 6.1]] }
  };

  function showFeedback(message, isError, includeBrand) {
    feedback.replaceChildren();
    var text = document.createElement("p");
    if (includeBrand) {
      text.appendChild(document.createTextNode("All "));
      var logo = document.createElement("span");
      logo.className = "logo-word";
      logo.setAttribute("aria-label", "AquaVanguard");
      var logoImage = document.createElement("img");
      logoImage.className = "logo-a";
      logoImage.src = "icons/logo-a.svg";
      logoImage.alt = "";
      logoImage.setAttribute("aria-hidden", "true");
      logo.appendChild(logoImage);
      logo.appendChild(document.createTextNode("quaVanguard"));
      text.appendChild(logo);
      text.appendChild(document.createTextNode(" demo records were removed from this browser."));
    } else {
      text.textContent = message;
    }
    feedback.appendChild(text);
    if (!isError) {
      var link = document.createElement("a");
      link.className = "btn btn-ghost";
      link.href = "map.html";
      link.textContent = "View on map";
      feedback.appendChild(link);
    }
    feedback.classList.toggle("is-error", Boolean(isError));
    feedback.hidden = false;
  }

  function setLocation(lat, lng, moveMap) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    latInput.value = String(lat);
    lngInput.value = String(lng);
    locationStatus.textContent = "Point selected. The saved location will be rounded to an approximate area.";
    if (map) {
      if (!locationMarker) {
        locationMarker = L.marker([lat, lng]).addTo(map);
      } else {
        locationMarker.setLatLng([lat, lng]);
      }
      if (moveMap) map.setView([lat, lng], Math.max(map.getZoom(), 13));
    }
  }

  function clearLocation() {
    latInput.value = "";
    lngInput.value = "";
    locationStatus.textContent = "No point selected yet.";
    if (map && locationMarker) {
      map.removeLayer(locationMarker);
      locationMarker = null;
    }
  }

  function refreshCount() {
    try {
      var count = window.AquaVanguardStore.listReports().length;
      reportCount.textContent = count + " report" + (count === 1 ? "" : "s") + " saved in this browser.";
    } catch (error) {
      reportCount.textContent = error.message;
      console.error("AquaVanguard report count failed:", error);
    }
  }

  function readOptionalPhoto() {
    var file = photoInput.files && photoInput.files[0];
    if (!file) return Promise.resolve("");
    if (!file.type || file.type.indexOf("image/") !== 0) {
      return Promise.reject(new Error("Choose an image file for the optional photo."));
    }
    if (file.size > 8 * 1024 * 1024) {
      return Promise.reject(new Error("The photo must be smaller than 8 MB."));
    }

    return new Promise(function (resolve, reject) {
      var image = new Image();
      var objectUrl = URL.createObjectURL(file);
      image.onload = function () {
        URL.revokeObjectURL(objectUrl);
        var scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        var context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("This browser could not prepare the photo. Remove it or try another image."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        var dataUrl = canvas.toDataURL("image/jpeg", 0.62);
        if (dataUrl.length > 90000) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.42);
        }
        if (dataUrl.length > 90000) {
          reject(new Error("This photo could not be compressed enough for local storage. Choose a smaller image."));
          return;
        }
        resolve(dataUrl);
      };
      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("The selected photo could not be opened."));
      };
      image.src = objectUrl;
    });
  }

  if (window.L) {
    var initialView = stateViews[stateSelect.value] || stateViews.lagos;
    map = L.map("report-map", {
      zoomControl: true,
      scrollWheelZoom: false,
      minZoom: 7,
      maxZoom: 18
    }).setView(initialView.center, 10);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Sources: Esri, HERE, Garmin, OpenStreetMap contributors",
      maxZoom: 18
    }).addTo(map);
    map.on("click", function (event) {
      setLocation(event.latlng.lat, event.latlng.lng, false);
    });
  } else {
    locationStatus.textContent = "The map could not load. Use the approximate device location button if available.";
    console.error("AquaVanguard report: Leaflet did not load.");
  }

  stateSelect.addEventListener("change", function () {
    var stateView = stateViews[stateSelect.value];
    if (map && stateView) map.fitBounds(stateView.bounds, { maxZoom: 10 });
    clearLocation();
  });

  document.getElementById("report-use-location").addEventListener("click", function () {
    if (!navigator.geolocation) {
      locationStatus.textContent = "This browser does not provide device location. Tap the map to choose an area.";
      return;
    }
    locationStatus.textContent = "Requesting device location permission...";
    navigator.geolocation.getCurrentPosition(function (position) {
      setLocation(position.coords.latitude, position.coords.longitude, true);
    }, function (error) {
      console.error("AquaVanguard location request failed:", error);
      locationStatus.textContent = error.code === error.PERMISSION_DENIED ?
        "Location permission was denied. Tap the map to choose an approximate area." :
        "Could not get device location. Tap the map to choose an approximate area.";
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!latInput.value || !lngInput.value) {
      showFeedback("Choose an approximate point by tapping the map or using device location.", true);
      return;
    }
    var selectedStateView = stateViews[stateSelect.value];
    var lat = Number(latInput.value);
    var lng = Number(lngInput.value);
    var withinSelectedState = selectedStateView &&
      lat >= selectedStateView.bounds[0][0] && lat <= selectedStateView.bounds[1][0] &&
      lng >= selectedStateView.bounds[0][1] && lng <= selectedStateView.bounds[1][1];
    if (!withinSelectedState) {
      showFeedback("The selected point is outside the chosen state. Change the state or choose a point within it.", true);
      return;
    }

    readOptionalPhoto().then(function (photo) {
      var values = new FormData(form);
      var observations = values.getAll("observations");
      var notes = String(values.get("notes") || "").trim();
      var descriptionParts = ["Community report · user observation · not independently verified"];
      if (observations.length) descriptionParts.push(observations.join(", "));
      if (notes) descriptionParts.push(notes);

      var lat = Math.round(Number(latInput.value) * 100) / 100;
      var lng = Math.round(Number(lngInput.value) * 100) / 100;
      var status = values.get("status");
      var risk = status === "problem" ? "high" : "medium";
      var source = window.AquaVanguardStore.saveReport({
        state: String(values.get("state")),
        name: String(values.get("name")).trim(),
        area: String(values.get("area")).trim(),
        type: String(values.get("type")),
        status: String(status),
        risk: risk,
        date: new Date().toLocaleDateString(),
        observation: descriptionParts.join(". "),
        lat: lat,
        lng: lng,
        photo: photo
      });

      form.reset();
      clearLocation();
      showFeedback("Report saved on this device at an approximate location. It is an unverified community observation, not a water-quality test.", false);
      var diagnoseLink = document.createElement("a");
      diagnoseLink.className = "btn btn-ghost";
      diagnoseLink.href = "diagnose.html?source=" + encodeURIComponent(source.id);
      diagnoseLink.textContent = "Diagnose this source";
      feedback.appendChild(diagnoseLink);

      var reportedConcern = observations.indexOf("Possible fuel or chemical sheen") !== -1 ?
        "chemical" :
        observations.indexOf("Recent flooding or heavy rain") !== -1 ||
          observations.indexOf("Waste or sewage nearby") !== -1 ?
          "microbial" :
          observations.indexOf("Unusual color or cloudiness") !== -1 ?
            "cloudy" : "unknown";
      var actionLink = document.createElement("a");
      actionLink.className = "btn btn-ghost";
      actionLink.href = "blueprints.html?concern=" + reportedConcern +
        "&source=" + encodeURIComponent(source.id);
      actionLink.textContent = "See related videos and next steps";
      feedback.appendChild(actionLink);
      refreshCount();
    }).catch(function (error) {
      showFeedback(error.message || "The report could not be saved.", true);
    });
  });

  form.addEventListener("reset", function () {
    feedback.hidden = true;
    clearLocation();
  });

  document.getElementById("report-clear-local").addEventListener("click", function () {
    if (!window.confirm("Clear all community reports, test entries, and retests saved in this browser? This cannot be undone.")) return;
    try {
      window.AquaVanguardStore.clear();
      refreshCount();
      showFeedback("", false, true);
    } catch (error) {
      showFeedback(error.message, true);
      console.error("AquaVanguard local records could not be cleared.", error);
    }
  });

  refreshCount();
})();
