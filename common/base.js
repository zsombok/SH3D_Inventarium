$ = jQuery = require('../common/jquery.js');

reloader = setTimeout(() => window.location.reload(), 1000 * 60 * 5);

document.addEventListener('DOMContentLoaded', () => {
  //!function (o, c) { var n = c.documentElement, t = " w-mod-"; n.className += t + "js", ("ontouchstart" in o || o.DocumentTouch && c instanceof DocumentTouch) && (n.className += t + "touch") }(window, document);

  app = new Application();

  $.fn.preloadImages = function () {
    this.each(function () {
      $('body').append($('<img>').attr({ src: this }).hide())
    });
  };

  const glob = require('glob');
  setTimeout(() => {
    ['png', 'jpg', 'jpeg', 'gif', 'svg'].forEach(ext => {
      glob('assets/*.' + ext, (err, files) => $(files).preloadImages());
      glob('../common/*.' + ext, (err, files) => $(files).preloadImages());
    });
  }, 1000);

  $(window).on('click', () => {
    clearTimeout(reloader);
    reloader = setTimeout(() => window.location.reload(), 1000 * 60 * 10);
  });
});