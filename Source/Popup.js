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
})();