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
  var resultActions = document.getElementById("diagnose-result-actions");
  var resultMethod = document.getElementById("diagnose-result-method");
  var resultReasons = document.getElementById("diagnose-result-reasons");
  var actionLink = document.getElementById("diagnose-action-link");
  var verifyLink = document.getElementById("diagnose-verify-link");
  var sourceContext = document.getElementById("diagnose-source-context");
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
    resultLevel.className = "diagnose-result-level " + outcome.className;
    resultTitle.textContent = outcome.title;
    resultSummary.textContent = outcome.summary;
    resultMethod.textContent = outcome.method;
    resultReasons.replaceChildren();

    outcome.reasons.forEach(function (reason) {
      var item = document.createElement("li");
      item.textContent = reason;
      resultReasons.appendChild(item);
    });

    resultActions.replaceChildren();

    outcome.actions.forEach(function (action) {
      var item = document.createElement("li");
      item.textContent = action;
      resultActions.appendChild(item);
    });

    result.hidden = false;
    result.focus();
  }

  function assess(answers) {
    var urgentSigns = answers.appearance === "severe" ||
      answers.appearance === "oil" ||
      answers.smell === "unusual" ||
      answers.pollution === "spill" ||
      answers.pollution === "sewage";
    var followUpSigns = [
      answers.appearance === "cloudy",
      answers.pollution === "runoff",
      answers.flooding === "yes",
      answers.recentRain === "yes"
    ].filter(Boolean).length;
    var reasons = [];

    if (answers.appearance === "cloudy") {
      reasons.push("Cloudiness, unusual color, or sediment was reported; the cause cannot be identified visually.");
    } else if (answers.appearance === "severe") {
      reasons.push("Foam or floating waste was reported; avoid contact and seek an appropriate authority's advice.");
    } else if (answers.appearance === "oil") {
      reasons.push("An oil-like sheen was reported; possible fuel or chemical contamination needs authority guidance.");
    }
    if (answers.smell === "unusual") {
      reasons.push("An unusual smell was reported. Smell cannot identify a contaminant, and many hazards have no smell.");
    }
    if (answers.pollution === "runoff") {
      reasons.push("Nearby drainage, waste, or animal activity was reported; this is a reason to arrange follow-up.");
    } else if (answers.pollution === "sewage") {
      reasons.push("A possible sewage discharge was reported; contamination has not been confirmed.");
    } else if (answers.pollution === "spill") {
      reasons.push("A possible fuel or chemical spill was reported; the substance and exposure are not confirmed.");
    }
    if (answers.flooding === "yes") {
      reasons.push("Flooding may have affected the source; the actual water quality is unknown.");
    } else if (answers.flooding === "unsure") {
      reasons.push("Recent flooding is unknown, so this screening cannot rule out a flood-related concern.");
    }
    if (answers.recentRain === "yes") {
      reasons.push("Heavy rain was self-reported near the source. It is context for follow-up, not evidence that the water is contaminated.");
    }

    if (urgentSigns || followUpSigns >= 2) {
      return {
        level: "High concern",
        className: "is-high",
        title: "Avoid using this source for drinking or cooking.",
        summary: "The observations include signs that need prompt attention. This is a precautionary screening result, not a confirmed contamination finding.",
        method: "This is rule-based precautionary guidance, not a validated risk score. A strong warning sign or multiple reported warning signs lead to this outcome. Rainfall is self-reported context; no live weather or El Niño feed is used.",
        reasons: reasons.length ? reasons : ["Several warning observations were selected; their cause and severity have not been independently assessed."],
        actions: [
          "Use a known safe alternative water source and avoid direct contact if fuel, chemicals, sewage, or waste may be present.",
          "Report the observation to the appropriate local water or public-health authority and arrange water testing.",
          "Do not rely on boiling or a household filter to make chemically contaminated water safe."
        ]
      };
    }

    if (followUpSigns === 1 || answers.flooding === "unsure") {
      return {
        level: "Follow-up recommended",
        className: "is-follow-up",
        title: "Take precautions and arrange a closer check.",
        summary: "At least one observation may indicate a problem, but this screening cannot determine what is in the water.",
        method: "This is rule-based precautionary guidance, not a validated risk score. One reported warning sign, recent heavy rain, or uncertainty about flooding leads to this outcome.",
        reasons: reasons.length ? reasons : ["One or more answers indicate uncertainty that needs follow-up."],
        actions: [
          "Use a known safe water source for drinking and food preparation until the source has been assessed.",
          "Arrange testing through a qualified laboratory or local water authority, especially after flooding.",
          "Record and report what you observed so the source can be checked."
        ]
      };
    }

    return {
      level: "No warning signs reported",
      className: "is-no-warning",
      title: "The answers do not rule out contamination.",
      summary: "No visible warning signs were selected, but water can contain harmful germs or chemicals while looking and smelling normal.",
      method: "No listed warning signs were selected. This is not a pass result, safety rating, or test result.",
      reasons: ["No warning sign was reported in these answers; unseen contamination was not tested for."],
      actions: [
        "Do not treat this result as proof that the water is safe to drink.",
        "Use an appropriate tested source or arrange laboratory testing if the water is untreated or its safety is unknown.",
        "Continue to watch for changes and report concerns."
      ]
    };
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var answers = {
      appearance: selectedValue("appearance"),
      smell: selectedValue("smell"),
      pollution: selectedValue("pollution"),
      flooding: selectedValue("flooding"),
      recentRain: selectedValue("recentRain")
    };
    var concern = answers.appearance === "oil" || answers.pollution === "spill" ?
      "chemical" :
      answers.flooding === "yes" || answers.recentRain === "yes" || answers.pollution === "runoff" ||
        answers.pollution === "sewage" ?
        "microbial" :
        answers.appearance === "cloudy" ? "cloudy" : "unknown";

    if (actionLink) {
      actionLink.href = "blueprints.html?concern=" + concern +
        (sourceId ? "&source=" + encodeURIComponent(sourceId) : "");
    }
    renderResult(assess(answers));
  });

  form.addEventListener("reset", function () {
    result.hidden = true;
    if (actionLink) actionLink.href = "blueprints.html?concern=unknown";
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
