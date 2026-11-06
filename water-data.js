/* Browser-local records for the no-account demonstration. */
(function () {
  "use strict";

  var storageKey = "aquavanguard-community-v1";

  function readState() {
    try {
      var raw = window.localStorage.getItem(storageKey);
      if (!raw) return { reports: [], tests: [], verifications: [], followUps: [] };
      var state = JSON.parse(raw);
      return {
        reports: Array.isArray(state.reports) ? state.reports : [],
        tests: Array.isArray(state.tests) ? state.tests : [],
        verifications: Array.isArray(state.verifications) ? state.verifications : [],
        followUps: Array.isArray(state.followUps) ? state.followUps : []
      };
    } catch (error) {
      console.error("AquaVanguard local records could not be read:", error);
      throw new Error("Saved records could not be read in this browser. Check storage permissions or clear the demo data.");
    }
  }

  function writeState(state) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("AquaVanguard local records could not be saved:", error);
      throw new Error("This browser could not save the record. Check available storage space and try again.");
    }
  }

  function createId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 8);
  }

  function listReports() {
    return readState().reports;
  }

  function getReport(id) {
    if (!id) return null;
    return listReports().find(function (report) {
      return report.id === id;
    }) || null;
  }

  function saveFollowUp(followUp) {
    if (!followUp || !followUp.sourceId ||
        !["Low", "Medium", "High"].includes(followUp.level) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(followUp.date) ||
        !Array.isArray(followUp.reasons)) {
      throw new Error("A valid follow-up level, date, reasons, and source are required.");
    }

    var state = readState();
    var saved = {
      sourceId: followUp.sourceId,
      level: followUp.level,
      date: followUp.date,
      reasons: followUp.reasons.slice()
    };
    var report = state.reports.find(function (item) {
      return item.id === followUp.sourceId;
    });

    if (report) {
      report.followUpLevel = saved.level;
      report.followUpDate = saved.date;
      report.followUpReasons = saved.reasons;
    } else {
      var existing = state.followUps.find(function (item) {
        return item.sourceId === saved.sourceId;
      });
      if (existing) {
        Object.assign(existing, saved);
      } else {
        state.followUps.unshift(saved);
      }
    }

    writeState(state);
    return saved;
  }

  function saveReport(report) {
    var state = readState();
    if (state.reports.length >= 40) {
      throw new Error("This browser has reached the 40-report demo limit. Back up or clear the local demo data before adding another report.");
    }
    var saved = Object.assign({}, report, {
      id: createId("report"),
      createdAt: new Date().toISOString(),
      timelineStage: 1,
      verificationStatus: "not-retested"
    });
    state.reports.unshift(saved);
    writeState(state);
    return saved;
  }

  function saveTest(test) {
    var state = readState();
    var saved = Object.assign({}, test, {
      id: createId("test"),
      createdAt: new Date().toISOString(),
      verificationStatus: "user-entered-unverified"
    });
    state.tests.unshift(saved);
    writeState(state);
    return saved;
  }

  function listTests(reportId) {
    return readState().tests.filter(function (test) {
      return !reportId || test.reportId === reportId;
    });
  }

  function saveVerification(verification) {
    var state = readState();
    var report = state.reports.find(function (item) {
      return item.id === verification.reportId;
    });
    if (!report) throw new Error("That saved community report could not be found.");
    if (!verification.sameMethodConfirmed) {
      throw new Error("Confirm that both readings use the same source, parameter, units, and test method.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(verification.beforeDate) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(verification.retestDate)) {
      throw new Error("Enter valid dates for both the before-action test and the retest.");
    }
    if (verification.beforeDate > verification.retestDate) {
      throw new Error("The before-action test date cannot be later than the retest date.");
    }

    var saved = Object.assign({}, verification, {
      id: createId("retest"),
      createdAt: new Date().toISOString(),
      verificationStatus: "awaiting-independent-review",
      pointsAwarded: 0,
      pendingBadge: "Water Defender (pending)"
    });
    state.verifications.unshift(saved);
    report.verificationStatus = "awaiting-independent-review";
    report.timelineStage = 4;
    writeState(state);
    return saved;
  }

  function updateReportStage(reportId, stage) {
    if (![2, 3].includes(stage)) {
      throw new Error("Report stage must be shared or action taken.");
    }

    var state = readState();
    var report = state.reports.find(function (item) {
      return item.id === reportId;
    });
    if (!report) throw new Error("That saved community report could not be found.");

    report.timelineStage = Math.max(report.timelineStage || 1, stage);
    writeState(state);
    return report;
  }

  function listVerifications(reportId) {
    return readState().verifications.filter(function (verification) {
      return !reportId || verification.reportId === reportId;
    });
  }

  function counts() {
    var state = readState();
    return {
      reports: state.reports.length,
      retests: state.verifications.length,
      verified: state.verifications.filter(function (verification) {
        return verification.verificationStatus === "independently-verified";
      }).length
    };
  }

  function clear() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("AquaVanguard local records could not be cleared:", error);
      throw new Error("Saved records could not be cleared in this browser.");
    }
  }

  window.AquaVanguardStore = {
    clear: clear,
    getReport: getReport,
    listReports: listReports,
    listTests: listTests,
    listVerifications: listVerifications,
    saveReport: saveReport,
    saveFollowUp: saveFollowUp,
    saveTest: saveTest,
    saveVerification: saveVerification,
    updateReportStage: updateReportStage,
    counts: counts
  };
})();
