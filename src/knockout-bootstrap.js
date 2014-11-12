/* global define */
function setupKoBootstrap(koObject, $) {
    "use strict";
    //UUID. note: not RFC4122-compliant.
    var guid = (function(s4) {
        return function() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
    })(function() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    });

    // Outer HTML
    if (!$.fn.outerHtml) {
        $.fn.outerHtml = function () {
            if (this.length === 0) {
                return false;
            }
            var elem = this[0], name = elem.tagName.toLowerCase();
            if (elem.outerHTML) {
                return elem.outerHTML;
            }
            var attrs = $.map(elem.attributes, function (i) {
                return i.name + '="' + i.value + '"';
            });
            return "<" + name + (attrs.length > 0 ? " " + attrs.join(" ") : "") + ">" + elem.innerHTML + "</" + name + ">";
        };
    }

    // Bind twitter typeahead
    koObject.bindingHandlers.typeahead = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var allBindings = allBindingsAccessor();
            var typeaheadOpts = { source: koObject.utils.unwrapObservable(valueAccessor()) };

            if (allBindings.typeaheadOptions) {
                $.each(allBindings.typeaheadOptions, function(optionName, optionValue) {
                    typeaheadOpts[optionName] = koObject.utils.unwrapObservable(optionValue);
                });
            }

            $element.attr("autocomplete", "off").typeahead(typeaheadOpts);
        }
    };

    // Bind Twitter Progress
    koObject.bindingHandlers.progress = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);

            var bar = $('<div/>', {
                'class': 'bar',
                'data-bind': 'style: { width:' + valueAccessor() + ' }'
            });

            $element.attr('id', guid())
                .addClass('progress progress-info')
                .append(bar);

            koObject.applyBindingsToDescendants(viewModel, $element[0]);
        }
    };

    // Bind Twitter Alert
    koObject.bindingHandlers.alert = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var alertInfo = koObject.utils.unwrapObservable(valueAccessor());

            var dismissBtn = $('<button/>', {
                'type': 'button',
                'class': 'close',
                'data-dismiss': 'alert'
            }).html('&times;');

            var alertMessage = $('<p/>').html(alertInfo.message);

            $element.addClass('alert alert-' + alertInfo.priority)
                .append(dismissBtn)
                .append(alertMessage);
        }
    };

    // Bind Twitter Tooltip
    koObject.bindingHandlers.tooltip = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element, options, tooltip;
            options = koObject.utils.unwrapObservable(valueAccessor());
            $element = $(element);

            // If the title is an observable, make it auto-updating.
            if (koObject.isObservable(options.title)) {
                var isToolTipVisible = false;

                $element.on('show.bs.tooltip', function () {
                    isToolTipVisible = true;
                });
                $element.on('hide.bs.tooltip', function () {
                    isToolTipVisible = false;
                });

                // "true" is the bootstrap default.
                var origAnimation = options.animation || true;
                options.title.subscribe(function () {
                    if (isToolTipVisible) {
                        $element.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
                        $element.tooltip('fixTitle') // call this method to update the title
                            .tooltip('show');
                        $element.data('bs.tooltip').options.animation = origAnimation;
                    }
                });
            }

            tooltip = $element.data('bs.tooltip');
            if (tooltip) {
                $.extend(tooltip.options, options);
            } else {
                $element.tooltip(options);
            }
        }
    };

    // Bind Twitter Popover
    // Bind Twitter Popover - had to add because the standard one is not working correctly
    koObject.bindingHandlers.popover = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);

            // read popover options
            var popoverBindingValues = koObject.utils.unwrapObservable(valueAccessor());

            // build up all the options
            var tmpOptions = {};

            // set popover title - will use default title attr if none given
            if (popoverBindingValues.title) {
                tmpOptions.title = popoverBindingValues.title;
            }else{
                //if title is empty, then fix template
                tmpOptions.template = '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>';
            }

            // set popover placement
            if (popoverBindingValues.placement) {
                tmpOptions.placement = popoverBindingValues.placement;
            }

            // set popover container
            if (popoverBindingValues.container) {
                tmpOptions.container = popoverBindingValues.container;
            }

            // set popover delay
            if (popoverBindingValues.delay) {
                tmpOptions.delay = popoverBindingValues.delay;
            }

            // create unique identifier to bind to
            var uuid = guid();
            var domId = "ko-bs-popover-" + uuid;

            // if template defined, assume a template is being used
            var tmplDom;
            var tmplHtml = "";
            if (popoverBindingValues.template) {
                // set popover template id
                var tmplId = popoverBindingValues.template;

                // set data for template
                var data = popoverBindingValues.data;

                // get template html
                if (!data) {
                    tmplHtml = $('#' + tmplId).html();
                } else {
                    tmplHtml = function() {
                        var container = $('<div data-bind="template: { name: template, if: data, data: data }"></div>');

                        koObject.applyBindings({
                            template: tmplId,
                            data: data
                        }, container[0]);
                        return container;
                    };
                }

                // create DOM object to use for popover content
                tmplDom = $('<div/>', {
                    "class": "ko-popover",
                    "id": domId
                }).html(tmplHtml);

            } else {
                // Must be using static content for body of popover
                if (popoverBindingValues.dataContent) {
                    tmplHtml = popoverBindingValues.dataContent;
                }

                // create DOM object to use for popover content
                tmplDom = $('<div/>', {
                    "class": "ko-popover",
                    "id": domId
                }).html(tmplHtml);
            }

            // create correct binding context
            var childBindingContext = bindingContext.createChildContext(viewModel);

            // set internal content
            tmpOptions.content = $(tmplDom[0]).outerHtml();

            // Need to copy this, otherwise all the popups end up with the value of the last item
            var popoverOptions = $.extend({}, koObject.bindingHandlers.popover.options, tmpOptions);

            // see if the close button should be added to the title
            if (popoverOptions.addCloseButtonToTitle) {
                var closeHtml = popoverOptions.closeButtonHtml;
                if (closeHtml === undefined) {
                    closeHtml = ' &times ';
                }
                if (popoverOptions.title === undefined) {
                        popoverOptions.title = ' ';
                }

                var titleHtml = popoverOptions.title;
                var buttonHtml = '  <button type="button" class="close" data-dismiss="popover">' + closeHtml + '</button>';
                popoverOptions.title = titleHtml + buttonHtml;
            }

            // Build up the list of eventTypes if it is defined
            var eventType = "";
            if (popoverBindingValues.trigger) {
                var triggers = popoverBindingValues.trigger.split(' ');

                for (var i = 0; i < triggers.length; i++) {
                    var trigger = triggers[i];

                    if (trigger !== 'manual') {
                        if (i > 0) {
                            eventType += ' ';
                        }

                        if (trigger === 'click') {
                            eventType += 'click';
                        } else if (trigger === 'hover') {
                            eventType += 'mouseenter mouseleave';
                        } else if (trigger === 'focus') {
                            eventType += 'focus blur';
                        }
                    }
                }
            } else {
                eventType = 'click';
            }

            var lastEventType = "";
            // bind popover to element click
            $element.on(eventType, function(e) {
                e.stopPropagation();

                var popoverAction = 'toggle';
                var popoverTriggerEl = $(this);

                // Check state before we toggle it so the animation gives us the correct state
                var popoverPrevStateVisible = $('#' + domId).is(':visible');

                // if set eventType to "click focus", then both events were fired in chrome,
                // in safari only click was fired, and focus/blur will be missed for a lot of tags.
                if(lastEventType === 'focus' && e.type === 'click' && popoverPrevStateVisible ){
                    lastEventType = e.type;
                    return;
                }
                lastEventType = e.type;


                // show/toggle popover
                popoverTriggerEl.popover(popoverOptions).popover(popoverAction);

                // hide other popovers - other than the one we are manipulating
                var popoverInnerEl = $('#' + domId);
                var $oldPopovers = $('.ko-popover').not(popoverInnerEl).parents('.popover');
                $oldPopovers.each(function () {
                    // popover is attached to the previous element or its parent if a container was specified
                    var $this = $(this);

                    var popoverFound = false;
                    var $parent = $this.parent();
                    var parentData = $parent.data('bs.popover');
                    if (parentData) {
                        popoverFound = true;
                        $parent.popover('destroy');
                    }

                    if (!popoverFound) {
                        var $prev = $(this).prev();
                        var prevData = $prev.data('bs.popover');
                        if (prevData) {
                            popoverFound = true;
                            $prev.popover('destroy');
                        }
                    }
                });
                // popover
                //$('.ko-popover').not(popoverInnerEl).parents('.popover').remove();

                // if the popover was visible, it should now be hidden, so bind the view model to our dom ID
                if (!popoverPrevStateVisible) {

                    koObject.applyBindingsToDescendants(childBindingContext, popoverInnerEl[0]);

                    /* Since bootstrap calculates popover position before template is filled,
                     * a smaller popover height is used and it appears moved down relative to the trigger element.
                     * So we have to fix the position after the bind
                     */

                    var triggerElementPosition = $(element).offset().top;
                    var triggerElementLeft = $(element).offset().left;
                    var triggerElementHeight = $(element).outerHeight();
                    var triggerElementWidth = $(element).outerWidth();

                    var popover = $(popoverInnerEl).parents('.popover');
                    var popoverHeight = popover.outerHeight();
                    var popoverWidth = popover.outerWidth();
                    var arrowSize = 10;

                    switch (popoverOptions.offset && popoverOptions.placement) {
                        case 'left':
                            popover.offset({ top: Math.max(0, triggerElementPosition - popoverHeight / 2 + triggerElementHeight / 2), left: Math.max(0, triggerElementLeft - arrowSize - popoverWidth) });
                            break;
                        case 'right':
                            popover.offset({ top: Math.max(0, triggerElementPosition - popoverHeight / 2 + triggerElementHeight / 2) });
                            break;
                        case 'top':
                            popover.offset({ top: Math.max(0, triggerElementPosition - popoverHeight - arrowSize), left: Math.max(0, triggerElementLeft - popoverWidth / 2 + triggerElementWidth / 2) });
                            break;
                        case 'bottom':
                            popover.offset({ top: Math.max(0, triggerElementPosition + triggerElementHeight + arrowSize), left: Math.max(0, triggerElementLeft - popoverWidth / 2 + triggerElementWidth / 2) });
                    }

                    // bind close button to remove popover
                    var popoverParent;
                    if (popoverOptions.container) {
                        popoverParent = $(popoverOptions.container);
                    } else {
                        popoverParent = popoverTriggerEl.parent();
                    }
                    popoverParent.on('click', 'button[data-dismiss="popover"]', function () {
                        popoverTriggerEl.popover('hide');
                    });
                }


                // Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
                return { controlsDescendantBindings: true };
            });
        },
        options: {
            placement: "right",
            offset: false,
            html: true,
            addCloseButtonToTitle: false,
            trigger: "manual"
        }
    };
}

(function (factory) {
    "use strict";
    // Support multiple loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module

        define(["require", "exports", "knockout", "jquery"], function (require, exports, knockout, jQuery) {
            factory(knockout, jQuery);
        });
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        factory(window.ko, jQuery);
    }
}(setupKoBootstrap));
