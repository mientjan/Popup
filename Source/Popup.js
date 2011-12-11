/*
---
name: Popup
version: 0.1.1
description: A easy way to create manipulate and pass data through your popup's

license: 
  - MIT-style

authors: 
  - Mient-jan Stelling <mientjan.stelling@gmail.com

requires:
  - core/1.3:Object
  - core/1.3:Array
  - core/1.3:Class
  - core/1.3:Class.Options
  - core/1.3:Core

provides: 
  - Popup
...
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
		this.callback = [];
		
		this.reference = 'n'+Popup._referenceCount;
		Popup._referenceCount++;
		
		Popup._reference[this.reference] = this;
	},
	
	set:function(k,v){
		if( typeof(this.options[k]) !== 'undefined' ){
			this.options[k] = v;
			
			if( k === 'x' || k === 'y'){
				this._moveTo();
			}
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
			clearInterval( this.callbackInterval );
			
			// return; // window already opened
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
		this._moveTo();
		// start callback checker
		this.callbackInterval = this.callbackIntervalFunction.periodical(200, this);
	},
	
	_moveTo:function(){
		if(!this.window){
			return;
		}
		
		var x = this.get('x');
		var y = this.get('y');
		
		if(typeof(x) == 'string'){
			switch(x){
				case 'center':{
					x = ( window.screen.width - this.get('width') ) / 2;
					break;
				}
				
				case 'left':{
					x = 0;
					break;
				}
				
				case 'right':{
					x = ( window.screen.width - this.get('width') );
					
					break;
				}
			}
		}
		
		if(typeof(y) == 'string'){
			switch(y){
				case 'center':{
					y = ( window.screen.height - this.get('height') ) / 2;
					break;
				}
				
				case 'top':{
					y = 0;
					break;
				}
				
				case 'bottom':{
					y = ( window.screen.height - this.get('height') );
					break;
				}
			}
		}
		
		this.window.moveTo(parseInt(x), parseInt(y));
	},
	
	close:function(){
		if( this.window === null ){
			return; // popup never opened or already closed
		}
		
		this.window.close();
		delete Popup._reference[this.reference];
		Popup._referenceCount--;
		
	},
	
	callbackIntervalFunction:function(){
		try { // try catch inplace because of popup being able to go crossdomain.
			if( this.window.Popup._callback.length > 0 ){
				
				Array.each(this.callback, function(fn, i){
					Array.each(this.window.Popup._callback, function(data, i){
						fn.call(fn, data);
					}, this );
				}, this );

				this.window.Popup._callback.length = 0;
			}
		} catch( err ){ }
	},
	
	addCallback:function(fn){
		this.callback.push(fn);
	},
	getWindow:function(){
		return this.window;
	}
});

Popup._referenceCount = 0;
Popup._reference = {};
Popup._callback = [];
Popup._closeInterval = null;

Popup.fireCallback = function( data ){
	this._callback.push(data);
}

Popup.close = function(){
	
	// popups have boon opened by this window and there for can not be closed
	if( Popup._referenceCount > 0 ){
		return; 
	}
	
	if( this._closeInterval !== null ) {
		if( this._callback.length <= 0 ){
			clearInterval(this._closeInterval);
			this._closeInterval = null;
			window.close();
		}
	} else if( this._closeInterval === null )
	{
		if( this._callback.length <= 0){
			window.close();
		} else {
			this.close.periodical(50, this);
		}
		
	}
	
}
/*
Popup.close = function(){
	if( Object.getLength(Popup._reference) > 0 ){
		return; // cant close this popup because this is not a popup.
		// ore a popup that opened popups that first need to be closed
	}
	
	window.close();
}*/