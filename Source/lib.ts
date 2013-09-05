
var UID = Date.now();
function uniqueID(): string {
	return (++UID).toString(UID);
}

/*interface JSON {
	escape(chr): string;
	validate(chr): string;
	encode(obj:Object): string;
	decode(obj:Object): string;
}*/

class JSON  {

	static _special = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		'\\': '\\\\'
	}

	public static escape(chr) {
		return this._special[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
	};

	public static validate(str) {
		str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '');
		return (/^[\],:{}\s]*$/).test(str);
	};

	public static encode(obj:Object) {
		switch (typeof obj) {
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

				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						var json = JSON.encode(value);
						if (json) {
							string.push(JSON.encode(key) + ':' + json);
						}
					}
				}
				;;
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

	public static decode(str, secure) {
		if (typeof secure === "undefined") { secure = false; }
		if (!str || typeof str != 'string') {
			return null;
		}
		if (secure || this.secure) {
			if (JSON.parse) {
				return JSON.parse(str);
			}
			if (!JSON.validate(str)) {
				throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
			}
		}
		return eval('(' + str + ')');
	};
}
