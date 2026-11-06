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
  var pictureGuides = document.querySelectorAll("[data-guide]");
  var offlineStatus = document.getElementById("act-offline-status");
  var saveOfflineButton = document.getElementById("act-save-offline");
  var offlineDirectoryLink = document.getElementById("act-offline-directory-link");
  var videoLibrary = window.AquaVanguardVideoLibrary || [];
  var videoGrid = document.getElementById("act-video-grid");
  var videoSearch = document.getElementById("act-video-search");
  var videoIntro = document.getElementById("act-video-intro");
  var videoResultsStatus = document.getElementById("act-video-results-status");
  var showAllVideosButton = document.getElementById("act-video-show-all");
  var loadMoreVideosButton = document.getElementById("act-video-load-more");
  var historyToggle = document.getElementById("act-video-history-toggle");
  var historySection = document.getElementById("act-video-history");
  var historyList = document.getElementById("act-video-history-list");
  var historyClearButton = document.getElementById("act-video-history-clear");
  var currentVideoConcern = "unknown";
  var showAllVideos = false;
  var videoPageSize = 8;
  var visibleVideoCount = videoPageSize;
  var videoHistory = [];
  var historyStorageAvailable = true;
  var videoTopicLabels = {
    unknown: "Unknown safety",
    microbial: "Germs or flooding",
    cloudy: "Cloudy water",
    chemical: "Fuel or chemicals",
    shortage: "Water shortage",
    storage: "Safe storage"
  };
  var videoHistoryKey = "aquavanguard-video-history-v1";
  var blueprintTitle = document.getElementById("act-blueprint-title");
  var blueprintSummary = document.getElementById("act-blueprint-summary");
  var blueprintMaterials = document.getElementById("act-blueprint-materials");
  var budgetItems = document.getElementById("act-budget-items");
  var budgetTotal = document.getElementById("act-budget-total");
  var blueprintSafety = document.getElementById("act-blueprint-safety");

  var blueprints = {
    unknown: {
      title: "Unknown safety: source protection and testing plan",
      summary: "Prioritize a known safe alternative and prepare for source testing. This is not a treatment build.",
      materials: ["Water from a source confirmed safe by the responsible authority", "Clean, tightly covered water-storage container", "Local water-authority or qualified-laboratory contact"],
      safety: "Do not build a filter as a substitute for testing. Appearance and smell cannot confirm safety."
    },
    microbial: {
      title: "Possible germs or flooding: safe supply and storage",
      summary: "Plan for a confirmed safe alternative and clean storage. Boil only when official advice recommends it for germs and chemical contamination is not suspected.",
      materials: ["Known safe alternative water supply", "Clean, covered storage container", "Pot and reliable heat source only if local advice calls for boiling"],
      safety: "Boiling can address many germs but does not remove fuel or toxic chemicals. Follow local advisories; no DIY filter here is presented as a drinking-water treatment."
    },
    cloudy: {
      title: "Cloudy water: clarification pre-treatment only",
      summary: "The following items can help settle or strain visible particles before a separate, hazard-appropriate validated treatment. They do not make water safe to drink.",
      materials: ["Clean cloth or suitable paper filter for visible particles", "Clean container with a lid for settling", "Clean covered container to collect clearer water"],
      safety: "Use only if chemical or fuel contamination is not suspected. Settling and cloth straining are pre-treatment only; do not drink without an appropriate validated treatment and official guidance."
    },
    chemical: {
      title: "Possible chemical spill: no home-build treatment",
      summary: "There is no DIY filter or boiling build recommended for suspected fuel or toxic chemical contamination. Focus on avoiding exposure and reporting the hazard.",
      materials: ["Known safe alternative water supply", "Local water or public-health authority contact", "A safe way to keep children and animals away from the affected area"],
      safety: "Do not drink, cook, boil, chlorinate, settle, or filter suspected chemically contaminated water. Ask authorities about testing and cleanup."
    }
  };

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

  function getVideoById(videoId) {
    return videoLibrary.find(function (video) {
      return video.id === videoId;
    });
  }

  function readVideoHistory() {
    try {
      var savedHistory = window.localStorage.getItem(videoHistoryKey);
      if (!savedHistory) return [];

      var parsed = JSON.parse(savedHistory);
      if (!Array.isArray(parsed)) {
        throw new Error("Saved watch history has an invalid format.");
      }

      return parsed.filter(function (item) {
        return item && getVideoById(item.id) && typeof item.watchedAt === "string";
      }).slice(0, 20);
    } catch (error) {
      historyStorageAvailable = false;
      console.error("AquaVanguard watch history could not be read:", error);
      return [];
    }
  }

  function saveVideoHistory(video) {
    var entry = {
      id: video.id,
      watchedAt: new Date().toISOString()
    };
    videoHistory = [entry].concat(videoHistory.filter(function (item) {
      return item.id !== video.id;
    })).slice(0, 20);

    try {
      window.localStorage.setItem(videoHistoryKey, JSON.stringify(videoHistory));
      historyStorageAvailable = true;
    } catch (error) {
      historyStorageAvailable = false;
      console.error("AquaVanguard watch history could not be saved:", error);
    }

    renderVideoHistory();
  }

  function createVideoCard(video) {
    var card = document.createElement("article");
    card.className = "act-video-card";
    card.setAttribute("data-video-topic", currentVideoConcern);
    card.classList.add("is-recommended");
    if (video.type === "filtration") card.classList.add("is-filtration-video");

    var poster = document.createElement("button");
    poster.className = "act-video-poster";
    poster.type = "button";
    poster.setAttribute("data-play-video", "");
    poster.setAttribute("data-video-id", video.id);
    poster.setAttribute("data-video-title", video.title);
    poster.setAttribute("aria-label", "Play " + video.title);
    var image = document.createElement("img");
    image.src = "https://i.ytimg.com/vi/" + encodeURIComponent(video.id) + "/hqdefault.jpg";
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    poster.appendChild(image);
    var playIcon = document.createElement("span");
    playIcon.className = "act-video-play-icon";
    playIcon.setAttribute("aria-hidden", "true");
    poster.appendChild(playIcon);
    var topicBadge = document.createElement("span");
    topicBadge.className = "act-video-topic-badge";
    topicBadge.textContent = video.topics.map(function (topic) {
      return videoTopicLabels[topic] || topic;
    }).join(" · ");
    poster.appendChild(topicBadge);
    card.appendChild(poster);

    var copy = document.createElement("div");
    copy.className = "act-video-copy";
    var channel = document.createElement("p");
    channel.className = "act-video-channel";
    channel.textContent = video.channel;
    copy.appendChild(channel);
    var heading = document.createElement("h3");
    heading.textContent = video.title;
    copy.appendChild(heading);
    var description = document.createElement("p");
    description.textContent = video.description;
    copy.appendChild(description);

    var safetyNote = document.createElement("p");
    safetyNote.className = "act-video-safety";
    if (video.type === "filtration") {
      safetyNote.classList.add("is-filtration-safety");
      safetyNote.textContent = "Filtration safety: " + video.safetyNote;
    } else {
      safetyNote.textContent = "Safety note: " + video.safetyNote;
    }
    copy.appendChild(safetyNote);

    var actions = document.createElement("div");
    actions.className = "act-video-actions";
    var playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "act-video-play-link";
    playButton.setAttribute("data-play-video", "");
    playButton.setAttribute("data-video-id", video.id);
    playButton.setAttribute("data-video-title", video.title);
    playButton.textContent = "Play video";
    actions.appendChild(playButton);

    if (video.guide) {
      var guideButton;
      if (document.getElementById("picture-guide-" + video.guide)) {
        guideButton = document.createElement("button");
        guideButton.type = "button";
        guideButton.setAttribute("data-guide-target", video.guide);
      } else {
        guideButton = document.createElement("a");
        guideButton.href = "offline-guide.html?topic=" + encodeURIComponent(video.guide);
      }
      guideButton.className = "act-guide-link";
      guideButton.textContent = "Open picture guide";
      actions.appendChild(guideButton);
    }

    copy.appendChild(actions);
    card.appendChild(copy);
    return card;
  }

  function getMatchingVideos() {
    var query = videoSearch ? videoSearch.value.trim().toLowerCase() : "";
    return videoLibrary.filter(function (video) {
      var matchesConcern = showAllVideos || Boolean(query) || video.topics.indexOf(currentVideoConcern) !== -1;
      var searchableText = [video.title, video.channel, video.description]
        .concat(video.topics.map(function (topic) {
          return videoTopicLabels[topic] || topic;
        })).join(" ").toLowerCase();
      return matchesConcern && (!query || searchableText.indexOf(query) !== -1);
    });
  }

  function renderVideoLibrary() {
    if (!videoGrid) return;

    var matchingVideos = getMatchingVideos();
    var visibleVideos = matchingVideos.slice(0, visibleVideoCount);
    videoGrid.replaceChildren();
    visibleVideos.forEach(function (video) {
      videoGrid.appendChild(createVideoCard(video));
    });
    var query = videoSearch ? videoSearch.value.trim() : "";
    var filterDescription = showAllVideos || query ?
      "the full curated library" :
      (videoTopicLabels[currentVideoConcern] || "selected topic");
    if (videoIntro) {
      videoIntro.textContent = query ?
        "Searching the curated library for “" + query + "”. Choose a video to play it here, or clear the search to return to videos for your selected concern." :
        showAllVideos ?
          "Browse the full curated library, or choose a concern above to put the most relevant videos first." :
          "Showing videos for " + filterDescription + ". Choose a concern above to change the collection, or browse all curated videos.";
    }

    if (videoResultsStatus) {
      if (matchingVideos.length) {
        videoResultsStatus.textContent = matchingVideos.length + " " +
          (matchingVideos.length === 1 ? "video" : "videos") + " in " + filterDescription +
          (visibleVideos.length < matchingVideos.length ? ". Showing " + visibleVideos.length + "." : ".");
      } else {
        videoResultsStatus.textContent = query ?
          "No curated video matches “" + query + "”. Clear the search or browse all videos. A relevant picture guide is available below." :
          "No curated video is available for this concern yet. Browse all videos or use the matching picture-based guide below.";
      }
    }

    if (showAllVideosButton) {
      showAllVideosButton.setAttribute("aria-pressed", String(showAllVideos));
      showAllVideosButton.textContent = showAllVideos ? "Show selected concern" : "Browse all videos";
    }
    if (loadMoreVideosButton) {
      loadMoreVideosButton.hidden = visibleVideos.length >= matchingVideos.length;
    }
  }

  function renderVideoHistory() {
    if (!historyList) return;
    historyList.replaceChildren();

    if (!historyStorageAvailable) {
      var storageNotice = document.createElement("p");
      storageNotice.className = "act-video-history-empty";
      storageNotice.textContent = "Watch history is unavailable in this browser session. Allow local site storage to keep it on this device.";
      historyList.appendChild(storageNotice);
      return;
    }

    var entries = videoHistory.filter(function (entry) {
      return getVideoById(entry.id);
    });
    if (!entries.length) {
      var emptyNotice = document.createElement("p");
      emptyNotice.className = "act-video-history-empty";
      emptyNotice.textContent = "Videos you open on this device will appear here.";
      historyList.appendChild(emptyNotice);
      return;
    }

    entries.forEach(function (entry) {
      var video = getVideoById(entry.id);
      var row = document.createElement("div");
      row.className = "act-video-history-item";
      var title = document.createElement("span");
      title.textContent = video.title;
      row.appendChild(title);
      var date = document.createElement("time");
      date.dateTime = entry.watchedAt;
      var watchedAt = new Date(entry.watchedAt);
      date.textContent = Number.isNaN(watchedAt.getTime()) ? "" : watchedAt.toLocaleString();
      row.appendChild(date);
      var playButton = document.createElement("button");
      playButton.type = "button";
      playButton.className = "act-video-play-link";
      playButton.setAttribute("data-play-video", "");
      playButton.setAttribute("data-video-id", video.id);
      playButton.setAttribute("data-video-title", video.title);
      playButton.textContent = "Play again";
      row.appendChild(playButton);
      historyList.appendChild(row);
    });
  }

  function openVideo(button) {
    if (!videoDialog || !videoPlayer || !videoDialogTitle) return;

    var videoId = button.getAttribute("data-video-id");
    var videoTitle = button.getAttribute("data-video-title");
    var video = getVideoById(videoId);
    if (!video || !/^[A-Za-z0-9_-]{11}$/.test(videoId) || !videoTitle) return;

    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0&cc_load_policy=1";
    iframe.title = videoTitle;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    videoDialogTitle.textContent = videoTitle;
    videoPlayer.replaceChildren(iframe);

    var dialogSafetyNote = document.getElementById("act-video-dialog-safety");
    if (dialogSafetyNote) {
      dialogSafetyNote.textContent = video.type === "filtration" ?
        "Filtration safety: " + video.safetyNote :
        "Safety note: " + video.safetyNote;
    }

    saveVideoHistory(video);
    videoDialog.showModal();
    if (videoDialogClose) videoDialogClose.focus();
  }

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

    currentVideoConcern = concern;
    showAllVideos = false;
    visibleVideoCount = videoPageSize;
    if (videoSearch) videoSearch.value = "";
    renderVideoLibrary();

    pictureGuides.forEach(function (guide) {
      guide.classList.toggle("is-selected", guide.getAttribute("data-guide") === concern);
    });

    if (offlineDirectoryLink) {
      offlineDirectoryLink.href = "offline-guides.html?concern=" + encodeURIComponent(concern);
    }

    renderBlueprint(concern);

    if (updateHistory) {
      var url = new URL(window.location.href);
      url.searchParams.set("concern", concern);
      window.history.replaceState(null, "", url);
    }
  }

  function renderBlueprint(concern) {
    var blueprint = blueprints[concern];
    if (!blueprint || !blueprintTitle || !blueprintSummary || !blueprintMaterials) return;

    blueprintTitle.textContent = blueprint.title;
    blueprintSummary.textContent = blueprint.summary;
    blueprintSafety.textContent = blueprint.safety;
    blueprintMaterials.replaceChildren();
    budgetItems.replaceChildren();

    blueprint.materials.forEach(function (material, index) {
      var item = document.createElement("li");
      item.textContent = material;
      blueprintMaterials.appendChild(item);

      var label = document.createElement("label");
      label.textContent = material;
      var input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.max = "10000000";
      input.step = "1";
      input.inputMode = "numeric";
      input.placeholder = "Enter local price";
      input.setAttribute("aria-label", "Local price in naira for " + material);
      input.setAttribute("data-material-cost", String(index));
      label.appendChild(input);
      budgetItems.appendChild(label);
    });

    updateBudgetTotal();
  }

  function updateBudgetTotal() {
    if (!budgetItems || !budgetTotal) return;
    var total = 0;
    var hasLocalPrice = false;
    budgetItems.querySelectorAll("[data-material-cost]").forEach(function (input) {
      if (input.value.trim() === "") return;
      var cost = Number(input.value);
      if (Number.isFinite(cost) && cost >= 0) {
        total += cost;
        hasLocalPrice = true;
      }
    });
    budgetTotal.textContent = hasLocalPrice ? "Estimated total from entered local prices: ₦" +
      new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0
      }).format(total) : "Enter local prices above to estimate the total.";
  }

  if (budgetItems) {
    budgetItems.addEventListener("input", updateBudgetTotal);
  }

  document.querySelectorAll("[data-concern]").forEach(function (button) {
    button.addEventListener("click", function () {
      renderConcern(button.getAttribute("data-concern"), true);
    });
  });

  var videoDialog = document.getElementById("act-video-dialog");
  var videoPlayer = document.getElementById("act-video-player");
  var videoDialogTitle = document.getElementById("act-video-dialog-title");
  var videoDialogClose = document.getElementById("act-video-dialog-close");

  function closeVideoDialog() {
    if (videoDialog && videoDialog.open) videoDialog.close();
  }

  [videoGrid, historyList].forEach(function (container) {
    if (!container) return;
    container.addEventListener("click", function (event) {
      var button = event.target.closest("[data-play-video]");
      if (button) openVideo(button);
    });
  });

  if (videoSearch) {
    videoSearch.addEventListener("input", function () {
      visibleVideoCount = videoPageSize;
      renderVideoLibrary();
    });
  }

  if (showAllVideosButton) {
    showAllVideosButton.addEventListener("click", function () {
      showAllVideos = !showAllVideos;
      visibleVideoCount = videoPageSize;
      renderVideoLibrary();
    });
  }

  if (loadMoreVideosButton) {
    loadMoreVideosButton.addEventListener("click", function () {
      visibleVideoCount += videoPageSize;
      renderVideoLibrary();
    });
  }

  if (historyToggle && historySection) {
    historyToggle.addEventListener("click", function () {
      var expanded = historyToggle.getAttribute("aria-expanded") !== "true";
      historyToggle.setAttribute("aria-expanded", String(expanded));
      historySection.hidden = !expanded;
    });
  }

  if (historyClearButton) {
    historyClearButton.addEventListener("click", function () {
      try {
        window.localStorage.removeItem(videoHistoryKey);
        videoHistory = [];
        historyStorageAvailable = true;
      } catch (error) {
        historyStorageAvailable = false;
        console.error("AquaVanguard watch history could not be cleared:", error);
      }
      renderVideoHistory();
    });
  }

  if (videoDialogClose) {
    videoDialogClose.addEventListener("click", closeVideoDialog);
  }

  if (videoDialog) {
    videoDialog.addEventListener("click", function (event) {
      if (event.target === videoDialog) closeVideoDialog();
    });
    videoDialog.addEventListener("close", function () {
      if (videoPlayer) videoPlayer.replaceChildren();
    });
  }

  document.querySelectorAll("[data-guide-target]").forEach(function (button) {
    button.addEventListener("click", function () {
      var concern = button.getAttribute("data-guide-target");
      var guide = document.getElementById("picture-guide-" + concern);
      if (!guide || !recommendations[concern]) return;

      renderConcern(concern, true);
      pictureGuides.forEach(function (item) {
        item.open = item === guide;
      });
      guide.scrollIntoView({ behavior: "smooth", block: "start" });
      guide.querySelector("summary").focus();
    });
  });

  var printButton = document.getElementById("act-print-guide");
  if (printButton) {
    printButton.addEventListener("click", function () {
      var selectedGuide = document.querySelector(".act-picture-guide.is-selected");
      if (selectedGuide) selectedGuide.open = true;
      window.print();
    });
  }

  function sendWorkerMessage(worker, type) {
    return new Promise(function (resolve, reject) {
      var channel = new MessageChannel();
      var timeout = window.setTimeout(function () {
        channel.port1.close();
        reject(new Error("The offline save did not respond. Reconnect and try again."));
      }, 15000);

      channel.port1.onmessage = function (event) {
        window.clearTimeout(timeout);
        channel.port1.close();
        resolve(event.data);
      };

      try {
        worker.postMessage({ type: type }, [channel.port2]);
      } catch (error) {
        window.clearTimeout(timeout);
        channel.port1.close();
        channel.port2.close();
        reject(error);
      }
    });
  }

  function getActiveWorker() {
    return navigator.serviceWorker.ready.then(function (registration) {
      var worker = navigator.serviceWorker.controller || registration.active;
      if (!worker) throw new Error("Offline support is still starting. Try again in a moment.");
      return worker;
    });
  }

  function updateOfflineStatus() {
    if (!offlineStatus) return;
    if (!window.isSecureContext || !("serviceWorker" in navigator)) {
      offlineStatus.textContent = "Offline saving requires HTTPS or localhost. You can still use the picture guides while this page is open.";
      return;
    }

    offlineStatus.textContent = "Checking whether this app is saved for offline use...";
    getActiveWorker().then(function (worker) {
      return sendWorkerMessage(worker, "CHECK_APP_SHELL");
    }).then(function (result) {
      offlineStatus.textContent = result.saved
        ? "Offline guides ready. App pages are saved; videos, live maps, and external links need internet."
        : "Not saved yet. While connected, save the app once to use the picture guides offline.";
    }).catch(function (error) {
      offlineStatus.textContent = "Offline status could not be checked. Try saving again while connected.";
      console.error("AquaVanguard offline cache status could not be checked:", error);
    });
  }

  function saveAppOffline() {
    if (!saveOfflineButton || !offlineStatus) return;
    if (!window.isSecureContext || !("serviceWorker" in navigator)) {
      updateOfflineStatus();
      return;
    }

    saveOfflineButton.disabled = true;
    offlineStatus.textContent = "Saving the app pages and picture guides for offline use...";
    navigator.serviceWorker.register("./sw.js")
      .then(function () {
        return getActiveWorker();
      })
      .then(function (worker) {
        return sendWorkerMessage(worker, "CACHE_APP_SHELL");
      })
      .then(function (result) {
        if (!result.saved) throw new Error(result.message || "Some app files could not be saved.");
        offlineStatus.textContent = "Offline guides ready. App pages are saved; videos, live maps, and external links need internet.";
      })
      .catch(function (error) {
        offlineStatus.textContent = error.message || "The app could not be saved. Reconnect and try again.";
        console.error("AquaVanguard app could not be saved for offline use:", error);
      })
      .then(function () {
        saveOfflineButton.disabled = false;
      });
  }

  updateOfflineStatus();
  videoHistory = readVideoHistory();
  renderVideoHistory();
  if (saveOfflineButton) {
    saveOfflineButton.addEventListener("click", saveAppOffline);
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", updateOfflineStatus);
  }
  window.addEventListener("online", updateOfflineStatus);

  var params = new URLSearchParams(window.location.search);
  var requestedConcern = params.get("concern");
  var sourceId = params.get("source");
  var concernFromDiagnosis = recommendations[requestedConcern] ? requestedConcern : "unknown";
  renderConcern(concernFromDiagnosis, false);

  if (sourceId) {
    document.querySelectorAll('a[href="community.html"]').forEach(function (link) {
      link.href = "community.html?source=" + encodeURIComponent(sourceId);
    });
  }
})();
