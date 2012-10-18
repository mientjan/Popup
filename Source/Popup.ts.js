var Popup = (function () {
    function Popup(url, options) {
        this.url = url;
        this._reference = -1;
        this._callbackInterval = -1;
        this._window = null;
        this._options = null;
        this._postDataBuffer = [];
        this._events = {
        };
        this._options.name = options.name || uniqueID();
        this._options.status = options.status || false;
        this._options.toolbar = options.toolbar || false;
        this._options.location = options.location || false;
        this._options.menubar = options.menubar || false;
        this._options.directories = options.directories || false;
        this._options.resizable = options.resizable || false;
        this._options.scrollbars = options.scrollbars || false;
        this._options.height = parseInt(options.height) || 500;
        this._options.width = parseInt(options.width) || 500;
        this._options.x = options.x || 0;
        this._options.y = options.y || 0;
    }
    Popup.prototype.set = function (k, v) {
        if(typeof this._options[k] !== 'undefined') {
            this._options[k] = v;
        }
        return this;
    };
    Popup.prototype.get = function (k) {
        if(typeof this._options[k] !== 'undefined') {
            return this._options[k];
        }
        return false;
    };
    Popup.prototype.addEvent = function (name, fn) {
        if(!this._events[name]) {
            this._events[name] = new Array();
        }
        this._events[name].push(fn);
    };
    Popup.prototype.addEvents = function (events) {
        for(var name in events) {
            if(events.hasOwnProperty(name)) {
                if(!this._events[name]) {
                    this._events[name] = new Array();
                    this._events[name].push(events[name]);
                }
            }
        }
    };
    Popup.prototype.callEvent = function (name, data) {
        this._window.postMessage(Popup.encodeRequest(name, data), '*');
    };
    Popup.prototype.recieveEvent = function (data) {
        var str = JSON.decode(data);
    };
    Popup.prototype.fireEvent = function (name, data) {
        if(!this._events[name]) {
            for(var i = 0, l = this._events[name].length; i < l; ++i) {
                if(this._events.hasOwnProperty(name)) {
                    this._events[name][i].call(null, data);
                }
            }
        }
    };
    Popup.prototype.removeEvents = function (name) {
        if(this._events[name]) {
            this._events[name].length = 0;
        }
    };
    Popup.prototype.removeEvent = function (name, fn) {
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
    Popup.prototype.open = function () {
        if(this._window !== null) {
            clearInterval(this._callbackInterval);
        }
        var params = [];
        var value = '';

        for(var name in this._options) {
            if(this._options.hasOwnProperty(name)) {
                value = this._options[name];
                if(name == 'x' || name == 'y' || name == 'name') {
                    return;
                }
                if(name == 'width' || name == 'height') {
                    value = parseInt(value) + 'px';
                }
                params.push(name + '=' + value);
            }
        }
        this._window = window.open(this.url, this._options.name, params.join(','));
        this.moveTo(this.get('x'), this.get('y'));
        if(this._postDataBuffer.length > 0) {
            this._postDataBuffer.forEach(function (value, key) {
            });
            this._postDataBuffer.length = 0;
        }
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
        if(this._window) {
            this._window.moveTo(parseInt(x), parseInt(y));
        }
    };
    Popup.prototype.close = function () {
        if(this._window === null) {
            return;
        }
        this._window.close();
        this._window = null;
    };
    Popup.close = function close() {
        window.close();
    }
    Popup.encodeRequest = function encodeRequest(name, data) {
        return JSON.encode(arguments);
    }
    Popup.decodeRequest = function decodeRequest(data) {
        return JSON.decode(data);
    }
    Popup._events = {
    };
    Popup.addEvent = function addEvent(name, fn) {
        if(!this._events[name]) {
            this._events[name] = new Array();
        }
        this._events[name].push(fn);
    }
    Popup.addEvents = function addEvents(events) {
        for(var name in events) {
            if(events.hasOwnProperty(name)) {
                if(!this._events[name]) {
                    this._events[name] = new Array();
                    this._events[name].push(events[name]);
                }
            }
        }
    }
    Popup.fireEvent = function fireEvent(name, data) {
        if(this._events[name]) {
            for(var i = 0, l = this._events[name].length; i < l; ++i) {
                this._events[name][i].call(null, data);
            }
        }
    }
    Popup.removeEvents = function removeEvents(name) {
        if(this._events[name]) {
            this._events[name].length = 0;
        }
    }
    Popup.removeEvent = function removeEvent(name, fn) {
        if(this._events[name]) {
            for(var i = 0, l = this._events[name].length; i < l; ++i) {
                if(this._events[name][i] === fn) {
                    this._events[name].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }
    return Popup;
})();
