/// <reference path="jquery-1.9.1.js" />
ko.expendedElementTypes = ko.expendedElementTypes || {};

var StringInterpolatingBindingProvider = function () {
    this.constructor = StringInterpolatingBindingProvider;

    var expressionRegex = /{{([\s\S]+?)}}/g;

    this.preprocessNode = function (node) {
        if (node.nodeType === 3 && node.nodeValue) {
            var newNodes = replaceExpressionsInText(node.nodeValue, expressionRegex, function (expressionText) {
                return [
                    document.createComment("ko text:" + expressionText),
                    document.createComment("/ko")
                ];
            });

            // Insert the resulting nodes into the DOM and remove the original unpreprocessed node
            if (newNodes) {
                for (var i = 0; i < newNodes.length; i++) {
                    node.parentNode.insertBefore(newNodes[i], node);
                }
                node.parentNode.removeChild(node);
                return newNodes;
            }
        }
        else if (node.nodeType == 1) {
            var handler = ko.expendedElementTypes[node.nodeName.toLowerCase()];
            if (handler) {
                return handler(node);
            }
            else if (node.nodeName === "SCRIPT" && node.attributes["context-script"] !== undefined) {
                return handleContextScript(node);
            }
        }
    };

    function replaceExpressionsInText(text, expressionRegex, callback) {
        var prevIndex = expressionRegex.lastIndex = 0,
            resultNodes = null,
            match;

        // Find each expression marker, and for each one, invoke the callback
        // to get an array of nodes that should replace that part of the text
        while (match = expressionRegex.exec(text)) {
            var leadingText = text.substring(prevIndex, match.index);
            prevIndex = expressionRegex.lastIndex;
            resultNodes = resultNodes || [];

            // Preserve leading text
            if (leadingText) {
                resultNodes.push(document.createTextNode(leadingText));
            }

            resultNodes.push.apply(resultNodes, callback(match[1]));
        }

        // Preserve trailing text
        var trailingText = text.substring(prevIndex);
        if (resultNodes && trailingText) {
            resultNodes.push(document.createTextNode(trailingText));
        }

        return resultNodes;
    }
};

function convertDashedName(name) {

    var parts = name.split("-");
    for (var i = 1; i < parts.length; i++) {
        parts[i] = parts[i][0].toUpperCase() + parts[i].substring(1, parts[i].length);
    }
    name = parts.join("");
    return name;
}

function convertNodeAttrToString(node) {
    var params = ["{"];

    for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        var val = $.trim(attr.value);

        if (i > 0) {
            params.push(",");
        }

        //if (val.length === 0 || val[0] !== "{" || val[val.length - 1] !== "}") {
        //    val = "\'" + val + "\'";
        //}

        params.push(convertDashedName(attr.name));
        params.push(":");
        params.push(val);
    }
    params.push("}");
    params = params.join("");

    return params;
}

function convertNodeToBinding(node, bindName) {
    var nName = bindName || node.nodeName.toLowerCase();
    nName = convertDashedName(nName);

    var params = undefined;

    if (node.attributes.length > 0) {
        params = convertNodeAttrToString(node);
    }
    else {
        params = node.nodeValue;
    }

    if (ko.virtualElements.allowedBindings[nName]) {
        var str = "ko " + nName + ":" + params;
        var newNodes = [];
        newNodes[0] = document.createComment(str);
        node.parentNode.insertBefore(newNodes[0], node);

        newNodes[1] = document.createComment("/ko");
        node.parentNode.insertBefore(newNodes[1], node);
    }
    else {
        var newNode = $("<div data-bind=\"" + nName + ":" + params + "\"></div>");
        newNodes = [];
        newNodes[0] = newNode.get(0);
        node.parentNode.insertBefore(newNodes[0], node);
        //var str = "ko " + nName + ":" + params;
        //var newNodes = [];
        //newNodes[0] = document.createComment(str);
        //node.parentNode.insertBefore(newNodes[0], node);

        //newNodes[1] = document.createComment("/ko");
        //node.parentNode.insertBefore(newNodes[1], node);
    }

    node.parentNode.removeChild(node);
    return newNodes;
}

function convertTemplateNodeIntoTemplate(node, templateName) {
    convertTemplateNodeIntoTemplate(node, false, templateName);
}

function convertTemplateNodeIntoDefferTemplate(node, templateName) {
    convertTemplateNodeIntoTemplate(node, true, templateName);
}

function convertTemplateNodeIntoTemplate(node, isDeffer, templateName) {
    var nName = templateName || node.nodeName.toLowerCase();
    var params = convertNodeAttrToString(node);

    var template = $("<" + ((!isDeffer) ? "template" : "deffer-template") + "/>");
    template.attr("name", "'" + nName + "'");
    template.attr("data", params);

    node.parentNode.replaceChild(template.get(0), node);
    return convertNodeToBinding(template.get(0), ((!isDeffer) ? "template" : "deffer-template"));
}

function handleContextScript(node) {
    var funcText = node.innerText;
    var res = $("<span> </span>");
    res.html("<!-- ko contextScript: function() {" + funcText + "} --> <!-- /ko -->");
    return res[0];
}

// ======================
// Node extensions 
// ======================

ko.expendedElementTypes['template-html'] = function (node) {
    $el = $(node);
    var id = $el.attr("id");
    var contextScripts = $el.find("script[context-script]");

    for (var i = 0; i < contextScripts.length; i++) {
        var cs = contextScripts[i];
        var newScript = handleContextScript(cs);
        $(cs).replaceWith(newScript);
    }

    var $newTemplate = $("<script type=\"text/template\" id=\"" + id + "\">" + $el.html() + "</script>");
    $el.remove();
    $("body").append($newTemplate);

    defferTemplateCache.tempalteIsReady(id);

    return $("<span data-template-html=\"" + id + "\"></span>")[0];
}

ko.expendedElementTypes.template = convertNodeToBinding;

ko.expendedElementTypes['deffer-template'] = convertNodeToBinding;

ko.expendedElementTypes['include'] = convertNodeToBinding;

var wrapBy = function (node, beforeApplying) {

    var $node = $(node);

    //var wrapOtherElement = $node.attr("element");
    var templateName = $node.attr("by");
    var changeScope = $node.attr("change-scope") === "true";
    var data = $node.attr("data");
    var $newNode = $("<span data-info=\"node created by wrapBy. template=" + templateName + "\"></span>");

    // The external signals to the wrapper that we use apply binding here, and we still want the change-scope to work
    // even though we dont use the data attribute for the binding.
    var isDataExternal = data.trim() === "$external";
    if (isDataExternal) {
        data = undefined;
    }

    if (templateName) {
        var template = $("#" + templateName);

        if (template.length === 0) {

            var templateCache = defferTemplateCache.cache[templateName];

            if (!templateCache) {
                defferTemplateCache.waitForTemplate(templateName, function () {
                    template = $("#" + templateName);
                    applyTemplate(template);
                    var context = ko.contextFor($newNode[0]);
                    if (context) {

                        // This code retrives the data that we want to bind the wrapper by relative to the context.
                        // When the databind didnt occured yet on this element.
                        // If the data bind did occured, the "with" bind will happen.
                        if (data && data !== "") {
                            var vm = ko.bindingProvider.instance.parseBindingsString(data, context, $newNode[0]);
                            context = context.createChildContext(vm);
                        }
                        
                        ko.applyBindingsToDescendants(context, $newNode[0]);
                    }
                });
            }
        }
        else {
            applyTemplate(template);
        }
    }

    if (data) {
        $newNode.attr("data-bind", "with: " + data);
    }

    $node.replaceWith($newNode);   

    function applyTemplate(template){
        if (template.length > 0) {
            $newNode.html(template.html());
        }

        if (beforeApplying){
            beforeApplying($newNode);
        }

        var wrappedItem = $newNode.find("wrapped-item");
        
        if (wrappedItem.length > 0) {
            var $content = $("<div></div>");

            if (changeScope || (!data && !isDataExternal)) {
                $content.html(wrappedItem.html() + "\r\n" + $node.html());
            }
            else {
                $content.html("<!-- ko with:$parent -->" + wrappedItem.html() + "\r\n" +$node.html() + "<!-- /ko -->");
            }
            wrappedItem.replaceWith($content);
        }
    }

    return $newNode.get(0);
};

ko.expendedElementTypes.wrap = wrapBy;

function convertWrapByTemplateNodeIntoWrapBy(node, tName, beforeApplying) {
    var nName = tName || node.nodeName.toLowerCase();
    nName = convertDashedName(nName);

    var params = undefined;

    if (node.attributes.length > 0) {
        params = convertNodeAttrToString(node);
    }
    else {
        params = node.nodeValue;
    }

    $(node).attr("data", params);
    $(node).attr("by", nName);
    return wrapBy(node, beforeApplying);
 };

ko.expendedElementTypes['data-form'] = function (node) {

    var $node = $(node);

    var contentBlock = $node.find("content-block");
    var itemsSummery = $node.find("items-summery");
    var summery = $node.find("summery");
    var addButton = $node.find("add-button");

    contentBlock.remove();
    itemsSummery.remove();
    summery.remove();
    
    $node.attr({
        "content-block-exists": contentBlock.length !== 0,
        "item-summery-exists": itemsSummery.length !== 0,
        "summery-exists": summery.length !== 0,
        "add-button-exists": addButton.length !== 0
    });

    var newNode = convertWrapByTemplateNodeIntoWrapBy(node, undefined, function ($newNode) {
        var newContentBlock = $newNode.find("content-block");
        var newItemsSummery = $newNode.find("items-summery");
        var newSummery = $newNode.find("summery");
        var newAddButton = $newNode.find("add-button");

        newContentBlock.replaceWith(contentBlock);
        newItemsSummery.replaceWith(itemsSummery);
        newSummery.replaceWith(summery);
        if (addButton.length !== 0) {
            newAddButton.replaceWith(addButton);
        }

    });

   

    return newNode;
}

ko.expendedElementTypes.expender = function (node) {
    var $newNode = $("<div class=\"expender\"></div>");
    var $node = $(node);

    var dataBind = $node.attr("data-bind");

    var $expenderNode = $("<div></div>");
    var originalClass = $node.attr("class");
    var addHeaderFirst = true;
    $expenderNode.addClass(originalClass);


    if (($node.attr("add-header-first") || "").trim().toLowerCase() === "false") {
        addHeaderFirst = false;
    }

    $newNode.append($expenderNode);

    $node.replaceWith($newNode);

    var header = $node.children("expender-header");
    if (header.length > 0) {
        header.remove();

        header = $("<div class=\"expender-header\">" + header.html() + "</div>");
        $expenderNode.append(header);
    }
    else {
        var headerText = $node.attr("header");
        if (headerText) {
            header=$("<div class=\"expender-header\">" + headerText + "</div>");
            $expenderNode.append(header);
        }
        else {
            header = $("<div class=\"expender-header\">" + localize("expend-the-expender") + "</div>");
            $expenderNode.append(header);

        }
    }

    if (dataBind) {
        dataBind = "data-bind=\"" + dataBind + "\"";
    }
    else {
        dataBind = "";
    }

    var content = $("<div class=\"expender-content\" " + dataBind + ">" + $node.html() + "</div>");

    if (addHeaderFirst) {
        $expenderNode.append(content);
    }
    else {
        content.insertBefore(header);
    }

    //collapes by default
    if (($node.attr("collapsed-by-default") || "").trim().toLowerCase() === "true") {
        content.hide();
    }

    addStyle();

    content.get(0).open = function () {
        if (content.css("display") === "none") {
            toggel();
        }
    }

    content.get(0).close = function () {
        if (content.css("display") !== "none") {
            toggel();
        }
    }

    header.click(toggel);

    function toggel() {
        content.toggle();
        addStyle();

        var allBindItems = $newNode.find("[data-bind]");
        _.forEach(allBindItems, function(item) {
            if (item.reSizeFunction) {
                item.reSizeFunction();
            }
        });
    }

    function addStyle() {
        if (content.css("display") !== "none") {
            header.addClass("expender-header-expended");
            $newNode.addClass("expender-expended");
            
        }
        else {
            header.removeClass("expender-header-expended");
            $newNode.removeClass("expender-expended");
        }
    }

    return $newNode[0];
}

ko.expendedElementTypes['editable-item'] = function (e) { convertTemplateNodeIntoTemplate.call(this, e, true); };
ko.expendedElementTypes['editable-table'] = convertTemplateNodeIntoDefferTemplate;

ko.expendedElementTypes['print-manager'] = function (node) {
    var $el = $(node);
    var allElements = document.createDocumentFragment();
    var $all = $(allElements);

    //$all.append($el.html());

    var printAction = $el.find('[data-role="print-button"]');
    var printTarget = $el.find('[data-role="print-target"]');

    printAction.click(function (e) {
        printTarget[0].contentWindow.focus();
        printTarget[0].contentWindow.print();
    });

    while (node.childNodes.length > 0) {
        var child = $(node.childNodes[0]);
        child.detach();
        $all.append(child);
    }

    $all.insertAfter($el);
    $el.remove();
    return allElements;
}

// =====================
// TabControl
// =====================
ko.expendedElementTypes['tab-control'] = function (node) {
    var $el = $(node);
    var $content = $("<div></div>");
    var $header = $("<ul style='width:100%' rtl class=\"content-box-tabs\"></ul>");

    $content.html($el.html());
    $el.html("");
    $el.append($header);
    $el.append($content);

    var tabs = {};
    var headers = {};

    var currTab = undefined;

    function selectTab(key) {
        if (currTab) {
            tabs[currTab].$el.hide();
            //headers[currTab].attr("class","");
            headers[currTab].removeClass("current");
        }
        tabs[key].$el.show();
        //headers[key].attr("class", "current");
        headers[key].addClass("current");
        currTab = key;
    }

    $el.data("tabData", {
        currentTab: undefined,
        addTab: function (tab) {
            tabs[tab.id]=tab;
            var $tabHeader = $("<li class='tab-control-header' style='cursor:pointer;'></li>");
            var $tabButton = $("<a>" + (tab.header || "No Title") + "</a>");
            $tabButton.click(function () {
                selectTab(tab.id);
            });
            $tabHeader.append($tabButton);
            $header.append($tabHeader);

            headers[tab.id] = $tabButton;

            if (!currTab) {
                selectTab(tab.id);
            }
            else {
                tab.$el.hide();
            }
        }
    });    



    return node;
}

ko.expendedElementTypes['tab'] = function (node) {
    var $el = $(node);
    var tabControl = $el.parent().parent().data("tabData");

    var $node = $("<div class=\"tab-content\" style=\"display: block;\"></div>");
    $node.html($el.html());
    $el.replaceWith($node);

    tabControl.addTab({
        $el: $node,
        id:$el.attr("key"),
        header:$el.attr("header")
    });

    return $node.get(0);
}

ko.expendedElementTypes['ko'] = function (node) {
    var bindAttr = node.attributes["data-bind"];
    if (bindAttr) {
        var $node = $(node);
        var bind = node.attributes["data-bind"].value;
        var fregment = document.createDocumentFragment();
        var startKO = document.createComment("ko " + bind);
        var endKO = document.createComment("/ko");

        $(startKO).insertBefore($node);
        $(endKO).insertAfter($node);
        if ($node[0].firstChild) {
            $($node[0].firstChild).unwrap();
        }

        return startKO;
    }
    else {
        return node;
    }
}

// Setting the bindingProvider
StringInterpolatingBindingProvider.prototype = ko.bindingProvider.instance;
ko.bindingProvider.instance = new StringInterpolatingBindingProvider();