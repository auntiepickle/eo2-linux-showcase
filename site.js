// Clip posters load only when the clip comes near the screen (a poster attribute
// loads at once, whatever preload says), so the first screen stays light.
// Clips play while they're on screen and pause otherwise. If the browser refuses
// to start them (iOS Low Power Mode does), the video controls appear instead.
(function () {
  var vids = document.querySelectorAll("video");
  var lazy = document.querySelectorAll("video[data-poster]");
  function poster(v) { if (v.dataset.poster) { v.poster = v.dataset.poster; v.removeAttribute("data-poster"); } }
  function manual(v) {
    poster(v);
    v.controls = true;
    var a = v.closest("a");
    if (a) a.removeAttribute("href");
  }
  if (!("IntersectionObserver" in window)) { lazy.forEach(poster); vids.forEach(manual); return; }
  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { poster(e.target); near.unobserve(e.target); } });
  }, { rootMargin: "400px 400px" });
  lazy.forEach(function (v) { near.observe(v); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (!e.isIntersecting) { v.pause(); return; }
      var p = v.play();
      if (p && p.catch) p.catch(function (err) {
        if (err && err.name === "AbortError") return;   // paused again before it started
        io.unobserve(v);
        manual(v);
      });
    });
  }, { threshold: 0.35 });
  vids.forEach(function (v) { io.observe(v); });
})();
