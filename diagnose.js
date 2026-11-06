/* =====================================================
   AquaVanguard - observation-based water screening
   ===================================================== */

(function () {
  "use strict";

  var form = document.getElementById("diagnose-form");
  var result = document.getElementById("diagnose-result");
  if (!form || !result) return;

  var resultLevel = document.getElementById("diagnose-result-level");
  var resultTitle = document.getElementById("diagnose-result-title");
  var resultSummary = document.getElementById("diagnose-result-summary");
  var resultMethod = document.getElementById("diagnose-result-method");
  var resultReasons = document.getElementById("diagnose-result-reasons");
  var resultActions = document.getElementById("diagnose-result-actions");
  var actionLink = document.getElementById("diagnose-action-link");
  var verifyLink = document.getElementById("diagnose-verify-link");
  var sourceContext = document.getElementById("diagnose-source-context");
  var saveStatus = document.getElementById("diagnose-save-status");
  var testRecordForm = document.getElementById("test-record-form");
  var testRecordOutput = document.getElementById("test-record-output");
  var testSourceSelect = document.getElementById("test-source-id");
  var runDemoButton = document.getElementById("run-diagnose-demo");
  var resetDemoButton = document.getElementById("reset-diagnose-demo");
  var demoResult = document.getElementById("diagnose-demo-result");
  var demoSample = document.getElementById("diagnose-demo-sample");
  var demoOutcome = document.getElementById("diagnose-demo-outcome");
  var demoReadings = document.getElementById("diagnose-demo-readings");
  var demoGuidance = document.getElementById("diagnose-demo-guidance");
  var demoAction = document.getElementById("diagnose-demo-action");

  function selectedValue(name) {
    var selected = form.querySelector('input[name="' + name + '"]:checked');
    return selected ? selected.value : "";
  }

  function renderResult(outcome) {
    resultLevel.textContent = outcome.level;
    var badgeClass = outcome.level === "High" ? "is-high" :
      outcome.level === "Medium" ? "is-follow-up" : "is-no-warning";
    resultLevel.className = "diagnose-result-level " + badgeClass;
    resultTitle.textContent = "Follow-up level: " + outcome.level;
    resultSummary.textContent = "Screening score: " + outcome.score + ".";
    resultMethod.textContent = "This is rule-based precautionary guidance, not a validated risk score. Points summarize the observations selected: High applies to a strong warning sign or a total of 6 or more; Medium to 3–5; and Low to 0–2. Rainfall is self-reported context, not a live weather or El Niño feed.";
    resultReasons.replaceChildren();
    resultActions.replaceChildren();

    outcome.reasons.forEach(function (reason) {
      var item = document.createElement("li");
      item.textContent = reason;
      resultReasons.appendChild(item);
    });

    var actions = outcome.level === "High" ? [
      "Use a known safe alternative water source and avoid direct contact if fuel, chemicals, sewage, or waste may be present.",
      "Report the observation to the appropriate local water or public-health authority and arrange water testing.",
      "Do not rely on boiling or a household filter to make chemically contaminated water safe."
    ] : outcome.level === "Medium" ? [
      "Use a known safe water source for drinking and food preparation until the source has been assessed.",
      "Arrange testing through a qualified laboratory or local water authority, especially after flooding.",
      "Record and report what you observed so the source can be checked."
    ] : [
      "No warning signs were selected, but unseen contamination was not tested for.",
      "Use an appropriate tested source or arrange laboratory testing if the water is untreated or its condition is unknown.",
      "Continue to watch for changes and report concerns."
    ];
    actions.forEach(function (action) {
      var item = document.createElement("li");
      item.textContent = action;
      resultActions.appendChild(item);
    });

    var nextStepUrl = new URL(outcome.nextStep, window.location.href);
    if (sourceId) nextStepUrl.searchParams.set("source", sourceId);
    actionLink.href = nextStepUrl.href;
    result.hidden = false;
    result.focus();
  }

  function collectAnswers() {
    return {
      appearance: selectedValue("appearance"),
      smell: selectedValue("smell"),
      pollution: selectedValue("pollution"),
      flooding: selectedValue("flooding"),
      recentRain: selectedValue("recentRain")
    };
  }

  function saveFollowUp(outcome) {
    if (!sourceId || !source) return;
    if (saveStatus) saveStatus.hidden = true;

    try {
      if (!window.AquaVanguardStore || !window.AquaVanguardStore.saveFollowUp) {
        throw new Error("The related source could not be updated in this browser.");
      }
      var today = new Date();
      var date = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
      ].join("-");
      window.AquaVanguardStore.saveFollowUp({
        sourceId: sourceId,
        level: outcome.level,
        date: date,
        reasons: outcome.reasons
      });
    } catch (error) {
      if (saveStatus) {
        saveStatus.textContent = error.message;
        saveStatus.hidden = false;
      }
      console.error("AquaVanguard diagnose: follow-up level could not be saved.", error);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var sourceId = params.get("source");
  var sourceData = window.AquaVanguardData;
  var source = sourceData && Array.isArray(sourceData.sources) ?
    sourceData.sources.find(function (item) { return item.id === sourceId; }) : null;
  if (!source && window.AquaVanguardStore) {
    try {
      source = window.AquaVanguardStore.getReport(sourceId);
    } catch (error) {
      if (sourceContext) {
        sourceContext.textContent = error.message;
        sourceContext.hidden = false;
      }
      console.error("AquaVanguard diagnose: saved source could not be loaded.", error);
    }
  }

  if (source && sourceContext) {
    sourceContext.textContent = (source.id.indexOf("report-") === 0 ? "Saved community report: " : "Map sample selected: ") +
      source.name + " (" + source.area + "). " +
      (source.id.indexOf("report-") === 0 ?
        "This is an unverified community observation; answer based on what you observe." :
        "Its displayed risk is illustrative; answer based on what you observe.");
    sourceContext.hidden = false;
  }
  if (verifyLink && source && source.id.indexOf("report-") === 0) {
    verifyLink.href = "community.html?source=" + encodeURIComponent(source.id);
    verifyLink.hidden = false;
  }

  if (testSourceSelect) {
    var reportSources = [];
    if (source && source.id.indexOf("report-") === 0) reportSources.push(source);
    if (window.AquaVanguardStore) {
      try {
        reportSources = reportSources.concat(window.AquaVanguardStore.listReports());
      } catch (error) {
        console.error("AquaVanguard diagnose: report options could not be loaded.", error);
      }
    }
    var uniqueSources = [];
    reportSources.forEach(function (item) {
      if (item && !uniqueSources.some(function (existing) { return existing.id === item.id; })) {
        uniqueSources.push(item);
      }
    });
    uniqueSources.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name + " · " + item.area;
      testSourceSelect.appendChild(option);
    });
    if (source && testSourceSelect.querySelector('option[value="' + source.id + '"]')) {
      testSourceSelect.value = source.id;
    }
  }

  function showFollowUp() {
    if (!form.checkValidity()) return;
    var outcome = window.getFollowUpLevel(collectAnswers());
    renderResult(outcome);
    saveFollowUp(outcome);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    showFollowUp();
  });

  form.addEventListener("change", function (event) {
    if (event.target.matches('input[type="radio"]') && form.checkValidity()) {
      showFollowUp();
    }
  });

  form.addEventListener("reset", function () {
    result.hidden = true;
    resultLevel.textContent = "";
    resultTitle.textContent = "";
    resultSummary.textContent = "";
    resultMethod.textContent = "";
    resultReasons.replaceChildren();
    resultActions.replaceChildren();
    if (actionLink) {
      actionLink.href = "blueprints.html?concern=unknown#picture-guide-unknown";
    }
    if (saveStatus) {
      saveStatus.textContent = "";
      saveStatus.hidden = true;
    }
  });

  if (testRecordForm && testRecordOutput) {
    testRecordForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!testRecordForm.reportValidity()) return;

      var values = new FormData(testRecordForm);
      var sourceLabel = values.get("testSource") === "laboratory" ?
        "Laboratory report entered (not verified)" : "Home test kit entered (not verified)";
      var reportId = String(values.get("sourceId") || "");
      var parameter = String(values.get("parameter"));
      var resultValue = String(values.get("testResult")).trim();
      var testDate = String(values.get("testDate"));
      var testSource = String(values.get("testSource"));
      if (window.AquaVanguardStore) {
        try {
          window.AquaVanguardStore.saveTest({
            reportId: reportId,
            testSource: testSource,
            parameter: parameter,
            result: resultValue,
            testDate: testDate
          });
        } catch (error) {
          testRecordOutput.textContent = error.message;
          testRecordOutput.hidden = false;
          console.error("AquaVanguard diagnose: test record could not be saved.", error);
          return;
        }
      }
      var details = [
        ["Evidence status", sourceLabel],
        ["Related source", reportId ? testSourceSelect.options[testSourceSelect.selectedIndex].text : "Not linked"],
        ["Test", parameter],
        ["Result as entered", resultValue],
        ["Test date", testDate]
      ];

      testRecordOutput.replaceChildren();
      var status = document.createElement("strong");
      status.className = "test-record-status";
      status.textContent = "Entered by user · not independently verified";
      testRecordOutput.appendChild(status);

      var list = document.createElement("dl");
      details.forEach(function (detail) {
        var term = document.createElement("dt");
        var value = document.createElement("dd");
        term.textContent = detail[0];
        value.textContent = detail[1];
        list.append(term, value);
      });
      testRecordOutput.appendChild(list);

      var disclaimer = document.createElement("p");
      disclaimer.textContent = "This entry is saved in this browser as provided. It has not been checked against a standard, independently verified, or interpreted as safe or unsafe.";
      testRecordOutput.appendChild(disclaimer);
      testRecordOutput.hidden = false;
    });

    testRecordForm.addEventListener("reset", function () {
      testRecordOutput.hidden = true;
      testRecordOutput.replaceChildren();
    });
  }

  if (runDemoButton && resetDemoButton && demoResult && demoSample &&
      demoOutcome && demoReadings && demoGuidance && demoAction) {
    var demoScenarios = {
      "no-indicator": {
        id: "DEMO-001",
        source: "Fictional borehole A",
        indicator: "Not detected in 100 mL",
        turbidity: "2.0 NTU (illustrative only)",
        outcome: "No E. coli indicator detected in this simulated example",
        guidance: "The fictional E. coli result does not trigger an indicator flag in this example. Turbidity is shown as entered and is not interpreted here. A single non-detection cannot establish overall water safety.",
        action: "For this demonstration, continue to require a broader, appropriately conducted test panel and qualified review before describing a real source as safe."
      },
      "indicator-detected": {
        id: "DEMO-002",
        source: "Fictional community well B",
        indicator: "Detected in 100 mL",
        turbidity: "8.2 NTU (illustrative only)",
        outcome: "E. coli indicator detected in this simulated example",
        guidance: "The fictional E. coli result triggers a precautionary flag in this example. Turbidity is shown as entered and is not interpreted here. No actual sample was collected or analyzed.",
        action: "In a real case, use a known safe alternative and contact local water or public-health authorities for appropriate confirmation and advice."
      }
    };

    runDemoButton.addEventListener("click", function () {
      var scenario = demoScenarios[demoSample.value];
      if (!scenario) return;

      demoOutcome.textContent = scenario.outcome;
      demoReadings.replaceChildren();
      [
        ["Sample ID", scenario.id],
        ["Fictional source", scenario.source],
        ["E. coli indicator", scenario.indicator],
        ["Turbidity", scenario.turbidity],
        ["Evidence status", "Simulated · not measured or verified"]
      ].forEach(function (reading) {
        var group = document.createElement("div");
        var term = document.createElement("dt");
        var value = document.createElement("dd");
        term.textContent = reading[0];
        value.textContent = reading[1];
        group.append(term, value);
        demoReadings.appendChild(group);
      });
      demoGuidance.textContent = scenario.guidance;
      demoAction.textContent = scenario.action;
      var demoActionLink = document.getElementById("diagnose-demo-action-link");
      if (demoActionLink) {
        demoActionLink.href = scenario.id === "DEMO-002" ?
          "blueprints.html?concern=microbial" : "blueprints.html?concern=unknown";
        if (sourceId) demoActionLink.href += "&source=" + encodeURIComponent(sourceId);
      }
      demoResult.hidden = false;
      resetDemoButton.hidden = false;
      runDemoButton.textContent = "Run selected example again";
    });

    resetDemoButton.addEventListener("click", function () {
      demoResult.hidden = true;
      resetDemoButton.hidden = true;
      runDemoButton.textContent = "Run simulated check";
    });
  }
})();
