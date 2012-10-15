class Events {
	private _events: Object;

	public addEvent(name: string, fn: Function) {
		if (!this._events[name]) {
			this._events[name] = new Array();
		}

		this._events[name].push(fn);
	}

	public fireEvent(name: string, data:any) {
		if (this._events[name]) {
			for (var i = 0, l = this._events[name].length; i < l; ++i) {
				this._events[name][i].call(null, data);
			}
		}
	}

	public removeEvents(name: string) {
		if (this._events[name]) {
			this._events[name].length = 0;
		}
	}
}

/**
 * From Mootools
 */
var UID = Date.now();
String.prototype.uniqueID = function(){
	return (UID++).toString(36);
};

(function (Object) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	Object.prototype.keys = function(object) {
		var keys = [];
		for (var key in object) {
			if (hasOwnProperty.call(object, key)) keys.push(key);
		}
		return keys;
	} ,

	Object.prototype.values = function(object) {
		var values = [];
		for (var key in object) {
			if (hasOwnProperty.call(object, key)) values.push(object[key]);
		}
		return values;
	}

	Object.prototype.getLength = function(object) {
		return Object.keys(object).length;
	}

})(Object);

class Popup extends Events {

	public reference: number = -1;

	constructor (public url: string, public options: PopupOptions){ 
		super();

		if (this.options.name == '') {
			this.options.name = String.uniqueID();
		}
	};

	static count: number = 0;
	static reference: Array = [];
	static events: Object = {};
	static closeInterval: number = 0;

	static add (popup:Popup){
		popup.reference = Popup.count;
		this.reference[Popup.count] = popup;
		++Popup.count;
	}
	
	static remove (popup:Popup){
		delete (Popup.reference[popup.reference]);
	}

	static fireEvent( name:string, data:any )
	{
		if(!this.events[name])
		{
			this.events[name] = [];
		}
		
		this._events[name].push(data);
	}

	static hasEvents(){
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

	static close(){
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
}


class PopupOptions {

	public name: string = '';			// if name is null / a unique name is generated
	public status: bool = false;		// The status bar at the bottom of the window.
	public toolbar: bool = false;		// The standard browser toolbar, with buttons such as Back and Forward.
	public location: bool = false;		// 1 The Location entry field where you enter the URL.
	public menubar: bool = false;		// The menu bar of the window
	public directories: bool = false;	// The standard browser directory buttons, such as What's New and What's Cool
	public resizable: bool = false;		// Allow/Disallow the user to resize the window.
	public scrollbars: bool = false;	// Enable the scrollbars if the document is bigger than the window
	public height: number = 500;		// Specifies the height of the window in pixels. (example: height='350')
	public width: number = 500;			// Specifies the width of the window in pixels.

	private x: any;					// position of popup relative to screen/window
	private y: any;					// position of popup relative to screen/window
}
