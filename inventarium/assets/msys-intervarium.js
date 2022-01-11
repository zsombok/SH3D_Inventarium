const jimp = require('jimp');
const screenshot = require('screenshot-desktop');


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
				'cancel': ['click', '.finish_button.cancel.-activeRed', 'cancel'],
				'keyboard': ['click', '.finish_button.sendmail.-inactive', 'keyboard'],
				'send_image': ['click', '.finish_button.sendmail.-active', 'send_image'],
				'restart': ['click', '.heraldika-restart', 'restart'],
			},

			init: function () {
				this.is_preview = false;
				this.config = null;
				this.$container = null;
				this.$finish_buttons = null;
				this.svg = null;
				this.pic_position = 0;
				this.game_started = false;
				this.selected_options = {};
				this.substep = 0;
			},

			ready: function () {
				this.init_game();
			},

			init_game: function () {
				var $container = $('body');
				var $config = $('#inventarium-config');

				if ($container.length == 0 || $config.length == 0) {
					return;
				}

				this.config = JSON.parse($config.html());
				this.$container = $container;

				var $text_field = $('<input type="text" class="motto-field" />');
				// this.$container.append($text_field);
				this.$text_field = $text_field;
				// console.log(this.$text_field);

				this.init_finish_buttons();
				this.init_keyboard_fields();
			},

			init_finish_buttons: function () {
				$finish_buttons = $(".get_list_buttons");
				$finish_buttons.children()[0].innerHTML = this.config.texts.keszvagyok + $finish_buttons.children()[0].innerHTML;
				// var $finish_buttons = $(
				//   '<div class="finish_buttons -active">' +
				//   '<div class="finish_button finished -active">' + this.config.texts.keszvagyok + ' <span class="circle"></span></div>' +
				//   // '<div class="finish_button sendmail">' + this.config.texts.elkuldom + ' <span class="circle"></span></div>' +
				//   '</div>'
				// );

				var $email_field = $(
					'<div class="email-field-container">' +
					'<input type="text" class="email-field" />' +
					'</div>'
				);

				// this.$container.append($finish_buttons);
				var kbContainer = document.getElementsByClassName("ui-keyboard")[0];
				console.log(kbContainer);
				this.$container.append($email_field);
				this.$email_field = $email_field.find('input');
			},

			finish: function (e) {
				// console.log(this.$text_field);
				// var mkb = this.$text_field.getkeyboard();
				// mkb.options.alwaysOpen = false;
				// mkb.close();
				document.getElementById("inventariumList").classList.remove("hiddenList");

				var $butsEl = $('.get_list_buttons'); // document.getElementsByClassName("get_list_buttons")[0]
				var texts = msysIntervarium.TextSlider.config.texts;

				var $finish_buttons = $(
					'<div class="finish_button cancel -activeRed">' + texts.megse + ' <span class="circle"></span></div>' +
					'<div class="finish_button sendmail -inactive">' + texts.elkuldom + ' <span class="circle"></span></div>'
				);
				
				setTimeout(() => {
					$butsEl.empty();
					$butsEl.append($finish_buttons);
				}, 1250);

				ifr?.postMessage("start");
				document.getElementById("gameFrameContainer").classList.add("small");

				// keyboard.reveal();
				// $email_container.addClass('-show');


				// keyboard.$keyboard.addClass('email-kb');
				// msysIntervarium.TextSlider.$container.find('.finish_buttons .sendmail').addClass('-active');
			},

			cancel: function (e) {
				var keyboard = msysIntervarium.TextSlider.$email_field.getkeyboard();
				var $email_container = msysIntervarium.TextSlider.$email_field.closest('.email-field-container');

				keyboard.options.alwaysOpen = false;
				keyboard.close();
				$email_container.removeClass('-show');
				var $butsEl = $('.get_list_buttons');
				$butsEl.empty();
				var texts = msysIntervarium.TextSlider.config.texts;

				var $finish_buttons = $(
					'<div class="finish_button finished -active">' + texts.keszvagyok + ' <span class="circle"></span></div>'
				);

				$butsEl.append($finish_buttons);
				document.getElementById("gameFrameContainer").classList.remove("small");
				document.getElementById("inventariumList").classList.add("hiddenList");

			},

			keyboard: function (e) {
				document.getElementsByClassName('sendmail')[0].classList.remove("-inactive");
				document.getElementsByClassName('sendmail')[0].classList.add("-active");
				screenshot().then(async (img) => {
					let result = await jimp.read(img).then(lenna => lenna);
					result.crop(40, 220, 1840, 840).write('hali.jpg');
					console.log(result);

					var $email_container = msysIntervarium.TextSlider.$email_field.closest('.email-field-container');
					var keyboard = msysIntervarium.TextSlider.$email_field.getkeyboard();
					keyboard.options.alwaysOpen = true;
					keyboard.reveal();
					$email_container.addClass('-show');
					keyboard.$keyboard.addClass('email-kb');
				}).catch((err) => {
					// ...
				})

			},

			send_image: async function (e) {

				var self = this;
				var $email_container = msysIntervarium.TextSlider.$email_field.closest('.email-field-container');
				var _emails = msysIntervarium.TextSlider.$email_field.val();

				_emails = _emails.split(',');
				var valid = true;
				var emails = [];
				$.each(_emails, function (i, email) {
					email = email.trim();
					if (email.length > 0) {
						if (self.validate_email(email)) {
							emails.push(email);
						}
						else {
							valid = false;
						}
					}
				});

				$email_container.find('.email-error-message').remove();
				if (!valid) {
					$email_container.append('<p class="email-error-message">' + msysIntervarium.TextSlider.config.texts.email_invalid + '</p>');
				}
				else if (emails.length === 0) {
					$email_container.append('<p class="email-error-message">' + msysIntervarium.TextSlider.config.texts.email_nomail + '</p>');
				}
				else {
					var keyboard = msysIntervarium.TextSlider.$email_field.getkeyboard();

					var emails_string = emails.join(',');
					const baseJPG = await jimp.read('Screencapture_test_01.jpg').then(image => image).then(image => image.getBase64Async(jimp.AUTO));
					app.sendMail(emails_string, baseJPG.split(',')[1]);

					const $gameContent = $("#gameContent");
					$gameContent.hide();
					const $buttons = $(".get_list_buttons");
					$buttons.hide();
					$('.email-sent-screen').show();
					$('.email-success').show();
					//$('.email-failure').show();

					$('.email-sent-screen .image-holder').css({
						'background-image': 'url("hali.jpg")',
					});

					keyboard.options.alwaysOpen = false;
					keyboard.close();
					$email_container.removeClass('-show');

					// this.render_image(callback);
				}
			},

			validate_email: function (email) {
				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(String(email).toLowerCase());
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
					customLayout: layouts['en'],
					visible: function (e, keyboard, el) {
						$('.ui-keyboard').addClass('-show');
					},
				};

				this.$text_field.keyboard(args);
				this.$email_field.keyboard(args);
			},

			restart: function (e) {
				app.setPage('gameChooseRoom');
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