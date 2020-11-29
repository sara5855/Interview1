/// <reference path="../libs/jquery-1.9.1.js" />
/// <reference path="../libs/jquery.mobile-1.3.0.js" />
/// <reference path="../libs/knockout-3.0.0rc.js" />

var pageContiner = {};
var pageSourceCache = {};

var pageServerCacheVersionNumber = "0.0.0";
var pageUseServerCache = false;

var newPage = function (templateElement, valueAccessor, bindingContext, viewModel, regionInjector, headerInterceptor) {
    function runFunc(func, params) {
        if (func) {
            func.call(valueAccessor.content || viewModel, params);
        }
    }
    var animateOnReactivate = valueAccessor.animateOnReactivate;
    if (animateOnReactivate === undefined) {
        animateOnReactivate = true;
    }

    var page = {
        pageId: valueAccessor.pageId,
        $el: undefined,
        info: valueAccessor.info,
        animateOnReactivate: animateOnReactivate,
        canDeactivateConfirmed: false,
        reActivate: function (params) {
            page.canDeactivateConfirmed = false;

            if (valueAccessor.reActivate) {
                runFunc(valueAccessor.reActivate, params);
            }
            else {
                this.deactivate();
                this.activate(params);
            }
        },
        activate: function (params) {
            page.canDeactivateConfirmed = false;

            runFunc(valueAccessor.onActivate, params);

            var bindingExtend = {
                $mainMenu: ko.observable()
            };

            var extendedContext = bindingContext.extend(bindingExtend);

            var classToAddToBody = valueAccessor.shellClasses;
            if (classToAddToBody) {
                var body = $("body");
                for (var i = 0; i < classToAddToBody.length; i++) {
                    body.addClass(classToAddToBody[i]);
                }
            }

            var tempEl = $(templateElement).clone();
            tempEl.get(0).setAttribute("data-role", "page");
            tempEl.get(0).setAttribute("data-url", valueAccessor.src);

            tempEl.addClass("ui-page");
            if (!regionInjector) {
                $("body").append(tempEl);
            }
            else {
                regionInjector(tempEl);
            }

            this.$el = tempEl;
            var $contentEl = this.$el.find("[data-role=content]");

            function applyContentBinding(continer) {
                var newContext = extendedContext.createChildContext(ko.utils.unwrapObservable(valueAccessor.content), extendedContext);
                newContext.$params = params;

                ko.applyBindingsToDescendants(newContext, continer.get(0));
            }

            function loadFromSourceCache(continer) {
                ko.utils.setHtml(continer[0], "");
                var newContent = pageSourceCache[valueAccessor.src].$el.clone();

                // A fix for all scripts that uses a context script.
                // This prevent them from working before the knockout changes this to binding.
                scripts = $(newContent).find("script[context-script]");

                for (var i = 0; i < scripts.length; i++) {
                    var newScript = ko.bindingProvider.instance.preprocessNode(scripts[i]);
                    $(scripts[i]).replaceWith(newScript);
                }

                continer.append(newContent);

                //continer
                applyContentBinding(continer);
            }

            if (valueAccessor.src) {
                var shouldApplyLoadingTemplate = true;
                var contentContiner = this.$el;

                if ($contentEl && $contentEl.length != 0) {
                    contentContiner = $contentEl;
                }

                if (pageSourceCache[valueAccessor.src] && !pageSourceCache[valueAccessor.src].isLoading) {
                    // This prevents us from applying bindings Twice.
                    shouldApplyLoadingTemplate = false;
                    loadFromSourceCache(contentContiner);
                }
                else {
                    pageSourceCache[valueAccessor.src] = {
                        $el: $("<div></div>"),
                        isLoading: true
                    };

                    var noCacheString = Date.now();

                    if (pageUseServerCache) {
                        noCacheString = pageServerCacheVersionNumber;
                    }

                    $.ajax({
                        contentType: "text/html",
                        dataType: "text",
                        url: valueAccessor.src + "?no-cach=" + noCacheString,
                        method: "get",
                        success: function (res) {
                            pageSourceCache[valueAccessor.src].$el = $("<div>" + res + "</div>");
                            pageSourceCache[valueAccessor.src].isLoading = false;
                            loadFromSourceCache(contentContiner);
                        },
                        error: function (err) {
                            if (window.console) {
                                console.log("The page \"" + valueAccessor.src + "\" could not be loaded.:\r\n" + err);
                            }
                                pageSourceCache[valueAccessor.src].$el = $("<div>" + err.responseText + "</div>");
                                pageSourceCache[valueAccessor.src].isLoading = false;
                                loadFromSourceCache(contentContiner);
                        }
                    });
                }

                // If the content is by src, we can have a loading dialog using this function.
                if (shouldApplyLoadingTemplate) {
                    applyContentBinding(this.$el);
                }
            }
            else {
                // If the content is by src, we can have a loading dialog using this function.
                applyContentBinding(this.$el);
            }

            var headerContent = valueAccessor.headerContent;
            var panelContent = valueAccessor.panelContent;

            var $footerElement = this.$el.find("[data-role='footer']");
            if ($footerElement.length) {
                $footerElement.addClass("pageBottomFooter");
                $contentEl.addClass("pageHasFooter");
                //var footerContext = extendedContext.createChildContext(ko.utils.unwrapObservable(headerContent), extendedContext);
                //ko.applyBindingsToDescendants(footerContext, $footerElement[0]);
            }
            
            if (panelContent && panelContent.key) {
                //var panelContext = new ko.bindingContext(ko.utils.unwrapObservable(panelContent), extendedContext);
                var panelContext = extendedContext.createChildContext(ko.utils.unwrapObservable(panelContent), extendedContext);
                var panelContiner = $("<div data-role=\"panel\" data-position=\"right\" data-theme=\"b\" data-display=\"overlay\"></div>");

                ko.renderTemplate(panelContent.key, panelContext, undefined, panelContiner.get(0), undefined);
                panelContiner.insertBefore(tempEl.children()[0]);
                bindingExtend.$mainMenu(panelContiner);
            }

            if (headerContent && headerContent.key) {

                //var headerContext = (new ko.bindingContext(ko.utils.unwrapObservable(headerContent), extendedContext));
                var headerContext = extendedContext.createChildContext(ko.utils.unwrapObservable(headerContent), extendedContext);
                var headerContiner = $("<div data-role=\"header\" class=\"page-header\"></div>");
                ko.renderTemplate(headerContent.key, headerContext, undefined, headerContiner.get(0), undefined);
                headerContiner.insertBefore($contentEl);
            }
        },

        canDeactivate: function (e) {
            if (valueAccessor.canDeactivate) {
                return valueAccessor.canDeactivate.call(valueAccessor.content || viewModel, e);
            }
            return true;
        },

        deactivate: function () {
            var $elToClean = this.$el;
            this.$el = undefined;

            page.canDeactivateConfirmed = false;

            ko.utils.setHtml($elToClean.get(0), "");
            ko.utils.domNodeDisposal.addDisposeCallback($elToClean.get(0), function () {
                $elToClean.detach();
            });
            runFunc(valueAccessor.onDeactivate);
            ko.cleanNode($elToClean.get(0));

            var classToRemoveToBody = valueAccessor.shellClasses;
            if (classToRemoveToBody) {
                var body = $("body");
                for (var i = 0; i < classToRemoveToBody.length; i++) {
                    body.removeClass(classToRemoveToBody[i]);
                }
            }
        }
    };

    return page;
};