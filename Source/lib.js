var UID = Date.now();
function uniqueID() {
    return (++UID).toString(UID);
}
var JSON = (function () {
    function JSON() {
        this._special = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        this.secure = false;
    }
    JSON.prototype.escape = function (chr) {
        return this._special[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
    };
    JSON.prototype.validate = function (str) {
        str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        return (/^[\],:{}\s]*$/).test(str);
    };
    JSON.prototype.encode = function (obj) {
        switch(typeof obj) {
            case 'string': {
                return '"' + obj.replace(/[\x00-\x1f\\"]/g, this.escape) + '"';

            }
            case 'array': {
                return '[' + obj.map(JSON.encode).clean() + ']';

            }
            case 'object':
            case 'hash': {
                var string = [];
                var value;

                for(var key in obj) {
                    if(obj.hasOwnProperty(key)) {
                        var json = JSON.encode(value);
                        if(json) {
                            string.push(JSON.encode(key) + ':' + json);
                        }
                    }
                }
                ; ;
                return '{' + string + '}';

            }
            case 'number':
            case 'boolean': {
                return '' + obj;

            }
            case 'null': {
                return 'null';

            }
        }
        return null;
    };
    JSON.prototype.decode = function (str, secure) {
        if (typeof secure === "undefined") { secure = false; }
        if(!str || typeof str != 'string') {
            return null;
        }
        if(secure || this.secure) {
            if(JSON.parse) {
                return JSON.parse(str);
            }
            if(!JSON.validate(str)) {
                throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
            }
        }
        return eval('(' + str + ')');
    };
    return JSON;
})();
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
