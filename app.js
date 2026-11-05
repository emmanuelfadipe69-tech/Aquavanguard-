/* =====================================================
   AquaVanguard - shared logic
   Right now: the 4-second intro + footer year.
   ===================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var intro = document.getElementById("intro");

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Only run the intro if the <head> script decided it should play
  if (!intro || !root.classList.contains("intro-on")) return;

  var finished = false;

  // Mark as seen right away so it never replays in this session
  try {
    sessionStorage.setItem("aqv-intro", "1");
  } catch (e) {}

  function finish() {
    if (finished) return;
    finished = true;
    intro.classList.add("hide"); // 0.5s fade out
    setTimeout(function () {
      root.classList.remove("intro-on"); // removes the overlay
    }, 500);
  }

  // Skip: tap/click anywhere, or press Escape / Enter / Space
  intro.addEventListener("click", finish);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
  });

  // Start the animation, and guarantee the intro never runs past 4 seconds
  requestAnimationFrame(function () {
    intro.classList.add("play");
  });
  setTimeout(finish, 3500); // 3.5s + 0.5s fade = 4.0s
})();
