var msysHeraldika;

function msysInitHeraldika() {
    (function ($) {
        msysHeraldika = {

        };

        msysHeraldika.model = {

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

        msysHeraldika.Game = msysHeraldika.model.extend({

            events: {
                'select_step_option': ['click', '.step-option', '_select_step_option'],
                'next_step': ['click', '.next-step-icon', 'next_step'],
                'next_substep': ['click', '.next-substep-icon', 'next_substep'],
                'clickd_out': ['click', document, 'clickd_out'],
                'change_motto': ['keyboardChange', '.motto-field', 'change_motto'],
                'finish': ['click', '.finish_button.finished.-active', 'finish'],
                'send_image': ['click', '.finish_button.sendmail.-active', 'send_image'],
                'restart': ['click', '.heraldika-restart', 'restart'],
            },

            init: function () {
                this.is_preview = false;
                this.config = null;
                this.$container = null;
                this.svg = null;
                this.pic_position = 0;
                this.game_started = false;
                this.selected_options = {};
                this.substep = 0;
            },

            ready: function () {
                this.init_game();

                if (typeof window.comm == 'undefined' || window.comm.is_preview()) {
                    this.is_preview = true;
                }
            },

            init_game: function () {
                var $container = $('#heraldika-game');
                var $config = $('#heraldika-config');

                if ($container.length == 0 || $config.length == 0) {
                    return;
                }

                this.config = JSON.parse($config.html());
                this.$container = $container;

                this.init_steps();
                this.init_canvas();
                this.init_canvas_content();

                var $text_field = $('<input type="text" class="motto-field" />');
                this.$container.append($text_field);
                this.$text_field = $text_field;

                this.init_finish_buttons();
                this.init_keyboard_fields();
            },

            init_steps: function () {
                var self = this;
                var $html = $('<div class="steps"><div class="steps-vertical-line"></div></div>');

                $.each(this.config.steps, function (id, step) {
                    var $step = $(
                        '<div class="step -inactive" data-step="' + id + '">' +
                        '<div class="step-title">' + step.title + '<div class="step-title-line"></div></div>' +
                        '<div class="step-options" ></div>' +
                        '<div class="next-step" ><span class="next-step-icon">✓</span></div>' +
                        '</div>'
                    );

                    $.each(step.options, function (id, option) {
                        var $option = $(
                            '<div class="step-option" data-option="' + id + '"></div>'
                        );

                        if (option.message && option.message.length > 0) {
                            $option.append('<div class="option-message">' + option.message + '</div>');
                        }

                        if (step.type == 'element') {
                            $option.css({
                                'background-image': 'url(' + option.src + ')',
                            });
                        }
                        else if (step.type == 'color') {
                            $option.css({
                                'background-color': option.color,
                            });
                        }
                        option.$el = $option;
                        $step.find('.step-options').append($option);
                    });

                    //add substep
                    if (id == 'maz' || id == 'cimerkepek') {
                        $step.find('.next-step').before('<div class="substep" ><span class="substep-counter"></span><span class="next-substep-icon">✓</span></div>');
                    }

                    step.$el = $step;
                    $html.append($step);

                    self.selected_options[id] = [];
                });

                this.$container.append($html);
            },

            init_canvas: function () {
                var $html = $('<div class="canvas-container"></div>');
                this.$container.append($html);
                this.svg = SVG().addTo($html[0]).size(550, 550);
            },

            init_canvas_content: function () {

                var shape_option = this.get_option('pajzsfroma', 6);
                this.set_step_option('pajzsfroma', 6);
                this.set_step_option('takaro', 5);
                this.set_step_option('sisakdisz', 3);

                this.set_step_option('cimerkepek', 6, shape_option.pic_positions[0]);
                this.set_step_option('cimerkepek', 6, shape_option.pic_positions[1]);
                this.set_step_option('cimerkepek', 23, shape_option.pic_positions[2]);
                this.set_step_option('cimerkepek', 13, shape_option.pic_positions[3]);

                this.set_step_option('motto', 6);

                this.set_active_step('pajzsfroma');
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

            _select_step_option: function (e) {
                var $step = e.$el.closest('.step');
                if ($step.hasClass('-inactive')) {
                    return;
                }
                if (e.$el.hasClass('-disabled')) {
                    return;
                }

                var step_id = $step.attr('data-step');
                var option_id = e.$el.attr('data-option');
                var step = this.get_step(step_id);

                var shape_option = this.get_shape_option();

                if (!this.game_started) {
                    this.start_game();
                }
                this.set_active_step(step_id, true);

                $('.step-option').removeClass('-clicked');
                e.$el.addClass('-clicked');

                if (step_id == 'maz' || step_id == 'cimerkepek') {
                    step.$el.find('.substep .next-substep-icon').addClass('-show');
                    this.set_step_option(step_id, option_id, this.substep);
                }
                else {
                    $step.addClass('-selected');
                    this.set_step_option(step_id, option_id);
                }
            },

            set_step_option: function (step_id, option_id, substep = 0) {
                var self = this;
                var step = this.get_step(step_id);
                var option = this.get_option(step_id, option_id);

                var shape_option = this.get_shape_option();

                if (step_id == 'maz') {
                    if (this.selected_options.maz.length < (substep + 1)) {
                        for (i = 0; i <= substep; i++) {
                            if (typeof this.selected_options.maz[i] === 'undefined') {
                                this.selected_options.maz[i] = null;
                            }
                        }
                    }

                    this.selected_options.maz[substep] = option.color;

                    this.refresh_colors();
                }
                else if (step_id == 'cimerkepek') {
                    if (this.selected_options.cimerkepek.length < (substep + 1)) {
                        for (i = 0; i <= substep; i++) {
                            if (typeof this.selected_options.cimerkepek[i] === 'undefined') {
                                this.selected_options.cimerkepek[i] = null;
                            }
                        }
                    }

                    this.selected_options.cimerkepek[substep] = option.id;

                    var pic_pos = (typeof shape_option.pic_positions[substep] != 'undefined') ? shape_option.pic_positions[substep] : false;
                    if (pic_pos !== false && (substep > 1 || option.side === true)) {
                        option = Object.assign({}, option);
                        option = Object.assign(option, pic_pos);
                    }
                    else {
                        return;
                    }

                }
                else {
                    this.selected_options[step_id] = [option_id];
                }

                if (step.type == 'element') {
                    var args = {
                        step: step_id,
                        option: option_id,
                        src: option.src,
                        width: (option.width) ? option.width : null,
                        height: (option.height) ? option.height : null,
                        maxWidth: (option.maxWidth) ? option.maxWidth : null,
                        maxHeight: (option.maxHeight) ? option.maxHeight : null,
                        pos: (option.pos) ? option.pos : ['center', 'center'],
                        override: (option.override) ? option.override : false,
                        zindex: (option.zindex) ? option.zindex : 0,
                        mirror: (option.mirror) ? option.mirror : false,
                        pic_pos: (typeof option.pic_pos !== 'undefined' && option.pic_pos !== null && option.pic_pos !== false) ? option.pic_pos : null,
                    };

                    this.insert_element(args);
                }
            },

            get_step: function (step) {
                return this.config.steps[step];
            },

            get_option: function (step, id) {
                return this.config.steps[step].options[id];
            },

            get_shape_option: function () {
                var $shape = $(this.svg.node).find('g[data-step="pajzsfroma"]');
                var shape_id = ($shape.length == 0) ? 6 : parseInt($shape.attr('data-option'));
                var shape_option = this.get_option('pajzsfroma', shape_id);
                return shape_option;
            },

            start_game: function () {
                this.game_started = true;
                $(this.svg.node).addClass('-started');
            },

            next_step: function (e) {
                var $step = e.$el.closest('.step');
                var step_id = $step.attr('data-step');
                var $next_step = $step.next('.step').first();
                var next_step_id = $next_step.attr('data-step');

                if (step_id == 'motto') {
                    this.write_motto();
                }
                else {
                    $step.removeClass('-selected');
                    $step.addClass('-confirmed');

                    this.set_active_step(next_step_id, true);
                }
            },

            next_substep: function (e) {
                var shape_option = this.get_shape_option();
                var $step = e.$el.closest('.step');
                var step_id = $step.attr('data-step');
                var max_step = 0;

                if (step_id == 'maz') {
                    max_step = shape_option.colors;
                }
                else if (step_id == 'cimerkepek') {
                    max_step = shape_option.pic_positions.length;
                }

                if ((this.substep + 1) >= max_step) {
                    this.set_disabled_pics();
                    this.substep = 0;
                    $step.find('.next-step .next-step-icon').trigger('click');
                    $step.find('.substep').removeClass('-show');
                    $step.find('.substep .next-substep-icon').removeClass('-show');
                }
                else {
                    this.substep++;
                    $step.find('.substep .substep-counter').html((this.substep + 1) + '/' + max_step);
                    $step.find('.substep .next-substep-icon').removeClass('-show');

                    if (step_id == 'cimerkepek') {
                        this.set_disabled_pics();
                    }
                }


            },

            set_active_step: function (step_id, reset_forward = false) {
                var step = this.get_step(step_id);
                var shape_option = this.get_shape_option();

                if (step_id == 'maz') {
                    step.$el.find('.substep .substep-counter').html((this.substep + 1) + '/' + shape_option.colors);
                    step.$el.find('.substep').addClass('-show');
                }
                else if (step_id == 'cimerkepek') {
                    step.$el.find('.substep .substep-counter').html((this.substep + 1) + '/' + shape_option.pic_positions.length);
                    step.$el.find('.substep').addClass('-show');
                    this.set_disabled_pics();
                }
                else {
                    this.substep = 0;
                }

                step.$el.removeClass('-inactive');
                step.$el.nextAll('.step').removeClass('-confirmed -selected');
                step.$el.nextAll('.step').addClass('-inactive');

                if (reset_forward) {
                    this.reset_forward_steps(step_id);
                }
            },

            set_disabled_pics: function () {
                var step = this.get_step('cimerkepek');

                if (this.substep < 2) {
                    $.each(step.options, function (i, option) {
                        if (!option.side) {
                            option.$el.addClass('-disabled');
                        }
                    });
                }
                else {
                    $.each(step.options, function (i, option) {
                        option.$el.removeClass('-disabled');
                    });
                }
            },

            reset_forward_steps(active_step) {
                var self = this;
                var steps_to_reset = [];
                var after_active = false;

                $.each(this.config.steps, function (step_id, step) {
                    if (after_active) {
                        steps_to_reset.push(step_id);
                    }
                    if (active_step == step_id) {
                        after_active = true;
                    }
                });

                $.each(steps_to_reset, function (i, step_id) {
                    $(self.svg.node).find('g[data-step="' + step_id + '"]').remove();

                    var $step = $('.step[data-step="' + step_id + '"]');
                    $step.find('.step-option').removeClass('-selected');
                    $step.find('.substep').removeClass('-show');
                    $step.find('.next-substep-icon').removeClass('-show');

                    self.selected_options[step_id] = [];
                });
            },

            insert_element: function (args) {
                var self = this;
                var parser = new DOMParser();

                // Fetch the file from the server.
                fetch(args.src)
                    .then(response => response.text())
                    .then(text => {
                        if (args.override) {
                            if (typeof args.pic_pos != 'undefined' && args.pic_pos !== null) {
                                $(self.svg.node).find('[data-step="' + args.step + '"][data-picpos="' + args.pic_pos + '"]').remove();
                            }
                            else {
                                $(self.svg.node).find('[data-step="' + args.step + '"]').remove();
                            }
                        }

                        var parsed = parser.parseFromString(text, 'text/html');
                        var element = parsed.querySelector('svg');
                        var $inner = $('<svg></svg>');
                        $inner.append($(element).find('g').first());

                        var group = self.svg.group();

                        group.svg($inner.html());
                        group.attr('data-step', args.step);
                        group.attr('data-option', args.option);
                        if (typeof args.pic_pos != 'undefined' && args.pic_pos !== null) {
                            group.attr('data-picpos', args.pic_pos);
                        }

                        //arrange
                        var zindex = (args.zindex) ? args.zindex : 0;
                        group.attr('data-zindex', zindex);
                        self.maintain_zindexes();


                        //sizing
                        var w = (args.width) ? args.width : null;
                        var h = (args.height) ? args.height : null;

                        if (args.maxWidth) {
                            var cw = (w !== null) ? w : group.width();
                            var ch = (h !== null) ? h : group.height();
                            var cratio = cw / ch;

                            if (cw > args.maxWidth) {
                                w = args.maxWidth;
                                h = args.maxWidth / cratio;
                            }
                            else {
                                w = cw;
                                h = ch;
                            }

                            if (args.maxHeight && h > args.maxHeight) {
                                w = args.maxHeight * cratio;
                                h = args.maxHeight;
                            }
                        }
                        else if (args.maxHeight) {
                            var cw = (w !== null) ? w : group.width();
                            var ch = (h !== null) ? h : group.height();
                            var cratio = cw / ch;

                            if (cw > args.maxHeight) {
                                w = args.maxHeight * cratio;
                                h = args.maxHeight;
                            }
                        }

                        if (w !== null || h !== null) {
                            group.size(w, h);
                        }


                        //positioning
                        //x
                        var posx = args.pos[0];
                        var originx = (typeof args.pos[2] !== 'undefined') ? args.pos[2] : 0;

                        if (originx == 'left') {
                            originx = 0;
                        }
                        else if (originx == 'right') {
                            originx = group.width() * -1;
                        }

                        if (posx == 'center') {
                            posx = self.svg.width() / 2;
                        }

                        if (originx == 'center') {
                            group.cx(posx);
                        }
                        else {
                            group.x((posx + originx));
                        }

                        //y
                        var posy = args.pos[1];
                        var originy = (typeof args.pos[3] !== 'undefined') ? args.pos[3] : 0;

                        if (originy == 'top') {
                            originy = 0;
                        }
                        else if (originy == 'bottom') {
                            originy = group.height() * -1;
                        }

                        if (posy == 'center') {
                            posy = self.svg.height() / 2;
                        }

                        if (originy == 'center') {
                            group.cy(posy);
                        }
                        else {
                            group.y((posy + originy));
                        }

                        //mirroring
                        if (args.mirror) {
                            if (args.mirror == 'x') {
                                group.transform({
                                    scaleX: -1,
                                });
                            }
                            else if (args.mirror == 'y') {
                                group.transform({
                                    scaleY: -1,
                                });
                            }
                        }
                    });
            },

            refresh_colors: function () {
                var self = this;

                $.each(this.selected_options.maz, function (i, color) {
                    self.svg.find('.color_' + (i + 1)).css({
                        fill: color,
                    });
                });
            },

            maintain_zindexes: function () {
                var $groups = $(this.svg.node).children('g');
                $groups.sort(function (a, b) {
                    var azi = parseInt($(a).attr('data-zindex'));
                    var bzi = parseInt($(b).attr('data-zindex'));
                    return azi - bzi;
                });

                $groups.each(function (i, g) {
                    g.instance.front();
                });
            },

            clickd_out: function (e) {

                if (!$(e.target).hasClass('step-option')) {
                    $('.step-option').removeClass('-clicked');
                }

            },

            write_motto: function () {
                var keyboard = this.$text_field.getkeyboard();
                keyboard.options.alwaysOpen = true;
                keyboard.reveal();

                this.$container.find('.finish_buttons').removeClass('-disabled');
                this.$container.find('.finish_buttons .finished').addClass('-active');
            },

            change_motto: function (e, keyboard) {
                var text = keyboard.getValue();
                var element = this.svg.find('.motto-text');
                var $motto = $(this.svg.node).find('g[data-step="motto"]');
                var motto_id = $motto.attr('data-option');
                var motto_option = this.get_option('motto', motto_id);

                if (element.length == 0) {
                    element = this.svg.text('');
                    element.attr('class', 'motto-text');
                    element.font({
                        family: 'Klavikach Condensed',
                        size: motto_option.text.fontsize,
                        anchor: 'middle',
                        leading: '1.5em',
                    });

                    element.x(this.svg.width() / 2);
                    element.y(motto_option.text.pos);
                }
                else {
                    element = element[0];
                }

                element.text(text);

                if (element.bbox().width >= motto_option.text.maxWidth) {
                    keyboard.options.maxLength = text.length;
                }
                else {
                    keyboard.options.maxLength = false;
                }
            },

            finish: function (e) {
                var mkb = this.$text_field.getkeyboard();
                mkb.options.alwaysOpen = false;
                mkb.close();

                var $email_container = this.$email_field.closest('.email-field-container');
                var keyboard = this.$email_field.getkeyboard();
                keyboard.options.alwaysOpen = true;
                keyboard.reveal();
                $email_container.addClass('-show');

                keyboard.$keyboard.addClass('email-kb');
                this.$container.find('.finish_buttons .sendmail').addClass('-active');
            },

            send_image: function (e) {
                var self = this;
                var $email_container = this.$email_field.closest('.email-field-container');
                var _emails = this.$email_field.val();

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
                    $email_container.append('<p class="email-error-message">' + this.config.texts.email_invalid + '</p>');
                }
                else if (emails.length === 0) {
                    $email_container.append('<p class="email-error-message">' + this.config.texts.email_nomail + '</p>');
                }
                else {
                    var callback = function (png_base64) {
                        var $email_container = self.$email_field.closest('.email-field-container');
                        var keyboard = self.$email_field.getkeyboard();

                        var emails_string = emails.join(',');
                        app.sendMail(emails_string, png_base64.split(',')[1]);

                        self.$container.hide();
                        $('.email-sent-screen').show();
                        $('.email-success').show();
                        //$('.email-failure').show();

                        $('.email-sent-screen .image-holder').css({
                            'background-image': 'url(' + png_base64 + ')',
                        });

                        keyboard.options.alwaysOpen = false;
                        keyboard.close();
                        $email_container.removeClass('-show');
                    };
                    this.render_image(callback);
                }
            },

            render_image: function (callback = null) {
                var res_multiplier = 2;
                var w = this.svg.width() * res_multiplier;
                var h = this.svg.height() * res_multiplier;
                var s = new XMLSerializer().serializeToString(this.svg.node);
                var svg_base64 = window.btoa(unescape(encodeURIComponent(s)));

                var $canvas = $('<canvas class="render-canvas"></canvas>');
                $('.container').append($canvas);
                var ctx = $canvas[0].getContext("2d");

                ctx.canvas.width = w;
                ctx.canvas.height = h;

                //add background
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, $canvas[0].width, $canvas[0].height);

                var image = new Image();
                image.src = 'data:image/svg+xml;base64,' + svg_base64;

                image.onload = function () {
                    ctx.drawImage(image, 0, 0, w, h);
                    var png_base64 = $canvas[0].toDataURL("image/png");

                    if (typeof callback == 'function') {
                        callback(png_base64);
                    }
                };
            },

            validate_email: function (email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            },

            restart: function (e) {
                app.setPage('game');
            },

        });

    })(jQuery);
}