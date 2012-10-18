///<reference path="lib.ts" />

class Popup {

	public _reference: number = -1;
	public _callbackInterval: number = -1;
	private _window: Window = null;
	private _options: PopupOptions = null;
	private _postDataBuffer: string[] = [];

	constructor (public url: string, options: PopupOptions ) {

		this._options.name = options.name || uniqueID();			// if name is null / a unique name is generated
		this._options.status = options.status || false;			// The status bar at the bottom of the window.
		this._options.toolbar = options.toolbar || false;		// The standard browser toolbar, with buttons such as Back and Forward.
		this._options.location = options.location || false;		// 1 The Location entry field where you enter the URL.
		this._options.menubar = options.menubar || false;		// The menu bar of the window
		this._options.directories = options.directories || false;// The standard browser directory buttons, such as What's New and What's Cool
		this._options.resizable = options.resizable || false;	// Allow/Disallow the user to resize the window.
		this._options.scrollbars = options.scrollbars || false;	// Enable the scrollbars if the document is bigger than the window
		this._options.height = parseInt(options.height) || 500;	// Specifies the height of the window in pixels. (example: height='350')
		this._options.width = parseInt(options.width) || 500;	// Specifies the width of the window in pixels.

		this._options.x = options.x || 0;						// position of popup relative to screen/window
		this._options.y = options.y || 0;						// position of popup relative to screen/window
	};

	set(k: string, v: any): Popup {
		if (typeof this._options[k] !== 'undefined') {
			this._options[k] = v;
		}

		return this;
	}

	get(k: string): any {
		if (typeof this._options[k] !== 'undefined') {
			return this._options[k];
		}

		return false;
	}

	private _events: Object = {};

	public addEvent(name: string, fn: Function) {
		if (!this._events[name]) {
			this._events[name] = new Array();
		}

		this._events[name].push(fn);
	}

	public addEvents(events: Object) {
		for (var name in events) {
			if (events.hasOwnProperty(name)) {
				if (!this._events[name]) {
					this._events[name] = new Array();
					this._events[name].push(events[name]);
				}
			}
		}
	}

	public callEvent(name: string, data: any) {
		this._window.postMessage(Popup.encodeRequest(name, data), '*');
	}

	private recieveEvent(data: string) {
		var str = JSON.decode(data);
	}

	private fireEvent(name: string, data: any) {
		if (!this._events[name]) {
			for (var i = 0, l = this._events[name].length; i < l; ++i) {
				if (this._events.hasOwnProperty(name)) 
				{
					this._events[name][i].call(null, data);
				}
			}
		}
	}

	public removeEvents(name: string) {
		if (this._events[name]) {
			this._events[name].length = 0;
		}
	}

	public removeEvent(name: string, fn: Function): bool {
		if (this._events[name]) {
			for (var i = 0, l = this._events[name].length; i < l; ++i) {
				if (this._events[name][i] === fn) {
					this._events[name].splice(i, 1);
					return true;
				}

			}
		}

		return false;
	}

	public open(): void {
		if (this._window !== null) {
			clearInterval(this._callbackInterval);
		}

		var params = [],
			value = '';

		for (var name in this._options) {
			if (this._options.hasOwnProperty(name)) {
				value = this._options[name];

				if (name == 'x' || name == 'y' || name == 'name') {
					return;
				}

				if (name == 'width' || name == 'height') {
					value = parseInt(value) + 'px';
				}

				params.push(name + '=' + value);
			}
		}

		this._window = window.open(this.url, this._options.name, params.join(','));
		this.moveTo(this.get('x'), this.get('y'));

		if (this._postDataBuffer.length > 0) {
			
			this._postDataBuffer.forEach((value: any, key: number) => { 
				// this.postData(value);
			});
			this._postDataBuffer.length = 0;
		}
	}

	moveTo(x: number = null, y: number = null) {

		if (typeof (x) == 'string') {
			switch (x) {
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

		if (typeof (y) == 'string') {
			switch (y) {
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

		if (this._window) {
			this._window.moveTo(parseInt(x), parseInt(y));
		}
	}

	close() {
		if (this._window === null) {
			return; // popup never opened or already closed
		}

		this._window.close();
		this._window = null;
	}

	/********************
	 * Static
	 */
	
	static close() {
		window.close();
	}

	public static encodeRequest(name: string, data: any): string {
		return JSON.encode(arguments);
	}

	public static decodeRequest(data: string) {
		return JSON.decode(data);
	}

	private static _events: Object = {};

	public static addEvent(name: string, fn: Function) {
		if (!this._events[name]) {
			this._events[name] = new Array();
		}

		this._events[name].push(fn);
	}

	public static addEvents(events: Object) {
		for (var name in events) {
			if (events.hasOwnProperty(name)) {
				if (!this._events[name]) {
					this._events[name] = new Array();
					this._events[name].push(events[name]);
				}
			}
		}
	}

	public static fireEvent(name: string, data: any) {
		if (this._events[name]) {
			for (var i = 0, l = this._events[name].length; i < l; ++i) {
				this._events[name][i].call(null, data);
			}
		}
	}

	public static removeEvents(name: string) {
		if (this._events[name]) {
			this._events[name].length = 0;
		}

		JSON.
	}

	public static removeEvent(name: string, fn: Function): bool {
		if (this._events[name]) {
			for (var i = 0, l = this._events[name].length; i < l; ++i) {
				if (this._events[name][i] === fn) {
					this._events[name].splice(i, 1);
					return true;
				}

			}
		}

		return false;
	}
}


interface PopupOptions {
	name: string;		// if name is null / a unique name is generated
	status: bool;		// The status bar at the bottom of the window.
	toolbar: bool;		// The standard browser toolbar, with buttons such as Back and Forward.
	location: bool;		// 1 The Location entry field where you enter the URL.
	menubar: bool;		// The menu bar of the window
	directories: bool;	// The standard browser directory buttons, such as What's New and What's Cool
	resizable: bool;	// Allow/Disallow the user to resize the window.
	scrollbars: bool;	// Enable the scrollbars if the document is bigger than the window
	height: number;		// Specifies the height of the window in pixels. (example: height='350')
	width: number;		// Specifies the width of the window in pixels.
	x: any;				// position of popup relative to screen/window
	y: any;				// position of popup relative to screen/window
}
