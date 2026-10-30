(function () {
  var els = document.querySelectorAll('.wrap > section, .wrap > .help, .wrap > .list, .wrap > .alerts, .wrap > .sharebar, .wrap > .card, .wrap > main');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return; // already on screen: leave as is
    el.classList.add('reveal'); io.observe(el);
  });
})();
