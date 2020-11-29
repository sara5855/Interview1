/// <reference path="Application.js" />

Application.startup_log("ExtendedApplication.js: Starting to load.", true);

function ExtendedApplication(version, isDevelopment){
    var app = Application();

    app.version = version;
    app.isDevelopment = isDevelopment;

    defferTemplateCache.serverCacheVersionNumber = app.version;
    defferTemplateCache.useServerCache = !app.isDevelopment;
    pageServerCacheVersionNumber = app.version;
    pageUseServerCache = !app.isDevelopment;

    app = _.extend(app, (function (app) {
        var that = {
            isLoggedin:function(){
                return loginState();
            },     
            moveToPageWhenLogedin: moveToPageWhenLogedin,
            moveToPageWhenLogedinAndAuthorized: moveToPageWhenLogedinAndAuthorized,
            ViewModels: {},
            login: login,
            logout: logout,
            setUser: setUser,
            getUser: getUser,
            isUserAuthorizedForRole: isUserAuthorizedForRole,
            reboot: function (rebootToHash) {
                app.startReboot(rebootToHash);

                // First thing we must do is to verify that the user is Loged in. 
                // else, we should rise logIn dialog.
                retriveCurrentLogedInUser(function () {
                    loginState(true)
                    app.endReboot();
                }, function () {
                    loginState(false)
                    app.endReboot();
                });
            }
        };

        // default behaivior for moving to page when logged in if the user is loogedin.
        app.onUserLoggedinOnMovePage = function () {
            app.moveToPage.apply(this, arguments);
        };

        app.commitLogin= function (success, faild) { success(); };
        app.commitLogout= function (success, faild) { success(); };
        app.commitRetriveCurrentLogedInUser = function (success, faild) { success({}); };
        //We have same function on app in bootstraper, so it's dangerous it to twice
        app.onUserIsSet= function (oldUser, newUser) { };
        app.onUserNotLoggedinOnMovePage= function () { };
        
        // This function is called when athuntications is expired.
        // It returns true if the application should commit reboot because of it.
        app.onAthunticationExpires = function (error) { return false; };

        var userInfo = undefined;

        ServiceHelper.onAthunticationExpires = function (error) {
            var wasHandled = false;
            if (loginState()) {
                var shouldReboot = app.onAthunticationExpires(error);
              
                if (shouldReboot) {
                    loginState(false);
                    app.reboot();
                    wasHandled = true;
                }
            }

            return wasHandled;
        }

 
        function loginState(loggedIn) {
            if (loggedIn === undefined) {

                return app.rootVM.isLoggedIn();
            }
            else {
                app.rootVM.isLoggedIn(loggedIn);
            }
        }

        function getUser() {
            return userInfo;
        }

        function setUser(user) {

            var oldUser = userInfo;
            app.rootVM.userInfo(user);
            userInfo = user;
            app.onUserIsSet(oldUser, userInfo);
        };

        function isUserAuthorizedForRole(sbrole) {
            if (userInfo.userSubscriptionDetails && userInfo.userSubscriptionDetails.authorizations) {
                var valid = _.filter(userInfo.userSubscriptionDetails.authorizations, function (a) {
                    return a.isPaying || moment(a.validEndDate) >= moment();
                });
                var isAuthorized = _.contains(_.map(valid, function (a) { return a.role; }), sbrole);
                return isAuthorized;
            }
            return false;
        };

        function clearUser() {
            app.rootVM.userInfo(undefined);
        
            userInfo = undefined;
        };

        function login(loginData, success, faild) {
            app.commitLogin(loginData, function(){
                loginState(true);

                retriveCurrentLogedInUser(function(){
                    if (success){
                        success();
                    }

                    Backbone.history.forceLoadUrl();
                },
                function(err){
                    if (faild){
                        faild(err);
                    }
                    loginState(false)
                });
            }, function(err){
                if (faild){
                    faild(err);
                }

                loginState(false)
            });
        }

        function logout() {
            app.commitLogout(function () {
                loginState(false);
                app.reboot("");
            },
            function () {
                if (window.console) {
                    window.console.warn("Faild to logout!");
                }
                app.reboot("");
            });
        };

        function moveToPageWhenLogedinAndAuthorized(toCheckRole) {
            var args = Array.prototype.slice.call(arguments, 1);
            app.services.userService.isAuthorizedForRole(toCheckRole).then(function () {
                moveToPageWhenLogedin.apply(this, args);
            });

        };

        function moveToPageWhenLogedin() {
            if (loginState()) {
            
                if (app.onUserLoggedinOnMovePage) {
                    app.onUserLoggedinOnMovePage.apply(this, arguments);
                }

                return true;
            }
            else {
                app.onUserNotLoggedinOnMovePage.apply(this, arguments);
            }
            return false;
        };

        function retriveCurrentLogedInUser(success, failed) {
            clearUser();

            app.commitRetriveCurrentLogedInUser(function (loginInfo) {
                setUser(loginInfo);

                if (success) {
                    success();
                }
            }, function (err) {
                if (failed) {
                    failed(err);
                }
            });
        }
    
        return that;
    })(app));

    return app;
};

Application.startup_log("ExtendedApplication.js: finished loading.", true);