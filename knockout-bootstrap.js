//UUID
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// Bind Twitter Tooltip
ko.bindingHandlers.tooltip = {
    init: function(element, valueAccessor) {
		var options = {
			title: ko.utils.unwrapObservable(valueAccessor())
		};

		ko.utils.extend(options, ko.bindingHandlers.tooltip.options);

		$(element).tooltip(options);
	},
	options: {
		placement: "right",
		trigger: "click"
	}
};

// Bind Twitter Popover
ko.bindingHandlers.popover = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		// read popover options 
		var popoverBindingValues = ko.utils.unwrapObservable(valueAccessor());

		// set popover title 
		var popoverTitle = popoverBindingValues.title;
		
		// set popover template id
		var tmplId = popoverBindingValues.template;

		// set popover trigger
		var trigger = popoverBindingValues.trigger;

		// get template html
		var tmplHtml = $('#' + tmplId).html();

		// create unique identifier to bind to
		var uuid = guid();
        var domId = "ko-bs-popover-" + uuid;

        // create correct binding context
        var childBindingContext = bindingContext.createChildContext(viewModel);

        // create DOM object to use for popover content
		var tmplDom = $('<div/>', {
			"class" : "ko-popover",
			"id" : domId
		}).html(tmplHtml);

		// set content options
		options = {
			content: tmplDom[0].outerHTML,
			title: popoverTitle
		};

		// Need to copy this, otherwise all the popups end up with the value of the last item
        var popoverOptions = $.extend({}, ko.bindingHandlers.popover.options, options);
        //popoverOptions.content = options.content;

        // bind popover to element click
		$(element).bind(trigger, function () {
			var popoverAction = 'show';
			var popoverTriggerEl = $(this);

			// popovers that hover should be toggled on hover
			// not stay there on mouseout
			if (trigger === 'hover') {
				popoverAction = 'toggle';
			}

			// show/toggle popover
			popoverTriggerEl.popover(popoverOptions).popover(popoverAction);

			// hide other popovers and bind knockout to the popover elements
			var popoverInnerEl = $('#' + domId);
			$('.ko-popover').not(popoverInnerEl).parents('.popover').remove();
		
			// if the popover is visible bind the view model to our dom ID
			if($('#' + domId).is(':visible')){
                ko.applyBindingsToDescendants(childBindingContext, $('#' + domId)[0]);
            }
            
            // bind close button to remove popover
            $(document).on('click', '[data-dismiss="popover"]', function (e) {
                popoverTriggerEl.popover('hide');
            });
		});

		// Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
		return { controlsDescendantBindings: true };
	},
	options: {
		placement: "right",
		title: "",
		html: true,
		content: "",
		trigger: "manual"
	}
};