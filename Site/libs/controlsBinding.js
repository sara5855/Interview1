(function () {

    var controlsFactory = {};

    ko.virtualElements.allowedBindings.control = true;

    ko.bindingHandlers["control"] = {
        controlsFactory : controlsFactory,
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var type = valueAccessor().type;

            var control = {
                destroy: function () {
                },
                bindingUpdated: function () {
                }
            };

            if (!controlsFactory[type]) {
                app.log("ControlBindings: Failed to find the control: " + type, true);
            }

            var res = controlsFactory[type].call(control, element, valueAccessor(), allBindingsAccessor, viewModel, bindingContext);

            if (element.nodeName === "#comment") {
                element.internalControl = control;
            }
            else {
                $(element).data("internalControl", control);
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function (el) {
                var ctr = undefined;
                if (element.nodeName === "#comment") {
                    ctr = element.internalControl;
                }
                else {
                    ctr = $(el).data("internalControl");
                }

                if (ctr && ctr.destroy) {
                    ctr.destroy();
                }
            });

            if (!res) {
                res = false;
            }

            return { controlsDescendantBindings: res };
        },
        // Occures when the binding is changed.
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (element.nodeName === "#comment") {
                element.internalControl.bindingUpdated();
            }
            else {
                var res = $(element).data("internalControl").bindingUpdated();
            }

            if (!res) {
                res = false;
            }

            return { controlsDescendantBindings: res };
        }
    }

})();