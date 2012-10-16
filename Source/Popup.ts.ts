declare interface String {
	uniqueID(): string;
}

declare function parseInt(v: any);

declare interface Object {
	getLength(data:Object): number;
	keys(data:Object): Array;
	values(data:Object): Array;
}

declare interface Function {
	periodical(data:Object): number;
	keys(data:Object): Array;
	values(data:Object): Array;
}


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


var UID = Date.now();
function uniqueID():string {
	return (++UID).toString(UID);
}

class EventDispatcher {
	private _events: Object = {};

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

	public removeEvent(name: string, fn:Function):bool {
		if (this._events[name]) {
			for (var i = 0, l = this._events[name].length; i < l; ++i) {
				if ( this._events[name][i] === fn ) {
					this._events[name].splice(i, 1);
					return true;
				}
				
			}
		}

		return false;
	}
}

class Popup extends EventDispatcher {

	public reference: number = -1;
	private callbackInterval: number = -1;
	private window: Window = null;
	private uid;
	private options:PopupOptions = null;

	constructor (public url: string, public options: PopupOptions){ 
		super();
	};

	set(k:string,v:any):Popup
	{
		if( typeof(this.options[k]) !== 'undefined' ){
			this.options[k] = v;

			if( k === 'x' || k === 'y'){
				// this.moveTo();
			}
		}
			
		return this;
	}

	get(k:string):any
	{
		if( typeof(this.options[k]) !== 'undefined' ){
			return this.options[k];
		}

		return false;
	}

	open():void
	{
		if( this.window !== null ){
			clearInterval( this.callbackInterval );
		}

		var params = [],
			value = '';

		for (var name in this.options) {
			if (this.options.hasOwnProperty(name))
			{
				value = this.options[name];

				if(name=='x' || name=='y' || name=='name'){
					return;
				}

				if( name == 'width' || name == 'height' ){
					value = parseInt(value) + 'px';	
				}

				params.push(name + '=' + value);
			}
		}

		this.window = window.open(this.url, this.options.name, params.join(',') );
		// this._moveTo();
			
		// start callback checker
		//this.eventCheckingInterval = this._checkFiredEvents.periodical(200, this);
	}

	moveTo(x:number = null,y:number = null){

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

		this.set('x', parseInt(x));
		this.set('y', parseInt(y));

		if (this.window) {
			this.window.moveTo(this.get('x') , this.get('y'));
		}
	}

	close(){
		if( this.window === null ){
			return; // popup never opened or already closed
		}

		this.window.close();	
		Popup.remove(this);
		this.window = null;
	}

	static count: number = 0;
	static reference: number[] = [];
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

	static fireEvent( name:string, data:any = null )
	{
		if(!this.events[name])
		{
			this.events[name] = [];
		}
		
		this._events[name].push(data);
	}

	static hasEvents(){
		for (var name in this._events) {
			if (this._events.hasOwnProperty(name)) {
				if (this._events[name].length > 0) {
					return true;
				}
			}
		}
	}

	static close() {
		Popup.fireEvent('closePopupWindow');
	}
}


class PopupOptions {

	public name: string = uniqueID();			// if name is null / a unique name is generated
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
