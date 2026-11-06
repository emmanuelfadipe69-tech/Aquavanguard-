(function () {
  "use strict";

  var container = document.getElementById("offline-guide-content");
  var guides = window.AquaVanguardOfflineGuides;
  var params = new URLSearchParams(window.location.search);
  var topic = params.get("topic");
  var guide = guides && guides[topic];

  function makeElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function appendReferences(parent, references) {
    if (!references || !references.length) return;

    var section = makeElement("section", "offline-guide-references");
    section.appendChild(makeElement("h2", "", "Further reading when connected"));
    var list = document.createElement("ul");
    references.forEach(function (reference) {
      var item = document.createElement("li");
      var link = makeElement("a", "", reference[0]);
      link.href = reference[1];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.appendChild(link);
      list.appendChild(item);
    });
    section.appendChild(list);
    parent.appendChild(section);
  }

  function renderSteps(parent, guide) {
    var section = makeElement("section", "offline-guide-steps");
    section.setAttribute("aria-labelledby", "offline-steps-title");
    section.appendChild(makeElement("h2", "", "Step-by-step field instructions"));
    section.querySelector("h2").id = "offline-steps-title";
    var list = document.createElement("ol");

    guide.steps.forEach(function (step, index) {
      var item = document.createElement("li");
      item.className = "offline-step-card";
      item.appendChild(makeElement("span", "offline-step-number", String(index + 1).padStart(2, "0")));
      var copy = makeElement("div", "offline-step-copy");
      copy.appendChild(makeElement("h3", "", step[0]));
      copy.appendChild(makeElement("p", "", step[1]));
      item.appendChild(copy);
      list.appendChild(item);
    });

    section.appendChild(list);
    parent.appendChild(section);
  }

  function renderSizeSelector(parent, guide) {
    if (!guide.sizes) return "";

    var section = makeElement("section", "offline-size-picker");
    section.appendChild(makeElement("h2", "", "Choose the batch size"));
    section.appendChild(makeElement("p", "", "These are container capacities for a pre-treatment batch, not filter dimensions or a validated system design."));
    var choices = makeElement("div", "offline-size-options");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", "Choose pre-treatment batch capacity");

    Object.keys(guide.sizes).forEach(function (size) {
      var option = guide.sizes[size];
      var button = makeElement("button", "offline-size-option");
      button.type = "button";
      button.dataset.size = size;
      button.setAttribute("aria-pressed", "false");
      button.appendChild(makeElement("strong", "", option.amount));
      button.appendChild(makeElement("span", "", option.name));
      button.addEventListener("click", function () {
        selectSize(size, guide, section);
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("size", size);
        window.history.replaceState({}, "", nextUrl.href);
      });
      choices.appendChild(button);
    });

    section.appendChild(choices);
    var details = makeElement("div", "offline-size-specification");
    details.setAttribute("aria-live", "polite");
    section.appendChild(details);
    parent.appendChild(section);

    var requestedSize = params.get("size");
    selectSize(guide.sizes[requestedSize] ? requestedSize : "20", guide, section);
    return section.id;
  }

  function selectSize(size, guide, section) {
    var specification = section.querySelector(".offline-size-specification");
    var selected = guide.sizes[size];
    if (!selected) return;

    section.querySelectorAll(".offline-size-option").forEach(function (button) {
      var isSelected = button.dataset.size === size;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    specification.replaceChildren();
    specification.appendChild(makeElement("h3", "", selected.name + " · " + selected.amount + " batch"));
    var itemList = document.createElement("ul");
    selected.equipment.forEach(function (equipment) {
      itemList.appendChild(makeElement("li", "", equipment));
    });
    specification.appendChild(itemList);
    specification.appendChild(makeElement("p", "offline-size-note", "Use clean, food-grade vessels. The chosen volume is for planning a manageable batch only; it does not change the water-safety limits of this method."));
  }

  function makeSvgElement(tag, attributes, text) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attributes).forEach(function (name) {
      element.setAttribute(name, attributes[name]);
    });
    if (text) element.textContent = text;
    return element;
  }

  function renderCloudyVisuals(parent) {
    var section = makeElement("section", "offline-process-visuals");
    section.appendChild(makeElement("h2", "", "How the two-vessel setup works"));
    section.appendChild(makeElement("p", "", "These diagrams show clarification only. The clearer water still needs an appropriate separate treatment before drinking."));
    var grid = makeElement("div", "offline-process-grid");
    var scenes = [
      {
        caption: "Keep one covered vessel for settling and a separate clean vessel for clarified water.",
        draw: function (svg) {
          svg.appendChild(makeSvgElement("path", { d: "M32 40h72l-6 77H38z", fill: "#d8f6fa", stroke: "#0a5266", "stroke-width": "4", "stroke-linejoin": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M40 77h56l-4 35H44z", fill: "#74cfe0" }));
          svg.appendChild(makeSvgElement("path", { d: "M28 34h80v9H28z", fill: "#fff", stroke: "#0a5266", "stroke-width": "4" }));
          svg.appendChild(makeSvgElement("path", { d: "M177 40h72l-6 77h-60z", fill: "#d8f6fa", stroke: "#0a5266", "stroke-width": "4", "stroke-linejoin": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M185 78h56v34h-52z", fill: "#74cfe0" }));
          svg.appendChild(makeSvgElement("path", { d: "M173 34h80v9h-80z", fill: "#fff", stroke: "#0a5266", "stroke-width": "4" }));
          svg.appendChild(makeSvgElement("text", { x: "68", y: "137", "text-anchor": "middle" }, "SETTLE"));
          svg.appendChild(makeSvgElement("text", { x: "213", y: "137", "text-anchor": "middle" }, "CLEAN CATCH"));
        }
      },
      {
        caption: "Leave the covered settling vessel undisturbed so visible sediment collects at the bottom.",
        draw: function (svg) {
          svg.appendChild(makeSvgElement("path", { d: "M91 33h118l-9 102H100z", fill: "#d8f6fa", stroke: "#0a5266", "stroke-width": "4", "stroke-linejoin": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M101 69h98l-5 62h-88z", fill: "#75cfe0" }));
          svg.appendChild(makeSvgElement("path", { d: "M85 27h130v10H85z", fill: "#fff", stroke: "#0a5266", "stroke-width": "4" }));
          svg.appendChild(makeSvgElement("path", { d: "M106 119q24-8 44 0t43 0v12h-87z", fill: "#a87845" }));
          [[123, 120], [146, 124], [169, 119], [188, 125]].forEach(function (point) {
            svg.appendChild(makeSvgElement("circle", { cx: String(point[0]), cy: String(point[1]), r: "3.5", fill: "#654626" }));
          });
          svg.appendChild(makeSvgElement("text", { x: "150", y: "153", "text-anchor": "middle" }, "PARTICLES SETTLE"));
        }
      },
      {
        caption: "Carefully pour the clearer upper layer through clean cloth into the separate clean vessel.",
        draw: function (svg) {
          svg.appendChild(makeSvgElement("path", { d: "M22 39h67l-5 72H28z", fill: "#d8f6fa", stroke: "#0a5266", "stroke-width": "4", "stroke-linejoin": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M30 67h54l-3 40H33z", fill: "#75cfe0" }));
          svg.appendChild(makeSvgElement("path", { d: "M103 69h36", fill: "none", stroke: "#1683a1", "stroke-width": "5", "stroke-linecap": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M138 54h46l-10 23h-26z", fill: "#fff", stroke: "#0a5266", "stroke-width": "3", "stroke-linejoin": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M145 58h32", fill: "none", stroke: "#54aab8", "stroke-width": "2", "stroke-dasharray": "3 3" }));
          svg.appendChild(makeSvgElement("path", { d: "M162 78v17", fill: "none", stroke: "#1683a1", "stroke-width": "4", "stroke-linecap": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M204 58h70l-5 67h-60z", fill: "#d8f6fa", stroke: "#0a5266", "stroke-width": "4", "stroke-linejoin": "round" }));
          svg.appendChild(makeSvgElement("path", { d: "M212 96h54l-2 26h-48z", fill: "#75cfe0" }));
          svg.appendChild(makeSvgElement("text", { x: "58", y: "139", "text-anchor": "middle" }, "SETTLED WATER"));
          svg.appendChild(makeSvgElement("text", { x: "240", y: "145", "text-anchor": "middle" }, "CLEAN CATCH"));
        }
      }
    ];

    scenes.forEach(function (scene) {
      var figure = makeElement("figure", "offline-process-card");
      var svg = makeSvgElement("svg", { viewBox: "0 0 300 160", role: "img", "aria-hidden": "true", focusable: "false" });
      scene.draw(svg);
      figure.appendChild(svg);
      figure.appendChild(makeElement("figcaption", "", scene.caption));
      grid.appendChild(figure);
    });

    section.appendChild(grid);
    parent.appendChild(section);
  }

  function renderCalculator(parent) {
    var section = makeElement("section", "offline-water-calculator");
    section.appendChild(makeElement("h2", "", "Estimate a starting reserve"));
    section.appendChild(makeElement("p", "", "Enter the number of people and days to estimate a basic emergency reserve."));
    var fields = makeElement("div", "offline-calculator-fields");
    var peopleLabel = makeElement("label", "", "People in household");
    var people = document.createElement("input");
    people.type = "number";
    people.min = "1";
    people.max = "50";
    people.step = "1";
    people.value = "4";
    people.inputMode = "numeric";
    peopleLabel.appendChild(people);
    var daysLabel = makeElement("label", "", "Days to plan for");
    var days = document.createElement("input");
    days.type = "number";
    days.min = "1";
    days.max = "14";
    days.step = "1";
    days.value = "3";
    days.inputMode = "numeric";
    daysLabel.appendChild(days);
    fields.append(peopleLabel, daysLabel);
    section.appendChild(fields);
    var result = makeElement("p", "offline-calculator-result");
    result.setAttribute("aria-live", "polite");
    section.appendChild(result);
    section.appendChild(makeElement("p", "offline-calculator-note", "Planning reference only: CDC's U.S. emergency guidance starts at 1 gallon (about 3.8 L) per person per day. This is not a locally tailored minimum; hot weather, health needs, cooking, pets, and local instructions may require more."));
    parent.appendChild(section);

    function updateEstimate() {
      var personCount = Number(people.value);
      var dayCount = Number(days.value);
      if (!Number.isInteger(personCount) || personCount < 1 ||
          !Number.isInteger(dayCount) || dayCount < 1) {
        result.textContent = "Enter at least 1 person and 1 day to calculate a starting estimate.";
        return;
      }

      var litres = personCount * dayCount * 3.8;
      result.textContent = "Starting estimate: about " + litres.toFixed(1) +
        " litres for " + personCount + " people over " + dayCount + " days.";
    }

    people.addEventListener("input", updateEstimate);
    days.addEventListener("input", updateEstimate);
    updateEstimate();
  }

  function renderGuide() {
    if (!guide) {
      container.replaceChildren();
      container.appendChild(makeElement("p", "offline-guide-missing", "That guide could not be found. Return to the offline field directory and choose a guide."));
      return;
    }

    document.title = guide.title + " · AquaVanguard Field Guide";
    container.replaceChildren();
    var header = makeElement("header", "offline-guide-heading");
    header.appendChild(makeElement("span", "step-tag", guide.category));
    header.appendChild(makeElement("h1", "", guide.title));
    header.appendChild(makeElement("p", "lead", guide.summary));
    container.appendChild(header);

    var photo = makeElement("figure", "offline-guide-photo");
    var image = document.createElement("img");
    image.src = guide.image;
    image.alt = guide.imageAlt;
    image.loading = "eager";
    photo.appendChild(image);
    var caption = document.createElement("figcaption");
    caption.appendChild(document.createTextNode("Real-world photo: "));
    var source = makeElement("a", "", guide.photoTitle);
    source.href = guide.photoSource;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    caption.appendChild(source);
    caption.appendChild(document.createTextNode(" · " + guide.photoCreator + " · "));
    var license = makeElement("a", "", guide.license);
    license.href = guide.licenseUrl;
    license.target = "_blank";
    license.rel = "noopener noreferrer";
    caption.appendChild(license);
    photo.appendChild(caption);
    container.appendChild(photo);

    var warning = makeElement("aside", "offline-guide-warning", guide.warning);
    warning.setAttribute("role", "note");
    container.appendChild(warning);

    if (guide.sizes) {
      renderSizeSelector(container, guide);
      renderCloudyVisuals(container);
    }
    renderSteps(container, guide);
    if (guide.calculator) renderCalculator(container);
    appendReferences(container, guide.references);

    var actions = makeElement("nav", "offline-guide-actions");
    actions.setAttribute("aria-label", "Field guide navigation");
    var back = makeElement("a", "btn btn-ghost", "Back to all field guides");
    back.href = "offline-guides.html";
    actions.appendChild(back);
    var print = makeElement("button", "btn btn-primary", "Print / save this guide");
    print.type = "button";
    print.addEventListener("click", function () {
      window.print();
    });
    actions.appendChild(print);
    container.appendChild(actions);
  }

  renderGuide();
})();
