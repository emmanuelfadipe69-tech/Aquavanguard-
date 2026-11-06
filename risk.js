(function (global) {
  "use strict";

  function getFollowUpLevel(answers) {
    answers = answers || {};

    var observations = [
      {
        points: { clear: 0, cloudy: 1, severe: 2, oil: 4 },
        value: answers.appearance,
        descriptions: {
          clear: "No obvious change in appearance",
          cloudy: "Cloudy, colored, or sediment",
          severe: "Foam or floating waste",
          oil: "Oil-like sheen or rainbow film"
        },
        forcesHigh: answers.appearance === "oil"
      },
      {
        points: { none: 0, musty: 1, other: 2, unusual: 2, sewage: 3, fuel: 4, chemical: 4 },
        value: answers.smell,
        descriptions: {
          none: "No unusual smell",
          musty: "Musty smell",
          other: "Other unusual smell",
          unusual: "Other unusual smell",
          sewage: "Sewage-like smell",
          fuel: "Fuel-like smell",
          chemical: "Chemical smell"
        },
        forcesHigh: answers.smell === "fuel" || answers.smell === "chemical"
      },
      {
        points: { none: 0, runoff: 2, sewage: 3, spill: 4 },
        value: answers.pollution,
        descriptions: {
          none: "No obvious pollution source nearby",
          runoff: "Nearby drainage, waste, or animal activity",
          sewage: "Possible sewage discharge nearby",
          spill: "Possible fuel or chemical spill nearby"
        },
        forcesHigh: answers.pollution === "spill"
      },
      {
        points: { no: 0, unsure: 1, yes: 3 },
        value: answers.flooding,
        descriptions: {
          no: "No recent flooding",
          unsure: "Recent flooding is uncertain",
          yes: "Recent flooding"
        },
        forcesHigh: false
      },
      {
        points: { yes: 1, no: 0, unsure: 0 },
        value: answers.recentRain,
        descriptions: {
          yes: "Heavy rain in the last 7 days",
          no: "No heavy rain in the last 7 days",
          unsure: "Heavy rain in the last 7 days is uncertain"
        },
        forcesHigh: false
      }
    ];

    var score = 0;
    var forcesHigh = false;
    var rankedObservations = observations.map(function (observation) {
      var points = Object.prototype.hasOwnProperty.call(observation.points, observation.value) ?
        observation.points[observation.value] : 0;
      var description = observation.descriptions[observation.value] || "No answer recorded";
      score += points;
      forcesHigh = forcesHigh || observation.forcesHigh;
      return {
        points: points,
        reason: description + " added " + points + (points === 1 ? " point." : " points.")
      };
    });

    rankedObservations.sort(function (a, b) {
      return b.points - a.points;
    });

    var level = forcesHigh || score >= 6 ? "High" :
      score >= 3 ? "Medium" : "Low";
    var concern = answers.appearance === "oil" ||
      answers.smell === "fuel" ||
      answers.smell === "chemical" ||
      answers.pollution === "spill" ? "chemical" :
      answers.flooding === "yes" ||
      answers.smell === "sewage" ||
      answers.pollution === "sewage" ? "microbial" :
      answers.appearance === "cloudy" ? "cloudy" : "unknown";

    return {
      level: level,
      score: score,
      reasons: rankedObservations.slice(0, 3).map(function (observation) {
        return observation.reason;
      }),
      nextStep: "blueprints.html?concern=" + concern + "#picture-guide-" + concern
    };
  }

  global.getFollowUpLevel = getFollowUpLevel;
})(window);
