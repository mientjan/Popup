/*
---
name: Popup

version: 0.1.3

description: A easy way to create manipulate and pass data through your popup's this is the stripped version, and does not need a library/framework to work.

license: 
  - MIT-style

authors: 
  - Mient-jan Stelling <mientjan.stelling@gmail.com


provides: 
  - Popup
...
*/

var Popup = function(url, options){
	this.url = url;
	
	if(typeof options !== 'undefined'){
		for (var key in options){
			if (options.hasOwnProperty(key)){
				this.options[key] = options[key];
			}
		}		
	}

	this.callback = [];

	this.reference = 'n'+Popup._referenceCount;
	Popup._referenceCount++;

	Popup._reference[this.reference] = this;
};

Popup.prototype.options = {
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

};
	
Popup.prototype.window = null;
Popup.prototype.url = null;
Popup.prototype.callback = null;
Popup.prototype.callbackInterval = null;
Popup.prototype.window = null;
Popup.prototype.reference = 0;
	
Popup.prototype.set = function(k,v){
	if( typeof(this.options[k]) !== 'undefined' ){
		this.options[k] = v;

		if( k === 'x' || k === 'y'){
			this._moveTo();
		}
	}
};

Popup.prototype.get = function(k){
	if( typeof(this.options[k]) !== 'undefined' ){
		return this.options[k];
	}

	return false;
};
	
Popup.prototype.open = function(){
	if( this.window !== null ){
		clearInterval( this.callbackInterval );

		// return; // window already opened
	}
		
	var params = [];
	for (var key in this.options){
		if(key!='x' && key!='y'){
			if (this.options.hasOwnProperty(key)){

				var value = this.options[key];

				if( key == 'width' || key == 'height' ){
					value = parseInt(value) + 'px';	
				}

				params.push( key + '=' + value );
			}
		}
	}

	this.window = window.open(this.url, 'empty', params.join(',') );
	this._moveTo();
	
	// start callback checker
	this.callbackInterval = setInterval(this.callbackIntervalFunction, 200, this);
};

Popup.prototype._moveTo = function(){
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
};
	
Popup.prototype.close = function(){
	if( this.window === null ){
		return; // popup never opened or already closed
	}

	this.window.close();
	delete Popup._reference[this.reference];
	Popup._referenceCount--;

};
	
Popup.prototype.callbackIntervalFunction = function(scope){
		try { // try catch inplace because of popup being able to go crossdomain.
			if( scope.window.Popup._callback.length > 0 ){
				
				scope.callback.forEach(function(fn, i){
					this.window.Popup._callback.forEach( function(data, i){
						fn.call(fn, data);
					}, scope );
				}, scope );

				scope.window.Popup._callback.length = 0;
			}
		} catch( err ){ }
	};
	
Popup.prototype.addCallback = function(fn){
	this.callback.push(fn);
};

Popup.prototype.getWindow = function(){
	return this.window;
};

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
			this._closeInterval = this.close.periodical(50, this);
		}
		
	}
	
}

/*
if( !Array.prototype.forEach )
{
	Array.prototype.forEach = function(fn,scope){
		for(var i = 0, len = this.length;i<len;i++){
			fn.call(scope, this[i], i, this);
		}
	}
}*/

// using this example from mozilla instead.


// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if ( !Array.prototype.forEach ) {

  Array.prototype.forEach = function( callback, thisArg ) {

    var T, k;

    if ( this == null ) {
      throw new TypeError( " this is null or not defined" );
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ( {}.toString.call(callback) != "[object Function]" ) {
      throw new TypeError( callback + " is not a function" );
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if ( thisArg ) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while( k < len ) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if ( k in O ) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call( T, kValue, k, O );
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}