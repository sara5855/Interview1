var localizationDictionary = localizationDictionary || {};

function localize(key) {
    
    var text = localizationDictionary[key];
    if (text === undefined) {
        text = key;
        app.log("failed key localization: " + key);
    }

    return text;
}

ko.observable.fn.localize = function (prefix) {
    return ko.computed(function () {
        var key = this();
        return localize(prefix+key);
    },this);
};