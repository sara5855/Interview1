
ko.bindingHandlers["control"].controlsFactory["loading"] = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var that = this;

    this.destroy = function () { };

    this.bindingUpdated = function () { };

    return false;
}

ko.bindingHandlers["control"].controlsFactory["page"] = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var that = this;

    this.destroy = function () {
        pageContiner[valueAccessor.pageId] = undefined;
        delete pageContiner[valueAccessor.pageId];
        //$(element).trigger("destroy");

        that.continer = undefined;
    };

    this.pageId = valueAccessor.pageId;

    this.bindingUpdated = function () {
        //if (pageContiner[that.pageId].$el) {
        //    pageContiner[that.pageId].$el.page();
        //}
    };

    $(element).detach();

    var originalBindingContext = bindingContext.extend({});

    valueAccessor.activateFunctionName = valueAccessor.activateFunctionName || "activate";
    valueAccessor.deactivateFunctionName = valueAccessor.deactivateFunctionName || "deactivate";
    valueAccessor.canDeactivateFunctionName = valueAccessor.canDeactivateFunctionName || "canDeactivate";
    valueAccessor.reActivateFunctionName = valueAccessor.reActivateFunctionName || "reActivate";

    var params = {
        content: valueAccessor.content,
        headerContent: valueAccessor.headerContent,
        pageId: valueAccessor.pageId,
        src: valueAccessor.src,
        reActivate: (valueAccessor.reActivate) ? valueAccessor.reActivate : ((valueAccessor.content) ? valueAccessor.content[valueAccessor.reActivateFunctionName] : undefined),
        canDeactivate: (valueAccessor.canDeactivate) ? valueAccessor.canDeactivate : ((valueAccessor.content) ? valueAccessor.content[valueAccessor.canDeactivateFunctionName] : undefined),
        onActivate: (valueAccessor.onActivate) ? valueAccessor.onActivate : ((valueAccessor.content) ? valueAccessor.content[valueAccessor.activateFunctionName] : undefined),
        onDeactivate: (valueAccessor.onDeactivate) ? valueAccessor.onDeactivate : ((valueAccessor.content) ? valueAccessor.content[valueAccessor.deactivateFunctionName] : undefined),
        panelContent: valueAccessor.panelContent,
        animateOnReactivate: valueAccessor.animateOnReactivate,
    };

    pageContiner[that.pageId] = newPage(element, params, originalBindingContext, undefined,
        function ($newPageEl) {
            var regionNotFound = true;

            if (valueAccessor.region) {
                var region = $("[data-page-region='" + valueAccessor.region + "']");
                if (region.length != 0) {
                    region.append($newPageEl);
                    regionNotFound = false;
                }
            }

            if (regionNotFound) {
                $("body").append($newPageEl);
                detachedFromRegionPage = $newPageEl;
                if (window.console) {
                    console.log("No Region Found");
                }

            }
            //$newPageEl
        });

    return true;
}

var detachedFromRegionPage = undefined;

ko.bindingHandlers["control"].controlsFactory["region"] = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    this.destroy = function () {
        detachedFromResionPage = $(element).children();
        detachedFromResionPage.detach();
    }

    this.bindingUpdated = function () {
        if (detachedFromRegionPage) {
            $(element).append(detachedFromRegionPage);

            detachedFromRegionPage = undefined;
        }
    }

    return true;
}

ko.bindingHandlers["control"].controlsFactory["modal"] = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var that = this;
    var $el = $(element);
    var isShown = false;
    var template = $el.html();
    var continer = undefined;
    var isHiding = false;

    var showHandlers = [];


    var isUpdatingModal = false;
    function ApplyNextHandler() {
        if (showHandlers.length) {
            var handler = showHandlers[0];
            showHandlers.splice(0, 1);
            handler();
        }
    }

    $el.on('hidden.bs.modal', function () {
        isUpdatingModal = false;
        ApplyNextHandler();
    });

    $el.on('shown.bs.modal', function () {
        isUpdatingModal = false;
        ApplyNextHandler();
    });


    function showModal() {
        isUpdatingModal = true;

        ko.cleanNode(continer[0]);
        continer.html(template);
        ko.applyBindingsToDescendants(bindingContext, continer[0]);
        $el.modal("show");

        if (valueAccessor.onShow) {
            valueAccessor.onShow.apply(viewModel);
        }
        ko.bindingHandlers["control"].controlsFactory["modal"].currentExistsDialogs++;
    }

    function clearScreenBloker() {
        isHiding = true;
        isUpdatingModal = true;

        $el.modal("hide");

        ko.bindingHandlers["control"].controlsFactory["modal"].currentExistsDialogs--;

        if (ko.bindingHandlers["control"].controlsFactory["modal"].currentExistsDialogs === 0) {
            $(".modal-backdrop").remove();
            $("body").removeClass("modal-open");
        }

        if (continer && continer.length > 0) {
            ko.cleanNode(continer[0]);
        }
    }


    this.destroy = function () {

        if (valueAccessor.onHide) {
            valueAccessor.onHide.apply(viewModel);
        }

        showHandlers.length = 0;
        if (isShown) {
            if (isUpdatingModal) {
                showHandlers.push(function () {
                    clearScreenBloker();
                    $el = undefined;
                    that = undefined;
                });
            }
        }
    };

    this.bindingUpdated = function () {
        if (valueAccessor.isOpen && ko.utils.unwrapObservable(valueAccessor.isOpen)) {
            if (!isShown) {
                isShown = true;
                showHandlers.push(showModal);
            }
        }
        else {
            if (isShown) {
                isShown = false;
                showHandlers.push(clearScreenBloker);
            }
        }

        if (!isUpdatingModal) {
            ApplyNextHandler();
        }
    };

    $el.addClass("modal");
    $el.attr({
        role: "dialog"
    });

    $el.on('hidden.bs.modal', function (ev) {
        if (showHandlers.length === 0 && !isHiding) {
            if (ev.target === $el[0]) {
                if (ko.unwrap(valueAccessor.isOpen)) {
                    if (!ko.isComputed(valueAccessor.isOpen) || valueAccessor.isOpen.hasWriteFunction) {
                        valueAccessor.isOpen(false);
                    }
                }
            }
        }

        isHiding = false;
    });

    //ko.bindingHandlers["control"].controlsFactory["modal"].currentExistsDialogs++;
    $el.html("<div style=\"" + ((valueAccessor.style !== undefined) ? valueAccessor.style : '') + "\" class='modal-dialog'><div class='modal-content'></div></div>")
    continer = $el.find(".modal-content");



    return true;
}

ko.bindingHandlers["control"].controlsFactory["modal"].currentExistsDialogs = 0;
