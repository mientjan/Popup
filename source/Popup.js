var UID = Date.now();
String['uniqueID'] = function () {
    return (UID++).toString(36);
};
if(typeof console == 'undefined') {
    var console = {
        log: function () {
        }
    };
}
var Popup = (function () {
    function Popup(url, options) {
        this.url = '';
        this.options = {
            name: null,
            status: 0,
            toolbar: 0,
            location: 0,
            menubar: 0,
            directories: 0,
            resizable: 0,
            scrollbars: 0,
            height: 900,
            width: 400,
            x: 'center',
            y: 'center'
        };
        this._events = {
        };
        this.window = null;
        this.reference = '';
        this._callbackInterval = 0;
        this.callbackInterval = 0;
        this._origin = [];
        this.setOptions(options);
        this.url = url;
        if(!this.options.name) {
            this.options.name = String['uniqueID']();
        }
        Popup.add(this);
    }
    Popup.uniqueName = 'PopupALDYUB';
    Popup._Browser = null;
    Popup.Browser = function Browser() {
        if(Popup._Browser == null) {
            var document = window.document;
            var ua = navigator.userAgent.toLowerCase(), platform = navigator.platform.toLowerCase(), UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [
                null, 
                'unknown', 
                0
            ], mode = UA[1] == 'ie' && document.documentMode;
            var Browser = {
                name: (UA[1] == 'version') ? UA[3] : UA[1],
                version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),
                Platform: {
                    name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || [
                        'other'
                    ])[0]
                },
                Features: {
                    xpath: !!(document['evaluate']),
                    air: !!(window['runtime']),
                    query: !!(document.querySelector),
                    json: !!(window['JSON'])
                },
                Plugins: {
                }
            };
            Popup._Browser = Browser;
        }
        return Popup._Browser;
    };
    Popup._count = 0;
    Popup._reference = [];
    Popup._events = {
    };
    Popup._closeInterval = -1;
    Popup.add = function add(o) {
        o.reference = this._count;
        this._reference[this._count] = o;
        this._count++;
    };
    Popup.getFromLocalStorage = function getFromLocalStorage(name) {
        return window.localStorage.getItem(Popup.uniqueName + name);
    };
    Popup.removeFromLocalStorage = function removeFromLocalStorage(name) {
        return window.localStorage.removeItem(Popup.uniqueName + name);
    };
    Popup.postMessageEncode = function postMessageEncode(name, data) {
        return JSON.stringify({
            name: name,
            data: data
        });
    };
    Popup.postMessageDecode = function postMessageDecode(data) {
        return JSON.parse(data);
    };
    Popup.remove = function remove(o) {
        delete Popup._reference[o.reference];
    };
    Popup.fireEvent = function fireEvent(name, data) {
        if(Popup.Browser().Platform.name == 'ios') {
            window.opener.postMessage(Popup.postMessageEncode(name, data), location.protocol + '//' + location.hostname);
        } else {
            if(typeof Popup._events[name] == 'undefined') {
                Popup._events[name] = [];
            }
            Popup._events[name].push(data);
        }
    };
    Popup.hasEvents = function hasEvents() {
        var has = false;
        if(Popup.Browser().Platform.name == 'ios') {
            for(var i = 0; i < window.localStorage.length; i++) {
                var name = window.localStorage.key(i);
                if(name.indexOf(Popup.uniqueName) == 0) {
                    has = true;
                }
            }
        } else {
            for(var name in this._events) {
                if(this._events.hasOwnProperty(name)) {
                    if(this._events[name].length > 0) {
                        has = true;
                    }
                }
            }
        }
        return has;
    };
    Popup.close = function close() {
        console.log(Popup.hasEvents());
        if(Popup.hasEvents() && Popup.Browser().Platform.name != 'ios') {
            clearInterval(Popup._closeInterval);
            Popup._closeInterval = setInterval(function () {
                console.log(Popup.hasEvents());
                if(!Popup.hasEvents()) {
                    clearInterval(Popup._closeInterval);
                    window.close();
                }
            }, 200);
        } else {
            window.close();
        }
    };
    Popup.prototype.setOptions = function (options) {
        for(var name in options) {
            if(this.options.hasOwnProperty(name)) {
                this.options[name] = options[name];
            }
        }
    };
    Popup.prototype.addOrigin = function (name) {
        this._origin.push(name);
    };
    Popup.prototype.isOriginAllowed = function (name) {
        var allowed = false;
        for(var i = 0; i < this._origin.length; i++) {
            if(this._origin[i].indexOf(name) > -1) {
                allowed = true;
            }
        }
        return allowed;
    };
    Popup.prototype.addEvent = function (name, cb) {
        if(!this._events.hasOwnProperty(name)) {
            this._events[name] = [];
        }
        this._events[name].push(cb);
    };
    Popup.prototype.fireEvent = function (name, data) {
        if(this._events.hasOwnProperty(name)) {
            for(var i = 0; i < this._events[name].length; i++) {
                this._events[name][i].call(window, data);
            }
        }
    };
    Popup.prototype.set = function (k, v) {
        if(typeof (this.options[k]) !== 'undefined') {
            this.options[k] = v;
            if(k === 'x' || k === 'y') {
                this._moveTo();
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
        var _this = this;
        if(this.window !== null) {
            clearInterval(this.callbackInterval);
        }
        var params = [];
        for(var key in this.options) {
            if(this.options.hasOwnProperty(key)) {
                var value = this.options[key];
                if(key == 'x' || key == 'y' || key == 'name') {
                    continue;
                }
                if(key == 'width' || key == 'height') {
                    value = parseInt(value) + 'px';
                }
                params.push(key + '=' + value);
            }
        }
        this.window = window.open(this.url, this.options.name, params.join(','));
        this._moveTo();
        if(Popup.Browser().Platform.name == 'ios') {
            var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
            var eventer = window[eventMethod];
            var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
            eventer(messageEvent, function (message) {
                if(_this.isOriginAllowed(message.origin)) {
                    var data = Popup.postMessageDecode(message.data);
                    _this.fireEvent(data.name, data.data);
                }
            }, false);
        } else {
            this.eventCheckingInterval = setInterval(function () {
                _this._checkFiredEvents();
            }, 200);
        }
    };
    Popup.prototype._moveTo = function () {
        if(!this.window) {
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
        this.window.moveTo(parseInt(x), parseInt(y));
    };
    Popup.prototype.close = function () {
        if(this.window === null) {
            return;
        }
        this.window.close();
        Popup.remove(this);
    };
    Popup.prototype._checkFiredEvents = function () {
        try  {
            for(var name in this._events) {
                if(this._events.hasOwnProperty(name)) {
                    var events = this._events[name];
                    if(this.window['Popup']._events[name] && this.window['Popup']._events[name].length > 0) {
                        for(var i = 0; i < this.window['Popup']._events[name].length; i++) {
                            var data = this.window['Popup']._events[name][i];
                            this.fireEvent(name, data);
                        }
                        this.window['Popup']._events[name].length = 0;
                    }
                }
            }
        } catch (e) {
        }
    };
    Popup.prototype.getWindow = function () {
        return this.window;
    };
    return Popup;
})();
