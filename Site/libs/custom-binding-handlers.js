/// <reference path="../libs/knockout-3.0.0.js" />
/// <reference path="../../libs/jquery-1.9.1.js" />
/// <reference path="../../libs/jquery.iframe-transport.js" />
/// <reference path="../../libs/jquery.ui.widget.js" />
/// <reference path="../../libs/jquery.fileupload.js" />
/// <reference path="../index.html" />
/// 

ko.bindingHandlers['let'] = {
    init: function (element, valueAccessor, allBindings, vm, bindingContext) {
        // Make a modified binding context, with extra properties, and apply it to descendant elements
        var innerContext = bindingContext.extend(valueAccessor);
        ko.applyBindingsToDescendants(innerContext, element);

        return { controlsDescendantBindings: true };
    }
};
ko.virtualElements.allowedBindings['let'] = true;

ko.bindingHandlers["bindAfterRender"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        ko.applyBindingsToDescendants(viewModel, element);


        var bindings = valueAccessor();
        var allBindings = function () { return bindings; };
        for (var i in bindings) {
            ko.bindingHandlers[i].init(element, function () { return bindings[i]; }, allBindings, viewModel, bindingContext)
        }

        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var bindings = valueAccessor();
        var allBindings = function () { return bindings; };
        for (var i in bindings) {
            ko.bindingHandlers[i].update(element, function () { return bindings[i]; }, allBindings, viewModel, bindingContext)
        }
    }
}

ko.bindingHandlers["injectObjectToIframe"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var injectObjInterval = null;
        function tryInjectObjectToIframe(element, attempCount, value) {

            if (element.contentWindow.pageIsready) {
                element.contentWindow[value.injectedObjName] = value.injectedObj;
                clearInterval(injectObjInterval);
            } else {
                attempCount += 1;
                if (attempCount > 30) {//3 seconds
                    clearInterval(injectObjInterval);
                }
            }

        }
        if (element.contentWindow) {
            var value = valueAccessor();
            if (value.injectedObjName && value.injectedObj) {
                var attempCount = 1;
                injectObjInterval = setInterval(tryInjectObjectToIframe, 100, element, attempCount, value);
            }
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    }
}

ko.bindingHandlers["focus"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var val = valueAccessor();

        if (ko.unwrap(val)) {
            setTimeout(function () {
                $(element).focus();
            },500);
        }
        else {
        }
    }
}

//autoSelected
ko.bindingHandlers["autoSelected"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var selectionType = { "all": "all", "setToEnd": "setToEnd" };
        var val = valueAccessor();
        var autoSelected = val.autoSelected;
        var selectedType = val.selectedType;
        var handel = undefined;
        if (selectedType != selectionType.setToEnd) {
            $(element)[0].type = "number";

        }
        function handleBlur() {
            if (selectedType == selectionType.setToEnd) {
                $(element)[0].type = "tel";
            }
        };
        function handleFocuse() {
            if (autoSelected) {
                if (selectedType == selectionType.all) {
                    handel = setTimeout(function () {
                        handel = undefined;
                        $(element).select();
                    }, 1);
                }
                else if (selectedType == selectionType.setToEnd) {
                    if (element.setSelectionRange) {
                        var len = $(element).val().length * 2;
                        handel = setTimeout(function () {
                            handel = undefined;
                            element.setSelectionRange(len, len);
                            $(element)[0].type = "number";
                        }, 3);
                    }
                    // As a fallback, replace the contents with itself
                    // Doesn't work in Chrome, but Chrome supports setSelectionRange
                    else {
                        element.val($element.val());
                    }
                }
            }

        };
        if (window.__DeviceInfo__ && window.__DeviceInfo__.device === "ios") {
            $(element).on("touchstart", handleFocuse);
        }
        else {
            $(element).on("focus", handleFocuse);
        }

        $(element).on("blur", handleBlur);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function (el) {
            if (handel) {
                clearTimeout(handel);
                handel = undefined;
            }
            if (window.__DeviceInfo__ && window.__DeviceInfo__.device === "ios") {
                $(element).off("touchstart", handleFocuse);
                $(element).off("touchend", handleBlur);
            }
            else {
                $(element).off("focus", handleFocuse);
                $(element).off("blur", handleBlur);
            }

        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    }
}

ko.bindingHandlers["autoTextFlowDirection"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        function isRtlVal(str) {
            if (str.length > 0) {
                var arabic = /[\u0600-\u06FF]/;
                var hebrew = /[\u0590-\u05FF]/;
                if (str.search(arabic) >= 0 || str.search(hebrew) >= 0  ) {
                    return true;
                }
            }
            return false;
        }
        $(element).keyup(function (e) {
           if (isRtlVal($(element).val())) {
               $(element).css('direction', 'rtl');
           }
           else {
               $(element).css('direction', 'ltr');
           }
        }); 
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    }
}


ko.bindingHandlers["scrollToView"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var val = valueAccessor();

        if (ko.unwrap(val)) {
            setTimeout(function () {
                var $el = $(element).parent();
                var found = false;
                for (var i = 0; i < 10 && $el; i++) {
                    var eclass = $el.attr("class");
                    if (eclass && eclass.indexOf("horizontal-scroll") != -1) {
                        found = true;
                        break;
                    }
                    else {
                        $el = $el.parent();
                    }
                }

                if (found) {
                    var offset = $(element).position();
                    //$el.animate({
                    //    scrollLeft: offset.left,
                    //    scrollTop: offset.top
                    //});
                    $el.scrollLeft($el[0].scrollWidth + offset.left - $el.width() - $(element).width() / 2);
                }
                // This dosnt works yet. need to find another way.
                //$(element)[0].scrollIntoView();
            }, 50);
        }
        else {
        }
    }
}


ko.bindingHandlers["collapse"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var val = valueAccessor();

        if (ko.unwrap(val)) {
            $(element).show()
        }
        else {
            $(element).hide()
        }
    }
}

ko.bindingHandlers["commitPostRequest"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        //$(element).insertBefore()
        var text = valueAccessor().text;

        if (!text) {
            text = "";
        }

        var $loadingElement = $("<div style=\"left: 50%; top: 50%; bottom: 0px; display: block; position: absolute;\"><div style=\"margin-left: -50%;text-align:center\"><img src=\"themes/img/loading_ani.gif\" style=\"display:block;margin:auto\" />" + text + "</div></div>").insertAfter($(element));
        $loadingElement.hide();

        element.startLoading = function () {
            $loadingElement.show();
        }
        element.endLoading = function () {
            $loadingElement.hide();
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var param = valueAccessor();
        
        var url = ko.unwrap(param.url);
        var data = ko.unwrap(param.data);
        var objectToInject = ko.unwrap(param.objectToInject);

        if (url !== undefined && data !== undefined) {
            ServiceHelper.postNewWinodw(url, data, objectToInject, element, function () {
                element.startLoading();
            }, function () {
                element.endLoading();
            });
        }
    }
}

ko.bindingHandlers["fade"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);

        var val = ko.unwrap(valueAccessor());
        var fadeIn = false;
        var fadeOut = false;

        if (_.isBoolean(val)) {
            fadeIn = val;
            fadeOut = !val;
        }
        else {
            fadeIn = ko.unwrap(val["in"]);
            fadeOut = ko.unwrap(val.out);
        }
        var shouldDisplay = ko.observable(false);
        $el.data("fade-in-data", { init: false, shouldDisplay: shouldDisplay });

        var res = ko.bindingHandlers["if"].init(element, function () { return shouldDisplay; }, allBindingsAccessor, viewModel, bindingContext);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function (el) {
            var $el = $(el);
            $el.detach();
            el.isDesposed = true;
        });

        return res;
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);

        var val = ko.unwrap(valueAccessor());
        var fadeIn = false;
        var fadeOut = false;

        var data = $el.data("fade-in-data");

        if (_.isBoolean(val)) {
            fadeIn = val;
            fadeOut = !val;
        }
        else {
            fadeIn = ko.unwrap(val["in"]);
            fadeOut = ko.unwrap(val.out);
        }

        if (fadeOut && data.init) {
            //data.fadeIn = false;
            $el.stop();
            $el.fadeOut(function () {
                if (!element.isDesposed) {
                    //ko.bindingHandlers["if"].update(element, function () { return false; }, allBindingsAccessor, viewModel, bindingContext);
                    data.shouldDisplay(false);
                }
                else {
                    ko.cleanNode(element);
                }
            });
        }
        else if (fadeIn) {
            if (!element.isDesposed) {
                //ko.bindingHandlers["if"].update(element, function () { return true; }, allBindingsAccessor, viewModel, bindingContext);
                data.shouldDisplay(true);
            }
            $el.stop();
            $el.hide();
            $el.fadeIn(function () {

                if (element.isDesposed) {
                    ko.cleanNode(element);
                }
            });
        }
        else if (!data.init) {
            //ko.bindingHandlers["if"].update(element, function () { return false; }, allBindingsAccessor, viewModel, bindingContext);
            data.shouldDisplay(false);
        }

        data.init = true;
    }
}

var defferTemplateCache = {
    serverCacheVersionNumber: "0.0.0",
    useServerCache: false,
    cache: {},
    loadedSrc: {},
    onApplyTemplateGlobalHandler: function (element) {

    },
    getCacheItem: function (id) {
        var that = defferTemplateCache;
        var item = that.cache[id];

        if (!item) {
            item = that.cache[id] = {
                isLoaded: false,
                requests: [],
                load: undefined
            };
        }

        return item;
    },
    waitForTemplate: function (id, func) {
        var that = defferTemplateCache;
        var item = that.getCacheItem(id);

        item.requests.push(func);
    },
    tempalteIsReady: function (id) {
        var item = defferTemplateCache.getCacheItem(id);
        if (item) {
            item.isLoaded = true;

            for (var i in item.requests) {
                item.requests[i]();
            }
        }
    },  
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var that = defferTemplateCache;
        var val = valueAccessor();
        var src = undefined;
        var activate = undefined;
        var wasActivated = false;
        var deactivate = undefined;
        var $el = $(element);

        // Using Src property insted of content as an src.
        if (_.isObject(val)) {
            src = val.src;
            activate = val.activate;
            deactivate = val.deactivate;
        }
        else {
            src = val;
        }

        if (that.loadedSrc[src]) {
            if (that.loadedSrc[src].isLoaded) {
                executeInclude(that.loadedSrc[src].html, "url: " + src);
            }
            else {
                that.loadedSrc[src].subscribers.push(executeInclude);
            }
            return;
        }

        that.loadedSrc[src] = {
            isLoaded: false,
            subscribers: [executeInclude],
            key:"",
            html: ""
        }

        ko.utils.domNodeDisposal.addDisposeCallback(element, function (el) {
            if (wasActivated) {
                if (deactivate) {
                    deactivate.apply(viewModel);
                }
            }
        });
        var noCacheString = Date.now();

        if (defferTemplateCache.useServerCache) {
            noCacheString = defferTemplateCache.serverCacheVersionNumber;
        }

        $.ajax({
            contentType: "text/plain",
            dataType: "text",
            url: src + "?no-cach=" + noCacheString,
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader('X-Requested-With', { toString: function () { return ''; } });
            //},
            // 'xhr' option overrides jQuery's default
            // factory for the XMLHttpRequest object.
            // Use either in global settings or individual call as shown here.
            xhr: function () {
                // Get new xhr object using default factory
                var xhr = jQuery.ajaxSettings.xhr();
                // Copy the browser's native setRequestHeader method
                var setRequestHeader = xhr.setRequestHeader;
                // Replace with a wrapper
                xhr.setRequestHeader = function (name, value) {
                    // Ignore the X-Requested-With header
                    if (name == 'X-Requested-With') return;
                    // Otherwise call the native setRequestHeader method
                    // Note: setRequestHeader requires its 'this' to be the xhr object,
                    // which is what 'this' is here when executed.
                    setRequestHeader.call(this, name, value);
                }
                // pass it on to jQuery
                return xhr;
            },
            method: "get",
            success: function (res) {
                that.loadedSrc[src].key = src;
                that.loadedSrc[src].isLoaded = true;
                that.loadedSrc[src].html = res;

                riseSubscribers(that.loadedSrc[src]);
            },
            error: function (err) {
                app.log("The page \"" + valueAccessor.src + "\" could not be loaded.:\r\n" + err);
            }
        });

        function executeInclude(html, htmlInfo) {
            var content = $("<div></div>");
            if (htmlInfo !== undefined) {
                html = "<span style=\"display:none\">page include info: " + htmlInfo + "</span>" + html;
            }

            content.html(html);

            content.find("script[type='text/template']").each(function () {
                var $this = $(this);
                var id = $this.attr("id");
                var item = that.getCacheItem(id);
                if (item) {
                    item.isLoaded = true;

                    $this.remove();
                    if ($("#" + id).length === 0) {
                        $("head").append($this);
                    }

                    for (var i in item.requests) {
                        item.requests[i]();
                    }
                }
            });

            if (activate) {
                activate.apply(viewModel);
            }
            wasActivated = true;

            ko.applyBindingsToDescendants(viewModel, content.get(0));

            //for (var i = 0; i < content.get(0).childNodes.length; i++) {
            while (content.get(0).childNodes.length > 0) {
                $el.parent().get(0).insertBefore(content.get(0).childNodes[0], $el.get(0));
            }

            if (that.onApplyTemplateGlobalHandler) {
                that.onApplyTemplateGlobalHandler($el.parent());
            }
            
            $el.remove();
        }

        function riseSubscribers(source) {
            for (var i = 0; i < source.subscribers.length; i++) {
                source.subscribers[i](source.html, "url: " + source.key);
            }

            that.loadedSrc[src].subscribers.length = 0;
        }

        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    }
}

ko.bindingHandlers["include"] = defferTemplateCache;

ko.bindingHandlers["defferTemplate"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers["template"].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        var templateId = ko.unwrap(valueAccessor().name);

        var cacheItem = defferTemplateCache.cache[templateId];

        if (cacheItem && cacheItem.isLoaded) {
            ko.bindingHandlers["template"].update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        }
        else {
            defferTemplateCache.waitForTemplate(templateId, function () {
                ko.bindingHandlers["template"].update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            });
        }        
    }
}

ko.virtualElements.allowedBindings.defferTemplate = true;

ko.bindingHandlers["contextScript"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        //alert(element.innerText);
        var func = valueAccessor();

        var funcStr = "var func = " + func.toString() + "; func();";

        var newFunc = new Function("$context", "$data", funcStr);

        newFunc(bindingContext, viewModel);
        //alert(valueAccessor);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    }
}

ko.virtualElements.allowedBindings.contextScript = true;


ko.bindingHandlers["includeScript"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        //debugger;
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        //debugger;
        if (!document.getElementById(valueAccessor().id)) {
            var newScript = $("<script src=\"" + valueAccessor().src + "\" id=\"" + valueAccessor().id + "\"></script>");
            $("document").append(newScript);

            var noCacheString = Date.now();

            if (defferTemplateCache.useServerCache) {
                noCacheString = defferTemplateCache.serverCacheVersionNumber;
            }

            $.ajax({
                contentType: "text/html",
                dataType: "text",
                url: valueAccessor().src + "?no-cach=" + noCacheString,
                method: "get",
                success: function (res) {
                    eval(res);
                },
                error: function (err) {
                    app.log("The script \"" + valueAccessor.src + "\" could not be loaded.:\r\n" + err);
                }
            });
            //ServiceHelper.getPromise(valueAccessor().src).then(function (s) {
            //    eval(s);
            //});
        }
    }
}

function fixElementSize(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var $el = $(element);
    var marginCss = valueAccessor().marginCss;

    element.reSizeFunction = sizeChanged;
    element.IsEnabled = false;
    element.maxTrys = 10;
    element.maxFails = 10;


    function disposeFixElementSize(el) {
        var $el = $(el);
        //$el.detach();
        $(window).off("resize", sizeChanged);
    }

    ko.utils.domNodeDisposal.addDisposeCallback(element, disposeFixElementSize);


    function sizeChanged() {
        var updateWidth = true;
        var updateHeight = true;
        var marginRight = ko.unwrap(valueAccessor().marginRight);
        var newSizeWidth, newSizeHeight;

        if (marginCss) {
            var estimationElement = $("<div style=\"position:absolute;visibility:hidden;z-index:0\" class=\"" + marginCss + "\"></div>");

            $("body").append(estimationElement);
            //estimationElement.css("margin-left");
            marginRight = estimationElement.css("margin-right") || marginRight;
            marginRight = parseFloat(marginRight.toString().replace("px", ""));
            //estimationElement.css("margin-top");
            marginBottom = estimationElement.css("margin-bottom") || marginBottom;
            marginBottom = parseFloat(marginBottom.toString().replace("px", ""));

            estimationElement.remove();
        }

        if (marginRight === undefined) {
            marginRight = 0;
            updateWidth = false;
        }

        var marginBottom = ko.unwrap(valueAccessor().marginBottom);
        if (marginBottom === undefined) {
            marginBottom = 0;
            updateHeight = false;
        }

        if (valueAccessor().relativeToWindow) {
            if (updateWidth) {
                newSizeWidth = $(document).width() - marginRight;
            }
            if (updateHeight) {
                newSizeHeight = $(document).height() - marginBottom;
            }
        }
        else if (valueAccessor().relativeToIframeContent && valueAccessor().iFrameId) {
            var iframe = $('#' + valueAccessor().iFrameId);
            iframe.load(function onIframeLoaded() {
                element.reSizeFunction();
            });
            var contentDocument = iframe[0].contentWindow.document;
            if (contentDocument) {
                if (updateWidth) {
                    newSizeWidth = $(document).width() - marginRight;
                }
                if (updateHeight) {
                    var deviceHeight = $(window).height() - marginBottom;
                    var contentHeight = contentDocument.body.offsetHeight;
                    if (deviceHeight > contentHeight) {
                        newSizeHeight = deviceHeight;
                    }
                    else {
                        newSizeHeight = contentHeight;
                    }
                }
            }
         
        }
        else {
            if (updateWidth) {
                newSizeWidth = $el.parent().width() - marginRight;
            }
            if (updateHeight) {
                newSizeHeight = $el.parent().height() - marginBottom;
            }
        }

        var shouldRetry = false;
        var setSizes = false;
        var waitTime = 20;

        if (element.maxTrys > 0) {
            if ((newSizeWidth < 1 && updateWidth) || (newSizeHeight < 1 && updateHeight)) {
                shouldRetry = true;
            }
        }
        else {
            setSizes = true;
            if (element.maxFails > 0) {
                waitTime = 100;
                element.maxFails--;
                shouldRetry = true;
            }
        }

        if (shouldRetry) {
            setTimeout(element.reSizeFunction, waitTime);
            element.maxTrys = element.maxTrys - 1;
        }
        else {
            setSizes = true;
        }

        if (setSizes) {
            element.maxTrys = 10;
            if (updateWidth) {
                $el.css("width", newSizeWidth + "px");
            }
            if (updateHeight) {
                $el.css("height", newSizeHeight + "px");
            }
        }
    }

    return disposeFixElementSize;
}

ko.bindingHandlers["fixSize"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        fixElementSize(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);

        if (element.IsEnabled !== ko.unwrap(valueAccessor().isEnabled)) {
            if (ko.unwrap(valueAccessor().isEnabled) === false) {
                $(window).off("resize", element.reSizeFunction);
            }
            else {
                $(window).on("resize", element.reSizeFunction);
                setTimeout(element.reSizeFunction, 20);
            }
        }

        element.IsEnabled = ko.unwrap(valueAccessor().isEnabled);
    }
}

ko.bindingHandlers["fillParent"] = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);

        element.reSizeFunction = sizeChanged;
        element.IsEnabled = false;
        element.maxTrys = 10;
        ko.utils.domNodeDisposal.addDisposeCallback(element, function (el) {
            var $el = $(el);
            //$el.detach();
            $(window).off("resize", sizeChanged);
        });

        function sizeChanged() {

            var newSizeW = $el.parent().width();
            var newSizeH = $el.parent().height()

            if ($el.parent()[0] == $("body")[0]) {
                var body = document.body,
                    html = document.documentElement;

                newSizeH = Math.max(body.scrollHeight, body.offsetHeight,
                                    html.clientHeight, html.scrollHeight, html.offsetHeight);
            }

            if ((newSizeW < 1 || newSizeH < 1) && element.maxTrys > 0) {
                setTimeout(element.reSizeFunction, 20);
                element.maxTrys = element.maxTrys - 1;
            }
            else {
                element.maxTrys = 10;
            }

            $el.css("width", newSizeW + "px");
            $el.css("height", newSizeH + "px");
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);

        if (element.IsEnabled !== ko.unwrap(valueAccessor().isEnabled)) {
            if (ko.unwrap(valueAccessor().isEnabled) === false) {
                $(window).off("resize", element.reSizeFunction);
            }
            else {
                $(window).on("resize", element.reSizeFunction);
                setTimeout(element.reSizeFunction, 20);
            }
        }

        element.IsEnabled = ko.unwrap(valueAccessor().isEnabled);
    }
}