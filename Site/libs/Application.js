/// <reference path="../libs_Release/knockout-3.0.0.js" />
/// <reference path="../libs/lodash.js" />
/// <reference path="../libs/backbone.js" />

function Application() {

    var startup_log = Application.startup_log;

    startup_log("Application: Starting to create the Application object", true);

    var router = undefined;

    var __pagesWaitingForChangeParams = undefined;
    var __currntChangingPage = undefined;
    var __isChangingPages = false;

    var _lastRout = location.hash;
    var isApplicationStarted = false;
    var waitForDependencies = false;

    var navigationInterceptors = [];
    var codeInitiatedNavigation = false;

    var that = {
        services: {},
        routes: {},
        routesAction: {},
        routesContexts: {},
        // The utils objects that has good functions for use :)
        utils: {
            // returns an url that is build on several parameters (in a rest format).
            url: function () {
                pathParts = [];
                pathParts.push(that.config.server);

                for (var i = 0; i < arguments.length; i++) {
                    pathParts.push(arguments[i]);
                    pathParts.push("/");
                }

                return pathParts.join("");
            }
        },

        encodeJson: function (obj) {
            return encodeURI(JSON.stringify(obj));
        },
        decodeJson: function (str) {
            return JSON.parse(decodeURI(str));
        },
        navigate: function (hash) {
            codeInitiatedNavigation = true;
            location.hash = hash;
        },
        moveToPage: moveToPage,
        currentPage: undefined,
        currPageUrl: ko.observable(""),
        currentRouteInfo: ko.observable(undefined),
        showDialog: showDialog,
        rootVM: undefined,
        exitTransition: false,
        isRebooting: false,
        startReboot: function (rebootToHash) {
            codeInitiatedNavigation = false;

            if (that.currentPage) {
                that.currentPage.deactivate();
                that.currentPage = undefined;
            }

            __pagesWaitingForChangeParams = undefined;
            __isChangingPages = false;
            __currntChangingPage = undefined;
            this.isRebooting = true;
            Backbone.history.stop();

            if (rebootToHash !== undefined) {
                window.location.hash = rebootToHash;
            }
        },
        endReboot: function () {
            Backbone.history.start();
            this.isRebooting = false;
        },
        // override this function
        reboot: function (rebootToHash) {
            that.currentPage = undefined;
            that.startReboot(rebootToHash);
            setTimeout(function () {
                that.endReboot();
            }, 1);
        },
        addRoute: function (routeKey, actionKey) {
            that.routes[routeKey] = actionKey;
        },
        extendRoutes: function (routerDef) {
            var i;
            for (i in routerDef.routes) {
                that.addRoute(i, routerDef.routes[i]);
            }

            for (i in routerDef) {
                if (i !== "route") {
                    that.addRouteAction(i, routerDef[i], routerDef);
                }
            }
        },
        addRouteAction: function (actionKey, actionFunction, context) {
            that.routesAction[actionKey] = actionFunction;
            that.routesContexts[actionKey] = context;
        },
        locationHash: ko.observable(document.location.hash),
        // Change the rout to diffrent url without affecting the real location
        manipulateLocationRout: function (rout) {
            return rout;
        },
        onApplicationStarting: function () {
        },
        dependencyIsReady: function () {
            waitForDependencies = false;
            if (!isApplicationStarted) {
                startApplication();
            }
        },
        pushNavigationInterceptor: function (interceptor) {
            navigationInterceptors.push(interceptor);
        },
        removeNavigationInterceptor: function (interceptor) {
            var interceptorPos = navigationInterceptors.indexOf(interceptor);
            if (interceptorPos != -1) {
                navigationInterceptors.splice(interceptorPos, 1);
            }
        },
        popNavigationInterceptor: function () {
            return navigationInterceptors.pop();
        }
    };

    function executeNavigationInterceptor() {
        if (navigationInterceptors.length > 0) {
            return navigationInterceptors[navigationInterceptors.length - 1]();
        }
        else {
            return false;
        }
    }

    Backbone.history.forceLoadUrl = Backbone.history.loadUrl;

    function getHashWithoutQueryString(rout) {
        if (rout) {
            var startQueryString = rout.indexOf('?');
            if (startQueryString > -1) {
                rout = rout.substring(0, startQueryString);
            }
        }

        return rout;
    }

    // This function helps us prevent from moving out of a page that can't 
    // be moved out (like forms that are still dirty and need to be saved).
    Backbone.history.loadUrl = function () {
        var tempThat = this;
        var args = arguments;
        var originalRout = args[0] || location.hash;
        var isSilentChange = (originalRout !== "#" && originalRout[1] === "@") || that.isRebooting;
        var navigateOnSilent = true;

        if (isSilentChange && !that.isRebooting) {

            var tempHash = location.hash;
            if (tempHash.length === 0 && location.toString()[location.toString().length - 1] === "#") {
                tempHash = "#";
            }

            var tempLoc = location.toString().substr(0, location.toString().length - tempHash.length) +
                "#" + originalRout.substring(2, originalRout.length);
            location.assign(tempLoc);
            originalRout = location.hash;
            if (originalRout === "") {
                originalRout = "#";
            }
        }

        var canDeactivateParam = {
            from: _lastRout,
            to: location.hash,
            currentPage: that.currentPage,
            confirmDeactivate: function () {
                if (this.currentPage !== null) {
                    this.currentPage.canDeactivateConfirmed = true;
                }
                var newHash = this.to;
                if (newHash.length > 0 && newHash[0] === "#") {
                    newHash = "#@" + newHash.substring(1);
                }
                else {
                    newHash = "#@";
                }
                codeInitiatedNavigation = true;
                Backbone.history.loadUrl(newHash);
            }
        };

        // This occures when a modal window wants to be closed when navigating without cause navigation (for back button for example).
        var isNavigationHandled = !codeInitiatedNavigation && executeNavigationInterceptor();

        // restarting this action since we want that next actions that will do navigate will not be signed as code initiated.
        codeInitiatedNavigation = false;

        if (!isNavigationHandled &&
            (!that.currentPage ||
                that.currentPage.canDeactivateConfirmed ||
                ((isSilentChange && navigateOnSilent) ||
                    (!isSilentChange && that.currentPage.canDeactivate(canDeactivateParam)))
            )) {

            _lastRout = originalRout;
            // Change the rout to diffrent url without affecting the real location
            _lastRout = manipulateLocationRout(_lastRout);

            // if we get null then we don't want to move to the new URL.
            if (_lastRout === null) {
                return true;
            }

            var tempRout = getHashWithoutQueryString(_lastRout);
            that.locationHash(tempRout);

            return Backbone.history.forceLoadUrl.call(tempThat, _lastRout);
        }
        else {
            location.assign(_lastRout);
            return true;
        }
    };

    // use this function to changed the url in a way that backbone and other macanisems will 
    // work with the new URL even thow the url is diffrent.
    // Things like security and parameters that we dont want that the other macanisems will know,
    // can be manipulated here.
    function manipulateLocationRout(url) {
        return that.manipulateLocationRout(url);
    }

    function moveToPage(page, params, transition, revese) {
        if (typeof (page) === "string") {
            page = pageContiner[page];
        }

        if (!page) {
            page = pageContiner["error"];
            params = {
                errorId: "404"
            };
        }

        if (__isChangingPages) {
            __pagesWaitingForChangeParams = {
                to: page,
                params: params,
                revese: revese,
                transition: transition
            };
            return;
        }

        if (that.currentPage === page) {
            if (page.animateOnReactivate) {

                __isChangingPages = true;

                var animate = true;

                if (_.isFunction(page.animateOnReactivate)) {
                    animate = page.animateOnReactivate();
                }
                else {
                    animate = page.animateOnReactivate;
                }

                if (animate) {

                    reActivtePageAffect(page, function () {
                        that.currPageUrl(that.locationHash());
                        that.currentPage.reActivate(params);
                    }, function () {
                        __isChangingPages = false;
                        //that.isChangingPages(__isChangingPages);
                    });
                }
            }
            else {
                setTimeout(function () {
                    that.currPageUrl(that.locationHash());
                    that.currentPage.reActivate(params);
                    // This part is importent to not stack the ability to rapidly change 
                    // and reactivate the page.
                    //setTimeout(function () {
                    //    //__isChangingPages = false;
                    //    //that.isChangingPages(__isChangingPages);
                    //}, 400);
                }, 400);
            }

            return;
        }
        else {
            __isChangingPages = true;
        }


        var oldCurrPage = that.currentPage;

        that.currentPage = undefined;

        if (page) {
            changePage(oldCurrPage, page, revese, transition, function (enterPage) {
                that.currPageUrl(that.locationHash());
                enterPage.activate(params);
                that.currentPage = enterPage;
            });
        }
        else {
            // This line causing problems on "back" button.
            //Backbone.history.navigate("error/404", true);
        }

        oldCurrPage = undefined;
    }

    function showError(errorId, errorMsg) {
        var page = pageContiner["error"];
        params = {
            errorId: errorId,
            errorMsg: errorMsg
        };

        moveToPage(page, params);
    };

    function showDialog(page, params) {
        moveToPage(page, params, "pop");
    };

    function initRouts() {
        var actions = {};

        startup_log("Application: Initing the Routes", true);

        for (var i in that.routes) {
            actions[that.routes[i]] = (function (action) {
                var actionInfo = {
                    routeKey: that.routes[i],
                    routePath: i,
                    data: action.data
                };

                // Backbone.history.handlers
                return function () {
                    that.currentRouteInfo(actionInfo);
                    var context = that.routesContexts[actionInfo.routeKey] || this;

                    if (action) {
                        if (action.action) {
                            action.action.apply(context, arguments);
                        }
                        else {
                            action.apply(context, arguments);
                        }
                    }
                };
            })(that.routesAction[that.routes[i]]);
        }

        router = new (Backbone.Router.extend(_.extend({ routes: that.routes }, actions)));
    }

    function removeHashChar(oldHash) {
        var newHash = oldHash;
        var routHashPos = newHash.indexOf("#");
        if (routHashPos !== -1) {
            newHash = newHash.substring(routHashPos + 1, newHash.length);
        }

        return newHash;
    }

    function startApplication() {
        startup_log("Application: startApplication was invoked with : waitForDependencies: " + waitForDependencies + " isApplicationStarted: " + isApplicationStarted, true);

        if (!waitForDependencies && !isApplicationStarted) {
            startup_log("Application: Application is ready to start", true);
            isApplicationStarted = true;
            initRouts();

            startup_log("Application: invokeing the onApplicationStarting", true);
            if (that.onApplicationStarting) {
                that.onApplicationStarting();
            }
            else {
                startup_log("Application: no onApplicationStarting was set.", true);
            }

            startup_log("Application: Appling binding on body", true);
            try {
                ko.applyBindings(that.rootVM, $("body").get(0));

                // Cleaning the pages.
                $("body").on("pagechange", function (e, args) {
                    if (args.options.$fromOriginalPageDefinision) {
                        args.options.$fromOriginalPageDefinision.deactivate();
                    }

                    __isChangingPages = false;
                    //that.isChangingPages(__isChangingPages);

                    if (__pagesWaitingForChangeParams) {
                        var temp = __pagesWaitingForChangeParams;
                        __pagesWaitingForChangeParams = undefined;
                        moveToPage(temp.to, temp.params, temp.reverse, temp.transition);
                    }
                });
            }
            catch (e) {
                startup_log("Application: Error on 'startApplication': " + e, true);
                startup_log("Application: Stop loading application.", true);
                return;
            }

            startup_log("Application: rebooting the application.", true);
            that.reboot();
        }
    }

    $(startApplication);

    return that;
};

Application.startup_log = function (msg, onDebugOnly) {

    if (!msg) {
        return;
    }

    msg = (onDebugOnly ? "[Debug Info] " : "") + msg;
    var clientType = "[StartupLog][client:Interview]";
    msg = clientType + msg;

    if (window.console) {
        window.console.log(msg);
    }
};

Application.startup_log("Application.js: finished loading.", true);