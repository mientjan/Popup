var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Events = (function () {
    function Events() { }
    Events.prototype.addEvent = function (name, fn) {
        if(!this._events[name]) {
            this._events[name] = new Array();
        }
        this._events[name].push(fn);
    };
    Events.prototype.fireEvent = function (name, data) {
        if(this._events[name]) {
            for(var i = 0, l = this._events[name].length; i < l; ++i) {
                this._events[name][i].call(null, data);
            }
        }
    };
    Events.prototype.removeEvents = function (name) {
        if(this._events[name]) {
            this._events[name].length = 0;
        }
    };
    return Events;
})();
var UID = Date.now();
String.prototype.uniqueID = function () {
    return (UID++).toString(36);
};
(function (Object) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    Object.prototype.keys = function (object) {
        var keys = [];
        for(var key in object) {
            if(hasOwnProperty.call(object, key)) {
                keys.push(key);
            }
        }
        return keys;
    } , Object.prototype.values = function (object) {
        var values = [];
        for(var key in object) {
            if(hasOwnProperty.call(object, key)) {
                values.push(object[key]);
            }
        }
        return values;
    };
    Object.prototype.getLength = function (object) {
        return Object.keys(object).length;
    };
})(Object);
var Popup = (function (_super) {
    __extends(Popup, _super);
    function Popup(url, options) {
        _super.call(this);
        this.url = url;
        this.options = options;
        this.reference = -1;
        if(this.options.name == '') {
            this.options.name = String.uniqueID();
        }
    }
    Popup.count = 0;
    Popup.reference = [];
    Popup.events = {
    };
    Popup.closeInterval = 0;
    Popup.add = function add(popup) {
        popup.reference = Popup.count;
        this.reference[Popup.count] = popup;
        ++Popup.count;
    }
    Popup.remove = function remove(popup) {
        delete (Popup.reference[popup.reference]);
    }
    Popup.fireEvent = function fireEvent(name, data) {
        if(!this.events[name]) {
            this.events[name] = [];
        }
        this._events[name].push(data);
    }
    Popup.hasEvents = function hasEvents() {
        var has = false;
        if(Object.getLength(this._events) > 0) {
            Object.each(this._events, function (name, events) {
                if(events.length > 0) {
                    has = true;
                }
            });
        }
        return has;
    }
    Popup.close = function close() {
        if(this.hasEvents()) {
            this._closeInterval = (function () {
                if(this.hasEvents()) {
                    clearInterval(this._closeInterval);
                    window.close();
                }
            }).periodical(200, this);
        } else {
            window.close();
        }
    }
    return Popup;
})(Events);
var PopupOptions = (function () {
    function PopupOptions() {
        this.name = '';
        this.status = false;
        this.toolbar = false;
        this.location = false;
        this.menubar = false;
        this.directories = false;
        this.resizable = false;
        this.scrollbars = false;
        this.height = 500;
        this.width = 500;
    }
    return PopupOptions;
})();
