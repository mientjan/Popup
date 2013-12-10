//declare var window:window;
/*
 ---
 name: Popup

 version: 1.3

 description: A easy way to create manipulate and pass data through your popup's. This version uses pure javascript.

 license:
 - MIT-style

 authors:
 - Mient-jan Stelling <mientjan.stelling@gmail.com

 provides:
 - Popup

 docs: https://github.com/mientjan/Popup
 ...
 */


class Popup {

	public static Browser (){
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

		return Browser;
	}


	public static encodeMessage(name:string, properties:any):string
	{
		return JSON.stringify({
			name: name,
			data: properties
		});
	}

	public static decodeMessage(data:string):{name:string; data:any; }
	{
		try
		{
			return JSON.parse(data);
		}
		catch (e)
		{}

		return {name: '', data: {}};
	}

	static close()
	{
		window.close();
	};
	private static _count = 0;
	private static _reference = [];
	private static _events = {};
	private static _closeInterval = null;

	public static subscribeEntity(pop:Popup)
	{
		pop._reference = Popup._count;
		Popup._reference[Popup._count] = pop;
		Popup._count++;
	}

	public static removeEntity(o:Popup)
	{
		delete Popup._reference[o._reference];
	}

	public static addEventListener(name:string, fn:Function)
	{
		if (typeof(Popup._events[name]) == 'undefined')
		{
			Popup._events[name] = [];
		}

		Popup._events[name].push(fn);
	}

	public static removeEventListener(name:string, fn:Function)
	{
		if (typeof(Popup._events[name]) != 'undefined')
		{
			for (var i = 0; i < Popup._events[name].length; i++)
			{
				if (Popup._events[name][i] == fn)
				{
					Popup._events[name].splice(i);
					--i;
				}
			}
		}
	}

	public static dispatchEvent(name:string, properties:any, other:bool = true)
	{
		if (!other)
		{
			if (typeof(Popup._events[name]) != 'undefined')
			{
				for (var i = 0; i < Popup._events[name].length; i++)
				{
					Popup._events[name][i].call(null, properties);
				}
			}
		}
		else
		{
			var message = Popup.encodeMessage(name, properties);

			if( this.Browser().name == 'ie' && this.Browser().verson < 10 ){
				window.opener['Popup'].receiveMessage({
					origin: location['origin'],
					data: message
				});
			} else {
				window.opener.postMessage(message, location['origin']);
			}
		}
	}
//
	public static receiveMessage(e:MessageEvent)
	{
		var data = Popup.decodeMessage(<string> e.data);
		Popup.dispatchEvent(data.name, data.data, false);
	}


	private _options:IPopupOptions = {
		'name': null,		// if name is null / a unique name is generated

		'status': 0,			// The status bar at the bottom of the window.
		'toolbar': 0,		// The standard browser toolbar, with buttons such as Back and Forward.
		'location': 0,		// 1 The Location entry field where you enter the URL.
		'menubar': 0,		// The menu bar of the window
		'directories': 0,	// The standard browser directory buttons, such as What's New and What's Cool
		'resizable': 0,		// Allow/Disallow the user to resize the window.
		'scrollbars': 0,		// Enable the scrollbars if the document is bigger than the window
		'height': 900,		// Specifies the height of the window in pixels. (example: height='350')
		'width': 400,		// Specifies the width of the window in pixels.

		'x': 'center',		// position of Popup relative to screen/window
		'y': 'center'		// position of Popup relative to screen/window
	};

	static _name = 'popup.019273';
	private _window:any = null;
	private _url:string = '';
	private _reference:number = -1;
	private _interval:number = -1;
	private _events = {};

	constructor(url:string, options)
	{
		this.setOptions(options);
		this._url = url;

		if (!this._options.name)
		{
			if (typeof(window['UID']) == 'undefined')
			{
				window['UID'] = new Date().getTime();
			}

			window['UID']++;
			this._options.name = window['UID'].toString();
		}

//		Popup.subscribeEntity(this);

		if( Popup.Browser().name == 'ie' && Popup.Browser().version < 10 ){
		} else {
			window.addEventListener('onmessage', (e:MessageEvent) =>
			{
				try { Popup.receiveMessage(e); } catch (err){}
			});
		}
	}

	setOptions(options)
	{
		for (var i in this._options)
		{
			if (this._options.hasOwnProperty(i))
			{
				if (typeof(options[i]) != 'undefined')
				{
					this._options[i] = options[i];
				}
			}
		}
	}

	public set(key:string, value:number);
	public set(key:string, value:string);
	public set(key:string, value:any)
	{
		if (typeof(this._options[key]) !== 'undefined')
		{
			this._options[key] = value;

			if (key === 'x' || key === 'y')
			{
				this._moveTo();
			}
		}

		return this;
	}

	public get(key:string)
	{
		if (typeof(this._options[key]) !== 'undefined')
		{
			return this._options[key];
		}

		return false;
	}

	public addEventListener(name:string, fn:Function)
	{
		Popup.addEventListener(name, fn);
	}

	public removeEventListener(name:string, fn:Function)
	{
		Popup.removeEventListener(name, fn);
	}

	public dispatchEvent(name:string, properties:any, other:bool = true)
	{
		if (!other)
		{
			if (typeof(this._events[name]) != 'undefined')
			{
				for (var i = 0; i < this._events[name].length; i++)
				{
					this._events[name][i].call(null, properties);
				}
			}
		}
		else
		{

			if( Popup.Browser().name == 'ie' && Popup.Browser().version < 10 ){
				this._window.Popup.receiveMessage(Popup.encodeMessage(name, properties));
			} else {
				this._window.postMessage(Popup.encodeMessage(name, properties), '*');
			}
		}
	}

	private _receiveMessage(e:MessageEvent)
	{
		var data = Popup.decodeMessage(e.data);
		this.dispatchEvent(data.name, data.data, false);
	}

	public open()
	{

		var params = [];
		var key, value;
		for (key in this._options)
		{
			if (this._options.hasOwnProperty(key))
			{
				value = this._options[key];

				if (!(key == 'x' || key == 'y' || key == 'name'))
				{
					if (key == 'width' || key == 'height')
					{
						value = parseInt(value) + 'px';
					}

					params.push(key + '=' + value);
				}
			}
		}

		this._window = window.open(this._url, this._options.name, params.join(','));


		if( Popup.Browser().name == 'ie' && Popup.Browser().version < 10 )
		{
			this._interval = setInterval(() => {
				var data = window.localStorage.getItem(Popup._name);
				if(data != null){
					data = Popup.decodeMessage(data);
					this.dispatchEvent(data.name,data.data,false);
					window.localStorage.removeItem(Popup._name);
				}
			});
		} else {
			window.addEventListener('message', (e:MessageEvent) => {
				try{ this._receiveMessage(e); }
				catch (err){}
			}, false);
		}

		this._moveTo();
	}

	private _moveTo()
	{
		if (this._window == null)
		{
			return;
		}

		var x = this.get('x');
		var y = this.get('y');

		if (typeof(x) == 'string')
		{
			switch (x)
			{
				case 'center':
				{
					x = ( window.screen.width - this.get('width') ) / 2;
					break;
				}

				case 'left':
				{
					x = 0;
					break;
				}

				case 'right':
				{
					x = ( window.screen.width - this.get('width') );
					break;
				}
			}
		}

		if (typeof(y) == 'string')
		{
			switch (y)
			{
				case 'center':
				{
					y = ( window.screen.height - this.get('height') ) / 2;
					break;
				}

				case 'top':
				{
					y = 0;
					break;
				}

				case 'bottom':
				{
					y = ( window.screen.height - this.get('height') );
					break;
				}
			}
		}

		this._window.moveTo(parseInt(x), parseInt(y));
	}

	public close()
	{
		Popup.removeEntity(this);
		if (this._window === null)
		{
			return; // Popup never opened or already closed
		}

		this._window.close();

	}

	public getWindow()
	{
		return this._window;
	}
}

window['Popup'] = Popup;

export interface IPopupOptions {
	name:string;		    // if name is null / a unique name is generated
	status:number;		// The status bar at the bottom of the window.
	toolbar:number;		// The standard browser toolbar, with buttons such as Back and Forward.
	location:number;		// 1 The Location entry field where you enter the URL.
	menubar:number;	    // The menu bar of the window
	directories:number;	// The standard browser directory buttons, such as What's New and What's Cool
	resizable:number;		// Allow/Disallow the user to resize the window.
	scrollbars:number;	// Enable the scrollbars if the document is bigger than the window
	height:number;		// Specifies the height of the window in pixels. (example: height='350')
	width:number;		    // Specifies the width of the window in pixels.
	x:string;		        // position of Popup relative to screen/window
	y:string;	            // position of Popup relative to screen/window
}