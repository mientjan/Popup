Popup
===========

Popup is a easy way to controll your popup's. With popup you can you can position your popup communicate easely between your popup opener and popup. 

a working example is provided in Example/*

How to Use
----------

	var authPopup = new Popup('OAuth2.php', {
		'width':300,
		'height':150,
		'x':'center', 
		'y':'center' 
	});

	authPopup.addCallback(function(response){
		alert('callback is called and this response is given:' + response ');
	});

	authPopup.open();

so now you want to return data to the original opener of the popup.

the only thing you have to do is load Popup.js and call the function 

	Popup.fireCallback({'data':'i want to return'});

and when you want to close the popup you call 

	Popup.close(); 

in the opened popup.

do not call 

	window.close(); 

but call 

	Popup.close(); 

this is because of browser and security issues relating to passing data 
between the popup and the opener of the popup.

Available methods
-----------------

    var authPopup = new Popup('OAuth2.php', {
        'width':300,
        'height':150,
        'x':'center', 
        'y':'center' 
    });

    authPopup.addCallback(function(response){
        alert('callback is called and this response is given:' + response ');
    });

    authPopup.open();
    authPopup.close();

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


Set
---

You can only set data before you opened a popup.

	authPopup.set('status', true ); // The status bar at the bottom of the window.
	authPopup.set('toolbar', true ); // The standard browser toolbar, with buttons such as Back and Forward.
	authPopup.set('location', true ); // 1 The Location entry field where you enter the URL.
	authPopup.set('menubar', true ); // The menu bar of the window
	authPopup.set('directories', true ); // The standard browser directory buttons, such as What's New and What's Cool
	authPopup.set('resizable', true ); // Allow/Disallow the user to resize the window.
	authPopup.set('scrollbars', true ); // Enable the scrollbars if the document is bigger than the window
	authPopup.set('height', 150 ); // Specifies the height of the window in pixels. (example: height='350')
	authPopup.set('width', 300 ); // Specifies the width of the window in pixels.


Except for 
----------

	authPopup.set('x', 'center' ); // position of popup relative to screen/window
	authPopup.set('y', 'top' ); // position of popup relative to screen/window