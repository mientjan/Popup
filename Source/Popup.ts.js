var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
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
var UID = Date.now();
function uniqueID() {
    return (++UID).toString(UID);
}
var EventDispatcher = (function () {
    function EventDispatcher() {
        this._events = {
        };
    }
    EventDispatcher.prototype.addEvent = function (name, fn) {
        if(!this._events[name]) {
            this._events[name] = new Array();
        }
        this._events[name].push(fn);
    };
    EventDispatcher.prototype.fireEvent = function (name, data) {
        if(this._events[name]) {
            for(var i = 0, l = this._events[name].length; i < l; ++i) {
                this._events[name][i].call(null, data);
            }
        }
    };
    EventDispatcher.prototype.removeEvents = function (name) {
        if(this._events[name]) {
            this._events[name].length = 0;
        }
    };
    EventDispatcher.prototype.removeEvent = function (name, fn) {
        if(this._events[name]) {
            for(var i = 0, l = this._events[name].length; i < l; ++i) {
                if(this._events[name][i] === fn) {
                    this._events[name].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };
    return EventDispatcher;
})();
var Popup = (function (_super) {
    __extends(Popup, _super);
    function Popup(url, options) {
        _super.call(this);
        this.url = url;
        this.options = options;
        this.reference = -1;
        this.callbackInterval = -1;
        this.window = null;
        this.options = null;
    }
    Popup.prototype.set = function (k, v) {
        if(typeof (this.options[k]) !== 'undefined') {
            this.options[k] = v;
            if(k === 'x' || k === 'y') {
            }
        }
        return this;
    };
    Popup.prototype.get = function (k) {
        if(typeof (this.options[k]) !== 'undefined') {
            return this.options[k];
        }
        return false;
    };
    Popup.prototype.open = function () {
        if(this.window !== null) {
            clearInterval(this.callbackInterval);
        }
        var params = [];
        var value = '';

        for(var name in this.options) {
            if(this.options.hasOwnProperty(name)) {
                value = this.options[name];
                if(name == 'x' || name == 'y' || name == 'name') {
                    return;
                }
                if(name == 'width' || name == 'height') {
                    value = parseInt(value) + 'px';
                }
                params.push(name + '=' + value);
            }
        }
        this.window = window.open(this.url, this.options.name, params.join(','));
    };
    Popup.prototype.moveTo = function (x, y) {
        if (typeof x === "undefined") { x = null; }
        if (typeof y === "undefined") { y = null; }
        if(typeof (x) == 'string') {
            switch(x) {
                case 'center': {
                    x = (window.screen.width - this.get('width')) / 2;
                    break;
                }

                case 'left': {
                    x = 0;
                    break;
                }

                case 'right': {
                    x = (window.screen.width - this.get('width'));
                    break;
                }

            }
        }
        if(typeof (y) == 'string') {
            switch(y) {
                case 'center': {
                    y = (window.screen.height - this.get('height')) / 2;
                    break;
                }

                case 'top': {
                    y = 0;
                    break;
                }

                case 'bottom': {
                    y = (window.screen.height - this.get('height'));
                    break;
                }

            }
        }
        this.set('x', parseInt(x));
        this.set('y', parseInt(y));
        if(this.window) {
            this.window.moveTo(this.get('x'), this.get('y'));
        }
    };
    Popup.prototype.close = function () {
        if(this.window === null) {
            return;
        }
        this.window.close();
        Popup.remove(this);
        this.window = null;
    };
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
        if (typeof data === "undefined") { data = null; }
        if(!this.events[name]) {
            this.events[name] = [];
        }
        this._events[name].push(data);
    }
    Popup.hasEvents = function hasEvents() {
        for(var name in this._events) {
            if(this._events.hasOwnProperty(name)) {
                if(this._events[name].length > 0) {
                    return true;
                }
            }
        }
    }
    Popup.close = function close() {
        Popup.fireEvent('closePopupWindow');
    }
    return Popup;
})(EventDispatcher);
var PopupOptions = (function () {
    function PopupOptions() {
        this.name = uniqueID();
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
