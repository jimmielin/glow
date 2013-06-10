/**
 * Glowstone
 * A modern, web-based and oriented, extensible Operating System
 *
 * Developed by Jimmie Lin <jimmie.lin@gmail.com> (c) 2013-2014
 * Licensed under the MIT License
 *
 * @author        Jimmie Lin <jimmie.lin@gmail.com>
 * @since         2013.7.15
 *
 * File Description: System/Frameworks/CoreFile/Main.js
 * Handles FileSystem related functions. Requires System.RT and Lockdown.
 */

System.Framework.CoreFile = {
	Init: function(callback) {
		
		
		if(typeof callback != "undefined")
			callback();
	},

	Test: function(a, b, c) {
		console.log(arguments);
	}
}