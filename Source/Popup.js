var Popup = (function () {
    function Popup(url, options) {
        var _this = this;
        this._options = {
            'name': null,
            'status': 0,
            'toolbar': 0,
            'location': 0,
            'menubar': 0,
            'directories': 0,
            'resizable': 0,
            'scrollbars': 0,
            'height': 900,
            'width': 400,
            'x': 'center',
            'y': 'center'
        };
        this._window = null;
        this._url = '';
        this._reference = -1;
        this._events = {
        };
        this.setOptions(options);
        this._url = url;
        if(!this._options.name) {
            if(typeof (window['UID']) == 'undefined') {
                window['UID'] = new Date().getTime();
            }
            window['UID']++;
            this._options.name = window['UID'].toString();
        }
        Popup.subscribeEntity(this);
        window.addEventListener('message', function (e) {
            _this._receiveMessage(e);
        });
    }
    Popup.subscribeEntity = function subscribeEntity(pop) {
        pop._reference = Popup._count;
        Popup._reference[Popup._count] = pop;
        Popup._count++;
    };
    Popup.remove = function remove(o) {
        delete Popup._reference[o.reference];
    };
    Popup._count = 0;
    Popup._reference = [];
    Popup._events = {
    };
    Popup._closeInterval = null;
    Popup.addEventListener = function addEventListener(name, fn) {
        if(typeof (Popup._events[name]) == 'undefined') {
            Popup._events[name] = [];
        }
        Popup._events[name].push(fn);
    };
    Popup.dispatchEvent = function dispatchEvent(name, properties, other) {
        if (typeof other === "undefined") { other = true; }
        if(!other) {
            if(typeof (Popup._events[name]) != 'undefined') {
                for(var i = 0; i < Popup._events[name].length; i++) {
                    Popup._events[name][i].call(null, properties);
                }
            }
        } else {
            var message = Popup.encodePostMessage(name, properties);
            window.opener.postMessage(Popup.encodePostMessage(name, properties), location['origin']);
        }
    };
    Popup.receiveMessage = function receiveMessage(e) {
        var data = Popup.decodePostMessage(e.data);
        Popup.dispatchEvent(data.name, data.data, false);
    };
    Popup.close = function close() {
        window.close();
    };
    Popup.encodePostMessage = function encodePostMessage(name, properties) {
        return JSON.stringify({
            name: name,
            data: properties
        });
    };
    Popup.decodePostMessage = function decodePostMessage(data) {
        return JSON.parse(data);
    };
    Popup.prototype.setOptions = function (options) {
        for(var i in this._options) {
            if(this._options.hasOwnProperty(i)) {
                if(typeof (options[i]) != 'undefined') {
                    this._options[i] = options[i];
                }
            }
        }
    };
    Popup.prototype.set = function (key, value) {
        if(typeof (this._options[key]) !== 'undefined') {
            this._options[key] = value;
            if(key === 'x' || key === 'y') {
                this._moveTo();
            }
        }
        return this;
    };
    Popup.prototype.get = function (key) {
        if(typeof (this._options[key]) !== 'undefined') {
            return this._options[key];
        }
        return false;
    };
    Popup.prototype.addEventListener = function (name, fn) {
        if(typeof (this._events[name]) == 'undefined') {
            this._events[name] = [];
        }
        this._events[name].push(fn);
    };
    Popup.prototype.dispatchEvent = function (name, properties, other) {
        if (typeof other === "undefined") { other = true; }
        if(!other) {
            if(typeof (this._events[name]) != 'undefined') {
                for(var i = 0; i < this._events[name].length; i++) {
                    this._events[name][i].call(null, properties);
                }
            }
        } else {
            this._window.postMessage(Popup.encodePostMessage(name, properties), '*');
        }
    };
    Popup.prototype._receiveMessage = function (e) {
        var data = Popup.decodePostMessage(e.data);
        this.dispatchEvent(data.name, data.data, false);
    };
    Popup.prototype.open = function () {
        var _this = this;
        var params = [];
        var key, value;
        for(key in this._options) {
            if(this._options.hasOwnProperty(key)) {
                value = this._options[key];
                if(!(key == 'x' || key == 'y' || key == 'name')) {
                    if(key == 'width' || key == 'height') {
                        value = parseInt(value) + 'px';
                    }
                    params.push(key + '=' + value);
                }
            }
        }
        this._window = window.open(this._url, this._options.name, params.join(','));
        this._window.addEventListener('message', function (e) {
            _this._receiveMessage(e);
        });
        this._moveTo();
    };
    Popup.prototype._moveTo = function () {
        if(this._window == null) {
            return;
        }
        var x = this.get('x');
        var y = this.get('y');
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
        this._window.moveTo(parseInt(x), parseInt(y));
    };
    Popup.prototype.close = function () {
        if(this._window === null) {
            return;
        }
        this._window.close();
        Popup.remove(this);
    };
    Popup.prototype._checkFiredEvents = function () {
    };
    Popup.prototype.getWindow = function () {
        return this._window;
    };
    return Popup;
})();
window.addEventListener('message', function (e) {
    Popup.receiveMessage(e);
}, false);
