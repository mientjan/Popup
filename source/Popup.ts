/*
 ---
 name: Popup

 version: 1.1

 description: A easy way to create manipulate and pass data through your popup's. This version uses Mootools for some functionality.

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

var UID = Date.now();

String['uniqueID'] = function(){
	return (UID++).toString(36);
};

class Popup {

	public static uniqueName = 'PopupALDYUB';

	private static _Browser:any = null;
	public static Browser (){

		if( Popup._Browser == null ){
			var document = window.document;

			var ua = navigator.userAgent.toLowerCase(),
				platform = navigator.platform.toLowerCase(),
				UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || <any[]> [null, 'unknown', 0],
				mode = UA[1] == 'ie' && document.documentMode;

			var Browser = {

				name: (UA[1] == 'version') ? UA[3] : UA[1],

				version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

				Platform: {
					name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
				},

				Features: {
					xpath: !!(document['evaluate']),
					air: !!(window['runtime']),
					query: !!(document.querySelector),
					json: !!(window['JSON'])
				},

				Plugins: {}
			};

			Popup._Browser = Browser;
		}

		return Popup._Browser;
	}

	public static _count = 0;
	public static _reference = [];
	public static _events = {};
	public static _closeInterval:number = -1;

	public static add(o){
		o.reference = this._count;
		this._reference[this._count] = o;
		this._count++;
	}

	public static getFromLocalStorage(name){
		return window.localStorage.getItem(Popup.uniqueName + name);
	}

	public static removeFromLocalStorage(name){
		return window.localStorage.removeItem(Popup.uniqueName + name);
	}

	public static postMessageEncode(name:any, data:any){
		return JSON.stringify({name:name, data:data});
	}

	public static postMessageDecode(data):{name:any;data:any;}{
		return JSON.parse(data);
	}

	public static remove(o){
		delete Popup._reference[o.reference];
	}

	public static fireEvent( name:string, data:string )
	{
		if( Popup.Browser().Platform.name == 'ios' ){
//			window.localStorage.setItem( Popup.uniqueName + name, data );

			window.opener.postMessage(Popup.postMessageEncode(name, data), '*');
		} else {
			if(!Popup._events[name])
			{
				Popup._events[name] = [];
			}

			Popup._events[name].push(data);
		}
	}

	public static hasEvents(){
		var has = false;

		if( Popup.Browser().Platform.name == 'ios' ){
			for (var i = 0; i < window.localStorage.length; i++) {
				var name = window.localStorage.key(i);
				if(name.indexOf(Popup.uniqueName) == 0){
					has = true;
				}
			}
		} else {
			for (var name in this._events) {
				if(this._events.hasOwnProperty(name) ){
					if( this._events.length>0){
						has = true;
					}
				}
			}
		}
		return has;
	};

	public static close(){
		if(Popup.hasEvents()){
			Popup._closeInterval = setInterval(() => {
				if(Popup.hasEvents()){
					clearInterval(Popup._closeInterval);
					window.close();
				}
			}, 200);
		} else {
			window.close();
		}
	};

	public url:string = '';
	private options = {
		name:null,		// if name is null / a unique name is generated
		status:0,			// The status bar at the bottom of the window.
		toolbar:0,		// The standard browser toolbar, with buttons such as Back and Forward.
		location:0,		// 1 The Location entry field where you enter the URL.
		menubar:0,		// The menu bar of the window
		directories:0,	// The standard browser directory buttons, such as What's New and What's Cool
		resizable:0,		// Allow/Disallow the user to resize the window.
		scrollbars:0,		// Enable the scrollbars if the document is bigger than the window
		height:900,		// Specifies the height of the window in pixels. (example: height='350')
		width:400,		// Specifies the width of the window in pixels.
		x:'center',		// position of popup relative to screen/window
		y:'center'		// position of popup relative to screen/window
	};

	private _events = {};

	window:Window = null;
	reference = '';
	_callbackInterval:number = 0;
	callbackInterval:number = 0;
	eventCheckingInterval:number;
	_origin = [];


	constructor(url,options)
	{
		this.setOptions(options);
		this.url = url;

		if(!this.options.name){
			this.options.name = String['uniqueID']();
		}

		Popup.add(this);
	}

	setOptions(options){
		for (var name in options) {
			if( this.options.hasOwnProperty(name) ){
				this.options[name] = options[name];
			}
		}
	}

	addOrigin(name:string){
		this._origin.push(name);
	}

	isOriginAllowed(name:string){
		var allowed = false;
		for (var i = 0; i < this._origin.length; i++) {
			if( this._origin[i].indexOf(name)> -1){
				allowed = true;
			}
		}

		return allowed;
	}

	addEvent(name:string, cb:Function ){
		if(!this._events.hasOwnProperty(name)){
			this._events[name] = [];
		}

		this._events[name].push(cb);
	}

	fireEvent(name:string, data:any){
		if(this._events.hasOwnProperty(name)){
			for (var i = 0; i < this._events[name].length; i++) {
				this._events[name][i].call(window, data);
				
			}
		}
	}

	set(k,v)
	{
		if( typeof(this.options[k]) !== 'undefined' ){
			this.options[k] = v;

			if( k === 'x' || k === 'y'){
				this._moveTo();
			}
		}

		return this;
	}

	get(k){
		if( typeof(this.options[k]) !== 'undefined' ){
			return this.options[k];
		}

		return false;
	}

	open()
	{
		if( this.window !== null ){
			clearInterval( this.callbackInterval );
		}

		var params = [];
		for (var key in this.options) {

			if( this.options.hasOwnProperty(key) ){

				var value = this.options[key];
				if(key=='x' || key=='y' || key=='name'){
					continue;
				}

				if( key == 'width' || key == 'height' ){
					value = parseInt(value) + 'px';
				}

				params.push( key + '=' + value );
			}
		}

		this.window = window.open(this.url, this.options.name, params.join(',') );
		this._moveTo(); 

		// start callback checker
		if( Popup.Browser().Platform.name == 'ios' ){
			window.addEventListener('message', (message:MessageEvent) => {

				if( this.isOriginAllowed(message.origin) ){
					var data = Popup.postMessageDecode(message.data);
					this.fireEvent( data.name, data.data );
				}
			}, false );
		} else {
			this.eventCheckingInterval = setInterval(() => {
				this._checkFiredEvents();
			},200);
		}
	}

	_moveTo(){
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
	}

	close(){
		if( this.window === null ){
			return; // popup never opened or already closed
		}

		this.window.close();

		Popup.remove(this);
	}

	_checkFiredEvents()
	{
		try
		{
			if( Popup.Browser().Platform.name == 'ios'){
				for (var i = 0; i < window.localStorage.length; i++) {
					var name = window.localStorage.key(i);
					if( name.indexOf(Popup.uniqueName) == 0){
						name = name.substr(Popup.uniqueName.length);
						this.fireEvent( name, Popup.getFromLocalStorage(name) );
						Popup.removeFromLocalStorage(name)
					}
				}
			} else {
				for (var name in this._events) {
					if(this._events.hasOwnProperty(name) ){
						var events = this._events[name];
						if( this.window['Popup']._events[name]
							&& this.window['Popup']._events[name].length > 0 )
						{
							for (var i = 0; i < this.window['Popup']._events[name].length; i++) {
								var data = this.window['Popup']._events[name][i];
								this.fireEvent(name, data);
							}

							this.window['Popup']._events[name].length = 0;
						}
					}
				}

			}

		} catch(e){}

	}

	getWindow(){
		return this.window;
	}
}
/*
var Popup = (function(){
	var Popup = new Class({

		'Implements': [Options,Events],

		'options':{
			'name':null,		// if name is null / a unique name is generated

			'status':0,			// The status bar at the bottom of the window.
			'toolbar':0,		// The standard browser toolbar, with buttons such as Back and Forward.
			'location':0,		// 1 The Location entry field where you enter the URL.
			'menubar':0,		// The menu bar of the window
			'directories':0,	// The standard browser directory buttons, such as What's New and What's Cool
			'resizable':0,		// Allow/Disallow the user to resize the window.
			'scrollbars':0,		// Enable the scrollbars if the document is bigger than the window
			'height':900,		// Specifies the height of the window in pixels. (example: height='350')
			'width':400,		// Specifies the width of the window in pixels.

			'x':'center',		// position of popup relative to screen/window
			'y':'center'		// position of popup relative to screen/window

		},

		'window':null,
		'url':'',
		'reference':'',
		'_callbackInterval':0,

		initialize:function(url,options)
		{
			this.setOptions(options);
			this.url = url;

			if(!this.options.name){
				this.options.name = String.uniqueID();
			}

			Popup.add(this);
		},

		set:function(k,v)
		{
			if( typeof(this.options[k]) !== 'undefined' ){
				this.options[k] = v;

				if( k === 'x' || k === 'y'){
					this.moveTo();
				}
			}

			return this;
		},

		get:function(k){
			if( typeof(this.options[k]) !== 'undefined' ){
				return this.options[k];
			}

			return false;
		},

		open:function()
		{
			if( this.window !== null ){
				clearInterval( this.callbackInterval );
			}

			var params = [];
			Object.each(this.options, function(value, key)
			{
				if(key=='x' || key=='y' || key=='name'){
					return;
				}

				if( key == 'width' || key == 'height' ){
					value = parseInt(value) + 'px';
				}

				this.push( key + '=' + value );
			}, params );


			this.window = window.open(this.url, this.options.name, params.join(',') );
			this._moveTo();

			// start callback checker
			this.eventCheckingInterval = this._checkFiredEvents.periodical(200, this);
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

			Popup.remove(this);

		},

		_checkFiredEvents:function()
		{
			try
			{
				Object.each( this.$events, function( events, name )
				{
					if( this.window.Popup._events[name]
						&& this.window.Popup._events[name].length > 0 )
					{
						this.window.Popup._events[name].each(function(data)
						{
							this.fireEvent(name, data);
						}, this );

						this.window.Popup._events[name].length = 0;
					}
				}, this );
			} catch(e){}

		},

		getWindow:function(){
			return this.window;
		}
	});

	Popup.add = function(o){
		o.reference = this.count;
		this._reference[this.count] = o;
		this._count++;
	}

	Popup.remove = function(o){
		delete Popup._reference[o.reference];
	}

	Popup._count = 0;
	Popup._reference = [];
	Popup._events = {};
	Popup._closeInterval = null;

	Popup.fireEvent = function( name, data )
	{
		if(!this._events[name])
		{
			this._events[name] = [];
		}

		this._events[name].push(data);
	}

	Popup.hasEvents = function(){
		var has = false;
		if(Object.getLength(this._events) > 0){
			Object.each(this._events, function(name, events){
				if( events.length>0){
					has = true;
				}
			});
		}

		return has;
	};

	Popup.close = function(){
		if(this.hasEvents()){
			this._closeInterval = (function(){
				if(this.hasEvents()){
					clearInterval(this._closeInterval);
					window.close();
				}
			}).periodical(200, this);
		} else {
			window.close();
		}
	};

	return Popup;
})();*/