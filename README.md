Popup
===========

With Popup you can create, manipulate and communicate between its opener and the object it self.

![Screenshot](https://github.com/mientjan/Popup/raw/master/screenshot.png)

a working example is provided in Example

Example
----------
	// create new instance for a popup. 
	var popupWindow = new Popup('OAuth2.php', {
		'width':300,
		'height':150,
		'x':'center', 
		'y':'center' 
	});

	// create a listener for 'success'.
	popupWindow.addEventListener('success', function(response){
		alert('callback is called and this response is given:' + response ');
	});

	// popup is opened.
	popupWindow.open();
	
	// popup is opened, in the popup you can send messages back too the one that has opened de popup.
	Popup.dispatchEvent('success', {'message':'The Popup has opened'});
	
	// this can be done vice versa. So you can send messages from the main window to the popup. And from the popup to 
	// the main window. This is also possible when the main window and the popup are on different domains.


Available methods
-----------------

	/**
	 *	Getters
	 */

	var windowObject = authPopup.getWindow();
	authPopup.get('status'); // The status bar at the bottom of the window.
	authPopup.get('toolbar'); // The standard browser toolbar, with buttons such as Back and Forward.
	authPopup.get('location'); // 1 The Location entry field where you enter the URL.
	authPopup.get('menubar'); // The menu bar of the window
	authPopup.get('directories'); // The standard browser directory buttons, such as What's New and What's Cool
	authPopup.get('resizable'); // Allow/Disallow the user to resize the window.
	authPopup.get('scrollbars'); // Enable the scrollbars if the document is bigger than the window
	authPopup.get('height'); // Specifies the height of the window in pixels. (example: height='350')
	authPopup.get('width'); // Specifies the width of the window in pixels.
	authPopup.get('x'); // position of popup relative to screen/window
	authPopup.get('y'); // position of popup relative to screen/window
	
	/**
	 * 	Setters
	 * 	You can  only set these properties before the popup is popened.
	 **/
	authPopup.set('status', true ); // The status bar at the bottom of the window.
	authPopup.set('toolbar', true ); // The standard browser toolbar, with buttons such as Back and Forward.
	authPopup.set('location', true ); // 1 The Location entry field where you enter the URL.
	authPopup.set('menubar', true ); // The menu bar of the window
	authPopup.set('directories', true ); // The standard browser directory buttons, such as What's New and What's Cool
	authPopup.set('resizable', true ); // Allow/Disallow the user to resize the window.
	authPopup.set('scrollbars', true ); // Enable the scrollbars if the document is bigger than the window
	authPopup.set('height', 150 ); // Specifies the height of the window in pixels. (example: height='350')
	authPopup.set('width', 300 ); // Specifies the width of the window in pixels.
	
	// Except for 

	// position of popup relative to screen/window
	authPopup.set('x', 'center' ); 
	authPopup.set('x', 'left' ); 
	authPopup.set('x', 'right' );
	
	// position of popup relative to screen/window
	authPopup.set('y', 'top' ); 
	authPopup.set('y', 'center' ); 
	authPopup.set('y', 'bottom' ); 
