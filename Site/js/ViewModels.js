var Item = function (data) {
    this.id = ko.observable(data.id);
    this.title = ko.observable(data.title);
    this.totalAmount = ko.observable(data.totalAmount);
    this.editDoc =
        function () {
           location.hash = "document/new/" + this.id();
        };
}
app.rootVM = {
    userInfo:ko.observable(),
    isLoggedIn: ko.observable(),

    mainVm: {},

    
    documentsVm: (function () {
        
        var vm = {
            items: ko.observableArray([]),
            previous : ko.observable(),
            next: ko.observable(),
            hasNext: ko.observable(),
            hasPrevious: ko.observable(),
            totalPages: ko.observable(),
            pageNumber: ko.observable(0),
            nbPerPage: 5,
            Doc :function(data) {
                this.id = ko.observable(data.id);
                this.title = ko.observable(data.title);
                this.totalAmount = ko.observable(data.totalAmount);
            },
            loadDocs: function () {
                //app.rootVM.infoDialogVM.startLoading("Loading Data....");
                ServiceHelper.get("https://c4f76210-c71c-4b13-9e89-30c0eb0924ce.mock.pstmn.io/documents",false, function (data) {
                    vm.docs = ko.observableArray(data.documents.map(function (item) { return new Item(item); }));
                    //app.rootVM.infoDialogVM.stopLoading("Loading Data....");
                 }
                );
            },

        };
        var data = [
            { id: 1, title: "doc1", totalAmount: 15 },
            { id: 1, title: "doc1", totalAmount: 15 },

            { id: 1, title: "doc1", totalAmount: 15 },
            { id: 2, title: "doc2", totalAmount: 33 },
            { id: 3, title: "doc3", totalAmount: 44 },
            { id: 4, title: "doc4", totalAmount: 45 },
            { id: 5, title: "doc5", totalAmount: 15 },
            { id: 1, title: "doc1", totalAmount: 15 },
            { id: 1, title: "doc1", totalAmount: 15 },

            { id: 1, title: "doc1", totalAmount: 15 },
            { id: 2, title: "doc2", totalAmount: 33 },
            { id: 3, title: "doc3", totalAmount: 44 },
            { id: 4, title: "doc4", totalAmount: 45 },
            { id: 5, title: "doc5", totalAmount: 15 },
            { id: 1, title: "doc1", totalAmount: 15 },
            { id: 1, title: "doc1", totalAmount: 15 }

        ];
        vm.docs = ko.observableArray(data.map(function (item) { return new Item(item); }));
        
        vm.addDocument = function () {
            location.hash = "document/new/undefined" ;
        };
        vm.editDocument = function (docId) {
            location.hash = "document/new/" + docId;
        };
        vm.items = ko.computed(function () {
            var first = vm.pageNumber() * vm.nbPerPage;
            return vm.docs.slice(first, first + vm.nbPerPage);
        });

        vm.totalPages = ko.computed(function () {
            var div = Math.floor(vm.docs().length / vm.nbPerPage);
            div += vm.docs().length % vm.nbPerPage > 0 ? 1 : 0;
            return div - 1;
        });

        vm.hasPrevious = ko.computed(function () {
            return vm.pageNumber() !== 0;
        });

        vm.hasNext = ko.computed(function () {
            return vm.pageNumber() !== vm.totalPages();
        });

        vm.next = function () {
            if (vm.pageNumber() < vm.totalPages()) {
                vm.pageNumber(vm.pageNumber() + 1);
            }
        }

        vm.previous = function () {
            if (vm.pageNumber() != 0) {
                vm.pageNumber(vm.pageNumber() - 1);
            }
        }
        vm.activate = function (activationParams) {
            vm.loadDocs();
        };
        return vm;
    })(),
    addEditVm: (function () {
        var vm = {
            id: null,
            title: '',
            totalAmount: 0
        };
        vm.activate = function (activationParams) {
            vm.id = activationParams.type;
            if (vm.id !== 'undefined') {
                vm.getDoc(id);
                
            }
        };
        vm.getDoc = function (id) {
            ServiceHelper.get("https://c4f76210-c71c-4b13-9e89-30c0eb0924ce.mock.pstmn.io/documents", { ishttps: false, id: id }, function (doc) {

                vm.title = doc.id;
                vm.totalAmount = doc.totalAmount
            }
            );
        };
        return vm;
    })(),
    examplesVm: (function(){
        var vm = {
            someText:ko.observable(),
        };

        vm.activate = function(activationParams){
            app.log("Main was activated");
            vm.someText(activationParams.message);
        };

        vm.reactivate = function(){
            app.log("Main was activated again.");
        };

        vm.deactivate = function(){
            app.log("Main was deactiveted");
        };

        vm.canDeactivate = function(canDeactivateParam){
            canDeactivateParam.confirmDeactivate();
        };

        vm.clicked = function(){
            app.log("MainVM you clicked me.")
            location.hash = "document/new/" + vm.someText();
        };

        vm.openPopup = function(){
            app.log("openPopup was clicked.")
            app.rootVM.infoDialogVM.openInfo("This is what you wrote: " + vm.someText());
        };

        vm.showLoading = function(){
            app.log("showLoading was clicked.")
            app.rootVM.infoDialogVM.startLoading("Loading for 5 sec");
            setTimeout(function(){
                app.rootVM.infoDialogVM.stopLoading("Loading for 5 sec");
            }, 5000);
        };

        return vm;
    })(),
    
    infoDialogVM: (function () {
        var loadingCount = ko.observable(0);
        var loadingParams = ko.observableArray([]);
        var currInfo = ko.observable(undefined);
        var shouldBeClosedByBackButton = ko.observable(false);
        var lastLoadingText = undefined;
        var onClose = undefined;
        var startLoadingDeley = 1500;

        var res = {
            isDefaultCloseButtonEnabled: ko.observable(true),
            isTitleCloseButtonEnabled: ko.observable(true),
            isOpen: ko.observable(false),
            type: ko.observable("info"),
            content: ko.observable("test"),
            title: ko.observable(undefined),
            commands: ko.observableArray(),

            loadingText: ko.computed(function () {
                var params = loadingParams();
                var info = ko.unwrap(currInfo);

                return (info !== undefined) ? info.text : lastLoadingText;
            }),
            isLoading: ko.computed(function () {
                return ko.unwrap(currInfo) !== undefined;
            }),
            startLoading: function (text, isAsync) {

                if (isAsync === undefined) {
                    isAsync = false;
                }

                if (!text) {
                    text = localize("loading");
                }
                
                var loadingObject = {
                    text: text,
                };

                if (startLoadingDeley > 0 && isAsync) {
                    loadingObject.show = false;
                    var handler = setTimeout(function () {

                        loadingObject.handler = undefined;
                        currInfo(loadingObject);
                    }, startLoadingDeley);

                    loadingObject.handler = handler;
                }
                else {
                    currInfo(loadingObject);
                }

                loadingParams.push(loadingObject);
            },
            closeDialog: function () {
                this.isOpen(false);
            },
            stopLoading: function (text) {
                var removedObject = undefined;
                var params = loadingParams();

                if (params.length) {

                    lastLoadingText = params[0].text;

                    if (!text) {
                        removedObject = loadingParams.pop();
                    }
                    else {
                        var foundItem = undefined;

                        for (var i = 0; i < params.length; i++) {
                            if (params[i].text == text) {
                                foundItem = params[i];
                                break;
                            }
                        }

                        if (foundItem) {
                            removedObject = foundItem;
                            loadingParams.remove(foundItem);
                        }
                        else {
                            removedObject = loadingParams.pop();
                        }
                    }

                    if (removedObject && removedObject.handler) {
                        clearTimeout(removedObject.handler);
                        removedObject.handler = undefined;
                    }

                    currInfo(params[params.length - 1]);
                }
                else {
                    currInfo(undefined);
                }
            },
            stopAllLoading: function () {
                if (loadingParams().length) {
                    var params = loadingParams();
                    for (var i = 0; i < params.length; i++) {
                        if (params[i].handler) {
                            clearTimeout(params[i].handler);
                            params[i].handler = undefined;
                        }
                    }
                    lastLoadingText = loadingParams()[0].text;
                }                
                loadingParams([]);
                currInfo(undefined);
            },
            confirm: function (text, title) {
                var that = this;
                var p = ServiceHelper.newPromise();
                this.openInfo(text, title, [{ text: localize("ok"), autoClose: true, action: function () { p.resolve(); } }, { isDanger: true, text: localize("main:cancel"), autoClose: true, action: function () { p.reject(); } }], undefined, false, false)
                return p;
            },
            open: function (content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {
                this.isOpen(true);
                this.content(content);
                this.title(title);

                _.forEach(commands, function (c) {
                    if (!_.has(c, 'autoClose'))
                        c.autoClose = true;
                });

                this.commands(commands);

                if (isDefaultCloseButtonEnabled === false) {
                    this.isDefaultCloseButtonEnabled(false);
                }
                else {
                    this.isDefaultCloseButtonEnabled(true);
                }

                this.isTitleCloseButtonEnabled(isTitleCloseButtonEnabled);
            },           
            openType: function (type, content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {

                var args = {
                    type: type,
                    content: content,
                    title: title,
                    commands: commands,
                    onCloseFunction: onCloseFunction,
                    isDefaultCloseButtonEnabled: isDefaultCloseButtonEnabled,
                    isTitleCloseButtonEnabled: isTitleCloseButtonEnabled
                };

                // This will allow to have overload when we get 1 params object or all the parameters.
                if (arguments.length === 1 && typeof(type) === "object") {
                    args = type;
                }

                onClose = args.onCloseFunction;
                this.type(args.type);

                if (args.isTitleCloseButtonEnabled == undefined) {
                    args.isTitleCloseButtonEnabled = true;
                }

                this.open(args.content, args.title, args.commands, args.isDefaultCloseButtonEnabled, args.isTitleCloseButtonEnabled);
            },

            openSync: function (content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled, type) {
                onClose = onCloseFunction;
                var p = ServiceHelper.newPromise();

                var rejectCommand = { isDanger: true, text: localize("main:cancel"), autoClose: true, action: function () { p.reject(); } };

                var promiseCommands = _.map(commands, function (c) {
                    if (!_.has(c, 'action'))
                        c.action = function () {
                            p.resolve(c.action);
                        };
                    return c;
                });
                if (isDefaultCloseButtonEnabled) {
                    promiseCommands = _.isArray(promiseCommands) ? promiseCommands.concat(rejectCommand) : [rejectCommand];
                }
                if (type === 'info')
                    this.openInfo(content, title, promiseCommands, onClose, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled);
                else if (type === 'error')
                    this.openError(content, title, promiseCommands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled, onClose);
                else
                    this.open(content, title, promiseCommands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled);
                return p;
            },

            openInfoSync: function (content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {
                return this.openSync(content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled, 'info');
            },
            openInfo: function (content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {
                onClose = onCloseFunction;
                this.type("info");
                this.open(content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled);
            },
            openErrorSync: function (content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {
                return this.openSync(content, title, commands, onCloseFunction, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled, 'error');
            },
            openError: function (content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled, onCloseFunction) {
                onClose = onCloseFunction;
                this.type("error");
                this.open(content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled);
            },
            openInfoWithOkDialog: function (content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {
                if (commands === undefined)
                    commands = [];
                commands.push({
                    text: localize('ok'),
                    action: function () { }
                }
                );
                this.openInfo(content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled);
            },
            openErrorWithOkDialog: function (content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled) {
                if (commands === undefined)
                    commands = [];
                commands.push({
                    text: localize('ok'),
                    action: function () { }
                }
                );
                this.openError(content, title, commands, isDefaultCloseButtonEnabled, isTitleCloseButtonEnabled);
            },
        };

        res.isOpen.subscribe(function (isOpened) {

            // Call On Close
            if (isOpened === false && onClose) {
                onClose();
                onClose = undefined;
            }
        });

        return res;
    })(),
    
    moduleDeactivated: function () { },
    moduleActivated: function () { }
};