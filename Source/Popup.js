
/*
---
name: Popup
description: A easy way to create manipulate and pass data through your popup's
license: MIT-style

authors:
- Mient-jan Stelling <mientjan.stelling@gmail.com>

thanks to:
- Robert Slootjes for helping me test it and debug it.

provides:
- Popup

requires:
- core/1.3.0:Object
- core/1.3.0:Array
- core/1.3.0:Class
- core/1.3.0:Class.Options

---
*/

var Popup = new Class({
	Implements: [Options],
	options:{
		// name:'empty', // window name
		status:0, // The status bar at the bottom of the window.
		toolbar:0, // The standard browser toolbar, with buttons such as Back and Forward.
		location:0, //, // 1 The Location entry field where you enter the URL.
		menubar:0, // The menu bar of the window
		directories:0, // The standard browser directory buttons, such as What's New and What's Cool
		resizable:0, // Allow/Disallow the user to resize the window.
		scrollbars:0, // Enable the scrollbars if the document is bigger than the window
		height:900, // Specifies the height of the window in pixels. (example: height='350')
		width:400, // Specifies the width of the window in pixels.
		x:'center', // position of popup relative to screen/window
		y:'center' // position of popup relative to screen/window

	},
	
	window:null,
	url:null,
	callback:null,
	callbackInterval:null,
	window:null,
	reference:0,
	
	initialize:function(url, options){
		this.url = url;
		this.setOptions(options);
		
		this.reference = 'n'+Popup._referenceCount;
		Popup._referenceCount++;
		
		Popup._reference[this.reference] = this;
	},
	
	set:function(k,v){
		if( typeof(this.options[k]) !== 'undefined' ){
			this.options[k] = v;
		}
	},

	get:function(k){
		if( typeof(this.options[k]) !== 'undefined' ){
			return this.options[k];
		}

		return false;
	},
	
	open:function(){
		if( this.window !== null ){
			return; // window already opened
		}
		
		var params = [];
		Object.each(this.options, function(value, key){
			if(key=='x' || key=='y'){
				return;
			}
			
			if( key == 'width' || key == 'height' ){
				value = parseInt(value) + 'px';	
			}

			this.push( key + '=' + value );
		}, params );


		this.window = window.open(this.url, 'empty', params.join(',') );

		// start callback checker
		this.callbackInterval = this.callbackIntervalFunction.periodical(200, this);
	},
	
	close:function(){
		if( this.window === null ){
			return; // popup never opened or already closed
		}
		
		this.window.close();
		delete Popup._reference[this.reference];
		
	},
	
	callbackIntervalFunction:function(){
		try { // try catch inplace because of popup being able to go crossdomain.
			if( this.window.Popup._callback.length > 0 ){
				clearInterval( this.callbackInterval );

				Array.each(this.callback, function(fn, i){
					fn.call(fn, this);
				}, this.window.Popup._callback[0] );

				this.window.Popup._callback.length = 0;
			}
		} catch( err ){ }
	},
	getWindow:function(){
		return this.window;
	}
});

Popup._referenceCount = 0;
Popup._reference = {};
Popup._callback = [];

Popup.fireCallback = function( data ){
	this._callback.push(data);
}
/*
Popup.close = function(){
	if( Object.getLength(Popup._reference) > 0 ){
		return; // cant close this popup because this is not a popup.
		// ore a popup that opened popups that first need to be closed
	}
	
	window.close();
}*/


function Popup(url, options){
	
	this._url = url;

	if( options ){
		for (var prop in options) {
			if( options.hasOwnProperty(prop)
				&& this.options[prop] != undefined ) {
				this.options[prop] = options[prop];
			}
		}
	}
	
};

Popup.prototype._window = null;
Popup.prototype._url = null;
Popup.prototype._callback = [];
Popup.prototype._validatorInterval = null;

Popup.prototype.options = {
	// name:'empty', //, // window name
	status:0, // The status bar at the bottom of the window.
	toolbar:0, // The standard browser toolbar, with buttons such as Back and Forward.
	location:0, //, // 1 The Location entry field where you enter the URL.
	menubar:0, // The menu bar of the window
	directories:0, // The standard browser directory buttons, such as What's New and What's Cool
	resizable:0, // 1 Allow/Disallow the user to resize the window.
	scrollbars:0, // Enable the scrollbars if the document is bigger than the window
	height:900, // Specifies the height of the window in pixels. (example: height='350')
	width:400 // Specifies the width of the window in pixels.
};


Popup.prototype.set = function(name,value){
	if( this.options[name] !== undefined ){
		this.options[name] = value;
	}
}

Popup.prototype.get = function(name){
	if( this.options[name] !== undefined ){
		return this.options[name];
	}
	
	return false;
}

Popup.prototype.open = function(){
	var params = [];
	for (var prop in this.options) {
		if( this.options.hasOwnProperty(prop) ) {
			var value = this.options[prop];
			if( prop == 'width' || prop == 'height' ){
				value = parseInt(value) + 'px';	
			}
			
			params.push( prop + '=' + value );
		}
	}
	
	this._window = window.open(this._url, 'empty', params.join(',') );
	
	// flush buffer
	this._validatorInterval = window.setInterval(function(scope){
		
		try {
			if( scope._window.Popup.callback.length > 0 ){
				clearInterval( scope._validatorInterval );

				var data = scope._window.Popup.callback[0];

				Popup.ArrayEach(scope._callback, function(fn, i){
					fn.call(fn, data);
				});

				scope._window.Popup.callback = [];
			}
		} catch( err ){ }
	}, 500, this );
}

Popup.prototype.close = function(){
	if( this._window ){
		this._window.close();
	}
}

Popup.prototype.moveTo = function(x,y){
	
	var xpos = ( typeOf(window.screenX) != 'undefined' ? window.screenX : window.screenLeft );
	var ypos = ( typeOf(window.screenY) != 'undefined' ? window.screenY : window.screenTop );

	var xwidth = ( typeOf(window.outerWidth) != 'undefined' ? window.outerWidth : document.documentElement.clientWidth );
	var ywidth = ( typeOf(window.outerHeight) != 'undefined' ? window.outerHeight : (document.documentElement.clientHeight - 22) );

	xpos = (xpos < 0) ? window.screen.width + xpos : xpos;

	this.options.left = parseInt(xpos + ((xwidth - this.options.width ) / 2), 10);
	this.options.top = parseInt(ypos + ((ywidth - this.options.height ) / 2.5), 10);

	if( this._window ){
		this._window.moveTo(this.options.left,this.options.top);
	}
}

Popup.prototype.getWindow = function(){
	return this._window;
}

Popup.prototype.addCallback = function( fn ){
	this._callback.push(fn);
}

Popup.callback = [];

Popup.callCallback = function( data ){
	this.callback.push(data);
}

Popup.ArrayEach = function(arr,fn,bind){
	for (var i = 0, l = arr.length; i < l; i++){
		if (i in arr) fn.call(bind, arr[i], i, arr);
	}
}


/*
---

name: JSON

description: JSON encoder and decoder.

license: MIT-style license.

See Also: <http://www.json.org/>

requires: [Array, String, Number, Function]

provides: JSON

...
*/

if (typeof JSON == 'undefined') this.JSON = {};

(function(){

var special = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};

var escape = function(chr){
	return special[chr] || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
};

JSON.validate = function(string){
	string = string.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
					replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
					replace(/(?:^|:|,)(?:\s*\[)+/g, '');

	return (/^[\],:{}\s]*$/).test(string);
};

JSON.encode = JSON.stringify ? function(obj){
	return JSON.stringify(obj);
} : function(obj){
	if (obj && obj.toJSON) obj = obj.toJSON();

	switch (typeOf(obj)){
		case 'string':
			return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';
		case 'array':
			return '[' + obj.map(JSON.encode).clean() + ']';
		case 'object': case 'hash':
			var string = [];
			Object.each(obj, function(value, key){
				var json = JSON.encode(value);
				if (json) string.push(JSON.encode(key) + ':' + json);
			});
			return '{' + string + '}';
		case 'number': case 'boolean': return '' + obj;
		case 'null': return 'null';
	}

	return null;
};

JSON.decode = function(string, secure){
	if (!string || typeof(string) != 'string') return null;

	if (secure || JSON.secure){
		if (JSON.parse) return JSON.parse(string);
		if (!JSON.validate(string)) throw new Error('JSON could not decode the input; security is enabled and the value is not secure.');
	}

	return eval('(' + string + ')');
};

})();
