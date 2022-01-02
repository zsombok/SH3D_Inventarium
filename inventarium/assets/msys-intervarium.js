var msysIntervarium;
var loaded = false;

function msysInitInventarium() {
	(function ($) {
		msysIntervarium = {

		};

		msysIntervarium.model = {

			actions: {},

			extend: function (args) {
				var model = $.extend({}, this, args);

				$.each(model.events, function (name, args) {
					model.add_event(name, args);
				});

				this._init(model);
				var self = this;
				$(function () {
					self._ready(model);
				});

				return model;
			},

			add_event: function (name, args) {
				if (loaded) return;

				var model = this;
				var event = args[0];
				var selector = args[1];
				var callback = args[2];

				// event
				var fn = function (e) {
					e.$el = $(this);
					if (typeof model.event === 'function') {
						e = model.event(e);
					}
					model[callback].apply(model, arguments);
				};

				if (selector == window) {
					$(window).on(event, fn);
				}
				else if (selector) {
					if (selector instanceof jQuery) {
						selector.on(event, fn);
					}
					else {
						$(document).on(event, selector, fn);
					}
				} else {
					$(document).on(event, fn);
				}

			},

			_init: function (model) {
				if (typeof model.init === 'function') {
					model.init();
				}
			},

			_ready: function (model) {
				if (typeof model.ready === 'function') {
					model.ready();
				}
			},

		};

		msysIntervarium.TextSlider = msysIntervarium.model.extend({

			events: {
				'slider_events': ['slider-event', '.w-slider', 'slider_events'],
				'next': ['click', '.inventarium-slider-nav-right', 'next'],
				'prev': ['click', '.inventarium-slider-nav-left', 'prev'],
			},

			init: function () {

			},

			ready: function () {

			},

			slider_events: function (e, data) {
				var $container = e.$el.closest('.content-image-wrapper');
				var $active_text = $('.content-text-slide.-show.-block');
				var $target_text = $('.content-text-slide[data-index="' + data.index + '"]');

				if (data.index != $active_text.attr('data-index')) {
					$('.content-text-slide').removeClass('-show');
					setTimeout(function () {
						$('.content-text-slide').removeClass('-block');
						$target_text.addClass('-block');

						setTimeout(function () {
							$target_text.addClass('-show');
						}, 0);
					}, 300);
				}

				if (data.index == 0) {
					$container.find('.inventarium-slider-nav-left').addClass('-disbled');
				}
				else {
					$container.find('.inventarium-slider-nav-left').removeClass('-disbled');
				}
				if (data.index + 1 >= data.slides.length) {
					$container.find('.inventarium-slider-nav-right').addClass('-disbled');
				}
				else {
					$container.find('.inventarium-slider-nav-right').removeClass('-disbled');
				}
				$container.find('.inventarium-slider-nums .current').html((data.index + 1));
			},

			next: function (e) {
				if (e.$el.hasClass('-disbled')) {
					return;
				}
				var $container = e.$el.closest('.content-image-wrapper');
				var $next = $container.find('.w-slider-arrow-right');
				$next.trigger('click');
			},

			prev: function (e) {
				if (e.$el.hasClass('-disbled')) {
					return;
				}
				var $container = e.$el.closest('.content-image-wrapper');
				var $prev = $container.find('.w-slider-arrow-left');
				$prev.trigger('click');
			},

		});

	})(jQuery);


	//slider events
	if (!loaded) {
		Webflow = Webflow || [];
		Webflow.push(function () {
			var namespace = '.w-slider';

			function slideChangeEvent(evt) {
				var slider;
				if ($(evt.target).is(namespace)) {
					slider = $(evt.target);
				} else {
					slider = $(evt.target).closest(namespace)
				}
				if (slider) {
					$(slider).trigger('slider-event', $(slider).data(namespace));
				}
			}

			var tap_selector = $.map(['.w-slider-arrow-left', '.w-slider-arrow-right', '.w-slider-dot'], function (s) { return namespace + ' ' + s; }).join(', ');

			// listeners
			$(document).off('tap' + namespace, tap_selector, slideChangeEvent).on('tap' + namespace, tap_selector, slideChangeEvent);
			$(document).off('swipe' + namespace, namespace, slideChangeEvent).on('swipe' + namespace, namespace, slideChangeEvent);

			// initial slide - manually trigger the event
			$(namespace + ':visible').each(function (i, s) {
				slideChangeEvent({ target: s });
			});

			loaded = true;
		});
	} else {
		Webflow.ready();
	}


}