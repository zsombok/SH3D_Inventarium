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
			}


		};

		msysIntervarium.TextSlider = msysIntervarium.model.extend({

			events: {
				'slider_events': ['slider-event', '.w-slider', 'slider_events'],
				'next': ['click', '.inventarium-slider-nav-right', 'next'],
				'prev': ['click', '.inventarium-slider-nav-left', 'prev'],
				'finish': ['click', '.finish_button.finished.-active', 'finish'],
				'send_image': ['click', '.finish_button.sendmail.-active', 'send_image'],
				'restart': ['click', '.heraldika-restart', 'restart'],
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

			init_keyboard_fields: function () {
				this.language = app.language; //$('.header-lang').attr('data-lang');

				$.keyboard.keyaction.dotcom = function (base) {
					base.insertText('.com');
				};

				var layouts = {
					'hu': {
						'normal': ['0 1 2 3 4 5 6 7 8 9 ö ü ó {bksp}', 'q w e r t z u i o p ő ú', 'a s d f g h j k l é á ű', 'í y x c v b n m , . - _ @ {dotcom}', '{shift} {space} {shift}'],
						'shift': ['! ? # $ % & = * + - ö ü ó {bksp}', 'Q W E R T Z U I O P Ő Ú', 'A S D F G H J K L É Á Ű', 'Í Y X C V B N M / \' ( ) | ~', '{shift} {space} {shift}']
					},
					'en': {
						'normal': ['1 2 3 4 5 6 7 8 9 0 {bksp}', 'q w e r t y u i o p', 'a s d f g h j k l', 'z x c v b n m , . - _ @ {dotcom}', '{shift} {space} {shift}'],
						'shift': ['! ? # $ % & = * + - {bksp}', 'Q W E R T Y U I O P', 'A S D F G H J K L', 'Z X C V B N M / \' ( ) | ~', '{shift} {space} {shift}']
					},
					'sk': {
						'normal': ['! ? ľ š č ť ž ý á í é {bksp}', 'q w e r t z u i o p ú ä', 'a s d f g h j k l ň', 'y x c v b n m , . - _ @ {dotcom}', '{shift} {space} {shift}'],
						'shift': ['; 1 2 3 4 5 6 7 8 9 0 {bksp}', 'Q W E R T Y U I O P ( )', 'A S D F G H J K L !', 'Y X C V B N M / \' { } | ~', '{shift} {space} {shift}']
					}
				}

				var args = {
					language: this.language,
					rtl: false,
					usePreview: false,
					alwaysOpen: false,
					autoAccept: true,
					layout: 'custom',
					display: {
						'bksp': '\u2190',
						'shift': '\u21e7',
						'dotcom': '.com'
					},
					customLayout: layouts[this.language],
					visible: function (e, keyboard, el) {
						$('.ui-keyboard').addClass('-show');
					},
				};

				this.$text_field.keyboard(args);
				this.$email_field.keyboard(args);
			},

			init_finish_buttons: function () {
				var $finish_buttons = $(
					'<div class="finish_buttons -disabled">' +
					'<div class="finish_button finished">' + this.config.texts.keszvagyok + ' <span class="circle"></span></div>' +
					'<div class="finish_button sendmail">' + this.config.texts.elkuldom + ' <span class="circle"></span></div>' +
					'</div>'
				);

				var $email_field = $(
					'<div class="email-field-container">' +
					'<input type="text" class="email-field" />' +
					'</div>'
				);

				this.$container.append($finish_buttons);
				this.$container.append($email_field);
				this.$email_field = $email_field.find('input');
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