/* =====================================================
   AquaVanguard - local retest records
   ===================================================== */
(function () {
  "use strict";

  var form = document.getElementById("verify-form");
  if (!form) return;

  var sourceSelect = document.getElementById("verify-source-id");
  var feedback = document.getElementById("verify-feedback");
  var historyList = document.getElementById("verify-history-list");
  var emptyState = document.getElementById("verify-empty-state");
  var baselineStatus = document.getElementById("verify-baseline-status");
  var resultCard = document.getElementById("verify-result");
  var beforeValueInput = document.getElementById("verify-before-value");
  var beforeDateInput = document.getElementById("verify-before-date");
  var parameterInput = form.querySelector('[name="parameter"]');
  var params = new URLSearchParams(window.location.search);

  function numericReading(value) {
    var match = String(value).match(/[-+]?(?:\d+\.?\d*|\.\d+)/);
    return match ? Number(match[0]) : null;
  }

  function compareReadings(beforeValue, afterValue) {
    var before = numericReading(beforeValue);
    var after = numericReading(afterValue);
    if (before !== null && after !== null) {
      return after < before ? "down" : after > before ? "up" : "same";
    }

    return String(beforeValue).trim().toLowerCase() === String(afterValue).trim().toLowerCase() ?
      "same" : "unknown";
  }

  function isImprovementParameter(parameter) {
    return /turbidity|e\.?\s*coli|indicator\s+bacteria/i.test(parameter);
  }

  function isRangeDependentParameter(parameter) {
    return /\bph\b|free\s+chlorine/i.test(parameter);
  }

  function changeLabel(direction) {
    if (direction === "down") return "Reading went down";
    if (direction === "up") return "Reading went up";
    if (direction === "same") return "Reading stayed the same";
    return "Change could not be determined from the entered readings.";
  }

  function renderComparison(verification) {
    if (!verification) {
      resultCard.hidden = true;
      return;
    }

    var direction = verification.changeDirection ||
      compareReadings(verification.beforeValue, verification.afterValue);
    var improvement = typeof verification.improvementIndicated === "boolean" ?
      verification.improvementIndicated :
      direction === "down" && isImprovementParameter(verification.parameter);
    document.getElementById("verify-result-source").textContent =
      verification.sourceName + " · " + verification.area;
    document.getElementById("verify-result-parameter").textContent = verification.parameter;
    document.getElementById("verify-result-before").textContent = verification.beforeValue;
    document.getElementById("verify-result-after").textContent = verification.afterValue;

    var changeText = changeLabel(direction);
    if (improvement) {
      changeText += ": improvement indicated (self-reported)";
    }
    document.getElementById("verify-result-change").textContent = changeText;
    document.getElementById("verify-result-range-note").hidden =
      !isRangeDependentParameter(verification.parameter);
    document.getElementById("verify-result-badge").textContent =
      verification.pendingBadge || "Water Defender (pending)";
    resultCard.hidden = false;
  }

  function showFeedback(message, isError) {
    feedback.textContent = message;
    feedback.classList.toggle("is-error", Boolean(isError));
    feedback.hidden = false;
  }

  function refresh() {
    try {
      var reports = window.AquaVanguardStore.listReports();
      var verifications = window.AquaVanguardStore.listVerifications().sort(function (a, b) {
        return (b.createdAt || b.retestDate).localeCompare(a.createdAt || a.retestDate);
      });
      sourceSelect.replaceChildren();

      var placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = reports.length ?
        "Choose a saved community report" :
        "No saved community reports yet";
      sourceSelect.appendChild(placeholder);

      reports.forEach(function (report) {
        var option = document.createElement("option");
        option.value = report.id;
        option.textContent = report.name + " · " + report.area;
        sourceSelect.appendChild(option);
      });

      var requestedSource = params.get("source");
      if (requestedSource && reports.some(function (report) { return report.id === requestedSource; })) {
        sourceSelect.value = requestedSource;
      }
      updateBaseline();

      document.getElementById("verify-report-count").textContent = String(reports.length);
      document.getElementById("verify-retest-count").textContent = String(verifications.length);
      document.getElementById("verify-improvement-count").textContent = String(
        verifications.filter(function (verification) {
          return typeof verification.improvementIndicated === "boolean" ?
            verification.improvementIndicated :
            compareReadings(verification.beforeValue, verification.afterValue) === "down" &&
              isImprovementParameter(verification.parameter);
        }).length
      );
      document.getElementById("verify-pending-badge-count").textContent = String(verifications.length);
      document.getElementById("verify-points").textContent = "0";
      historyList.replaceChildren();
      emptyState.hidden = verifications.length > 0;
      renderComparison(verifications[0]);

      verifications.forEach(function (verification) {
        var article = document.createElement("article");
        article.className = "verify-history-card";
        var heading = document.createElement("h3");
        heading.textContent = verification.sourceName + " · " + verification.area;
        var values = document.createElement("p");
        var beforeDate = verification.beforeDate ? " on " + verification.beforeDate : "";
        values.textContent = verification.parameter + " (" + verification.method + "): before " +
          verification.beforeValue + beforeDate + "; after " + verification.afterValue +
          " on " + verification.retestDate + ". " + changeLabel(verification.changeDirection ||
            compareReadings(verification.beforeValue, verification.afterValue)) +
          (verification.improvementIndicated ? ": improvement indicated (self-reported)" : "") + ".";
        var date = document.createElement("p");
        date.textContent = "Retested " + verification.retestDate + " · 0 verified points";
        var badge = document.createElement("span");
        badge.className = "verify-pending-badge";
        badge.textContent = verification.pendingBadge || "Water Defender (pending)";
        var pendingNote = document.createElement("p");
        pendingNote.className = "verify-pending-note";
        pendingNote.textContent = "Pending review. Becomes official only after independent verification.";
        var disclaimer = document.createElement("p");
        disclaimer.className = "verify-result-disclaimer";
        disclaimer.textContent = "This is a self-reported record. It does not show the water is safe.";
        article.append(heading, values, date, badge, pendingNote, disclaimer);
        historyList.appendChild(article);
      });
    } catch (error) {
      showFeedback(error.message, true);
      console.error("AquaVanguard verify: saved records could not be loaded.", error);
    }
  }

  function updateBaseline() {
    beforeValueInput.value = "";
    beforeDateInput.value = "";
    parameterInput.value = "";
    if (!sourceSelect.value) {
      baselineStatus.textContent = "Choose a source to check for a saved baseline test record.";
      return;
    }

    try {
      var tests = window.AquaVanguardStore.listTests(sourceSelect.value);
      if (!tests.length) {
        baselineStatus.textContent = "No test record is saved for this source yet. Enter the before-action result and date from the same test method you will use for the retest.";
        return;
      }

      var baseline = tests[0];
      beforeValueInput.value = baseline.result;
      beforeDateInput.value = baseline.testDate;
      parameterInput.value = baseline.parameter;
      baselineStatus.textContent = "Prefilled from a user-entered " + baseline.testSource +
        " result saved on " + baseline.testDate +
        ". Confirm the units and exact test method before comparing; this result is not verified.";
    } catch (error) {
      baselineStatus.textContent = error.message;
      console.error("AquaVanguard verify: baseline test could not be loaded.", error);
    }
  }

  sourceSelect.addEventListener("change", updateBaseline);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    try {
      var values = new FormData(form);
      var report = window.AquaVanguardStore.getReport(String(values.get("reportId")));
      if (!report) throw new Error("Choose a saved community report before recording a retest.");

      var verification = {
        reportId: report.id,
        sourceName: report.name,
        area: report.area,
        parameter: String(values.get("parameter")).trim(),
        method: String(values.get("method")).trim(),
        beforeValue: String(values.get("beforeValue")).trim(),
        afterValue: String(values.get("afterValue")).trim(),
        beforeDate: String(values.get("beforeDate")),
        retestDate: String(values.get("retestDate")),
        sameMethodConfirmed: values.get("sameMethodConfirmed") === "on",
        notes: String(values.get("notes") || "").trim()
      };
      verification.changeDirection = compareReadings(verification.beforeValue, verification.afterValue);
      verification.improvementIndicated =
        verification.changeDirection === "down" && isImprovementParameter(verification.parameter);
      verification.pendingBadge = "Water Defender (pending)";
      var saved = window.AquaVanguardStore.saveVerification(verification);
      form.reset();
      showFeedback("Retest saved on this device. The Water Defender badge is pending review.", false);
      renderComparison(saved);
      refresh();
    } catch (error) {
      showFeedback(error.message, true);
      console.error("AquaVanguard verify: retest could not be saved.", error);
    }
  });

  refresh();
})();
