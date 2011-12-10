/*
---
name: Popup
description: A easy way to create manipulate and pass data through your popup's
license: MIT-style

authors:
- Mient-jan Stelling <mientjan.stelling@gmail.com>

provides: [Popup]

requires:
- core/1.3.0:Object
- core/1.3.0:Array
- core/1.3.0:Class
- core/1.3.0:Class.Options

thanks to:
- Robert Slootjes for helping me test it and debug it.
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